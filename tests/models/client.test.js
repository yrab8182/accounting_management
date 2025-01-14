const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');
const Client = require("../../models/client");

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

describe(`Client Create Function`, () => {
    it('should create a client successfully', async () => {
        const clientData = {
            name: "test",
            email: "test@gmail.com",
            phone: "0555556666",
            address: "Hakison 15"
        }
        const client = await Client.createClient(clientData)
        expect(client.supplier).toBe(clientData.supplier);
        expect(client.amount).toBe(clientData.amount);
    })

    describe(`Errors`, () => {
        it('should throw an error if required fields are missing', async () => {
            await expect(Client.createClient({ name: 'i', email: 'i@gmail.com' })).rejects.toThrow();
            await expect(Client.createClient({ name: 'i', phone: '036161135' })).rejects.toThrow();
            await expect(Client.createClient({ email: 'i@gmail.com', phone: '036161135' })).rejects.toThrow();
        });

        it('should throw an error when no unique name + phone', async () => {
            const clientData = {
                name: "test",
                email: "test2@gmail.com",
                phone: "0555556666",
                address: "Hakison 16"
            };

            await expect(Client.createClient(clientData)).rejects.toThrow();
        });

    })

})