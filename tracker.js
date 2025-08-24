import { IgApiClient } from "instagram-private-api";
import fs from "fs";

const ig = new IgApiClient();
let isLoggedIn = false;

// Delay para evitar rate limits
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login() {
  if (isLoggedIn) return;

  ig.state.generateDevice(process.env.IG_USER);

  try {
    if (fs.existsSync("session.json")) {
      const sessionData = JSON.parse(fs.readFileSync("session.json"));
      await ig.state.deserialize(sessionData);
    }

    await ig.account.login(process.env.IG_USER, process.env.IG_PASS);

    const serialized = await ig.state.serialize();
    delete serialized.constants;
    fs.writeFileSync("session.json", JSON.stringify(serialized));

    isLoggedIn = true;
  } catch (err) {
    throw new Error("Instagram login failed: " + err.message);
  }
}

async function fetchFollowers(username) {
  await login();
  const user = await ig.user.searchExact(username);
  const feed = ig.feed.accountFollowers(user.pk);
  const followers = [];

  while (feed.isMoreAvailable()) {
    const items = await feed.items();
    followers.push(...items.map(u => u.username));
    await delay(2000 + Math.random() * 1000);
  }

  return [...new Set(followers)];
}

async function fetchFollowing(username) {
  await login();
  const user = await ig.user.searchExact(username);
  const feed = ig.feed.accountFollowing(user.pk);
  const following = [];

  while (feed.isMoreAvailable()) {
    const items = await feed.items();
    following.push(...items.map(u => u.username));
    await delay(2000 + Math.random() * 1000);
  }

  return [...new Set(following)];
}

export { ig, login, fetchFollowers, fetchFollowing };
