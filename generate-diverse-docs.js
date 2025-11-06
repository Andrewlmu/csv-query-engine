const fs = require('fs');
const path = require('path');

const testDataDir = path.join(__dirname, 'test-data');

// Ensure directory exists
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

const documents = [
  // 1. CSV - Quarterly Financial Results
  {
    filename: 'gamma-portfolio-quarterly-results.csv',
    content: `Quarter,Year,Company,Revenue_M,EBITDA_M,EBITDA_Margin,Net_Income_M,Headcount,Notes
Q1,2024,Delta Healthcare,125.4,28.9,23.0%,12.3,850,"Strong physician recruitment"
Q2,2024,Delta Healthcare,132.1,31.2,23.6%,14.1,892,"Opened 3 new centers"
Q3,2024,Delta Healthcare,128.7,29.8,23.2%,13.5,905,"Seasonal softness"
Q4,2024,Delta Healthcare,145.3,35.6,24.5%,16.8,925,"Record quarter - new contracts"
Q1,2024,Epsilon Software,43.2,12.8,29.6%,5.2,245,"ARR growth 45% YoY"
Q2,2024,Epsilon Software,48.9,15.3,31.3%,6.8,267,"Enterprise deals closing"
Q3,2024,Epsilon Software,52.1,16.9,32.4%,7.9,289,"International expansion"
Q4,2024,Epsilon Software,58.4,19.6,33.6%,9.4,312,"Platform upsells driving margin"
Q1,2024,Zeta Manufacturing,28.3,4.2,14.8%,-2.1,680,"Restructuring costs"
Q2,2024,Zeta Manufacturing,31.7,6.1,19.2%,0.3,652,"Cost cuts taking effect"
Q3,2024,Zeta Manufacturing,35.4,8.7,24.6%,2.8,645,"Defense contracts ramping"
Q4,2024,Zeta Manufacturing,39.8,11.2,28.1%,5.1,638,"Turnaround complete"
Q1,2024,Theta Logistics,67.8,9.5,14.0%,3.2,1240,"Fuel costs pressuring margins"
Q2,2024,Theta Logistics,72.4,11.2,15.5%,4.8,1265,"Route optimization improving"
Q3,2024,Theta Logistics,68.9,10.1,14.7%,3.9,1255,"Summer volumes down"
Q4,2024,Theta Logistics,79.2,13.8,17.4%,6.7,1280,"Holiday peak strong performance"`,
  },

  // 2. Investment Committee Memo (TXT formatted like PDF)
  {
    filename: 'kappa-biotech-ic-memo.txt',
    content: `INVESTMENT COMMITTEE MEMORANDUM

TO: Investment Committee Members
FROM: Sarah Chen, Principal
DATE: November 15, 2024
RE: Kappa Biotech Acquisition - $180M Growth Equity Investment

EXECUTIVE SUMMARY

Phoenix Capital Partners IV proposes a $180M growth equity investment in Kappa Biotech, a leading contract research organization (CRO) specializing in Phase II/III clinical trials for oncology therapeutics. The investment represents a 35% ownership stake at a $515M pre-money valuation (3.2x LTM revenue, 18.5x LTM EBITDA).

INVESTMENT HIGHLIGHTS

Strong Market Position
- #4 CRO in oncology clinical trials (12% market share)
- Proprietary patient recruitment network across 85 clinical sites
- 92% trial completion rate (industry average: 78%)
- Partnerships with 8 of top 10 pharma companies

Compelling Growth Drivers
- Oncology drug pipeline: 1,200+ drugs in development (CAGR: 9.8%)
- Biotech outsourcing trend: 68% of trials now outsourced (up from 52% in 2020)
- Rare disease specialization: fastest growing segment at 15% CAGR
- Geographic expansion: EU and APAC markets underpenetrated

Attractive Financial Profile
- LTM Revenue: $162M (3-year CAGR: 38%)
- LTM EBITDA: $27.8M (17.2% margin)
- Rule of 40: 55.2% (38% growth + 17.2% margin)
- 98% revenue visibility from contracted backlog
- Negative working capital due to upfront customer deposits

FINANCIAL OVERVIEW

Historical Performance ($ millions):
                    2021    2022    2023    LTM 9/30/24
Revenue            $85.2   $117.4  $148.6   $162.3
Growth %             -      37.8%   26.5%    24.2%
Gross Margin       52.3%   54.1%   56.8%    58.2%
EBITDA            $12.1   $18.7   $25.4    $27.8
EBITDA Margin     14.2%   15.9%   17.1%    17.2%
Net Income        $6.8    $10.2   $14.3    $16.5
Active Trials       24      38      52       61

Management Projections ($ millions):
                    2025E   2026E   2027E   2028E   2029E
Revenue            $205    $267    $334    $408    $485
Growth %           26.3%   30.2%   25.1%   22.2%   18.9%
EBITDA            $39.6   $56.0   $73.8   $93.8   $113.2
EBITDA Margin     19.3%   21.0%   22.1%   23.0%   23.3%
Unlevered FCF     $32.8   $46.2   $61.5   $78.9   $95.6

USE OF PROCEEDS

Total Sources: $180M
- New equity: $180M (Phoenix Capital Partners IV)

Total Uses: $180M
- Sales expansion: $65M (EU sales team, APAC JV)
- Site network expansion: $45M (25 new clinical sites)
- Technology platform: $35M (AI patient matching, EDC system upgrade)
- M&A pipeline: $25M (bolt-on site acquisitions)
- Working capital: $10M

TRANSACTION STRUCTURE

- Investment: $180M for 35% fully diluted ownership
- Security: Series A Preferred Stock
- Valuation: $515M pre-money ($695M post-money)
- Board composition: 5 seats (2 Phoenix, 2 Founders, 1 Independent)
- Liquidation preference: 1x non-participating
- Anti-dilution: Weighted average
- Drag-along rights: > 66.7% of preferred
- Protective provisions: Standard (budget, debt, M&A, equity issuance)

MANAGEMENT TEAM

Dr. Rebecca Martinez - CEO & Co-Founder
- PhD Oncology, Stanford; 18 years clinical research experience
- Previously VP Clinical Operations at Quintiles ($8B CRO)
- Founded Kappa in 2018, grown to $162M revenue
- Owns 32% equity (22.4% post-investment)

Dr. James Park - Chief Medical Officer & Co-Founder  
- MD/PhD Harvard; board certified oncologist
- Led 40+ Phase II/III trials at major pharma
- Built Kappa's scientific advisory board (12 KOLs)
- Owns 28% equity (19.6% post-investment)

Lisa Thompson - CFO (joined 2022)
- Previously CFO at $300M healthcare services PE portfolio company
- Led successful exit to strategic at 4.2x MOIC
- CPA, MBA Wharton

INVESTMENT RISKS & MITIGATIONS

Regulatory Risk
- Risk: FDA trial delays or failures impact revenue
- Mitigation: Diversified across 15+ sponsors, 60+ trials; no single trial >8% revenue

Customer Concentration  
- Risk: Top 3 customers = 42% of revenue
- Mitigation: MSAs in place (3-5 year terms); expanding customer base (32 active sponsors)

Competition Risk
- Risk: Large CROs (Labcorp, IQVIA) could compete aggressively  
- Mitigation: Differentiated oncology focus; proprietary patient network; nimble execution

Key Person Risk
- Risk: Departure of founder management team
- Mitigation: Strong equity incentives; 4-year vesting on option refresh; management continuity agreements

Execution Risk
- Risk: International expansion complexity
- Mitigation: Phased rollout; experienced country managers hired; JV model in APAC limits capital risk

RETURN ANALYSIS

Base Case (60% probability)
- Hold period: 4.5 years
- Exit multiple: 3.8x LTM revenue (20x EBITDA)
- 2029 Revenue: $485M → Exit EV: $1,843M
- Equity value @ 35%: $645M
- MOIC: 3.6x
- IRR: 38%

Upside Case (25% probability)  
- Hold period: 4.0 years
- Exit multiple: 4.5x LTM revenue (24x EBITDA)
- Accelerated growth to $520M by 2028 → Exit EV: $2,340M
- Equity value @ 35%: $819M
- MOIC: 4.5x
- IRR: 46%

Downside Case (15% probability)
- Hold period: 5.5 years
- Exit multiple: 2.8x LTM revenue (15x EBITDA)  
- Slower growth to $380M by 2029 → Exit EV: $1,064M
- Equity value @ 35%: $372M
- MOIC: 2.1x
- IRR: 16%

Expected MOIC: 3.4x | Expected IRR: 35%

EXIT STRATEGY

Primary Path: Strategic Sale (70% probability)
- Potential acquirers: Top 5 CROs looking to expand oncology capabilities
- Recent comps: 3.5-5.0x revenue, 18-25x EBITDA
- Strategic premium for patient network and site relationships

Secondary Path: Secondary Sale to Growth PE (20% probability)
- Platform for continued M&A rollup strategy
- Recent comps: 3.0-4.0x revenue, 16-22x EBITDA

Tertiary Path: IPO (10% probability)
- Public CRO comps trade at 3.2-4.8x revenue, 18-28x EBITDA
- Would need $250M+ revenue for successful public offering

DILIGENCE FINDINGS

Financial & Tax (Deloitte): Clean; no material findings
Legal (Ropes & Gray): Standard IP assignments confirmed; clinical trial contracts reviewed
Commercial (Bain & Company): TAM sizing validated; competitive positioning confirmed  
Quality of Earnings (FTI): $1.2M in non-recurring add-backs accepted; working capital normalized
IT/Cybersecurity (Deloitte): SOC 2 Type II certified; no critical findings
Insurance (Marsh): Adequate coverage; professional liability limits appropriate

RECOMMENDATION

Investment Committee approval is recommended for a $180M growth equity investment in Kappa Biotech. The opportunity offers:

✓ Compelling value creation in high-growth oncology CRO market
✓ Proven management team with deep domain expertise  
✓ Clear use of proceeds to accelerate organic + inorganic growth
✓ Strong downside protection with contracted revenue backlog
✓ Multiple exit paths with attractive strategic buyer interest

The investment aligns with Fund IV's healthcare services thesis and target return profile (3.0x+ MOIC, 30%+ IRR).

NEXT STEPS

1. IC approval vote - November 18, 2024
2. Final negotiation of SHA and investor rights - November 20-25
3. Management presentations to IC - November 22, 2024  
4. SPA execution - December 2, 2024
5. Closing - December 13, 2024 (subject to customary conditions)

Attachments:
- Financial model (Excel)
- Management presentation  
- Diligence reports summary
- Draft term sheet`,
  },

  // 3. Due Diligence Report
  {
    filename: 'lambda-retail-dd-report.txt',
    content: `COMMERCIAL DUE DILIGENCE REPORT

Client: Phoenix Capital Partners
Target: Lambda Retail Group ("Lambda")  
Transaction: $250M Buyout
Report Date: October 28, 2024
Prepared by: McKinsey & Company

EXECUTIVE SUMMARY

Lambda Retail Group is a regional specialty retailer operating 127 stores across the Southwestern US, focused on outdoor recreation and adventure sports equipment. Our commercial diligence indicates a well-positioned business in a fragmented $18B market, with defensible competitive advantages in merchandising and customer experience. However, near-term headwinds from athletic retailer competition and e-commerce pressure warrant conservative growth assumptions.

Key Findings:
→ Differentiated product mix (55% private label vs. 15% industry avg) drives margin premium
→ NPS of 72 significantly outperforms outdoor retail average of 48  
→ Store-level economics strong: $3.2M avg store revenue, 18% EBITDA margins
→ E-commerce penetration of 12% lags competitors at 25-30%
→ Geographic footprint expansion limited by saturation in core Southwest markets

Market Opportunity: ★★★☆☆ (3/5)
Competitive Position: ★★★★☆ (4/5)
Management Quality: ★★★★☆ (4/5)  
Growth Prospects: ★★★☆☆ (3/5)
Risk Profile: ★★★☆☆ (3/5)

MARKET ASSESSMENT

Total Addressable Market
- US outdoor recreation equipment: $17.8B (2024)
- Growing at 4.2% CAGR (2020-2024)
- Segments: Camping (32%), Hiking (28%), Climbing (18%), Water sports (12%), Other (10%)
- Drivers: Outdoor participation rates +2.1% annually; premiumization trend

Serviceable Addressable Market  
- Southwest US (AZ, NM, NV, UT, CO): $3.2B
- Lambda focus on mid-premium segment ($50-300 ASP): $1.9B
- Current Lambda market share: 8.3%

Market Structure
- Highly fragmented: Top 10 players = 38% share
- REI (non-profit cooperative): 12% national share
- Dick's Sporting Goods (outdoor category): 8% share  
- Independent retailers: 42% share
- E-commerce pure plays: 18% share (growing 12% annually)

Market Trends
✓ Experiential retail gaining share (demos, classes, guided trips)
✓ Sustainability focus driving premium organic/recycled product demand
✓ Younger demographics (Gen Z) entering outdoor activities
✓ Remote work enabling mid-week outdoor participation
✗ Amazon/direct-to-consumer brands pressuring margins
✗ Consolidation risk as larger players acquire regionals
✗ Decreased mall traffic hurting co-located retailers

COMPETITIVE POSITIONING  

Competitive Landscape Analysis

National Competitors:
1. REI - Cooperative model, 180 stores, $3.5B revenue
   - Advantages: Brand strength, member loyalty, scale economics
   - Disadvantages: Bureaucratic, slower innovation, limited private label

2. Dick's Sporting Goods - Outdoor category within broader sporting goods
   - Advantages: Scale, omnichannel capabilities, marketing spend  
   - Disadvantages: Not specialized, competing priorities, generic merchandising

3. Bass Pro Shops / Cabela's - Hunting/fishing focus, destination stores
   - Advantages: Entertainment/experience, massive selection
   - Disadvantages: Hunting focus limiting to younger demographics, geographic gaps

Regional Competitors:
- Sportsman's Warehouse (90 stores, Western US)
- Scheels (31 stores, Midwest) 
- Local independents (estimated 800+ stores nationally)

E-commerce Competitors:
- Backcountry.com (acquired by TSG Consumer 2019)
- Moosejaw (acquired by Walmart 2017, sold to Dick's 2023)
- Direct brands: Cotopaxi, Allbirds, Ten Thousand

Lambda's Competitive Advantages:

1. Merchandise Differentiation (HIGH DEFENSIBILITY)
- 55% private label penetration (industry avg: 15%)
- Exclusive partnerships with 12 emerging outdoor brands  
- Curated selection (8,000 SKUs vs. REI's 25,000) reduces choice paralysis
- Local market customization (climbing gear in Moab, watersports in Lake Powell)
- Gross margin: 42.3% vs. peer average 36.5%

2. Customer Experience (MEDIUM DEFENSIBILITY)  
- Net Promoter Score: 72 (REI: 58, Dick's: 42)
- "Gear Guru" program: Expert staff (avg 8 years outdoor experience)
- In-store experiences: Weekly clinics, demo days, gear rentals
- Community partnerships: Local climbing gyms, hiking clubs, conservation groups
- Repeat customer rate: 68% vs. industry avg 52%

3. Store Format & Locations (MEDIUM DEFENSIBILITY)
- Right-sized format: 12,000 sq ft (vs. REI 25,000, Bass Pro 100,000+)
- Premium outdoor-adjacent locations (Flagstaff, Boulder, Moab, Tahoe, etc.)
- "Last stop before the trail" positioning
- Lower occupancy costs: $32/sq ft vs. REI $55/sq ft

4. Omnichannel Integration (LOW DEFENSIBILITY - BEING BUILT)  
- Mobile app: 145K downloads, 4.6 star rating
- BOPIS (buy online pickup in-store): 8% of e-comm orders
- Endless aisle (order in-store for home delivery): 3% of store revenue
- Loyalty program: 280K active members

Competitive Vulnerabilities:

1. E-commerce Capability Gap  
- Online revenue: 12% of total (peers: 25-30%)
- Digital marketing spend: 8% of revenue (peers: 12-15%)
- Site conversion rate: 1.8% (Backcountry.com: 3.2%)
- Mobile optimization issues noted in customer reviews

2. Geographic Concentration Risk
- 89% of stores in 5 states (AZ, CO, UT, NM, NV)
- Limited brand awareness outside Southwest
- Distribution center in Phoenix adds cost for potential expansion

3. Scale Disadvantages vs. National Players
- Vendor terms: 2% net 60 (REI: 5% net 90)  
- Marketing efficiency: $180 CAC (REI: $85)
- Technology investment: $2M annual IT budget (REI: $50M+)

CUSTOMER ANALYSIS

Customer Segmentation (Revenue %)

1. Core Enthusiasts (45% of revenue, 18% of customers)
- Demographics: Ages 28-45, HHI $95K+, college educated
- Behavior: Shop 8+ times/year, ASP $180, 85% repeat rate
- Products: Technical gear (climbing, backpacking, mountaineering)
- Channel: 60% in-store, 40% online
- Loyalty: NPS 82, high CLV ($4,200 over 5 years)

2. Weekend Warriors (35% of revenue, 42% of customers)  
- Demographics: Ages 35-55, HHI $75K+, families
- Behavior: Shop 3-4 times/year, ASP $145, 68% repeat rate  
- Products: Camping, hiking, casual outdoor apparel
- Channel: 75% in-store, 25% online
- Loyalty: NPS 68, moderate CLV ($1,800 over 5 years)

3. Aspirational Beginners (20% of revenue, 40% of customers)
- Demographics: Ages 22-35, HHI $55K+, urban dwellers
- Behavior: Shop 2-3 times/year, ASP $95, 45% repeat rate
- Products: Entry-level gear, athleisure, lifestyle apparel  
- Channel: 55% in-store, 45% online
- Loyalty: NPS 58, lower CLV ($650 over 5 years)

Customer Insights from Interviews (n=50)

Drivers of Store Choice:
1. Staff expertise and personalized recommendations (78%)
2. Product quality and curation (72%)
3. Convenient location on way to outdoor destinations (68%)
4. In-store experience and community events (54%)
5. Private label value proposition (48%)

Pain Points:
1. Limited e-commerce inventory vs. in-store (42%)
2. Website search and filtering issues (38%)  
3. Inconsistent loyalty program benefits (32%)
4. Out-of-stocks on popular items (28%)
5. Higher prices vs. Amazon for commodity items (24%)

Switching Risk Analysis:
- Low switching costs for commodity products (tents, sleeping bags)
- Medium switching costs for fit-dependent items (boots, apparel)
- High stickiness for customers with expertise relationship
- Loyalty program provides moderate lock-in
- Overall customer retention: 68% annually

GROWTH ASSESSMENT  

Historical Revenue Bridge ($M)

2021 Actual: $387M
+ Store count growth (net +8): +$26M
+ Same-store sales growth (+3.2%): +$12M
+ E-commerce growth (+18%): +$8M
2022 Actual: $433M

2022 Actual: $433M
+ Store count growth (net +12): +$42M
+ Same-store sales growth (+4.1%): +$18M
+ E-commerce growth (+22%): +$11M
2023 Actual: $504M

2023 Actual: $504M  
+ Store count growth (net +9): +$32M
+ Same-store sales growth (+2.8%): +$14M
+ E-commerce growth (+15%): +$9M
2024E: $559M

Three-Year Growth Drivers Ranked by Potential:

1. E-COMMERCE ACCELERATION (HIGH POTENTIAL)
Opportunity: Grow from 12% to 25% penetration over 3 years
- Site redesign and mobile optimization: +$45M revenue impact
- Digital marketing investment: +$32M revenue impact  
- Marketplace expansion (Amazon, REI): +$18M revenue impact
- Total 3-year impact: +$95M revenue
- Required investment: $15M (technology, marketing)
- Risk: Medium (execution dependent)

2. SAME-STORE SALES GROWTH (MEDIUM POTENTIAL)
Opportunity: Drive 4-5% annual comps through merchandising + experience
- Private label expansion (55% → 65%): +$28M revenue impact
- Experiential retail (clinics, rentals, events): +$22M revenue impact
- Loyalty program enhancement: +$15M revenue impact  
- Total 3-year impact: +$65M revenue
- Required investment: $8M (inventory, staffing, systems)
- Risk: Low (proven playbook)

3. NEW STORE GROWTH (MEDIUM POTENTIAL)  
Opportunity: Open 15-18 net new stores in adjacent markets
- Adjacent Southwest markets (TX, OK): 8-10 stores, +$32M revenue
- Mountain West expansion (WY, MT, ID): 5-6 stores, +$20M revenue  
- Opportunistic fill-in (existing markets): 2-3 stores, +$10M revenue
- Total 3-year impact: +$62M revenue
- Required investment: $45M (capex $2.5M/store)
- Risk: Medium (new market execution risk)

4. SERVICES & EXPERIENCES (LOW POTENTIAL)
Opportunity: Launch adjacent services for engagement + margin
- Gear rental program: +$8M revenue impact
- Guided trips and adventure travel: +$6M revenue impact
- Repair and maintenance services: +$4M revenue impact
- Total 3-year impact: +$18M revenue
- Required investment: $5M (inventory, systems, partnerships)  
- Risk: Medium (operational complexity)

Downside Scenarios & Mitigation:

Scenario 1: E-commerce Disruption Accelerates
- Risk: Amazon/DTC brands drive -200bps annual traffic decline  
- Impact: -$15M revenue annually
- Mitigation: Accelerate own e-commerce; lean into experiential differentiation

Scenario 2: Competitor Expansion in Core Markets
- Risk: REI or Dick's opens 10+ stores in Lambda markets
- Impact: -3% comp sales in overlapping markets = -$12M revenue
- Mitigation: Strengthen private label moat; double down on community

Scenario 3: Outdoor Participation Plateaus Post-COVID  
- Risk: Outdoor recreation participants decline -2% annually
- Impact: -100bps market growth vs. forecast
- Mitigation: Expand to adjacent categories (fitness, wellness, travel)

PROFITABILITY ASSESSMENT

Store-Level Economics (Average Store)

Revenue per Store: $3.24M
COGS (57.7%): ($1.87M)
Gross Profit: $1.37M (42.3% margin)

Store Operating Expenses:
- Rent & Occupancy: ($384K) - $32/sq ft for 12K sq ft
- Payroll & Benefits: ($486K) - 8 FTEs at $60K loaded
- Marketing (local): ($65K)
- Other store expenses: ($97K)
Total Store OpEx: ($1.03M) (31.7% of revenue)

Store EBITDA: $340K (10.5% margin)

Store Payback Analysis:
- New store setup cost: $2.5M (buildout $1.8M, inventory $0.5M, other $0.2M)
- Year 1 revenue: $2.1M (ramp)
- Year 1 EBITDA: $147K (7% margin)
- Year 2 revenue: $2.9M
- Year 2 EBITDA: $290K (10% margin)  
- Year 3 revenue: $3.2M (maturity)
- Year 3 EBITDA: $336K (10.5% margin)
- Payback period: 3.8 years
- 5-year IRR: 18.2%

Corporate Cost Structure

Total Corporate Overhead: $31.2M (5.6% of revenue)

Breakdown:
- Executive team & support: $8.4M
- Distribution center operations: $9.2M
- Technology & systems: $4.1M  
- Marketing & brand (national): $5.8M
- Professional services: $2.2M
- Other G&A: $1.5M

Scale Opportunities:
- Distribution center: Estimated $3M savings potential with WMS optimization
- Marketing: $2M savings potential with programmatic ad buying
- Technology: $1M savings potential with vendor consolidation  
- Professional services: $0.5M savings potential

MANAGEMENT ASSESSMENT

Leadership Team Evaluation

Michael Torres - CEO & Founder (Age 52)
- Background: Former VP Merchandising at Patagonia; founded Lambda 2012
- Strengths: Deep product knowledge; strong vendor relationships; visionary
- Development needs: E-commerce/digital; M&A experience
- Equity: 62% ownership
- Compensation: $425K base + $250K bonus (2023)
- Reference checks: "Product genius but needs digital leader as COO"
- Rating: ★★★★☆ (4/5) - Strong with support

Jennifer Kim - CFO (Age 44)  
- Background: 12 years retail finance; previously FP&A Director at Ulta Beauty
- Strengths: Financial discipline; process-oriented; growth company experience
- Development needs: Treasury/capital markets
- Equity: 3% ownership
- Compensation: $275K base + $125K bonus (2023)
- Reference checks: "Detail-oriented; built strong finance function from scratch"  
- Rating: ★★★★☆ (4/5) - Solid performer

Marcus Johnson - Chief Merchant (Age 39)
- Background: 8 years at Lambda; previously buyer at REI
- Strengths: Private label development; vendor negotiation; trend identification
- Development needs: Data analytics; category expansion
- Equity: 5% ownership  
- Compensation: $245K base + $100K bonus (2023)
- Reference checks: "Best merchant I've worked with in specialty retail"
- Rating: ★★★★★ (5/5) - Exceptional

Key Missing Roles:
1. Chief Digital Officer / Head of E-commerce (CRITICAL)
   - Required skills: E-comm P&L, digital marketing, marketplace management
   - Estimated comp: $300K base + equity
2. Chief Operating Officer (IMPORTANT)
   - Required skills: Retail operations, process improvement, scaling
   - Estimated comp: $275K base + equity
3. VP People / HR (MODERATE)
   - Current part-time HR consultant insufficient for 1,850 employees
   - Estimated comp: $200K base

Organizational Gaps:
- E-commerce team: 4 FTEs (need 12-15)
- Data analytics: 2 FTEs (need 6-8)
- Store operations support: 3 regional managers for 127 stores (need 6-7)

RISK ANALYSIS

Commercial Risks (Impact x Likelihood)

HIGH RISK:
1. E-commerce Disruption (High x High)
   - Amazon continues taking share in commodity outdoor products  
   - DTC brands build loyal following without retail overhead
   - Mitigation: Accelerate digital capabilities; lean into services/experience

2. Key Person Risk - CEO (High x Medium)
   - Founder CEO drives product strategy and vendor relationships
   - No formal succession plan in place
   - Mitigation: Build senior team; implement management continuity incentives

MEDIUM RISK:  
3. Same-Store Sales Pressure (Medium x High)
   - Outdoor participation could plateau post-COVID surge
   - Increased competition in core markets
   - Mitigation: Enhance customer experience; expand private label; drive loyalty

4. Geographic Concentration (Medium x Medium)
   - 89% of stores in Southwest; regional recession risk
   - Weather/wildfire impact on key markets
   - Mitigation: Accelerate expansion to new geographies

5. Vendor Concentration (Medium x Medium)
   - Top 5 vendors = 38% of COGS; switching cost and margin risk
   - Potential disintermediation by major brands going DTC
   - Mitigation: Accelerate private label penetration to 65%

LOW RISK:
6. Real Estate Lease Rollover (Low x Medium)  
   - 42 leases expiring 2025-2027; rent reset risk
   - Strong landlord relationships; occupancy cost already low
   - Mitigation: Proactive lease renewals; flexible store format

7. Inventory Management (Low x Low)
   - Seasonal nature of outdoor; markdown risk
   - Strong historical gross margins; experienced merchant
   - Mitigation: Data analytics for demand forecasting

RECOMMENDATIONS

Investment Thesis Validation: ★★★★☆ (4/5)

STRENGTHS:
✓ Defensible competitive position with private label and customer experience
✓ Healthy store-level economics with proven unit expansion model
✓ Experienced management team with deep domain expertise
✓ Multiple levers for value creation (e-commerce, new stores, private label)
✓ Attractive market with structural tailwinds (outdoor participation, premiumization)

CONCERNS:  
✗ E-commerce capability gap vs. competitors creates vulnerability
✗ Geographic concentration limits risk diversification
✗ Management team gaps (digital, operations) need to be filled quickly
✗ Near-term comp sales pressure from traffic headwinds

VALUE CREATION PLAN RECOMMENDATIONS:

Immediate (Months 1-6):
1. Hire Chief Digital Officer to lead e-commerce acceleration
2. Implement digital marketing stack (GA4, customer data platform, attribution)
3. Launch site redesign project with mobile-first focus  
4. Expand e-commerce team from 4 to 12 FTEs
5. Build 100-day plan for same-store sales initiatives

Near-term (Months 6-18):
6. Roll out loyalty program enhancements (tiered benefits, gamification)
7. Open 5-6 new stores in Texas market (DFW, Austin, Houston)
8. Launch gear rental pilot in 10 stores  
9. Implement warehouse management system for distribution efficiency
10. Hire COO to support operational scaling

Medium-term (Months 18-36):
11. Expand private label from 55% to 65% penetration
12. Launch marketplace strategy (Amazon, REI, brand partnerships)
13. Open 10-12 additional stores (Texas, Mountain West)
14. Build experiential retail playbook (demos, clinics, community events)
15. Evaluate M&A targets for geographic expansion or capability acquisition

CONCLUSION

Lambda Retail Group represents a compelling investment opportunity in the growing outdoor retail market. The business has built a defensible competitive position through merchandising differentiation and customer experience, with multiple levers to drive growth and margin expansion.

The commercial opportunity is strong (4/5) with clear path to $750M+ revenue in 5 years through e-commerce acceleration, new store growth, and same-store sales initiatives. However, near-term execution risk around digital capabilities and management team buildout warrant close involvement in the first 12-18 months post-acquisition.

We recommend proceeding with the investment subject to:
1. CEO agreement to hire Chief Digital Officer (retained search launched pre-close)
2. Management equity rollovers sufficient to maintain alignment (minimum 25%)
3. Covenant flexibility in financing to support new store growth and e-commerce investment

Expected returns are within target range for the fund (3.0-4.0x MOIC, 25-35% IRR) across conservative to base case scenarios.`,
  },

  // 4. Term Sheet
  {
    filename: 'sigma-fintech-termsheet.txt',
    content: `NON-BINDING TERM SHEET

Sigma Financial Technologies, Inc.
Series B Preferred Stock Financing

Date: November 1, 2024

This term sheet summarizes the principal terms of the proposed Series B Preferred Stock financing of Sigma Financial Technologies, Inc. (the "Company"). This term sheet is for discussion purposes only and does not constitute a legally binding commitment. Binding obligations will only result from the execution of definitive agreements.

OFFERING TERMS

Issuer:                     Sigma Financial Technologies, Inc. (Delaware C-Corp)

Investors:                  Phoenix Ventures Fund III, L.P. ("Lead Investor")
                           Existing investors pro-rata participation rights

Amount:                     $35,000,000

Security:                   Series B Preferred Stock ("Series B")

Pre-Money Valuation:        $115,000,000  

Post-Money Valuation:       $150,000,000

Price Per Share:            $2.1739 (based on 68,950,000 shares outstanding pre-financing)

Closing Date:               On or before December 20, 2024

CAPITALIZATION

                                    Shares              %           
Common Stock:                       55,000,000         36.7%
Series A Preferred:                 13,950,000          9.3%
Employee Option Pool (reserved):    10,000,000          6.7%
Series B Preferred (new):           16,100,000         10.7%
Post-Series B Option Pool:          15,000,000         10.0%
FULLY DILUTED:                     110,050,000        100.0%

DIVIDEND PROVISIONS

Dividends on Series B will accrue at 8% per annum on a non-cumulative basis, payable when and if declared by the Board. Dividends on Series A will continue at 6% per annum. Common stock may receive dividends only after Series B and Series A preferred dividends are paid in full.

LIQUIDATION PREFERENCE

In a liquidation event (merger, acquisition, sale of substantially all assets, or winding up):

Senior Liquidation Preference (distributed in order):
1. Series B holders receive 1.5x original purchase price ($52.5M) plus accrued but unpaid dividends
2. Series A holders receive 1.0x original purchase price ($30.3M) plus accrued but unpaid dividends
3. Remaining proceeds distributed pro-rata among all stockholders on an as-converted basis

Participating Rights: Series B participates pro-rata with common after receiving liquidation preference. Series A is non-participating.

Cap on Participation: Series B participation capped at 3x original purchase price total return.

Deemed Liquidation: Any merger, acquisition, or sale of >50% of voting power is treated as liquidation event, subject to approval of holders of majority of Series B.

CONVERSION

Each share of Series B converts into Common at any time at holder's option. Initial conversion ratio is 1:1, subject to anti-dilution adjustments.

Automatic conversion upon (i) qualified IPO with $200M+ valuation and $50M+ gross proceeds, or (ii) written consent of holders of 66.7% of Series B.

ANTI-DILUTION PROTECTION

Series B: Weighted average anti-dilution protection for dilutive issuances below Series B price.

Series A: Existing weighted average anti-dilution protection continues.

Standard carve-outs apply: employee option pool issuances, stock splits, dividends, strategic partnerships approved by Board, equipment leasing, acquisitions approved by Board.

VOTING RIGHTS

Series B votes with Common on an as-converted basis on all matters except as required by law or these terms.

Board composition: 7 seats
- 2 seats: Series B designees (Phoenix Ventures)  
- 1 seat: Series A designee (Accel Partners)
- 2 seats: Common designees (CEO + Founder)
- 2 seats: Independent directors mutually agreed

Board observer rights: Each investor holding >10% has observer rights.

PROTECTIVE PROVISIONS

Series B consent (majority) required for:
- Amendments to Certificate or Bylaws adversely affecting Series B
- Issuance of stock senior to or pari passu with Series B
- Redemption or repurchase of stock (except employee buybacks per plan)
- Declaration of dividends on Common
- Incurrence of debt >$5M (excluding equipment leasing)
- Sale, exclusive license, or transfer of material IP
- Related party transactions >$250K
- Annual operating budget and material amendments
- Hiring or termination of CEO
- Company acquisition, merger, or sale of substantial assets
- Transactions outside ordinary course >$3M

Series A existing protective provisions continue for matters affecting Series A.

DRAG-ALONG RIGHTS

Holders of >66.7% of Preferred (voting together) + Common Board designees may require all stockholders to approve Company sale or deemed liquidation on same terms.

Carve-outs: Requires at least 1x return to Common on as-converted basis.

INFORMATION RIGHTS

Investors holding >5% receive:
- Monthly financial statements (unaudited) within 15 days of month-end
- Quarterly financial statements (unaudited) within 30 days of quarter-end  
- Annual financial statements (audited) within 90 days of year-end
- Annual operating budget at least 30 days before fiscal year start
- Prompt notice of material events

Rights terminate upon IPO or acquisition.

REGISTRATION RIGHTS

Demand Rights: Series B holders with >33% of Series B may require registration of shares on two occasions, provided anticipated aggregate offering >$15M.

S-3 Rights: Holders of >10% may require up to two S-3 registrations per year if available, with $5M minimum.

Piggyback Rights: Pro-rata participation in Company-initiated registrations.

Lock-up: 180 days post-IPO; officers/directors lock-up on same terms.

Standard provisions regarding expenses, indemnification, underwriting arrangements.

PRO-RATA RIGHTS

Major Investors (holders of >5% on as-converted basis) have pro-rata right to participate in future equity financings to maintain ownership percentage.

Carry-forward rights if not fully exercised.

RIGHT OF FIRST REFUSAL / CO-SALE

Company and then Major Investors have ROFR on proposed transfers of Common by Founders.

Co-sale rights allow Major Investors to participate pro-rata in Founder transfers not purchased via ROFR.

Standard exclusions: estate planning, employee transfers per plan, transfers to affiliates.

Rights terminate upon IPO.

REDEMPTION

Series B holders may elect redemption starting 7 years after Series B closing. Redemption in three annual installments at original purchase price plus accrued dividends. Company may prepay at any time without penalty.

EMPLOYEE OPTION POOL

Post-Series B option pool of 15M shares (13.6% fully diluted). Pool created prior to Series B pricing. 

Standard 4-year vesting with 1-year cliff for new grants.

Acceleration provisions: 50% vesting on Company sale if terminated without cause within 12 months; 100% for CEO on sale.

FOUNDER VESTING

Founders' unvested shares subject to repurchase by Company at cost if terminated for cause or resign without good reason. 

Existing vesting schedules: 
- CEO (Sarah Park): 75% vested, remainder vests quarterly through June 2026
- CTO (Alex Chen): 60% vested, remainder vests quarterly through March 2027

Accelerated vesting: 50% of unvested shares vest on Company sale if Founder terminated without cause within 12 months; 100% for CEO.

NO-SHOP / CONFIDENTIALITY

Company agrees to 45-day exclusivity period from term sheet execution (through December 15, 2024).

Company will not solicit or engage in discussions with other investors regarding equity financing during exclusivity.

Terms of this financing are confidential, subject to standard exceptions.

CONDITIONS TO CLOSING

- Execution of definitive Stock Purchase Agreement, Amended & Restated Certificate of Incorporation, Amended & Restated Investors' Rights Agreement, Right of First Refusal & Co-Sale Agreement, and Voting Agreement
- Satisfactory completion of legal, financial, technical, and commercial due diligence  
- No Material Adverse Change in business, operations, or financial condition
- Key employee retention agreements executed (CEO, CTO, CFO, VP Eng)
- Qualification of shares under applicable securities laws
- Board approval and stockholder approval (as required)
- Existing Series A investors waiving any ROFR or preemptive rights or participating pro-rata

EXPENSES

Company will pay Lead Investor's reasonable legal fees and expenses up to $75,000 upon closing.

If transaction does not close due to Company breach or termination without cause, Company will reimburse up to $50,000 in investor legal fees.

USE OF PROCEEDS

Estimated allocation of $35M:
- Product development (payments platform v2.0): $12M
- Sales & marketing (enterprise go-to-market): $10M  
- International expansion (UK, EU): $6M
- Working capital & general corporate purposes: $5M
- Strategic hires (VP Sales, VP Product, Head of Intl): $2M

BUSINESS OVERVIEW

Company: Sigma Financial Technologies, Inc.
Founded: 2019
Headquarters: Austin, TX
Employees: 127

Description: B2B payments automation platform for mid-market companies. SaaS model with usage-based pricing. Integrates with ERPs (NetSuite, SAP, QuickBooks) to automate invoice processing, payment execution, and reconciliation.

Metrics (as of Q3 2024):
- ARR: $18.2M (growing 140% YoY)  
- Customers: 312 (avg 28 employees, $1.5B+ annual revenue)
- Gross Margin: 78%
- Net Dollar Retention: 135%
- Magic Number: 1.2
- Burn Rate: $1.8M/month
- Cash Balance: $4.2M (2.3 months runway)

Management Team:
- Sarah Park, CEO (ex-Stripe, Stanford CS)
- Alex Chen, CTO (ex-Square, MIT)
- Maria Rodriguez, CFO (ex-Brex, Wharton MBA)

---

LEAD INVESTOR:                          COMPANY:

Phoenix Ventures Fund III, L.P.         Sigma Financial Technologies, Inc.

By: _____________________________        By: _____________________________
Name: David Liu                          Name: Sarah Park
Title: Managing Partner                 Title: Chief Executive Officer
Date: November 1, 2024                  Date: _______________`,
  },
];

documents.forEach(doc => {
  const filepath = path.join(testDataDir, doc.filename);
  fs.writeFileSync(filepath, doc.content, 'utf8');
  console.log(`✅ Created: ${doc.filename} (${doc.content.length} chars)`);
});

console.log(`\n✅ Generated ${documents.length} diverse PE documents in test-data/`);
console.log(`\nDocument types:`);
console.log(`- CSV: Financial data (quarterly results)`);
console.log(`- TXT: Investment committee memo`);
console.log(`- TXT: Commercial due diligence report`);
console.log(`- TXT: Term sheet`);
