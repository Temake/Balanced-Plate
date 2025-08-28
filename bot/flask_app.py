from flask import Flask, request, abort
import asyncio
import logging
import threading
from telegram import Update
from .core.main import telegram_app

telegram_loop = None
telegram_thread = None

def init_telegram():
    """Initialize telegram app in a dedicated thread with its own event loop"""
    global telegram_loop
    telegram_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(telegram_loop)
    
    try:
        telegram_loop.run_until_complete(telegram_app.initialize())
        telegram_loop.run_until_complete(telegram_app.start())
        logging.info("Telegram app initialized successfully")
        
        # Keep the loop running for async operations
        telegram_loop.run_forever()
    except Exception as e:
        logging.error(f"Failed to initialize telegram app: {e}")


telegram_thread = threading.Thread(target=init_telegram, daemon=True)
telegram_thread.start()


import time
time.sleep(2)

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    return "Bot is running", 200

@app.route(f"/{telegram_app.bot.token}", methods=["POST"])
def webhook():
    logging.info(f"Webhook called: {request.path}")
    if not request.headers.get("content-type", "").startswith("application/json"):
        abort(400)

    data = request.get_json(force=True)
    update = Update.de_json(data, telegram_app.bot)


    if telegram_loop and not telegram_loop.is_closed():
        asyncio.run_coroutine_threadsafe(
            telegram_app.process_update(update), 
            telegram_loop
        )
    
    return "OK"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)