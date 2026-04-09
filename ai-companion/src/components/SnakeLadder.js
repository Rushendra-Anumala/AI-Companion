import React, { useState } from "react";
import axios from "axios";

const SNAKES = { 16: 6, 46: 25, 49: 11, 62: 19, 64: 60, 74: 53, 89: 68, 92: 88, 95: 75, 99: 80 };
const LADDERS = { 2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98, 87: 94 };

// Dice Faces
const DICE_FACES = ["❓","⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const generateBoard = () => {
  const board = [];
  let currentNum = 100;
  for (let row = 0; row < 10; row++) {
    const rowArr = [];
    for (let col = 0; col < 10; col++) {
      rowArr.push(currentNum);
      if (col < 9) currentNum += (row % 2 === 0 ? -1 : 1);
    }
    board.push(rowArr);
    currentNum -= 10;
  }
  return board;
};

// Web Audio API for simple instant sounds (no mp3 needed!)
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'roll') {
      // Synthesize rapid plastic clattering
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400 + Math.random() * 800, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.5, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.05);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.05);
      }
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'step') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'snake') {
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'ladder') {
      osc.type = 'square'; osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    }
  } catch(e) {} // Ignore if browser blocks auto-play
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const speakRoast = (text) => {
  try {
    const synth = window.speechSynthesis;
    synth.cancel(); // Stop talking
    const ut = new SpeechSynthesisUtterance(text);
    
    // Consistent Voice Selection (Prioritize Google Hindi, then hi-IN, then en-IN)
    let voices = synth.getVoices();
    let hiVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('hi')) ||
                  voices.find(v => v.lang === 'hi-IN') ||
                  voices.find(v => v.lang === 'en-IN') ||
                  voices.find(v => v.lang.includes('hi'));
    
    if (hiVoice) ut.voice = hiVoice;
    
    ut.rate = 0.9; // Slighly slower for better comic timing
    synth.speak(ut);
  } catch(e) {}
};

function SnakeLadder({ onBack }) {
  const [board] = useState(generateBoard());
  const [userPos, setUserPos] = useState(1);
  const [aiPos, setAiPos] = useState(1);
  const [roast, setRoast] = useState("Roll the dice if you dare.");
  const [loading, setLoading] = useState(false);
  const [userDice, setUserDice] = useState({ value: 0, rolling: false });
  const [aiDice, setAiDice] = useState({ value: 0, rolling: false });

  const rollDice = () => Math.floor(Math.random() * 6) + 1;

  const handleRoast = (text) => {
    setRoast(text);
    speakRoast(text);
  };

  // Move a player exactly 1 step at a time for animation
  const animateMove = async (start, roll, setter) => {
    let current = start;
    if (current + roll > 100) return start; // Invalid, wait next turn
    
    for (let i = 0; i < roll; i++) {
      current++;
      setter(current);
      playSound('step');
      await delay(250); // 250ms per step smooth movement
    }
    
    // Check Snakes and Ladders
    let event = null;
    if (SNAKES[current]) {
      await delay(400);
      playSound('snake');
      current = SNAKES[current];
      setter(current);
      event = 'snake';
    } else if (LADDERS[current]) {
      await delay(400);
      playSound('ladder');
      current = LADDERS[current];
      setter(current);
      event = 'ladder';
    }
    return { pos: current, event };
  };

  const rollDiceAnim = async (setDiceState, finalRoll) => {
    setDiceState(prev => ({ ...prev, rolling: true }));
    playSound('roll');
    for (let i = 0; i < 8; i++) {
        setDiceState({ value: Math.floor(Math.random() * 6) + 1, rolling: true });
        await delay(60);
    }
    setDiceState({ value: finalRoll, rolling: false });
  };

  const handleTurn = async () => {
    if (loading || userPos === 100 || aiPos === 100) return;
    setLoading(true);

    // 1. User Turn
    const uRoll = rollDice();
    await rollDiceAnim(setUserDice, uRoll);
    const uResult = await animateMove(userPos, uRoll, setUserPos);
    if (uResult === userPos) { handleRoast("Need exact roll to hit 100!"); await delay(1000); }
    if (uResult.pos === 100) { handleRoast("YOU WON! Impossible! You must have cheated!"); setLoading(false); return; }

    await delay(300);

    // 2. AI Turn
    const aRoll = rollDice();
    await rollDiceAnim(setAiDice, aRoll);
    const aResult = await animateMove(aiPos, aRoll, setAiPos);
    if (aResult.pos === 100) { handleRoast("I WIN! AI always crushes humans!"); setLoading(false); return; }

    // 3. QUOTA SAVER: Only use the AI backend if something interesting happened (Snake or Ladder)
    if (uResult.event || aResult.event) {
      setRoast("Cooking up a roast...");
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/game/move`, {
          gameType: 'snakes',
          boardState: { 
            userRoll: uRoll, aiRoll: aRoll, 
            userPos: uResult.pos, aiPos: aResult.pos, 
            userEvent: uResult.event, aiEvent: aResult.event 
          },
          aiName: localStorage.getItem("aiName") || "AI",
          userName: localStorage.getItem("userName") || "User"
        });
        handleRoast(response.data.roast || "Speechless, but I still dominate.");
      } catch (e) {
        handleRoast("Network error, but I am still better than you.");
      }
    } else {
      // Offline fallback bank for boring moves to save tokens!
      const offlineRoasts = [
        "Ekdum normal move yaar. Dhyan se, gir mat jana.",
        "Aise dheere chalega toh kal tak pahunchega! Snake aane de bas.",
        `Mera roll dekh, ${aRoll} aaya hai. Bach ke rehna beta.`,
        "Yeh game toh naseeb ka hai, aur mera naseeb tere se bahut tight hai.",
        "Dice ko ghoorna band kar aur chal, human."
      ];
      handleRoast(offlineRoasts[Math.floor(Math.random() * offlineRoasts.length)]);
    }

    setLoading(false);
  };

  const restart = () => { setUserPos(1); setAiPos(1); setUserDice({value:0, rolling:false}); setAiDice({value:0, rolling:false}); handleRoast("Try not to hit a snake immediately."); };

  const diceStyle = (isRolling) => ({
    background: 'rgba(0,0,0,0.6)', 
    padding: 10, 
    borderRadius: 15, 
    fontSize: 40, 
    minWidth: 60,
    transition: 'transform 0.1s',
    transform: isRolling ? `rotate(${Math.random() * 40 - 20}deg) scale(1.1)` : 'rotate(0deg) scale(1)',
    boxShadow: isRolling ? '0px 0px 10px rgba(255,255,255,0.5)' : 'none'
  });

  return (
    <div className="glass-container" style={{ padding: 10, textAlign: 'center', marginTop: '5px', maxWidth: 450, margin: '5px auto' }}>
      
      {/* Top Navigation & Controls Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px', marginBottom: 10 }}>
        <button className="btn-gradient" onClick={onBack} style={{ padding: '8px 15px', fontSize: '14px' }}>⬅️ Back</button>
        <button className="btn-gradient" onClick={handleTurn} disabled={loading || userPos === 100 || aiPos === 100} style={{ padding: '8px 25px', fontSize: '18px', flex: 1 }}>
          🎲 Roll Dice
        </button>
        <button className="btn-gradient" onClick={restart} style={{ padding: '8px 15px', fontSize: '14px', background: 'linear-gradient(135deg, #ff0055, #ffb3b3)' }}>🔄</button>
      </div>
      
      {/* Chat / Dice Feedback Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', marginBottom: 10, gap: '5px' }}>
        <div style={diceStyle(userDice.rolling)}>
          {DICE_FACES[userDice.value]}
        </div>
        <div className="glass-container" style={{ padding: 10, flex: 1, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ margin: 0, fontStyle: 'italic', fontWeight: 'bold', fontSize: '0.95em' }}>🗣️ "{roast}"</p>
        </div>
        <div style={diceStyle(aiDice.rolling)}>
          {DICE_FACES[aiDice.value]}
        </div>
      </div>

      {/* Main Board Area (Scaled down to fit on screen) */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 0, 
        backgroundImage: 'url(/snakes-ladders.jpg)', backgroundSize: '100% 100%', backgroundPosition: 'center',
        borderRadius: 10, border: '2px solid rgba(255,255,255,0.2)',
        width: '100%', maxWidth: 'min(100%, 65vh)', aspectRatio: '1', margin: '0 auto', overflow: 'hidden'
      }}>
        {board.flat().map((num) => {
          const isUser = userPos === num;
          const isAi = aiPos === num;
          return (
            <div key={num} style={{
              aspectRatio: '1', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', borderRadius: 2, position: 'relative',
              transition: 'all 0.2s', minWidth: 0, minHeight: 0
            }}>
              <span style={{ position: 'absolute', top: 1, left: 1, fontSize: '9px', color: '#fff', textShadow: '0 0 3px black' }}>{num}</span>
              <div style={{ display: 'flex', gap: 1, zIndex: 5, fontSize: 'clamp(10px, 2.5vmin, 18px)' }}>
                {isUser && <span title="You" style={{ filter: 'drop-shadow(0px 0px 5px #00C9FF)' }}>🧑</span>}
                {isAi && <span title="AI" style={{ filter: 'drop-shadow(0px 0px 5px #ff0055)' }}>🤖</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SnakeLadder;
