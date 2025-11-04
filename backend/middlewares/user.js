import jwt from "jsonwebtoken"

export const userMiddleware = (req, res, next) =>{
    const header = req.headers["authorization"];
    const token = header?.split(" ")[1];

    if (!token) {
        res.status(403).json({message: "Unauthorized"})
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_PASS);
        req.userId = decoded.userId;
        next()
    } catch (error) {
        res.status(401).json({message: "Unauthorized"});
        return
    }
}