const axios = require('axios');
const express = require('express');
const router = express.Router();

router.get("/getUserData", async (req, res) => {
    try {
        const transactions = req.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ error: "Invalid request body" });
        }

        const transformedDataPromises = transactions.map(async transaction => {
            try {
                const { "Date(UTC)": date, Market: market, Price: price, Type: type, Amount: amount, Total: total, Fee: fee, "Fee Coin": feeCoin } = transaction;

                const coinName = market.replace("USDT", "");

                const response = await axios.get(`https://cryptoprices.cc/${coinName}`);
                const currentPrice = parseFloat(response.data);

                return {
                    "Date(UTC)": date,
                    "Market": market,
                    "Coin": coinName,
                    "Buying Price": parseFloat(price),
                    "Type": type,
                    "Amount": parseFloat(amount),
                    "Total": parseFloat(total),
                    "Fee": parseFloat(fee),
                    "Fee Coin": feeCoin,
                    "Current Price": currentPrice,
                    "Current Total": parseFloat(amount) * currentPrice,
                    "Net Amount": type === "BUY" ? parseFloat(price) : -parseFloat(price),
                    "Net Cost": type === "BUY" ? parseFloat(total) : -parseFloat(total),
                    "Current Value": parseFloat(amount) * currentPrice * parseFloat(price)
                };
            } catch (error) {
                console.error("Error processing transaction:", error);
                return null; // Handle failed transactions
            }
        });

        const transformedData = await Promise.all(transformedDataPromises);
        const filteredData = transformedData.filter(item => item !== null);

        res.status(200).json({
            success: true,
            message: "Request body received",
            data: filteredData
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
