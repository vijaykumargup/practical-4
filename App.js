const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors()); // Allow all CORS requests
app.use(express.static("public")); // Serve index.html and static files

// In-memory seat data
let seats = [
  { id: 1, status: "available", lockTimeout: null },
  { id: 2, status: "available", lockTimeout: null },
  { id: 3, status: "available", lockTimeout: null },
  { id: 4, status: "available", lockTimeout: null },
  { id: 5, status: "available", lockTimeout: null },
];

// API: Get all seats
app.get("/seats", (req, res) => {
  res.json(seats.map(seat => ({ id: seat.id, status: seat.status })));
});

// API: Lock a seat
app.post("/book/lock/:id", (req, res) => {
  const seatId = parseInt(req.params.id);
  const seat = seats.find(s => s.id === seatId);

  if (!seat) return res.status(404).json({ message: "Seat not found" });
  if (seat.status !== "available")
    return res.status(400).json({ message: "Seat cannot be locked. It is already " + seat.status });

  seat.status = "locked";
  seat.lockTimeout = setTimeout(() => {
    if (seat.status === "locked") seat.status = "available";
  }, 60 * 1000); // Auto-release lock after 1 min

  res.json({ message: `Seat ${seat.id} locked successfully. Confirm within 1 minute.` });
});

// API: Confirm booking
app.post("/book/confirm/:id", (req, res) => {
  const seatId = parseInt(req.params.id);
  const seat = seats.find(s => s.id === seatId);

  if (!seat) return res.status(404).json({ message: "Seat not found" });
  if (seat.status !== "locked")
    return res.status(400).json({ message: "Seat is not locked and cannot be booked" });

  seat.status = "booked";
  if (seat.lockTimeout) {
    clearTimeout(seat.lockTimeout);
    seat.lockTimeout = null;
  }

  res.json({ message: `Seat ${seat.id} is booked successfully!` });
});

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
