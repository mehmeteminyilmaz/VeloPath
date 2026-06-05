const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'velopath_super_secret_key_2026';
const makeToken = (userId, username) =>
  jwt.sign({ userId, username: username || 'testuser' }, JWT_SECRET, { expiresIn: '1d' });

// Helper: chainable query object (supports .lean().sort() and await)
const chainable = (data) => {
  const q = {
    lean: () => chainable(data),
    sort: () => chainable(data),
    then: (res, rej) => Promise.resolve(data).then(res, rej),
    catch: (rej) => Promise.resolve(data).catch(rej),
  };
  return q;
};

jest.mock('../models/Project', () => {
  const projects = new Map();
  let counter = 1;

  const chainable = (data) => ({
    lean: () => chainable(data),
    sort: () => chainable(data),
    then: (res, rej) => Promise.resolve(data).then(res, rej),
    catch: (rej) => Promise.resolve(data).catch(rej),
  });

  function MockProject(data) {
    this._id = 'proj_' + (counter++);
    this.user = data.user;
    this.sharedWith = data.sharedWith || [];
    Object.assign(this, data);
  }

  MockProject.prototype.save = async function () {
    projects.set(this._id, this);
    return this;
  };

  MockProject.find = (query) => {
    const all = [...projects.values()];
    let result = all;
    if (query && query.$or) {
      result = all.filter(p =>
        query.$or.some(cond => {
          if (cond.user) return String(p.user) === String(cond.user);
          if (cond.sharedWith) return (p.sharedWith || []).includes(String(cond.sharedWith));
          return false;
        })
      );
    }
    return chainable(result);
  };

  MockProject.findById = (id) => {
    const p = projects.get(id);
    return chainable(p ? { ...p } : null);
  };

  MockProject.findByIdAndUpdate = async (id, data) => {
    const p = projects.get(id);
    if (!p) return null;
    Object.assign(p, data);
    return p;
  };

  MockProject.findByIdAndDelete = async (id) => {
    const p = projects.get(id);
    if (p) projects.delete(id);
    return p || null;
  };

  MockProject._reset = () => { projects.clear(); counter = 1; };

  return MockProject;
});

jest.mock('../models/Task', () => {
  const chainable = (data) => ({
    lean: () => chainable(data),
    sort: () => chainable(data),
    then: (res, rej) => Promise.resolve(data).then(res, rej),
  });
  return {
    find: () => chainable([]),
    deleteMany: async () => {},
  };
});

const app = express();
app.use(express.json());
app.use('/api/projects', require('../routes/projects'));

const MockProject = require('../models/Project');
beforeEach(() => MockProject._reset());

describe('GET /api/projects/user/:userId', () => {
  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/projects/user/user1');
    expect(res.statusCode).toBe(401);
  });

  test('returns empty array with valid token', async () => {
    const res = await request(app)
      .get('/api/projects/user/user1')
      .set('Authorization', 'Bearer ' + makeToken('user1'));
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/projects', () => {
  test('creates project with valid token', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', 'Bearer ' + makeToken('user1'))
      .send({ title: 'Test Projesi', user: 'user1' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Projesi');
    expect(res.body).toHaveProperty('_id');
  });

  test('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ title: 'Test', user: 'user1' });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/projects/:id ownership check', () => {
  test('returns 403 for another users project', async () => {
    const token2 = makeToken('user2');
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', 'Bearer ' + token2)
      .send({ title: 'Other Project', user: 'user2' });

    const res = await request(app)
      .get('/api/projects/' + createRes.body._id)
      .set('Authorization', 'Bearer ' + makeToken('user1'));
    expect(res.statusCode).toBe(403);
  });

  test('returns 200 for own project', async () => {
    const token = makeToken('user1');
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'My Project', user: 'user1' });

    const res = await request(app)
      .get('/api/projects/' + createRes.body._id)
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('My Project');
  });

  test('returns 404 for non-existent project', async () => {
    const res = await request(app)
      .get('/api/projects/proj_999')
      .set('Authorization', 'Bearer ' + makeToken('user1'));
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/projects/:id', () => {
  test('owner can delete own project', async () => {
    const token = makeToken('user1');
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', 'Bearer ' + token)
      .send({ title: 'To Delete', user: 'user1' });

    const res = await request(app)
      .delete('/api/projects/' + createRes.body._id)
      .set('Authorization', 'Bearer ' + token);
    expect(res.statusCode).toBe(200);
  });
});
