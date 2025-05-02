import { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from "./pages/AdminLogin";
import VoterSignup from "./pages/VoterSignup";
import ElectionControl from "./pages/ElectionControl";
import Voting from "./pages/Voting";
import Result from "./pages/Result";

function App() {
  return (
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<AdminLogin/>} />
            <Route path="/create-election" element={<ElectionControl />} />
            <Route path="/authentication" element={<VoterSignup />} />
            <Route path="/vote" element={<Voting />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
