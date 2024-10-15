import React, { useState, useEffect, KeyboardEvent } from "react";
import Confetti from "react-confetti";
import "./CribbageBoard.css";

interface Player {
  id: number;
  name: string;
  score: number;
  gamesWon: number;
}

const CribbageBoard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [winner, setWinner] = useState<Player | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const addPlayer = () => {
    if (players.length < 6 && newPlayerName.trim()) {
      setPlayers([
        ...players,
        { id: Date.now(), name: newPlayerName.trim(), score: 0, gamesWon: 0 },
      ]);
      setNewPlayerName("");
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addPlayer();
    }
  };

  const updateScore = (id: number, increment: number) => {
    setPlayers(
      players.map((player) =>
        player.id === id
          ? {
              ...player,
              score: Math.min(Math.max(player.score + increment, 0), 121),
            }
          : player
      )
    );
  };

  const removePlayer = (id: number) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (players.length === 0) return;

    switch (event.key) {
      case "ArrowRight":
        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
        break;
      case "ArrowLeft":
        setCurrentPlayerIndex((prevIndex) =>
          prevIndex === 0 ? players.length - 1 : prevIndex - 1
        );
        break;
      case "ArrowUp":
        updateScore(players[currentPlayerIndex].id, 1);
        break;
      case "ArrowDown":
        updateScore(players[currentPlayerIndex].id, -1);
        break;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const winningPlayer = players.find((player) => player.score === 121);
    if (winningPlayer && !winner) {
      setWinner(winningPlayer);
      setShowConfetti(true);
    }
  }, [players, winner]);

  const resetGame = () => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        score: 0,
        gamesWon:
          player.id === winner?.id ? player.gamesWon + 1 : player.gamesWon,
      }))
    );
    setWinner(null);
    setCurrentPlayerIndex(0);
    setShowConfetti(false);
  };

  return (
    <div className="cribbage-board" onKeyDown={handleKeyDown} tabIndex={0}>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}
      <h2>Cribbage Board</h2>
      {winner ? (
        <div className="winner-panel">
          <h3>{winner.name} wins!</h3>
          <button onClick={resetGame}>New Game</button>
        </div>
      ) : (
        <>
          <div className="add-player">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter player name"
              maxLength={20}
            />
            <button onClick={addPlayer} disabled={players.length >= 6}>
              Add Player
            </button>
          </div>
          <div className="players">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`player ${
                  index === currentPlayerIndex ? "current-player" : ""
                }`}
                onClick={() => setCurrentPlayerIndex(index)}
              >
                <div className="player-header">
                  <h3>
                    {player.name}{" "}
                    <span title="Games Won">({player.gamesWon})</span>
                  </h3>
                  <button
                    className="remove-player"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlayer(player.id);
                    }}
                  >
                    X
                  </button>
                </div>
                <div className="score">
                  <button onClick={() => updateScore(player.id, -1)}>-</button>
                  <span>{player.score}</span>
                  <button onClick={() => updateScore(player.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
          {players.length > 0 && (
            <div className="reset-container">
              <button onClick={resetGame}>New Game</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CribbageBoard;
