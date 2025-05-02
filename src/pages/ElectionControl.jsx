import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";
import "../styles/ElectionControl.css";
import { getContract } from "./web3";

function ElectionControl() {
  const [candidates, setCandidates] = useState([]);
  const [candidateName, setCandidateName] = useState("");
  const [electionTitle, setElectionTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalElectionTitle, setModalElectionTitle] = useState("");
  const navigate = useNavigate();

  // Adding candidates for the election
  const addCandidate = () => {
    if (candidateName !== "") {
      setCandidates([...candidates, { name: candidateName }]);
      setCandidateName("");
    } else {
      alert("Please enter candidate name");
    }
  };

  // Remove Candidate
  const removeCandidate = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const removeAllCandidates = () => {
    setCandidates([]);
  };

  // Saving elections in MongoDB
  const saveElectionSettings = async () => {
    if (!electionTitle || !startTime || !endTime || candidates.length === 0) {
      alert("Please fill all fields and add at least one candidate!");
      return;
    }

    console.log("Sending Data:", {
      electionTitle,
      startTime,
      endTime,
      candidates,
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/save-election",
        {
          electionTitle,
          startTime,
          endTime,
          candidates,
        }
      );

      if (response.data.success) {
        alert("Election settings saved successfully!");
      } else {
        alert("Failed to save election settings.");
      }
    } catch (error) {
      console.error("Error saving election settings:", error);
      alert("An error occurred while saving election settings.");
    }
  };

  const openElectionModal = () => {
    setIsModalOpen(true);
  };

  const closeElectionModal = () => {
    setIsModalOpen(false);
  };

  // While starting election sending AdminID, CandidateDetails, VoterDetails to Blockchain
  const sendDataToBlockchain = async () => {
    const contract = await getContract();
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];

    // Fetch candidates and voter IDs
    const response = await axios.get(
      `http://localhost:5000/api/election/${modalElectionTitle}`
    );
    const candidates = response.data.candidates.map((c) => c.name);
    const voterResponse = await axios.get("http://localhost:5000/api/voterIDs");
    const voterIDs = voterResponse.data.voterIDs;

    // Push to blockchain
    await contract.methods
      .setElectionDetails("adminID123", modalElectionTitle)
      .send({ from: account });
    await contract.methods.addCandidate(candidates).send({ from: account });
    await contract.methods.addVoters(voterIDs).send({ from: account });

    alert("Election data pushed to blockchain!");
  };

  // Confirm election name exist in MongoDB to start the election
  const confirmElectionName = async () => {
    if (!modalElectionTitle.trim()) {
      alert("Please enter an election name!");
      return;
    }

    try {
      console.log(`Fetching election: ${modalElectionTitle}`); // Debugging Log
      const response = await axios.get(
        `http://localhost:5000/api/election/${modalElectionTitle}`
      );

      console.log("API Response:", response.data); // Log response data

      if (response.status === 200) {
        alert("Election Name Confirmed! Navigating to authentication.");
        localStorage.setItem("electionData", response.data.title);
        sendDataToBlockchain();
        navigate("/authentication", { state: { electionData: response.data } });
      } else {
        alert("Election not found! Please enter a valid election title.");
      }
    } catch (error) {
      console.error(
        "Error fetching election data:",
        error.response?.data || error.message
      );
      alert("Failed to verify election name. Please try again.");
    }
  };

  return (
    <div className="body min-h-screen">
      <div className="flex">
        <div className="flex-1 ml-64 p-8 min-h-screen mr-64">
          <div className="max-w-4xl bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Election Controls
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <button
                id="startElection"
                onClick={openElectionModal}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <i className="bi bi-play-fill"></i> Start Election
              </button>
            </div>
          </div>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Enter Election Name</h2>
                <input
                  type="text"
                  placeholder="Election Name"
                  value={modalElectionTitle}
                  onChange={(e) => setModalElectionTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={closeElectionModal}
                    className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmElectionName}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Election Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Election Title
                </label>
                <input
                  type="text"
                  id="electionTitle"
                  value={electionTitle}
                  onChange={(e) => setElectionTitle(e.target.value)}
                  className="w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => {
                      const selectedStartTime = e.target.value;
                      setStartTime(selectedStartTime);

                      // Automatically set endTime to 24 hours after startTime
                      const startDate = new Date(selectedStartTime);
                      const endDate = new Date(
                        startDate.getTime() + 8 * 60 * 60 * 1000
                      );

                      // Convert endDate to datetime-local format
                      const offset = endDate.getTimezoneOffset();
                      const adjustedEndDate = new Date(
                        endDate.getTime() - offset * 60 * 1000
                      );
                      setEndTime(adjustedEndDate.toISOString().slice(0, 16));
                    }}
                    className="w-full p-2 bg-white rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time (auto-filled)
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    value={endTime}
                    readOnly
                    className="w-full p-2 bg-gray-100 rounded-md cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Manage Candidates
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Enter candidate name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="flex-1 p-2 bg-white rounded-md focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={addCandidate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Candidate
                  </button>
                </div>
                <ul className="space-y-2">
                  {candidates.map((candidate, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-100 p-2 rounded-md"
                    >
                      <div className="flex items-center gap-4">
                        {candidate.name}
                      </div>
                      <button
                        onClick={() => removeCandidate(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={removeAllCandidates}
                  className="bg-red-600 text-white px-6 py-2 mt-4 rounded-md hover:bg-red-700"
                >
                  Delete All Candidates
                </button>
                <div className="mt-6">
                  <button
                    onClick={saveElectionSettings}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
                  >
                    Save Election Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ElectionControl;
