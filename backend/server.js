import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import express from "express"
import { WebSocketServer } from "ws";
import cors from "cors"
import { userRouter } from "./routes/userRoutes.js";
import { predictRouter } from "./routes/predictRoutes.js";
import { fieldReportRouter } from "./routes/fieldReportRoutes.js";
import http from "http"
import { wsMessage } from "./ws/wsMessage.js";

const PORT = process.env.PORT || 3000;

dotenv.config();
connectDB();

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

app.use(cors({  
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, UptimeRobot)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json());
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/", userRouter);
app.use("/predict", predictRouter);
app.use("/field-reports", fieldReportRouter);

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
export const clients = new Map();

wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.on('error', console.error);

  ws.on("message", async (message) => {
    const msg = JSON.parse(message)

    if (msg.type == "Register") {
      console.log("triggeredddddddd", msg.userId);  
      ws.userId = msg.userId;
      ws.userType = msg.userType;
      clients.set(msg.userId, ws);
      console.log(`User ${msg.userId} (${msg.userType}) registered`);
      ws.send(JSON.stringify({
          type: 'authenticated',
          success: true
        }));
    } else if(msg.type == "Message"){
      await wsMessage(msg);
    }
  });
});


server.listen(PORT, () => console.log(`http and ws Server running on ${PORT}`))
