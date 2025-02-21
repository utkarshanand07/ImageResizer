import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Twitter API client configuration
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Predefined image sizes (configurable via settings)
let imageSizes = [
  { width: 300, height: 250 },
  { width: 728, height: 90 },
  { width: 160, height: 600 },
  { width: 300, height: 600 },
];

// Endpoint to update image sizes
app.post('/settings', (req, res) => {
  const { sizes } = req.body;
  if (sizes && Array.isArray(sizes)) {
    imageSizes = sizes;
    res.status(200).json({ message: 'Image sizes updated successfully!' });
  } else {
    res.status(400).json({ error: 'Invalid sizes provided' });
  }
});

// Endpoint to upload, resize, and publish images
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageBuffer = req.file.buffer;
    const resizedImages = [];

    // Resize image to predefined sizes
    for (const size of imageSizes) {
      const resizedImage = await sharp(imageBuffer)
        .resize(size.width, size.height)
        .toBuffer();
      resizedImages.push(resizedImage);
    }

    // Publish images to Twitter
    for (const image of resizedImages) {
      const mediaId = await twitterClient.v1.uploadMedia(image, { mimeType: 'image/jpeg' });
      await twitterClient.v2.tweet({ text: 'Resized image', media: { media_ids: [mediaId] } });
    }

    res.status(200).json({ message: 'Images resized and published successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing the image' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});