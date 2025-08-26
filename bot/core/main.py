from .config import env
from .handlers import *


TOKEN = env("TELEGRAM_TOKEN")
WEBHOOK_URL = f"https://BalancedPlate.pythonanywhere.com/{TOKEN}"

telegram_app = Application.builder().token(TOKEN).build()


telegram_app.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, welcome_new_member))

telegram_app.add_handler(
    ConversationHandler(
    entry_points=[MessageHandler(filters.PHOTO, ask_name)],
    states={
        ASK_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_angle)],
        ASK_ANGLE: [CallbackQueryHandler(save_image)],
    },
    fallbacks=[CommandHandler("cancel", cancel)],
    )
)

def main():
    print("🤖 Bot is running...")
    telegram_app.run_polling()


if __name__ == "__main__":
    main()