import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";
import "./App.css";
import TweetButton from "./TweetButton";
import { AuthProvider } from "./AuthContext"; // Import AuthProvider

const ImageResizer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [resizedImages, setResizedImages] = useState([]);
  const [isResized, setIsResized] = useState(false);
  const [fileName, setFileName] = useState("");

  const dimensions = [
    { width: 300, height: 250 },
    { width: 728, height: 90 },
    { width: 160, height: 600 },
    { width: 300, height: 600 },
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setIsResized(false);
    }
  };

  const resizeImage = () => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const newImages = dimensions.map((dim) => {
          const canvas = document.createElement("canvas");
          canvas.width = dim.width;
          canvas.height = dim.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, dim.width, dim.height);
          return {
            url: canvas.toDataURL("image/png"),
            width: dim.width,
            height: dim.height,
          };
        });
        setResizedImages(newImages);
        setIsResized(true);
      };
    };
  };

  return (
    <AuthProvider>
      <div className="image-resizer-container">
        <div className="image-resizer-card">
          <h1 className="image-resizer-title">Image Resizer</h1>

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="file-input-container">
              <div>
                <p className="file-input-label">{fileName}</p>
                <FaUpload className="upload-icon" />
                <p className="file-input-description">
                  Click to browse or drag and drop
                </p>
              </div>
            </label>
          </div>

          <button
            onClick={resizeImage}
            disabled={!selectedFile}
            className="resize-button"
          >
            Resize Image
          </button>

          <TweetButton resizedImages={resizedImages.map((image) => image.url)} isResized={isResized} />

          {isResized && (
            <div className="resized-images-container">
              {resizedImages.map((image, index) => (
                <div key={index} className="resized-image-card">
                  <div className="resized-image-preview">
                    <img src={image.url} alt="Resized" className="resized-image" />
                  </div>
                  <div className="resized-image-info">
                    <p className="resized-image-size">
                      {image.width} × {image.height}
                    </p>
                    <a
                      href={image.url}
                      download={`resized_${image.width}x${image.height}.png`}
                      className="download-link"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthProvider>
  );
};

export default ImageResizer;
