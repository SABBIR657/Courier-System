const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const parcelRoutes = require("./routes/parcel.routes");
const http = require("http")
const {Server} = require("socket.io");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
  cors:{origin: "*"},
});

// Middleware to pass `io` to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/parcels", parcelRoutes);

app.get("/", (req, res) => {
  res.send("Courier API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});