export interface RetryOptions {
    maxRetries: number;
    baseDelayMs: number;
}

const defaultOptions: RetryOptions = {
    maxRetries: 3,
    baseDelayMs: 1000,
};

/**
 * Executes an asynchronous task with automatic retries and exponential backoff.
 * This mimics durable workflow recovery locally.
 * 
 * @param task The asynchronous function to execute
 * @param options Retry configuration
 * @returns The resolved value of the task
 */
export async function executeWithRetry<T>(
    task: () => Promise<T>,
    options: Partial<RetryOptions> = {}
): Promise<T> {
    const config = { ...defaultOptions, ...options };
    let attempt = 0;

    while (true) {
        try {
            return await task();
        } catch (error) {
            if (attempt >= config.maxRetries) {
                throw error;
            }
            attempt++;
            const delay = config.baseDelayMs * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
