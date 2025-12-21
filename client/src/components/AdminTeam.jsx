import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

export default function AdminTeam() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  useEffect(() => {
    if (!loggedInUser || loggedInUser.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchTeam = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/teams/${teamId}`,
          { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
        );
        setTeam(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load team");
      }
    };

    fetchTeam();
  }, [teamId, navigate, loggedInUser]);

  if (!team) return <p>Loading team...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Header />
      <h1 className="text-2xl font-bold mb-4">{team.name}</h1>
      <p className="text-gray-500 mb-6">{team.description}</p>

      <h2 className="font-semibold mb-2">Members</h2>
      <ul className="space-y-2">
        {team.members.map((m) => (
          <li
            key={m.userId._id}
            className="flex justify-between bg-gray-50 p-2 rounded"
          >
            <span>{m.userId.name} ({m.role})</span>
            <span className={`text-sm ${m.userId.isActive ? "text-green-600" : "text-red-600"}`}>
              {m.userId.isActive ? "Active" : "Disabled"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
