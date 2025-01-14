const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');
const Expenses = require("../../models/expenses");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})

describe(`Expenses Create Function`, () => {
    it('should create a expenses successfully', async () => {
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

    it('should successfully create an expenses when optional fields are not sent', async () => {
        const expensesData = {
            date: new Date(),
            amount: 1200,
            supplier: "test",
            paymentMethod: 'credit'
        }
        const expenses = await Expenses.createExpenses(expensesData)
        expect(expenses.supplier).toBe(expensesData.supplier);
        expect(expenses.amount).toBe(expensesData.amount);
    })

    it(`should create today's date when date is not sent`, async () => {
        const expensesData = {
            amount: 1200,
            supplier: "test",
            paymentMethod: 'credit',
            details: 'Test expenses'
        }
        const expenses = await Expenses.createExpenses(expensesData)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const expensesDate = new Date(expenses.date)
        expensesDate.setHours(0, 0, 0, 0)
        expect(expensesDate).toEqual(today)
    })

    describe(`Errors`, () => {
        it('should throw an error if required fields are missing', async () => {
            await expect(Expenses.createExpenses({ amount: 100, supplier: 'levi' })).rejects.toThrow();
            await expect(Expenses.createExpenses({ amount: 100, paymentMethod: 'credit' })).rejects.toThrow();
            await expect(Expenses.createExpenses({ supplier: 'levi', paymentMethod: 'cash' })).rejects.toThrow();
        });

        it('should throw an error if paymentMethod is not a valid enum value', async () => {
            const expensesData = {
                date: new Date(),
                amount: 1200,
                supplier: 'ani',
                paymentMethod: 'ash'
            };

            await expect(Expenses.createExpenses(expensesData)).rejects.toThrow();
        })

        it('should throe en error if amount field is negetive', async()=>{
            const expensesData = {
                amount: -100,
                supplier: 'ani',
                paymentMethod: 'ash'
            };

            await expect(Expenses.createExpenses(expensesData)).rejects.toThrow();
        })
    })

})