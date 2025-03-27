from binance.client import Client

api_key = "ab5d5fbfab29be05310436d99874191aa19d2b0dffde78e2a3d52b8aa3b8b8a0"
api_secret = "883f6b4d72d14b5a3234dcd87a6794d03b63ce67be9913dc876b5f5dff2c99d7"

client = Client(api_key, api_secret, testnet=True)

try:
    # Obtém informações da conta Futures
    futures_account = client.futures_account()
    print("Conta de futuros:", futures_account)

    # Verifica se há ativos
    if 'assets' in futures_account:
        balances = futures_account['assets']
        if balances:
            for asset in balances:
                print(f"Moeda: {asset['asset']}, Saldo Disponível: {asset['walletBalance']}, PNL: {asset['unrealizedProfit']}")
        else:
            print("Nenhum saldo encontrado na conta de futuros.")
    else:
        print("Não há dados de saldo de futuros disponíveis.")
except Exception as e:
    print("Erro ao conectar ou consultar a conta:", e)
