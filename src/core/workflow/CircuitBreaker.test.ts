import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CircuitBreaker, CircuitState } from './CircuitBreaker.js';

describe('CircuitBreaker', () => {
    test('should execute successfully when closed', async () => {
        const breaker = new CircuitBreaker(2, 5000);
        const result = await breaker.execute(async () => 'success');
        assert.strictEqual(result, 'success');
        assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
    });

    test('should trip to OPEN after threshold failures', async () => {
        const breaker = new CircuitBreaker(2, 5000);
        
        // First failure
        try { await breaker.execute(async () => { throw new Error('fail 1'); }); } catch (e) {}
        assert.strictEqual(breaker.getState(), CircuitState.CLOSED);

        // Second failure (trips circuit)
        try { await breaker.execute(async () => { throw new Error('fail 2'); }); } catch (e) {}
        assert.strictEqual(breaker.getState(), CircuitState.OPEN);

        // Subsequent calls fail fast
        try {
            await breaker.execute(async () => 'success');
            assert.fail('Should fail fast');
        } catch (e: any) {
            assert.strictEqual(e.message, 'Circuit is OPEN');
        }
    });

    test('should transition to HALF_OPEN after timeout and CLOSE on success', async () => {
        // Short timeout for testing
        const breaker = new CircuitBreaker(1, 10);
        
        // Trip circuit
        try { await breaker.execute(async () => { throw new Error('fail 1'); }); } catch (e) {}
        assert.strictEqual(breaker.getState(), CircuitState.OPEN);

        // Wait for timeout
        await new Promise(resolve => setTimeout(resolve, 20));

        // State is still logically OPEN until next execute tries to go HALF_OPEN
        // Execute will transition to HALF_OPEN, succeed, and then transition to CLOSED
        const result = await breaker.execute(async () => 'success_after_timeout');
        
        assert.strictEqual(result, 'success_after_timeout');
        assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
    });
});
