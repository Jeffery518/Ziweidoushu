export type { AnalysisItem };

interface AnalysisItem {
    id: string;
    type: "star" | "pattern" | "transformation" | "info" | "warning";
    title: string;
    content: string;
    level: "success" | "info" | "warning" | "destructive";
}

import type { ZiweiChartData } from "../components/ZiweiChart";
import type { PalaceData } from "../components/PalaceBox";

export function analyzePalace(palace: PalaceData, chart: ZiweiChartData): AnalysisItem[] {
    const items: AnalysisItem[] = [];

    // Helper routines
    const getStars = (p: PalaceData) => [...p.major_stars, ...p.minor_stars];
    const hasTrans = (p: PalaceData, t: string) => {
        const trans = p.transformations || [];
        // Handle both object-like {type, star} and string formats if any
        return trans.some((x: any) => typeof x === 'string' ? x.includes(t) : x.type === t);
    };

    // 1. 检查四化
    if (hasTrans(palace, "忌")) {
        items.push({
            id: `palace_ji_${palace.name}`,
            type: "transformation",
            title: `化忌落${palace.name}`,
            content: `化忌落入${palace.name}，主该领域多有阻碍、是非或执念。倪师云：位可改天命，须调理地理方位来化解先天之格。`,
            level: "destructive"
        });
    }

    if (hasTrans(palace, "禄")) {
        items.push({
            id: `palace_lu_${palace.name}`,
            type: "transformation",
            title: `化禄落${palace.name}`,
            content: `化禄落入${palace.name}，主该领域有财禄或顺遂之象。倪师强调：禄存、化禄为解厄之神，见禄则生机显现。`,
            level: "success"
        });
    }

    return items;
}

export function analyzeWholeChart(chart: ZiweiChartData): AnalysisItem[] {
    const items: AnalysisItem[] = [];

    // 🏮 1. 深度宫位匹配逻辑 (解决官禄/事业、财帛/财库等名称变体)
    const getPalace = (names: string[]) => chart.palaces.find(p => names.some(n => p.name.includes(n)));
    
    const lifeP = getPalace(["命宫"]);
    const wealthP = getPalace(["财帛", "财库"]);
    const careerP = getPalace(["官禄", "事业", "工作"]);
    const travelP = getPalace(["迁移", "出门"]);
    
    if (!lifeP) return [{
        id: "loading", type: "info", title: "命格初始化",
        content: "正在解析星盘格局...",
        level: "info"
    }];

    // 🏮 2. 格局深度识别 (倪师《天纪》核心格局库)
    const majors = lifeP.major_stars || [];
    const isShaPoLang = majors.some(s => ["七杀", "破军", "贪狼"].includes(s));
    const isJiYueTongLiang = majors.some(s => ["天机", "太阴", "天同", "天梁"].includes(s));
    const hasZiWei = majors.includes("紫微");

    // 助手函数：检测特定宫位是否有特定星
    const checkPalaceStar = (pName: string, starName: string) => {
        const p = chart.palaces.find(px => px.name === pName);
        return p && (p.major_stars.includes(starName) || p.minor_stars.includes(starName));
    };

    // 2.1 日月并明格 (太阳在辰，太阴在戌)
    const sunInChen = checkPalaceStar("命宫", "太阳") && lifeP.branch === "辰";
    const moonInXu = chart.palaces.find(p => p.branch === "戌")?.major_stars.includes("太阴");

    // 2.2 日月反背格 (太阳在戌，太阴在辰 - 倪师云：白手起家)
    const sunInXu = checkPalaceStar("命宫", "太阳") && lifeP.branch === "戌";
    const moonInChen = chart.palaces.find(p => p.branch === "辰")?.major_stars.includes("太阴");

    // 2.3 石中隐玉 (巨门在子或午)
    const isShiZhongYinYu = majors.includes("巨门") && (lifeP.branch === "子" || lifeP.branch === "午");

    // 2.4 马头带箭 (擎羊在午宫坐命)
    const isMaTouDaiJian = lifeP.minor_stars.includes("擎羊") && lifeP.branch === "午";

    // 2.5 月朗天门 (太阴在亥宫坐命)
    const moonInHai = majors.includes("太阴") && lifeP.branch === "亥";

    // 2.6 巨日同宫 (太阳巨门在寅宫坐命)
    const juRiInYin = majors.includes("太阳") && majors.includes("巨门") && lifeP.branch === "寅";

    // 2.7 阳梁昌禄 (太阳、天梁、文昌、化禄)
    const hasYangLiang = majors.includes("太阳") && majors.includes("天梁");
    const hasChangLu = (lifeP.minor_stars.includes("文昌") || (travelP?.minor_stars || []).includes("文昌")) && 
                      ((lifeP.transformations || []).some((t: any) => t.type === "lu") || (careerP?.transformations || []).some((t: any) => t.type === "lu"));

    let corePattern: AnalysisItem = {
        id: "pattern_summary",
        type: "pattern",
        title: "先天命格综述",
        content: `命宫坐${majors.join('、') || '平稳之星'}。倪师断命法则：先看格局，再看四化。此命格中正平和，宜立稳根基，徐图进取。`,
        level: "info"
    };

    if (majors.length === 0) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：命无正曜 (借宫而推)", content: "命宫无主星。倪师核心断法：须借对宫迁移宫而论。此格之人一生多变，适应力强，但需注意人生轴心不稳，最宜'位可改命'。", level: "warning" };
    } else if (isMaTouDaiJian) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：马头带箭 (威镇边疆)", content: "擎羊在午位坐命。倪师断语：非比寻常之格，主异路功名。虽一生惊险重重，但终能威震一方，适合武职或开拓性事业。", level: "success" };
    } else if (isShiZhongYinYu) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：石中隐玉 (内秀之格)", content: "巨门居子午。倪师云：此类人如石中藏玉，才华不外露，需经磨砺方能显贵。早年辛苦，晚年大发。", level: "success" };
    } else if (sunInChen && moonInXu) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：日月并明 (光明磊落)", content: "太阳在辰，太阴在戌。倪师推崇：此格之人为人正直、大公无私。格局极高，属于一生近贵之命。", level: "success" };
    } else if (sunInXu && moonInChen) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：日月反背 (白手起家)", content: "太阳在戌，太阴在辰。倪师云：主劳碌，披星戴月。但若四化得位，反能白手起家，大富大贵，属于辛苦成家之典范。", level: "info" };
    } else if (moonInHai) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：月朗天门 (富贵清纯)", content: "太阴在亥，明月高悬。倪师云：主大富且极其清高。适合从事学术、文化或政界，人品第一。", level: "success" };
    } else if (juRiInYin) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：巨日同宫 (名扬四海)", content: "太阳巨门同寅。倪师论断：太阳初升，名声大噪。适合凭借口才或专业知名度立命，先名后利。", level: "success" };
    } else if (hasYangLiang && hasChangLu) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：阳梁昌禄 (金榜题名)", content: "倪师推崇：阳梁昌禄，古今科考第一格。主聪慧过人，利公职、利科研，功名利禄随才华而至。", level: "success" };
    } else if (isShaPoLang) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：杀破狼 (开拓变动)", content: "七杀破军贪狼。倪师云：'杀破狼'定终身。主一生波折多、变动多。宜动不宜静，适合独立开创局面。", level: "success" };
    } else if (isJiYueTongLiang) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格局：机月同梁 (稳健步进)", content: "天机太阴天同天梁。倪师定论：宜在稳定体系内求发展。做事周全细腻，属于大器晚成的稳健之格。", level: "success" };
    } else if (hasZiWei) {
        corePattern = { id: "pattern_summary", type: "pattern", title: "格高：君临天下", content: "紫微入命，天生贵气。倪师叮嘱：若见百官朝拱则是顶级之命。需修心养性，避免孤高而无援。", level: "success" };
    }
    items.push(corePattern);

    // 🏮 3. 三方四正综合气势评估
    const sanFang = [lifeP, wealthP, careerP, travelP].filter(Boolean) as PalaceData[];
    const hasTransGlobal = (p: PalaceData, t: string) => {
        const trans = p.transformations || [];
        return trans.some((x: any) => typeof x === 'string' ? x.includes(t) : x.type === t);
    };

    // 检查科权禄三奇嘉会
    const sanFangHasKe = sanFang.some(p => hasTransGlobal(p, "ke"));
    const sanFangHasQuan = sanFang.some(p => hasTransGlobal(p, "quan"));
    const sanFangHasLu = sanFang.some(p => hasTransGlobal(p, "lu"));

    if (sanFangHasKe && sanFangHasQuan && sanFangHasLu) {
        items.push({
            id: "global_kql", type: "transformation", title: "三奇嘉会：极贵之格",
            content: "倪师断命秘诀：先看科权禄。此命盘三奇嘉会，事业版图极大，必定是独当一面的将领之才。",
            level: "success"
        });
    }

    // 🏮 4. 四化重点警示
    const hasHuaJiInput = (lifeP.transformations || []).some((t: any) => typeof t === 'string' ? t.includes("忌") : t.type === "ji");
    if (hasHuaJiInput) {
        items.push({
            id: "warning_ji", type: "warning", title: "重点警示：化忌压命",
            content: "命宫见化忌，主一生多波折。倪师化解之道：'位可改命'，须利用地理方位及后天修养来化解。",
            level: "destructive"
        });
    }

    // 🏮 5. 倪师断命要旨总结
    items.push({
        id: "master_wisdom",
        type: "info",
        title: "倪师断命精要",
        content: "倪海厦老师曰：命虽有定数，位可改天命。心态定乾坤。凡事先尽人事，再听天命。",
        level: "info"
    });

    return items;
}
