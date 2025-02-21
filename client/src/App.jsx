import { useState } from "react";
import axios from "axios";

const App = () => {
  const [image, setImage] = useState(null);
  const [resizedImages, setResizedImages] = useState([]);

  const handleUpload = async () => {
    if (!image) return alert("Please select an image.");

    const formData = new FormData();
    formData.append("image", image);

    const { data } = await axios.post("http://localhost:5000/upload", formData);
    setResizedImages(data.images);
  };

  const postToTwitter = async () => {
    await axios.post("http://localhost:5000/post-to-twitter", { images: resizedImages });
    alert("Images posted to Twitter!");
  };

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-xl font-bold mb-4">Image Resizer & Twitter Poster</h1>

      <input type="file" onChange={(e) => setImage(e.target.files[0])} className="mb-4" />
      <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded mb-4">
        Upload & Resize
      </button>

      {resizedImages.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-2">Resized Images</h2>
          {resizedImages.map((img, index) => (
            <img key={index} src={`http://localhost:5000/${img}`} alt="Resized" className="w-40 mb-2" />
          ))}
          <button onClick={postToTwitter} className="px-4 py-2 bg-green-500 text-white rounded">
            Post to Twitter
          </button>
        </>
      )}
    </div>
  );
};

export default App;
