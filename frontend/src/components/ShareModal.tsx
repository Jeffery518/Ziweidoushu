"use client";

import { useEffect, useCallback } from "react";
import { X, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  isOpen:   boolean;
  dataUrl:  string;
  onClose:  () => void;
}

export function ShareModal({ isOpen, dataUrl, onClose }: ShareModalProps) {
  // ESC 键关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return ()  => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href     = dataUrl;
    a.download = `天纪命盘_${Date.now()}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 居中卡片 */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "pointer-events-auto relative flex flex-col",
            "w-full max-w-md rounded-2xl overflow-hidden",
            "bg-zinc-900 border border-zinc-700/60 shadow-2xl",
            "animate-in zoom-in-95 fade-in duration-300"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-sm text-zinc-200 tracking-wide">分享命盘</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 图片预览 */}
          <div className="p-4 bg-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt="命盘分享图"
              className="w-full rounded-xl border border-zinc-800 shadow-lg"
            />
          </div>

          {/* 操作区 */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-zinc-500 text-center">长按图片可保存到手机相册，或点击下载按钮</p>
            <button
              onClick={handleDownload}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl",
                "bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm",
                "transition-all duration-200 hover:-translate-y-0.5 active:scale-95",
                "shadow-md hover:shadow-purple-500/30"
              )}
            >
              <Download className="w-4 h-4" />
              下载图片
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
