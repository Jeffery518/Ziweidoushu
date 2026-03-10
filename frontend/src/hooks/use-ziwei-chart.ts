import { useState } from "react";
import type { ZiweiChartData } from "@/components/ZiweiChart";

export function useZiweiChart() {
    const [chartData, setChartData] = useState<ZiweiChartData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ragContext, setRagContext] = useState<{ star: string, quote: string }[]>([]);

    const [formData, setFormData] = useState({
        solar_year: "1990",
        solar_month: "5",
        solar_day: "15",
        hour_branch: "子",
        gender: "男"
    });

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api-backend";
            const res = await fetch(`${API_BASE}/api/v1/chart/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    solar_year: parseInt(formData.solar_year),
                    solar_month: parseInt(formData.solar_month),
                    solar_day: parseInt(formData.solar_day),
                    hour_branch: formData.hour_branch,
                    gender: formData.gender
                })
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.detail || "生成排盘失败");

            setChartData(json.data);
            setRagContext(json.rag_context || []);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        chartData,
        isLoading,
        error,
        ragContext,
        formData,
        setFormData,
        handleGenerate,
    };
}
