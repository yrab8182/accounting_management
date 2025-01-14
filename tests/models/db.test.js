const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectToDatabase, disconnectFromDatabase } = require('../../models/db');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await connectToDatabase();
});

afterAll(async () => {
    await disconnectFromDatabase();
    await mongoServer.stop();
});

test('should connect to the database', async () => {
    const state = mongoose.connection.readyState;
    expect(state).toBe(1); // 1 indicates connected
});

test('should handle connection error', async () => {
    process.env.MONGODB_URI = 'invalid-uri';
    await expect(connectToDatabase()).rejects.toThrow();
});

test('should disconnect from the database', async () => {
    await disconnectFromDatabase();
    const state = mongoose.connection.readyState;
    expect(state).toBe(0); // 0 indicates disconnected
});
