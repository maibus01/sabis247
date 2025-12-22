const API = "http://localhost:5000/api";

export async function createInvite(data) {
  const res = await fetch(`${API}/invites/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function joinTeam(data) {
  const res = await fetch(`${API}/invites/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}
