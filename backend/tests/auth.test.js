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
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
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
        const existingUser = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            phone: '0987654321',
            password: 'password123'
        };

        const res = await request(app)
            .post('/auth/register')
            .send(existingUser);
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Email already in use.');
    });

    test('POST /auth/login should return a token and user details for valid credentials', async () => {
        const user = new User({
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            phone: '1234567890',
            password: await bcrypt.hash('password123', 12)
        });
        await user.save();

        const loginDetails = {
            email: 'johndoe@example.com',
            password: 'password123'
        };

        const res = await request(app)
            .post('/auth/login')
            .send(loginDetails);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Login successful.');
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe('johndoe@example.com');
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
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            phone: '1234567890',
            password: await bcrypt.hash('password123', 12),
            emailVerified: false
        });
        await user.save();

        const loginDetails = {
            email: 'johndoe@example.com',
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
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
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
