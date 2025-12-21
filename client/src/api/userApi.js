const API = "http://localhost:5000/api";

export async function createUser(data) {
  const res = await fetch(`${API}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(email) {
  // For simplicity, login by email
  const res = await fetch(`${API}/users`);
  const users = await res.json();
  return users.find(u => u.email === email);
}
