import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ImageResizer from "./pages/ImageResizer";
import TweetPage from "./pages/TweetPage";
import { AuthProvider } from "./context/AuthContext";
import { TweetProvider } from "./context/TweetContext";

const App = () => {
  return (
    <AuthProvider>
      <TweetProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ImageResizer />} />
            <Route path="/tweet" element={<TweetPage />} />
          </Routes>
        </Router>
      </TweetProvider>
    </AuthProvider>
  );
};

export default App;
