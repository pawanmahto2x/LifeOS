import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../src/utils/jwt';
import { UnauthorizedError } from '../src/utils/errors';
import { z } from 'zod';
import { validateRequest } from '../src/middleware/validate';
import { Request, Response } from 'express';

describe('Phase 1 - Backend Foundation Verification Suite', () => {
  it('should sign and verify access token correctly', () => {
    const payload = { userId: 'usr_123', email: 'test@lifeos.local', role: 'user' };
    const token = generateAccessToken(payload);
    assert.ok(token);
    assert.strictEqual(typeof token, 'string');

    const decoded = verifyAccessToken(token);
    assert.strictEqual(decoded.userId, payload.userId);
    assert.strictEqual(decoded.email, payload.email);
    assert.strictEqual(decoded.role, payload.role);
  });

  it('should sign and verify refresh token correctly', () => {
    const payload = { userId: 'usr_456', email: 'refresh@lifeos.local' };
    const token = generateRefreshToken(payload);
    assert.ok(token);

    const decoded = verifyRefreshToken(token);
    assert.strictEqual(decoded.userId, payload.userId);
    assert.strictEqual(decoded.email, payload.email);
  });

  it('should reject invalid or tampered access token', () => {
    assert.throws(() => {
      verifyAccessToken('invalid.jwt.token');
    }, UnauthorizedError);
  });

  it('should validate request payloads using Zod schema', () => {
    const schema = {
      body: z.object({
        name: z.string().min(3),
        priority: z.enum(['low', 'medium', 'high']),
      }),
    };

    const middleware = validateRequest(schema);
    const mockReq = {
      body: { name: 'Focus Task', priority: 'high' },
    } as unknown as Request;
    let nextCalled = false;
    let errorPassed: unknown = null;

    middleware(mockReq, {} as Response, (err?: unknown) => {
      nextCalled = true;
      errorPassed = err;
    });

    assert.ok(nextCalled);
    assert.strictEqual(errorPassed, undefined);
  });

  it('should pass ZodError to next() on invalid payload', () => {
    const schema = {
      body: z.object({
        name: z.string().min(3),
      }),
    };

    const middleware = validateRequest(schema);
    const mockReq = {
      body: { name: 'a' }, // too short
    } as unknown as Request;
    let errorPassed: unknown = null;

    middleware(mockReq, {} as Response, (err?: unknown) => {
      errorPassed = err;
    });

    assert.ok(errorPassed instanceof z.ZodError);
  });
});
