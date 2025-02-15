// Import the required modules
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import nodeCron from "node-cron";

dotenv.config();

// Replace with your bot token from .env
const token = process.env.BOT_TOKEN;

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Listen for new members joining the group
bot.on("new_chat_members", (msg) => {
  const chatId = msg.chat.id;
  const newMembers = msg.new_chat_members;

  newMembers.forEach((member) => {
    const userId = member.id;
    const firstName = member.first_name;

    // Send a private welcome message
    bot
      .sendMessage(
        userId,
        `🌟 **Welcome to NOVA Ads – Your Gateway to Earning!** 🌟\n\n` +
          `Hello ${firstName}! 👋\n\n` +
          `We’re thrilled to have you join the NOVA Ads family! Whether you’re a student, professional, or simply looking for a flexible way to earn extra income, NOVA Ads is here to help you achieve your financial goals. 💰\n\n` +
          `Here’s how it works:\n\n` +
          `1️⃣ **Businesses Pay to Advertise**: Companies pay NOVA Ads to promote their products and services.\n` +
          `2️⃣ **You View Ads**: Ads are delivered to you in an easy-to-access format. Simply watch, click, or interact with them.\n` +
          `3️⃣ **You Earn Money**: Get paid for every ad you view! It’s that simple. 💸\n\n` +
          `🚀 **Ready to Start Earning?**\n` +
          `👉 Visit our website: [https://novaads.tech](https://novaads.tech)\n` +
          `👉 Start viewing ads and earning money today!\n\n` +
          `🌟 **Don’t Miss This Opportunity!** 🌟\n` +
          `Join thousands of users who are already earning with NOVA Ads. Start your journey today and transform your life!\n\n` +
          `👉 [Sign Up Now](https://novaads.tech)\n\n` +
          `Welcome to the future of earning – welcome to NOVA Ads! 🚀`
      )
      .then(() => {
        console.log(`Private message sent to ${firstName} (ID: ${userId})`);
      })
      .catch((err) => {
        console.error(`Could not send private message to ${firstName}:`, err);
        // Notify the user in the group
        bot.sendMessage(
          chatId,
          `@${member.username}, please start a chat with @${bot.getMe().username} to get your referral link and more information.`
        );
      });
  });
});

// Schedule a message to the group every hour
nodeCron.schedule("0 * * * *", () => {
  const chatId = process.env.GROUP_ID; // Replace with your group ID

  // Send a message with a button
  bot
    .sendMessage(chatId, "🌟 **Welcome to NOVA Ads!** 🌟\n\n" +
      "Earn money by watching ads. It’s simple, flexible, and accessible to everyone!\n\n" +
      "Want to know more? Click the button below! 👇", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Want to know more? 🚀", callback_data: "learn_more" }],
        ],
      },
    })
    .catch((err) => {
      console.error("Failed to send scheduled message:", err);
    });
});

// Handle button clicks
bot.on("callback_query", (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  if (query.data === "learn_more") {
    // Send a private message with more information
    bot
      .sendMessage(
        userId,
        `🌟 **Here’s How NOVA Ads Works** 🌟\n\n` +
          `1️⃣ **Businesses Pay to Advertise**: Companies pay NOVA Ads to promote their products and services.\n` +
          `2️⃣ **You View Ads**: Ads are delivered to you in an easy-to-access format. Simply watch, click, or interact with them.\n` +
          `3️⃣ **You Earn Money**: Get paid for every ad you view! It’s that simple. 💸\n\n` +
          `🚀 **Ready to Start Earning?**\n` +
          `👉 Visit our website: [https://novaads.tech](https://novaads.tech)\n` +
          `👉 Start viewing ads and earning money today!\n\n` +
          `🌟 **Don’t Miss This Opportunity!** 🌟\n` +
          `Join thousands of users who are already earning with NOVA Ads. Start your journey today and transform your life!\n\n` +
          `👉 [Sign Up Now](https://novaads.tech)\n\n` +
          `Welcome to the future of earning – welcome to NOVA Ads! 🚀`
      )
      .then(() => {
        console.log(`Private message sent to ${query.from.first_name} (ID: ${userId})`);
      })
      .catch((err) => {
        console.error(`Could not send private message to ${query.from.first_name}:`, err);
        // Notify the user in the group
        bot.sendMessage(
          chatId,
          `@${query.from.username}, please start a chat with @${bot.getMe().username} to learn more about NOVA Ads.`
        );
      });
  }
});

// Listen for all messages
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const text = msg.text;

  console.log("Received message:", text);

  // Check for external links (excluding your domain)
  if (text && /https?:\/\/(?!novaads\.tech)/i.test(text)) {
    // Delete the message
    bot
      .deleteMessage(chatId, messageId)
      .then(() => {
        console.log(`Deleted message from ${msg.from.username}: ${text}`);
        // Optionally, warn the user
        bot.sendMessage(
          chatId,
          `@${msg.from.username}, please do not post external links!`
        );
      })
      .catch((err) => {
        console.error("Failed to delete message:", err);
      });
  }
});

console.log("Bot is running...");