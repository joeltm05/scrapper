import { IgApiClient } from "instagram-private-api";

const ig = new IgApiClient();
ig.state.generateDevice(process.env.IG_USER);

async function login() {
  await ig.account.login(process.env.IG_USER, process.env.IG_PASS);
  console.log("✅ Logged in as", process.env.IG_USER);
}

async function fetchFollowers(username) {
  const user = await ig.user.searchExact(username);
  const followersFeed = ig.feed.accountFollowers(user.pk);

  const followers = [];
  for await (const item of followersFeed.items()) {
    followers.push(item.username);
  }
  return followers;
}

async function fetchFollowing(username) {
  const user = await ig.user.searchExact(username);
  const followingFeed = ig.feed.accountFollowing(user.pk);

  const following = [];
  for await (const item of followingFeed.items()) {
    following.push(item.username);
  }
  return following;
}

export { ig, login, fetchFollowers, fetchFollowing };
