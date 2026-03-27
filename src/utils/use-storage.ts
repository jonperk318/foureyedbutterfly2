import { useState, useEffect } from "react";

export const useStorage = (key: string, defaultValue: any) => {
  const [value, setValue] = useState(() => {
    return JSON.parse(localStorage.getItem(key) || defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

// Probably will remove this
export const storage = {
  getToken: () => JSON.parse(localStorage.getItem("access_token") || "null"),
  setToken: (token: string) =>
    localStorage.setItem("access_token", JSON.stringify(token)),
  clearToken: () => localStorage.removeItem("access_token"),
};
