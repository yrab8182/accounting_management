const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');
const Expenses = require("../../models/expenses");

let mongoServer;

beforeAll(async ()=>{
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
})

afterAll(async ()=>{
    await mongoose.disconnect()
    await mongoServer.stop()
})

describe(`Expenses Create Function`, ()=>{
    it('should create a expenses successfully',async ()=>{
        const expensesData = {
            date: new Date(),
            amount: 1200,
            supplier: "test",
            paymentMethod: 'credit',
            details: 'Test expenses'
        }
        const expenses = await Expenses.createExpenses(expensesData)
        expect(expenses.supplier).toBe(expensesData.supplier);
        expect(expenses.amount).toBe(expensesData.amount);
    })

    it('should throw an error if required fields are missing', async () => {
        const expensesData = {
            date: new Date(),
            amount: 1200,
            paymentMethod: 'cash'
        };

        await expect(Expenses.createExpenses(expensesData)).rejects.toThrow();
    });
})