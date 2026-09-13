"""
BidRakshak PDF Report Generation Service

Uses ReportLab to generate professional compliance reports.
"""
import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)


def generate_compliance_report(report_data: dict) -> bytes:
    """Generate a professional PDF compliance report."""
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=22,
        spaceAfter=6,
        textColor=colors.HexColor("#1e3a5f"),
        alignment=1
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        spaceAfter=20,
        textColor=colors.HexColor("#64748b"),
        alignment=1
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=14,
        spaceBefore=16,
        spaceAfter=8,
        textColor=colors.HexColor("#1e3a5f")
    )

    body_style = ParagraphStyle(
        "BodyText",
        parent=styles["Normal"],
        fontSize=10,
        spaceAfter=6,
        leading=14
    )

    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.HexColor("#94a3b8"),
        alignment=1,
        spaceBefore=12
    )

    elements = []

    # ── Cover ────────────────────────────────────
    elements.append(Spacer(1, 30 * mm))
    elements.append(Paragraph("BidRakshak", title_style))
    elements.append(Paragraph(
        "Bid Compliance Verification Report",
        subtitle_style
    ))
    elements.append(Spacer(1, 10 * mm))

    elements.append(HRFlowable(
        width="80%", thickness=1,
        color=colors.HexColor("#cbd5e1"),
        spaceAfter=10
    ))

    cover_data = [
        ["Tender Reference", report_data.get("tender_number", "")],
        ["Tender Title", report_data.get("tender_title", "")],
        ["Bidder", report_data.get("bidder_name", "")],
        ["Generated", datetime.utcnow().strftime("%d %B %Y, %H:%M UTC")],
    ]

    cover_table = Table(cover_data, colWidths=[50 * mm, 100 * mm])
    cover_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#475569")),
        ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#1e293b")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))

    elements.append(cover_table)
    elements.append(Spacer(1, 15 * mm))

    elements.append(Paragraph(
        "FICTIONAL DEMONSTRATION — NOT AN ACTUAL GOVERNMENT TENDER",
        disclaimer_style
    ))
    elements.append(Paragraph(
        "This report was generated using deterministic demo intelligence for the "
        "Smart India Hackathon 2026 demonstration. It does not represent an "
        "actual procurement evaluation.",
        disclaimer_style
    ))

    elements.append(PageBreak())

    # ── Executive Summary ────────────────────────
    elements.append(Paragraph("Executive Summary", heading_style))

    total = report_data.get("total_requirements", 0)
    pass_count = report_data.get("pass_count", 0)
    fail_count = report_data.get("fail_count", 0)
    missing = report_data.get("missing_count", 0)
    review = report_data.get("review_count", 0)
    compliance = report_data.get("compliance_percentage", 0)

    summary_text = (
        f"BidRakshak analyzed {total} tender requirements for "
        f"<b>{report_data.get('tender_title', '')}</b> "
        f"({report_data.get('tender_number', '')}). "
        f"The bid submission by <b>{report_data.get('bidder_name', '')}</b> "
        f"achieved an overall compliance score of <b>{compliance:.0f}%</b>."
    )
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 5 * mm))

    summary_data = [
        ["Metric", "Count"],
        ["Total Requirements", str(total)],
        ["Pass", str(pass_count)],
        ["Fail", str(fail_count)],
        ["Missing", str(missing)],
        ["Review Required", str(review)],
        ["Compliance", f"{compliance:.0f}%"],
    ]

    summary_table = Table(summary_data, colWidths=[80 * mm, 40 * mm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [
            colors.white, colors.HexColor("#f8fafc")
        ]),
    ]))
    elements.append(summary_table)

    # ── Risk Summary ─────────────────────────────
    elements.append(Spacer(1, 8 * mm))
    elements.append(Paragraph("Risk Summary", heading_style))

    risk_data = [
        ["Priority", "Count"],
        ["High", str(report_data.get("high_priority", 0))],
        ["Medium", str(report_data.get("medium_priority", 0))],
        ["Low", str(report_data.get("low_priority", 0))],
    ]

    risk_table = Table(risk_data, colWidths=[80 * mm, 40 * mm])
    risk_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7c2d12")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [
            colors.white, colors.HexColor("#fef2f2")
        ]),
    ]))
    elements.append(risk_table)

    elements.append(PageBreak())

    # ── Detailed Compliance Results ──────────────
    elements.append(Paragraph(
        "Detailed Compliance Results", heading_style
    ))

    requirements = report_data.get("requirements", [])
    if requirements:
        detail_header = ["Code", "Requirement", "Category", "Status"]
        detail_rows = [detail_header]

        for req in requirements:
            code = req.get("requirement_code", "")
            title = req.get("title", "")
            if len(title) > 45:
                title = title[:42] + "..."
            cat = req.get("category", "")
            status = req.get("compliance_status", "")
            detail_rows.append([code, title, cat, status])

        detail_table = Table(
            detail_rows,
            colWidths=[22 * mm, 75 * mm, 30 * mm, 30 * mm]
        )

        detail_style_cmds = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [
                colors.white, colors.HexColor("#f8fafc")
            ]),
        ]

        # Color-code status cells
        status_colors = {
            "PASS": colors.HexColor("#166534"),
            "FAIL": colors.HexColor("#991b1b"),
            "MISSING": colors.HexColor("#92400e"),
            "REVIEW_REQUIRED": colors.HexColor("#1e40af"),
        }

        for row_idx in range(1, len(detail_rows)):
            status_val = detail_rows[row_idx][3]
            color = status_colors.get(status_val, colors.black)
            detail_style_cmds.append(
                ("TEXTCOLOR", (3, row_idx), (3, row_idx), color)
            )
            detail_style_cmds.append(
                ("FONTNAME", (3, row_idx), (3, row_idx), "Helvetica-Bold")
            )

        detail_table.setStyle(TableStyle(detail_style_cmds))
        elements.append(detail_table)

    elements.append(PageBreak())

    # ── Non-Pass Findings ────────────────────────
    non_pass = report_data.get("non_pass_requirements", [])
    if non_pass:
        elements.append(Paragraph(
            "Findings Requiring Attention", heading_style
        ))

        for req in non_pass:
            code = req.get("requirement_code", "")
            title = req.get("title", "")
            status = req.get("compliance_status", "")
            assessment = req.get("assessment", "No assessment available.")
            evidence_status = req.get("evidence_status", "NOT_FOUND")

            elements.append(Paragraph(
                f"<b>{code} — {title}</b> [{status}]",
                ParagraphStyle(
                    "FindingTitle",
                    parent=body_style,
                    fontSize=10,
                    spaceBefore=10,
                    textColor=colors.HexColor("#1e293b")
                )
            ))

            elements.append(Paragraph(
                f"Evidence: {evidence_status} | "
                f"Assessment: {assessment or 'N/A'}",
                ParagraphStyle(
                    "FindingBody",
                    parent=body_style,
                    fontSize=9,
                    textColor=colors.HexColor("#475569")
                )
            ))

            elements.append(HRFlowable(
                width="100%", thickness=0.5,
                color=colors.HexColor("#e2e8f0"),
                spaceBefore=4, spaceAfter=4
            ))

    # ── Officer Decisions ────────────────────────
    officer_decisions = report_data.get("officer_decisions", [])
    if officer_decisions:
        elements.append(PageBreak())
        elements.append(Paragraph(
            "Officer Review Decisions", heading_style
        ))

        for decision in officer_decisions:
            req_code = decision.get("requirement_code", "")
            req_title = decision.get("requirement_title", "")
            original = decision.get("original_status", "")
            officer = decision.get("officer_decision", "")
            comment = decision.get("comment", "")

            elements.append(Paragraph(
                f"<b>{req_code} — {req_title}</b>",
                ParagraphStyle(
                    "DecisionTitle",
                    parent=body_style,
                    fontSize=10,
                    spaceBefore=8
                )
            ))

            elements.append(Paragraph(
                f"Original: {original} → Officer Decision: <b>{officer}</b>",
                body_style
            ))

            if comment:
                elements.append(Paragraph(
                    f"Comment: {comment}",
                    ParagraphStyle(
                        "Comment",
                        parent=body_style,
                        fontSize=9,
                        textColor=colors.HexColor("#64748b"),
                        leftIndent=10
                    )
                ))

            elements.append(HRFlowable(
                width="100%", thickness=0.5,
                color=colors.HexColor("#e2e8f0"),
                spaceBefore=4, spaceAfter=4
            ))

    # ── Disclaimer Footer ────────────────────────
    elements.append(Spacer(1, 15 * mm))
    elements.append(HRFlowable(
        width="100%", thickness=1,
        color=colors.HexColor("#cbd5e1"),
        spaceAfter=8
    ))
    elements.append(Paragraph(
        "FICTIONAL DEMONSTRATION — NOT AN ACTUAL GOVERNMENT TENDER",
        ParagraphStyle(
            "FinalDisclaimer",
            parent=disclaimer_style,
            fontSize=9,
            textColor=colors.HexColor("#dc2626"),
            spaceBefore=4
        )
    ))
    elements.append(Paragraph(
        "This report is generated by BidRakshak, an AI-assisted bid compliance "
        "verification prototype built for Smart India Hackathon 2026 by Team Null Theory. "
        "Compliance results are produced using deterministic demo intelligence "
        "and do not represent actual AI analysis of real procurement documents.",
        disclaimer_style
    ))
    elements.append(Paragraph(
        f"Report generated at {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} "
        f"| BidRakshak v0.1.0",
        disclaimer_style
    ))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return pdf_bytes
