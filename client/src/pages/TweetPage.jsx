import { useState } from "react";
import "./TweetPage.css";
import { useTweet } from "../context/TweetContext";

const TweetPage = () => {
  const [tweetText, setTweetText] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const { tweetImages, loading, message } = useTweet();

  const handleTweet = () => {
    if (!tweetText.trim()) {
      alert("⚠️ Tweet cannot be empty!");
      return;
    }

    tweetImages(imageUrls ? imageUrls.split(",") : [], tweetText);
    setTweetText("");
    setImageUrls("");
  };

  return (
    <div className="tweet-container">
      <div className="tweet-card">
        <h2 className="tweet-title">Post a Tweet</h2>
        <textarea
          className="tweet-input"
          placeholder="What's happening?"
          value={tweetText}
          onChange={(e) => setTweetText(e.target.value)}
        />
        <input
          className="tweet-url-input"
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
        />
        <button className="tweet-button" onClick={handleTweet} disabled={loading}>
          {loading ? "Tweeting..." : "Tweet"}
        </button>
        {message && <p className="tweet-message">{message}</p>}
      </div>
    </div>
  );
};

export default TweetPage;
