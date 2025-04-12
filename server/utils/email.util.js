const nodemailer = require('nodemailer');

// Create a reusable transporter object using SMTP transport
// NOTE: For production, consider robust services like SendGrid, AWS SES, etc.
// Using Gmail directly has limitations and security considerations (use App Passwords or OAuth2).
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports (STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // Optional: Add proxy settings if needed
    // proxy: 'http://your-proxy-server:port'
});

/**
 * Sends an email.
 * @param {string} to Recipient email address.
 * @param {string} subject Email subject.
 * @param {string} text Plain text body.
 * @param {string} html HTML body (optional).
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"F6S Platform" <${process.env.EMAIL_USER}>`, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html || text, // html body (defaults to text if not provided)
        };

        // Send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        // Example: Email sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    } catch (error) {
        console.error('Error sending email:', error);
        // Decide if you want to throw the error or just log it
        // throw error; // Uncomment if email failure should block the calling process
    }
};

module.exports = {
    sendEmail,
};
