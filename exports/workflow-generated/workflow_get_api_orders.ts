import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from './activities';

// Proxy all discovered Actions and Sinks as Temporal Activities
const { fetchOrders, Prisma_DB_Write, act_1_fallback } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        initialInterval: '3s',
        backoffCoefficient: 2,
        maximumAttempts: 5,
        nonRetryableErrorTypes: ['ValidationError']
    }
});

/**
 * GitPulse Generated Deterministic Temporal Workflow
 * Trigger Entry Point: GET /api/orders
 */
export async function GET__api_ordersWorkflow(payload: any): Promise<any> {
    let currentData = payload;
    console.log("Starting Workflow: GET__api_ordersWorkflow");

    try {
        // Wait of 15 seconds registered
        await sleep('15s');
        try {
            currentData = await fetchOrders(currentData);
        } catch (err) {
            console.warn("Caught in AST Error Boundary: act-1-fallback");
            currentData = await act_1_fallback(currentData);
        }
        // Decision: isAdmin
        if (user.role === "admin") {
            currentData = await Prisma_DB_Write(currentData);
        }

        return currentData;
    } catch (error) {
        console.error("Workflow failed execution run:", error);
        throw error;
    }
}
