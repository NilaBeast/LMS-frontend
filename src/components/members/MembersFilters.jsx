export default function MembersFilters({ filter, setFilter }) {

  const item = (key, label) => (

    <button
      onClick={() => setFilter(key)}
      className={`px-3 py-1 rounded ${
        filter === key ? "bg-black text-white" : "bg-gray-200"
      }`}
    >
      {label}
    </button>

  );

  return (

    <div className="flex gap-3 mb-4">

      {item("all", "All")}
      {item("free", "Free")}
      {item("membership", "Membership")}

    </div>

  );

}