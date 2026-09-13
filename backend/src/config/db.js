const mongoose = require('mongoose');
const { seedDatabaseIfNeeded } = require('./seed');

let isConnected = false;

const connectDB = async () => {
  const configuredUri = process.env.MONGODB_URI;

  if (!configuredUri) {
    console.error('[MongoDB Error]: MONGODB_URI is not configured in .env');
    return false;
  }

  try {
    const conn = await mongoose.connect(configuredUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;

    console.log(
      `[MongoDB Connected]: ${conn.connection.host} (${conn.connection.name})`
    );

    await seedDatabaseIfNeeded();

    return true;
  } catch (err) {
    isConnected = false;

    console.error(
      `[MongoDB Error]: Could not connect to MongoDB: ${err.message}`
    );

    return false;
  }
};

const isDbConnected = () =>
  isConnected && mongoose.connection.readyState === 1;

module.exports = {
  connectDB,
  isDbConnected,
};