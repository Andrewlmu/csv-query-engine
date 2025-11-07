"""
Download comprehensive real financial data from Yahoo Finance
Creates multiple CSV files for different sectors and analysis types
"""

import yfinance as yf
import pandas as pd
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

print("📊 Downloading comprehensive real financial data from Yahoo Finance...")
print("=" * 80)

# 1. TECHNOLOGY SECTOR - Quarterly Financials
print("\n📱 TECHNOLOGY SECTOR - Downloading...")
tech_companies = {
    'AAPL': 'Apple Inc',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc',
    'META': 'Meta Platforms',
    'NVDA': 'NVIDIA Corporation',
    'ORCL': 'Oracle Corporation',
    'ADBE': 'Adobe Inc',
    'CRM': 'Salesforce Inc',
    'INTC': 'Intel Corporation',
    'AMD': 'Advanced Micro Devices'
}

tech_data = []
for ticker, name in tech_companies.items():
    try:
        stock = yf.Ticker(ticker)
        income = stock.quarterly_income_stmt
        balance = stock.quarterly_balance_sheet
        cashflow = stock.quarterly_cashflow

        if income is None or income.empty:
            continue

        for col in income.columns[:6]:  # Last 6 quarters
            try:
                quarter_date = col
                revenue = income.loc['Total Revenue', col] if 'Total Revenue' in income.index else None
                gross_profit = income.loc['Gross Profit', col] if 'Gross Profit' in income.index else None
                operating_income = income.loc['Operating Income', col] if 'Operating Income' in income.index else None
                net_income = income.loc['Net Income', col] if 'Net Income' in income.index else None

                rd_expense = income.loc['Research And Development', col] if 'Research And Development' in income.index else None

                tech_data.append({
                    'Company': name,
                    'Ticker': ticker,
                    'Quarter': f"Q{(quarter_date.month - 1) // 3 + 1}",
                    'Year': quarter_date.year,
                    'Date': quarter_date.strftime('%Y-%m-%d'),
                    'Revenue': int(revenue) if pd.notna(revenue) else None,
                    'Gross_Profit': int(gross_profit) if pd.notna(gross_profit) else None,
                    'Operating_Income': int(operating_income) if pd.notna(operating_income) else None,
                    'Net_Income': int(net_income) if pd.notna(net_income) else None,
                    'RD_Expense': int(rd_expense) if pd.notna(rd_expense) else None,
                    'Gross_Margin': float(gross_profit / revenue) if revenue and gross_profit else None,
                    'Operating_Margin': float(operating_income / revenue) if revenue and operating_income else None,
                    'Net_Margin': float(net_income / revenue) if revenue and net_income else None,
                    'RD_Intensity': float(rd_expense / revenue) if revenue and rd_expense else None,
                })
            except Exception as e:
                continue
        print(f"  ✅ {ticker} - {name}")
    except Exception as e:
        print(f"  ❌ {ticker} - Error: {e}")

df_tech = pd.DataFrame(tech_data)
df_tech.to_csv('data/demo/tech-sector-financials.csv', index=False)
print(f"💾 Saved tech-sector-financials.csv ({len(df_tech)} records)")

# 2. HEALTHCARE SECTOR
print("\n🏥 HEALTHCARE SECTOR - Downloading...")
healthcare_companies = {
    'JNJ': 'Johnson & Johnson',
    'UNH': 'UnitedHealth Group',
    'PFE': 'Pfizer Inc',
    'ABBV': 'AbbVie Inc',
    'TMO': 'Thermo Fisher Scientific',
    'ABT': 'Abbott Laboratories',
    'MRK': 'Merck & Co',
    'LLY': 'Eli Lilly'
}

healthcare_data = []
for ticker, name in healthcare_companies.items():
    try:
        stock = yf.Ticker(ticker)
        income = stock.quarterly_income_stmt

        if income is None or income.empty:
            continue

        for col in income.columns[:6]:
            try:
                quarter_date = col
                revenue = income.loc['Total Revenue', col] if 'Total Revenue' in income.index else None
                gross_profit = income.loc['Gross Profit', col] if 'Gross Profit' in income.index else None
                net_income = income.loc['Net Income', col] if 'Net Income' in income.index else None
                rd_expense = income.loc['Research And Development', col] if 'Research And Development' in income.index else None

                healthcare_data.append({
                    'Company': name,
                    'Ticker': ticker,
                    'Quarter': f"Q{(quarter_date.month - 1) // 3 + 1}",
                    'Year': quarter_date.year,
                    'Date': quarter_date.strftime('%Y-%m-%d'),
                    'Revenue': int(revenue) if pd.notna(revenue) else None,
                    'Gross_Profit': int(gross_profit) if pd.notna(gross_profit) else None,
                    'Net_Income': int(net_income) if pd.notna(net_income) else None,
                    'RD_Expense': int(rd_expense) if pd.notna(rd_expense) else None,
                    'Gross_Margin': float(gross_profit / revenue) if revenue and gross_profit else None,
                    'Net_Margin': float(net_income / revenue) if revenue and net_income else None,
                })
            except Exception as e:
                continue
        print(f"  ✅ {ticker} - {name}")
    except Exception as e:
        print(f"  ❌ {ticker} - Error: {e}")

df_healthcare = pd.DataFrame(healthcare_data)
df_healthcare.to_csv('data/demo/healthcare-sector-financials.csv', index=False)
print(f"💾 Saved healthcare-sector-financials.csv ({len(df_healthcare)} records)")

# 3. FINANCIAL SECTOR
print("\n💰 FINANCIAL SECTOR - Downloading...")
financial_companies = {
    'JPM': 'JPMorgan Chase',
    'BAC': 'Bank of America',
    'WFC': 'Wells Fargo',
    'GS': 'Goldman Sachs',
    'MS': 'Morgan Stanley',
    'C': 'Citigroup',
    'BLK': 'BlackRock',
    'AXP': 'American Express'
}

financial_data = []
for ticker, name in financial_companies.items():
    try:
        stock = yf.Ticker(ticker)
        income = stock.quarterly_income_stmt

        if income is None or income.empty:
            continue

        for col in income.columns[:6]:
            try:
                quarter_date = col
                revenue = income.loc['Total Revenue', col] if 'Total Revenue' in income.index else None
                net_income = income.loc['Net Income', col] if 'Net Income' in income.index else None
                operating_income = income.loc['Operating Income', col] if 'Operating Income' in income.index else None

                financial_data.append({
                    'Company': name,
                    'Ticker': ticker,
                    'Quarter': f"Q{(quarter_date.month - 1) // 3 + 1}",
                    'Year': quarter_date.year,
                    'Date': quarter_date.strftime('%Y-%m-%d'),
                    'Revenue': int(revenue) if pd.notna(revenue) else None,
                    'Operating_Income': int(operating_income) if pd.notna(operating_income) else None,
                    'Net_Income': int(net_income) if pd.notna(net_income) else None,
                    'Operating_Margin': float(operating_income / revenue) if revenue and operating_income else None,
                    'Net_Margin': float(net_income / revenue) if revenue and net_income else None,
                })
            except Exception as e:
                continue
        print(f"  ✅ {ticker} - {name}")
    except Exception as e:
        print(f"  ❌ {ticker} - Error: {e}")

df_financial = pd.DataFrame(financial_data)
df_financial.to_csv('data/demo/financial-sector.csv', index=False)
print(f"💾 Saved financial-sector.csv ({len(df_financial)} records)")

# 4. CONSUMER / RETAIL SECTOR
print("\n🛒 CONSUMER/RETAIL SECTOR - Downloading...")
consumer_companies = {
    'AMZN': 'Amazon.com Inc',
    'WMT': 'Walmart Inc',
    'HD': 'Home Depot',
    'NKE': 'Nike Inc',
    'MCD': 'McDonalds Corporation',
    'SBUX': 'Starbucks Corporation',
    'TGT': 'Target Corporation',
    'COST': 'Costco Wholesale'
}

consumer_data = []
for ticker, name in consumer_companies.items():
    try:
        stock = yf.Ticker(ticker)
        income = stock.quarterly_income_stmt

        if income is None or income.empty:
            continue

        for col in income.columns[:6]:
            try:
                quarter_date = col
                revenue = income.loc['Total Revenue', col] if 'Total Revenue' in income.index else None
                gross_profit = income.loc['Gross Profit', col] if 'Gross Profit' in income.index else None
                operating_income = income.loc['Operating Income', col] if 'Operating Income' in income.index else None
                net_income = income.loc['Net Income', col] if 'Net Income' in income.index else None

                consumer_data.append({
                    'Company': name,
                    'Ticker': ticker,
                    'Quarter': f"Q{(quarter_date.month - 1) // 3 + 1}",
                    'Year': quarter_date.year,
                    'Date': quarter_date.strftime('%Y-%m-%d'),
                    'Revenue': int(revenue) if pd.notna(revenue) else None,
                    'Gross_Profit': int(gross_profit) if pd.notna(gross_profit) else None,
                    'Operating_Income': int(operating_income) if pd.notna(operating_income) else None,
                    'Net_Income': int(net_income) if pd.notna(net_income) else None,
                    'Gross_Margin': float(gross_profit / revenue) if revenue and gross_profit else None,
                    'Operating_Margin': float(operating_income / revenue) if revenue and operating_income else None,
                    'Net_Margin': float(net_income / revenue) if revenue and net_income else None,
                })
            except Exception as e:
                continue
        print(f"  ✅ {ticker} - {name}")
    except Exception as e:
        print(f"  ❌ {ticker} - Error: {e}")

df_consumer = pd.DataFrame(consumer_data)
df_consumer.to_csv('data/demo/consumer-retail-financials.csv', index=False)
print(f"💾 Saved consumer-retail-financials.csv ({len(df_consumer)} records)")

# 5. ENERGY SECTOR
print("\n⚡ ENERGY SECTOR - Downloading...")
energy_companies = {
    'XOM': 'Exxon Mobil',
    'CVX': 'Chevron Corporation',
    'COP': 'ConocoPhillips',
    'SLB': 'Schlumberger',
    'EOG': 'EOG Resources'
}

energy_data = []
for ticker, name in energy_companies.items():
    try:
        stock = yf.Ticker(ticker)
        income = stock.quarterly_income_stmt

        if income is None or income.empty:
            continue

        for col in income.columns[:6]:
            try:
                quarter_date = col
                revenue = income.loc['Total Revenue', col] if 'Total Revenue' in income.index else None
                gross_profit = income.loc['Gross Profit', col] if 'Gross Profit' in income.index else None
                net_income = income.loc['Net Income', col] if 'Net Income' in income.index else None

                energy_data.append({
                    'Company': name,
                    'Ticker': ticker,
                    'Quarter': f"Q{(quarter_date.month - 1) // 3 + 1}",
                    'Year': quarter_date.year,
                    'Date': quarter_date.strftime('%Y-%m-%d'),
                    'Revenue': int(revenue) if pd.notna(revenue) else None,
                    'Gross_Profit': int(gross_profit) if pd.notna(gross_profit) else None,
                    'Net_Income': int(net_income) if pd.notna(net_income) else None,
                    'Gross_Margin': float(gross_profit / revenue) if revenue and gross_profit else None,
                    'Net_Margin': float(net_income / revenue) if revenue and net_income else None,
                })
            except Exception as e:
                continue
        print(f"  ✅ {ticker} - {name}")
    except Exception as e:
        print(f"  ❌ {ticker} - Error: {e}")

df_energy = pd.DataFrame(energy_data)
df_energy.to_csv('data/demo/energy-sector-financials.csv', index=False)
print(f"💾 Saved energy-sector-financials.csv ({len(df_energy)} records)")

# Summary
print("\n" + "=" * 80)
print("✅ DOWNLOAD COMPLETE")
print("=" * 80)
print(f"\n📊 Summary:")
print(f"   Technology Sector:     {len(df_tech)} records")
print(f"   Healthcare Sector:     {len(df_healthcare)} records")
print(f"   Financial Sector:      {len(df_financial)} records")
print(f"   Consumer/Retail:       {len(df_consumer)} records")
print(f"   Energy Sector:         {len(df_energy)} records")
print(f"   TOTAL:                 {len(df_tech) + len(df_healthcare) + len(df_financial) + len(df_consumer) + len(df_energy)} records")
print(f"\n💾 All files saved to: data/demo/")
print("\n✨ Real-world financial data ready for comprehensive CSV analysis!")
