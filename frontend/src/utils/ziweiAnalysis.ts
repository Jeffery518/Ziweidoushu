export interface PalaceData {
    branch: string;
    name: string;
    major_stars: string[];
    minor_stars: string[];
    transformations: string[];
    star_brightness?: Record<string, string>;
}

export interface ChartMeta {
    life_palace: string;
    wuxing_ju: string;
    ziwei_position: string;
    yin_yang_gender?: string;
}

export interface ZiweiChartData {
    meta: ChartMeta;
    palaces: PalaceData[];
}

export interface AnalysisItem {
    id: string;
    type: "star" | "transformation" | "pattern" | "warning" | "info";
    title: string;
    content: string;
    level: "info" | "success" | "warning" | "destructive";
}

export function analyzePalace(palace: PalaceData, _chart: ZiweiChartData): AnalysisItem[] {
    const items: AnalysisItem[] = [];

    const hasStar = (name: string) => palace.major_stars.some(s => s.includes(name)) || palace.minor_stars.some(s => s.includes(name));
    const isLifePalace = palace.name === "命宫";

    // 1. 十四主星论断 (基于倪海厦《天纪》)
    if (hasStar("紫微")) {
        const hasZuoYou = hasStar("左辅") || hasStar("右弼");
        let content = "紫微为北斗帝星，代表文武官带、正财，能解厄延寿。";
        if (hasZuoYou) {
            content += " 命逢紫微且有左辅右弼相会，格局大贵，为人厚道。";
        } else if (isLifePalace) {
            content += " 无辅星相助犹如孤君，性情可能较为孤独。";
        }
        items.push({ id: "ziwei", type: "star", title: "紫微星", content, level: hasZuoYou ? "success" : "info" });
    }

    if (hasStar("天府")) {
        items.push({
            id: "tianfu", type: "star", title: "天府星",
            content: "南斗君主，代表个性温和、稳重理财。犹如大总管或大地主，不惹是非但遇事不怕。强项在于守成与积累，切忌高风险投机。",
            level: "success"
        });
    }

    if (hasStar("太阳")) {
        const isSunTrapped = palace.star_brightness?.["太阳"] === "陷";
        if (isSunTrapped) {
            items.push({
                id: "taiyang_fall", type: "warning", title: "太阳落陷",
                content: "太阳落陷多主辛苦劳碌，披星戴月。女命逢之尤其代表父、夫、子缘分较薄或聚少离多。需借助后天风水化解。",
                level: "destructive"
            });
        } else {
            let content = "代表武官带（军警法政），能解厄、发横财。在人物上代表父亲、丈夫、儿子。";
            if (palace.branch === "午") content += " 太阳在午为【日丽中天】之格，极其壮旺，武职或从商大利！大富大贵。";
            items.push({ id: "taiyang", type: "star", title: "太阳星", content, level: "success" });
        }
    }

    if (hasStar("武曲")) {
        items.push({
            id: "wuqu", type: "star", title: "武曲星",
            content: "大财星、武官星王。个性果决火爆，身材多金水相生（方圆或短壮，属富贵相）。利于财运与执行力。",
            level: "success"
        });
    }

    if (hasStar("天机")) {
        items.push({
            id: "tianji", type: "star", title: "天机星",
            content: "代表文官带（公教人员、银行），也主正财。入命者多精干、反应快、聪明多智虑。",
            level: "info"
        });
    }

    if (hasStar("七杀")) {
        let content = "将星入命，主目大、性急、多疑，利于武职。代表劳碌与消耗。";
        if (palace.branch === "午" || palace.branch === "申") content += " 七杀在午申为【七杀朝斗】，将星得地，威震边疆。";
        items.push({ id: "qisha", type: "star", title: "七杀星", content, level: "info" });
    }

    if (hasStar("破军")) {
        let content = "武官星，主破耗、孤僻。不重蝇头小利，破旧立新。";
        if (palace.branch === "子" || palace.branch === "午") {
            content += " 破军居子午为【英星入庙】，发武职，男命甚佳。";
        }
        items.push({ id: "pojun", type: "star", title: "破军星", content, level: "info" });
    }

    if (hasStar("贪狼")) {
        let content = "大桃花星，也主偏财、酒色财气。";
        if (palace.branch === "亥" || palace.branch === "子") {
            content += " 贪狼在水宫为【泛水桃花】，异性缘极强。";
        }
        if (hasStar("火星") || hasStar("铃星")) {
            content += " 贪狼遇火铃为【火贪格/铃贪格】，主爆发横财或武贵。";
        }
        items.push({ id: "tanlang", type: "star", title: "贪狼星", content, level: "warning" });
    }

    if (hasStar("廉贞")) {
        let content = "次桃花，代表清廉也主武官带。";
        if ((palace.branch === "寅" || palace.branch === "申") && isLifePalace) {
            content += " 廉贞在寅申为【雄宿朝元】，宜军警或经商当老板，但须防桃花劫。";
        }
        items.push({ id: "lianzhen", type: "star", title: "廉贞星", content, level: "info" });
    }

    if (hasStar("巨门")) {
        const isJuTrapped = palace.star_brightness?.["巨门"] === "陷";
        let content = "代表口舌、是非、争执。";
        if (hasStar("太阳")) {
            content += " 太阳巨门同宫/相会为【巨日格】，成格者大富（商人巨贾）或名嘴。但落陷则易生暗耗或感情波折。";
        }
        if (isJuTrapped) {
            items.push({ id: "jumen", type: "warning", title: "巨门落陷", content: content + " 巨门落陷多口舌官非或牢狱之灾。", level: "destructive" });
        } else {
            items.push({ id: "jumen", type: "star", title: "巨门星", content: content + " 庙旺主口才极佳，宜凭口业生财。", level: "info" });
        }
    }

    if (hasStar("太阴")) {
        const isTaiyinTrapped = palace.star_brightness?.["太阴"] === "陷";
        if (palace.branch === "亥") {
            items.push({ id: "taiyin_hai", type: "pattern", title: "月朗天门", content: "太阴在亥宫入庙，为月朗天门格。无论男女皆主富贵，女命极佳，秀丽聪明。", level: "success" });
        } else if (isTaiyinTrapped) {
            items.push({ id: "taiyin_trapped", type: "warning", title: "太阴落陷", content: "太阴落陷多主劳心，男命不利妻母缘分。", level: "warning" });
        } else {
            items.push({ id: "taiyin", type: "star", title: "太阴星", content: "代表母亲、妻子，主正财与理财，文官带。在子丑亥时最佳。", level: "success" });
        }
    }

    // 2. 四化星论断
    const allTrans = palace.transformations || [];
    const hasTrans = (t: string) => allTrans.some(x => x.includes(t)) || palace.major_stars.some(s => s.endsWith(t)) || palace.minor_stars.some(s => s.endsWith(t));

    if (hasTrans("科")) {
        items.push({ id: "huake", type: "transformation", title: "化科", content: "主科名、名气彰显。代表拥有专业技术专长（如医生、律师、教授等），考试科甲极佳。", level: "success" });
    }
    if (hasTrans("权")) {
        items.push({ id: "huaquan", type: "transformation", title: "化权", content: "象征权力、官印，性情刚强果决，具备领导或掌控能力。", level: "success" });
    }
    if (hasTrans("禄")) {
        items.push({ id: "hualu", type: "transformation", title: "化禄", content: "主财禄、守成。有化禄在宫，多为生意人或享受财富，若与权星同宫，必做老板掌财权。", level: "success" });
    }
    if (hasTrans("忌")) {
        items.push({ id: "huaji", type: "transformation", title: "化忌", content: "象征劫杀、想不开、蹇滞、破耗。凡事阻碍较大，常事倍功半或引发纠纷。须戒急用忍，防守为上。", level: "destructive" });
    }

    // 3. 其它重要辅星/格局
    if (hasStar("文曲") || hasStar("文昌")) {
        items.push({ id: "wenchangqu", type: "star", title: "文昌/文曲", content: "主科甲、文才、学术。逢太阴则才华横溢（但也易犯桃花）。在流年多指升学考试或金榜题名。", level: "info" });
    }
    if (hasStar("天钺") || hasStar("天魁")) {
        items.push({ id: "kuiyue", type: "star", title: "天魁/天钺", content: "贵人星，一生多得长辈或提携，亦主科甲、才艺。", level: "success" });
    }
    if (hasStar("红鸾") || hasStar("天喜")) {
        let content = "主桃花、喜庆。在命宫/夫妻早婚，遇煞星也不轻易离异。";
        if (palace.name === "夫妻宫" || isLifePalace) {
            content += " 男命必招美妻，女命必得贵夫。";
        }
        items.push({ id: "hongluan", type: "star", title: "红鸾/天喜", content, level: "info" });
    }

    if (items.length === 0) {
        items.push({
            id: "empty", type: "info", title: "宫位沉寂",
            content: "该宫位暂无强烈显象的主星或四化。可结合对宫（迁移/或本对宫）的星曜一同参考判读。",
            level: "info"
        });
    }

    return items;
}

export function analyzeWholeChart(chart: ZiweiChartData): AnalysisItem[] {
    const items: AnalysisItem[] = [];

    const getPalace = (name: string) => chart.palaces.find(p => p.name === name);
    const lifeP = getPalace("命宫");
    const wealthP = getPalace("财帛宫");
    const careerP = getPalace("官禄宫");
    const travelP = getPalace("迁移宫");
    const spouseP = getPalace("夫妻宫");
    const childP = getPalace("子女宫");
    const parentP = getPalace("父母宫");

    if (!lifeP || !wealthP || !careerP || !travelP) return items;

    const sanFang = [lifeP, wealthP, careerP, travelP];

    // Helper routines
    const getStars = (p: PalaceData) => [...p.major_stars, ...p.minor_stars];
    const hasTrans = (p: PalaceData, t: string) => (p.transformations || []).some(x => x.includes(t)) || getStars(p).some(s => s.endsWith(t));
    const hasStar = (p: PalaceData, name: string) => getStars(p).some(s => s.includes(name));
    const shaStars = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"];
    const countSha = (p: PalaceData) => shaStars.filter(s => hasStar(p, s)).length;

    // 1. 科权禄 (Ke, Quan, Lu)
    const sanFangHasKe = sanFang.some(p => hasTrans(p, "科"));
    const sanFangHasQuan = sanFang.some(p => hasTrans(p, "权"));
    const sanFangHasLu = sanFang.some(p => hasTrans(p, "禄"));
    const sanFangHasJi = sanFang.some(p => hasTrans(p, "忌"));

    if (sanFangHasKe && sanFangHasQuan && sanFangHasLu) {
        items.push({ id: "global_kql", type: "pattern", title: "三奇嘉会 (科权禄会命)", content: "算命第一件事先看科权禄。此命盘科权禄在三方四正会照，即“科权禄会命”。不用多算，此局必定是大老板或高级主管，事业版图极大。", level: "success" });
    } else if (!sanFangHasKe && !sanFangHasQuan && !sanFangHasLu) {
        items.push({ id: "global_no_kql", type: "info", title: "三方无科权禄", content: "命宫及三方四正（财帛、官禄、迁移）未见科权禄，一辈子相对比较辛苦，需靠自身踏实努力，大器晚成。", level: "info" });
    }

    // 2. 命宫主星性格
    if (hasStar(lifeP, "七杀")) {
        items.push({ id: "global_life_qisha", type: "star", title: "本命主星：七杀", content: "七杀坐命，个性极强，不服输、做事冲。极度不喜欢被别人管，适合独立开创或武职。", level: "warning" });
    }
    if (hasStar(lifeP, "廉贞")) {
        let content = "廉贞坐命，情绪强烈，非常重感情。";
        if (hasStar(lifeP, "破军")) content += " 廉贞遇破军同行，人生波动将会非常大。";
        items.push({ id: "global_life_lianzhen", type: "star", title: "本命主星：廉贞", content, level: "info" });
    }
    if (hasStar(lifeP, "武曲")) {
        items.push({ id: "global_life_wuqu", type: "star", title: "本命主星：武曲", content: "武曲坐命，为人极其现实，非常会赚钱。可以说一辈子都在算钱，对商业和数字有着天生的敏锐度。", level: "success" });
    }
    if (hasStar(lifeP, "天机")) {
        items.push({ id: "global_life_tianji", type: "star", title: "本命主星：天机", content: "天机坐命，天生聪明，思虑极多。但是容易“想太多”而行动力不足，适合充当军师、幕僚之位。", level: "info" });
    }

    // 3. 三方四正煞星评估
    const totalShaInSanFang = sanFang.reduce((sum, p) => sum + countSha(p), 0);

    if (totalShaInSanFang >= 4) {
        items.push({ id: "global_sanfang_sha", type: "warning", title: "三方煞星集结", content: "三方四正煞星云集（羊陀火铃空劫），预示人生波动非常大，多成多败，须修心养性，防范意外破耗。", level: "destructive" });
    }

    // 4. 重大格局
    // 巨日格
    if (sanFang.some(p => hasStar(p, "巨门") && hasStar(p, "太阳"))) {
        const isMale = chart.meta.yin_yang_gender?.includes("男");
        const content = isMale
            ? "太阳巨门同宫/相会为【巨日格】。男命主名嘴、巨贾，跨国贸易大富大贵。"
            : "太阳巨门同宫/相会为【巨日格】。女命若逢此格多为偏房或感情波折（唯遇旺地无煞方解）。";
        items.push({ id: "global_pattern_juri", type: "pattern", title: "巨日格", content, level: sanFangHasJi ? "warning" : "success" });
    }
    // 机月同梁
    if (sanFang.some(p => hasStar(p, "天机")) && sanFang.some(p => hasStar(p, "太阴")) && sanFang.some(p => hasStar(p, "天同")) && sanFang.some(p => hasStar(p, "天梁"))) {
        items.push({ id: "global_pattern_jiyue", type: "pattern", title: "机月同梁", content: "天机、太阴、天同、天梁在三方四正完整会照。这是极佳的“公家单位命”或大型企业安稳职员，一生平顺稳当。", level: "success" });
    }
    // 武贪格
    if (sanFang.some(p => hasStar(p, "武曲") && hasStar(p, "贪狼"))) {
        let content = "武曲贪狼同行/对照。主大财星与桃花、晚发之局。";
        if (sanFangHasLu) content += " 逢化禄，必定暴发成为巨富！";
        items.push({ id: "global_pattern_wutan", type: "pattern", title: "武贪格", content, level: "success" });
    }

    // 5. 事业 (官禄宫)
    if (hasStar(careerP, "紫微")) {
        items.push({ id: "global_career_ziwei", type: "star", title: "事业（官禄宫）：展现管理", content: "官禄宫见紫微帝星，天生就是做主管、带团队的管理层人才。", level: "success" });
    } else if (hasStar(careerP, "巨门")) {
        items.push({ id: "global_career_jumen", type: "star", title: "事业（官禄宫）：口业生财", content: "官禄宫巨门，事业必须靠口才。最适合当律师、教师、讲师、法官或卓越的销售代表。", level: "info" });
    } else if (careerP.major_stars.length === 0) {
        items.push({ id: "global_career_empty", type: "info", title: "事业（官禄宫）：空宫", content: "官禄宫内无主星（空宫），倪海厦常言：“这个人不适合做官。” 亦很难在庞大体制内安稳掌权，建议自由职业或自立门户。", level: "warning" });
    }

    // 6. 财运 (财帛宫)
    if (hasStar(wealthP, "廉贞") && hasStar(wealthP, "破军")) {
        items.push({ id: "global_wealth_lianpo", type: "warning", title: "财运（财帛宫）：不可从商", content: "财帛宫见廉贞破军，极不适合自己做生意，强行创业极易破败。宜凭借专业技能领薪水安稳度日。", level: "destructive" });
    } else if (hasTrans(wealthP, "禄") || (hasTrans(wealthP, "禄") && (hasStar(wealthP, "武曲") || hasStar(wealthP, "贪狼")))) {
        items.push({ id: "global_wealth_wulu", type: "star", title: "财运（财帛宫）：财星逢禄", content: "财帛宫逢化禄，或大财星（武曲/贪狼）居其中，极其会赚钱，天生的生意人或投资高手，一辈子不缺钱。", level: "success" });
    }

    // 7. 婚姻 (夫妻宫)
    if (spouseP) {
        if (hasStar(spouseP, "廉贞") && hasStar(spouseP, "破军")) {
            items.push({ id: "global_spouse_lianpo", type: "warning", title: "婚姻（夫妻宫）：非生离即死别", content: "夫妻宫见廉贞破军，乃感情大凶之象，非生离即是死别。化解之道在于晚婚，或者从事常需与伴侣聚少离多的行业。", level: "destructive" });
        } else if (hasStar(spouseP, "天府")) {
            items.push({ id: "global_spouse_tianfu", type: "star", title: "婚姻（夫妻宫）：太太很好", content: "夫妻宫得天府星，主配偶温厚持家。（若为男命）倪海厦常断：“太太极其贤惠，太太很好。”能稳固后方。", level: "success" });
        } else if (countSha(spouseP) === 1 && spouseP.major_stars.length === 0) { // 单星独守最凶 (尤其是凶星单守)
            // 修正：单星独守最凶可以是包含主星时，若只有一颗煞星也很凶。
            const sha = shaStars.find(s => hasStar(spouseP, s));
            if (sha) {
                items.push({ id: "global_spouse_sha", type: "warning", title: `婚姻：煞星独守（${sha}）`, content: `倪海厦认为“单星独守最凶”。夫妻宫仅有一颗煞星（如${sha}）独守，婚姻极难稳定，易生感情横祸。`, level: "destructive" });
            }
        } else if (hasStar(spouseP, "红鸾") || hasStar(spouseP, "天喜")) {
            items.push({ id: "global_spouse_peach", type: "star", title: "婚姻（夫妻宫）：桃花满溢", content: "夫妻宫有红鸾或天喜等桃花星，异性缘极佳，很容易结婚，常常是早婚定局。", level: "info" });
        }
    }

    // 8. 子女与父母
    if (childP) {
        if (hasTrans(childP, "忌") || countSha(childP) > 1) {
            items.push({ id: "global_child_ji", type: "warning", title: "子女缘薄", content: "子女宫化忌或煞星重，主与子女缘分较薄，或因子女而极度操心劳碌。", level: "warning" });
        }
    }
    if (parentP) {
        if (hasStar(parentP, "廉贞") && hasStar(parentP, "破军")) {
            items.push({ id: "global_parent_lianpo", type: "warning", title: "长辈：父母离异", content: "父母宫见廉贞、破军，多预示父母感情不和、或早年父母离异，与自身缘分极为浅薄。", level: "warning" });
        }
    }

    // 9. 迁移宫
    if (travelP) {
        if (hasTrans(travelP, "禄")) {
            items.push({ id: "global_travel_lu", type: "star", title: "外地发财", content: "迁移宫（外地运）化禄，出门见大财。最好离开出生地去外地发展、经商，必定大放异彩。", level: "success" });
        }
        if (hasStar(travelP, "天马")) {
            items.push({ id: "global_travel_ma", type: "star", title: "事业驿马", content: "迁移宫逢天马，一生经常需要出差或在异乡奔波，这叫“事业在外”。", level: "info" });
        }
    }

    // 兜底：如果全局都没有太多命格
    if (items.length === 0) {
        items.push({ id: "global_empty", type: "info", title: "总局平稳", content: "此命格三方四正较为平稳均和，无极端之大起大落现象。人生命运多受大限与流年流转影响，宜多修身养性积累阴德。", level: "info" });
    }

    return items;
}
