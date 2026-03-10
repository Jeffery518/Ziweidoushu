"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lock, BarChart3, MessageSquare, Star,
  Download, RefreshCw, LogOut, TrendingUp,
  Users, Loader2, ShieldCheck, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api-backend";
const SESSION_KEY = "tianji_admin_token";

interface StatsData {
  total_charts:    number;
  today_charts:    number;
  total_feedbacks: number;
  avg_rating:      number;
}

interface FeedbackItem {
  id:        string;
  timestamp: string;
  rating:    number;
  content:   string;
  contact:   string;
}

// ── 星级渲染 ─────────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i <= n ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-600"
          )}
        />
      ))}
    </span>
  );
}

// ── 统计卡 ───────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex items-start gap-4 hover:border-zinc-700 transition-colors">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-zinc-100 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [token, setToken]           = useState("");
  const [inputToken, setInputToken] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [stats, setStats]           = useState<StatsData | null>(null);
  const [feedbacks, setFeedbacks]   = useState<FeedbackItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState<"overview" | "feedbacks">("overview");

  // 恢复 session
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setToken(saved);
  }, []);

  const fetchData = useCallback(async (tk: string) => {
    setIsRefreshing(true);
    try {
      const [statsRes, fbRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/stats`,     { headers: { "x-admin-token": tk } }),
        fetch(`${API_BASE}/api/v1/admin/feedbacks`, { headers: { "x-admin-token": tk } }),
      ]);
      if (!statsRes.ok || !fbRes.ok) throw new Error("unauthorized");
      const [statsJson, fbJson] = await Promise.all([statsRes.json(), fbRes.json()]);
      setStats(statsJson.data);
      setFeedbacks(fbJson.data);
    } catch {
      // token 失效则退出
      setToken("");
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // token 变化后拉数据
  useEffect(() => {
    if (token) fetchData(token);
  }, [token, fetchData]);

  const handleLogin = async () => {
    if (!inputToken.trim()) { setLoginError("请输入管理员密码"); return; }
    setIsLoggingIn(true); setLoginError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/verify`, {
        method: "POST",
        headers: { "x-admin-token": inputToken.trim() },
      });
      if (!res.ok) { setLoginError("密码错误，请重试"); return; }
      sessionStorage.setItem(SESSION_KEY, inputToken.trim());
      setToken(inputToken.trim());
    } catch {
      setLoginError("无法连接后端服务，请确认服务已启动");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(""); sessionStorage.removeItem(SESSION_KEY);
    setStats(null); setFeedbacks([]);
  };

  // 导出 CSV
  const exportCSV = () => {
    const header = ["ID", "时间", "评分", "意见", "联系方式"];
    const rows = feedbacks.map((fb) => [
      fb.id,
      new Date(fb.timestamp).toLocaleString("zh-CN"),
      fb.rating,
      `"${fb.content.replace(/"/g, '""')}"`,
      fb.contact || "—",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `天纪反馈_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── 登录界面 ──────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-800/60 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-wide">管理员后台</h1>
            <p className="text-sm text-zinc-500 mt-1">天纪·紫微斗数运营中心</p>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">
                管理员密码
              </label>
              <input
                type="password"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="请输入密码..."
                className={cn(
                  "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200",
                  "placeholder:text-zinc-600 outline-none",
                  "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                )}
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-lg px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl",
                "bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm",
                "transition-all duration-200 hover:-translate-y-0.5 active:scale-95",
                "disabled:opacity-70 disabled:hover:translate-y-0 shadow-md"
              )}
            >
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {isLoggingIn ? "验证中..." : "登录"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 主后台界面 ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* 顶部导航 */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/50 border border-purple-700/50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-100 tracking-wide">天纪运营后台</h1>
              <p className="text-[11px] text-zinc-500">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchData(token)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
              刷新
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={TrendingUp}    label="累计排盘次数" value={stats.total_charts}    sub="自服务上线起"    color="bg-blue-900/40 text-blue-400" />
            <StatCard icon={Calendar}      label="今日排盘次数" value={stats.today_charts}    sub={new Date().toLocaleDateString("zh-CN")} color="bg-emerald-900/40 text-emerald-400" />
            <StatCard icon={Users}         label="用户反馈总数" value={stats.total_feedbacks}                      color="bg-purple-900/40 text-purple-400" />
            <StatCard icon={Star}          label="平均评分"     value={`${stats.avg_rating} ★`} sub="满分 5 星"   color="bg-amber-900/40 text-amber-400" />
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 w-fit border border-zinc-800">
          {(["overview", "feedbacks"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                activeTab === tab
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab === "overview" ? <BarChart3 className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
              {tab === "overview" ? "数据概览" : `用户反馈 (${feedbacks.length})`}
            </button>
          ))}
        </div>

        {/* 数据概览 */}
        {activeTab === "overview" && stats && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">近期反馈摘要</h2>
            {feedbacks.slice(0, 5).length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-8">暂无反馈数据</p>
            ) : (
              <div className="space-y-3">
                {feedbacks.slice(0, 5).map((fb) => (
                  <div key={fb.id} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                    <Stars n={fb.rating} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 line-clamp-2">{fb.content}</p>
                      <p className="text-xs text-zinc-600 mt-1">{new Date(fb.timestamp).toLocaleString("zh-CN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 反馈列表 */}
        {activeTab === "feedbacks" && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-300">全部用户反馈</h2>
              <button
                onClick={exportCSV}
                disabled={feedbacks.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                导出 CSV
              </button>
            </div>

            {feedbacks.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-16">暂无反馈数据</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="px-6 py-4 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-3">
                          <Stars n={fb.rating} />
                          <span className="text-xs text-zinc-500">
                            {new Date(fb.timestamp).toLocaleString("zh-CN")}
                          </span>
                          {fb.contact && (
                            <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-md">
                              {fb.contact}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{fb.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
