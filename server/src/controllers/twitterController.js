import { TwitterApi } from "twitter-api-v2";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const client_url = process.env.CLIENT_URL;

// Ensure API keys are available
if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
  console.error("❌ Missing Twitter API credentials!");
  process.exit(1);
}

// Twitter API Client (App-Level)
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
});

// 🔹 Twitter OAuth Login
const loginWithTwitter = async (req, res) => {
  try {
    const { url, oauth_token, oauth_token_secret } = await twitterClient.generateAuthLink(
      process.env.TWITTER_CALLBACK_URL
    );

    req.session.oauth_token = oauth_token;
    req.session.oauth_token_secret = oauth_token_secret;

    await req.session.save();  // ✅ Ensure session saves before redirecting
    console.log("✅ Redirecting to Twitter:", url);
    
    res.redirect(url);
  } catch (error) {
    console.error("❌ Error generating auth link:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// 🔹 Handle Twitter Callback
const callback = async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({ error: "Missing tokens" });
  }

  if (!req.session.oauth_token || !req.session.oauth_token_secret) {
    console.error("❌ Session missing stored OAuth tokens");
    return res.status(400).json({ error: "Session expired. Please try logging in again." });
  }

  try {
    // Exchange oauth_token and oauth_verifier for access token
    const loggedClient = await twitterClient.loginWithOAuth1({
      oauth_token,
      oauth_token_secret: req.session.oauth_token_secret,
      oauth_verifier,
    });

    // Store user session details
    req.session.user = {
      accessToken: loggedClient.accessToken,
      accessSecret: loggedClient.accessSecret,
      username: loggedClient.screenName,
    };

    await req.session.save();  // ✅ Ensure session is saved before redirecting

    console.log("✅ User logged in successfully:", req.session.user);
    res.redirect(`${client_url}/tweet`);
  } catch (error) {
    console.error("❌ Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// 🔹 Get Authenticated User
const getUser = (req, res) => {
  console.log("🟢 Checking session user:", req.session.user);

  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  res.json({ user: req.session.user });
};

// 🔹 Upload Image to Twitter
const uploadImageToTwitter = async (userClient, imageUrl) => {
  try {
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const mediaId = await userClient.v1.uploadMedia(Buffer.from(imageResponse.data), { type: "image/png" });
    return mediaId;
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    throw new Error("Image upload failed");
  }
};

// 🔹 Tweet Images
const tweetImages = async (req, res) => {
  const { imageUrls, tweetText } = req.body;
  const userSession = req.session.user;

  if (!userSession) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    const userClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: userSession.accessToken,
      accessSecret: userSession.accessSecret,
    });

    let mediaIds = [];
    if (imageUrls?.length) {
      mediaIds = await Promise.all(imageUrls.map((url) => uploadImageToTwitter(userClient, url)));
    }

    const tweetPayload = { text: tweetText };
    if (mediaIds.length) {
      tweetPayload.media = { media_ids: mediaIds };
    }

    const tweet = await userClient.v2.tweet(tweetPayload);

    res.json({ success: true, tweetId: tweet.data.id });
  } catch (error) {
    console.error("❌ Error posting tweet:", error);
    res.status(500).json({ error: "Failed to post tweet" });
  }
};

export { loginWithTwitter, callback, tweetImages, getUser };
