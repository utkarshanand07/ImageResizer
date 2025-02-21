import express from "express";
import multer from "multer";
import sharp from "sharp";
import dotenv from "dotenv";
import cors from "cors";
import { TwitterApi } from "twitter-api-v2";
import fs from "fs";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Twitter Client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Image resizing function
const resizeImage = async (filePath, size, outputName) => {
  const outputPath = `uploads/${outputName}.jpg`;
  await sharp(filePath).resize(size.width, size.height).toFile(outputPath);
  return outputPath;
};

// Upload and resize API
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const sizes = [
      { width: 300, height: 250, name: "300x250" },
      { width: 728, height: 90, name: "728x90" },
      { width: 160, height: 600, name: "160x600" },
      { width: 300, height: 600, name: "300x600" },
    ];

    const resizedImages = await Promise.all(
      sizes.map((size) => resizeImage(file.path, size, size.name))
    );

    res.json({ message: "Images resized", images: resizedImages });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Post images to Twitter
app.post("/post-to-twitter", async (req, res) => {
  try {
    const { images } = req.body;

    const mediaIds = await Promise.all(
      images.map(async (image) => {
        const mediaData = await twitterClient.v1.uploadMedia(image);
        return mediaData.media_id_string;
      })
    );

    await twitterClient.v2.tweet("Here are my resized images!", {
      media: { media_ids: mediaIds },
    });

    res.json({ message: "Posted to Twitter!" });
  } catch (error) {
    res.status(500).json({ error: "Error posting to Twitter" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
