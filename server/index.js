import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import twitterRoutes from "./src/routes/twitterRoutes.js";
import { twitterClient } from "./src/config/twitterClient.js"; // Import Twitter client
import MemoryStore from "memorystore"; // Persistent session store

dotenv.config(); // Load .env at the very top

const app = express();
const __dirname = path.resolve();

// Debugging: Ensure ENV variables are loading
console.log("TWITTER_API_KEY:", process.env.TWITTER_API_KEY || "Not Found");
console.log("TWITTER_CALLBACK_URL:", process.env.TWITTER_CALLBACK_URL || "Not Found");

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Session setup with MemoryStore (prevents session loss)
const MemoryStoreSession = MemoryStore(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true,
    store: new MemoryStoreSession({ checkPeriod: 86400000 }), // 24 hours
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true },
  })
);

// ✅ Twitter Login Route
app.get("/api/twitter/login", async (req, res) => {
  try {
    console.log("🔵 Twitter Login Request Received");

    const authLink = await twitterClient.generateAuthLink(process.env.TWITTER_CALLBACK_URL);
    console.log("✅ Auth Link Generated:", authLink);

    // Store oauth_token_secret in session
    req.session.oauth_token_secret = authLink.oauth_token_secret;
    req.session.oauth_token = authLink.oauth_token;
    req.session.save(); // Ensure session is saved

    console.log("🟢 Session Data Stored:", req.session);

    // Redirect user to Twitter authentication page
    res.redirect(authLink.url);
  } catch (error) {
    console.error("❌ Error generating auth link:", error);
    res.status(500).json({ error: "Failed to authenticate with Twitter" });
  }
});

// ✅ Twitter Callback Route
app.get("/api/twitter/callback", async (req, res) => {
  try {
    const { oauth_token, oauth_verifier } = req.query;

    console.log("🔄 Callback Received:", req.query);
    console.log("🟢 Stored Session Data:", req.session);

    // Retrieve the stored secret
    const oauth_token_secret = req.session.oauth_token_secret;

    if (!oauth_token_secret) {
      throw new Error("Session expired. No token secret found.");
    }

    // Exchange for access token
    const accessToken = await twitterClient.getOAuthAccessToken(oauth_token, oauth_token_secret, oauth_verifier);

    console.log("✅ Access Token Received:", accessToken);

    res.json({ message: "Login successful", accessToken });
  } catch (error) {
    console.error("❌ Twitter callback error:", error);
    res.status(400).json({ error: "Session expired. Please try logging in again." });
  }
});

// ✅ Twitter Routes (For Additional API Handling)
app.use("/api/twitter", twitterRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
