import { describe, expect, it } from 'vitest';
import { env } from '../src/config/env.js';

describe('config/env', () => {
  it('expone defaults válidos cuando no se setean variables', () => {
    expect(env.API_PREFIX).toBe('/api/v1');
    expect(env.PORT).toBeTypeOf('number');
    expect(['development', 'test', 'production']).toContain(env.NODE_ENV);
  });

  it('PORT se coacciona a número', () => {
    expect(Number.isInteger(env.PORT)).toBe(true);
  });
});
