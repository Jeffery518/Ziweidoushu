import fitz
import sys
import re

pdf_path = r"e:\Project_Personal\紫微斗数\倪海厦-天纪-天机道终稿(20100907非打印第一版）简体.pdf"

try:
    doc = fitz.open(pdf_path)
    output = []
    
    # Simple table of contents or search
    for i, page in enumerate(doc):
        text = page.get_text()
        if "紫微斗数" in text or "排盘" in text or "十二宫" in text:
            # Output page number and the first few lines as context
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            snippet = " ".join(lines[:15])
            output.append(f"Page {i+1}: {snippet}...")
            
    with open("pdf_summary.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output))
    print(f"Found {len(output)} pages with relevant keywords. Summary written to pdf_summary.txt")
except Exception as e:
    print(f"Error reading PDF: {e}")
