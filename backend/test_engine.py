import sys
import json
from core.ziwei_engine import ZiweiCoreEngine

engine = ZiweiCoreEngine(year_stem="甲", year_branch="子", month_leap_num=1, day=15, hour_branch="子", gender="男")
chart = engine.generate_chart()
palaces = chart["palaces"]

for p in palaces:
    print(f"[{p['name']}] Branch: {p['branch']} | States: {p.get('twelve_states', 'MISSING')} | Brightness: {p.get('star_brightness', 'MISSING')}")
