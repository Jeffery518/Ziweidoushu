"use client";

import React, { useRef, useEffect } from "react";

export function Starfield() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const stars: { x: number; y: number; z: number; pz: number }[] = [];
        const numStars = 800; // 3D 景深粒子数
        const speed = 2.5; // 穿梭速度

        // 初始化 3D 星辰
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * width * 2 - width,
                y: Math.random() * height * 2 - height,
                z: Math.random() * width,
                pz: Math.random() * width // 用于绘制视差拖尾
            });
        }

        let animationFrameId: number;

        const render = () => {
            // 使用带有透明度的黑纯色覆盖，制造出拖尾(彗星/光速穿梭)的视觉残留错觉
            ctx.fillStyle = "rgba(9, 9, 11, 0.4)"; // 匹配 Tailwind background (zinc-950)
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            stars.forEach((star) => {
                // 星辰向镜头冲来 (Z轴减小)
                star.z -= speed;

                // 如果移动到了镜头后方，将其重置到极远处
                if (star.z <= 0) {
                    star.x = Math.random() * width * 2 - width;
                    star.y = Math.random() * height * 2 - height;
                    star.z = width;
                    star.pz = width;
                }

                // 3D 到 2D 的透视投影计算 (中心发散)
                const fov = width; // 视场深度控制比率

                // 当前帧的屏幕坐标
                const sx = cx + (star.x / star.z) * fov;
                const sy = cy + (star.y / star.z) * fov;

                // 上一帧的屏幕坐标 (用于连线产生光速飞行的拖尾)
                const px = cx + (star.x / star.pz) * fov;
                const py = cy + (star.y / star.pz) * fov;

                star.pz = star.z;

                // 距离镜头越近(Z越小)，星点越大，透明度越高
                const starRadius = Math.max(0, (1 - star.z / width) * 2.5);
                const alpha = Math.max(0, 1 - star.z / width);

                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);

                // 流星光效色彩
                ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`; // Blue-300
                ctx.lineWidth = starRadius;
                ctx.lineCap = "round";
                ctx.stroke();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ width: '100vw', height: '100vh', display: 'block' }}
        />
    );
}
