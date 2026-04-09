import React from "react";

function Dashboard({ setView, userName, aiName }) {
  return (
    <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Welcome back, {userName}!</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '40px', opacity: 0.9 }}>What would you like to do with {aiName} today?</p>
      
      <div className="dashboard-grid">
        <div className="glass-container" onClick={() => setView("chat")} style={{ cursor: 'pointer', textAlign: 'center', margin: 0 }}>
          <h1 style={{ fontSize: '3rem', margin: '10px 0' }}>💬</h1>
          <h3>Chat</h3>
        </div>
        <div className="glass-container" onClick={() => setView("games")} style={{ cursor: 'pointer', textAlign: 'center', margin: 0 }}>
          <h1 style={{ fontSize: '3rem', margin: '10px 0' }}>🎮</h1>
          <h3>Games</h3>
        </div>
        <div className="glass-container" onClick={() => setView("notifications")} style={{ cursor: 'pointer', textAlign: 'center', margin: 0 }}>
          <h1 style={{ fontSize: '3rem', margin: '10px 0' }}>🔔</h1>
          <h3>Alerts</h3>
        </div>
        <div className="glass-container" onClick={() => setView("calendar")} style={{ cursor: 'pointer', textAlign: 'center', margin: 0 }}>
          <h1 style={{ fontSize: '3rem', margin: '10px 0' }}>📅</h1>
          <h3>Tasks</h3>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
