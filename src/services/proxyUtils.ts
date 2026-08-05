export interface ProxyAttempt {
  url: string;
  headers?: Record<string, string>;
  parse?: (response: Response) => Response | Promise<Response>;
}

/**
 * Fires all proxy attempts in parallel and resolves with the first OK response.
 * Losing attempts are aborted as soon as a winner is found, so the worst-case
 * latency is bounded by the fastest proxy instead of the sum of all of them.
 */
export async function raceFetch(attempts: ProxyAttempt[], init: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controllers = attempts.map(() => new AbortController());
  const errors: string[] = [];
  let settled = false;
  let pending = attempts.length;

  return await new Promise<Response>((resolve, reject) => {
    if (pending === 0) {
      reject(new Error('No proxy attempts available'));
      return;
    }

    attempts.forEach((attempt, i) => {
      (async () => {
        const timer = setTimeout(() => controllers[i].abort(), timeoutMs);
        try {
          const headers = { ...(init.headers as Record<string, string> | undefined), ...attempt.headers };
          const response = await fetch(attempt.url, { ...init, headers, signal: controllers[i].signal });
          clearTimeout(timer);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const finalResponse = attempt.parse ? await attempt.parse(response) : response;
          if (settled) return;
          settled = true;
          controllers.forEach(c => c.abort());
          resolve(finalResponse);
        } catch (error) {
          clearTimeout(timer);
          errors.push(`${attempt.url}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          pending--;
          if (pending === 0 && !settled) {
            settled = true;
            reject(new Error(errors.join(' | ') || 'All proxy attempts failed'));
          }
        }
      })();
    });
  });
}

/**
 * Runs all attempts in parallel and resolves with the first non-null value.
 * Each attempt receives an AbortSignal that fires either on its own timeout
 * or as soon as another attempt wins (all remaining attempts get aborted).
 */
export async function raceForValue<T>(
  attempts: Array<(signal: AbortSignal) => Promise<T | null>>,
  timeoutMs = 10000
): Promise<T | null> {
  const shared = new AbortController();
  const overallTimer = setTimeout(() => shared.abort(), timeoutMs * 3);
  let pending = attempts.length;

  return await new Promise<T | null>((resolve) => {
    if (pending === 0) {
      resolve(null);
      return;
    }

    const finish = (value: T | null) => {
      clearTimeout(overallTimer);
      shared.abort();
      resolve(value);
    };

    attempts.forEach((attempt) => {
      (async () => {
        const local = new AbortController();
        const timer = setTimeout(() => local.abort(), timeoutMs);
        const onSharedAbort = () => local.abort();
        shared.signal.addEventListener('abort', onSharedAbort, { once: true });
        try {
          const value = await attempt(local.signal);
          if (value !== null && value !== undefined) {
            pending = 0;
            finish(value);
            return;
          }
        } catch (e) {
          // Ignore individual attempt failures; the race continues.
        } finally {
          clearTimeout(timer);
          shared.signal.removeEventListener('abort', onSharedAbort);
          pending--;
          if (pending === 0 && !(shared.signal.aborted)) {
            finish(null);
          }
        }
      })();
    });
  });
}
