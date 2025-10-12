import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import express from "express"
import { WebSocketServer } from "ws";
import cors from "cors"
import { userRouter } from "./routes/userRoutes.js";
import http from "http"

const PORT = process.env.PORT || 3000;

dotenv.config();
connectDB();

const app = express();
app.use(cors({  
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json());
app.use("/", userRouter)

const server = http.createServer(app);

// ✅ Attach WebSocket to the same server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.on('error', console.error);

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Echo: ${message}`);
  });
});


server.listen(PORT, () => console.log(`http and ws Server running on ${PORT}`))
