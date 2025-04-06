const express = require("express");
const axios = require("axios");
const cors = require("cors");
const ti = require("technicalindicators");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());

const API_URL = "https://testnet.binance.vision";
const SYMBOL = "BTCUSDT";
const QUANTITY = 0.00020563;
const PERIOD = 14;

let isOpened = false;
let buyCount = 0;
let sellCount = 0;
let profit = 0;
let lastBuyPrice = 0;
let balance = 1000; // Saldo inicial em USDT

let orderHistory = [];

async function newOrder(side, price) {
    console.log(`Ordem executada: ${side} ${QUANTITY} de ${SYMBOL} a ${price}`);
    if (side === "BUY") {
        buyCount++;
        lastBuyPrice = price;
        balance -= price * QUANTITY; // subtrai da conta
        isOpened = true;
    } else if (side === "SELL") {
        sellCount++;
        const lucro = (price - lastBuyPrice) * QUANTITY;
        profit += lucro;
        balance += price * QUANTITY; // soma à conta
        isOpened = false;
    }

    orderHistory.push({
        type: side.toLowerCase(),
        price: price,
        timestamp: Date.now(),
        balance: parseFloat(balance.toFixed(2)) // saldo após a ordem
    });
}

async function start() {
    try {
        const { data } = await axios.get(`${API_URL}/api/v3/klines?limit=100&interval=1m&symbol=${SYMBOL}`);
        const closes = data.map(k => parseFloat(k[4]));
        const highs = data.map(k => parseFloat(k[2]));
        const lows = data.map(k => parseFloat(k[3]));

        const lastPrice = closes[closes.length - 1];

        const rsi = ti.RSI.calculate({ values: closes, period: 14 }).slice(-1)[0];
        const macd = ti.MACD.calculate({
            values: closes,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });
        const macdCurrent = macd.slice(-1)[0];
        const bb = ti.BollingerBands.calculate({ values: closes, period: 20, stdDev: 2 }).slice(-1)[0];
        const adx = ti.ADX.calculate({ high: highs, low: lows, close: closes, period: 14 }).slice(-1)[0];
        const ema9 = ti.EMA.calculate({ period: 9, values: closes }).slice(-1)[0];
        const ema21 = ti.EMA.calculate({ period: 21, values: closes }).slice(-1)[0];

        const buySignal =
            rsi < 30 &&
            macdCurrent.MACD > macdCurrent.signal &&
            lastPrice <= bb.lower &&
            adx.adx > 20 &&
            ema9 > ema21 &&
            !isOpened;

        const sellSignal =
            rsi > 70 &&
            macdCurrent.MACD < macdCurrent.signal &&
            lastPrice >= bb.upper &&
            adx.adx > 20 &&
            ema9 < ema21 &&
            isOpened;

        console.clear();
        console.log(`📌 Preço Atual: ${lastPrice.toFixed(2)} USDT`);
        console.log(`📉 RSI: ${rsi?.toFixed(2)} | 💹 MACD: ${macdCurrent?.MACD?.toFixed(2)} / Signal: ${macdCurrent?.signal?.toFixed(2)}`);
        console.log(`📊 BB: [${bb.lower.toFixed(2)} - ${bb.upper.toFixed(2)}]`);
        console.log(`📈 ADX: ${adx.adx.toFixed(2)} | EMA9: ${ema9.toFixed(2)} / EMA21: ${ema21.toFixed(2)}`);
        console.log(`✅ Compras: ${buyCount} | 🔴 Vendas: ${sellCount} | 💰 Lucro: ${profit.toFixed(2)} USDT`);
        console.log(`💼 Saldo Atual: ${balance.toFixed(2)} USDT`);

        if (buySignal) {
            console.log("🟢 Sinal de COMPRA confirmado!");
            await newOrder("BUY", lastPrice);
        } else if (sellSignal) {
            console.log("🔴 Sinal de VENDA confirmado!");
            await newOrder("SELL", lastPrice);
        } else {
            console.log("⌛ Aguardando sinal...");
        }

    } catch (error) {
        console.error("Erro ao obter dados:", error.message);
    }
}

setInterval(start, 5000);

app.get('/data', (req, res) => {
    res.json({
        buyCount,
        sellCount,
        profit,
        position: isOpened ? "open" : "waiting",
        balance: parseFloat(balance.toFixed(2)),
        orders: orderHistory.slice(-10).reverse() // últimos 10 registros
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

start();
