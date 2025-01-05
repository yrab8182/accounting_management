// models/sequence.js
const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema({
    sequenceValue: { type: Number, default: 1000 }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);
module.exports = Sequence;
