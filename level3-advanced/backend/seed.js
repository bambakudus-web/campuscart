// Run with: npm run seed
// Creates a few sample students and listings owned by them, so you can
// see the User <-> Listing relationship working when you test the API.

const bcrypt = require('bcryptjs');
const { sequelize, User, Listing } = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const passwordHash = await bcrypt.hash('password123', 10);

    const [ama] = await User.findOrCreate({
      where: { email: 'ama.serwaa@kstu.edu.gh' },
      defaults: { name: 'Ama Serwaa', password_hash: passwordHash, phone: '0244000111' }
    });

    const [kwame] = await User.findOrCreate({
      where: { email: 'kwame.owusu@kstu.edu.gh' },
      defaults: { name: 'Kwame Owusu', password_hash: passwordHash, phone: '0207000222' }
    });

    await Listing.findOrCreate({
      where: { title: 'Engineering Mathematics Textbook', seller_id: ama.id },
      defaults: {
        description: 'Third edition, minor highlighting on chapter 3',
        price: 45.0,
        category: 'books',
        item_condition: 'used',
        seller_id: ama.id,
        image_url: 'https://res.cloudinary.com/dqvj5wx8s/image/upload/v1784022464/campuscart/f0vetcvmzax4ehmtwojf.jpg',
        image_public_id: 'campuscart/f0vetcvmzax4ehmtwojf'
      }
    });

    await Listing.findOrCreate({
      where: { title: 'HP Laptop Charger', seller_id: kwame.id },
      defaults: {
        description: 'Original charger, barely used',
        price: 60.0,
        category: 'electronics',
        item_condition: 'like_new',
        seller_id: kwame.id,
        image_url: 'https://res.cloudinary.com/dqvj5wx8s/image/upload/v1784022489/campuscart/c7opaff6kfmpnpzssgtk.jpg',
        image_public_id: 'campuscart/c7opaff6kfmpnpzssgtk'
      }
    });

    console.log('✅ Seed complete. Sample login: ama.serwaa@kstu.edu.gh / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
