import { TwitterApi } from "twitter-api-v2";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Ensure API keys are available
if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET) {
  console.error("❌ Missing Twitter API credentials!");
  process.exit(1); // Stop execution if keys are missing
}

// Twitter API Client with OAuth 1.0
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Twitter OAuth Login
const loginWithTwitter = async (req, res) => {
  try {
    const { url, oauth_token, oauth_token_secret } = await twitterClient.generateAuthLink(
      process.env.TWITTER_CALLBACK_URL
    );

    // Store OAuth tokens in the session
    req.session.oauth_token = oauth_token;
    req.session.oauth_token_secret = oauth_token_secret;
    await req.session.save(); // Ensure session is saved before redirecting

    console.log("✅ Redirecting to Twitter:", url);
    res.redirect(url);
  } catch (error) {
    console.error("❌ Error generating auth link:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};


// Handle Twitter Callback
const callback = async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier) {
    return res.status(400).json({ error: "Missing tokens" });
  }

  try {
    const loggedClient = await twitterClient.loginWithOAuth1({
      oauth_token,
      oauth_token_secret: req.session.oauth_token_secret,
      oauth_verifier,
    });

    req.session.user = {
      accessToken: loggedClient.accessToken,
      accessSecret: loggedClient.accessSecret,
      username: loggedClient.screenName,
    };

    res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    console.error("❌ Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Upload Image to Twitter
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

// Tweet Images
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

    const mediaIds = await Promise.all(imageUrls.map((url) => uploadImageToTwitter(userClient, url)));

    const tweet = await userClient.v2.tweet({ text: tweetText, media: { media_ids: mediaIds } });

    res.json({ success: true, tweetId: tweet.data.id });
  } catch (error) {
    console.error("❌ Error posting tweet:", error);
    res.status(500).json({ error: "Failed to post tweet" });
  }
};

export { loginWithTwitter, callback, tweetImages };
