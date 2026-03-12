import sys
import os

# 将 backend 目录添加到 path
sys.path.append(os.path.abspath(r"e:\Project_Personal\紫微斗数\backend"))

from core.ziwei_engine import ZiweiCoreEngine

def debug_test():
    # 示例数据
    engine = ZiweiCoreEngine(year_stem="甲", year_branch="子", month_leap_num=1, day=15, hour_branch="子", gender="男")
    chart = engine.generate_chart()
    
    print(f"命宫: {chart['meta']['life_palace']} | 局数: {chart['meta']['wuxing_ju']}")
    print("-" * 50)
    
    for p in chart['palaces']:
        ms = ",".join(p['major_stars']) if p['major_stars'] else "None"
        trans = ",".join(p['transformations']) if p['transformations'] else "None"
        score = p.get('palace_score', 0)
        # 简化版打印，避免全角字符导致的显示问题
        print(f"[{p['branch']}] {p['name']:<6} | Score: {score:<3} | Stars: {ms} | Trans: {trans}")

if __name__ == "__main__":
    debug_test()
