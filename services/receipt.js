const Receipt = require("../models/receipt")

const createReceipt = async (receiptData)=>{
    try{
        const newReceipt = await Receipt.createReceipt(receiptData)
        return newReceipt
    }
    catch(err){
        throw new Error("Error create receipt");
    }
}


const revenuesByMonth = async (month) => {
    try {        
        // הנחה שהחודש הוא מספר בין 1 ל-12
        const receipts = await Receipt.find({
            $expr: {
                $eq: [{ $month: "$date" }, month]
            }
        });
        return receipts.length > 0 ? receipts : null;
    } catch (err) {
        throw new Error('Error fetching receipts by month');
    }
}

const revenuesByClient = async (clientId) => {
    try {
        const revenues = await Receipt.find({
            client: clientId
        })
        return revenues.length > 0 ? revenues : null
    }
    catch (err) {
        throw new Error('Error fetching revenue by client');
    }
}

const receiptsBetweenDateRange = async (date1, date2) => {
    try {
        const receipts = await Receipt.find({
            date: {
                $gte: date1,
                $lt: date2
            }
        })
        return receipts.length > 0 ? receipts : null
    }
    catch (err) {
        throw new Error("Error fetching receipts between date rang");
    }
}

const revenuesByYear = async (year) => {
    try {
        const receipts = await Receipt.find({
            $expr: {
                $eq: [{ $year: "$date" }, year] // השוואה בין החודש בשדה date לחודש שניתן
            }
        });
        return receipts.length > 0 ? receipts : null
    }
    catch (err) {
        throw new Error("Error fetching revenues by year");
    }
}

module.exports = {
    createReceipt,
    receiptsBetweenDateRange,
    revenuesByClient,
    revenuesByMonth,
    revenuesByYear
}