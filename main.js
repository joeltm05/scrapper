import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import { login, fetchFollowers, fetchFollowing } from "./tracker.js";

dotenv.config();

async function notify(msg) {
  await axios.post(
    `https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`,
    { chat_id: process.env.TG_CHAT, text: msg }
  );
}

async function main() {
  await login();

  const target = "_mariassantoss"; // 👉 Mete aqui o username da conta a vigiar

  const followers = await fetchFollowers(target);
  const following = await fetchFollowing(target);

  const oldFollowers = fs.existsSync("followers.json")
    ? JSON.parse(fs.readFileSync("followers.json"))
    : [];
  const oldFollowing = fs.existsSync("following.json")
    ? JSON.parse(fs.readFileSync("following.json"))
    : [];

  const newFollowers = followers.filter(f => !oldFollowers.includes(f));
  const lostFollowers = oldFollowers.filter(f => !followers.includes(f));
  const newFollowing = following.filter(f => !oldFollowing.includes(f));
  const unfollowed = oldFollowing.filter(f => !following.includes(f));

  if (newFollowers.length) await notify("🚨 Novos seguidores: " + newFollowers.join(", "));
  if (lostFollowers.length) await notify("❌ Perdeu seguidores: " + lostFollowers.join(", "));
  if (newFollowing.length) await notify("➡️ Agora segue: " + newFollowing.join(", "));
  if (unfollowed.length) await notify("⬅️ Deixou de seguir: " + unfollowed.join(", "));

  fs.writeFileSync("followers.json", JSON.stringify(followers));
  fs.writeFileSync("following.json", JSON.stringify(following));
}

main();
