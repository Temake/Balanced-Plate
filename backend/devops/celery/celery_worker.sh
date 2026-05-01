#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Celery worker..."
celery -A config worker -Q beats,email-notification,recommendations,analysis -l INFO -n worker@%h