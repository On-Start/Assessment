const crypto = require('crypto');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('../utils/emailSender');
const { generateToken } = require('../utils/jwtHelper');

exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const newUser = new User({
            firstName, lastName, email, phone, password, verificationToken
        });

        // Only send the verification email if the user does not exist
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
        }
        
        await newUser.save();
        res.status(201).json({ message: 'User registered. Please check your email for verification link.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        if (!user.emailVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user);
        res.status(200).json({ message: 'Login successful.', token, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid token.' });
        }

        user.emailVerified = true;
        user.verificationToken = null;
        await user.save();
        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
