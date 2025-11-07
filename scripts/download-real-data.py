"""
Download real quarterly financial data from Yahoo Finance
Creates a comprehensive CSV with multiple companies and metrics
"""

import yfinance as yf
import pandas as pd
from datetime import datetime

# S&P500 companies from different sectors
companies = {
    'AAPL': 'Apple Inc',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc',
    'AMZN': 'Amazon.com Inc',
    'TSLA': 'Tesla Inc',
    'JPM': 'JPMorgan Chase',
    'JNJ': 'Johnson & Johnson',
    'V': 'Visa Inc',
    'WMT': 'Walmart Inc',
    'PG': 'Procter & Gamble'
}

print("📊 Downloading REAL quarterly financial data from Yahoo Finance...")
print(f"Companies: {len(companies)}")
print("=" * 80)

all_data = []

for ticker, company_name in companies.items():
    print(f"\n📈 Fetching {ticker} - {company_name}...")

    try:
        stock = yf.Ticker(ticker)

        # Get quarterly financials
        quarterly_income = stock.quarterly_income_stmt
        quarterly_balance = stock.quarterly_balance_sheet
        quarterly_cashflow = stock.quarterly_cashflow

        if quarterly_income is None or quarterly_income.empty:
            print(f"  ⚠️  No data available for {ticker}")
            continue

        # Process each quarter
        for col in quarterly_income.columns[:8]:  # Last 8 quarters (~2 years)
            try:
                quarter_date = col
                year = quarter_date.year
                quarter = f"Q{(quarter_date.month - 1) // 3 + 1}"

                # Extract key metrics (handle missing data gracefully)
                revenue = quarterly_income.loc['Total Revenue', col] if 'Total Revenue' in quarterly_income.index else None
                gross_profit = quarterly_income.loc['Gross Profit', col] if 'Gross Profit' in quarterly_income.index else None
                operating_income = quarterly_income.loc['Operating Income', col] if 'Operating Income' in quarterly_income.index else None
                net_income = quarterly_income.loc['Net Income', col] if 'Net Income' in quarterly_income.index else None

                # EBITDA calculation (if available)
                ebitda = None
                if 'EBITDA' in quarterly_income.index:
                    ebitda = quarterly_income.loc['EBITDA', col]
                elif operating_income is not None:
                    # Approximate EBITDA
                    ebitda = operating_income

                # Balance sheet metrics
                total_assets = quarterly_balance.loc['Total Assets', col] if quarterly_balance is not None and 'Total Assets' in quarterly_balance.index else None
                total_debt = quarterly_balance.loc['Total Debt', col] if quarterly_balance is not None and 'Total Debt' in quarterly_balance.index else None

                # Cash flow metrics
                operating_cashflow = quarterly_cashflow.loc['Operating Cash Flow', col] if quarterly_cashflow is not None and 'Operating Cash Flow' in quarterly_cashflow.index else None
                free_cashflow = quarterly_cashflow.loc['Free Cash Flow', col] if quarterly_cashflow is not None and 'Free Cash Flow' in quarterly_cashflow.index else None

                # Calculate margins
                gross_margin = (gross_profit / revenue) if revenue and gross_profit else None
                operating_margin = (operating_income / revenue) if revenue and operating_income else None
                net_margin = (net_income / revenue) if revenue and net_income else None

                row = {
                    'Company': company_name,
                    'Ticker': ticker,
                    'Quarter': quarter,
                    'Year': year,
                    'Date': quarter_date.strftime('%Y-%m-%d'),
                    'Revenue': int(revenue) if pd.notna(revenue) else None,
                    'Gross_Profit': int(gross_profit) if pd.notna(gross_profit) else None,
                    'EBITDA': int(ebitda) if pd.notna(ebitda) else None,
                    'Operating_Income': int(operating_income) if pd.notna(operating_income) else None,
                    'Net_Income': int(net_income) if pd.notna(net_income) else None,
                    'Total_Assets': int(total_assets) if pd.notna(total_assets) else None,
                    'Total_Debt': int(total_debt) if pd.notna(total_debt) else None,
                    'Operating_Cashflow': int(operating_cashflow) if pd.notna(operating_cashflow) else None,
                    'Free_Cashflow': int(free_cashflow) if pd.notna(free_cashflow) else None,
                    'Gross_Margin': float(gross_margin) if pd.notna(gross_margin) else None,
                    'Operating_Margin': float(operating_margin) if pd.notna(operating_margin) else None,
                    'Net_Margin': float(net_margin) if pd.notna(net_margin) else None,
                }

                all_data.append(row)
                print(f"  ✅ {quarter} {year}: Revenue ${revenue/1e9:.2f}B" if revenue else f"  ⚠️  {quarter} {year}: Missing data")

            except Exception as e:
                print(f"  ❌ Error processing quarter {col}: {e}")
                continue

    except Exception as e:
        print(f"  ❌ Error fetching {ticker}: {e}")
        continue

print("\n" + "=" * 80)
print(f"✅ Downloaded {len(all_data)} quarterly records")

# Create DataFrame
df = pd.DataFrame(all_data)

# Sort by company and date
df = df.sort_values(['Company', 'Year', 'Quarter'])

# Save to CSV
output_path = 'test-data/real-sp500-financials.csv'
df.to_csv(output_path, index=False)

print(f"💾 Saved to: {output_path}")
print(f"\n📊 Dataset Summary:")
print(f"   Companies: {df['Company'].nunique()}")
print(f"   Records: {len(df)}")
print(f"   Date range: {df['Date'].min()} to {df['Date'].max()}")
print(f"   Columns: {len(df.columns)}")
print(f"\n📉 Data Quality:")
print(f"   Completeness: {(1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100:.1f}%")
print(f"   Missing values: {df.isnull().sum().sum()}")

# Show sample
print(f"\n📝 Sample data (first 5 rows):")
print(df.head().to_string())

print("\n✨ Real-world data ready for testing!")
