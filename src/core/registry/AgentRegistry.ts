import { BaseAgent } from '../agents/BaseAgent.js';

export class AgentRegistry {
    private agents: Map<string, BaseAgent<any>>;

    constructor() {
        this.agents = new Map<string, BaseAgent<any>>();
    }

    /**
     * Registers an agent in the registry.
     * @param agent The BaseAgent instance to register
     */
    public register(agent: BaseAgent<any>): void {
        const id = agent.getId();
        if (this.agents.has(id)) {
            console.warn(`Agent with ID [${id}] is already registered. Overwriting.`);
        }
        this.agents.set(id, agent);
    }

    /**
     * Unregisters an agent by ID.
     * @param id The ID of the agent to unregister
     */
    public unregister(id: string): void {
        this.agents.delete(id);
    }

    /**
     * Retrieves an agent by its ID.
     * @param id The ID of the agent
     * @returns The BaseAgent instance or undefined if not found
     */
    public getAgent(id: string): BaseAgent<any> | undefined {
        return this.agents.get(id);
    }

    /**
     * Retrieves all registered agents.
     * @returns Array of BaseAgent instances
     */
    public getAllAgents(): BaseAgent<any>[] {
        return Array.from(this.agents.values());
    }
}
