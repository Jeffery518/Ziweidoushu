"use client";

import { Sparkles, BookOpen, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export function NiHaishaIntro({ className }: { className?: string }) {
  return (
    <div className={cn(
      "p-6 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-xl shadow-black/5 relative overflow-hidden group",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/60 pb-3">
        <div className="p-2 rounded-lg bg-zinc-900 text-primary">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-widest text-zinc-100 font-serif">关于《天纪》与倪海厦</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-tighter">Academic Wisdom of Master Ni</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Quote className="absolute -top-1 -left-1 w-8 h-8 text-zinc-900 -z-10" />
          <p className="text-[12px] leading-relaxed text-zinc-400 font-serif pl-2">
            倪海厦老师（1954-2012）是享誉海内外的经方中医学大师，其著作《天纪》融合了易经、紫微斗数与地理环境学，
            强调“象、数、理”的逻辑推演，主张医命同源，破除传统命理的迷信色彩，深受广大易学爱好者的推崇。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <h4 className="text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              核心思想
            </h4>
            <p className="text-[10px] text-zinc-500 font-serif">
              主张辩证看命，强调个人的主观能动性与修身养性。
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <h4 className="text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              天纪著作
            </h4>
            <p className="text-[10px] text-zinc-500 font-serif">
              包括《天纪》、《人纪》、《地纪》三大传世典籍。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

