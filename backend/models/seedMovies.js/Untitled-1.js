
require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

const movies = [
  {
    title: 'Inception',
    description: 'A thief enters dreams to plant an idea.',
    genre: 'Sci-Fi, Action',
    language: 'English',
    duration: 148,
    rating: 8.8,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    releaseDate: '2010-07-16'
  },
  {
    title: 'Interstellar',
    description: 'Explorers search for a new home for humanity.',
    genre: 'Sci-Fi, Adventure, Drama',
    language: 'English',
    duration: 169,
    rating: 8.7,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2NS00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg',
    releaseDate: '2014-11-07'
  },
  {
    title: 'The Dark Knight',
    description: 'Batman faces the Joker in Gotham City.',
    genre: 'Action, Crime, Drama',
    language: 'English',
    duration: 152,
    rating: 9.0,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNzAyMTk2Mw@@._V1_.jpg',
    releaseDate: '2008-07-18'
  },
  {
    title: 'Avatar: The Way of Water',
    description: 'Jake Sully protects his family on Pandora.',
    genre: 'Sci-Fi, Action, Adventure',
    language: 'English',
    duration: 192,
    rating: 7.6,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFlNzAtNTVhNzM1YjI1NzMxXkEyXkFqcGc@._V1_.jpg',
    releaseDate: '2022-12-16'
  },
  {
    title: 'Spider-Man: Into the Spider-Verse',
    description: 'Miles Morales joins Spider-Heroes from other dimensions.',
    genre: 'Animation, Action, Adventure',
    language: 'English',
    duration: 117,
    rating: 8.4,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjMwNDkxODM0MDAw._V1_.jpg',
    releaseDate: '2018-12-14'
  },
  {
    title: 'Oppenheimer',
    description: 'The story of scientist J. Robert Oppenheimer.',
    genre: 'Biography, Drama, History',
    language: 'English',
    duration: 180,
    rating: 8.9,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjI5NTY1MjVmYTQ4XkEyXkFqcGc@._V1_.jpg',
    releaseDate: '2023-07-21'
  }
];

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (await Movie.countDocuments() > 0) {
      console.log('Movies already exist. No changes made.');
      return;
    }

    const inserted = await Movie.insertMany(movies);
    console.log(`Inserted ${inserted.length} movies successfully.`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
