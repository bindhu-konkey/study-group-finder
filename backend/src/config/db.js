const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDatabaseIfNeeded } = require('./seed');

let isConnected = false;
let mongodInstance = null;

const connectDB = async () => {
  const configuredUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/study_group_finder';

  // 1. Try to connect to configured MongoDB URI (standalone / Atlas)
  try {
    const conn = await mongoose.connect(configuredUri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host} (${conn.connection.name})`);
    await seedDatabaseIfNeeded();
    return true;
  } catch (err) {
    console.warn(`[MongoDB Notice]: Standalone MongoDB not detected at ${configuredUri} (${err.message}).`);
  }

  // 2. Start embedded real MongoDB database engine
  try {
    console.log('[MongoDB Engine]: Starting persistent embedded MongoDB engine...');
    const dbPath = path.join(__dirname, '../../../.mongodb_data');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'study_group_finder',
        dbPath: dbPath,
      },
    });

    const uri = mongodInstance.getUri();
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log(`[MongoDB Connected]: Embedded engine online at ${uri}`);
    await seedDatabaseIfNeeded();
    return true;
  } catch (err) {
    // Fallback without dbPath if filesystem locking occurs
    try {
      mongodInstance = await MongoMemoryServer.create({
        instance: { dbName: 'study_group_finder' },
      });
      const uri = mongodInstance.getUri();
      const conn = await mongoose.connect(uri);
      isConnected = true;
      console.log(`[MongoDB Connected]: Embedded in-memory MongoDB online at ${uri}`);
      await seedDatabaseIfNeeded();
      return true;
    } catch (fallbackErr) {
      console.error('[MongoDB Error]: Could not establish MongoDB connection:', fallbackErr.message);
      isConnected = false;
      return false;
    }
  }
};

const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = { connectDB, isDbConnected };
