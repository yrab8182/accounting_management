const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String }
})

clientSchema.statics.createClient = async function(clientData){
    const client = new this(clientData)
    return await client.save()
}

const Client = mongoose.model("Client", clientSchema)
module.exports = Client