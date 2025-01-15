const { connectToDatabase, disconnectFromDatabase } = require('./models/db');
const Receipt = require('./models/receipt');
const { createClient, findClient, findClientByNameAndPhone } = require('./services/client');
const { createExpenses, expensesBetweenDateRange } = require('./services/expenses');
const { createReceipt, revenuesByMonth } = require('./services/receipt');

const addClient = async () => {
    try {
        const newClient = await createClient({
            name: "ac",
            email: "trab8282@gmail.com",
            phone: "0556795121",
            address: "here"
        })
        return newClient
    }
    catch (err) {
        console.log("error addclient",err);


    }
}

const addReceipt = async (name) => {
    try {
        let newReceipt;
        const client = await findClient(name)
        console.log({client});
        
        if (client !== null) {
            newReceipt = await createReceipt({
                client: client._id,
                amount: 100,
                paymentMethod: 'cash',
                receiptNumber:0
            })

            console.log({newReceipt});
            
        }
    }
    catch (err) {
        console.log("Error add receipt", err);
        
    }
}

const addExpenses = async () => {
    try {
        const newE = await createExpenses({
            date: new Date('2025-01-11'),
            amount: 150,
            supplier: "ani",
            paymentMethod: 'cash'
        })

        console.log({newE});
        
    }
    catch (err) {
        console.log("error add expenses");
    }
}

const res = async () => {
    await connectToDatabase();

    const res = await revenuesByMonth(1)
    console.log({ res });
    await disconnectFromDatabase();


}


async function main() {
    await connectToDatabase();
    
    // const res = await revenuesByMonth(1)
    // console.log({ res });
    // const client = await addClient()

    // await addReceipt(client.name);
    console.log(await expensesBetweenDateRange(new Date('2025-01-10'), new Date('2025-01-13')));
    
    
    await disconnectFromDatabase();
}


main().then(console.log('finished')).catch(console.error);
