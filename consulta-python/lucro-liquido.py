def calcular_lucro_liquido(lucro_bruto, num_compras, num_vendas, volume_medio=300.0, taxa_percentual=0.001, slippage_percentual=0.001, cotacao_usdt_brl=5.84):
    total_ordens = num_compras + num_vendas
    volume_total = total_ordens * volume_medio

    # Calculando taxas e slippage
    custo_taxas = volume_total * taxa_percentual
    custo_slippage = volume_total * slippage_percentual

    # Lucro líquido
    lucro_liquido = lucro_bruto - custo_taxas - custo_slippage
    lucro_liquido_brl = lucro_liquido * cotacao_usdt_brl

    return {
        "Lucro Bruto (USDT)": round(lucro_bruto, 2),
        "Taxas (USDT)": round(custo_taxas, 2),
        "Slippage (USDT)": round(custo_slippage, 2),
        "Lucro Líquido (USDT)": round(lucro_liquido, 2),
        "Lucro Líquido (BRL)": round(lucro_liquido_brl, 2)
    }

# Exemplo com seus dados:
dados = calcular_lucro_liquido(
    lucro_bruto=68.67,
    num_compras=24,
    num_vendas=23
)

for k, v in dados.items():
    print(f"{k}: {v}")
