import React, { useState } from "react";
import axios from "axios";

function TicTacToe({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [roast, setRoast] = useState("Your move, human.");
  const [loading, setLoading] = useState(false);

  const checkWinner = (squares) => {
    const lines = [ [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6] ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
  };

  const handleClick = async (index) => {
    if (board[index] || checkWinner(board) || loading) return;
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    if (checkWinner(newBoard) || !newBoard.includes(null)) return;

    setLoading(true);
    setRoast("Thinking...");
    try {
      const response = await axios.post("http://localhost:5000/game/move", {
        gameType: 'tictactoe',
        boardState: newBoard,
        aiName: localStorage.getItem("aiName") || "AI",
        userName: localStorage.getItem("userName") || "User"
      });
      const aiMove = response.data.move;
      const aiRoast = response.data.roast;

      if (aiMove !== null && aiMove !== undefined) {
        newBoard[aiMove] = 'O';
        setBoard([...newBoard]);
      }
      setRoast(aiRoast || "Done.");
    } catch (err) {
      console.error(err);
      setRoast("I glitched. You got lucky.");
    }
    setLoading(false);
  };

  const winner = checkWinner(board);

  return (
    <div className="glass-container" style={{ padding: 30, textAlign: 'center', marginTop: '20px' }}>
      <button className="btn-gradient" onClick={onBack} style={{ marginBottom: 20 }}>⬅️ Back to Games</button>
      <h2>Tic Tac Toe</h2>
      
      <div className="glass-container" style={{ padding: 15, marginBottom: 15, maxWidth: 350, margin: '0 auto 20px auto' }}>
        <p style={{ margin: 0, fontStyle: 'italic', fontWeight: 'bold' }}>🗣️ "{roast}"</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: 5, justifyContent: 'center', marginTop: 20 }}>
        {board.map((cell, i) => (
          <div 
            key={i} 
            onClick={() => handleClick(i)}
            style={{ width: 100, height: 100, fontSize: 40, border: '1px solid rgba(255,255,255,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.1)', color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}
          >
            {cell}
          </div>
        ))}
      </div>
      
      {winner && <h3 style={{ marginTop: 20 }}>Winner: {winner}</h3>}
      {(!winner && !board.includes(null)) && <h3 style={{ marginTop: 20 }}>Draw!</h3>}
      
      <button onClick={() => { setBoard(Array(9).fill(null)); setRoast("Ready to lose?"); }} style={{ marginTop: 20, padding: 10 }}>Restart</button>
    </div>
  );
}

export default TicTacToe;
