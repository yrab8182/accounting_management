const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { createClient, findClient, findClientByNameAndPhone } = require('../../services/client');
const Client = require('../../models/client');

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

describe(`Client Service Tests`, () => {
    describe('createClient function', () => {
        it('should create client', async () => {
            const clientData = {
                name: 'test1',
                email: 'email',
                phone: '036161135'
            };
            const newclient = await createClient(clientData);

            expect(newclient).toHaveProperty('_id');
            expect(newclient.name).toBe('test1');
        })

        it('should throw an error when creating client fails', async () => {
            const invalidData = {};

            await expect(createClient(invalidData)).rejects.toThrow("Error create client");
        });
    })

    describe('findClient function', () => {
        it('should return the client by name', async () => {
            const clientData = {
                name: 'test2',
                email: 'email',
                phone: '036161135'
            };
            const sendClient = await createClient(clientData);
            const backClient = await findClient(sendClient.name)

            expect(sendClient.name).toEqual(backClient.name);
            expect(sendClient.email).toEqual(backClient.email);
            expect(sendClient.phone).toEqual(backClient.phone);
            expect(sendClient._id.toString()).toEqual(backClient._id.toString()); 
        })

        it('should return a message when there is 2 client with the same name', async () => {
            const clientData = {
                name: 'test1',
                email: 'email',
                phone: '036161136'
            };
            const sendClient = await createClient(clientData);
            const backClient = await findClient(sendClient.name)            

            expect(backClient).toEqual("There is more than one client with this name")
        })

        it('should return null when name not found', async () => {
            expect(await findClient('not exist')).toBeNull()
        })

        it('should throw an error if there is a database error', async () => {
            await mongoose.disconnect(); // מנתק את החיבור למסד הנתונים
            await expect(findClient('a')).rejects.toThrow("Error fetching find client");
            await mongoose.connect(mongoServer.getUri()); // מחבר מחדש למסד הנתונים
        });
    })

    describe('findClientByNameAndPhone function', () => {
        it('should return the client by name and phone', async () => {
            const client1 = {
                name: 'client',
                email: 'email',
                phone: '036161135'
            };

            const client2 = {
                name: 'client',
                email: 'email',
                phone: '036161136'
            };
            const sendClient1 = await createClient(client1);
            const sendClient2 = await createClient(client2);
            const backClient1 = await findClientByNameAndPhone(client1.name, client1.phone)
            const backClient2 = await findClientByNameAndPhone(client2.name, client2.phone)

            expect(sendClient1.name).toEqual(backClient1.name);
            expect(sendClient1.email).toEqual(backClient1.email);
            expect(sendClient1.phone).toEqual(backClient1.phone);
            expect(sendClient1._id.toString()).toEqual(backClient1._id.toString()); 

            expect(sendClient2.name).toEqual(backClient2.name);
            expect(sendClient2.email).toEqual(backClient2.email);
            expect(sendClient2.phone).toEqual(backClient2.phone);
            expect(sendClient2._id.toString()).toEqual(backClient2._id.toString()); 
        })

        it('should return null when there is no customer with such name and phone', async () => {
            const clientData = {
                name: 'c',
                email: 'email',
                phone: '036161135'
            };

            await createClient(clientData)

            expect(await findClientByNameAndPhone(clientData.name, '036166666')).toBeNull()
            expect(await findClientByNameAndPhone('not exist', '036161135')).toBeNull()
        })

        it('should throw an error if there is a database error', async () => {
            await mongoose.disconnect(); // מנתק את החיבור למסד הנתונים
            await expect(findClientByNameAndPhone('c','036161135')).rejects.toThrow("Error fetching find client by name and phone");
            await mongoose.connect(mongoServer.getUri()); // מחבר מחדש למסד הנתונים
        });
    })
})
