import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const server_url = import.meta.env.NODE_ENV === "development" ? "http://localhost:5000" : import.meta.env.SERVER_URL;

console.log(server_url);
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ Fetch user session on mount
  useEffect(() => {
    axios
      .get(`${server_url}/api/twitter/user`, {
        withCredentials: true, // ✅ Ensures session cookies are sent
      })
      .then((res) => {
        if (res.data.user) {
          setUser(res.data.user);
        }
      })
      .catch((err) => {
        console.error("Auth error:", err);
        setUser(null);
      });
  }, []);

  // ✅ Login function redirects to backend
  const login = () => {
    window.location.href = `${server_url}/api/twitter/login`;
    setTimeout(() => {
      axios
        .get(`${server_url}/api/twitter/user`, { withCredentials: true })
        .then((res) => setUser(res.data.user))
        .catch(() => setUser(null));
    }, 3000); // Delay to allow session to be created
  };

  // ✅ Logout function clears user session
  const logout = async () => {
    await axios.post(`${server_url}/api/twitter/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
