const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    role: String!
  }

  type GalleryImage {
    url: String!
    public_id: String
  }

  type Listing {
    id: ID!
    title: String!
    description: String
    price: Float!
    category: String!
    custom_category: String
    item_condition: String!
    status: String!
    image_url: String
    gallery_images: [GalleryImage!]
    seller: User!
    createdAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input ListingInput {
    title: String!
    description: String
    price: Float!
    category: String
    custom_category: String
    item_condition: String
  }

  input ListingUpdateInput {
    title: String
    description: String
    price: Float
    category: String
    custom_category: String
    item_condition: String
    status: String
  }

  type Query {
    "Public: browse listings, optionally filtered by category, status, and/or a text search"
    listings(category: String, status: String, search: String): [Listing!]!

    "Public: fetch a single listing by id"
    listing(id: ID!): Listing

    "Protected: the logged-in user's own listings"
    myListings: [Listing!]!

    "Protected: the logged-in user's profile"
    me: User
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, phone: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    "Protected: creates a listing owned by the logged-in user"
    createListing(input: ListingInput!): Listing!

    "Protected: only the listing's owner may update it"
    updateListing(id: ID!, input: ListingUpdateInput!): Listing!

    "Protected: only the listing's owner may delete it"
    deleteListing(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
