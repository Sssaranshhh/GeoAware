import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";

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
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(403).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(403).json({ message: "Invalid password" });

    // ✅ Include username in token and response
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.userType,
        username: user.username,
      },
      process.env.JWT_PASS
    );

    res.json({
      success: true,
      token,
      userId: user._id,
      username: user.username,
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
