import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();
const KEY = 'lep-user';

// LEP-6: the session survives a page refresh (the starter lost it on reload)
const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(load);

  const login = (userData) => {
    setUser(userData);
    try { localStorage.setItem(KEY, JSON.stringify(userData)); } catch {}
  };

  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(KEY); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
