import { test, describe } from 'node:test';
import assert from 'node:assert';
import { executeWithRetry } from './DurableExecution.js';

describe('DurableExecution (Retry Mechanism)', () => {
    test('should succeed on first try if no error', async () => {
        let attempts = 0;
        const result = await executeWithRetry(async () => {
            attempts++;
            return 'success';
        }, { maxRetries: 3, baseDelayMs: 10 });
        
        assert.strictEqual(result, 'success');
        assert.strictEqual(attempts, 1);
    });

    test('should retry on failure and succeed', async () => {
        let attempts = 0;
        const result = await executeWithRetry(async () => {
            attempts++;
            if (attempts < 3) {
                throw new Error('Transient failure');
            }
            return 'success_after_retries';
        }, { maxRetries: 3, baseDelayMs: 5 });
        
        assert.strictEqual(result, 'success_after_retries');
        assert.strictEqual(attempts, 3);
    });

    test('should throw error after max retries exceeded', async () => {
        let attempts = 0;
        try {
            await executeWithRetry(async () => {
                attempts++;
                throw new Error('Persistent failure');
            }, { maxRetries: 2, baseDelayMs: 5 });
            assert.fail('Should have thrown an error');
        } catch (error: any) {
            assert.strictEqual(error.message, 'Persistent failure');
            assert.strictEqual(attempts, 3); // initial attempt + 2 retries
        }
    });
});
