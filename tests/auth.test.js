const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

// We need to require the app without starting the server
let app;
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test_secret_key';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(process.env.MONGO_URI);

  // Build a minimal express app for testing
  app = express();
  app.use(express.json());
  const authRoutes = require('../src/routes/auth');
  app.use('/api/auth', authRoutes);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@speakspace.com',
          password: 'TestPass123!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@speakspace.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should reject duplicate email registration', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'User One',
        email: 'duplicate@test.com',
        password: 'Pass123!'
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'User Two',
        email: 'duplicate@test.com',
        password: 'Pass456!'
      });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should reject short passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'short@test.com',
          password: '123'
        });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Login Test User',
        email: 'login@speakspace.com',
        password: 'ValidPass123!'
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@speakspace.com',
          password: 'ValidPass123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@speakspace.com',
          password: 'WrongPassword!'
        });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@nowhere.com',
          password: 'AnyPass123!'
        });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
});
