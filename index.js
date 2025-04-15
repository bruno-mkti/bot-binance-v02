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

let isOpened = false;
let buyCount = 0;
let sellCount = 0;
let profit = 0;
let lastBuyPrice = 0;
let balance = 1000;

let orderHistory = [];

let lastPrice = 0;
let rsi = 0;
let macdCurrent = { MACD: 0, signal: 0 };
let bb = { lower: 0, upper: 0 };
let adx = { adx: 0 };
let ema9 = 0;
let ema21 = 0;

// Proteção contra ordens incorretas
async function newOrder(side, price) {
    if (side === "BUY" && isOpened) {
        console.log("⚠️ Ordem de compra ignorada: já existe uma posição aberta.");
        return;
    }

    if (side === "SELL" && !isOpened) {
        console.log("⚠️ Ordem de venda ignorada: nenhuma posição aberta.");
        return;
    }

    if (side === "BUY") {
        buyCount++;
        lastBuyPrice = price;
        balance -= price * QUANTITY;
        isOpened = true;

        orderHistory.push({
            type: "buy",
            price,
            timestamp: Date.now(),
            balance: parseFloat(balance.toFixed(2))
        });

        console.log("✅ COMPRA registrada.");
    } else if (side === "SELL") {
        sellCount++;
        const lucro = (price - lastBuyPrice) * QUANTITY;
        profit += lucro;
        balance += price * QUANTITY;
        isOpened = false;

        orderHistory.push({
            type: "sell",
            price,
            timestamp: Date.now(),
            balance: parseFloat(balance.toFixed(2))
        });

        console.log("✅ VENDA registrada.");
    }
}

async function start() {
    try {
        const { data } = await axios.get(`${API_URL}/api/v3/klines?limit=100&interval=1m&symbol=${SYMBOL}`);
        const closes = data.map(k => parseFloat(k[4]));
        const highs = data.map(k => parseFloat(k[2]));
        const lows = data.map(k => parseFloat(k[3]));

        lastPrice = closes.at(-1);

        rsi = ti.RSI.calculate({ values: closes, period: 14 }).at(-1);
        const macd = ti.MACD.calculate({
            values: closes,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });
        macdCurrent = macd.at(-1);
        bb = ti.BollingerBands.calculate({ values: closes, period: 20, stdDev: 2 }).at(-1);
        adx = ti.ADX.calculate({ high: highs, low: lows, close: closes, period: 14 }).at(-1);
        ema9 = ti.EMA.calculate({ period: 9, values: closes }).at(-1);
        ema21 = ti.EMA.calculate({ period: 21, values: closes }).at(-1);

        const buySignal =
            rsi < 30 &&
            macdCurrent?.MACD > macdCurrent?.signal &&
            lastPrice <= bb?.lower &&
            adx?.adx > 20 &&
            ema9 > ema21;

        const sellSignal =
            rsi > 70 &&
            macdCurrent?.MACD < macdCurrent?.signal &&
            lastPrice >= bb?.upper &&
            adx?.adx > 20 &&
            ema9 < ema21;

        console.clear();
        console.log(`📌 Preço Atual: ${lastPrice.toFixed(2)} USDT`);
        console.log(`📉 RSI: ${rsi?.toFixed(2)} | 💹 MACD: ${macdCurrent?.MACD?.toFixed(2)} / Signal: ${macdCurrent?.signal?.toFixed(2)}`);
        console.log(`📊 BB: [${bb?.lower?.toFixed(2)} - ${bb?.upper?.toFixed(2)}]`);
        console.log(`📈 ADX: ${adx?.adx?.toFixed(2)} | EMA9: ${ema9.toFixed(2)} / EMA21: ${ema21.toFixed(2)}`);
        console.log(`✅ Compras: ${buyCount} | 🔴 Vendas: ${sellCount} | 💰 Lucro: ${profit.toFixed(2)} USDT`);
        console.log(`💼 Saldo Atual: ${balance.toFixed(2)} USDT`);

        if (buySignal && !isOpened) {
            console.log("🟢 Sinal de COMPRA confirmado!");
            await newOrder("BUY", lastPrice);
        } else if (sellSignal && isOpened) {
            console.log("🔴 Sinal de VENDA confirmado!");
            await newOrder("SELL", lastPrice);
        } else {
            console.log("⌛ Aguardando sinal ou condição inválida.");
        }

    } catch (error) {
        console.error("Erro ao obter dados:", error.message);
    }
}

setInterval(start, 5000);

// Dashboard API
app.get('/data', (req, res) => {
    res.json({
        buyCount,
        sellCount,
        profit,
        position: isOpened ? "open" : "waiting",
        balance: parseFloat(balance.toFixed(2)),
        orders: orderHistory.slice(-10).reverse(),
        lastData: {
            price: lastPrice,
            rsi,
            macd: macdCurrent?.MACD,
            signal: macdCurrent?.signal,
            bb,
            adx: adx?.adx,
            ema9,
            ema21,
            timestamp: Date.now()
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

start();
