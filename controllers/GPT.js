const { expensesByMonth } = require('../services/expenseService');

const getExpensesByMonth = async (req, res) => {
    const month = parseInt(req.params.month, 10); // הנחה שהחודש מגיע מה-URL
    const year = parseInt(req.params.year, 10); // הנחה שהשנה מגיעה מה-URL

    // בדיקה אם החודש הוא בטווח הנכון
    if (month < 1 || month > 12) {
        return res.status(400).json({ error: 'Month must be between 1 and 12.' });
    }

    try {
        const expenses = await expensesByMonth(month, year);
        return res.status(200).json(expenses);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while fetching expenses.' });
    }
};
