export default function TeamCard({ team }) {
  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold">{team.name}</h2>

      <button
        className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
        onClick={() => (window.location.href = `/team/${team._id}`)}
      >
        Open
      </button>
    </div>
  );
}
