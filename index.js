import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import http from "http"; // Import the HTTP module

dotenv.config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let botUsername = "";

// Create a simple HTTP server to satisfy Render's port binding requirement
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Telegram bot is running...");
});

// Bind to the PORT environment variable (provided by Render)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Fetch the bot's username
bot.getMe().then((me) => {
  botUsername = me.username;
  console.log(`Bot is running as @${botUsername}`);
}).catch((err) => {
  console.error("Failed to fetch bot username:", err);
});

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
        `🌟 **@${firstName} Welcome to NOVA Ads!** 🌟\n\n` +
          "Earn money by watching ads. It’s simple, flexible, and accessible to everyone!\n\n" +
          "Want to know more? Click the button below! 👇",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Want to know more? 🚀", callback_data: "learn_more" }],
            ],
          },
        }
      )
      .catch((err) => {
        console.error(`Failed to send welcome message to ${firstName}:`, err);
        // Notify the user in the group
        bot.sendMessage(
          chatId,
          `@${firstName}, please start a chat with @${botUsername} to get your referral link and more information.`
        );
      });
  });
});

// Handle button clicks
bot.on("callback_query", (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const username = query.from.username || query.from.first_name; // Fallback to first name if username is missing

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
      .catch((err) => {
        console.error(`Could not send private message to ${username}:`, err);
        // Notify the user in the group
        bot.sendMessage(
          chatId,
          `@${username}, please start a chat with @${botUsername} to learn more about NOVA Ads.`
        );
      });
  }
});

// Listen for all messages (moderation)
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const text = msg.text;

  // Skip processing if there's no text (e.g., photos, stickers)
  if (!text) return;

  console.log("Received message:", text);

  // Allowed links (including subdomains)
  const allowedDomains = [
    /^https:\/\/(?:[a-zA-Z0-9-]+\.)*novaads\.tech/i, // Matches novaads.tech and its subdomains
    /^https:\/\/t\.me\/nova_ethiopia/i, // Matches the specific Telegram group'
    // lets add this also as allowed link: https://youtu.be/LVNSVIray3U
    /^https:\/\/youtu\.be\/LVNSVIray3U/i // Matches the specific YouTube video which is look like https://youtu.be/LVNSVIray3U
    
  ];

  // Check for links
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(linkRegex);

  if (links) {
    const isAllowed = links.every((link) =>
      allowedDomains.some((pattern) => pattern.test(link))
    );

    if (!isAllowed) {
      // Delete the message if it contains unapproved links
      bot
        .deleteMessage(chatId, messageId)
        .then(() => {
          console.log(`Deleted message from ${msg.from.username}: ${text}`);
          bot.sendMessage(chatId, `🚫 External links are not allowed!`);
        })
        .catch((err) => {
          console.error("Failed to delete message:", err);
        });
    }
  }
});

console.log("Bot is running...");