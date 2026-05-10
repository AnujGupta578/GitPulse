import { AgentRegistry } from '../registry/AgentRegistry.js';
import { type AgentMessage } from '../agents/BaseAgent.js';

/**
 * Dynamically maps registered agents from the AgentRegistry into
 * Temporal-compatible Activity functions.
 * 
 * @param registry The populated AgentRegistry containing active agents.
 * @returns A Record mapping activity names to async functions.
 */
export function mapAgentsToActivities(registry: AgentRegistry): Record<string, (message: AgentMessage<any>) => Promise<any>> {
    const activities: Record<string, (message: AgentMessage<any>) => Promise<any>> = {};
    const agents = registry.getAllAgents();
    
    for (const agent of agents) {
        const activityName = `execute_${agent.getId().replace(/-/g, '_')}`;
        
        activities[activityName] = async (message: AgentMessage<any>): Promise<any> => {
            // Execute the agent's receiveMessage pipeline
            await agent.receiveMessage(message);
            
            // Because BaseAgent handles exceptions internally by shifting to ERROR state,
            // we must check the state post-execution to decide if we should fail the Temporal Activity.
            // If we fail the activity by throwing, Temporal's durable retry mechanisms will take over.
            if (agent.getState() === 'ERROR') {
                throw new Error(`Temporal Activity Failure: Agent [${agent.getId()}] failed processing message [${message.id}]`);
            }
            
            // In a real advanced implementation, we would extract the specific output of the agent here.
            // Since BaseAgent returns void, we return a success status object.
            return {
                status: 'COMPLETED',
                agentId: agent.getId(),
                messageId: message.id
            };
        };
    }

    return activities;
}
