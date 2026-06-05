const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

jest.mock('../models/User', () => {
  const users = new Map();

  function MockUser(data) {
    Object.assign(this, data);
    if (!this._id) this._id = 'user_' + Date.now();
    if (!this.preferences) this.preferences = {};
  }

  MockUser.prototype.save = async function () {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await require('bcryptjs').hash(this.password, 4);
    }
    users.set(this.username, this);
    return this;
  };

  MockUser.prototype.comparePassword = async function (candidate) {
    return require('bcryptjs').compare(candidate, this.password);
  };

  MockUser.findOne = async ({ username }) => users.get(username) || null;
  MockUser._reset = () => users.clear();

  return MockUser;
});

const app = express();
app.use(express.json());
app.use('/api/users', require('../routes/users'));
const MockUser = require('../models/User');

beforeEach(() => MockUser._reset());

describe('POST /api/users/register', () => {
  test('registers user and returns token', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', password: 'test123' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.username).toBe('testuser');
  });

  test('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser', password: '123' });
    expect(res.statusCode).toBe(400);
  });

  test('returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser' });
    expect(res.statusCode).toBe(400);
  });

  test('returns 409 for duplicate username', async () => {
    const existing = { _id: 'abc', username: 'dupuser', preferences: {} };
    MockUser.findOne = async ({ username }) => username === 'dupuser' ? existing : null;
    const res = await request(app)
      .post('/api/users/register')
      .send({ username: 'dupuser', password: 'test456' });
    expect(res.statusCode).toBe(409);
  });
});

describe('POST /api/users/login', () => {
  beforeEach(async () => {
    const hashed = await bcrypt.hash('login123', 4);
    const user = {
      _id: 'user1', username: 'loginuser', password: hashed, preferences: {},
      comparePassword: async (c) => bcrypt.compare(c, hashed)
    };
    MockUser.findOne = async ({ username }) => username === 'loginuser' ? user : null;
  });

  test('returns 200 and token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'loginuser', password: 'login123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'loginuser', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });

  test('returns 401 for unknown user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'nobody', password: 'test123' });
    expect(res.statusCode).toBe(401);
  });

  test('returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'loginuser' });
    expect(res.statusCode).toBe(400);
  });
});
