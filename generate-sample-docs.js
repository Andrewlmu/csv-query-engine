/**
 * Generate sample PE documents for testing hierarchical chunking
 */

const fs = require('fs');
const path = require('path');

const dealMemos = [
  {
    filename: 'delta-healthcare-lbo.txt',
    content: `CONFIDENTIAL INVESTMENT MEMORANDUM

Company: Delta Healthcare Services, Inc.
Transaction Type: Leveraged Buyout
Date: October 15, 2025
Fund: Summit Partners VI

EXECUTIVE SUMMARY
Summit Partners proposes to acquire Delta Healthcare Services for $850M enterprise value. Delta is a leading provider of outpatient surgical services with 42 centers across 8 states, serving over 250,000 patients annually.

KEY INVESTMENT HIGHLIGHTS
- Market leader in ambulatory surgical centers (ASC) with 18% regional market share
- Strong unit economics: $4.2M average revenue per center, 28% EBITDA margins
- Recurring revenue model with 75% of procedures covered by Medicare/Medicaid
- Proven acquisition playbook: successfully integrated 12 centers in last 3 years
- Experienced management team with 60+ years combined healthcare experience

FINANCIAL SUMMARY
Enterprise Value: $850M
Equity Investment: $340M (40%)
Senior Debt: $425M (50%)
Mezzanine Debt: $85M (10%)
Revenue (LTM): $176M
EBITDA (LTM): $49M
Entry Multiple: 17.3x EBITDA
Target Exit Multiple: 12.5x EBITDA
Projected IRR: 24-28%
Projected MOIC: 3.2x
Hold Period: 4-5 years

MARKET OVERVIEW
The ASC market is experiencing strong tailwinds driven by:
- Shift from inpatient to outpatient procedures (8% annual growth)
- Cost savings: ASC procedures 45-60% less expensive than hospital-based
- Aging population: 65+ demographic growing at 3.5% CAGR
- Payer preference for lower-cost settings
- Regulatory support under CMS payment models

Total addressable market: $45B (2025)
Projected market growth: 6.5% CAGR through 2030

OPERATIONAL STRATEGY
Year 1-2: Operational Excellence
- Implement centralized procurement (target $3.5M annual savings)
- Roll out standardized clinical protocols across all centers
- Upgrade IT infrastructure for better analytics and scheduling
- Launch physician recruitment program to add 15 surgeons

Year 3-4: Geographic Expansion
- Acquire 8-10 additional centers in high-growth markets (Texas, Florida, Arizona)
- Enter 2 new states through bolt-on acquisitions
- Build de novo centers in underserved markets (target 3 new centers)
- Expand specialty offerings: orthopedics, ophthalmology, pain management

Year 5: Exit Preparation
- Optimize center portfolio (divest underperforming assets)
- Strengthen management team for institutional buyer
- Implement ESG initiatives and reporting framework
- Prepare for strategic sale or IPO

FINANCIAL PROJECTIONS
Year 1: Revenue $195M, EBITDA $54M (27.7% margin)
Year 2: Revenue $228M, EBITDA $65M (28.5% margin)
Year 3: Revenue $275M, EBITDA $80M (29.1% margin)
Year 4: Revenue $340M, EBITDA $102M (30.0% margin)
Year 5: Revenue $425M, EBITDA $132M (31.1% margin)

RISK FACTORS
Regulatory Risk:
- Medicare/Medicaid reimbursement rate cuts (mitigated by diversified payer mix)
- State licensing requirements and certificate of need laws
- Physician ownership restrictions under Stark Law

Operational Risk:
- Integration challenges with acquired centers
- Physician recruitment and retention in competitive markets
- Quality of care incidents impacting reputation
- Cybersecurity and HIPAA compliance

Market Risk:
- Continued shift to value-based care models
- Hospital system competition and vertical integration
- Technology disruption (telemedicine, AI diagnostics)
- Economic downturn reducing elective procedures

MANAGEMENT TEAM
CEO: Dr. Robert Martinez, MD MBA
- 25 years in healthcare operations
- Previously COO of regional hospital network (450 beds)
- Led 15 successful ASC integrations

CFO: Jennifer Wang, CPA
- Former VP Finance at publicly-traded healthcare REIT
- 12 years healthcare finance experience
- Led 3 prior PE-backed companies through exit

COO: Michael Thompson
- 18 years ASC operations experience
- Implemented cost reduction programs saving $12M annually
- Six Sigma Black Belt

Chief Medical Officer: Dr. Sarah Chen, MD
- Board-certified anesthesiologist
- 20 years clinical leadership
- Published researcher in ambulatory care best practices

EXIT STRATEGY
Primary Exit: Strategic Sale
Target buyers: Large healthcare systems, ASC consolidators (United Surgical Partners, Surgery Partners)
Expected valuation: $1.1-1.3B (12.5-14x Year 5 EBITDA)

Alternative Exit: IPO
Market conditions permitting, potential public offering
Comparable public ASC companies trading at 11-15x EBITDA

INVESTMENT TERMS
Equity Commitment: $340M
Management Rollover: $35M (10% of equity)
Management Incentive Plan: 8% option pool
Board Seats: 5 total (3 Summit, 2 Management)
Preferred Return: 8% annual
Catch-up: 20% to GP until 80/20 split
Carried Interest: 20% above 8% hurdle

SOURCES AND USES
Sources:
Senior Debt: $425M
Mezzanine Debt: $85M
Equity: $340M
Total Sources: $850M

Uses:
Purchase Price: $780M
Transaction Fees: $28M
Financing Fees: $18M
Working Capital: $24M
Total Uses: $850M

CONCLUSION
Delta Healthcare Services represents an attractive investment opportunity in the high-growth ambulatory surgical services sector. The combination of strong unit economics, proven acquisition capabilities, and favorable market dynamics positions the investment for superior returns.

We recommend proceeding with definitive due diligence and negotiating binding documentation.`
  },
  {
    filename: 'epsilon-software-growth.txt',
    content: `INVESTMENT COMMITTEE MEMORANDUM

Target: Epsilon Analytics, Inc.
Transaction: Growth Equity Investment
Date: November 1, 2025
Fund: Velocity Growth Partners IV

EXECUTIVE OVERVIEW
Velocity Growth Partners proposes a $175M minority investment in Epsilon Analytics, a leading provider of AI-powered business intelligence software for mid-market enterprises. The investment will fund product development, go-to-market expansion, and strategic M&A.

COMPANY PROFILE
Founded: 2018
Headquarters: Austin, Texas
Employees: 285
Customers: 450 enterprise clients across 12 industries
Business Model: SaaS (Software-as-a-Service)
Primary Product: Enterprise analytics platform with embedded AI/ML capabilities

INVESTMENT THESIS
1. Large Market Opportunity
TAM: $85B global business intelligence and analytics market
Growing at 11% CAGR driven by digital transformation initiatives
Current penetration: <0.5% of TAM

2. Differentiated Technology
Proprietary AI models trained on 10B+ data points
No-code/low-code interface enabling non-technical users
Real-time data processing (sub-second query response)
85+ pre-built industry-specific templates

3. Strong Unit Economics
CAC: $42,000 (improving 15% annually)
LTV: $580,000 (LTV/CAC ratio of 13.8x)
Gross margin: 82% (best-in-class for SaaS)
Net Dollar Retention: 125% (indicating strong expansion revenue)

4. Proven Management Team
CEO: Amanda Foster - Former VP Product at Salesforce
CTO: Dr. James Liu - PhD MIT, AI researcher with 40+ patents
CRO: Kevin O'Brien - Built $200M ARR sales org at Tableau

FINANCIAL PERFORMANCE
ARR Growth:
2022: $18M ARR (145% growth)
2023: $38M ARR (111% growth)
2024: $72M ARR (89% growth)
2025E: $115M ARR (60% growth)

Revenue by Segment:
Platform Subscriptions: 78%
Professional Services: 14%
Data Connectors/Add-ons: 8%

Customer Metrics:
Average Contract Value (ACV): $165,000
Contract Length: 2.8 years average
Gross Retention: 94%
Net Retention: 125%
Payback Period: 14 months

COMPETITIVE LANDSCAPE
Direct Competitors:
- Tableau (Salesforce): Market leader, $2B+ revenue
- PowerBI (Microsoft): Bundled with Office 365
- Looker (Google): Strong in data modeling
- Domo: Public company, $300M revenue

Epsilon's Competitive Advantages:
- Vertical specialization (healthcare, manufacturing, retail)
- Embedded AI/ML capabilities without data science expertise
- Superior time-to-value (30 days vs 6 months for competitors)
- Mid-market focus (underserved by enterprise vendors)

USE OF PROCEEDS
Product Development: $65M
- Expand AI model capabilities
- Build mobile applications
- Develop new data connectors (SAP, Oracle, Workday)
- Enhance security and compliance features

Go-to-Market Expansion: $75M
- Grow sales team from 45 to 120 reps
- Expand marketing budget 3x
- Open EU and APAC offices
- Build channel partner program

Strategic M&A: $25M
- Acquire complementary data connector company
- Acqui-hire AI/ML talent

Working Capital: $10M

GROWTH STRATEGY
Year 1-2: Product-Market Fit Expansion
- Launch 5 new industry-specific solutions
- Expand into mid-market segment ($50M-$500M revenue companies)
- Build partner ecosystem (AWS, Snowflake, Databricks)
- Achieve SOC2 Type II and ISO 27001 certifications

Year 3-4: International Expansion
- Establish European headquarters (London)
- Enter APAC markets (Singapore, Australia)
- Localize product for international markets
- Build international sales teams

Year 5: Market Leadership
- Reach $400M ARR milestone
- Achieve Rule of 40 compliance (Growth + Profit Margin = 40%+)
- Consider strategic alternatives (IPO or strategic acquisition)

FINANCIAL PROJECTIONS
2025: ARR $115M, Net Burn $(12M)
2026: ARR $190M, Net Burn $(8M)
2027: ARR $290M, FCF Breakeven
2028: ARR $420M, FCF $42M (10% margin)
2029: ARR $580M, FCF $87M (15% margin)

KEY METRICS TARGETS
Logo Growth: 40% CAGR
ARR Growth: 35% CAGR
Gross Margin: >80%
Sales Efficiency (Magic Number): >0.8
Net Dollar Retention: 120%+

RISK ASSESSMENT
Technology Risk:
- Rapid evolution of AI/ML technology
- Dependence on cloud infrastructure providers
- Data security and privacy concerns
Mitigation: Continuous R&D investment, multi-cloud strategy, robust security practices

Market Risk:
- Competition from Microsoft/Google bundles
- Economic downturn impacting software spending
- Shift to open-source alternatives
Mitigation: Strong differentiation, focus on ROI, superior customer service

Execution Risk:
- Scaling go-to-market organization
- Maintaining product quality during rapid growth
- Key person dependency on technical founders
Mitigation: Experienced management team, structured hiring, knowledge transfer

INVESTMENT STRUCTURE
Investment Amount: $175M
Ownership: 25% post-money
Pre-money Valuation: $525M
Post-money Valuation: $700M
Security: Series C Preferred Stock

Board Composition:
Total Seats: 7
Velocity: 2 seats
Founders: 2 seats
Previous Investors: 2 seats
Independent: 1 seat

Investor Rights:
- Pro-rata participation rights
- Board observation rights
- Standard protective provisions
- ROFR on future equity sales
- Information rights (quarterly financials)

RETURNS ANALYSIS
Base Case (40% probability): 4.5x, 32% IRR
Bull Case (30% probability): 8.2x, 48% IRR
Bear Case (30% probability): 1.8x, 12% IRR

Expected Value: 4.8x, 34% IRR

COMPARABLE TRANSACTIONS
Snowflake IPO (2020): $33B valuation at 100x forward revenue
Databricks Series H (2021): $38B valuation at 50x ARR
Datadog IPO (2019): $8B valuation at 40x ARR
Elastic IPO (2018): $5.4B valuation at 18x ARR

Epsilon Valuation: $700M at 6.1x ARR (reasonable for high-growth SaaS)

DUE DILIGENCE COMPLETED
Financial: Clean GAAP accounting, verified ARR and customer metrics
Legal: No material litigation, standard IP protections
Technical: Code review positive, scalable architecture
Commercial: Customer references strong (NPS 72)
Market: TAM validated by third-party research

RECOMMENDATION
The Investment Committee recommends approval of a $175M Series C investment in Epsilon Analytics at a $700M post-money valuation. The company demonstrates strong product-market fit, exceptional unit economics, and significant market opportunity in a growing category.`
  },
  {
    filename: 'zeta-manufacturing-turnaround.txt',
    content: `INVESTMENT MEMORANDUM - SPECIAL SITUATIONS

Company: Zeta Precision Manufacturing Corp.
Transaction Type: Distressed Buyout / Turnaround
Date: September 20, 2025
Fund: Phoenix Capital Partners III

SITUATION OVERVIEW
Zeta Precision Manufacturing, a 40-year-old aerospace components manufacturer, is undergoing Chapter 11 restructuring. Phoenix Capital proposes a $120M DIP financing facility convertible into 85% equity ownership post-reorganization, representing a compelling value investment in a fundamentally sound but overleveraged business.

COMPANY BACKGROUND
Founded: 1985
Location: Wichita, Kansas
Facilities: 3 manufacturing plants (450K sq ft total)
Employees: 680 (peak 1,200 in 2019)
Customers: Boeing, Airbus, Lockheed Martin, GE Aviation
Products: Precision machined components, turbine parts, structural assemblies

BANKRUPTCY BACKGROUND
Filing Date: June 2025
Chapter: 11 Reorganization
Reason: Unsustainable debt load ($340M) following failed expansion
Current Status: DIP financing approved, asset sale process initiated
Secured Debt: $280M (First Lien Term Loan)
Unsecured Debt: $60M (Bonds)
Trade Payables: $45M

ROOT CAUSE ANALYSIS
Strategic Missteps:
- Overexpansion into automotive sector (2021-2022)
- $180M capex investment in new plant that failed to achieve volume
- Long-term supply agreements at below-market pricing
- Management turnover (3 CEOs in 4 years)

External Factors:
- Boeing 737 MAX grounding impact (2019-2020)
- COVID aerospace downturn (2020-2021)
- Supply chain disruptions increasing input costs
- Labor shortages in skilled machining workforce

INVESTMENT THESIS
1. Strong Core Business
Aerospace Components Division (65% of revenue):
- 30+ year relationships with Tier 1 aerospace OEMs
- AS9100 certified with excellent quality metrics (99.7% first-pass yield)
- Sole-source provider on 12 critical aerospace programs
- Long-term contracts with inflation escalators

Defense Division (35% of revenue):
- 15-year IDIQ contracts with DoD
- Classified work requiring facility security clearance
- Backlog visibility extending 7+ years
- Higher margins (28% vs 18% commercial)

2. Overlooked Assets
Real Estate: Plants appraised at $85M (debt at $42M)
Equipment: $120M replacement value, only 6 years average age
IP Portfolio: 18 patents related to advanced manufacturing processes
Customer Relationships: Irreplaceable multi-decade partnerships

3. Clear Path to Profitability
Immediate Actions (0-6 months):
- Close underutilized automotive plant (save $22M annually)
- Renegotiate below-market supply contracts
- Implement lean manufacturing (target 15% productivity improvement)
- Right-size workforce to current demand

Medium-term Improvements (6-18 months):
- Upgrade ERP system for better cost tracking
- Invest in automation ($15M capex, $8M annual savings)
- Win-back lost customers who left during bankruptcy
- Expand defense business (higher margin)

FINANCIAL PERFORMANCE
Historical Performance:
2021: Revenue $420M, EBITDA $65M (15.5% margin)
2022: Revenue $395M, EBITDA $38M (9.6% margin) - Automotive losses
2023: Revenue $365M, EBITDA $12M (3.3% margin) - Peak distress
2024: Revenue $340M, EBITDA $(8M) - Chapter 11 filing
2025E: Revenue $310M, EBITDA $(15M) - Restructuring costs

Normalized EBITDA (excluding one-time costs): $28M

RESTRUCTURING PLAN
Debt Restructuring:
First Lien Term Loan ($280M) → Convert to $80M new term loan
Unsecured Bonds ($60M) → Convert to 15% equity
Trade Claims ($45M) → 60 cents on dollar cash payment

New Capital Structure:
Phoenix DIP Loan: $120M → Converts to 85% equity
Management: 5% equity (with 3-year vesting)
Unsecured Creditors: 15% equity
Total Enterprise Value: $220M (post-reorg)

Sources and Uses:
Sources:
Phoenix DIP Conversion: $120M
New Term Loan: $80M
Total: $200M

Uses:
Pay Secured Creditors: $120M
Pay Trade Claims (60%): $27M
Exit Financing Fees: $8M
Working Capital: $25M
Restructuring Costs: $20M
Total: $200M

OPERATIONAL TURNAROUND PLAN
Phase 1 (Months 0-6): Stabilization
- Install new CEO (aerospace industry veteran)
- Close Tier 2 automotive plant
- Complete workforce reduction (eliminate 120 positions)
- Secure debtor-in-possession financing
- Maintain customer relationships and shipment schedules

Phase 2 (Months 6-18): Operational Improvement
- Implement lean manufacturing and 5S methodology
- Consolidate Kansas and Ohio facilities
- Renegotiate raw material contracts
- Upgrade quality management systems
- Launch cost reduction initiatives ($18M target)

Phase 3 (Months 18-36): Growth and Optimization
- Win new aerospace programs (target $40M annual revenue)
- Expand defense contracting revenue
- Invest in advanced manufacturing technology
- Pursue strategic M&A of complementary businesses
- Prepare for strategic exit

FINANCIAL PROJECTIONS (Post-Restructuring)
Year 1: Revenue $295M, EBITDA $22M (7.5% margin)
Year 2: Revenue $330M, EBITDA $42M (12.7% margin)
Year 3: Revenue $380M, EBITDA $61M (16.1% margin)
Year 4: Revenue $425M, EBITDA $81M (19.1% margin)
Year 5: Revenue $465M, EBITDA $98M (21.1% margin)

MANAGEMENT TEAM
New CEO: Richard Sullivan
- Former COO of major aerospace tier 1 supplier
- Led 2 successful restructurings in manufacturing sector
- 25 years aerospace industry experience

CFO (Retained): Patricia Lee
- Joined company 2024 to lead restructuring
- Former Big 4 restructuring partner
- Led 15+ Chapter 11 cases

COO (New Hire): David Martinez
- Lean manufacturing expert
- Previously turned around $500M automotive supplier
- Six Sigma Master Black Belt

RISK FACTORS
Bankruptcy Risk:
- Court approval of reorganization plan
- Creditor opposition to proposed structure
- Potential competing bids in 363 sale process
Mitigation: Strong relationship with creditors committee, backup sale process

Operational Risk:
- Customer attrition during bankruptcy
- Key employee departures
- Quality issues during transition
Mitigation: Customer communication plan, retention bonuses, quality audits

Market Risk:
- Further aerospace downturn
- Defense budget cuts
- Input cost inflation
Mitigation: Diversified customer base, long-term contracts, hedging strategies

COMPARABLE TRANSACTIONS
Precision Castparts (2016): Aerospace components, acquired at 14x EBITDA
Arconic Restructuring (2020): Post-reorg valued at 8x EBITDA
Spirit AeroSystems Rescue (2023): DIP financing at 6x normalized EBITDA

Zeta Valuation: $220M at 7.9x normalized EBITDA (in-line with distressed comps)

RETURN ANALYSIS
Base Case (60% probability): 4.2x, 35% IRR
Successful Turnaround (30% probability): 6.8x, 48% IRR
Liquidation Scenario (10% probability): 0.6x, (30%) IRR

Expected Value: 4.1x, 33% IRR

EXIT STRATEGY
Year 4-5 Target:
Strategic Buyer: Large aerospace consolidators (TransDigm, Ducommun)
Expected Valuation: $650-750M (8-9x Year 4 EBITDA)
Potential Return: 3.5-4.5x

Alternative: Recap or dividend recapitalization in Year 3 to realize partial exit

RECOMMENDATION
The Investment Committee recommends proceeding with DIP financing and planned reorganization of Zeta Precision Manufacturing. The investment offers compelling value with downside protection through asset coverage and upside through operational improvements in a fundamentally sound business serving attractive end markets.`
  }
];

// Create test-data directory if it doesn't exist
const testDataDir = path.join(__dirname, 'test-data');
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

// Write all documents
dealMemos.forEach(doc => {
  const filepath = path.join(testDataDir, doc.filename);
  fs.writeFileSync(filepath, doc.content, 'utf8');
  console.log(`✅ Created: ${doc.filename} (${doc.content.length} chars)`);
});

console.log(`\n✅ Generated ${dealMemos.length} sample documents in test-data/`);
