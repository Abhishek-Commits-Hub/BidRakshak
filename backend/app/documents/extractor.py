import fitz

def extract_pdf_pages(file_path: str):
    document = fitz.open(file_path)
    pages = []

    for index, page in enumerate(document):
        text = page.get_text("text").strip()
        pages.append({
            "page_number": index + 1,
            "text": text
        })

    page_count = len(document)
    document.close()

    return page_count, pages