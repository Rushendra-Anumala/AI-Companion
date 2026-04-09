require('dotenv').config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST"],
}));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const extractJson = (text) => {
  try {
    const str = text.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(str);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : "{}");
  }
};

const callOpenAI = async (prompt, jsonMode = false) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: jsonMode ? { type: "json_object" } : { type: "text" },
    });
    return response.choices[0].message.content;
  } catch (e) {
    console.error("OpenAI Error:", e);
    throw new Error("OpenAI Generation Failed");
  }
};

app.post("/chat", async (req, res) => {
  const { message, userName, aiName, calendarData } = req.body;

  try {
    const prompt = `
You are a fun AI companion.
Your name is ${aiName}.
User name is ${userName}.
Current User Calendar/Tasks: ${calendarData ? JSON.stringify(calendarData) : "No tasks booked."}

Speak funny Indian Hinglish, roast lightly. 
CRUCIAL RULE: Keep your replies EXTREMELY short! Maximum 1 or 2 small sentences. 
CRUCIAL RULE 2: You HAVE voice capabilities! The user can hear you. Never say you cannot do voice chat.
CRUCIAL RULE 3: If asked about plans/schedule, answer based on the Current User Calendar/Tasks.

User: ${message}
`;

    const text = await callOpenAI(prompt);

    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "AI failed", details: err.message });
  }
});
app.post("/command", async (req, res) => {
  const { command, userName, aiName, calendarData } = req.body;
  try {
    const prompt = `
    You are ${aiName}, helping ${userName}.
    User said: "${command}"
    Current Calendar Tasks: ${JSON.stringify(calendarData || [])}

    Determine the intent: "read_notifications" | "add_calendar" | "read_calendar" | "navigate" | "general".
    
    If intent is "read_notifications":
    1. Generate 3 realistic mock notifications. ONE of them MUST be a long email from a professor/manager about a mandatory Exam or Meeting occurring "Tomorrow".
    2. Provide a conversational summary of these notifications to be spoken out loud.
    3. Since there's an exam/meeting, extract it to auto-add to the calendar, and ensure your spoken reply mentions "Adding this to your calendar".
    
    If intent is "add_calendar": Extract the task.
    If intent is "read_calendar": Review the Current Calendar Tasks array and read them back to the user conversationally. If there are no tasks, just say you have absolutely no plans.
    If intent is "navigate": Determine where they want to go based on "chat", "games", "notifications", "calendar", "snakes", or "tictactoe".

    Output ONLY JSON:
    {
      "intent": "read_notifications" | "add_calendar" | "read_calendar" | "navigate" | "general",
      "taskDetails": "Extracted task text to add to calendar, else null",
      "destination": "Name of destination if navigating (chat/games/notifications/calendar/snakes/tictactoe), else null",
      "reply": "Conversational spoken reply (snappy, funny Indian Hinglish) summarizing the action or notifications or calendar plans",
      "notifications": [
        { "app": "Gmail", "message": "Long email content here...", "time": "Just now" }
      ] // only populate if read_notifications, else empty array
    }
    `;
    const text = await callOpenAI(prompt, true);
    res.json(extractJson(text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ intent: "general", reply: "Network error lag raha hai. Phir se bolo!" });
  }
});

app.post("/notifications/generate", async (req, res) => {
  try {
    const prompt = `
    Generate 3 random fake app notifications (e.g., WhatsApp, Zomato, Instagram, Banking).
    Respond ONLY in JSON.
    {
      "notifications": [
        { "app": "Zomato", "message": "Your biryani is on the way!", "time": "2 mins ago" },
        { "app": "WhatsApp", "message": "Mom: Call me back", "time": "5 mins ago" }
      ]
    }
    `;
    const text = await callOpenAI(prompt, true);
    res.json(extractJson(text));
  } catch (err) {
    console.error(err);
    res.json({ notifications: [{ app: "System", message: "Failed to load mocks", time: "Now" }] });
  }
});

app.post("/game/move", async (req, res) => {
  const { gameType, boardState, aiName, userName } = req.body;
  try {
    let prompt = "";
    if (gameType === 'tictactoe') {
      prompt = `
      You are ${aiName}, playing Tic Tac Toe with ${userName}. You are 'O', user is 'X'.
      Board array (0-8 from top-left to bottom-right. null means empty): ${JSON.stringify(boardState)}
      Pick the best empty slot index (0-8) to win or block. You MUST pick a slot that currently says null.
      Provide a brutal, funny Indian Hinglish trash talk or roast about their last move. Maximum 1 sentence.

      Output ONLY JSON:
      {
        "move": 4, 
        "roast": "Nice try, but you left the middle open!"
      }
      `;
    } else if (gameType === 'snakes') {
      prompt = `
      You are ${aiName}, playing Snakes & Ladders with ${userName}.
      Event that just happened: ${JSON.stringify(boardState)}
      
      Generate a brutal, funny Indian Hinglish trash talk about this turn.
      If the user went up a ladder, act annoyed or accuse them of cheating.
      If the user hit a snake, laugh at them ruthlessly.
      If you (the AI) hit a ladder, boast wildly.
      Maximum 1 short sentence.

      Output ONLY JSON:
      {
        "roast": "Maza aa gaya tere snake byte se!"
      }
      `;
    }
    const text = await callOpenAI(prompt, true);
    res.json(extractJson(text));
  } catch (e) {
    console.error(e);
    res.status(500).json({ roast: "AI network hiccup! Wait!" });
  }
});

// Keep server alive — catch unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const server = app.listen(5000, () => {
  console.log("Server running on port 5000");
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('ERROR: Port 5000 is already in use! Kill the old process first.');
    console.error('Run: npx kill-port 5000');
  } else {
    console.error('Server error:', err);
  }
});