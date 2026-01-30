FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files
COPY . .

# Make sure Python can find the modules
ENV PYTHONPATH=/app

# Run the main module directly
CMD ["python", "-m","core.main"]