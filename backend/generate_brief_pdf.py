import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

def generate_pdf():
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'NutriLens_Design_Brief.pdf'))
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=32,
        bottomMargin=32
    )
    
    styles = getSampleStyleSheet()
    
    primary_color = colors.HexColor('#059669')
    dark_slate = colors.HexColor('#0F172A')
    text_muted = colors.HexColor('#475569')
    card_bg = colors.HexColor('#F8FAFC')
    border_color = colors.HexColor('#E2E8F0')
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceAfter=2
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=dark_slate,
        spaceAfter=8
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=primary_color,
        spaceBefore=7,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=dark_slate
    )
    
    bullet_title = ParagraphStyle(
        'BulletTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12.5,
        textColor=dark_slate
    )
    
    bullet_desc = ParagraphStyle(
        'BulletDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=text_muted
    )

    story = []
    
    # Title & Subtitle
    story.append(Paragraph("PRODUCT BRIEF: NUTRILENS LAUNCH FLYER", title_style))
    story.append(Paragraph("Creative & Messaging Guidelines for Flyer Design", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=8))
    
    # 1. Project Overview
    story.append(Paragraph("1. Project Overview", section_heading))
    overview_data = [
        [Paragraph("<b>Product Name:</b>", body_style), Paragraph("NutriLens", body_style)],
        [Paragraph("<b>Tagline:</b>", body_style), Paragraph("<b>Eat well, Spend wise</b>", body_style)],
        [Paragraph("<b>Website:</b>", body_style), Paragraph("<b>nutrilens.site</b>", body_style)],
    ]
    t_overview = Table(overview_data, colWidths=[110, 420])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_overview)
    
    # 2. Product Summary
    story.append(Paragraph("2. Product Summary", section_heading))
    summary_text = (
        "<b>NutriLens</b> is an AI-powered food and meal companion that helps people eat healthy, "
        "balanced meals without stretching their budget. Instead of rigid diet restrictions or complicated calorie counting, "
        "NutriLens helps users understand their everyday home-cooked meals in simple, relatable language and builds realistic "
        "meal plans that match their exact food budget."
    )
    story.append(Paragraph(summary_text, body_style))
    
    # 3. Brand Colors
    story.append(Paragraph("3. Brand Colors", section_heading))
    colors_data = [
        [
            Paragraph("<b>Primary:</b> Emerald Green (<code>#059669</code> / <code>#10B981</code>)<br/><font color='#475569'>Freshness, wellness, smart growth</font>", body_style),
            Paragraph("<b>Accents:</b> Mint Teal (<code>#14B8A6</code>), Crisp White (<code>#FFFFFF</code>), Dark Slate (<code>#0F172A</code>)<br/><font color='#475569'>Clean contrast & high readability</font>", body_style)
        ]
    ]
    t_colors = Table(colors_data, colWidths=[265, 265])
    t_colors.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_colors)
    
    # 4. Core Features & What to Highlight
    story.append(Paragraph("4. Core Features & What to Highlight", section_heading))
    features = [
        ("Budget-Smart Meal Planning", "Creates personalized daily and weekly meal plans based on the user's spending budget using accessible, affordable local market ingredients."),
        ("Snap & Understand (Instant Food Insights)", "Users snap a photo of any meal (including cultural/local dishes) and get an immediate breakdown in clear, familiar, everyday language so they easily know what their food gives them."),
        ("Step-by-Step AI Cooking Assistant", "Interactive cooking guidance that walks users through preparing balanced, delicious meals at home with what they have."),
        ("Personalized to Your Health & Lifestyle", "Tailors suggestions to the user's age group, dietary preferences, and specific health goals.")
    ]
    for title, desc in features:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", body_style))
        story.append(Spacer(1, 2))
        
    # 5. Flyer Text / Content to Display
    story.append(Paragraph("5. Flyer Text / Content to Display", section_heading))
    content_box = [
        [Paragraph("<b>Logo:</b> NutriLens", body_style)],
        [Paragraph("<b>Headline:</b> Eat well, Spend wise", body_style)],
        [Paragraph("<b>Subtext:</b> Smart AI meal planning tailored to your wallet and everyday food insights you can actually understand.", body_style)],
        [Paragraph("<b>Key Points:</b><br/>"
                   "• <b>Budget-First Meal Plans:</b> Eat nutritious meals designed to fit your exact food budget.<br/>"
                   "• <b>Snap & Know Your Plate:</b> Understand your food in simple, everyday language.<br/>"
                   "• <b>Guided Home Cooking:</b> Step-by-step directions to cook balanced, delicious meals easily.", body_style)],
        [Paragraph("<b>Web Link:</b> nutrilens.site", body_style)]
    ]
    t_content = Table(content_box, colWidths=[530])
    t_content.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ECFDF5')),
        ('BOX', (0,0), (-1,-1), 1.2, primary_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_content)
    
    doc.build(story)
    print(f"PDF successfully generated at: {pdf_path}")

if __name__ == '__main__':
    generate_pdf()
