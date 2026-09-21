const request = require('supertest');

// Mock supabase before requiring app
jest.mock('../src/config/supabase', () => {
  return {
    from: jest.fn()
  };
});

const supabase = require('../src/config/supabase');
const app = require('../src/app');

describe('Student Management API Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health should return 200 and operational status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('operational');
    });
  });

  describe('2. Validation Middlewares', () => {
    const validStudent = {
      name: 'Alice Johnson',
      rollNumber: 'CS2026-001',
      department: 'Computer Science',
      year: 3
    };

    it('POST /api/students should reject payload with missing fields (400)', async () => {
      const res = await request(app).post('/api/students').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBe(4);
    });

    it('POST /api/students should reject year less than 1 (400)', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({ ...validStudent, year: 0 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0]).toContain('year');
    });

    it('POST /api/students should reject year greater than 4 (400)', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({ ...validStudent, year: 5 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0]).toContain('year');
    });

    it('POST /api/students should reject non-integer year (400)', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({ ...validStudent, year: 2.5 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0]).toContain('year');
    });

    it('GET /api/students/:id should reject invalid UUID parameter (400)', async () => {
      const res = await request(app).get('/api/students/invalid-uuid-123');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('valid UUID');
    });

    it('DELETE /api/students/:id should reject invalid UUID parameter (400)', async () => {
      const res = await request(app).delete('/api/students/12345');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('valid UUID');
    });
  });

  describe('3. CRUD Operations (Controller & Database mapping)', () => {
    const validId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    it('POST /api/students should create student and return 201 with mapped rollNumber', async () => {
      const dbRecord = {
        id: validId,
        name: 'Jane Doe',
        roll_number: 'IT-2024-042',
        department: 'Information Technology',
        year: 2,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z'
      };

      const chain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: dbRecord, error: null })
      };
      supabase.from.mockReturnValue(chain);

      const res = await request(app).post('/api/students').send({
        name: 'Jane Doe',
        rollNumber: 'IT-2024-042',
        department: 'Information Technology',
        year: 2
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rollNumber).toBe('IT-2024-042');
      expect(res.body.data.name).toBe('Jane Doe');
      expect(res.body.data.year).toBe(2);
      expect(chain.insert).toHaveBeenCalledWith([
        {
          name: 'Jane Doe',
          roll_number: 'IT-2024-042',
          department: 'Information Technology',
          year: 2
        }
      ]);
    });

    it('POST /api/students should return 409 Conflict if roll_number already exists', async () => {
      const chain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'duplicate key value violates unique constraint' }
        })
      };
      supabase.from.mockReturnValue(chain);

      const res = await request(app).post('/api/students').send({
        name: 'Jane Doe',
        rollNumber: 'DUPLICATE-001',
        department: 'Information Technology',
        year: 2
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('GET /api/students should return 200 and list of students', async () => {
      const dbRecords = [
        {
          id: validId,
          name: 'Bob Smith',
          roll_number: 'ME-2025-010',
          department: 'Mechanical Engineering',
          year: 4
        }
      ];

      const chain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: dbRecords, error: null })
      };
      supabase.from.mockReturnValue(chain);

      const res = await request(app).get('/api/students');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].rollNumber).toBe('ME-2025-010');
    });

    it('GET /api/students/:id should return 200 when student is found', async () => {
      const dbRecord = {
        id: validId,
        name: 'Bob Smith',
        roll_number: 'ME-2025-010',
        department: 'Mechanical Engineering',
        year: 4
      };

      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: dbRecord, error: null })
      };
      supabase.from.mockReturnValue(chain);

      const res = await request(app).get(`/api/students/${validId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(validId);
      expect(res.body.data.rollNumber).toBe('ME-2025-010');
    });

    it('GET /api/students/:id should return 404 when student does not exist', async () => {
      const chain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      supabase.from.mockReturnValue(chain);

      const res = await request(app).get(`/api/students/${validId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Student not found');
    });

    it('PUT /api/students/:id should return 200 on successful update', async () => {
      const updatedRecord = {
        id: validId,
        name: 'Bob Smith Updated',
        roll_number: 'ME-2025-010',
        department: 'Robotics',
        year: 4
      };

      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: updatedRecord, error: null })
      };
      supabase.from.mockReturnValue(chain);

      const res = await request(app).put(`/api/students/${validId}`).send({
        name: 'Bob Smith Updated',
        rollNumber: 'ME-2025-010',
        department: 'Robotics',
        year: 4
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.department).toBe('Robotics');
    });

    it('DELETE /api/students/:id should return 200 on successful deletion', async () => {
      const chain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { id: validId }, error: null })
      };
      supabase.from.mockReturnValue(chain);

      const res = await request(app).delete(`/api/students/${validId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Student deleted successfully');
    });

    it('DELETE /api/students/:id should return 404 when student to delete does not exist', async () => {
      const chain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      supabase.from.mockReturnValue(chain);

      const res = await request(app).delete(`/api/students/${validId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Student not found');
    });
  });

  describe('4. Undefined Routes (404)', () => {
    it('should return 404 JSON for undefined endpoints', async () => {
      const res = await request(app).get('/api/unknown-route');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Endpoint not found');
    });
  });
});
