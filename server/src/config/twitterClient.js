import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN, // Optional
  accessSecret: process.env.TWITTER_ACCESS_SECRET, // Optional
});

export { twitterClient };
