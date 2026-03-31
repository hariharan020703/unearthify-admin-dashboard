/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  exp: number;
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

let logoutTimer: any;

export const autoLogout = () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const expiryTime = decoded.exp * 1000;
    const now = Date.now();
    const timeout = expiryTime - now;

    if (timeout <= 0) {
      logout();
      window.location.href = "/signin";
    } else {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        logout();
        window.location.href = "/signin";
      }, timeout);
    }
  } catch {
    logout();
    window.location.href = "/signin";
  }
};
let idleTimer: any;

export const startIdleLogout = (minutes = 10) => {
  const time = minutes * 60 * 1000;

  const resetTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      logout();
      window.location.href = "/signin";
    }, time);
  };

  ["click", "mousemove", "keydown", "scroll"].forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();
};