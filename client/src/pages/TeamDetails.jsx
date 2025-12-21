import { useEffect, useState } from "react";
import { createInvite } from "../api/inviteApi";
import { getUserTeams } from "../api/teamApi";
import { useParams } from "react-router-dom";

export default function TeamDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [team, setTeam] = useState(null);
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const teams = await getUserTeams(user._id);
    setTeam(teams.find((t) => t._id === id));
  }

  async function generateInvite(role) {
    const res = await createInvite({
      teamId: id,
      role,
      createdBy: user._id,
    });
    setInviteCode(res.code);
  }

  if (!team) return "Loading...";

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{team.name}</h1>

      <div className="mt-6 flex gap-4">
        {user._id === team.owner && (
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => generateInvite("manager")}
          >
            Invite Manager
          </button>
        )}

        {(user._id === team.owner || user._id === team.manager) && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => generateInvite("employee")}
          >
            Invite Employee
          </button>
        )}
      </div>

      {inviteCode && (
        <p className="mt-4 text-lg">
          Invite Code: <span className="font-bold">{inviteCode}</span>
        </p>
      )}
    </div>
  );
}
