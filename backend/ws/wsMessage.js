import User from "../models/UserModel.js";
import { clients } from "../server.js";

export const wsMessage = async (message) => {
    switch (message.userType) {
        case "User":
            const officials = await User.find({
                userType: "Official"
            })
            officials.forEach((u) => {
                const officialWs = clients.get(u._id.toString());
                if (officialWs && officialWs.readyState === 1) {
                    try {
                        officialWs.send(JSON.stringify({
                            from: message.userId,
                            content: message.content,
                        }));
                    } catch (error) {
                        console.error(`Failed to send to official ${u._id}:`, error);
                    }
                }
            });
            break;
        case "Official":
            const admins = await User.find({
                userType: "Admin"
            })
            console.log(message)
            admins.forEach((u) => {
                const adminWs = clients.get(u._id.toString())
                if (adminWs && adminWs.readyState === 1) {
                    try {
                        adminWs.send(JSON.stringify({
                            from: message.userId,
                            content: message.content,
                            isAuthenticated: message.isAuthenticated
                        }))
                    } catch (error) {
                        console.error(`Failed to send to admin ${u._id}:`, error);
                    }
                }

            })
            break;
        case "Admin":
            const users = await User.find({
                userType: "User"
            })
            users.forEach((u) => {
                const usersWs = clients.get(u._id.toString())
                if (usersWs && usersWs.readyState === 1) {
                    try {
                        usersWs.send(JSON.stringify({
                            from: message.userId,
                            content: message.content,
                        }))
                    } catch (error) {
                        console.error(`Failed to send to users ${u._id}:`, error);
                    }
                }

            })
            break;
    }
}