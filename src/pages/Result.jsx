import { useEffect, useState } from "react";
import { getContract } from "../pages/web3";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function Result() {
  const [title, setTitle] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const electionTitle = localStorage.getItem("electionData");
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#C71585",
    "#40E0D0",
  ];

  const pieData = candidates.map((candidate, index) => ({
    name: candidate.name,
    value: parseInt(candidate.votes),
  }));

  // Fetching results from Blockchain
  useEffect(() => {
    const fetchResults = async () => {
      const contract = await getContract();
      const totalCandidates = await contract.methods.candidatesCount().call();
      console.log(totalCandidates);

      const allCandidates = [];

      for (let i = 1; i <= totalCandidates; i++) {
        const candidate = await contract.methods.candidateDetails(i).call();
        allCandidates.push({
          name: candidate.name,
          votes: candidate.voteCount,
        });
      }

      const totalVotes = await contract.methods.totalVotes().call();
      console.log(allCandidates);
      setCandidates(allCandidates);
      setTotalVotes(totalVotes);
    };

    fetchResults();
  }, []);

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Results for: {electionTitle}</h2>
      <ul className="space-y-2">
        {candidates.map((candidate, idx) => (
          <li key={idx} className="p-4 border rounded-lg flex justify-between">
            <span>{candidate.name}</span>
            <span>{candidate.votes} votes</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 font-semibold">Total Votes Cast: {totalVotes}</div>

      <button
        onClick={() => (window.location.href = "/")}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
      {candidates.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Vote Distribution</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      )}
    </div>
  );
}

export default Result;
