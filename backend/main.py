import os
import sys
import json
import threading
from datetime import datetime, date
from typing import Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# 确保能正确导入内部模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from core.ziwei_engine import ZiweiCoreEngine

app = FastAPI(
    title="AI 天纪·紫微斗数引擎", 
    description="倪海厦《天纪》派别专业排盘与AI知识库RAG中枢",
    version="2.0.0"
)

# 允许跨域请求 (CORS) 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from lunar_python import Solar, Lunar

# ─── 路径配置 ─────────────────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
DATA_DIR       = os.path.join(BASE_DIR, "data")
KNOWLEDGE_PATH = os.path.join(BASE_DIR, "core", "nishi_knowledge.json")
FEEDBACKS_PATH = os.path.join(DATA_DIR, "feedbacks.json")
STATS_PATH     = os.path.join(DATA_DIR, "stats.json")

os.makedirs(DATA_DIR, exist_ok=True)

# ─── 管理员 Token（从环境变量读取，未设置则使用默认值） ──────────────────────
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "tianji-admin-2026")

# ─── 加载知识库 ───────────────────────────────────────────────────────────────
try:
    with open(KNOWLEDGE_PATH, 'r', encoding='utf-8') as f:
        NISHI_KNOWLEDGE = json.load(f)
except FileNotFoundError:
    print("Warning: nishi_knowledge.json not found. RAG context will be empty.")
    NISHI_KNOWLEDGE = {}

# ─── 全局统计计数器（线程安全） ───────────────────────────────────────────────
_stats_lock = threading.Lock()

def _load_stats() -> dict:
    if os.path.exists(STATS_PATH):
        try:
            with open(STATS_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {"total_charts": 0, "daily": {}}

def _save_stats(stats: dict) -> None:
    with open(STATS_PATH, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False)

def _increment_chart_count() -> None:
    with _stats_lock:
        stats = _load_stats()
        stats["total_charts"] = stats.get("total_charts", 0) + 1
        today = date.today().isoformat()
        daily = stats.get("daily", {})
        daily[today] = daily.get(today, 0) + 1
        stats["daily"] = daily
        _save_stats(stats)

# ─── 管理员鉴权辅助函数 ───────────────────────────────────────────────────────
def _require_admin(x_admin_token: Optional[str]) -> None:
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="无效的管理员 Token")

# ========================================== #
# Data Transfer Objects (DTO)
# ========================================== #
class ChartRequestDTO(BaseModel):
    solar_year:  int = Field(..., description="公历年份, e.g., 1990")
    solar_month: int = Field(..., description="公历月份 (1-12)")
    solar_day:   int = Field(..., description="公历日 (1-31)")
    hour_branch: str = Field(..., description="出生时辰地支, e.g., '子'")
    gender:      str = Field("男", description="性别")

class FeedbackDTO(BaseModel):
    rating:  int            = Field(..., ge=1, le=5, description="评分 1-5 星")
    content: str            = Field(..., min_length=1, max_length=500, description="意见内容")
    contact: Optional[str]  = Field(None, description="联系方式（可选）")

# ========================================== #
# 排盘核心接口
# ========================================== #
@app.post("/api/v1/chart/generate", summary="生成天纪版紫微斗数排盘数据")
def generate_ziwei_chart(req: ChartRequestDTO):
    """核心排盘接口。接收公历生辰，底层自动转化为农历和干支纪年，再交由引擎推断。"""
    try:
        solar      = Solar.fromYmd(req.solar_year, req.solar_month, req.solar_day)
        lunar      = solar.getLunar()
        year_stem  = lunar.getYearGan()
        year_branch= lunar.getYearZhi()
        month_num  = abs(lunar.getMonth())
        day        = lunar.getDay()

        engine = ZiweiCoreEngine(
            year_stem=year_stem.strip(),
            year_branch=year_branch.strip(),
            month_leap_num=month_num,
            day=day,
            hour_branch=req.hour_branch.strip(),
            gender=req.gender.strip()
        )
        chart_data = engine.generate_chart(birth_year=req.solar_year, target_year=2026)
        chart_data['meta']['lunar_date_str'] = (
            f"农历 {lunar.getYearInGanZhi()}年 {lunar.getMonthInChinese()}月 {lunar.getDayInChinese()}"
        )

        # RAG 知识融合
        life_palace_branch = chart_data['meta']['life_palace'][-1]
        life_palace_data   = next((p for p in chart_data['palaces'] if p['branch'] == life_palace_branch), None)
        rag_context = []
        if life_palace_data:
            for star in life_palace_data['major_stars']:
                if star in NISHI_KNOWLEDGE.get("stars_interpretation", {}):
                    knowledge = NISHI_KNOWLEDGE["stars_interpretation"][star]
                    if "命宫" in knowledge.get("palaces", {}):
                        quote = knowledge["palaces"]["命宫"].get("nishi_quote", "")
                        rag_context.append({"star": star, "quote": quote})

        # 统计计数
        _increment_chart_count()

        return {
            "status": "success",
            "data": chart_data,
            "rag_context": rag_context,
            "system_prompt": NISHI_KNOWLEDGE.get("system_prompt_template", "")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========================================== #
# 用户反馈接口（公开）
# ========================================== #
@app.post("/api/v1/feedback", summary="提交用户意见反馈")
def submit_feedback(body: FeedbackDTO):
    """接收用户的星级评分和文字意见，追加写入 feedbacks.json。"""
    record = {
        "id":        datetime.utcnow().strftime("%Y%m%d%H%M%S%f"),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "rating":    body.rating,
        "content":   body.content,
        "contact":   body.contact or "",
    }
    try:
        # 追加到 JSON 数组（读取 → 追加 → 写入）
        feedbacks: list = []
        if os.path.exists(FEEDBACKS_PATH):
            with open(FEEDBACKS_PATH, 'r', encoding='utf-8') as f:
                feedbacks = json.load(f)
        feedbacks.append(record)
        with open(FEEDBACKS_PATH, 'w', encoding='utf-8') as f:
            json.dump(feedbacks, f, ensure_ascii=False, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"存储失败: {e}")
    return {"status": "success", "message": "感谢您的宝贵意见！"}

# ========================================== #
# 管理员接口（需 x-admin-token 请求头）
# ========================================== #
@app.get("/api/v1/admin/feedbacks", summary="[管理] 查看全部反馈")
def admin_get_feedbacks(x_admin_token: Optional[str] = Header(None)):
    _require_admin(x_admin_token)
    if not os.path.exists(FEEDBACKS_PATH):
        return {"status": "success", "data": []}
    with open(FEEDBACKS_PATH, 'r', encoding='utf-8') as f:
        feedbacks = json.load(f)
    # 按时间倒序
    feedbacks.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return {"status": "success", "data": feedbacks}

@app.get("/api/v1/admin/stats", summary="[管理] 查看运营统计")
def admin_get_stats(x_admin_token: Optional[str] = Header(None)):
    _require_admin(x_admin_token)
    stats    = _load_stats()
    today    = date.today().isoformat()
    today_n  = stats.get("daily", {}).get(today, 0)

    feedbacks: list = []
    if os.path.exists(FEEDBACKS_PATH):
        with open(FEEDBACKS_PATH, 'r', encoding='utf-8') as f:
            feedbacks = json.load(f)

    avg_rating = (
        round(sum(fb["rating"] for fb in feedbacks) / len(feedbacks), 1)
        if feedbacks else 0.0
    )

    return {
        "status": "success",
        "data": {
            "total_charts":   stats.get("total_charts", 0),
            "today_charts":   today_n,
            "total_feedbacks":len(feedbacks),
            "avg_rating":     avg_rating,
        }
    }

@app.post("/api/v1/admin/verify", summary="[管理] 校验 Token")
def admin_verify(x_admin_token: Optional[str] = Header(None)):
    _require_admin(x_admin_token)
    return {"status": "success", "message": "Token 有效"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
