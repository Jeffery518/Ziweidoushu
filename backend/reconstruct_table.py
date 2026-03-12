
import fitz
import collections

pdf_path = r"e:\Project_Personal\紫微斗数\倪海厦-天纪-天机道终稿(20100907非打印第一版）简体.pdf"
doc = fitz.open(pdf_path)
page = doc[23]  # Page 24

words = page.get_text("words")  # (x0, y0, x1, y1, text, block_no, line_no, word_no)

# Group by columns (round x) and rows (round y)
# But since it's a table, we should allow some tolerance
X_TOLERANCE = 10
Y_TOLERANCE = 5

rows = collections.defaultdict(list)
for w in words:
    x0, y0, x1, y1, text = w[:5]
    # Find active row or create new
    found_y = False
    for r_y in rows:
        if abs(y0 - r_y) < Y_TOLERANCE:
            rows[r_y].append(w)
            found_y = True
            break
    if not found_y:
        rows[y0].append(w)

sorted_row_keys = sorted(rows.keys())
for y in sorted_row_keys:
    row_words = sorted(rows[y], key=lambda x: x[0])
    print(" | ".join([w[4] for w in row_words]))
