from binance.client import Client

# Suas credenciais da API Testnet
api_key = "ab5d5fbfab29be05310436d99874191aa19d2b0dffde78e2a3d52b8aa3b8b8a0"
api_secret = "883f6b4d72d14b5a3234dcd87a6794d03b63ce67be9913dc876b5f5dff2c99d7"

# Criar um cliente da Binance Testnet
client = Client(api_key, api_secret, testnet=True)

# Par de negociação
symbol = "BTCUSDT"

# Obter trades executados
trades = client.futures_account_trades(symbol=symbol)

# Exibir as operações
for trade in trades:
    print(f"Ordem: {trade['orderId']}, Lado: {trade['side']}, Preço: {trade['price']}, Quantidade: {trade['qty']}")
