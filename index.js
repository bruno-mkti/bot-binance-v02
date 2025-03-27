const express = require("express");
const axios = require("axios");
const cors = require("cors");

require("dotenv").config();
const app = express();
const PORT = 3000;

app.use(cors());

const API_URL = "https://testnet.binance.vision";
const SYMBOL = "BTCUSDT";
const QUANTITY = "0.001";
const PERIOD = 14;

let isOpened = false;
let buyCount = 0;
let sellCount = 0;
let profit = 0;
let lastBuyPrice = 0;

function averages(prices, period, startIndex) {
    let gains = 0, losses = 0;
    for (let i = 0; i < period && (i + startIndex) < prices.length; i++) {
        const diff = prices[i + startIndex] - prices[i + startIndex - 1];
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
    }
    return { avgGains: gains / period, avgLosses: losses / period };
}

function RSI(prices, period) {
    let avgGains = 0, avgLosses = 0;
    for (let i = 1; i < prices.length; i++) {
        let newAverages = averages(prices, period, i);
        if (i === 1) {
            avgGains = newAverages.avgGains;
            avgLosses = newAverages.avgLosses;
            continue;
        }
        avgGains = (avgGains * (period - 1) + newAverages.avgGains) / period;
        avgLosses = (avgLosses * (period - 1) + newAverages.avgLosses) / period;
    }
    const rs = avgGains / avgLosses;
    return 100 - (100 / (1 + rs));
}

async function newOrder(side, price) {
    console.log(`Ordem executada: ${side} ${QUANTITY} de ${SYMBOL} a ${price}`);
    
    if (side === "BUY") {
        buyCount++;
        lastBuyPrice = price;
    } else if (side === "SELL") {
        sellCount++;
        profit += (price - lastBuyPrice) * parseFloat(QUANTITY);
    }
}

async function start() {
    try {
        const { data } = await axios.get(`${API_URL}/api/v3/klines?limit=100&interval=15m&symbol=${SYMBOL}`);
        const lastPrice = parseFloat(data[data.length - 1][4]);
        const prices = data.map(k => parseFloat(k[4]));
        const rsi = RSI(prices, PERIOD);

        console.clear();
        console.log(`📌 Preço Atual BTC: ${lastPrice}`);
        console.log(`📉 RSI: ${rsi}`);
        console.log(`📊 Compras: ${buyCount}, Vendas: ${sellCount}, Lucro: ${profit.toFixed(2)} USDT`);

        if (rsi < 40 && isOpened === false) {
            console.log("✅ RSI abaixo de 40! Comprando...");
            isOpened = true;
            newOrder("BUY", lastPrice);
        } else if (rsi > 60 && isOpened === true) {
            console.log("🔴 RSI acima de 60! Vendendo...");
            newOrder("SELL", lastPrice);
            isOpened = false;
        } else {
            console.log("⌛ Aguardando...");
        }
    } catch (error) {
        console.error("Erro ao obter dados da Binance:", error.message);
    }
}

setInterval(start, 3000);

// API para enviar dados ao frontend
fetch("https://bot-binance-production.up.railway.app/data")
  .then(response => response.json())
  .then(data => {
      document.getElementById("price").innerText = data.price.toFixed(2);
      document.getElementById("rsi").innerText = data.rsi.toFixed(2);
      document.getElementById("buyCount").innerText = data.buyCount;
      document.getElementById("sellCount").innerText = data.sellCount;
      document.getElementById("profit").innerText = data.profit.toFixed(2);
  })
  .catch(error => console.error("Erro ao buscar dados:", error));
    }
});

// Iniciar servidor Express
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

start();
