export type AgentTask = {
    id: string;
    agentName: string;
    payload: any;
};

export type AgentResult = {
    status: 'COMPLETED' | 'FAILED';
    output?: any;
    error?: string;
};

// Added Generics to satisfy AgentRegistry and getId() for system compatibility
export abstract class BaseAgent<T = any, R = any> {
    constructor(protected readonly name: string, protected readonly description: string) {}

    public getId(): string {
        return this.name; // For the intelligence pipeline, name acts as ID
    }

    protected log(message: string) {
        console.log(`[${this.name}] ${new Date().toISOString()}: ${message}`);
    }

    abstract execute(task: AgentTask): Promise<AgentResult>;
}
