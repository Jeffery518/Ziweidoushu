import React from "react";
import type { Metadata } from 'next';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// 预定义一些常搜的 SEO 关键词 (实际生产中，可由脚本动态生成数百个)
const SEO_MOCK_DATA: Record<string, { title: string; star: string; palace: string; content: string }> = {
    "tian-fu-zai-ming": {
        title: "天府星在命宫：倪海厦紫微斗数解析，如何做个稳重的守财人",
        star: "天府",
        palace: "命宫",
        content: "倪海厦老师常言：天府星在命，就像是一个大总管或大地主。此星不惹是非，但如果你惹他，他一定奉陪到底。天府入命的人，往往给人一种很稳当、可以信赖的感觉。天府是一颗财库星，也是一颗南斗帝王星。\n\n如果你是天府入命，记得在职场上要发挥你'包容体谅'与'稳重理财'的特质。不要轻易去赌博或者做高风险投机，因为你的命格强项在于'守成'与'积累'。"
    },
    "wu-qu-hua-ji": {
        title: "武曲化忌在迁移宫怎么办？倪师破解凶死外地之象",
        star: "武曲化忌",
        palace: "迁移宫",
        content: "在倪海厦《天纪》的论断中，武曲星代表将领、也是大财星。当它在迁移宫化忌，这叫‘凶死外地’之象！\n\n倪师特别强调，如果是这种象，绝对不能离开家乡去很远的地方做生意，否则极其容易遭遇横祸或破大财。化解之道不仅在于'不外出'，还需要结合家居风水，例如在客厅特定方位摆放避煞的器物，以及调整阳宅大门朝向。"
    },
    "tai-yang-zai-wu": {
        title: "太阳在午宫真的会大富大贵吗？解析日丽中天之局",
        star: "太阳",
        palace: "午宫",
        content: "太阳在午宫，此乃‘日丽中天’之格。只要不逢四煞（羊陀火铃），定能光芒万丈，主大贵！做事业可以做到非常大的局。\n\n倪师在批命时遇到这种格局，通常会断言此人一生坦荡，适合从事政治、外交、大规模贸易或公众瞩目的行业。白天出生的人（尤其生在炎夏）得此格更是如虎添翼。"
    }
};

export async function generateMetadata({ params }: { params: { keyword: string } }): Promise<Metadata> {
    const data = SEO_MOCK_DATA[params.keyword];
    if (!data) return { title: "页面未找到" };
    return {
        title: data.title,
        description: `为您带来倪海厦《天纪》版紫微斗数关于${data.star}在${data.palace}的详细解析与化解之道。`,
    };
}

export default function SEOPage({ params }: { params: { keyword: string } }) {
    const data = SEO_MOCK_DATA[params.keyword];

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold text-muted-foreground">此命盘格尚未收录。</h1>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto py-12 px-6">
            <Link href="/" className="inline-flex items-center text-sm text-primary/80 hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回天纪紫微排盘
            </Link>

            <article className="glass-panel p-8 md:p-12 rounded-3xl space-y-8 relative overflow-hidden">
                {/* 装饰性光晕 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <header className="space-y-4 relative z-10">
                    <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium tracking-wider text-muted-foreground">
                            {data.star}
                        </span>
                        <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-medium tracking-wider text-primary">
                            {data.palace}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-wide text-foreground">
                        {data.title}
                    </h1>
                </header>

                <div className="prose prose-invert prose-lg max-w-none relative z-10 text-muted-foreground/90 leading-relaxed font-serif tracking-wide border-t border-white/10 pt-8">
                    {data.content.split('\n\n').map((paragraph: string, idx: number) => (
                        <p key={idx} className={idx === 0 ? "text-xl font-medium text-foreground mb-6" : "mb-6"}>
                            {paragraph}
                        </p>
                    ))}
                </div>

                {/* 商业闭环：引导排盘 */}
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 flex flex-col items-center text-center space-y-4 relative z-10">
                    <h3 className="text-xl font-bold text-gradient">想知道你命盘中的隐藏玄机吗？</h3>
                    <p className="text-sm text-muted-foreground">倪海厦天纪排盘系统，输入生辰八字，即刻获取专属大师级批断。</p>
                    <Link
                        href="/"
                        className="mt-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                    >
                        免费精准排盘测算
                    </Link>
                </div>
            </article>
        </div>
    );
}
