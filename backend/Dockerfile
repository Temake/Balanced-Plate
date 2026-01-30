FROM python:3.11-slim

RUN apt-get -y update && apt-get install -y \
    gcc \
    libpq-dev \
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

COPY --chown=django:django ./devops/celery/celery_worker.sh /celery-worker.sh
RUN sed -i 's/\r$//g' /celery-worker.sh && chmod +x /celery-worker.sh

COPY --chown=django:django ./devops/celery/celery_beat.sh /celery-beat.sh
RUN sed -i 's/\r$//g' /celery-beat.sh && chmod +x /celery-beat.sh

RUN python manage.py collectstatic --noinput

USER django

EXPOSE 8000