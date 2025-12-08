import { Router } from "express";
import bcrypt from "bcrypt"
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken"
import Message from "../models/MessageModel.js";

export const userRouter = Router();

userRouter.post("/signup", async (req, res)=>{
    const {username, email, password, userType} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const ExistedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if (ExistedUser) {
        return res.status(401).json({
            success: false,
            message: "User already exists"
        })
    }

    try {
        const user = await User.create({
            username,
            email,
            userType,
            password: hashedPassword
        })

        if (!user) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while registering the user"
        })
    }

    return res.status(200).json({
        success: true,
        userId: user?._id
    })
    } catch (error) {
        res.status(400).json({message: "Something went wrong while registering the user in catch", error: error})
    }
})

userRouter.post("/signin", async(req, res)=>{
    const {email, password} = req.body;

    const user = await User.findOne({
        email: email
    })
    if (!user) {
        res.status(403).json({
            message: "User not found"
        })
        return;
    }

    const isValid = await bcrypt.compare(password, user?.password);
    if (!isValid) {
        res.status(403).json({
            message: "Invalid password"
        })
        return;
    }
    const token = jwt.sign({
        userId: user._id,
        role: user.userType
    }, process.env.JWT_PASS)
    res.json({
        token,
        userId: user._id,
        userType: user.userType
    })
})

userRouter.post("/addMessage", async(req, res)=>{
    const {message} = req.body;
    const user = User.findOne({
        id: message.userId
    })
    const createdMessage = await Message.create({
        username: user?.username,
        content: message.content,
        userId: message.userId,
        receiverType: message.receiverType
    })
    if(!createdMessage){
        return res.json({
            message: "Something went wrong in message controller"
        })
    }
    return res.json({
        success: true,
        message: "Message Created"
    })
})
userRouter.get("/message", async(req,res)=>{

})