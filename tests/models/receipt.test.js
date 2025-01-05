const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server')
const Receipt = require("../../models/receipt");

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
describe('Receipt Create Function', ()=>{
    it('should create a receipt successfully',async ()=>{
        const receiptData = {
            customer: 'John Doe',
            date: new Date(),
            amount: 100,
            paymentMethod: 'cash',
            details: 'Test receipt'
        }
        const receipt = await Receipt.createReceipt(receiptData)
        expect(receipt).toHaveProperty('receiptNumber');
        expect(receipt.customer).toBe(receiptData.customer);
        expect(receipt.amount).toBe(receiptData.amount);
    })

    it('should throw an error if required fields are missing', async () => {
        const receiptData = {
            date: new Date(),
            amount: 100,
            paymentMethod: 'cash'
        };

        await expect(Receipt.createReceipt(receiptData)).rejects.toThrow();
    });

    describe(`Sequence Test -> ensureSequenceExists function`, ()=>{
        it('should create receipts with sequential receipt numbers', async () => {
            const receiptData1 = {
                customer: 'Customer 1',
                date: new Date(),
                amount: 100,
                paymentMethod: 'cash',
                details: 'First receipt'
            };

            const receiptData2 = {
                customer: 'Customer 2',
                date: new Date(),
                amount: 200,
                paymentMethod: 'credit',
                details: 'Second receipt'
            };

            const receipt1 = await Receipt.createReceipt(receiptData1);
            const receipt2 = await Receipt.createReceipt(receiptData2);

            expect(receipt1.receiptNumber + 1).toBe(receipt2.receiptNumber);
        });
    })
})