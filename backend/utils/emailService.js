//backend/utils/emailService.js:
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import User from '../models/UserModel.js';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using SendGrid.
 * @param {string} to - Recipient email.
 * @param {string} subject - Email subject.
 * @param {string} text - Plain text content.
 * @param {string} html - HTML content.
 */
export const sendEmail = async (to, subject, text, html) => {
    const msg = {
        to,
        from: process.env.EMAIL_FROM,
        subject,
        text,
        html,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};

/**
 * Fetches all users of type "User" and sends them an alert email.
 * This function should be called WITHOUT await in the main flow.
 * @param {string} alertContent - The content of the disaster alert.
 */
export const sendAlertEmails = async (alertContent) => {
    try {
        let messageText = "";
        let locationText = "N/A";
        let typeText = "General Alert";

        if (typeof alertContent === 'object' && alertContent !== null) {
            messageText = alertContent.message || JSON.stringify(alertContent);
            locationText = alertContent.location || "N/A";
            typeText = alertContent.disasterType || "General Alert";
        } else {
            messageText = String(alertContent);
        }

        const users = await User.find({ userType: { $in: ["User", "Official"] } });
        const emailList = users.map(user => user.email).filter(email => !!email);

        if (emailList.length === 0) return;

        const subject = `⚠️ DISASTER ALERT: ${typeText.toUpperCase()} in ${locationText}`;
        const text = `IMPORTANT ALERT: ${typeText.toUpperCase()}\n\nLocation: ${locationText}\nMessage: ${messageText}\n\nPlease check the GeoAware app for more details and stay safe.`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ff4d4d; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff4d4d; border-bottom: 2px solid #ff4d4d; padding-bottom: 10px;">⚠️ EMERGENCY BROADCAST</h2>
                <div style="margin: 20px 0;">
                    <p style="font-size: 18px; color: #1a1a1a;"><strong>Type:</strong> ${typeText.toUpperCase()}</p>
                    <p style="font-size: 18px; color: #1a1a1a;"><strong>Location:</strong> ${locationText}</p>
                </div>
                <div style="background-color: #fff2f2; padding: 20px; border-left: 5px solid #ff4d4d; border-radius: 4px; margin: 20px 0;">
                    <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0;">
                        ${messageText}
                    </p>
                </div>
                <p style="font-size: 14px; color: #555;">Please open the <strong>GeoAware</strong> app immediately for real-time tracking, safety guidelines, and evacuation routes.</p>
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; color: #888; font-size: 12px; text-align: center;">
                    <p>This is an automated emergency alert sent by GeoAware System.</p>
                    <p>Stay safe.</p>
                </div>
            </div>
        `;

        // Send emails in chunks or parallel. For a college project, parallel is fine.
        const sendPromises = emailList.map(email => sendEmail(email, subject, text, html));
        await Promise.allSettled(sendPromises);
        
        console.log("Finished processing all alert emails.");
    } catch (error) {
        console.error("Error in sendAlertEmails utility:", error);
    }
};