FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright dependencies and chromium
RUN playwright install-deps
RUN playwright install chromium

COPY . .

# Use port 10000 to match render.yaml default
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
