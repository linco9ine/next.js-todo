// ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "./Spinner";

export default function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  const router = useRouter();

  useEffect(() => {
    axios.get('/api/auth/check', { withCredentials: true })
      .then(() => {
        console.log("Auth success");
        setAuthenticated(true);
      })

      .catch((err) => {
        console.log("Unauthorized::", err);
        setAuthenticated(false)
      })

      .finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    if (checked && !authenticated) {
      router.replace("/login");
    }
  }, [checked, authenticated, router]);

  if (!checked || !authenticated) {
    return <Spinner />
  }

  return children;
}

