import { useState } from "react";
import axios from "axios";

export default function JoinTeam({ token, onJoin }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code) return alert("Enter an invite code");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/invites/join",
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Joined team successfully as ${res.data.role}`);
      onJoin(res.data.teamId); // callback to refresh teams
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter invite code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border px-2 py-1 rounded"
      />
      <button
        onClick={handleJoin}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
      >
        {loading ? "Joining..." : "Join"}
      </button>
    </div>
  );
}
