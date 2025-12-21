import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

export default function EmployeeRequest() {
  const { teamId } = useParams();
  const [amount, setAmount] = useState("");

  const sendRequest = async () => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) return alert("User not logged in");

    if (!amount) return alert("Enter an amount");

    try {
      await api.post("/tasks/request", {
        teamId,
        employeeId: user.id,    // <-- important!
        amount: Number(amount)
      });

      setAmount("");
      alert("Request sent!");
    } catch (err) {
      console.error("Failed to send request:", err);
      alert(err.response?.data?.error || "Failed to send request");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Request Task</h2>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <button onClick={sendRequest}>Send Request</button>
    </div>
  );
}
