import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const TweetContext = createContext();

export const TweetProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tweeted, setTweeted] = useState(false);
  const [message, setMessage] = useState("");

  const tweetImages = async (imageUrls, tweetText) => {
    if (!user) {
      alert("⚠️ You need to log in first!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        //"http://localhost:5000/api/twitter/tweet",
        "https://imageresizer-sk2h.onrender.com/api/twitter/tweet",
        { imageUrls, tweetText },
        { withCredentials: true }
      );

      if (response.data.success) {
        setTweeted(true);
        setMessage("✅ Tweet posted successfully!");
      } else {
        setMessage("⚠️ Tweet failed. Please try again.");
      }
    } catch (error) {
      console.error("Error tweeting:", error);
      setMessage("❌ Failed to tweet images.");
    }
    setLoading(false);
  };

  return (
    <TweetContext.Provider value={{ tweetImages, loading, tweeted, message }}>
      {children}
    </TweetContext.Provider>
  );
};

export const useTweet = () => useContext(TweetContext);
