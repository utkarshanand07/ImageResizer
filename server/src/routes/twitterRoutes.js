import express from "express";
import { loginWithTwitter, callback, tweetImages, getUser } from "../controllers/twitterController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User Login with Twitter
router.get("/login", loginWithTwitter);

// Twitter OAuth Callback
router.get("/callback", callback);

// Get Authenticated User
router.get("/user", getUser);

// Tweet Images (Only authenticated users)
router.post("/tweet", isAuthenticated, tweetImages);

export default router;
