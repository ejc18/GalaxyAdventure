import React, { useState, useEffect } from "react";

const GAME_WIDTH = 400; // Game area width in pixels
const GAME_HEIGHT = 600; // Game area height in pixels
const OBSTACLE_TYPES = {
  ASTEROID: "asteroid",
  STAR: "star",
  ALIEN: "alien",
} as const;

interface Obstacle {
  x: number; // Horizontal position (percentage)
  y: number; // Vertical position (percentage)
  type: (typeof OBSTACLE_TYPES)[keyof typeof OBSTACLE_TYPES]; // Asteroid, Star or Alien
}

const Spaceship: React.FC<{ position: number }> = ({ position }) => (
  <div
    style={{
      position: "absolute",
      bottom: "10px",
      left: `${position}%`,
      transform: "translateX(-50%)",
    }}
  >
    <img
      src="https://www.animatedimages.org/data/media/604/animated-spaceship-image-0026.gif"
      alt="Spaceship"
      style={{ width: "80px", height: "80px" }}
    />
  </div>
);

const Obstacle: React.FC<Obstacle> = ({ x, y, type }) => (
  <div
    style={{
      position: "absolute",
      top: `${y}%`,
      left: `${x}%`,
      fontSize: "30px",
    }}
  >
    {type === OBSTACLE_TYPES.ASTEROID ? (
      <img
        src="https://www.animatedimages.org/data/media/90/animated-fire-image-0084.gif"
        alt="Asteroid"
        style={{ width: "60px", height: "60px" }}
      />
    ) : type === OBSTACLE_TYPES.ALIEN ? (
      <img
        src="https://media.giphy.com/media/OxXV5zdVOPRx6/giphy.gif?cid=ecf05e47xkbo4yyzi2q3t35m8sri7i0si302ngo7aaalfbnb&ep=v1_stickers_search&rid=giphy.gif&ct=s"
        alt="Alien"
        style={{ width: "70px", height: "70px" }}
      />
    ) : (
      <img
        // Updated the GIF for the star obstacle type
        src="https://www.animatedimages.org/data/media/280/animated-star-image-0009.gif"
        alt="Star"
        style={{ width: "40px", height: "40px" }}
      />
    )}
  </div>
);

const App: React.FC = () => {
  const [spaceshipPosition, setSpaceshipPosition] = useState(50); // Spaceship horizontal position (percentage)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTurbo, setIsTurbo] = useState(false);
  const [obstacleSpeed, setObstacleSpeed] = useState(2); // Starting slower
  const [speedIncrease, setSpeedIncrease] = useState(0.05); // Slow increase initially

  // Loading screen timer
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // Simulate 3-second loading
    return () => clearTimeout(timer);
  }, []);

  // Add new obstacles every second
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const newObstacle: Obstacle = {
        x: Math.random() * 100,
        y: 0,
        type:
          Math.random() > 0.7
            ? OBSTACLE_TYPES.STAR
            : Math.random() > 0.5
            ? OBSTACLE_TYPES.ALIEN
            : OBSTACLE_TYPES.ASTEROID,
      };
      setObstacles((prev) => [...prev, newObstacle]);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver]);

  // Move obstacles down with gradually increasing speed
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setObstacles((prev) =>
        prev
          .map((obstacle) => ({ ...obstacle, y: obstacle.y + obstacleSpeed }))
          .filter((obstacle) => obstacle.y <= 100)
      );

      // Increase speed gradually
      setObstacleSpeed((prevSpeed) => prevSpeed + speedIncrease);
    }, 100);

    return () => clearInterval(interval);
  }, [gameOver, obstacleSpeed, speedIncrease]);

  // Check for collisions and collect stars
  useEffect(() => {
    obstacles.forEach((obstacle) => {
      if (obstacle.y >= 90 && Math.abs(obstacle.x - spaceshipPosition) < 10) {
        if (obstacle.type === OBSTACLE_TYPES.ASTEROID) {
          setGameOver(true);
        } else if (obstacle.type === OBSTACLE_TYPES.STAR) {
          setScore((prev) => prev + 10);
          activateTurboBoost();
        }
      }
    });
  }, [obstacles, spaceshipPosition]);

  // Turbo boost activation
  const activateTurboBoost = () => {
    setIsTurbo(true);
    setObstacleSpeed(10); // Increase speed of obstacles
    setTimeout(() => {
      setIsTurbo(false);
      setObstacleSpeed(5); // Reset speed after 6 seconds
    }, 6000);
  };

  // Move spaceship
  const moveSpaceship = (direction: "left" | "right") => {
    setSpaceshipPosition((prev) => {
      if (direction === "left") return Math.max(0, prev - 10);
      if (direction === "right") return Math.min(100, prev + 10);
      return prev;
    });
  };

  // Restart game
  const restartGame = () => {
    setSpaceshipPosition(50);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setIsTurbo(false);
    setObstacleSpeed(2); // Reset to starting speed
    setSpeedIncrease(0.05); // Reset speed increase
  };

  const styles = {
    container: {
      width: "100vw",
      height: "100vh",
      backgroundColor: "#000814",
      color: "white",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
    },
    gameArea: {
      position: "relative" as const,
      width: `${GAME_WIDTH}px`,
      height: `${GAME_HEIGHT}px`,
      backgroundImage: `url("https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3h2dnJ2dm1ld2M1dzZkbHR1YWVuOXpteHUyeTE2YWtiNHByOWxycyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gqfRCBneL9KsZv92eo/giphy.gif")`,
      backgroundSize: "cover",
      overflow: "hidden",
      border: "2px solid white",
      borderRadius: "10px",
    },
    button: {
      padding: "10px 20px",
      fontSize: "18px",
      backgroundColor: "#005f99",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      margin: "0 10px",
    },
    playAgainButton: {
      padding: "10px 20px",
      fontSize: "18px",
      backgroundColor: "#00ff88",
      color: "#001d3d",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <img
          src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3h2dnJ2dm1ld2M1dzZkbHR1YWVuOXpteHUyeTE2YWtiNHByOWxycyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gqfRCBneL9KsZv92eo/giphy.gif"
          alt="Loading..."
          style={{ width: "300px" }}
        />
        <h1>Loading Game...</h1>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>🚀 Galaxy Adventure 🚀 </h1>
      <h2>Score: {score}</h2>
      <h3>{isTurbo ? "Turbo Boost Active!" : ""}</h3>
      <div style={styles.gameArea}>
        <Spaceship position={spaceshipPosition} />
        {obstacles.map((obstacle, index) => (
          <Obstacle key={index} {...obstacle} />
        ))}
      </div>

      {gameOver ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h2>Game Over! Final Score: {score}</h2>
          <button onClick={restartGame} style={styles.playAgainButton}>
            Play Again
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => moveSpaceship("left")}
            style={styles.button}
            aria-label="Move spaceship left"
          >
            Move Left
          </button>
          <button
            onClick={() => moveSpaceship("right")}
            style={styles.button}
            aria-label="Move spaceship right"
          >
            Move Right
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
