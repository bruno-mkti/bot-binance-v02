const priceCtx = document.getElementById("priceChart").getContext("2d");
const rsiCtx = document.getElementById("rsiChart").getContext("2d");
const macdCtx = document.getElementById("macdChart").getContext("2d");

const priceChart = new Chart(priceCtx, {
  type: "line",
  data: { labels: [], datasets: [{ label: "Preço BTC/USDT", borderColor: "lime", data: [], fill: false, tension: 0.1 }] },
  options: { scales: { y: { beginAtZero: false } } }
});

const rsiChart = new Chart(rsiCtx, {
  type: "line",
  data: { labels: [], datasets: [{ label: "RSI", borderColor: "orange", data: [], fill: false, tension: 0.1 }] },
  options: { scales: { y: { min: 0, max: 100 } } }
});

const macdChart = new Chart(macdCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "MACD", borderColor: "skyblue", data: [], fill: false, tension: 0.1 },
      { label: "Signal", borderColor: "red", data: [], fill: false, tension: 0.1 }
    ]
  },
  options: { scales: { y: { beginAtZero: false } } }
});

function atualizarDashboard(data) {
  const timeLabel = new Date().toLocaleTimeString();
  const maxPoints = 20;

  // Limpeza
  [priceChart, rsiChart, macdChart].forEach(chart => {
    if (chart.data.labels.length >= maxPoints) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(ds => ds.data.shift());
    }
    chart.data.labels.push(timeLabel);
  });

  // Dados
  priceChart.data.datasets[0].data.push(data.price);
  priceChart.update();

  rsiChart.data.datasets[0].data.push(data.rsi);
  rsiChart.update();

  macdChart.data.datasets[0].data.push(data.macd);
  macdChart.data.datasets[1].data.push(data.signal);
  macdChart.update();

  // Informações gerais
  document.getElementById("info").innerHTML = `
    <p>$ Preço Atual: ${data.price.toFixed(2)} USDT</p>
    <p>📊 RSI: ${data.rsi.toFixed(2)}</p>
    <p>📈 MACD: ${data.macd.toFixed(2)} / Signal: ${data.signal.toFixed(2)}</p>
    <p>📉 BB: [${data.bb.lower.toFixed(2)} - ${data.bb.upper.toFixed(2)}]</p>
    <p>⚡ ADX: ${data.adx.toFixed(2)}</p>
    <p>📘 EMAs: EMA9: ${data.ema9.toFixed(2)} / EMA21: ${data.ema21.toFixed(2)}</p>
    <p>💰 Saldo Atual: ${data.balance.toFixed(2)} USDT</p>
    <p>✅ Compras: ${data.buyCount}</p>
    <p>🔴 Vendas: ${data.sellCount}</p>
    <p>🪙 Lucro: ${data.profit.toFixed(2)} USDT</p>
  `;

  // Histórico
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.type}</td>
    <td>${data.price}</td>
    <td>${new Date(data.timestamp).toLocaleTimeString()}</td>
    <td>${data.balance}</td>
  `;
  document.getElementById("orderHistory").appendChild(row);
}

// Simulação com dados falsos
setInterval(() => {
  const now = Date.now();
  atualizarDashboard({
    type: Math.random() > 0.5 ? "buy" : "sell",
    price: 79000 + Math.random() * 500,
    rsi: Math.random() * 100,
    macd: Math.random() * 500 - 250,
    signal: Math.random() * 500 - 250,
    bb: { lower: 79000, upper: 80200 },
    adx: Math.random() * 100,
    ema9: 79300 + Math.random() * 100,
    ema21: 79500 + Math.random() * 100,
    balance: 1000 + Math.random() * 50,
    buyCount: Math.floor(Math.random() * 10),
    sellCount: Math.floor(Math.random() * 10),
    profit: Math.random() * 100,
    timestamp: now
  });
}, 3000);