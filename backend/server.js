import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import express from "express"
import { WebSocketServer } from "ws";
import cors from "cors"
import { userRouter } from "./routes/userRoutes.js";
import http from "http"
import { wsMessage } from "./ws/wsMessage.js";

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

const wss = new WebSocketServer({ server });
export const clients = new Map();

wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.on('error', console.error);

  ws.on("message", async (message) => {
    const msg = JSON.parse(message)

    if (msg.type == "Register") {
      ws.userId = msg.userId;
      ws.userType = msg.userType;
      clients.set(msg.userId, ws);
      console.log(`User ${msg.userId} (${msg.userType}) registered`);
      ws.send(JSON.stringify({
          type: 'authenticated',
          success: true
        }));
    }else if(msg.type == "Message"){
      await wsMessage(msg);
  }
  });
});


server.listen(PORT, () => console.log(`http and ws Server running on ${PORT}`))
