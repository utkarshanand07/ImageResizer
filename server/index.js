import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import twitterRoutes from "./src/routes/twitterRoutes.js";

dotenv.config(); // Load .env at the very top

const app = express();
const __dirname = path.resolve();

// Debugging: Ensure ENV variables are loading
console.log("TWITTER_API_KEY:", process.env.TWITTER_API_KEY || "Not Found");
console.log("TWITTER_API_SECRET:", process.env.TWITTER_API_SECRET || "Not Found");

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

// API Routes
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
