import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function Notifications({ aiName }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLocalNotifications = () => {
    const local = JSON.parse(localStorage.getItem("mockNotifications") || "[]");
    if (local.length > 0) {
      setNotifications(local);
      return true;
    }
    return false;
  };

  const fetchMockNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/notifications/generate`, { aiName });
      const newNotifs = response.data.notifications || [];
      setNotifications(newNotifs);
      localStorage.setItem("mockNotifications", JSON.stringify(newNotifs));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, [aiName]);

  useEffect(() => {
    if (!loadLocalNotifications()) {
      fetchMockNotifications();
    }
    
    const handleUpdate = () => loadLocalNotifications();
    window.addEventListener("notificationsUpdated", handleUpdate);
    return () => window.removeEventListener("notificationsUpdated", handleUpdate);
  }, [fetchMockNotifications]);

  return (
    <div style={{ padding: 20 }}>
      <h2>🔔 Notifications</h2>
      <button onClick={fetchMockNotifications} disabled={loading}>
        {loading ? "Refreshing..." : "Generate New Mocks"}
      </button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {notifications.map((n, i) => (
          <li key={i} style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}>
            <strong>{n.app}</strong>: {n.message} <em>({n.time})</em>
          </li>
        ))}
      </ul>
      {notifications.length === 0 && !loading && <p>No new notifications.</p>}
    </div>
  );
}

export default Notifications;
