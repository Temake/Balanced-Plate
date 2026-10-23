#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

# Standalone worker, for running Huey as its own service. Production currently
# starts the worker from server.sh instead, so don't run both.
# Worker count and type come from settings.HUEY["consumer"]; override with
# HUEY_WORKERS.
echo "Starting Huey worker..."
exec python manage.py run_huey
