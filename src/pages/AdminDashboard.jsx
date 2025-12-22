import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // Fetch all admin data
  const fetchAdminData = async () => {
    if (!loggedInUser || loggedInUser.role !== "admin") {
      window.location.href = "/";
      return;
    }

    const headers = { Authorization: `Bearer ${loggedInUser.token}` };

    try {
      setLoading(true);
      const [usersRes, teamsRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/teams`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers }),
      ]);

      setUsers(usersRes.data);
      setTeams(teamsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Admin fetch error:", err);
      alert("Failed to fetch admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Toggle user active/disabled
  const toggleUser = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
      );

      // Refresh users after toggle
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <p className="p-6 text-center text-gray-500 italic">
        Loading admin dashboard...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="pt-24 p-6 max-w-6xl mx-auto space-y-10">
        <h1 className="text-3xl font-extrabold text-gray-800">
          🛠 Admin Dashboard
        </h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Users" value={stats.users} />
            <StatCard title="Teams" value={stats.teams} />
            <StatCard title="Tasks" value={stats.tasks} />
          </div>
        )}

        {/* Users Table */}
        <section>
          <h2 className="text-xl font-bold mb-3">👤 Users</h2>
          <div className="bg-white rounded-xl shadow border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b">
                    <td className="p-2">{u.name}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2 capitalize">{u.role}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          u.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => toggleUser(u._id)}
                        className={`px-3 py-1 rounded text-white text-xs ${
                          u.isActive ? "bg-red-600" : "bg-green-600"
                        }`}
                      >
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Teams */}
        <section>
          <h2 className="text-xl font-bold mb-3">👥 Teams</h2>
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team._id}
                className="bg-white p-4 rounded-xl border shadow-sm cursor-pointer hover:bg-teal-50 transition"
                onClick={() => navigate(`/team/${team._id}/dashboard`)}
              >
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-sm text-gray-500">
                  Members: {team.members?.length || 0}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border text-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold text-teal-800">{value}</p>
    </div>
  );
}
