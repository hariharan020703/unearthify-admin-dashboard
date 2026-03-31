import { Navigate } from "react-router";
import { getToken, isTokenExpired, logout, autoLogout } from "./Auth";
import toast from "react-hot-toast";
import { JSX, useEffect, useState } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [valid, setValid] = useState(true);

  useEffect(() => {
    const token = getToken();
    
    if (!token || isTokenExpired(token)) {
      logout();
      // toast.error("Session expired. Please login again.");
      setValid(false);
      return;
    }

    autoLogout();        // exact expiry logout
    // startIdleLogout(60); // idle logout

    const interval = setInterval(() => {
      const token = getToken();
      if (!token || isTokenExpired(token)) {
        logout();
        toast.error("Session expired. Please login again.");
        setValid(false);
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  if (!valid) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
