from typing import Dict, Any

# ========================================== #
# 基础定义 (干支、宫名、星曜)
# ========================================== #
TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

PALACES_ORDER = [
    "命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫", 
    "迁移宫", "交友宫", "事业宫", "田宅宫", "福德宫", "父母宫"
]

WUXING_JU = {2: "水二局", 3: "木三局", 4: "金四局", 5: "土五局", 6: "火六局"}

def get_stem_index(stem: str) -> int: return TIANGAN.index(stem)
def get_branch_index(branch: str) -> int: return DIZHI.index(branch)

# 星曜等级定义 (仅用于分类，不涉及评分)
STAR_LEVELS = {
    "甲": "主星",
    "乙": "辅星",
    "丙": "杂曜",
}

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
                "minor_stars": [], "c_stars": [], "transformations": [], "dayun": "",
                "boshi_spirit": "", "suiqian_spirit": "", "changsheng_spirit": "", 
                "star_brightness": {}, "xiao_xian": ""
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

    def _calculate_nayin(self) -> str:
        """计算六十花甲子纳音 (PDF Page 13)"""
        nayin_map = {
            "甲子": "海中金", "乙丑": "海中金", "丙寅": "炉中火", "丁卯": "炉中火", "戊辰": "大林木", "己巳": "大林木",
            "庚午": "路旁土", "辛未": "路旁土", "壬申": "剑锋金", "癸酉": "剑锋金", "甲戌": "山头火", "乙亥": "山头火",
            "丙子": "涧下水", "丁丑": "涧下水", "戊寅": "城头土", "己卯": "城头土", "庚辰": "白镴金", "辛巳": "白镴金",
            "壬午": "杨柳木", "癸未": "杨柳木", "甲申": "井泉水", "乙酉": "井泉水", "丙戌": "屋上土", "丁亥": "屋上土",
            "戊子": "霹雳火", "己丑": "霹雳火", "庚寅": "松柏木", "辛卯": "松柏木", "壬辰": "长流水", "癸巳": "长流水",
            "甲午": "沙中金", "乙未": "沙中金", "丙申": "山下火", "丁酉": "山下火", "戊戌": "平地木", "己亥": "平地木",
            "庚子": "壁上土", "辛丑": "壁上土", "壬寅": "金箔金", "癸卯": "金箔金", "甲辰": "覆灯火", "乙巳": "覆灯火",
            "丙午": "天河水", "丁未": "天河水", "戊申": "大驿土", "己酉": "大驿土", "庚戌": "钗钏金", "辛亥": "钗钏金",
            "壬子": "桑拓木", "癸丑": "桑拓木", "甲寅": "大溪水", "乙卯": "大溪水", "丙辰": "沙中土", "丁巳": "沙中土",
            "戊午": "天上火", "己未": "天上火", "庚申": "石榴木", "辛酉": "石榴木", "壬戌": "大海水", "癸亥": "大海水"
        }
        return nayin_map.get(f"{self.year_stem}{self.year_branch}", "未知")

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

    def _arrange_c_level_stars(self, life_branch: str, shengong_branch: str):
        """安丙级星 (杂曜/神煞) - PDF Page 19-21"""
        # 1. 天官、天福、天厨 (干系)
        tianguan = {"甲":"未","乙":"辰","丙":"巳","丁":"寅","戊":"卯","己":"酉","庚":"亥","辛":"酉","壬":"戌","癸":"午"}
        tianfu_star = {"甲":"酉","乙":"申","丙":"子","丁":"亥","戊":"卯","己":"寅","庚":"午","辛":"巳","壬":"午","癸":"巳"}
        tianchu = {"甲":"巳","乙":"午","丙":"子","丁":"巳","戊":"午","己":"申","庚":"寅","辛":"午","壬":"酉","癸":"亥"}
        
        self.palaces[tianguan[self.year_stem]]["c_stars"].append("天官")
        self.palaces[tianfu_star[self.year_stem]]["c_stars"].append("天福")
        self.palaces[tianchu[self.year_stem]]["c_stars"].append("天厨")

        # 2. 解神、天哭、天虚、龙池、凤阁 (支系)
        jieshen = {"子":"戌","丑":"酉","寅":"申","卯":"未","辰":"午","巳":"巳","午":"辰","未":"卯","申":"寅","酉":"丑","戌":"子","亥":"亥"}
        self.palaces[jieshen[self.year_branch]]["c_stars"].append("解神")
        
        yb_idx = get_branch_index(self.year_branch)
        wu_idx = get_branch_index("午")
        self.palaces[DIZHI[(wu_idx - yb_idx + 12) % 12]]["c_stars"].append("天哭")
        self.palaces[DIZHI[(wu_idx + yb_idx) % 12]]["c_stars"].append("天虚")
        
        chen_idx = get_branch_index("辰")
        xu_idx = get_branch_index("戌")
        self.palaces[DIZHI[(chen_idx + yb_idx) % 12]]["c_stars"].append("龙池")
        self.palaces[DIZHI[(xu_idx - yb_idx + 12) % 12]]["c_stars"].append("凤阁")

        # 3. 孤辰、寡宿
        guchen_map = {"寅":"巳","卯":"巳","辰":"巳","巳":"申","午":"申","未":"申","申":"亥","酉":"亥","戌":"亥","亥":"寅","子":"寅","丑":"寅"}
        guasu_map = {"寅":"丑","卯":"丑","辰":"丑","巳":"辰","午":"辰","未":"辰","申":"未","酉":"未","戌":"未","亥":"戌","子":"戌","丑":"戌"}
        self.palaces[guchen_map[self.year_branch]]["c_stars"].append("孤辰")
        self.palaces[guasu_map[self.year_branch]]["c_stars"].append("寡宿")

        # 4. 天伤、天使 (命宫固定偏移)
        # 天伤在交友宫 (Ming+5), 天使在疾厄宫 (Ming+7)
        life_idx = get_branch_index(life_branch)
        self.palaces[DIZHI[(life_idx + 5) % 12]]["c_stars"].append("天伤")
        self.palaces[DIZHI[(life_idx + 7) % 12]]["c_stars"].append("天使")

        # 5. 天才、天寿
        # 天才：由命宫起子顺行，数至本生年支
        self.palaces[DIZHI[(life_idx + yb_idx) % 12]]["c_stars"].append("天才")
        # 天寿：由身宫起子顺行，数至本生年支
        sg_idx = get_branch_index(shengong_branch)
        self.palaces[DIZHI[(sg_idx + yb_idx) % 12]]["c_stars"].append("天寿")

        # 6. 三台、八座 (由左辅右弼起生日)
        zf_p = next((p for p in self.palaces.values() if "左辅" in p["minor_stars"]), None)
        yb_p = next((p for p in self.palaces.values() if "右弼" in p["minor_stars"]), None)
        if zf_p and yb_p:
            self.palaces[DIZHI[(get_branch_index(zf_p["branch"]) + self.day - 1) % 12]]["c_stars"].append("三台")
            self.palaces[DIZHI[(get_branch_index(yb_p["branch"]) - (self.day - 1) + 12) % 12]]["c_stars"].append("八座")

        # 7. 恩光、天贵 (由文昌文曲起生日)
        wc_p = next((p for p in self.palaces.values() if "文昌" in p["minor_stars"]), None)
        wq_p = next((p for p in self.palaces.values() if "文曲" in p["minor_stars"]), None)
        if wc_p and wq_p:
            self.palaces[DIZHI[(get_branch_index(wc_p["branch"]) + self.day - 2 + 12) % 12]]["c_stars"].append("恩光")
            self.palaces[DIZHI[(get_branch_index(wq_p["branch"]) + self.day - 2 + 12) % 12]]["c_stars"].append("天贵")

        # 8. 台辅、封诰 (时系)
        hour_idx = get_branch_index(self.hour_branch)
        self.palaces[DIZHI[(get_branch_index("午") + hour_idx) % 12]]["c_stars"].append("台辅")
        self.palaces[DIZHI[(get_branch_index("寅") + hour_idx) % 12]]["c_stars"].append("封诰")

        # 9. 天巫、天月、阴煞 (月系 PDF Page 20)
        tianwu_loop = ["巳", "申", "寅", "亥"]
        self.palaces[tianwu_loop[(self.month_num - 1) % 4]]["c_stars"].append("天巫")
        tianyue_map = {1:"戌",2:"巳",3:"辰",4:"寅",5:"未",6:"卯",7:"亥",8:"未",9:"寅",10:"午",11:"戌",12:"寅"}
        self.palaces[tianyue_map[self.month_num]]["c_stars"].append("天月")
        yinsha_loop = ["寅", "子", "戌", "申", "午", "辰"]
        self.palaces[yinsha_loop[(self.month_num - 1) % 6]]["c_stars"].append("阴煞")

        # 10. 旬空与截空
        ys_idx = get_stem_index(self.year_stem)
        start_idx = (yb_idx - ys_idx + 12) % 12
        self.palaces[DIZHI[(start_idx - 2 + 12) % 12]]["c_stars"].append("旬空")

        jiekong_map = {"甲":"申酉","己":"申酉","乙":"午未","庚":"午未","丙":"辰巳","辛":"辰巳","丁":"寅卯","壬":"寅卯","戊":"子丑","癸":"子丑"}
        res = jiekong_map.get(self.year_stem, "")
        for char in res:
            self.palaces[char]["c_stars"].append("截空")

    def _arrange_changsheng_12_spirits(self, ju: int, yin_yang_gender: str):
        """安五行长生十二神 (PDF Page 16)"""
        spirits = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"]
        start_map = {2: "申", 3: "亥", 4: "巳", 5: "申", 6: "寅"}
        start_idx = get_branch_index(start_map[ju])
        is_shun = (yin_yang_gender == "阳男" or yin_yang_gender == "阴女")
        
        for i in range(12):
            target_idx = (start_idx + i) % 12 if is_shun else (start_idx - i + 12) % 12
            # 复用原本存储神煞的字段，或者这里直接加到 palaces 字典新 key
            self.palaces[DIZHI[target_idx]]["changsheng_spirit"] = spirits[i]

    def _arrange_master_stars(self, life_branch: str):
        """安命主与身主 (PDF Page 21)"""
        ming_zhu_map = {"子":"贪狼","丑":"巨门","寅":"禄存","卯":"文曲","辰":"廉贞","巳":"武曲","午":"破军","未":"武曲","申":"廉贞","酉":"文曲","戌":"禄存","亥":"巨门"}
        shen_zhu_map = {"子":"火星","丑":"天相","寅":"天梁","卯":"天同","辰":"文昌","巳":"天机","午":"火星","未":"天相","申":"天梁","酉":"天同","戌":"文昌","亥":"天机"}
        return ming_zhu_map[life_branch], shen_zhu_map[self.year_branch]

    def _calculate_star_brightness(self):
        """计算星曜庙旺平陷逻辑 (外部 JSON 驱动)"""
        import json
        import os
        
        # 尝试从外部文件加载 rules，若失败则回退至硬编码
        current_dir = os.path.dirname(os.path.abspath(__file__))
        rules_path = os.path.join(current_dir, "brightness_rules.json")
        brightness_rules = {}
        if os.path.exists(rules_path):
            try:
                with open(rules_path, "r", encoding="utf-8") as f:
                    brightness_rules = json.load(f)
            except Exception:
                 pass
        
        if not brightness_rules:
            # 硬编码兜底 (仅包含部分示例)
            brightness_rules = {
                "紫微": {"子": "平", "丑": "平", "寅": "旺", "卯": "旺", "辰": "平", "巳": "旺", "午": "庙", "未": "庙", "申": "平", "酉": "旺", "戌": "得", "亥": "旺"},
            }

        for p in self.palaces.values():
            branch = p["branch"]
            # 合并所有星曜
            all_stars = p["major_stars"] + p["minor_stars"] + p["c_stars"]
            for star in all_stars:
                if star in brightness_rules and branch in brightness_rules[star]:
                    p["star_brightness"][star] = brightness_rules[star][branch]

    def _calculate_palace_weights(self):
        """
        计算宫位综合权重评分 (Normalized 0-100)
        1. 基础星曜量级 (60%)
        2. 亮度修正 (20%)
        3. 四化加持/减损 (20%)
        """
        base_weights = {
            "major": 12.0,  # 14主星
            "minor": 6.0,   # 六吉六煞
            "c_level": 1.5  # 丙级星
        }
        
        brightness_mod = {"庙": 1.25, "旺": 1.15, "得": 1.05, "利": 1.0, "平": 0.9, "不": 0.7, "陷": 0.5}
        transformation_mod = {"化禄": 4.0, "化权": 3.0, "化科": 2.5, "化忌": -5.0}

        for p in self.palaces.values():
            raw_score = 15.0  # 基础分
            
            # 1. 计算星曜能量
            for s in p.get("major_stars", []):
                mod = brightness_mod.get(p["star_brightness"].get(s, "平"), 1.0)
                raw_score += base_weights["major"] * mod
                
            for s in p.get("minor_stars", []):
                mod = brightness_mod.get(p["star_brightness"].get(s, "平"), 1.0)
                # 煞星（羊陀火铃劫空）赋予负面影响
                if s in ["擎羊", "陀罗", "火星", "铃星", "地劫", "地空"]:
                    raw_score -= base_weights["minor"] * (1.5 - mod)
                else:
                    raw_score += base_weights["minor"] * mod

            for s in p.get("c_stars", []):
                raw_score += base_weights["c_level"]

            # 2. 四化叠加
            for t in p.get("transformations", []):
                for key, val in transformation_mod.items():
                    if key in t:
                        raw_score += val
            
            # 3. 归一化处理 (映射到 0-100)
            # 假设一个中等合理的满负荷分数在 55 左右
            final_score = int(max(5, min(100, (raw_score / 55.0) * 100)))
            p["palace_score"] = final_score

    def _calculate_patterns(self) -> list:
        """根据 7 级亮度标准和星曜组合判定典型格局 (倪师重点强调)"""
        patterns = []
        # 获取核心宫位：命、财、官
        palaces_by_name = {p["name"]: p for p in self.palaces.values()}
        ming = palaces_by_name.get("命宫", {})
        guan = palaces_by_name.get("官禄宫", {})
        cai = palaces_by_name.get("财帛宫", {})
        qian = palaces_by_name.get("迁移宫", {})
        
        san_fang_si_zheng = [ming, guan, cai, qian]
        
        # 提取三方四正所有星曜和四化
        all_stars = set()
        all_trans = []
        for p in san_fang_si_zheng:
            all_stars.update(p.get("major_stars", []))
            all_stars.update(p.get("minor_stars", []))
            all_trans.extend(p.get("transformations", []))

        # 1. 日丽中天 (太阳在午且非陷/不)
        if "太阳" in ming.get("major_stars", []) and ming["branch"] == "午":
            if ming["star_brightness"].get("太阳") in ["庙", "旺"]:
                patterns.append("日丽中天格")
                
        # 2. 月朗天门 (太阴在亥且庙旺)
        if "太阴" in ming.get("major_stars", []) and ming["branch"] == "亥":
            if ming["star_brightness"].get("太阴") in ["庙", "旺"]:
                patterns.append("月朗天门格")

        # 3. 武府同临 (财库丰盈)
        if "武曲" in ming.get("major_stars", []) and "天府" in ming.get("major_stars", []):
            patterns.append("武府同临格")

        # 4. 石中隐玉 (巨门在子午坐命，见科禄权)
        if "巨门" in ming.get("major_stars", []) and ming["branch"] in ["子", "午"]:
            if any(t in "".join(all_trans) for t in ["化禄", "化权", "化科"]):
                patterns.append("石中隐玉格")

        # 5. 机月同梁 (天机 太阴 天同 天梁 聚三方)
        jt_stars = {"天机", "太阴", "天同", "天梁"}
        if jt_stars.issubset(all_stars):
            patterns.append("机月同梁格")

        # 6. 雄宿朝垣 (廉贞在寅申坐命)
        if "廉贞" in ming.get("major_stars", []) and ming["branch"] in ["寅", "申"]:
            if ming["star_brightness"].get("廉贞") in ["庙", "利", "平"]:
                patterns.append("雄宿朝垣格")

        # 7. 英星入庙 (破军在子午坐命)
        if "破军" in ming.get("major_stars", []) and ming["branch"] in ["子", "午"]:
            if ming["star_brightness"].get("破军") == "庙":
                patterns.append("英星入庙格")

        # 8. 杀破狼 (七杀 破军 贪狼 聚三方)
        spl_stars = {"七杀", "破军", "贪狼"}
        if spl_stars.issubset(all_stars):
            patterns.append("杀破狼格")

        return patterns

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
        self._arrange_changsheng_12_spirits(wuxing_ju_num, yin_yang_gender)
        self._arrange_xiao_xian(yin_yang_gender, life_branch, birth_year, target_year)
        
        shen_gong_branch = self._calculate_shen_gong(life_branch)
        # 补充丙级星与主星
        self._arrange_c_level_stars(life_branch, shen_gong_branch)
        self._calculate_star_brightness()
        self._calculate_palace_weights()
        
        ming_zhu, shen_zhu = self._arrange_master_stars(life_branch)
        nayin = self._calculate_nayin()

        # 4. 计算格局 (天纪派 7级标准优化版)
        patterns = self._calculate_patterns()
        
        shen_gong_name = self.palaces[shen_gong_branch]["name"]
        
        self.meta = {
            "life_palace": f"{life_stem}{life_branch}",
            "wuxing_ju": WUXING_JU[wuxing_ju_num],
            "nayin": nayin, 
            "ziwei_position": ziwei_branch,
            "yin_yang_gender": yin_yang_gender,
            "shen_gong": f"{self.palaces[shen_gong_branch]['stem']}{shen_gong_branch}",
            "shen_gong_palace": shen_gong_name,
            "ming_zhu": ming_zhu,
            "shen_zhu": shen_zhu,
            "patterns": patterns
        }
        
        return {"meta": self.meta, "palaces": [self.palaces[b] for b in DIZHI]}


if __name__ == "__main__":
    # 甲子年，正月，十五日，子时
    engine = ZiweiCoreEngine(year_stem="甲", year_branch="子", month_leap_num=1, day=15, hour_branch="子", gender="男")
    chart = engine.generate_chart()
    
    print("【天纪版 高阶紫微全盘打印 (包含权重评分/辅星/四化)】")
    print(f"命宫: {chart['meta']['life_palace']} | 局数: {chart['meta']['wuxing_ju']} | 紫微星: {chart['meta']['ziwei_position']}")
    print("=" * 100)
    for p in chart['palaces']:
        ms = ",".join(p['major_stars']) if p['major_stars'] else "无"
        mins = ",".join(p['minor_stars']) if p['minor_stars'] else "无"
        trans = ",".join(p['transformations']) if p['transformations'] else ""
        score = p.get('palace_score', 0)
        print(f"[{p['stem']}{p['branch']}宫] {p['name'].ljust(4, '　')} | 分数: {str(score).ljust(3)} | 大运: {p['dayun'].ljust(5)} | 主: {ms.ljust(8, '　')} | 辅: {mins.ljust(15, '　')} | {trans}")
