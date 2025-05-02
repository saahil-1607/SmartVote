import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Voting.css";
import { getContract } from "./web3";

function VotePage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const navigate = useNavigate();
  const electionData = localStorage.getItem("electionData"); // Retrieve election details
  const [voterIDs, setVoterIDs] = useState([]);

  // Fetch candidates from the MongoDB
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        console.log(electionData);
        const response = await axios.get(
          `http://localhost:5000/api/election/${electionData}`
        );

        console.log("API Full Response:", response);
        console.log("Response Data:", response.data);

        if (!response.data) {
          console.error("API returned null or undefined.");
          setCandidates([]);
          return;
        }

        if (Array.isArray(response.data)) {
          console.log("Candidates Array Found:", response.data);
          setCandidates(response.data);
        } else if (
          response.data.candidates &&
          Array.isArray(response.data.candidates)
        ) {
          console.log(
            "Candidates extracted from object:",
            response.data.candidates
          );
          setCandidates(response.data.candidates);
        } else {
          console.error("Unexpected API Response Format:", response.data);
          setCandidates([]);
        }
      } catch (error) {
        console.error(
          "Error fetching candidates:",
          error.response?.data || error.message
        );
        setCandidates([]);
      }
    };

    fetchCandidates();
  }, [electionData, setCandidates]);

  // Fetch VoterIDs from the MongoDB
  useEffect(() => {
    const fetchVoterIDs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/voterIDs");
        console.log("Voter IDs:", response.data.voterIDs);
        setVoterIDs(response.data.voterIDs);
      } catch (error) {
        console.error("Error fetching voter IDs:", error);
      }
    };

    fetchVoterIDs();
  }, [setVoterIDs]);

  // SUbmit vote on the Blockchain
  const handleVote = async () => {
    if (!selectedCandidate) {
      alert("Please select a candidate to vote.");
      return;
    }

    const voterID = localStorage.getItem("voterID"); // store this earlier at login time
    if (!voterID || isNaN(parseInt(voterID))) {
      alert("Invalid or missing Voter ID. Please log in again.");
      return;
    }

    try {
      const contract = await getContract();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];

      await contract.methods
        .vote(selectedCandidate.index, parseInt(voterID))
        .send({ from: account });
      alert("Vote cast successfully!");
      navigate("/authentication");
    } catch (err) {
      console.error("Voting failed", err);
      alert("Voting failed");
    }
  };

  // TO avoid double voting
  const checkIfVoted = async (account) => {
    const contract = await getContract();
    const hasVoted = await contract.methods.hasVoted(account).call();
    return hasVoted;
  };

  useEffect(() => {
    const verifyVoteStatus = async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      const voted = await checkIfVoted(account);
      if (voted) {
        alert("You have already voted!");
        navigate("/authentication"); // redirect to login page
      }
    };
    verifyVoteStatus();
  }, []);

  return (
    <div className="body min-h-screen">
      <div className="flex">
        <div className="flex-1 ml-64 p-8 min-h-screen">
          <div className="max-w-4xl bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Vote for Your Candidate
            </h2>

            {electionData && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-black">
                  {electionData}
                </h3>
              </div>
            )}

            {candidates.length === 0 ? (
              <p className="text-red-500">No candidates available</p>
            ) : (
              <ul className="space-y-4">
                {candidates.map((candidate, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-800">
                        {candidate.name}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedCandidate({
                          name: candidate.name,
                          index: index + 1,
                        })
                      }
                      className={`px-4 py-2 rounded-lg ${
                        selectedCandidate?.name === candidate.name
                          ? "bg-blue-600 text-white"
                          : "bg-gray-300"
                      }`}
                    >
                      {selectedCandidate === candidate.name
                        ? "Selected"
                        : "Select"}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6">
              <button
                onClick={handleVote}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Submit Vote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VotePage;
