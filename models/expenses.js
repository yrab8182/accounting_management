const mongoose = require('mongoose')

const expensesSchema = new mongoose.Schema({
    date:{type:Date,required: true},
    amount: {type:Number,required: true, min:0},
    supplier: {type: String,required:true},
    paymentMethod: { type: String, enum: ['cash', 'credit', 'bank_transfer'], required: true },
    details:String
});

expensesSchema.statics.createExpenses = async function (expensesData) {
    const expenses = new this(expensesData)
    return await expenses.save()
}



const Expenses = mongoose.model('Expenses', expensesSchema);
module.exports = Expenses;