"""
BidRakshak Document Processing Service

Uses PyMuPDF (pymupdf) for PDF text extraction and metadata.
"""
import os


def extract_pdf_metadata(file_path: str) -> dict:
    """Extract page count and basic metadata from a PDF file."""
    try:
        import pymupdf
    except ImportError:
        import fitz as pymupdf

    result = {
        "page_count": 0,
        "title": "",
        "author": "",
        "pages": []
    }

    if not os.path.exists(file_path):
        return result

    try:
        doc = pymupdf.open(file_path)
        result["page_count"] = len(doc)
        metadata = doc.metadata or {}
        result["title"] = metadata.get("title", "")
        result["author"] = metadata.get("author", "")

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            result["pages"].append({
                "page_number": page_num + 1,
                "text": text,
                "char_count": len(text)
            })

        doc.close()
    except Exception:
        pass

    return result


def extract_page_text(file_path: str, page_number: int) -> str:
    """Extract text from a specific page of a PDF."""
    try:
        import pymupdf
    except ImportError:
        import fitz as pymupdf

    if not os.path.exists(file_path):
        return ""

    try:
        doc = pymupdf.open(file_path)
        if page_number < 1 or page_number > len(doc):
            doc.close()
            return ""

        page = doc[page_number - 1]
        text = page.get_text()
        doc.close()
        return text
    except Exception:
        return ""


def get_page_count(file_path: str) -> int:
    """Get the page count of a PDF file."""
    try:
        import pymupdf
    except ImportError:
        import fitz as pymupdf

    if not os.path.exists(file_path):
        return 0

    try:
        doc = pymupdf.open(file_path)
        count = len(doc)
        doc.close()
        return count
    except Exception:
        return 0
