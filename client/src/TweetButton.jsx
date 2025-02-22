import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TweetButton.css";
import { useAuth } from "./AuthContext"; // Import authentication context

const TweetButton = ({ resizedImages, isResized }) => {
  const { user, login, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tweeted, setTweeted] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(isResized);
  }, [isResized]);

  const handleTweet = async () => {
    if (!user) {
      alert("You need to log in with Twitter first!");
      login();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/twitter/tweet", {
        imageUrls: resizedImages,
        tweetText: "Here are my resized images!",
      }, { withCredentials: true });

      if (response.data.success) {
        setTweeted(true);
        alert("Tweet posted successfully!");
      }
    } catch (error) {
      console.error("Error tweeting:", error);
      alert("Failed to tweet images.");
    }
    setLoading(false);
  };

  return (
    <>
      {!user ? (
        <button onClick={login} className="tweet-button">
          Login with Twitter
        </button>
      ) : (
        <button
          onClick={handleTweet}
          disabled={loading || tweeted || !isEnabled}
          className={`tweet-button ${loading || tweeted || !isEnabled ? "disabled" : ""}`}
        >
          {loading ? "Tweeting..." : tweeted ? "Tweeted" : "Tweet Images"}
        </button>
      )}
      {user && <button onClick={logout} className="logout-button">Logout</button>}
    </>
  );
};

export default TweetButton;
