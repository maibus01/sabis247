const API = "http://localhost:5000/api";

export async function getUserTeams(userId) {
  const res = await fetch(`${API}/teams/user/${userId}`);
  return res.json();
}

export async function createTeam(team) {
  const res = await fetch(`${API}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(team),
  });

  return res.json();
}
