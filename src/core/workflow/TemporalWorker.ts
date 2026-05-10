import { Worker, NativeConnection } from '@temporalio/worker';
import { AgentRegistry } from '../registry/AgentRegistry.js';
import { mapAgentsToActivities } from './ActivityMapper.js';

export class TemporalWorkerService {
    private worker: Worker | null = null;
    private readonly address: string;
    private readonly taskQueue: string;

    constructor(address: string = 'localhost:7233', taskQueue: string = 'agent-tasks') {
        this.address = address;
        this.taskQueue = taskQueue;
    }

    /**
     * Starts a Temporal Worker listening to the specified taskQueue.
     * @param registry The populated AgentRegistry containing active agents.
     */
    public async start(registry: AgentRegistry): Promise<void> {
        try {
            const activities = mapAgentsToActivities(registry);

            const connection = await NativeConnection.connect({
                address: this.address,
            });

            this.worker = await Worker.create({
                connection,
                namespace: 'default',
                taskQueue: this.taskQueue,
                activities,
                // Workflows would be configured here if TS handles workflow logic directly
                // workflowsPath: require.resolve('./workflows'),
            });

            console.log(`Starting Temporal Worker on queue: ${this.taskQueue}`);
            await this.worker.run();
        } catch (error) {
            console.error('Failed to start Temporal Worker:', error);
            throw error;
        }
    }
}
