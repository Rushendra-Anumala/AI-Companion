import React, { useState } from "react";
import TicTacToe from "./TicTacToe";
import SnakeLadder from "./SnakeLadder";

function Games({ initialGame = null }) {
  const [game, setGame] = useState(initialGame);

  if (game === 'tictactoe') return <TicTacToe onBack={() => setGame(null)} />;
  if (game === 'snakes') return <SnakeLadder onBack={() => setGame(null)} />;

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>🎮 Select a Game</h2>
      <button style={{ margin: 10, padding: "15px 30px", fontSize: "18px", cursor: "pointer" }} onClick={() => setGame('tictactoe')}>Tic Tac Toe</button>
      <button style={{ margin: 10, padding: "15px 30px", fontSize: "18px", cursor: "pointer" }} onClick={() => setGame('snakes')}>🐍 Snakes & Ladders</button>
    </div>
  );
}

export default Games;
