const nodemailer = require('nodemailer');

exports.sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD  // Ensure this is an App Password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Email Verification',
        text: `Click the link to verify your email: ${process.env.BASE_URL}/auth/verify-email?token=${token}`
    };

    try {
        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email sending failed.');
    }
};
