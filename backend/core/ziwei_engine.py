from typing import Dict, Any

# ========================================== #
# 基础定义 (干支、宫名、星曜)
# ========================================== #
TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

PALACES_ORDER = [
    "命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫", 
    "迁移宫", "交友宫", "官禄宫", "田宅宫", "福德宫", "父母宫"
]

WUXING_JU = {2: "水二局", 3: "木三局", 4: "金四局", 5: "土五局", 6: "火六局"}

def get_stem_index(stem: str) -> int: return TIANGAN.index(stem)
def get_branch_index(branch: str) -> int: return DIZHI.index(branch)

class ZiweiCoreEngine:
    def __init__(self, year_stem: str, year_branch: str, month_leap_num: int, day: int, hour_branch: str, gender: str = "男"):
        self.year_stem = year_stem
        self.year_branch = year_branch
        self.month_num = month_leap_num
        self.day = day
        self.hour_branch = hour_branch
        self.gender = gender
        
        self.palaces: Dict[str, Dict[str, Any]] = {
            bz: {
                "branch": bz, "stem": "", "name": "", "major_stars": [], 
                "minor_stars": [], "transformations": [], "dayun": "",
                "boshi_spirit": "", "suiqian_spirit": "", "star_brightness": {}, 
                "shen_sha": [], "xiao_xian": ""
            } 
            for bz in DIZHI
        }
        self.meta: Dict[str, Any] = {}

    def _calculate_yin_yang(self) -> str:
        # 甲、丙、戊、庚、壬 为阳，凡在 0, 2, 4, 6, 8 都是阳
        is_yang = (get_stem_index(self.year_stem) % 2 == 0)
        yin_yang_str = "阳" if is_yang else "阴"
        return f"{yin_yang_str}{self.gender}"

    def _calculate_life_palace(self) -> str:
        yin_idx = get_branch_index("寅")
        hour_idx = get_branch_index(self.hour_branch)
        month_pos = (yin_idx + self.month_num - 1) % 12
        return DIZHI[(month_pos - hour_idx + 12) % 12]
        
    def _calculate_life_stem(self, life_branch: str) -> str:
        year_idx = get_stem_index(self.year_stem)
        start_stem_for_yin = {0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0}
        yin_stem_idx = start_stem_for_yin[year_idx % 5]
        offset = (get_branch_index(life_branch) - get_branch_index("寅") + 12) % 12
        return TIANGAN[(yin_stem_idx + offset) % 10]

    def _calculate_wuxing_ju(self, life_stem: str, life_branch: str) -> int:
        stem_val = (get_stem_index(life_stem) // 2) + 1  
        branch_val = ((get_branch_index(life_branch) // 2) % 3) + 1
        sum_val = stem_val + branch_val
        if sum_val > 5: sum_val -= 5
        return {1: 3, 2: 4, 3: 2, 4: 6, 5: 5}[sum_val]

    def _calculate_ziwei_star(self, ju: int) -> str:
        remainder = self.day % ju
        x = 0 if remainder == 0 else ju - remainder
        q = (self.day + x) // ju
        base_idx = (get_branch_index("寅") + q - 1) % 12
        return DIZHI[(base_idx + x) % 12] if x % 2 == 0 else DIZHI[(base_idx - x + 12) % 12]

    def _arrange_12_palaces(self, life_branch: str):
        life_idx = get_branch_index(life_branch)
        for i, name in enumerate(PALACES_ORDER):
            self.palaces[DIZHI[(life_idx - i + 12) % 12]]["name"] = name
            
    def _arrange_palaces_stems(self):
        year_idx = get_stem_index(self.year_stem)
        yin_stem_idx = {0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0}[year_idx % 5]
        yin_idx = get_branch_index("寅")
        for i in range(12):
            self.palaces[DIZHI[(yin_idx + i) % 12]]["stem"] = TIANGAN[(yin_stem_idx + i) % 10]

    def _arrange_14_major_stars(self, ziwei_branch: str):
        z_idx = get_branch_index(ziwei_branch)
        ziwei_group = {0: "紫微", -1: "天机", -3: "太阳", -4: "武曲", -5: "天同", -8: "廉贞"}
        for offset, star in ziwei_group.items():
            self.palaces[DIZHI[(z_idx + offset + 12) % 12]]["major_stars"].append(star)
            
        f_idx = (16 - z_idx) % 12
        tianfu_group = {0: "天府", 1: "太阴", 2: "贪狼", 3: "巨门", 4: "天相", 5: "天梁", 6: "七杀", 10: "破军"}
        for offset, star in tianfu_group.items():
            self.palaces[DIZHI[(f_idx + offset) % 12]]["major_stars"].append(star)

    def _arrange_six_lucky_stars(self):
        """安六吉星 (辅弼昌曲魁钺)"""
        chen_idx, xu_idx = get_branch_index("辰"), get_branch_index("戌")
        hour_idx = get_branch_index(self.hour_branch)
        
        self.palaces[DIZHI[(chen_idx + hour_idx) % 12]]["minor_stars"].append("文曲")
        self.palaces[DIZHI[(xu_idx - hour_idx + 12) % 12]]["minor_stars"].append("文昌")
        
        self.palaces[DIZHI[(chen_idx + self.month_num - 1) % 12]]["minor_stars"].append("左辅")
        self.palaces[DIZHI[(xu_idx - (self.month_num - 1) + 12) % 12]]["minor_stars"].append("右弼")
        
        kui_yue_map = {
            "甲": ("丑", "未"), "戊": ("丑", "未"), "庚": ("丑", "未"),
            "乙": ("子", "申"), "己": ("子", "申"),
            "丙": ("亥", "酉"), "丁": ("亥", "酉"),
            "壬": ("卯", "巳"), "癸": ("卯", "巳"),
            "辛": ("午", "寅")
        }
        kui, yue = kui_yue_map.get(self.year_stem, ("丑", "未"))
        self.palaces[kui]["minor_stars"].append("天魁")
        self.palaces[yue]["minor_stars"].append("天钺")

    def _arrange_six_evil_stars(self):
        """安六煞星 (羊陀火铃空劫) 与 禄存"""
        lucun_map = {
            "甲": "寅", "乙": "卯", "丙": "巳", "戊": "巳",
            "丁": "午", "己": "午", "庚": "申", "辛": "酉",
            "壬": "亥", "癸": "子"
        }
        lc_branch = lucun_map.get(self.year_stem, "寅")
        lc_idx = get_branch_index(lc_branch)
        self.palaces[lc_branch]["minor_stars"].append("禄存")
        self.palaces[DIZHI[(lc_idx + 1) % 12]]["minor_stars"].append("擎羊")
        self.palaces[DIZHI[(lc_idx - 1 + 12) % 12]]["minor_stars"].append("陀罗")
        
        hai_idx, hour_idx = get_branch_index("亥"), get_branch_index(self.hour_branch)
        self.palaces[DIZHI[(hai_idx - hour_idx + 12) % 12]]["minor_stars"].append("地空")
        self.palaces[DIZHI[(hai_idx + hour_idx) % 12]]["minor_stars"].append("地劫")

        # 火铃简化起法 (针对四大局)
        huo_ling_start = {
            "寅": ("丑", "卯"), "午": ("丑", "卯"), "戌": ("丑", "卯"),
            "申": ("寅", "戌"), "子": ("寅", "戌"), "辰": ("寅", "戌"),
            "巳": ("卯", "戌"), "酉": ("卯", "戌"), "丑": ("卯", "戌"),
            "亥": ("酉", "戌"), "卯": ("酉", "戌"), "未": ("酉", "戌")
        }
        huo_base, ling_base = huo_ling_start.get(self.year_branch, ("丑", "卯"))
        self.palaces[DIZHI[(get_branch_index(huo_base) + hour_idx) % 12]]["minor_stars"].append("火星")
        self.palaces[DIZHI[(get_branch_index(ling_base) + hour_idx) % 12]]["minor_stars"].append("铃星")

    def _arrange_four_transformations(self):
        """安四化：紫微斗数天干四化"""
        sihua_map = {
            "甲": {"禄": "廉贞", "权": "破军", "科": "武曲", "忌": "太阳"},
            "乙": {"禄": "天机", "权": "天梁", "科": "紫微", "忌": "太阴"},
            "丙": {"禄": "天同", "权": "天机", "科": "文昌", "忌": "廉贞"},
            "丁": {"禄": "太阴", "权": "天同", "科": "天机", "忌": "巨门"},
            "戊": {"禄": "贪狼", "权": "太阴", "科": "右弼", "忌": "天机"},
            "己": {"禄": "武曲", "权": "贪狼", "科": "天梁", "忌": "文曲"},
            "庚": {"禄": "太阳", "权": "武曲", "科": "太阴", "忌": "天同"},
            "辛": {"禄": "巨门", "权": "太阳", "科": "文曲", "忌": "文昌"},
            "壬": {"禄": "天梁", "权": "紫微", "科": "左辅", "忌": "武曲"},
            "癸": {"禄": "破军", "权": "巨门", "科": "太阴", "忌": "贪狼"}
        }
        rules = sihua_map.get(self.year_stem, {})
        for p in self.palaces.values():
            for star in p["major_stars"] + p["minor_stars"]:
                for hua_type, target in rules.items():
                    if star == target:
                        p["transformations"].append(f"{star}化{hua_type}")

    def _calculate_dayun(self, wuxing_ju_num: int, yin_yang_gender: str, life_branch: str):
        """计算大运：根据五行局定大运起始年龄，阳男阴女顺行，阴男阳女逆行"""
        # 判断顺逆
        is_shun = (yin_yang_gender == "阳男" or yin_yang_gender == "阴女")
        
        life_idx = get_branch_index(life_branch)
        
        for i in range(12):
            start_age = wuxing_ju_num + i * 10
            end_age = start_age + 9
            dayun_str = f"{start_age}-{end_age}"
            
            # 顺行则 life_idx + i, 逆行则 life_idx - i
            target_idx = (life_idx + i) % 12 if is_shun else (life_idx - i + 12) % 12
            self.palaces[DIZHI[target_idx]]["dayun"] = dayun_str

    def _arrange_boshi_twelve_spirits(self, yin_yang_gender: str):
        """安博士十二神（倒海厦天纪体系）
        博士、力士、青龙、小耗、将军、奏书、飞廉、喜神、病符、大耗、伏兵、官符
        起例：从庄存位起安博士，阳男阴女顺行，阴男阳女逆行
        """
        spirits = ["博士", "力士", "青龙", "小耗", "将军", "奏书", "飞廉", "喜神", "病符", "大耗", "伏兵", "官符"]
        
        # 百子安禄存生着位为安博士十二神的起点
        lucun_map = {
            "甲": "寅", "乙": "卯", "丙": "巳", "戊": "巳",
            "丁": "午", "己": "午", "庚": "申", "辛": "酉",
            "壬": "亥", "癸": "子"
        }
        start_branch = lucun_map.get(self.year_stem, "寅")
        start_idx = get_branch_index(start_branch)
        
        is_shun = (yin_yang_gender == "阳男" or yin_yang_gender == "阴女")
        
        for i in range(12):
            target_idx = (start_idx + i) % 12 if is_shun else (start_idx - i + 12) % 12
            self.palaces[DIZHI[target_idx]]["boshi_spirit"] = spirits[i]

    def _calculate_shen_gong(self, life_branch: str) -> str:
        """计算身宫：身宫与命宫相对位置相关。
        官方方法：宯和生小时子卉位相加。
        简化版：身宫 = (命宫地支索引 + 生月索引 + 生时地支索引) % 12
        """
        hour_idx = get_branch_index(self.hour_branch)
        life_idx = get_branch_index(life_branch)
        # 身宫按寥子时位顺行
        shen_gong_map = {
            "子": "宯", "丑": "立春", "寅": "小满",
            "卯": "谷雨", "辰": "大暑", "巳": "宄露",
            "午": "宯", "未": "小寒", "申": "小满",
            "酉": "寒露", "戌": "大寒", "亥": "大雪"
        }
        # 标准天红安身宫对照表：子/午时身宫在命宫，成对宫位
        shen_offset_map = {
            "子": 0, "丑": 0, "寅": 1, "卯": 1,
            "辰": 2, "巳": 2, "午": 3, "未": 3,
            "申": 4, "酉": 4, "戌": 5, "亥": 5
        }
        # 午时身宫在命宫
        hour_type_idx = get_branch_index(self.hour_branch)
        if hour_type_idx in [0, 6]:  # 子或午
            return life_branch
        # 八个时辰对应尽垓字实现：身宫按寥子水二局顺行
        # 孠寅在寅，丑未在午，寅申在前一局，...
        shengong_from_ming: Dict[str, int] = {
            "丑": 2, "寅": 4, "卯": 6, "辰": 8,
            "巳": 10, "未": 2, "申": 4, "酉": 6, "戌": 8, "亥": 10
        }
        offset = shengong_from_ming.get(self.hour_branch, 0)
        return DIZHI[(life_idx + offset) % 12]

    def _arrange_suiqian_twelve_spirits(self, year_branch: str):
        """安岁前十二神（倦海厦天纪体系）
        岁建、晦气、丧门、贯索、官符、小耗、大耗、龙德、白虎、天德、啀客、病符
        安法：岁建在岁年地支位，顺数安之
        """
        spirits = ["岁建", "晦气", "丧门", "贯索", "官符", "小耗", "大耗", "龙德", "白虎", "天德", "啀客", "病符"]
        start_idx = get_branch_index(year_branch)
        for i in range(12):
            target_idx = (start_idx + i) % 12
            self.palaces[DIZHI[target_idx]]["suiqian_spirit"] = spirits[i]

    def _arrange_xiao_xian(self, yin_yang_gender: str, life_branch: str, birth_year: int, target_year: int):
        """安小限：男宫女、女宯宫起，顺逆行，以岁为展
        男：宯子夗宫起，阳顺阴逆; 女：寅子夗宫起，阳顺阴逆
        """
        age = target_year - birth_year + 1  # 虚岁
        # 小限起宫：男从寅字位(寅时宫位)  
        if self.gender == "男":
            start_branch = "寅"
        else:
            start_branch = "午"  # 女从午位起
        start_idx = get_branch_index(start_branch)
        is_shun = (yin_yang_gender == "阳男" or yin_yang_gender == "阴女")
        
        offset = (age - 1) % 12
        if is_shun:
            xian_idx = (start_idx + offset) % 12
        else:
            xian_idx = (start_idx - offset + 12) % 12
        self.palaces[DIZHI[xian_idx]]["xiao_xian"] = "小限"

    def _arrange_tianma(self):
        """安天马：寅午戌年天马在申，申子辰在寅，巳酉丑在亥，亥卯未在巳"""
        tianma_map = {
            "寅": "申", "午": "申", "戌": "申",   # 寅午戌年: 天马在申
            "申": "寅", "子": "寅", "辰": "寅",   # 申子辰年: 天马在寅
            "巳": "亥", "酉": "亥", "丑": "亥",   # 巳酉丑年: 天马在亥
            "亥": "巳", "卯": "巳", "未": "巳"    # 亥卯未年: 天马在巳
        }
        tianma_branch = tianma_map.get(self.year_branch, "申")
        self.palaces[tianma_branch]["minor_stars"].append("天马")

    def _arrange_hong_luan_tian_xi(self):
        """安红鸾天喜：红鸾从卯宫起逆数年干支；天喜与红鸾对宫"""
        mao_idx = get_branch_index("卯")  # 卯为红鸾起位
        year_branch_idx = get_branch_index(self.year_branch)
        # 红鸾逆数: 卡位 = (卯索引 - 年支索引) % 12
        hong_luan_idx = (mao_idx - year_branch_idx + 12) % 12
        tian_xi_idx = (hong_luan_idx + 6) % 12   # 天喜对宫
        self.palaces[DIZHI[hong_luan_idx]]["minor_stars"].append("红鸾")
        self.palaces[DIZHI[tian_xi_idx]]["minor_stars"].append("天喜")

    def _arrange_tian_yao_xian_chi(self):
        """安天姚和咸池（丙级生局）
        咸池: 寅午戌子年在酉，亥卯未丑年在午，巳酉丑申年在卯， 申子辰亥年在寅
        天姚: 子午年在酉，丑未年在府，寅申年在寅，卯酉年在卯，辰戌年在辰，巳亥年在巳
        """
        xianchi_map = {
            "寅": "酉", "午": "酉", "戌": "酉", "子": "酉",
            "亥": "午", "卯": "午", "未": "午", "丑": "午",
            "巳": "卯", "酉": "卯", "丑b": "卯", "申": "卯",
        }
        tianyao_map = {
            "子": "酉", "午": "酉",
            "丑": "午", "未": "午",
            "寅": "寅", "申": "寅",
            "卯": "卯", "酉": "卯",
            "辰": "辰", "戌": "辰",
            "巳": "巳", "亥": "巳"
        }
        xc_branch = xianchi_map.get(self.year_branch)
        ty_branch = tianyao_map.get(self.year_branch)
        if xc_branch: self.palaces[xc_branch]["minor_stars"].append("咸池")
        if ty_branch: self.palaces[ty_branch]["minor_stars"].append("天姚")

    def _calculate_star_brightness(self):
        """设定简单的主星庙旺平陷状态 (MVP版本，仅取几个典型)"""
        brightness_rules = {
            "紫微": {"子": "平", "丑": "庙", "寅": "庙", "卯": "得", "辰": "陷", "巳": "旺", "午": "庙", "未": "庙", "申": "得", "酉": "旺", "戌": "平", "亥": "旺"},
            "太阳": {"子": "陷", "丑": "陷", "寅": "庙", "卯": "庙", "辰": "庙", "巳": "旺", "午": "庙", "未": "平", "申": "平", "酉": "平", "戌": "陷", "亥": "陷"},
            "太阴": {"子": "庙", "丑": "庙", "寅": "平", "卯": "陷", "辰": "陷", "巳": "陷", "午": "陷", "未": "平", "申": "平", "酉": "旺", "戌": "庙", "亥": "庙"},
            "武曲": {"子": "平", "丑": "庙", "寅": "得", "卯": "陷", "辰": "庙", "巳": "平", "午": "旺", "未": "庙", "申": "得", "酉": "旺", "戌": "庙", "亥": "平"},
            "天同": {"子": "旺", "丑": "陷", "寅": "平", "卯": "庙", "辰": "平", "巳": "庙", "午": "陷", "未": "陷", "申": "旺", "酉": "平", "戌": "平", "亥": "庙"},
            "七杀": {"子": "旺", "丑": "庙", "寅": "庙", "卯": "旺", "辰": "庙", "巳": "平", "午": "旺", "未": "庙", "申": "庙", "酉": "旺", "戌": "庙", "亥": "平"},
            "贪狼": {"子": "平", "丑": "庙", "寅": "平", "卯": "平", "辰": "庙", "巳": "陷", "午": "旺", "未": "庙", "申": "平", "酉": "平", "戌": "庙", "亥": "陷"},
            "巨门": {"子": "旺", "丑": "陷", "寅": "庙", "卯": "庙", "辰": "平", "巳": "平", "午": "旺", "未": "陷", "申": "庙", "酉": "庙", "戌": "平", "亥": "旺"},
            "天机": {"子": "庙", "丑": "陷", "寅": "得", "卯": "旺", "辰": "平", "巳": "平", "午": "庙", "未": "陷", "申": "得", "酉": "旺", "戌": "平", "亥": "平"},
            "廉贞": {"子": "平", "丑": "旺", "寅": "庙", "卯": "平", "辰": "旺", "巳": "陷", "午": "平", "未": "旺", "申": "庙", "酉": "平", "戌": "旺", "亥": "陷"},
            "天府": {"子": "庙", "丑": "庙", "寅": "庙", "卯": "得", "辰": "庙", "巳": "得", "午": "旺", "未": "庙", "申": "得", "酉": "旺", "戌": "庙", "亥": "旺"},
            "天梁": {"子": "庙", "丑": "旺", "寅": "庙", "卯": "庙", "辰": "庙", "巳": "陷", "午": "庙", "未": "旺", "申": "陷", "酉": "得", "戌": "庙", "亥": "陷"},
            "天相": {"子": "庙", "丑": "庙", "寅": "庙", "卯": "陷", "辰": "旺", "巳": "得", "午": "平", "未": "得", "申": "庙", "酉": "陷", "戌": "旺", "亥": "得"},
            "破军": {"子": "庙", "丑": "旺", "寅": "得", "卯": "陷", "辰": "旺", "巳": "平", "午": "庙", "未": "旺", "申": "得", "酉": "陷", "戌": "旺", "亥": "平"},
            "文昌": {"子": "庙", "丑": "庙", "寅": "平", "卯": "得", "辰": "得", "巳": "庙", "午": "陷", "未": "平", "申": "得", "酉": "庙", "戌": "陷", "亥": "得"},
            "文曲": {"子": "庙", "丑": "庙", "寅": "平", "卯": "旺", "辰": "得", "巳": "庙", "午": "陷", "未": "平", "申": "旺", "酉": "庙", "戌": "陷", "亥": "旺"},
            "左辅": {"子": "庙", "丑": "庙", "寅": "庙", "卯": "得", "辰": "庙", "巳": "得", "午": "庙", "未": "庙", "申": "得", "酉": "庙", "戌": "庙", "亥": "得"},
            "右弼": {"子": "庙", "丑": "庙", "寅": "庙", "卯": "得", "辰": "庙", "巳": "得", "午": "庙", "未": "庙", "申": "得", "酉": "庙", "戌": "庙", "亥": "得"},
            "擎羊": {"子": "陷", "丑": "庙", "寅": "陷", "卯": "陷", "辰": "庙", "巳": "陷", "午": "陷", "未": "庙", "申": "陷", "酉": "陷", "戌": "庙", "亥": "陷"},
            "陀罗": {"子": "陷", "丑": "庙", "寅": "陷", "卯": "陷", "辰": "庙", "巳": "陷", "午": "陷", "未": "庙", "申": "陷", "酉": "陷", "戌": "庙", "亥": "陷"},
            "火星": {"子": "陷", "丑": "得", "寅": "庙", "卯": "得", "辰": "陷", "巳": "得", "午": "庙", "未": "得", "申": "陷", "酉": "得", "戌": "庙", "亥": "陷"},
            "铃星": {"子": "陷", "丑": "得", "寅": "庙", "卯": "得", "辰": "陷", "巳": "得", "午": "庙", "未": "得", "申": "陷", "酉": "得", "戌": "庙", "亥": "陷"},
            "禄存": {"子": "庙", "丑": "庙", "寅": "庙", "卯": "庙", "辰": "庙", "巳": "庙", "午": "庙", "未": "庙", "申": "庙", "酉": "庙", "戌": "庙", "亥": "庙"},
            # 天魁天钺：贵人星，到处皆庙
            "天魁": {"子": "庙", "丑": "庙", "寅": "庙", "卯": "庙", "辰": "庙", "巳": "庙", "午": "庙", "未": "庙", "申": "庙", "酉": "庙", "戌": "庙", "亥": "庙"},
            "天钺": {"子": "庙", "丑": "庙", "寅": "庙", "卯": "庙", "辰": "庙", "巳": "庙", "午": "庙", "未": "庙", "申": "庙", "酉": "庙", "戌": "庙", "亥": "庙"},
            # 天马：寅申巳亥四驿马地为旺，三合局地为得，其余为平
            "天马": {"子": "平", "丑": "平", "寅": "旺", "卯": "得", "辰": "平", "巳": "旺", "午": "得", "未": "平", "申": "旺", "酉": "得", "戌": "平", "亥": "旺"},
            # 红鸾：卯为旺，水星主桃花，子辰亥得，其余平
            "红鸾": {"子": "得", "丑": "平", "寅": "平", "卯": "旺", "辰": "得", "巳": "平", "午": "平", "未": "平", "申": "平", "酉": "得", "戌": "平", "亥": "得"},
            # 天喜：与红鸾对宫，酉为旺
            "天喜": {"子": "得", "丑": "平", "寅": "平", "卯": "得", "辰": "得", "巳": "平", "午": "平", "未": "平", "申": "平", "酉": "旺", "戌": "平", "亥": "得"},
            # 天姚：主风流桃花，卯午为旺，得地在子亥，其余平陷
            "天姚": {"子": "得", "丑": "陷", "寅": "平", "卯": "旺", "辰": "平", "巳": "平", "午": "旺", "未": "陷", "申": "平", "酉": "得", "戌": "陷", "亥": "得"},
            # 咸池：败神，丑辰未戌四墓为庙，其余多为陷
            "咸池": {"子": "陷", "丑": "庙", "寅": "陷", "卯": "陷", "辰": "庙", "巳": "陷", "午": "陷", "未": "庙", "申": "陷", "酉": "陷", "戌": "庙", "亥": "陷"},
            # 地空地劫：凶星，多为陷地
            "地空": {"子": "陷", "丑": "陷", "寅": "陷", "卯": "陷", "辰": "陷", "巳": "陷", "午": "陷", "未": "陷", "申": "陷", "酉": "陷", "戌": "陷", "亥": "庙"},
            "地劫": {"子": "庙", "丑": "陷", "寅": "陷", "卯": "陷", "辰": "陷", "巳": "陷", "午": "陷", "未": "陷", "申": "陷", "酉": "陷", "戌": "陷", "亥": "陷"}
        }

        for p in self.palaces.values():
            branch = p["branch"]
            for star in p["major_stars"] + p["minor_stars"]:
                if star in brightness_rules and branch in brightness_rules[star]:
                    p["star_brightness"][star] = brightness_rules[star][branch]

    def generate_chart(self, birth_year: int = 1990, target_year: int = 2026) -> Dict[str, Any]:
        life_branch = self._calculate_life_palace()
        life_stem = self._calculate_life_stem(life_branch)
        wuxing_ju_num = self._calculate_wuxing_ju(life_stem, life_branch)
        ziwei_branch = self._calculate_ziwei_star(wuxing_ju_num)
        yin_yang_gender = self._calculate_yin_yang()
        
        self._arrange_12_palaces(life_branch)
        self._arrange_palaces_stems()
        self._arrange_14_major_stars(ziwei_branch)
        self._arrange_six_lucky_stars()
        self._arrange_six_evil_stars()
        self._arrange_tianma()
        self._arrange_hong_luan_tian_xi()
        self._arrange_tian_yao_xian_chi()
        self._arrange_four_transformations()
        self._calculate_dayun(wuxing_ju_num, yin_yang_gender, life_branch)
        self._arrange_boshi_twelve_spirits(yin_yang_gender)
        self._arrange_suiqian_twelve_spirits(self.year_branch)
        self._arrange_xiao_xian(yin_yang_gender, life_branch, birth_year, target_year)
        self._calculate_star_brightness()
        
        shen_gong_branch = self._calculate_shen_gong(life_branch)
        shen_gong_name = self.palaces[shen_gong_branch]["name"]
        
        self.meta = {
            "life_palace": f"{life_stem}{life_branch}",
            "wuxing_ju": WUXING_JU[wuxing_ju_num],
            "ziwei_position": ziwei_branch,
            "yin_yang_gender": yin_yang_gender,
            "shen_gong": f"{self.palaces[shen_gong_branch]['stem']}{shen_gong_branch}",
            "shen_gong_palace": shen_gong_name,
        }
        
        return {"meta": self.meta, "palaces": [self.palaces[b] for b in DIZHI]}


if __name__ == "__main__":
    # 甲子年，正月，十五日，子时
    engine = ZiweiCoreEngine(year_stem="甲", year_branch="子", month_leap_num=1, day=15, hour_branch="子", gender="男")
    chart = engine.generate_chart()
    
    print("【天纪版 高阶紫微全盘打印 (包含辅星/四化)】")
    print(f"命宫: {chart['meta']['life_palace']} | 局数: {chart['meta']['wuxing_ju']} | 紫微星: {chart['meta']['ziwei_position']}")
    print("=" * 80)
    for p in chart['palaces']:
        ms = ",".join(p['major_stars']) if p['major_stars'] else "无"
        mins = ",".join(p['minor_stars']) if p['minor_stars'] else "无"
        trans = ",".join(p['transformations']) if p['transformations'] else ""
        print(f"[{p['stem']}{p['branch']}宫] {p['name'].ljust(4, '　')} | 大运: {p['dayun'].ljust(5)} | 主: {ms.ljust(8, '　')} | 辅: {mins.ljust(15, '　')} | {trans}")
