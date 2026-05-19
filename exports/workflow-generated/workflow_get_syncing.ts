import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from './activities';

// Proxy all discovered Actions and Sinks as Temporal Activities
const { handleSync, fetchData, fetchBranches, fetch___, log, fetch___, setBranch, fetch___, updateUrl } = proxyActivities<typeof activities>({
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
 * Trigger Entry Point: GET syncing
 */
export async function GET_syncingWorkflow(payload: any): Promise<any> {
    let currentData = payload;
    console.log("Starting Workflow: GET_syncingWorkflow");

    try {
        currentData = await handleSync(currentData);
        currentData = await fetchData(currentData);
        currentData = await log(currentData);

        return currentData;
    } catch (error) {
        console.error("Workflow failed execution run:", error);
        throw error;
    }
}
