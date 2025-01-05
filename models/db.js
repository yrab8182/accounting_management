const mongoose = require('mongoose');
require('dotenv').config();


async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (err) {
        throw err;
    }
}

async function disconnectFromDatabase() {
    await mongoose.disconnect();
}

module.exports = { connectToDatabase, disconnectFromDatabase};