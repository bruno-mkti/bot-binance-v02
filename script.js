
async function fetchData() {
  try {
    const response = await fetch("https://bot-binance-production.up.railway.app/data");
    const data = await response.json();

    document.getElementById("preco").textContent = `📌 Preço atual: ${data.price} USDT`;
    document.getElementById("rsi").textContent = `📉 RSI: ${data.rsi.toFixed(2)}`;
    document.getElementById("compras").textContent = `✅ Compras: ${data.buyCount}`;
    document.getElementById("vendas").textContent = `🔴 Vendas: ${data.sellCount}`;
    document.getElementById("investimento").textContent = `💼 Investimento total: 0.00020563 USDT (≈ R$100)`;
    document.getElementById("lucroBruto").textContent = `💰 Lucro bruto: ${data.profit} USDT`;
    document.getElementById("lucroLiquido").textContent = `📈 Lucro líquido (após taxas): ${data.profitAfterFees} USDT (≈ R$${data.profitBRL})`;

    const lucroPercentual = parseFloat(data.lucroPercentual);
    const lucroSpan = document.getElementById("lucroPercentualValor");
    lucroSpan.textContent = `${lucroPercentual}%`;

    if (lucroPercentual > 0) {
      lucroSpan.style.color = "#00ff88"; // verde
    } else if (lucroPercentual < 0) {
      lucroSpan.style.color = "#ff4d4d"; // vermelho
    } else {
      lucroSpan.style.color = "#cccccc"; // neutro
    }

    const tabela = document.querySelector("#historico tbody");
    tabela.innerHTML = "";

    data.historico.forEach(op => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${op.tipo}</td>
        <td>${parseFloat(op.preco).toFixed(2)} USDT</td>
        <td>${op.horario}</td>
        <td>${op.saldo} USDT</td>
      `;

      row.style.color = op.tipo === "COMPRA" ? "#00ff88" : "#ff4d4d";
      tabela.appendChild(row);
    });

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  }
}

setInterval(fetchData, 5000);
fetchData();
