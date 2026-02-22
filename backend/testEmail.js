//Backend/testEmail.js:
import dotenv from 'dotenv';
import { sendEmail, sendAlertEmails } from './utils/emailService.js';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

dotenv.config();

const testBroadcast = async () => {
    console.log("--- Testing Broadcast Email Logic ---");
    
    // Connect to DB to fetch real users
    await connectDB();

    const mockBroadcastData = {
        message: "This is a TEST BROADCAST from the new email system.",
        disasterType: "flood",
        location: "Test Region"
    };

    console.log("Triggering sendAlertEmails with mock data...");
    await sendAlertEmails(mockBroadcastData);
    
    console.log("Test execution finished. Check terminal for 'Email sent successfully' logs.");
    mongoose.connection.close();
};

testBroadcast();