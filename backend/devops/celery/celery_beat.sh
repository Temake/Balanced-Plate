#!/bin/bash
# filepath: c:\Users\olado\Documents\Balanced-Plate-AI\Balanced-Plate\backend\devops\celery-beat.sh

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Celery beat..."
celery -A config beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler --max-interval 10