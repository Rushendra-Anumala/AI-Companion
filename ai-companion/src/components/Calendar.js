import React, { useState, useEffect } from "react";

function Calendar() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("calendarTasks") || "[]");
    setTasks(savedTasks);
    
    const handleTaskAdded = (e) => {
      const newTasks = [...JSON.parse(localStorage.getItem("calendarTasks") || "[]")];
      // ensure we don't duplicate on UI side either if events fire twice
      if(!newTasks.find(t => t.task === e.detail.task)) {
        newTasks.push(e.detail);
      }
      setTasks([...newTasks].filter((v,i,a)=>a.findIndex(t=>(t.task === v.task))===i));
    };
    
    window.addEventListener("taskAdded", handleTaskAdded);
    return () => window.removeEventListener("taskAdded", handleTaskAdded);
  }, []);

  // Dynamic calendar math
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const monthName = now.toLocaleString("default", { month: "long" });

  const getDayInfo = (dayNum) => {
    // Distribute list items evenly into upcoming days starting tomorrow to make the grid look active!
    const isToday = dayNum === today;
    const taskIndex = dayNum - today - 1; 
    const dayTask = (taskIndex >= 0 && taskIndex < tasks.length) ? tasks[taskIndex] : null;
    return { isToday, dayTask };
  };

  return (
    <div className="glass-container" style={{ padding: 25, maxWidth: 600, margin: '20px auto' }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: "28px", textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>📅 {monthName} {year}</h2>
        <p style={{ fontStyle: "italic", opacity: 0.8, margin: "5px 0" }}>Voice-Synced Schedule</p>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        gap: "8px", 
        textAlign: "center" 
      }}>
        {/* Days of Week Header */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} style={{ fontWeight: "bold", opacity: 0.7, paddingBottom: 10 }}>{d}</div>
        ))}
        
        {/* Empty cells for first week alignment */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} style={{ padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 10, minHeight: 60 }} />
        ))}

        {/* Actual Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const { isToday, dayTask } = getDayInfo(dayNum);
          
          return (
            <div key={dayNum} style={{
              padding: "5px",
              background: isToday ? "rgba(0, 200, 255, 0.3)" : "rgba(0,0,0,0.3)",
              border: isToday ? "2px solid #00c8ff" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              minHeight: 70,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: isToday ? "0 0 15px rgba(0, 200, 255, 0.4)" : "none",
              transition: "transform 0.2s"
            }}>
              <span style={{ 
                fontWeight: "bold", 
                backgroundColor: isToday ? "#00c8ff" : "transparent",
                color: isToday ? "#000" : "#fff",
                borderRadius: "50%",
                width: 24, height: 24,
                display: "inline-flex", justifyContent: "center", alignItems: "center"
              }}>
                {dayNum}
              </span>
              
              {dayTask && (
                <div style={{ 
                  marginTop: 5, fontSize: "10px", 
                  backgroundColor: "rgba(255,0,85,0.6)", 
                  padding: "3px 5px", borderRadius: 4, width: "90%",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }} title={dayTask.task}>
                  {dayTask.task}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Footer Legend */}
      <div style={{ marginTop: 20, textAlign: "center", fontSize: "12px", opacity: 0.7 }}>
        {tasks.length === 0 ? "You have absolutely no plans. Say 'Remind me to...' to add some." : `Tracking ${tasks.length} active tasks.`}
      </div>
    </div>
  );
}

export default Calendar;
