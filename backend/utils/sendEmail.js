const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // If SMTP not configured, log instead
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.log('📧 Email (simulated):', {
                to: options.to,
                subject: options.subject,
            });
            console.log('   Body:', options.text || options.html?.substring(0, 100));
            return true;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"CampusPass" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${options.to}`);
        return true;
    } catch (error) {
        console.error('❌ Email failed:', error.message);
        return false;
    }
};

module.exports = sendEmail;
