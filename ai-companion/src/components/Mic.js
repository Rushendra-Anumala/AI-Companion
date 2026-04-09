import React, { useState } from "react";
import axios from "axios";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function Mic({ userName, aiName, setView }) {
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setListening(true);
    };
    
    recognition.onspeechend = () => {
      recognition.stop();
      setListening(false);
    };
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice Transcript: ", transcript);
      
      // Stop recognition before starting synthesis to prevent echoes/bugs sometimes
      recognition.stop();
      
      try {
        const response = await axios.post("http://localhost:5000/command", {
          command: transcript,
          userName,
          aiName,
          calendarData: JSON.parse(localStorage.getItem("calendarTasks") || "[]")
        });
        
        const data = response.data;
        
        if (data.intent === 'read_notifications') {
          if (data.notifications && data.notifications.length > 0) {
            localStorage.setItem("mockNotifications", JSON.stringify(data.notifications));
            window.dispatchEvent(new Event("notificationsUpdated"));
          }

          // Automatically extract and append tasks (like exams/meetings) found during notification reading
          if (data.taskDetails) {
            let currentTasks = JSON.parse(localStorage.getItem("calendarTasks") || "[]");
            if (!currentTasks.find(t => t.task === data.taskDetails)) {
              const newTask = { task: data.taskDetails, time: new Date().toLocaleTimeString() };
              currentTasks.push(newTask);
              localStorage.setItem("calendarTasks", JSON.stringify(currentTasks));
              window.dispatchEvent(new CustomEvent("taskAdded", { detail: newTask }));
            }
          }

          speak(data.reply);
        } else if (data.intent === 'add_calendar') {
          let currentTasks = JSON.parse(localStorage.getItem("calendarTasks") || "[]");
          if (!currentTasks.find(t => t.task === data.taskDetails)) {
            const newTask = { task: data.taskDetails, time: new Date().toLocaleTimeString() };
            currentTasks.push(newTask);
            localStorage.setItem("calendarTasks", JSON.stringify(currentTasks));
            window.dispatchEvent(new CustomEvent("taskAdded", { detail: newTask }));
          }
          speak(data.reply);
        } else if (data.intent === 'navigate') {
          if (data.destination) {
            setView(data.destination.toLowerCase());
          }
          speak(data.reply);
        } else {
          // General conversation via mic
          speak(data.reply);
        }
        
      } catch (err) {
        console.error(err);
        speak("Bhai AI thoda confuse ho gaya 😅 try again");
      }
    };
    
    recognition.onerror = () => {
      setListening(false);
    };
    
    recognition.start();
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    // Cancel any ongoing speech
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
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = (e) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div>
      {isSpeaking && (
        <div 
          style={{ position: 'fixed', bottom: '100px', right: '20px', backgroundColor: '#333', color: 'white', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
          onClick={stopSpeaking}
        >
          🛑 Stop Talking
        </div>
      )}
      <div className={listening ? "mic-listening" : ""} style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      backgroundColor: '#007BFF', // fallback, overridden by CSS if listening
      color: 'white',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '24px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      zIndex: 1000
    }} onClick={startListening}>
      🎙️
      </div>
    </div>
  );
}

export default Mic;
