import urllib.request
import docx
from pypdf import PdfReader
import sys

def read_docx(path):
    print(f"Reading {path}...")
    doc = docx.Document(path)
    fullText = []
    for para in doc.paragraphs:
        fullText.append(para.text)
    return '\n'.join(fullText)

def read_pdf(path):
    print(f"Reading {path}...")
    reader = PdfReader(path)
    fullText = []
    for page in reader.pages:
        fullText.append(page.extract_text())
    return '\n'.join(fullText)

try:
    docx_text = read_docx(r'd:\wikswipe\wikswipe\Wikswipe_PRD.docx')
    pdf_text = read_pdf(r'd:\wikswipe\wikswipe\Wikswipe Antigravity Build Spec.pdf')

    with open(r'd:\wikswipe\wikswipe\extracted_prd.txt', 'w', encoding='utf-8') as f:
        f.write("=== WIKISWIPE PRD DOCX ===\n")
        f.write(docx_text)
        f.write("\n\n=== WIKISWIPE ANTIGRAVITY BUILD SPEC PDF ===\n")
        f.write(pdf_text)
    print("Successfully extracted to extracted_prd.txt")
except Exception as e:
    print(f"Error: {e}")
