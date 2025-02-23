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
app.set("trust proxy", 1);

// ✅ Corrected MemoryStore instantiation
const MemoryStoreSession = MemoryStore(session);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true,
    store: new MemoryStoreSession({ checkPeriod: 86400000 }),
    cookie: { 
      secure: false, // ✅ Set to `false` for localhost
      httpOnly: true, 
      sameSite: "lax", // ✅ Allow cross-site redirects
      maxAge: 86400000 
    }
  })
);

// ✅ Twitter Login Route
app.get("/api/twitter/login", async (req, res) => {
  try {
    console.log("🔵 Twitter Login Request Received");

    const authLink = await twitterClient.generateAuthLink(process.env.TWITTER_CALLBACK_URL);
    console.log("✅ Auth Link Generated:", authLink);

    req.session.oauth_token_secret = authLink.oauth_token_secret;
    req.session.oauth_token = authLink.oauth_token;

    // Debug: Check if session is actually being set
    console.log("Before session save:", req.session);

    req.session.save((err) => {
      if (err) {
        console.error("❌ Session Save Error:", err);
        return res.status(500).json({ error: "Session save failed" });
      }
      console.log("After session save:", req.session);
      console.log("🟢 Session ID:", req.sessionID);

      res.redirect(authLink.url);
    });
  } catch (error) {
    console.error("❌ Error generating auth link:", error);
    res.status(500).json({ error: "Failed to authenticate with Twitter" });
  }
});

// ✅ Twitter Callback Route
app.get("/api/twitter/callback", (req, res) => {
  console.log("🔄 Callback Received:", req.query);
  console.log("🟢 Session ID (callback):", req.sessionID);
  console.log("🟢 Stored Session Data:", req.session);

  // Manually check if cookies exist
  console.log("🔍 Cookies Received:", req.headers.cookie);

  if (!req.session.oauth_token_secret) {
    console.error("❌ Session expired: No token secret found.");
    return res.status(400).json({ error: "Session expired. Please try logging in again." });
  }

  res.redirect(`${process.env.FRONTEND_URL}/tweet`);
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
