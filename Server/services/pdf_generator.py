from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import io


def create_question_paper_pdf(paper: dict) -> bytes:
    """Generate a formatted question paper PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=16,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
        spaceAfter=6,
        textColor=colors.HexColor("#1a1a2e"),
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica",
        alignment=TA_CENTER,
        spaceAfter=4,
        textColor=colors.HexColor("#333333"),
    )
    section_style = ParagraphStyle(
        "Section",
        parent=styles["Heading2"],
        fontSize=12,
        fontName="Helvetica-Bold",
        spaceBefore=12,
        spaceAfter=4,
        textColor=colors.HexColor("#1a1a2e"),
    )
    instruction_style = ParagraphStyle(
        "Instruction",
        parent=styles["Normal"],
        fontSize=9,
        fontName="Helvetica-Oblique",
        spaceAfter=2,
        textColor=colors.HexColor("#555555"),
    )
    question_style = ParagraphStyle(
        "Question",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        spaceAfter=8,
        spaceBefore=4,
        leading=14,
        alignment=TA_JUSTIFY,
    )

    story = []

    # Title
    story.append(Paragraph(paper.get("title", "Question Paper"), title_style))
    story.append(Paragraph(f"Subject: {paper.get('subject', '')}", subtitle_style))
    
    # Meta info table
    meta_data = [
        [
            Paragraph(f"<b>Total Marks:</b> {paper.get('total_marks', '')}", styles["Normal"]),
            Paragraph(f"<b>Duration:</b> {paper.get('duration', '')}", styles["Normal"]),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[8 * cm, 8 * cm])
    meta_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1a1a2e")))
    story.append(Spacer(1, 0.3 * cm))

    # General Instructions
    instructions = paper.get("general_instructions", [])
    if instructions:
        story.append(Paragraph("General Instructions:", section_style))
        for i, instr in enumerate(instructions, 1):
            story.append(Paragraph(f"{i}. {instr}", instruction_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cccccc")))
        story.append(Spacer(1, 0.3 * cm))

    # Sections
    for section in paper.get("sections", []):
        story.append(Paragraph(
            f"{section.get('name', 'Section')} (Total Marks: {section.get('total_marks', '')})",
            section_style
        ))
        if section.get("instructions"):
            story.append(Paragraph(section["instructions"], instruction_style))
        story.append(Spacer(1, 0.2 * cm))

        for q in section.get("questions", []):
            q_text = f"<b>Q{q.get('number', '')}.</b> {q.get('question', '')} <b>[{q.get('marks', '')} Mark{'s' if q.get('marks', 1) > 1 else ''}]</b>"
            story.append(Paragraph(q_text, question_style))

        story.append(Spacer(1, 0.3 * cm))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def create_answer_pdf(answer_set: dict, paper_title: str = "") -> bytes:
    """Generate a formatted Q&A PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontSize=16,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
        spaceAfter=6,
        textColor=colors.HexColor("#1a1a2e"),
    )
    question_style = ParagraphStyle(
        "Question",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica-Bold",
        spaceBefore=12,
        spaceAfter=4,
        textColor=colors.HexColor("#1a1a2e"),
        leading=14,
    )
    answer_style = ParagraphStyle(
        "Answer",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        spaceAfter=6,
        leftIndent=20,
        leading=15,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor("#222222"),
    )

    story = []

    story.append(Paragraph(f"{paper_title} — Answer Key", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1a1a2e")))
    story.append(Spacer(1, 0.4 * cm))

    for aq in answer_set.get("answered_questions", []):
        q_text = f"Q{aq.get('number', '')}. {aq.get('question', '')} [{aq.get('marks', '')} Mark{'s' if aq.get('marks', 1) > 1 else ''}]"
        story.append(Paragraph(q_text, question_style))
        
        answer_text = aq.get("answer", "").replace("\n", "<br/>")
        story.append(Paragraph(f"<b>Answer:</b> {answer_text}", answer_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#dddddd")))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
