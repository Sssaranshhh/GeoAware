import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import Message from "../models/MessageModel.js";
import upload from "../middlewares/uploadMiddleware.js";

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  const { username, email, password, userType } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const ExistedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (ExistedUser) {
    return res.status(401).json({
      success: false,
      message: "User already exists",
    });
  }

  try {
    const user = await User.create({
      username,
      email,
      userType,
      password: hashedPassword,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Something went wrong while registering the user",
      });
    }

    return res.status(200).json({
      success: true,
      userId: user?._id,
    });
  } catch (error) {
    res.status(400).json({
      message: "Something went wrong while registering the user in catch",
      error: error,
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email,
  });
  if (!user) {
    res.status(403).json({
      message: "User not found",
    });
    return;
  }

  const isValid = await bcrypt.compare(password, user?.password);
  if (!isValid) {
    res.status(403).json({
      message: "Invalid password",
    });
    return;
  }
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.userType,
    },
    process.env.JWT_PASS,
  );
  res.json({
    token,
    userId: user._id,
    userType: user.userType,
    username: user.username,
  });
});

userRouter.post("/alert-photo", upload.single("photo"), async (req, res) => {
  try {
    const photoUrl = req.file?.path || req.file?.secure_url || null;
    return res.status(200).json({
      success: true,
      photoUrl,
    });
  } catch (error) {
    console.error("Alert photo upload failed:", error);
    return res.status(500).json({
      success: false,
      message: "Photo upload failed",
      error: error.message,
    });
  }
});

userRouter.get("/getMessages/:userType", async (req, res) => {
  const { userType } = req.params;

  try {
    const fetchedMessages = await Message.find({
      receiverType: userType,
    })
      .sort({ createdAt: -1 });

    return res.json({
      data: fetchedMessages,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});
