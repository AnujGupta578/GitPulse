import { Client, Connection } from '@temporalio/client';

export class TemporalClientService {
    private client: Client | null = null;
    private connection: Connection | null = null;
    private readonly address: string;

    constructor(address: string = 'localhost:7233') {
        this.address = address;
    }

    /**
     * Initializes the Temporal connection and client.
     */
    public async connect(): Promise<void> {
        try {
            this.connection = await Connection.connect({ address: this.address });
            this.client = new Client({
                connection: this.connection,
                // In production, configure namespace
            });
            console.log(`Successfully connected to Temporal server at ${this.address}`);
        } catch (error) {
            console.error('Failed to connect to Temporal Server:', error);
            throw error;
        }
    }

    /**
     * Retrieves the connected Temporal client instance.
     * @returns The Temporal Client
     */
    public getClient(): Client {
        if (!this.client) {
            throw new Error('Temporal Client not initialized. Call connect() first.');
        }
        return this.client;
    }
}
