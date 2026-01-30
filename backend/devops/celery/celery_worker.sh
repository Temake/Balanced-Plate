#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Starting Celery worker..."
celery -A config worker -Q beats,email-notification,recommendations -l INFO -n worker@%h