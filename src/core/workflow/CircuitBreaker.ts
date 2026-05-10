export enum CircuitState {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount = 0;
    private lastFailureTime = 0;
    private readonly failureThreshold: number;
    private readonly resetTimeoutMs: number;

    constructor(failureThreshold: number = 3, resetTimeoutMs: number = 10000) {
        this.failureThreshold = failureThreshold;
        this.resetTimeoutMs = resetTimeoutMs;
    }

    public getState(): CircuitState {
        return this.state;
    }

    public async execute<T>(task: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            const now = Date.now();
            if (now - this.lastFailureTime > this.resetTimeoutMs) {
                this.state = CircuitState.HALF_OPEN;
            } else {
                throw new Error('Circuit is OPEN');
            }
        }

        try {
            const result = await task();
            // On success, reset circuit
            this.state = CircuitState.CLOSED;
            this.failureCount = 0;
            return result;
        } catch (error) {
            this.handleFailure();
            throw error;
        }
    }

    private handleFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
            this.state = CircuitState.OPEN;
        }
    }
}
