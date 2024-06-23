const axios = require('axios');
const express = require('express');
const router = express.Router();

const CRYPTO_API_URL = 'https://cryptoprices.cc';

const isValidTransaction = (transactions) => {
    return Array.isArray(transactions) && transactions.length > 0;
};

const fetchCurrentPrice = async (coinName) => {
    const response = await axios.get(`${CRYPTO_API_URL}/${coinName}`);
    return parseFloat(response.data);
};

const transformTransaction = async (transaction) => {
    try {
        const { "Date(UTC)": date, Market: market, Price: price, Type: type, Amount: amount, Total: total, Fee: fee, "Fee Coin": feeCoin } = transaction;
        const coinName = market.replace("USDT", "");
        const currentPrice = await fetchCurrentPrice(coinName);

        const buyingPrice = parseFloat(price);
        const currentTotalValue = parseFloat(amount) * currentPrice;
        const transactionTotal = parseFloat(total);
        const profitOrLoss = type === "BUY" ? (currentTotalValue - transactionTotal) : (transactionTotal - currentTotalValue);

        const transactionObj = {
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
        };

        const profitOrLossStatus = profitOrLoss >= 0 ? 'Profit' : 'Loss';
        transactionObj[profitOrLossStatus] = profitOrLoss;

        return transactionObj;
    } catch (error) {
        console.error("Error processing transaction:", error);
        return null;
    }
};

const calculateTotalProfitOrLoss = (data) => {
    return data.reduce((acc, item) => acc + (item["Profit"] ?? item["Loss"]), 0);
};

const calculateHoldings = (data) => {
    return data.reduce((acc, item) => {
        acc[item["Coin"]] = (acc[item["Coin"]] || 0) + item["Amount"];
        return acc;
    }, {});
};

const filterTransactionsByDate = (transactions, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction["Date(UTC)"]);
        return transactionDate >= start && transactionDate <= end;
    });
};

const filterTransactionsByCoinNames = (transactions, coinNames) => {
    return transactions.filter(transaction => coinNames.includes(transaction.Market.replace("USDT", "")));
};

const generateSummaryReport = (filteredData) => {
    const summary = {
        totalInvestment: 0,
        totalCurrentValue: 0,
        totalProfitOrLoss: 0,
        coinDetails: {}
    };

    filteredData.forEach(item => {
        const coin = item.Coin;
        if (!summary.coinDetails[coin]) {
            summary.coinDetails[coin] = {
                totalInvestment: 0,
                totalCurrentValue: 0,
                totalProfitOrLoss: 0,
                amount: 0
            };
        }

        summary.coinDetails[coin].totalInvestment += item.Total;
        summary.coinDetails[coin].totalCurrentValue += item["Current Value"];
        summary.coinDetails[coin].totalProfitOrLoss += item.Profit ?? item.Loss;
        summary.coinDetails[coin].amount += item.Amount;

        summary.totalInvestment += item.Total;
        summary.totalCurrentValue += item["Current Value"];
        summary.totalProfitOrLoss += item.Profit ?? item.Loss;
    });

    return summary;
};

router.get("/getCalculatedTransactions", async (req, res) => {
    try {
        const transactions = req.body;
        const { startDate, endDate, coinNames } = req.query;

        if (!isValidTransaction(transactions)) {
            return res.status(400).json({ error: "Invalid request body" });
        }

        let filteredTransactions = transactions;

        if (startDate && endDate) {
            filteredTransactions = filterTransactionsByDate(transactions, startDate, endDate);
        }

        if (coinNames) {
            const coinNamesArray = coinNames.split(",");
            filteredTransactions = filterTransactionsByCoinNames(filteredTransactions, coinNamesArray);
        }

        const transformedDataPromises = filteredTransactions.map(transformTransaction);
        const transformedData = await Promise.all(transformedDataPromises);
        const filteredData = transformedData.filter(item => item !== null);

        const totalProfitOrLoss = calculateTotalProfitOrLoss(filteredData);
        const holdings = calculateHoldings(filteredData);
        const summaryReport = generateSummaryReport(filteredData);

        res.status(200).json({
            success: true,
            message: "Request body received",
            data: filteredData,
            totalProfitOrLoss,
            holdings,
            summaryReport
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
