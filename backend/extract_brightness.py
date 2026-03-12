
import fitz
import json

star_map = {
    "紫": "紫微", "机": "天机", "阳": "太阳", "武": "武曲", "同": "天同", "廉": "廉贞",
    "府": "天府", "阴": "太阴", "贪": "贪狼", "巨": "巨门", "相": "天相", "梁": "天梁",
    "杀": "七杀", "破": "破军", "昌": "文昌", "曲": "文曲", "魁": "天魁", "钺": "天钺", 
    "羊": "擎羊", "陀": "陀罗", "火": "火星", "铃": "铃星", "禄": "禄存",
    "左": "左辅", "右": "右弼"
}

column_names = ["宫", "庙", "旺", "得", "利", "平", "不", "陷"]
palaces = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

col_bounds = [
    (110, 195), # 庙
    (196, 260), # 旺
    (261, 320), # 得
    (321, 375), # 利
    (376, 425), # 平
    (426, 480), # 不
    (481, 550)  # 陷
]

def get_col_idx(x_center):
    for i, (low, high) in enumerate(col_bounds):
        if low <= x_center <= high:
            return i + 1
    return None

pdf_path = r"e:\Project_Personal\紫微斗数\倪海厦-天纪-天机道终稿(20100907非打印第一版）简体.pdf"
doc = fitz.open(pdf_path)
page = doc[23]
words = page.get_text("words")

rules = {star: {p: "平" for p in palaces} for star in star_map.values()}

# Process row by row
y_starts = [118, 151, 182, 214, 246, 277, 309, 340, 373, 404, 436, 467] # Estimated Ys

for p_idx, p_name in enumerate(palaces):
    target_y = y_starts[p_idx]
    row_words = [w for w in words if abs(w[1] - target_y) < 8]
    
    for w in row_words:
        x_center = (w[0] + w[2]) / 2
        col_idx = get_col_idx(x_center)
        if col_idx:
            text = w[4]
            for char in text:
                if char in star_map:
                    rules[star_map[char]][p_name] = column_names[col_idx]

# Special cases: If a star is mentioned twice in a row (e.g. Huo/Ling in Chou), the last one might winning.
# But for now let's see results.
print(json.dumps(rules, ensure_ascii=False, indent=2))
