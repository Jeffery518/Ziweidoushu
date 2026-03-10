# ── 后端 FastAPI Dockerfile ──────────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# 安装依赖（先复制 requirements 利用 Docker 层缓存）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制全部源码
COPY . .

# 创建数据目录（反馈/统计持久化）
RUN mkdir -p /app/data

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
