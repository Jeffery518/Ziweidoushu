"use client";

import { useState, useCallback } from "react";
import { MessageSquarePlus, X, Star, Send, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api-backend";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function FeedbackWidget() {
  const [isOpen, setIsOpen]     = useState(false);
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [content, setContent]   = useState("");
  const [contact, setContact]   = useState("");
  const [status, setStatus]     = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleClose = useCallback(() => {
    // 成功提交后不重置（保留"感谢"状态），其它情况重置
    if (status !== "success") {
      setIsOpen(false);
    } else {
      setIsOpen(false);
      setTimeout(() => {
        setRating(0); setContent(""); setContact(""); setStatus("idle");
      }, 400);
    }
  }, [status]);

  const handleSubmit = async () => {
    if (rating === 0)    { setErrorMsg("请先选择星级评分"); return; }
    if (!content.trim()) { setErrorMsg("请填写您的意见"); return; }
    setErrorMsg("");
    setStatus("loading");

    try {
      const res = await fetch(`${API_BASE}/api/v1/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content: content.trim(), contact: contact.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "提交失败");
      }
      setStatus("success");
      // 3 秒后自动关闭
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => { setRating(0); setContent(""); setContact(""); setStatus("idle"); }, 400);
      }, 2800);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "网络错误，请稍后重试");
    }
  };

  return (
    <>
      {/* ── 悬浮触发按钮 ── */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="提交意见反馈"
        className={cn(
          "fixed bottom-6 right-6 z-40 group",
          "flex items-center gap-2 px-4 py-3 rounded-2xl",
          "bg-purple-600 hover:bg-purple-500 text-white",
          "shadow-[0_8px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.55)]",
          "transition-all duration-300 hover:-translate-y-1 active:scale-95",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="text-[13px] font-bold tracking-wide">意见反馈</span>
      </button>

      {/* ── 背景遮罩 ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleClose}
        />
      )}

      {/* ── 弹出卡片 ── */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-3rem)]",
          "rounded-2xl border border-zinc-200 dark:border-zinc-700/60",
          "bg-white dark:bg-zinc-900 shadow-2xl",
          "transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-4 pointer-events-none"
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 tracking-wide">意见与建议</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-4 space-y-4">
          {status === "success" ? (
            /* 成功状态 */
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-in zoom-in-50 duration-300" />
              <p className="font-bold text-zinc-800 dark:text-zinc-200">感谢您的宝贵意见！</p>
              <p className="text-xs text-zinc-500">您的反馈将帮助我们持续改进 🙏</p>
            </div>
          ) : (
            <>
              {/* 星级评分 */}
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">使用体验评分</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      aria-label={`${star} 星`}
                      className="transition-transform duration-100 hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={cn(
                          "w-7 h-7 transition-colors duration-150",
                          star <= (hovered || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-zinc-300 dark:text-zinc-600"
                        )}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-xs text-amber-500 font-bold self-center ml-1">
                      {["", "很差", "较差", "一般", "不错", "非常好"][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* 意见文本框 */}
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                  您的意见 <span className="text-zinc-400">（最多 500 字）</span>
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 500))}
                  placeholder="功能建议、发现的问题、使用体验…"
                  rows={3}
                  className={cn(
                    "w-full resize-none text-sm rounded-xl p-3 outline-none",
                    "bg-zinc-50 dark:bg-zinc-900/50 border",
                    "border-zinc-200 dark:border-zinc-700",
                    "focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20",
                    "text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                    "transition-all duration-200"
                  )}
                />
                <p className="text-right text-[11px] text-zinc-400 mt-1">{content.length}/500</p>
              </div>

              {/* 联系方式 */}
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                  联系方式 <span className="text-zinc-400">（选填）</span>
                </p>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="邮箱 / 微信，方便我们回复您"
                  className={cn(
                    "w-full text-sm rounded-xl p-3 outline-none",
                    "bg-zinc-50 dark:bg-zinc-900/50 border",
                    "border-zinc-200 dark:border-zinc-700",
                    "focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20",
                    "text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400",
                    "transition-all duration-200"
                  )}
                />
              </div>

              {/* 错误提示 */}
              {(status === "error" || errorMsg) && (
                <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-lg px-3 py-2">
                  {errorMsg}
                </p>
              )}

              {/* 提交按钮 */}
              <button
                onClick={handleSubmit}
                disabled={status === "loading"}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl",
                  "bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm",
                  "transition-all duration-200 hover:-translate-y-0.5 active:scale-95",
                  "disabled:opacity-70 disabled:hover:translate-y-0 shadow-md hover:shadow-purple-500/30"
                )}
              >
                {status === "loading" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> 提交中...</>
                ) : (
                  <><Send className="w-4 h-4" /> 提交反馈</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
