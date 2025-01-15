const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { expensesByMonth, expensesByYear, createExpenses, expensesBetweenDateRange } = require('../../services/expenses');
const Expenses = require('../../models/expenses');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Expenses Service Tests', () => {
    beforeEach(async () => {
        await Expenses.deleteMany({}); // ניקוי המסד לפני כל טסט
    });

    describe(`createExpenses function`, () => {
        it('should create an expense', async () => {
            const expensesData = {
                date: new Date('2023-01-15'),
                amount: 100,
                supplier: "jest",
                paymentMethod: 'bank_transfer'
            };
            const newExpense = await createExpenses(expensesData);

            expect(newExpense).toHaveProperty('_id');
            expect(newExpense.amount).toBe(100);
        });

        it('should throw an error when creating expenses fails', async () => {
            const invalidData = {};

            await expect(createExpenses(invalidData)).rejects.toThrow("Error create expenses");
        });
    })

    describe('expensesByMonth function', () => {
        it('should fetch expenses by month', async () => {
            await createExpenses({ date: new Date('2023-01-15'), amount: 100, supplier: "a", paymentMethod: "cash" });
            await createExpenses({ date: new Date('2023-01-20'), amount: 200, supplier: "b", paymentMethod: "credit" });
            await createExpenses({ date: new Date('2023-02-15'), amount: 150, supplier: "c", paymentMethod: "cash" });

            const expenses = await expensesByMonth(1); // חודש ינואר

            expect(expenses.length).toBe(2);
            const amounts = expenses.map(expense => expense.amount);
            expect(amounts).toEqual(expect.arrayContaining([100, 200]));
        });

        it('should return null when no result', async () => {
            const expenses = await expensesByMonth(3);
            expect(expenses).toBeNull()
        })

        it('should throw an error if there is a database error', async () => {
            await mongoose.disconnect(); // מנתק את החיבור למסד הנתונים
            await expect(expensesByMonth(3)).rejects.toThrow('Error fetching expenses by month');
            await mongoose.connect(mongoServer.getUri()); // מחבר מחדש למסד הנתונים
        });
    });

    describe(`expensesByYear function`, () => {
        it('should fetch expenses by year', async () => {
            await createExpenses({ date: new Date('2023-01-15'), amount: 100, supplier: "a", paymentMethod: "cash" });
            await createExpenses({ date: new Date('2023-02-20'), amount: 200, supplier: "b", paymentMethod: "credit" });
            await createExpenses({ date: new Date('2022-01-15'), amount: 150, supplier: "c", paymentMethod: "cash" });

            const expenses = await expensesByYear(2023); // שנה 2023

            expect(expenses.length).toBe(2);
            const amounts = expenses.map(expense => expense.amount);
            expect(amounts).toEqual(expect.arrayContaining([100, 200]));
        });


        it('should return null when no result', async () => {
            const expenses = await expensesByYear(2000);
            expect(expenses).toBeNull()
        })

        it('should throw an error if there is a database error', async () => {
            await mongoose.disconnect(); // מנתק את החיבור למסד הנתונים
            await expect(expensesByYear(2023)).rejects.toThrow('Error fetching expenses by year');
            await mongoose.connect(mongoServer.getUri()); // מחבר מחדש למסד הנתונים
        });
    })

    describe('expensesBetweenDateRange function', () => {
        it('should return the expenses between date range', async()=>{
            await createExpenses({ date: new Date('2025-01-15'), amount: 100, supplier: "a", paymentMethod: "cash" });
            await createExpenses({ date: new Date('2025-01-20'), amount: 200, supplier: "b", paymentMethod: "credit" });
            await createExpenses({ date: new Date('2024-02-15'), amount: 150, supplier: "c", paymentMethod: "cash" });

            const expenses = await expensesBetweenDateRange(new Date('2024-01-30'), new Date('2025-01-16'))

            expect(expenses.length).toBe(2);
            const amounts = expenses.map(expense => expense.amount);
            expect(amounts).toEqual(expect.arrayContaining([150, 100]));
        })

        it('should return null when no result', async () => {
            const expenses = await expensesBetweenDateRange(new Date('2019-01-30'), new Date('2020-01-16'));
            expect(expenses).toBeNull()
        })

        it('should throw an error if there is a database error', async () => {
            await mongoose.disconnect(); // מנתק את החיבור למסד הנתונים
            await expect(expensesBetweenDateRange(new Date('2024-01-30'), new Date('2025-01-16'))).rejects.toThrow("Error fetching expenses between date rang");
            await mongoose.connect(mongoServer.getUri()); // מחבר מחדש למסד הנתונים
        });
    })
});
