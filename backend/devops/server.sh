#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo "Running migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# The web server and the Huey worker share this container. Keep the service at
# one replica: each copy runs its own worker, and with it the periodic schedule.
echo "Starting Huey worker..."
python manage.py run_huey &
HUEY_PID=$!

echo "Starting Daphne server..."
daphne -b 0.0.0.0 -p 8000 config.asgi:application &
DAPHNE_PID=$!

stopping=0
shutdown() {
    if [ "$stopping" -eq 1 ]; then
        return
    fi
    stopping=1
    echo "Stopping Daphne and the Huey worker..."
    # Huey treats SIGTERM as graceful (settings.HUEY), so running tasks get
    # HUEY_SHUTDOWN_TIMEOUT seconds to finish before they are re-queued.
    kill -TERM "$DAPHNE_PID" "$HUEY_PID" 2>/dev/null || true
    wait "$DAPHNE_PID" 2>/dev/null || true
    wait "$HUEY_PID" 2>/dev/null || true
}
# Railway stops the container by sending SIGTERM to this script, not to the
# processes it started, so pass it on.
trap shutdown TERM INT

# If either process dies, stop the other and exit non-zero so Railway restarts
# the whole container, instead of serving requests with no worker behind them.
exit_code=0
wait -n "$HUEY_PID" "$DAPHNE_PID" || exit_code=$?
if [ "$stopping" -eq 0 ]; then
    echo "A process exited unexpectedly (code $exit_code); restarting container."
    shutdown
    if [ "$exit_code" -eq 0 ]; then
        exit_code=1
    fi
    exit "$exit_code"
fi
exit 0
