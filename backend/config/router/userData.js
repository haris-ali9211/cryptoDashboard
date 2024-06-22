const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get("/getModifiedTransactions", async (req, res) => {
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

                const buyingPrice = parseFloat(price);
                const currentTotalValue = parseFloat(amount) * currentPrice;
                const transactionTotal = parseFloat(total);
                const profitOrLoss = type === "BUY" ? (currentTotalValue - transactionTotal) : (transactionTotal - currentTotalValue);

                return {
                    "Date(UTC)": date,
                    "Market": market,
                    "Coin": coinName,
                    "Buying Price": buyingPrice,
                    "Type": type,
                    "Amount": parseFloat(amount),
                    "Total": transactionTotal,
                    "Fee": parseFloat(fee),
                    "Fee Coin": feeCoin,
                    "Current Price": currentPrice,
                    "Current Value": currentTotalValue,
                    "Profit or Loss": profitOrLoss
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

router.get("/getSeparatedTransactions", async (req, res) => {
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

                const buyingPrice = parseFloat(price);
                const currentTotalValue = parseFloat(amount) * currentPrice;
                const transactionTotal = parseFloat(total);
                const profitOrLoss = type === "BUY" ? (currentTotalValue - transactionTotal) : (transactionTotal - currentTotalValue);

                return {
                    "Date(UTC)": date,
                    "Market": market,
                    "Coin": coinName,
                    "Buying Price": buyingPrice,
                    "Type": type,
                    "Amount": parseFloat(amount),
                    "Total": transactionTotal,
                    "Fee": parseFloat(fee),
                    "Fee Coin": feeCoin,
                    "Current Price": currentPrice,
                    "Current Value": currentTotalValue,
                    "Profit or Loss": profitOrLoss
                };
            } catch (error) {
                console.error("Error processing transaction:", error);
                return null; // Handle failed transactions
            }
        });

        const transformedData = await Promise.all(transformedDataPromises);
        const filteredData = transformedData.filter(item => item !== null);

        const buyTransactions = filteredData.filter(transaction => transaction.Type === "BUY");
        const sellTransactions = filteredData.filter(transaction => transaction.Type === "SELL");

        res.status(200).json({
            success: true,
            message: "Transactions separated successfully",
            data: {
                buy: buyTransactions,
                sell: sellTransactions
            }
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
