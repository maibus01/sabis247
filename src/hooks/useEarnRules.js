import { useState, useEffect } from "react";
import axios from "axios";

export default function useEarnRules(teamId, token) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamId || !token) return;

    const fetchRules = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/earnRules/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRules(res.data || []);
      } catch (err) {
        console.error("Failed to fetch earn rules:", err);
        if (err.response) {
          setError(err.response.data.error || err.response.data.message || "Server error");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [teamId, token]);

  return { rules, loading, error, setRules };
}
