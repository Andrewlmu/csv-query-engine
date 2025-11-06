#!/usr/bin/env python3
"""
Create a sample PDF from deal memo text for testing Reducto
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def create_pe_deal_memo_pdf():
    # Create PDF
    pdf_file = "test-data/sample-deal-memo.pdf"
    doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)

    # Container for the 'Flowable' objects
    elements = []

    # Define styles
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor='darkblue',
        spaceAfter=30,
        alignment=TA_CENTER,
        bold=True
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor='darkred',
        spaceAfter=12,
        spaceBefore=12,
        bold=True
    )

    normal_style = styles["BodyText"]
    normal_style.alignment = TA_LEFT

    # Title
    elements.append(Paragraph("CONFIDENTIAL - DEAL MEMORANDUM", title_style))
    elements.append(Spacer(1, 0.2*inch))

    # Executive Summary
    elements.append(Paragraph("EXECUTIVE SUMMARY", heading_style))
    elements.append(Paragraph(
        """Titan Capital Partners proposes to acquire 100% of ACME Manufacturing Corp for an
        enterprise value of $450 million. ACME is a leading manufacturer of industrial
        components with strong market position and consistent cash flows.""",
        normal_style
    ))
    elements.append(Spacer(1, 0.2*inch))

    # Key Metrics
    elements.append(Paragraph("KEY METRICS", heading_style))
    elements.append(Paragraph("• Enterprise Value: $450M", normal_style))
    elements.append(Paragraph("• Equity Investment: $180M (40%)", normal_style))
    elements.append(Paragraph("• Debt Financing: $270M (60%)", normal_style))
    elements.append(Paragraph("• Entry Multiple: 8.5x LTM EBITDA", normal_style))
    elements.append(Paragraph("• Current EBITDA: $53M", normal_style))
    elements.append(Spacer(1, 0.2*inch))

    # Financial Projections
    elements.append(Paragraph("FINANCIAL PROJECTIONS", heading_style))
    elements.append(Paragraph("Year 1: Revenue $340M, EBITDA $72M (22.4% margin)", normal_style))
    elements.append(Paragraph("Year 2: Revenue $385M, EBITDA $85M (22.1% margin)", normal_style))
    elements.append(Paragraph("Year 3: Revenue $440M, EBITDA $101M (23.0% margin)", normal_style))
    elements.append(Paragraph("Year 4: Revenue $510M, EBITDA $122M (23.9% margin)", normal_style))
    elements.append(Paragraph("Year 5: Revenue $595M, EBITDA $149M (25.0% margin)", normal_style))
    elements.append(Spacer(1, 0.2*inch))

    # Exit Strategy
    elements.append(Paragraph("EXIT STRATEGY", heading_style))
    elements.append(Paragraph("Target exit multiple: 8.5x EBITDA", normal_style))
    elements.append(Paragraph("Projected exit value: $1,267M (at Year 5 EBITDA)", normal_style))
    elements.append(Paragraph("Expected return: 3.5x MOIC, 28% IRR", normal_style))
    elements.append(Spacer(1, 0.2*inch))

    # Risk Factors
    elements.append(Paragraph("RISK FACTORS", heading_style))
    elements.append(Paragraph(
        """• Customer concentration (top 3 customers = 45% revenue)<br/>
        • Competitive pressure from low-cost overseas manufacturers<br/>
        • Raw material price volatility (steel, aluminum)<br/>
        • Dependency on automotive sector (35% of revenue)<br/>
        • Key personnel retention post-acquisition""",
        normal_style
    ))
    elements.append(Spacer(1, 0.2*inch))

    # Value Creation Plan
    elements.append(Paragraph("VALUE CREATION PLAN", heading_style))
    elements.append(Paragraph("1. Operational Excellence", normal_style))
    elements.append(Paragraph("   - Implement lean manufacturing (target: 15% OPEX reduction)", normal_style))
    elements.append(Paragraph("   - Upgrade ERP system for better inventory management", normal_style))
    elements.append(Paragraph("   - Consolidate 3 facilities into 2 modern plants", normal_style))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph("2. Revenue Growth", normal_style))
    elements.append(Paragraph("   - Expand into aerospace sector (high-margin, stable)", normal_style))
    elements.append(Paragraph("   - Launch e-commerce channel for smaller customers", normal_style))
    elements.append(Paragraph("   - Geographic expansion: Southeast US and Mexico", normal_style))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph("3. M&A Strategy", normal_style))
    elements.append(Paragraph("   - Acquire 2-3 complementary manufacturers", normal_style))
    elements.append(Paragraph("   - Budget: $50-75M for bolt-on acquisitions", normal_style))

    # Page break
    elements.append(PageBreak())

    # Management Team
    elements.append(Paragraph("MANAGEMENT TEAM", heading_style))
    elements.append(Paragraph(
        """CEO: John Smith (retained, 15 years experience)<br/>
        CFO: Sarah Johnson (new hire, ex-Big 4)<br/>
        COO: Mike Williams (promoted internally)<br/>
        VP Sales: Lisa Brown (retained, 20 years)<br/>
        VP Operations: David Lee (new hire, lean manufacturing expert)""",
        normal_style
    ))
    elements.append(Spacer(1, 0.2*inch))

    # Due Diligence Summary
    elements.append(Paragraph("DUE DILIGENCE SUMMARY", heading_style))
    elements.append(Paragraph("Financial: Clean audit, no material issues", normal_style))
    elements.append(Paragraph("Legal: One minor ongoing lawsuit, well-reserved", normal_style))
    elements.append(Paragraph("Environmental: All facilities compliant, no contamination", normal_style))
    elements.append(Paragraph("Commercial: Strong customer relationships, no major churn risk", normal_style))
    elements.append(Paragraph("IT: Legacy systems, modernization needed (budgeted)", normal_style))

    # Build PDF
    doc.build(elements)
    print(f"✅ Created PDF: {pdf_file}")
    print(f"   Size: {len(open(pdf_file, 'rb').read())} bytes")
    print("   This PDF has:")
    print("   - Multiple sections with headings")
    print("   - Financial data in structured format")
    print("   - Risk factors section")
    print("   - Hierarchical structure (perfect for testing!)")

if __name__ == "__main__":
    create_pe_deal_memo_pdf()
