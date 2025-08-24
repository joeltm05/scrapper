import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  if (!text) return;

  if (text === "update") {
    bot.sendMessage(chatId, "🔄 Updating followers and following...");

    try {
      const response = await axios.post(`${process.env.RENDER_EXTERNAL_URL}/update`);
      const report = response.data.report;

      if (!report) {
        bot.sendMessage(chatId, "❌ No data received. Check Instagram login and username.");
        return;
      }

      bot.sendMessage(chatId, `📊 Instagram Report\nFollowers: ${report.followers.length}\nFollowing: ${report.following.length}`);

      const sendList = (title, list) => {
        if (list.length === 0) return;
        const chunks = chunk(list, 20);
        chunks.forEach((c, i) => {
          bot.sendMessage(chatId, `${title} ${i + 1}:\n${c.join(", ")}`);
        });
      };

      sendList("🚨 New Followers:", report.newFollowers);
      sendList("❌ Lost Followers:", report.lostFollowers);
      sendList("➡️ New Following:", report.newFollowing);
      sendList("⬅️ Unfollowed:", report.unfollowed);

    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, `❌ Failed to update: ${err.message}`);
    }
  } else {
    bot.sendMessage(chatId, "ℹ️ Send 'update' to fetch the latest Instagram report.");
  }
});
