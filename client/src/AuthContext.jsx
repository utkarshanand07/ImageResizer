import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/twitter/user", { withCredentials: true })
      .then((res) => {
        if (res.data.user) {
          setUser(res.data.user);
        }
      })
      .catch(() => setUser(null));
  }, []);

  const login = () => {
    window.location.href = "http://localhost:5000/api/twitter/login";
  };

  const logout = async () => {
    await axios.post("http://localhost:5000/api/twitter/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Fixed export issue
export const useAuth = () => {
  return useContext(AuthContext);
};
