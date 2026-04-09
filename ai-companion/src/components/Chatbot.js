import React, { useState } from "react";
import axios from "axios";

function Chatbot({ userName, aiName }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const speak = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Consistent Voice Selection (Prioritize Google Hindi, then hi-IN, then en-IN)
    let voices = window.speechSynthesis.getVoices();
    let hiVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('hi')) ||
                  voices.find(v => v.lang === 'hi-IN') ||
                  voices.find(v => v.lang === 'en-IN') ||
                  voices.find(v => v.lang.includes('hi'));
    if (hiVoice) utterance.voice = hiVoice;

    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const calendarData = JSON.parse(localStorage.getItem("calendarTasks") || "[]");
      const response = await axios.post("http://localhost:5000/chat", {
        message: input,
        userName,
        aiName,
        calendarData
      });

      const botReply = response.data.reply;
      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
      speak(botReply);
    } catch (error) {
      console.error(error.response?.data || error.message);
      const fallback = "Bhai AI thoda confuse ho gaya 😅 try again";
      setMessages((prev) => [...prev, { role: "bot", text: fallback }]);
      speak(fallback);
    }
  };

  return (
    <div className="glass-container" style={{ margin: '20px auto', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>{aiName} 🤖</h2>

      <div className="chat-container" style={{ flexGrow: 1, minHeight: '300px', marginBottom: 20 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role === "user" ? "bubble-user" : "bubble-bot"}`}>
            <b style={{ fontSize: '0.8em', opacity: 0.7, display: 'block', marginBottom: 5 }}>
              {msg.role === "user" ? userName : aiName}
            </b>
            {msg.text}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: "pointer", fontWeight: "bold", padding: "10px", background: voiceEnabled ? "rgba(0, 201, 255, 0.2)" : "rgba(255, 255, 255, 0.1)", borderRadius: "10px", transition: '0.3s' }}>
          <input 
            type="checkbox" 
            checked={voiceEnabled} 
            onChange={(e) => setVoiceEnabled(e.target.checked)} 
            style={{ marginRight: 10, width: '18px', height: '18px' }}
          />
          🗣️ Auto-Speak AI Replies {voiceEnabled ? "(ON)" : "(OFF)"}
        </label>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            className="input-pretty"
            style={{ margin: 0 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className="btn-gradient" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
