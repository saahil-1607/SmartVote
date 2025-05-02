import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AdminLogin.css";
import { GoShieldLock } from "react-icons/go";
import { BsFingerprint } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";

function AdminLogin() {
  const [adminID, setAdminID] = useState("");
  const [password, setPassword] = useState("");
  const [fingerprintID, setfingerprintID] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [isFetchingFingerprint, setIsFetchingFingerprint] = useState(false);
  const [fetchActivity, setFetchActivity] = useState(false);
  const navigate = useNavigate();

  // Connection of frontend with Biometric module
  const handleFetchFingerprint = async () => {
    setError("");
    setIsFetchingFingerprint(true);

    try {
      console.log("Running Fingerprint Fetching");
      const response = await axios.get(
        "http://localhost:5001/api/verify-fingerprint"
      );
      setfingerprintID(response.data.fingerprint);
      setFetchActivity(true);
    } catch (error) {
      setError("Failed to fetch fingerprint. Please try again.");
    } finally {
      setIsFetchingFingerprint(false);
    }
  };

  // Connection with backend for admin sign in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setNotification("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin-login",
        {
          adminID,
          password,
          fingerprintID,
        }
      );
      if (response.status === 200) {
        setNotification("Admin verified successfully!");
        navigate("/create-election", { state: { adminID } });
        setError("");
      } else {
        setError("Admin Not Found.");
      }
    } catch (err) {
      setError("Server Error. Please try again later.");
      console.log(err);
    }
  };

  return (
    <div className="home min-h-screen flex items-center justify-center p-4">
      <div className="admin-signin max-w-md w-full glass-effect1 rounded-xl p-8 space-y-8">
        <div className="text-center">
          <GoShieldLock className="text-4xl inline" />
          <h2 className="mt-4 text-3xl font-bold text-black">Admin Login</h2>
        </div>
        <form id="loginForm" className="space-y-6" onSubmit={handleSignIn}>
          <div>
            <label className="text-black text-sm font-medium block mb-2">
              <b>Admin Id</b>
            </label>
            <input
              type="text"
              name="adminID"
              value={adminID}
              onChange={(e) => setAdminID(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-gray border-opacity-30 focus:border-blue-500 focus:outline-none text-black placeholder-gray-300"
              placeholder="Enter your Admin ID"
            />
          </div>

          <div>
            <label className="text-black text-sm font-medium block mb-2">
              <b>Password</b>
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-gray border-opacity-30 focus:border-blue-500 focus:outline-none text-black placeholder-gray-300"
              placeholder="Enter your Password"
            />
          </div>

          <div className="text-center">
            <p className="text-black text-sm mb-4">
              <a
                onClick={() => {
                  setfingerprintID(null);
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
                    value={fingerprintID}
                    onChange={(e) => setfingerprintID(e.target.value)}
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
            className="w-full bg-white hover:bg-blue-600 text-black hover:text-white font-bold hover:font-bold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
