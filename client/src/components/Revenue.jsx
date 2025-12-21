import React, { useState, useEffect } from "react";
import { DollarSign, Wallet, TrendingUp, ClipboardList } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import axios from "axios";

// Reusable Sparkline component
function Sparkline({ data, stroke = "#14B8A6" }) {
  return (
    <div className="w-full sm:w-32 h-16 sm:h-12 min-h-[48px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Reusable Stat Card
function StatCard({ label, value, icon, color, isNumber }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    teal: "bg-teal-100 text-teal-800",
  };

  return (
    <div className="bg-white shadow rounded-xl p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold mt-1">
          {isNumber ? value : `${value.toLocaleString()} SAR`}
        </p>
      </div>
      <div className={`p-3 rounded-full ${colors[color]}`}>{icon}</div>
    </div>
  );
}

// Main Revenue component
export default function Revenue({ teamId, days = 1 }) {
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalEarn: 0,
    totalTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = JSON.parse(localStorage.getItem("loggedInUser"))?.token;

  useEffect(() => {
    const fetchSummary = async () => {
      if (!token || !teamId) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/tasks/team/${teamId}/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const now = new Date();
        const fromDate = new Date();
        fromDate.setDate(now.getDate() - (days - 1));
        fromDate.setHours(0, 0, 0, 0);

        const filteredTasks = res.data.filter((t) => {
          const taskDate = new Date(t.date || t.createdAt);
          return t.status === "approved" && taskDate >= fromDate && taskDate <= now;
        });

        const totalAmount = filteredTasks.reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalEarn = filteredTasks.reduce((sum, t) => sum + (t.earn || 0), 0);

        setSummary({
          totalAmount,
          totalEarn,
          totalTasks: filteredTasks.length,
        });
      } catch (err) {
        console.error("Failed to fetch revenue:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [teamId, token, days]);

  if (!token) return <div className="pt-6 px-6">Unauthorized</div>;
  if (loading) return <div className="pt-6 px-6">Loading...</div>;

  const revenue = summary.totalAmount - summary.totalEarn;
  const sparkData = [
    { v: revenue * 0.6 },
    { v: revenue * 0.75 },
    { v: revenue * 0.9 },
    { v: revenue },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Revenue Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Profit (last {days} day{days > 1 && "s"})
          </p>
          <p className="text-3xl font-bold text-teal-800 mt-2">
            {revenue.toLocaleString()} SAR
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Sparkline data={sparkData} />
          <div className="bg-teal-100 p-4 rounded-full">
            <TrendingUp className="w-8 h-8 text-teal-800" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Amount" value={summary.totalAmount} icon={<DollarSign />} color="blue" />
        <StatCard label="Total Earn" value={summary.totalEarn} icon={<Wallet />} color="green" />
        <StatCard label="Total Washes" value={summary.totalTasks} icon={<ClipboardList />} color="purple" isNumber />
      </div>
    </div>
  );
}
