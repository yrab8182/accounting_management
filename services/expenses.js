const Expenses = require("../models/expenses")

const createExpenses = async (expensesData)=>{
    try{
        const newExpenses = await Expenses.createExpenses(expensesData)        
        return newExpenses
    }
    catch(err){
        throw new Error("Error create expenses");
    }
}


const expensesByMonth = async (month) => {
    try {
        // הנחה שהחודש הוא מספר בין 1 ל-12
        const expenses = await Expenses.find({
            $expr: {
                $eq: [{ $month: "$date" }, month] // השוואה בין החודש בשדה date לחודש שניתן
            }
        });
        return expenses.length > 0 ? expenses : null;
    } catch (err) {
        throw new Error('Error fetching expenses by month')
    }
};

const expensesBetweenDateRange = async (date1, date2) => {
    try {
        const expenses = await Expenses.find({
            date: {
                $gte: date1,
                $lt: date2
            }
        })
        return expenses.length > 0 ? expenses : null
    }
    catch (err) {
        throw new Error("Error fetching expenses between date rang");
    }
}



const expensesByYear = async (year) => {
    try {
        const expenses = await Expenses.find({
            $expr: {
                $eq: [{ $year: "$date" }, year]
            }
        })
        return expenses.length > 0 ? expenses : null
    }
    catch (err) {
        throw new Error("Error fetching expenses by year")
    }
}

module.exports = {
    createExpenses,
    expensesByMonth,
    expensesBetweenDateRange,
    expensesByYear
}