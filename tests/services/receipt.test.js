const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createReceipt, receiptsBetweenDateRange, revenuesByClient, revenuesByMonth, revenuesByYear }
    = require('../../services/receipt');
const Receipt = require('../../models/receipt');
const Client = require('../../models/client');

let mongoServer;
let client;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    const clientData = {
        name: "test",
        email: "test@gmail.com",
        phone: "0555556666",
        address: "Hakison 15"
    }
    client = await Client.createClient(clientData)
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Receipt Service Tests', () => {
    beforeEach(async () => {
        await Receipt.deleteMany({}); // ניקוי המסד לפני כל טסט
    });

    describe(`createReceipt function`, () => {
        it('should create receipt', async () => {
            const receiptData = {
                client: client._id,
                amount: 100,
                paymentMethod: 'bank_transfer'
            };
            const newReceipt = await createReceipt(receiptData);

            expect(newReceipt).toHaveProperty('_id');
            expect(newReceipt.amount).toBe(100);
        });

        it('should throw an error when creating receipt fails', async () => {
            const invalidData = {};

            await expect(createReceipt(invalidData)).rejects.toThrow("Error create receipt");
        });
    })

    describe('receiptsBetweenDateRange function', () => {
        it('should return the receipts between date range', async () => {
            await createReceipt({ date: new Date('2025-01-15'), client: client._id, amount: 100, paymentMethod: "cash" });
            await createReceipt({ date: new Date('2025-01-20'), client: client._id, amount: 200, paymentMethod: "credit" });
            await createReceipt({ date: new Date('2024-02-15'), client: client._id, amount: 150, paymentMethod: "cash" });

            const receipts = await receiptsBetweenDateRange(new Date('2024-01-30'), new Date('2025-01-16'))

            expect(receipts.length).toBe(2);
            const amounts = receipts.map(expense => expense.amount);
            expect(amounts).toEqual(expect.arrayContaining([150, 100]));
        })

        it('should return null when no result', async () => {
            const receipt = await receiptsBetweenDateRange(new Date('2019-01-30'), new Date('2020-01-16'));
            expect(receipt).toBeNull()
        })

        it('should throw an error if there is a database error', async () => {
            await mongoose.disconnect(); // מנתק את החיבור למסד הנתונים
            await expect(receiptsBetweenDateRange(new Date('2024-01-30'), new Date('2025-01-16'))).rejects.toThrow("Error fetching receipts between date rang");
            await mongoose.connect(mongoServer.getUri()); // מחבר מחדש למסד הנתונים
        });
    })


    describe('revenuesByMonth function', () => {
        it('should fetch receipts by month', async () => {
            await createReceipt({ date: new Date('2023-01-15'), client: client._id, amount: 100, paymentMethod: "cash" });
            await createReceipt({ date: new Date('2023-01-20'), client: client._id, amount: 200, paymentMethod: "credit" });
            await createReceipt({ date: new Date('2023-02-15'), client: client._id, amount: 150, paymentMethod: "cash" });

            const receipts = await revenuesByMonth(1); // חודש ינואר

            expect(receipts.length).toBe(2);
            const amounts = receipts.map(receipt => receipt.amount);
            expect(amounts).toEqual(expect.arrayContaining([100, 200]));
        });

        it('should return null when no result', async () => {
            const receipts = await revenuesByMonth(3);
            expect(receipts).toBeNull()
        })

        it('should throw an error if there is a database error', async () => {
            await mongoose.disconnect(); // מנתק את החיבור למסד הנתונים
            await expect(revenuesByMonth(3)).rejects.toThrow('Error fetching receipts by month');
            await mongoose.connect(mongoServer.getUri()); // מחבר מחדש למסד הנתונים
        });
    });

    describe(`expensesByYear function`, () => {
        it('should fetch revenues by year', async () => {
            await createReceipt({ date: new Date('2023-01-15'), client: client._id, amount: 100, paymentMethod: "cash" });
            await createReceipt({ date: new Date('2023-02-20'), client: client._id, amount: 200, paymentMethod: "credit" });
            await createReceipt({ date: new Date('2022-01-15'), client: client._id, amount: 150, paymentMethod: "cash" });

            const receipts = await revenuesByYear(2023); // שנה 2023

            expect(receipts.length).toBe(2);
            const amounts = receipts.map(receipt => receipt.amount);
            expect(amounts).toEqual(expect.arrayContaining([100, 200]));
        });

        it('should return null when no result', async () => {
            const receipts = await revenuesByYear(2000);
            expect(receipts).toBeNull()
        })

        it('should throw an error if there is a database error', async () => {
            await mongoose.disconnect(); // מנתק את החיבור למסד הנתונים
            await expect(revenuesByYear(2023)).rejects.toThrow('Error fetching revenues by year');
            await mongoose.connect(mongoServer.getUri()); // מחבר מחדש למסד הנתונים
        });
    })

    describe('revenuesByClient function',()=>{
        it('should return the receipts by client', async()=>{
            const clientData = {
                name: "t",
                email: "test@gmail.com",
                phone: "0555556666",
                address: "Hakison 15"
            }
            const clientTest = await Client.createClient(clientData)

            await createReceipt({ date: new Date('2023-01-15'), client: clientTest._id, amount: 100, paymentMethod: "cash" });
            await createReceipt({ date: new Date('2023-02-20'), client: clientTest._id, amount: 200, paymentMethod: "credit" });
            await createReceipt({ date: new Date('2022-01-15'), client: client._id, amount: 150, paymentMethod: "cash" });

            const receipts = await revenuesByClient(clientTest._id); // שנה 2023

            expect(receipts.length).toBe(2);
            const amounts = receipts.map(receipt => receipt.amount);
            expect(amounts).toEqual(expect.arrayContaining([100, 200]));
        })

        it('should return null when no result', async () => {
            const clientData = {
                name: "a",
                email: "test@gmail.com",
                phone: "0555556666",
                address: "Hakison 15"
            }
            const clientTest = await Client.createClient(clientData)
            const receipts = await revenuesByClient(clientTest._id);
            expect(receipts).toBeNull()
        })

        it('should throw an error if there is a database error', async () => {
            await mongoose.disconnect(); // מנתק את החיבור למסד הנתונים
            await expect(revenuesByClient(client._id)).rejects.toThrow('Error fetching revenue by client');
            await mongoose.connect(mongoServer.getUri()); // מחבר מחדש למסד הנתונים
        });
    })
})