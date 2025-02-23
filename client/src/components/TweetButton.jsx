import React from "react";
import "./TweetButton.css";
import { useAuth } from "../context/AuthContext";
import { useTweet } from "../context/TweetContext";

const TweetButton = ({ resizedImages, isResized }) => {
  const { user, login, logout } = useAuth();
  const { tweetImages, loading, tweeted } = useTweet();

  const handleTweet = () => {
    if (!user) {
      alert("You need to log in with Twitter first!");
      login();
      return;
    }

    tweetImages(resizedImages, "Here are my resized images!");
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
          disabled={loading || tweeted || !isResized}
          className={`tweet-button ${loading || tweeted || !isResized ? "disabled" : ""}`}
        >
          {loading ? "Tweeting..." : tweeted ? "Tweeted" : "Tweet Images"}
        </button>
      )}
      {user && <button onClick={logout} className="logout-button">Logout</button>}
    </>
  );
};

export default TweetButton;
