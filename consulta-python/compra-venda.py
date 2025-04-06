from binance.client import Client

api_key = "ab5d5fbfab29be05310436d99874191aa19d2b0dffde78e2a3d52b8aa3b8b8a0"
api_secret = "883f6b4d72d14b5a3234dcd87a6794d03b63ce67be9913dc876b5f5dff2c99d7"

client = Client(api_key, api_secret, testnet=True)

symbol = "BTCUSDT"  # Substitua com o símbolo do ativo que você está negociando

# Consultar histórico de transações (compra/venda) para o símbolo desejado
try:
    trades = client.futures_account_trades(symbol=symbol)
    for trade in trades:
        print(trade)  # Exibe detalhes de cada transação
except Exception as e:
    print("Erro:", e)
