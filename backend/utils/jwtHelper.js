const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const token = jwt.sign(
        { 
            firstName: user.firstName, 
            lastName: user.lastName,
            email: user.email,
            emailVerified: user.emailVerified
        }, // Payload
        process.env.JWT_SECRET, // Secret key from .env
        { expiresIn: '1h' } // Expiry time for the token (1 hour)
    );
    return token;
};

module.exports = { generateToken };
