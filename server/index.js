import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import twitterRoutes from "./src/routes/twitterRoutes.js";
import { twitterClient } from "./src/config/twitterClient.js"; // Import Twitter client

dotenv.config(); // Load .env at the very top

const app = express();
const __dirname = path.resolve();

// Debugging: Ensure ENV variables are loading
console.log("TWITTER_API_KEY:", process.env.TWITTER_API_KEY || "Not Found");
//console.log("TWITTER_API_SECRET:", process.env.TWITTER_API_SECRET || "Not Found");
console.log("TWITTER_CALLBACK_URL:", process.env.TWITTER_CALLBACK_URL || "Not Found");

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);

// ✅ Twitter Login Route (Directly in index.js for Debugging)
app.get("/api/twitter/login", async (req, res) => {
  try {
    console.log("🔵 Twitter Login Request Received");
    const authLink = await twitterClient.generateAuthLink(process.env.TWITTER_CALLBACK_URL);
    console.log("✅ Auth Link Generated:", authLink);
    res.json(authLink);
  } catch (error) {
    console.error("❌ Error generating auth link:", error);
    res.status(500).json({ error: "Failed to authenticate with Twitter" });
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
