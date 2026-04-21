import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRateLimitDriver } from './memory';

describe('MemoryRateLimitDriver', () => {
  let driver: MemoryRateLimitDriver;

  beforeEach(() => {
    driver = new MemoryRateLimitDriver({ driver: 'memory' });
  });

  it('allows requests within the limit', async () => {
    const result = await driver.check('user:1', 3, 60_000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.resetAt).toBeInstanceOf(Date);
  });

  it('counts down remaining correctly', async () => {
    await driver.check('user:1', 3, 60_000);
    await driver.check('user:1', 3, 60_000);
    const result = await driver.check('user:1', 3, 60_000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('blocks after exceeding the limit', async () => {
    for (let i = 0; i < 3; i++) {
      await driver.check('user:1', 3, 60_000);
    }

    const result = await driver.check('user:1', 3, 60_000);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks keys independently', async () => {
    for (let i = 0; i < 3; i++) {
      await driver.check('user:1', 3, 60_000);
    }

    const result = await driver.check('user:2', 3, 60_000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('resets after the window expires', async () => {
    // Use a tiny window so timestamps expire immediately
    await driver.check('user:1', 1, 1);

    // Wait just enough for the window to pass
    await new Promise((r) => setTimeout(r, 5));

    const result = await driver.check('user:1', 1, 1);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('reset() clears a key', async () => {
    for (let i = 0; i < 3; i++) {
      await driver.check('user:1', 3, 60_000);
    }

    await driver.reset('user:1');

    const result = await driver.check('user:1', 3, 60_000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('returns a resetAt in the future', async () => {
    const before = Date.now();
    const result = await driver.check('user:1', 3, 60_000);

    expect(result.resetAt.getTime()).toBeGreaterThanOrEqual(before + 60_000);
  });
});
