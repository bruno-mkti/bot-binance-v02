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

let hasBuy = false;
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
    <p>🤑 Lucro: ${data.profit.toFixed(2)} USDT</p>
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

setInterval(async () => {
  const res = await fetch('http://localhost:3000/data');
  const data = await res.json();

  const d = data.lastData;

  atualizarDashboard({
    type: data.position === "open" ? "sell" : "buy",
    price: d.price,
    rsi: d.rsi,
    macd: d.macd,
    signal: d.signal,
    bb: d.bb,
    adx: d.adx,
    ema9: d.ema9,
    ema21: d.ema21,
    balance: data.balance,
    buyCount: data.buyCount,
    sellCount: data.sellCount,
    profit: data.profit,
    timestamp: d.timestamp
  });

  let hasBuy = false;

  orders.slice().reverse().forEach((order) => {
    if (order.type === "buy") {
      hasBuy = true;
    }

    if (order.type === "sell" && !hasBuy) {
      return; // ignora venda sem compra anterior
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.type === "open" ? "sell" : "buy"}</td>
      <td>${order.price.toFixed(2)}</td>
      <td>${new Date(order.timestamp).toLocaleTimeString()}</td>
      <td>${order.balance.toFixed(2)}</td>
    `;
    historyTable.appendChild(row);

    if (order.type === "sell") {
      hasBuy = false; // fecha a posição
    }
  });
}, 5000);