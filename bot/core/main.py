from .config import env
from .handlers import *


TOKEN = env("TELEGRAM_TOKEN")

def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, welcome_new_member))

    app.add_handler(
        ConversationHandler(
        entry_points=[MessageHandler(filters.PHOTO, ask_name)],
        states={
            ASK_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_angle)],
            ASK_ANGLE: [CallbackQueryHandler(save_image)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
        )
    )

    print("🤖 Bot is running...")
    app.run_polling()


if __name__ == "__main__":
    main()