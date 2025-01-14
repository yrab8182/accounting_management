const mongoose = require('mongoose');
const Sequence = require('./sequence');

const receiptSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    date: { type: Date, default:Date.now },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'credit', 'bank_transfer'], required: true },
    details: String,
    receiptNumber: { type: Number, unique: true, required: true }
});

async function ensureSequenceExists() {
    const sequence = await Sequence.findOne();
    if (!sequence) {
        await Sequence.create({ sequenceValue: 1000 });
    }
}

receiptSchema.statics.createReceipt = async function(receiptData) {

    await ensureSequenceExists(); // ודא שהאוסף קיים

    const sequence = await Sequence.findOneAndUpdate(
        {},
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );

    const receipt = new this({
        ...receiptData,
        receiptNumber: sequence.sequenceValue
    });

    return await receipt.save();
};


const Receipt = mongoose.model('Receipt', receiptSchema);
module.exports = Receipt;
