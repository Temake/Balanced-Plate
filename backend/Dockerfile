FROM python:3.11-slim

RUN apt-get -y update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ADD . /app
WORKDIR /app

RUN pip install --no-cache-dir -r requirements.txt

RUN addgroup --system django \
    && adduser --system --ingroup django django

COPY --chown=django:django ./devops/server.sh /server.sh
RUN sed -i 's/\r$//g' /server.sh && chmod +x /server.sh

COPY --chown=django:django ./devops/huey_worker.sh /huey-worker.sh
RUN sed -i 's/\r$//g' /huey-worker.sh && chmod +x /huey-worker.sh


USER django

EXPOSE 8000