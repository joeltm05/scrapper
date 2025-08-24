import express from "express";
import fs from "fs";
import dotenv from "dotenv";
import { login, fetchFollowers, fetchFollowing } from "./tracker.js";

dotenv.config();

const app = express();
const port = process.env.PORT;
app.use(express.json());

app.post("/update", async (req, res) => {
  try {
    const followers = await fetchFollowers(process.env.TARGET);
    const following = await fetchFollowing(process.env.TARGET);

    const oldFollowers = fs.existsSync("followers.json") ? JSON.parse(fs.readFileSync("followers.json")) : [];
    const oldFollowing = fs.existsSync("following.json") ? JSON.parse(fs.readFileSync("following.json")) : [];

    const newFollowers = followers.filter(f => !oldFollowers.includes(f));
    const lostFollowers = oldFollowers.filter(f => !followers.includes(f));
    const newFollowing = following.filter(f => !oldFollowing.includes(f));
    const unfollowed = oldFollowing.filter(f => !following.includes(f));

    fs.writeFileSync("followers.json", JSON.stringify(followers));
    fs.writeFileSync("following.json", JSON.stringify(following));

    res.json({ success: true, report: { followers, following, newFollowers, lostFollowers, newFollowing, unfollowed } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
