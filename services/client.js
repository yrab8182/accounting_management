const Client = require("../models/client");

const createClient = async (clientData) => {
    try {
        const newClient = await Client.createClient(clientData)
        return newClient
    }
    catch (err) {
        throw new Error("Error create client");
    }
}

const findClient = async (name) => {
    try {
        const client = await Client.find({
            name: name
        })
        if (client.length > 1) {
            return "There is more than one client with this name"
        }
        else if (client.length === 1) {
            return client[0]; // שליפת הלקוח הראשון
        } else {
            return null; // במקרה שאין לקוח
        }
    }
    catch (err) {
        throw new Error("Error fetching find client");
    }
}

const findClientByNameAndPhone = async (name, phone) => {
    try {
        const client = await Client.find({
            name: name,
            phone: phone
        })
        return client.length > 0 ? client[0] : null
    }
    catch (err) {
        throw new Error("Error fetching find client by name and phone");
    }
}

module.exports = {
    createClient,
    findClient,
    findClientByNameAndPhone
}
