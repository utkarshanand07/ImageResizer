import express from "express";
import { loginWithTwitter, callback, tweetImages } from "../controllers/twitterController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User Login with Twitter
router.get("/login", loginWithTwitter);

// Twitter OAuth Callback
router.get("/callback", callback);

// Tweet Images (Only authenticated users)
router.post("/tweet", isAuthenticated, tweetImages);

export default router;
