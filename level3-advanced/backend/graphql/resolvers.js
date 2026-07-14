const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { User, Listing } = require('../models');
const { Op } = require('sequelize');
const { validateEmailFormat, validatePasswordStrength } = require('../utils/validators');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function requireAuth(context) {
  if (!context.user) {
    throw new AuthenticationError('You must be logged in to do this');
  }
  return context.user;
}

const resolvers = {
  Query: {
    // Public — same eager-loading pattern as the REST API: the seller is
    // fetched in the same query via Sequelize's `include`, avoiding an N+1
    // problem where each listing would otherwise trigger a separate lookup.
    listings: async (_parent, { category, status, search }) => {
      const where = {};
      if (category) where.category = category;
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      return Listing.findAll({
        where,
        include: [{ model: User, as: 'seller' }],
        order: [['createdAt', 'DESC']]
      });
    },

    listing: async (_parent, { id }) => {
      return Listing.findByPk(id, { include: [{ model: User, as: 'seller' }] });
    },

    myListings: async (_parent, _args, context) => {
      const user = requireAuth(context);
      return Listing.findAll({
        where: { seller_id: user.id },
        include: [{ model: User, as: 'seller' }],
        order: [['createdAt', 'DESC']]
      });
    },

    me: async (_parent, _args, context) => {
      const user = requireAuth(context);
      return User.findByPk(user.id);
    }
  },

  Mutation: {
    register: async (_parent, { name, email, password, phone }) => {
      const emailError = validateEmailFormat(email);
      if (emailError) throw new UserInputError(emailError);

      const passwordError = validatePasswordStrength(password);
      if (passwordError) throw new UserInputError(passwordError);

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        throw new UserInputError('That email is already registered');
      }

      const password_hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password_hash, phone });

      return { token: signToken(user), user };
    },

    login: async (_parent, { email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new AuthenticationError('Invalid email or password');

      const matches = await bcrypt.compare(password, user.password_hash);
      if (!matches) throw new AuthenticationError('Invalid email or password');

      return { token: signToken(user), user };
    },

    createListing: async (_parent, { input }, context) => {
      const user = requireAuth(context);

      const listing = await Listing.create({ ...input, seller_id: user.id });
      return Listing.findByPk(listing.id, { include: [{ model: User, as: 'seller' }] });
    },

    updateListing: async (_parent, { id, input }, context) => {
      const user = requireAuth(context);
      const listing = await Listing.findByPk(id);
      if (!listing) throw new UserInputError('Listing not found');

      const isOwner = listing.seller_id === user.id;
      const isAdmin = user.role === 'admin';
      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('You can only edit your own listings');
      }

      await listing.update(input);
      return Listing.findByPk(id, { include: [{ model: User, as: 'seller' }] });
    },

    deleteListing: async (_parent, { id }, context) => {
      const user = requireAuth(context);
      const listing = await Listing.findByPk(id);
      if (!listing) throw new UserInputError('Listing not found');

      const isOwner = listing.seller_id === user.id;
      const isAdmin = user.role === 'admin';
      if (!isOwner && !isAdmin) {
        throw new ForbiddenError('You can only delete your own listings');
      }

      await listing.destroy();
      return true;
    }
  }
};

module.exports = resolvers;
