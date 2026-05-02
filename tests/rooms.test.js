const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app, mongod, authToken;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test_secret_key';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(process.env.MONGO_URI);

  app = express();
  app.use(express.json());
  const authRoutes = require('../src/routes/auth');
  const roomRoutes = require('../src/routes/rooms');
  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);

  // Register and login to get a token
  await request(app).post('/api/auth/register').send({
    name: 'Room Tester',
    email: 'roomtest@speakspace.com',
    password: 'TestPass123!'
  });
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'roomtest@speakspace.com',
    password: 'TestPass123!'
  });
  authToken = loginRes.body.token;
});

afterEach(async () => {
  // Only clear rooms, keep the user
  if (mongoose.connection.collections['rooms']) {
    await mongoose.connection.collections['rooms'].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

describe('Rooms API', () => {
  describe('POST /api/rooms/create', () => {
    it('should create a new room when authenticated', async () => {
      const res = await request(app)
        .post('/api/rooms/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Discussion Room',
          topic: 'Technology',
          maxParticipants: 5
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('code');
      expect(res.body.title).toBe('Test Discussion Room');
    });

    it('should reject room creation without authentication', async () => {
      const res = await request(app)
        .post('/api/rooms/create')
        .send({ title: 'Unauthorized Room' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/rooms', () => {
    it('should return list of public rooms', async () => {
      const res = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
