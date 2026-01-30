import os
from telegram import Update, ReplyKeyboardRemove, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import (
    Application, 
    ContextTypes, 
    CallbackContext,
    ConversationHandler, 
    MessageHandler, 
    CommandHandler, 
    ChatMemberHandler,
    CallbackQueryHandler,
    filters
)
from telegram.helpers import mention_html
from .helpers import upload_to_cloudinary


# Conversation states
ASK_NAME, ASK_ANGLE = range(2)


async def welcome_new_member(update: Update, context: ContextTypes.DEFAULT_TYPE): 
    if not update.message or not update.message.new_chat_members:
        return

    chat = update.effective_chat
    for user in update.message.new_chat_members:
        if user.is_bot:
            continue

        await chat.send_message(
            (
                f"👋 Welcome {mention_html(user.id, user.full_name)}!\n\n"
                "📷Send me an image of a food!\n"
                "Flow: send a food image → name it → pick camera angle → I’ll save it."
            ),
            parse_mode="HTML",
        )


async def ask_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = update.message
    photo = message.photo[-1]
    file = await photo.get_file()
    
    context.user_data["file"] = file

    await update.message.reply_text("📝 Please enter the name of this food")
    return ASK_NAME


async def ask_angle(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["name"] = update.message.text.strip()

    keyboard = [
        [InlineKeyboardButton("📷 Top View", callback_data="top_view")],
        [InlineKeyboardButton("📷 Side View", callback_data="side_view")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "📷 What’s the camera angle?",
        reply_markup=reply_markup
    )
    return ASK_ANGLE


async def save_image(update: Update, context: CallbackContext):
    query = update.callback_query
    await query.answer()

    data = context.user_data
    if not data:
        await query.edit_message_text(
            "⚠️ Something went wrong. Please send the image again."
        )
        return ConversationHandler.END

    name = data["name"]
    angle = query.data
    file = data["file"]
  
    filename = f"{name}_{angle}_{file.file_unique_id}.jpg"
    url = await upload_to_cloudinary(file, filename)

    await query.edit_message_text(
        f"✅ Image uploaded!\n\n"
    )
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("❌ Operation cancelled.", reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END
