// seed.js - Database seeder script for IMovies
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import Mongoose Models
const User = require('./models/User');
const Movie = require('./models/Movie');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');

// Helper to get formatted date string (YYYY-MM-DD) for N days in the future
const getFutureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const seedData = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 2. Clear existing collections to ensure a fresh, clean state
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Showtime.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing database records.');

    // 3. Create Users
    // Passwords will be automatically hashed by User model pre-save hook
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@imovies.com',
      password: 'admin123',
      role: 'admin',
    });

    const regularUser = await User.create({
      name: 'John Doe',
      email: 'user@imovies.com',
      password: 'user123',
      role: 'user',
    });

    console.log('Users seeded: 1 Admin, 1 Regular User');

    // 4. Create 6 Sample Movies
    const sampleMovies = [
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        genre: 'Sci-Fi, Action',
        language: 'English',
        duration: 148,
        rating: 8.8,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
        releaseDate: '2010-07-16',
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
        genre: 'Sci-Fi, Adventure, Drama',
        language: 'English',
        duration: 169,
        rating: 8.7,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg',
        releaseDate: '2014-11-07',
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: 'Action, Crime, Drama',
        language: 'English',
        duration: 152,
        rating: 9.0,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
        releaseDate: '2008-07-18',
      },
      {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
        genre: 'Sci-Fi, Action, Adventure',
        language: 'English',
        duration: 192,
        rating: 7.6,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGc@._V1_.jpg',
        releaseDate: '2022-12-16',
      },
      {
        title: 'Spider-Man: Into the Spider-Verse',
        description: 'Teen Miles Morales becomes the new Spider-Man and joins other Spider-Heroes from various dimensions to stop a threat to all realities.',
        genre: 'Animation, Action, Adventure',
        language: 'English',
        duration: 117,
        rating: 8.4,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjMwNDkxMTgzOF5BMl5BanBnXkFtZTgwNTkwNTQ3NjM@._V1_.jpg',
        releaseDate: '2018-12-14',
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        genre: 'Biography, Drama, History',
        language: 'English',
        duration: 180,
        rating: 8.9,
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_.jpg',
        releaseDate: '2023-07-21',
      },
    ];

    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`Movies seeded: ${createdMovies.length} movies inserted`);

    // 5. Create 2-3 Showtimes per Movie across the next 7 days
    const theaters = ['PVR Cinemas - Screen 1', 'INOX Luxe - Audi 2', 'Cinepolis - IMAX 3D'];
    const timeSlots = ['10:30 AM', '02:15 PM', '06:45 PM', '09:30 PM'];
    const prices = [250, 300, 350, 400];

    const showtimesToInsert = [];

    createdMovies.forEach((movie, movieIndex) => {
      // Create showtimes across several upcoming days (today, +1 day, +2 days, +3 days)
      for (let dayOffset = 0; dayOffset <= 6; dayOffset += 2) {
        const dateStr = getFutureDate(dayOffset);
        
        // Showtime 1 for this day
        showtimesToInsert.push({
          movie: movie._id,
          theater: theaters[movieIndex % theaters.length],
          date: dateStr,
          time: timeSlots[dayOffset % timeSlots.length],
          price: prices[movieIndex % prices.length],
          totalSeats: 40,
          bookedSeats: movieIndex === 0 && dayOffset === 0 ? ['A1', 'A2'] : [], // Seed 2 booked seats on 1st movie for demo
        });

        // Showtime 2 for this day
        showtimesToInsert.push({
          movie: movie._id,
          theater: theaters[(movieIndex + 1) % theaters.length],
          date: dateStr,
          time: timeSlots[(dayOffset + 2) % timeSlots.length],
          price: prices[(movieIndex + 1) % prices.length],
          totalSeats: 40,
          bookedSeats: [],
        });
      }
    });

    const createdShowtimes = await Showtime.insertMany(showtimesToInsert);
    console.log(`Showtimes seeded: ${createdShowtimes.length} showtimes inserted`);

    // 6. Create 1 sample booking for the regular test user
    const firstShowtime = createdShowtimes[0];
    await Booking.create({
      user: regularUser._id,
      showtime: firstShowtime._id,
      seats: ['A1', 'A2'],
      totalAmount: firstShowtime.price * 2,
      status: 'confirmed',
    });
    console.log('Sample booking created for demo user.');

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Admin login: admin@imovies.com / admin123');
    console.log('User login:  user@imovies.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
