const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

beforeEach(async () => {
    await User.deleteMany({}); // Clean the User collection before each test
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Test the backend routes', () => {

    test('GET / should respond with "Hello World"', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('Hello World');
    });

    test('POST /auth/register should create a user', async () => {
        const newUser = {
            firstName: 'Dhruv',
            lastName: 'Gupta',
            email: 'dhruvgahoi.07@gmail.com',
            phone: '1234567890',
            password: 'password123'
        };

        const res = await request(app)
            .post('/auth/register')
            .send(newUser);
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User registered. Please check your email for verification link.');
    });

    test('POST /auth/register should return error if email is already in use', async () => {
        // Insert a user into the database
        const existingUser = {
            firstName: 'Dhruv',
            lastName: 'Gupta',
            email: 'dhruvgahoi.07@gmail.com',
            phone: '1234567890',
            password: await bcrypt.hash('password123', 12),
        };
        await new User(existingUser).save();
    
        // Attempt to register with the same email
        const newUser = {
            firstName: 'Dhruv',
            lastName: 'Gupta',
            email: 'dhruvgahoi.07@gmail.com',
            phone: '9876543210',
            password: 'password123',
        };
    
        const res = await request(app).post('/auth/register').send(newUser);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Email already in use.');
    });
    

    test('POST /auth/login should return a token and user details for valid credentials', async () => {
        // Register a new user via POST /auth/register
        const newUser = {
            firstName: 'Dhruv',
            lastName: 'Gupta',
            email: 'dhruvgahoi.07@gmail.com',
            phone: '1234567890',
            password: 'password123',  // Plain password (it will be hashed in the backend)
            emailVerified: true,
        };

        await new User(newUser).save();
    
        
        // Now attempt to login with the same credentials
        const loginDetails = {
            email: 'dhruvgahoi.07@gmail.com',
            password: 'password123',
        };
    
        const loginRes = await request(app)
            .post('/auth/login')
            .send(loginDetails);
    
        expect(loginRes.status).toBe(200); // Expect successful login
        expect(loginRes.body.message).toBe('Login successful.');
        expect(loginRes.body.token).toBeDefined();
        expect(loginRes.body.user.email).toBe('dhruvgahoi.07@gmail.com');
        expect(loginRes.body.user.firstName).toBe('Dhruv');
        expect(loginRes.body.user.lastName).toBe('Gupta');
    });

    test('POST /auth/login should return error for invalid credentials', async () => {
        const loginDetails = {
            email: 'wrongemail@example.com',
            password: 'wrongpassword'
        };

        const res = await request(app)
            .post('/auth/login')
            .send(loginDetails);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid credentials.');
    });

    test('POST /auth/login should return error if email is not verified', async () => {
        const user = new User({
            firstName: 'Dhruv',
            lastName: 'Gupta',
            email: 'dhruvgahoi.07@gmail.com',
            phone: '1234567890',
            password: await bcrypt.hash('password123', 12),
            emailVerified: false
        });
        await user.save();

        const loginDetails = {
            email: 'dhruvgahoi.07@gmail.com',
            password: 'password123'
        };

        const res = await request(app)
            .post('/auth/login')
            .send(loginDetails);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Please verify your email before logging in.');
    });

    test('GET /auth/verify-email should verify email with valid token', async () => {
        const user = new User({
            firstName: 'Dhruv',
            lastName: 'Gupta',
            email: 'dhruvgahoi.07@gmail.com',
            phone: '1234567890',
            password: await bcrypt.hash('password123', 12),
            verificationToken: 'validtoken123'
        });
        await user.save();

        const res = await request(app)
            .get('/auth/verify-email?token=validtoken123');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Email verified successfully.');
    });

    test('GET /auth/verify-email should return error for invalid token', async () => {
        const res = await request(app)
            .get('/auth/verify-email?token=invalidtoken123');
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid token.');
    });

});
