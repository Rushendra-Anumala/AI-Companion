import { useState, useEffect } from "react";
import Chatbot from "./components/Chatbot";
import Dashboard from "./components/Dashboard";
import Notifications from "./components/Notifications";
import Calendar from "./components/Calendar";
import Games from "./components/Games";
import Mic from "./components/Mic";

function App() {
  // 🔹 States
  const [activeView, setActiveView] = useState("dashboard");

  // 🔹 States
  const [userName, setUserName] = useState("");
  const [aiName, setAiName] = useState("");

  const [tempUserName, setTempUserName] = useState("");
  const [tempAiName, setTempAiName] = useState("");

  // ✅ ADD IT HERE (after states, before functions/UI)
  useEffect(() => {
    const savedUser = localStorage.getItem("userName");
    const savedAI = localStorage.getItem("aiName");

    if (savedUser && savedAI) {
      setUserName(savedUser);
      setAiName(savedAI);
    }
  }, []);

  // 🔹 Start handler
  const handleStart = () => {
    if (!tempUserName || !tempAiName) return;

    localStorage.setItem("userName", tempUserName);
    localStorage.setItem("aiName", tempAiName);

    setUserName(tempUserName);
    setAiName(tempAiName);
  };

  // 🟡 Onboarding
  if (!userName || !aiName) {
    return (
      <div className="glass-container" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h2 style={{ marginBottom: 20 }}>Welcome to AI Companion ✨</h2>
        <p style={{ marginBottom: 20, opacity: 0.8 }}>Let's set up your personal AI dashboard.</p>

        <input
          className="input-pretty"
          placeholder="What's your name?"
          value={tempUserName}
          onChange={(e) => setTempUserName(e.target.value)}
        />

        <input
          className="input-pretty"
          placeholder="Give your AI a nickname..."
          value={tempAiName}
          onChange={(e) => setTempAiName(e.target.value)}
        />

        <button className="btn-gradient" style={{ marginTop: 20, width: '100%' }} onClick={handleStart}>
          Enter Dashboard 🚀
        </button>
      </div>
    );
  }

  // 🟢 Main App Area (Chat, Calendar, Games can be placed here)
  const renderView = () => {
    switch (activeView) {
      case "chat": return <Chatbot userName={userName} aiName={aiName} />;
      case "games": return <Games />;
      case "snakes": return <Games initialGame="snakes" />;
      case "tictactoe": return <Games initialGame="tictactoe" />;
      case "notifications": return <Notifications aiName={aiName} />;
      case "calendar": return <Calendar />;
      default: return <Dashboard setView={setActiveView} userName={userName} aiName={aiName} />;
    }
  };

  return (
    <div>
      {/* Top Navigation Bar to go back to Dashboard */}
      {activeView !== "dashboard" && (
        <div 
          onClick={() => setActiveView("dashboard")}
          style={{ padding: "15px 20px", display: 'inline-block', margin: '10px', fontSize: '18px', fontWeight: 'bold', cursor: "pointer", background: 'rgba(255,255,255,0.2)', borderRadius: '25px', backdropFilter: 'blur(10px)' }}
        >
          ⬅️ Dashboard
        </div>
      )}

      {renderView()}

      {/* Global Voice Assistant Mic */}
      <Mic userName={userName} aiName={aiName} setView={setActiveView} />
    </div>
  );
}

export default App;