const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server')
const Receipt = require("../../models/receipt");
const Client = require("../../models/client");

let mongoServer;
let client;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
    const clientData = {
        name: "test",
        email: "test@gmail.com",
        phone: "0555556666",
        address: "Hakison 15"
    }
    client = await Client.createClient(clientData)
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})
describe('Receipt Create Function', () => {
    it('should create a receipt successfully', async () => {
        const receiptData = {
            client: client._id,
            date: new Date(),
            amount: 100,
            paymentMethod: 'cash',
            details: 'Test receipt'
        }
        const receipt = await Receipt.createReceipt(receiptData)
        expect(receipt).toHaveProperty('receiptNumber');
        expect(receipt.client).toBe(receiptData.client);
        expect(receipt.amount).toBe(receiptData.amount);
    })

    it('should successfully create a receipt when optional fields are not sent', async () => {
        const receiptData = {
            client: client._id,
            date: new Date(),
            amount: 100,
            paymentMethod: 'cash'
        }
        const receipt = await Receipt.createReceipt(receiptData)
        expect(receipt).toHaveProperty('receiptNumber');
        expect(receipt.client).toBe(receiptData.client);
        expect(receipt.amount).toBe(receiptData.amount);
    })

    it(`Should create today's date when date is not sent`, async () => {
        const receiptData = {
            client: client._id,
            amount: 100,
            paymentMethod: 'cash'
        }
        const receipt = await Receipt.createReceipt(receiptData)
        expect(receipt).toHaveProperty('date');
        expect(receipt.client).toBe(receiptData.client);
        expect(receipt.amount).toBe(receiptData.amount);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const receiptDate = new Date(receipt.date);
        receiptDate.setHours(0, 0, 0, 0); 
        expect(receiptDate).toEqual(today);
    })


    describe(`Errors`, () => {
        it('should throw an error if required fields are missing', async () => {
            await expect(Receipt.createReceipt({ client: client._id, amount: 1 })).rejects.toThrow();
            await expect(Receipt.createReceipt({ amount: 1, paymentMethod: 'cash' })).rejects.toThrow();
            await expect(Receipt.createReceipt({ client: client._id, paymentMethod: 'credit' })).rejects.toThrow();
        });

        it('should throw an error if the client is not in the collection', async () => {
            const receiptData = {
                client: '1234',
                date: new Date(),
                amount: 1200,
                paymentMethod: 'ash'
            };

            await expect(Receipt.createReceipt(receiptData)).rejects.toThrow();
        })

        it('should throw an error if paymentMethod is not a valid enum value', async () => {
            const receiptData = {
                client: client._id,
                date: new Date(),
                amount: 1200,
                paymentMethod: 'ash'
            };

            await expect(Receipt.createReceipt(receiptData)).rejects.toThrow();
        })

        it('should throw an error if amount is negative', async () => {
            const receiptData = {
                client: client._id,
                date: new Date(),
                amount: -100,
                paymentMethod: 'cash'
            };

            await expect(Receipt.createReceipt(receiptData)).rejects.toThrow();
        })

        it('should throw an error when `date` is an invalid date.', async () => {
            const receiptData = {
                client: client._id,
                date: '30/30/30',
                amount: 1200,
                paymentMethod: 'cash'
            };

            await expect(Receipt.createReceipt(receiptData)).rejects.toThrow();
            await expect(Receipt.createReceipt(receiptData.date = { d: 2 })).rejects.toThrow();
        })
    })

    describe(`Sequence Test -> ensureSequenceExists function`, () => {
        it('should create receipts with sequential receipt numbers', async () => {
            const clientData = {
                name: "test2",
                email: "test2@gmail.com",
                phone: "0555556667",
                address: "Hakison 15"
            }
            const client = await Client.createClient(clientData)
            const receiptData1 = {
                client: client._id,
                date: new Date(),
                amount: 100,
                paymentMethod: 'cash',
                details: 'First receipt'
            };

            const receiptData2 = {
                client: client._id,
                date: new Date(),
                amount: 200,
                paymentMethod: 'credit',
                details: 'Second receipt'
            };

            const receipt1 = await Receipt.createReceipt(receiptData1);
            const receipt2 = await Receipt.createReceipt(receiptData2);

            expect(receipt1.receiptNumber + 1).toBe(receipt2.receiptNumber);
        });

        it('should change the value of receiptNumber when receiptNumber is sent', async () => {
            const receiptData = {
                client: client._id,
                date: new Date(),
                amount: 200,
                paymentMethod: 'credit',
                details: 'Second receipt',
                receiptNumber: 1
            };

            const receipt = await Receipt.createReceipt(receiptData)
            expect(receiptData.receiptNumber).not.toBe(receipt.receiptNumber)

        })
    })
})