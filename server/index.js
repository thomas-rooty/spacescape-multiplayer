import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "https://spacescape.vercel.app",
  },
});

io.listen(process.env.PORT || 3000);

const astronauts = [];

const generateRandomPosition = () => {
  // I want it between ['-0.45', '0.07', '24.37'] and ['0.46', '0.07', '25.37']
  const x = Math.random() * (0.46 - -0.45) + -0.45;
  const y = 0.07;
  const z = Math.random() * (25.37 - 24.37) + 24.37;
  return [x, y, z];
};

const generateRandomHexColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

io.on("connection", (socket) => {
  console.log("a user connected");

  astronauts.push({
    id: socket.id,
    position: generateRandomPosition(),
    headColor: generateRandomHexColor(),
    isMoving: false,
  });

  io.emit("astronauts", astronauts);

  // Listen for astronaut position updates
  socket.on("move", (data) => {
    const astronaut = astronauts.find((a) => a.id === socket.id);
    if (
      astronaut &&
      Array.isArray(data.newPosition) &&
      data.newPosition.length === 3
    ) {
      astronaut.position = data.newPosition;
      astronaut.isMoving = data.isMoving;
      io.emit("astronauts", astronauts);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    // Remove astronaut from array and emit new array to all clients
    astronauts.splice(
      astronauts.findIndex((astronaut) => astronaut.id === socket.id),
      1
    );
    io.emit("astronauts", astronauts);
  });
});
