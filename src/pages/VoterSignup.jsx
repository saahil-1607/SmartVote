import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";
import "../styles/VoterSignup.css";
import { getContract } from "./web3";
import { BsFingerprint } from "react-icons/bs";
import { GoShieldLock } from "react-icons/go";
import { BsBox } from "react-icons/bs";
import { BsGraphUp } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";

function VoterSignup() {
  const [voterID, setVoterID] = useState("");
  const [voterfingerprintID, setvoterFingerprintID] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [isFetchingFingerprint, setIsFetchingFingerprint] = useState(false);
  const [fetchActivity, setFetchActivity] = useState(false);
  const navigate = useNavigate();
  const electionData = localStorage.getItem("electionData"); // Get election details
  const [showModal, setShowModal] = useState(false);
  const [adminID, setAdminID] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminFingerprintID, setAdminFingerprintID] = useState("");
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  // Connection of frontend with Biometric module
  const handleFetchFingerprint = async () => {
    setError("");
    setIsFetchingFingerprint(true);

    try {
      console.log("Running Fingerprint Fetching");
      const response = await axios.get(
        "http://localhost:5001/api/verify-fingerprint"
      );
      setvoterFingerprintID(response.data.fingerprint);
      setFetchActivity(true);
    } catch (error) {
      setError("Failed to fetch fingerprint. Please try again.", error);
    } finally {
      setIsFetchingFingerprint(false);
    }
  };

  const handleFingerprintAuth = async () => {
    setError("");
    setIsFetchingFingerprint(true);

    try {
      console.log("Running Fingerprint Fetching");
      const response = await axios.get(
        "http://localhost:5001/api/verify-fingerprint"
      );
      setAdminFingerprintID(response.data.fingerprint);
      setFetchActivity(true);
    } catch (error) {
      setError("Failed to fetch fingerprint. Please try again.", error);
    } finally {
      setIsFetchingFingerprint(false);
    }
  };

  // Connection with backend for voter authentication
  const handleSignIn = async (e) => {
    e.preventDefault();
    setNotification("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/voter-login",
        {
          voterID,
          voterfingerprintID,
        }
      );
      if (response.status === 200) {
        setNotification("Voter verified successfully!");
        console.log(electionData);
        localStorage.setItem("voterID", voterID);
        const contract = await getContract();
        const hasVoted = await contract.methods.voterDetails(voterID).call();

        if (hasVoted.hasVoted) {
          alert("You have already voted!");
          setVoterID("");
          setFetchActivity(false);
          return;
        }

        navigate(`/vote/?${electionData}`, { state: { electionData } });
        setError("");
      } else {
        setError("Voter Not Found.");
      }
    } catch (err) {
      setError("Server Error. Please try again later.");
      console.log(err);
    }
  };

  // Connection with backend for admin sign in to end elections
  const handleAdminValidation = async (e) => {
    e.preventDefault();
    setNotification("");
    setIsAdminVerified(true);
    exitFullscreen();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin-validation",
        {
          adminID,
          adminPassword,
          adminFingerprintID,
        }
      );
      console.log(response);

      if (response.status === 200) {
        setNotification("Admin verified successfully!");
        navigate("/result");
        setError("");
      } else {
        alert("Invalid Admin Credentials");
        setShowModal(false);
      }
    } catch (err) {
      setError("Server Error. Please try again later.");
      console.log(err);
    }
  };

  // Start Full screen
  const requestFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen)
      elem.webkitRequestFullscreen(); // Safari
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen(); // IE11
  };

  // Exit full screen
  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen)
      document.webkitExitFullscreen(); // Safari
    else if (document.msExitFullscreen) document.msExitFullscreen(); // IE11
  };

  useEffect(() => {
    requestFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isAdminVerified) {
        // Re-enter fullscreen shortly after ESC is pressed
        setTimeout(() => {
          requestFullscreen();
        }, 10); // small delay helps ensure re-entry works
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isAdminVerified]);

  return (
    <div className="gradient-bg min-h-screen">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center min-h-screen">
        {/* <!-- Left Section - Login Form --> */}
        <div className="glass-effect p-8 rounded-lg shadow-xl w-full max-w-md mx-4 mb-8 md:mb-0 card-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-500 mb-2">
              Secure E-Voting System
            </h1>
            <p className="text-gray-500">
              Biometric Authentication & Blockchain
            </p>
          </div>

          <form id="loginForm" className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label className="block text-gray-500 mb-2">
                <b>Voter ID</b>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-black border-opacity-30 focus:border-blue-500 focus:outline-none text-black placeholder-gray-300"
                required
                name="voterID"
                value={voterID}
                onChange={(e) => setVoterID(e.target.value)}
                placeholder="Enter your Voter ID"
              />
            </div>
            <div className="text-center">
              <p className="text-black text-sm mb-4">
                <a
                  onClick={() => {
                    setvoterFingerprintID(null);
                    setFetchActivity(false);
                  }}
                  className="underline text-blue-600 cursor-pointer"
                >
                  Reset Fingerprint
                </a>
              </p>
              <button
                type="submit"
                id="biometricBtn"
                onClick={handleFetchFingerprint}
                disabled={isFetchingFingerprint}
                className="fingerprint-scanner1 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                {fetchActivity ? (
                  <FaCheckCircle className="text-4xl text-green-600" />
                ) : (
                  <BsFingerprint className="text-4xl text-black">
                    <input
                      name="FingerprintInput"
                      type="text"
                      placeholder="Fingerprint (Identifier)"
                      value={voterfingerprintID}
                      onChange={(e) => setvoterFingerprintID(e.target.value)}
                      required
                      readOnly
                      className="text-transparent"
                    />
                  </BsFingerprint>
                )}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-white-600 text-black border border-blue py-2 px-4 rounded hover:bg-blue-600 hover:text-white transition duration-300"
            >
              Login
            </button>
            <button
              type="submit"
              className="w-full bg-red-600 text-white border border-red py-2 px-4 rounded hover:bg-white hover:text-red-600 hover:border-red-600 transition duration-300"
              onClick={() => {
                // setShowModal(true);
                setShowModal(true), setFetchActivity(false);
              }}
            >
              End Election
            </button>
          </form>
        </div>

        {/* <!-- Right Section - Features --> */}
        <div className="w-full max-w-md mx-4">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg card-border">
              <div className="flex items-center mb-4">
                <GoShieldLock className="text-3xl text-green-400 mr-4" />
                <h3 className="text-xl font-semibold text-gray-500">
                  Secure Authentication
                </h3>
              </div>
              <p className="text-gray-500">
                Multi-factor authentication with biometric verification ensures
                maximum security.
              </p>
            </div>

            <div className="glass-effect p-6 rounded-lg card-border">
              <div className="flex items-center mb-4">
                <BsBox className="text-3xl text-blue-400 mr-4" />
                <h3 className="text-xl font-semibold text-gray-500">
                  Blockchain Technology
                </h3>
              </div>
              <p className="text-gray-500">
                Immutable and transparent voting records using advanced
                blockchain.
              </p>
            </div>

            <div className="glass-effect p-6 rounded-lg card-border">
              <div className="flex items-center mb-4">
                <BsGraphUp className="text-3xl text-purple-400 mr-4" />
                <h3 className="text-xl font-semibold text-gray-500">
                  Real-time Analytics
                </h3>
              </div>
              <p className="text-gray-500">
                Monitor voting progress and results with detailed analytics.
              </p>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-blue-200 rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Admin Verification
              </h2>
              <form
                id="adminValidation"
                className="space-y-6"
                onSubmit={handleAdminValidation}
              >
                <input
                  type="text"
                  placeholder="Admin ID"
                  className="w-full mb-3 p-2 border rounded"
                  value={adminID}
                  onChange={(e) => setAdminID(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full mb-3 p-2 border rounded"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />

                <button
                  type="submit"
                  id="biometricBtn"
                  onClick={handleFingerprintAuth}
                  disabled={isFetchingFingerprint}
                  className="fingerprint-scanner1 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  {fetchActivity ? (
                    <FaCheckCircle className="text-4xl text-green-600" />
                  ) : (
                    <BsFingerprint className="text-4xl text-black ">
                      <input
                        name="FingerprintInput"
                        type="text"
                        placeholder="Fingerprint (Identifier)"
                        value={adminFingerprintID}
                        onChange={(e) => setAdminFingerprintID(e.target.value)}
                        required
                        readOnly
                        className="text-transparent"
                      />
                    </BsFingerprint>
                  )}
                </button>

                <div className="flex justify-between mt-4">
                  <button
                    className="bg-red-600 text-white border border-red-600 px-4 py-2 rounded hover:bg-white hover:text-red-600"
                    onClick={handleAdminValidation}
                  >
                    End
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-green-600 text-white border px-4 py-2 rounded hover:bg-white hover:text-green-600 border-green-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoterSignup;
