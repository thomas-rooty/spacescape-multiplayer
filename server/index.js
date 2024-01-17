import { Server } from "socket.io";
import { encode, decode } from "@msgpack/msgpack";

const io = new Server({
  cors: {
    origin: ["https://spacescape.vercel.app", "http://localhost:3000"],
  },
});

io.listen(process.env.PORT || 3001);

const astronauts = new Map(); // Using Map for O(1) access
const updateFrequency = 1; // Frequency of updates in milliseconds

const generateRandomPosition = () => {
  const x = Math.random() * (0.46 - -0.45) + -0.45;
  const y = 0.07;
  const z = Math.random() * (25.37 - 24.37) + 24.37;
  return [x, y, z];
};

const generateRandomHexColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

io.on("connection", (socket) => {
  console.log("User ID: " + socket.id + " connected");

  astronauts.set(socket.id, {
    id: socket.id,
    position: generateRandomPosition(),
    headColor: generateRandomHexColor(),
    animation: "CharacterArmature|Idle",
    lookingAt: { x: 0, y: 0, z: 31 },
  });

  // Throttle updates
  let lastUpdateTime = Date.now();
  socket.on("move", (data) => {
    const now = Date.now();
    if (now - lastUpdateTime > updateFrequency) {
      const astronaut = astronauts.get(socket.id);
      if (
        astronaut &&
        Array.isArray(data.newPosition) &&
        data.newPosition.length === 3
      ) {
        astronaut.position = data.newPosition;
        astronaut.animation = data.animation;
        astronaut.lookingAt = data.lookingAt;
        const encoded = encode(Array.from(astronauts.values()));
        io.emit("astronauts", encoded);
        lastUpdateTime = now;
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User ID: " + socket.id + " disconnected");
    astronauts.delete(socket.id);
    io.emit("astronauts", Array.from(astronauts.values()));
  });
});
