import { useState } from "react";
import axios from "axios";

const App = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resizedImages, setResizedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return alert("Please select an image.");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const { data } = await axios.post("http://localhost:5000/upload", formData);
      setResizedImages(data.images);
    } catch (error) {
      console.error("Error uploading image", error);
    }

    setLoading(false);
  };

  const postToTwitter = async () => {
    try {
      await axios.post("http://localhost:5000/post-to-twitter", { images: resizedImages });
      alert("Images posted to Twitter!");
    } catch (error) {
      console.error("Error posting to Twitter", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Image Resizer & Twitter Poster</h1>

      <div style={styles.card}>
        <label style={styles.label}>Upload an Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImage(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
          }}
          style={styles.input}
        />

        {preview && <img src={preview} alt="Preview" style={styles.imagePreview} />}

        <button
          onClick={handleUpload}
          style={loading ? styles.buttonDisabled : styles.button}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload & Resize"}
        </button>
      </div>

      {resizedImages.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.subHeading}>Resized Images</h2>
          <div style={styles.imageGrid}>
            {resizedImages.map((img, index) => (
              <img key={index} src={`http://localhost:5000/${img}`} alt="Resized" style={styles.image} />
            ))}
          </div>

          <button onClick={postToTwitter} style={styles.buttonGreen}>
            Post to Twitter
          </button>
        </div>
      )}
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
    padding: "20px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  label: {
    fontSize: "16px",
    fontWeight: "600",
    display: "block",
    marginBottom: "10px",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "15px",
  },
  imagePreview: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "15px",
  },
  button: {
    width: "100%",
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  buttonDisabled: {
    width: "100%",
    backgroundColor: "#ccc",
    color: "#666",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "not-allowed",
  },
  buttonGreen: {
    width: "100%",
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  subHeading: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#333",
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
    marginBottom: "15px",
  },
  image: {
    width: "100%",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
};

export default App;
