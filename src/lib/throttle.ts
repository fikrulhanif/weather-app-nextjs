/**
 * Token-bucket throttle with FIFO queue and injectable clock.
 *
 * Enforces a rate limit of `capacity` tokens refilling at `refillIntervalMs`
 * intervals. When the bucket is empty, acquisition requests are queued in
 * FIFO order up to `queueLimit` entries. Queue overflow rejects the acquire
 * with a `rate_limited` AppError (Req 2.8).
 *
 * Design matches the pseudocode in the design document's Token-Bucket Throttle
 * section, with one extension: the queue allows multiple callers to wait
 * concurrently without spinning or busy-waiting.
 */

import { appError } from "./error";

export interface ThrottleOptions {
  /** Maximum number of tokens in the bucket. */
  readonly capacity: number;
  /** Interval in milliseconds at which one token is refilled. */
  readonly refillIntervalMs: number;
  /** Maximum number of pending acquisition requests before overflow rejection. */
  readonly queueLimit: number;
  /** Injectable clock returning the current time in milliseconds since epoch. */
  readonly now?: () => number;
}

interface WaitingRequest {
  resolve: () => void;
  reject: (err: Error) => void;
}

export interface Throttle {
  /**
   * Acquire one token, waiting asynchronously if the bucket is empty.
   * Rejects with `AppError` if the queue is full.
   */
  acquire(): Promise<void>;
}

export function createThrottle(options: ThrottleOptions): Throttle {
  const { capacity, refillIntervalMs, queueLimit, now = Date.now } = options;

  let tokens = capacity;
  let lastRefill = now();
  const queue: WaitingRequest[] = [];

  function refill(): void {
    const elapsed = now() - lastRefill;
    const tokensToAdd = Math.floor(elapsed / refillIntervalMs);

    if (tokensToAdd > 0) {
      tokens = Math.min(capacity, tokens + tokensToAdd);
      lastRefill = now();
    }
  }

  function tryAcquire(): boolean {
    refill();
    if (tokens >= 1) {
      tokens -= 1;
      return true;
    }
    return false;
  }

  function scheduleNext(): void {
    if (queue.length === 0) return;

    const waitMs = refillIntervalMs - ((now() - lastRefill) % refillIntervalMs);
    setTimeout(() => {
      if (tryAcquire()) {
        const next = queue.shift();
        next?.resolve();
      }
      scheduleNext();
    }, waitMs);
  }

  return {
    async acquire(): Promise<void> {
      // Fast path: token available immediately.
      if (tryAcquire()) {
        return Promise.resolve();
      }

      // Slow path: queue the request.
      if (queue.length >= queueLimit) {
        throw appError.rateLimited(refillIntervalMs);
      }

      return new Promise<void>((resolve, reject) => {
        queue.push({ resolve, reject });
        if (queue.length === 1) {
          scheduleNext();
        }
      });
    },
  };
}
