from flask import Flask, request, abort
import asyncio
import logging
from telegram import Update
from .core.main import telegram_app, TOKEN


# Initialize the app manually
asyncio.get_event_loop().run_until_complete(telegram_app.initialize())
asyncio.get_event_loop().run_until_complete(telegram_app.start())

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


    asyncio.get_event_loop().create_task(telegram_app.process_update(update))
    return "OK"