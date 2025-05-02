const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");
const Voter = require("./models/Voter");
const Election = require("./models/Election");
const { ethers } = require("ethers");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ProjectDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Admin Database Code Setup
app.post("/api/admin-signin", async (req, res) => {
  const { adminID, password, fingerprintID } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ adminID });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedFingerprintID = await bcrypt.hash(fingerprintID, 10);
    const newAdmin = new Admin({ adminID, password: hashedPassword, fingerprintID: hashedFingerprintID });
    await newAdmin.save();

    res.json({ success: true, message: "Admin registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Server Error ${error}` });
  }
});

app.post("/api/admin-login", async (req, res) => {
  const { adminID, password, fingerprintID } = req.body;
  try {
    const admin = await Admin.findOne({ adminID });
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin Not Found" });
    }

    const hashedPassword = await bcrypt.compare(password, admin.password);
    if (!hashedPassword)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Details" });

    const hashedFingerprintID = await bcrypt.compare(fingerprintID, admin.fingerprintID);
    if (!hashedFingerprintID) return res.status(400).json({ success: false, message: 'Fingerprint Did Not Match' });

    res.json({ success: true, message: "Admin verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Server Error ${error}` });
  }
});

app.post("/api/admin-validation", async (req, res) => {
  const { adminID, adminPassword, adminFingerprintID } = req.body;
  console.log(adminID, adminPassword);
  try {
    const admin = await Admin.findOne({ adminID });
    console.log(admin);

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin Not Found" });
    }

    const hashedPassword = await bcrypt.compare(adminPassword, admin.password);
    if (!hashedPassword)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Details" });

    const hashedFingerprintID = await bcrypt.compare(adminFingerprintID, admin.fingerprintID);
    if (!hashedFingerprintID) return res.status(400).json({ success: false, message: 'Fingerprint Did Not Match' });

    res.json({ success: true, message: "Admin verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Server Error ${error}` });
  }
});

// Voter Database Code Setup
app.post("/api/voter-signin", async (req, res) => {
  const { voterID, voterfingerprintID } = req.body;
  try {
    const existingUser = await Voter.findOne({ voterID });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Voter already exists" });
    }

    const hashedFingerprintID = await bcrypt.hash(voterfingerprintID, 10);
    const newVoter = new Voter({ voterID, voterfingerprintID: hashedFingerprintID });
    await newVoter.save();

    res.json({ success: true, message: "Voter registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Server Error ${error}` });
  }
});

app.post("/api/voter-login", async (req, res) => {
  const { voterID, voterfingerprintID } = req.body;
  try {
    const voter = await Voter.findOne({ voterID });
    if (!voter) {
      return res
        .status(404)
        .json({ success: false, message: "Voter Not Found" });
    }

    const hashedFingerprintID = await bcrypt.compare(voterfingerprintID, voter.voterfingerprintID);
    if (!hashedFingerprintID) return res.status(400).json({ success: false, message: 'Fingerprint Did Not Match' });

    res.json({ success: true, voterID: voter.voterID });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Server Error ${error}` });
  }
});

// Save election settings API
app.post("/api/save-election", async (req, res) => {
  try {
    const { electionTitle, startTime, endTime, candidates } = req.body;
    console.log(req.body);

    if (!electionTitle || !startTime || !endTime || candidates.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check if an election with the same title exists
    const existingElection = await Election.findOne({ title: electionTitle });
    console.log(existingElection);

    if (existingElection) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Election with this title already exists!",
        });
    }

    // Save new election if title is unique
    const newElection = new Election({
      title: electionTitle,
      startTime,
      endTime,
      candidates,
    });

    await newElection.save();
    res.json({ success: true, message: "Election saved successfully!" });
  } catch (error) {
    console.error("Error saving election:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/election/:title", async (req, res) => {
  const { title } = req.params;

  try {
    const election = await Election.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    res.status(200).json(election);
  } catch (error) {
    console.error("Error fetching election:", error);
    res.status(500).json({ error: "Failed to fetch election details" });
  }
});

// Get all voterIDs
app.get("/api/voterIDs", async (req, res) => {
  try {
    const voters = await Voter.find({}, "voterID"); // Fetch only the voterID field
    const voterIDs = voters.map((v) => v.voterID);
    res.json({ voterIDs });
  } catch (error) {
    console.error("Error fetching voterIDs:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
