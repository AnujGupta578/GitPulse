import { proxyActivities, Workflow } from '@temporalio/workflow';

// Define activity interfaces for each ACTION and INTEGRATION node.
// Each activity represents a distinct, idempotent operation.
interface ServiceWorkerActivities {
  /**
   * [ACTION] checkValidServiceWorker
   * Checks the validity of the service worker. It might need to fetch content
   * to determine validity (e.g., content-type check).
   * @param serviceWorkerUrl The URL of the service worker script.
   * @param scope The scope of the service worker registration.
   * @param fetchedContentType Optional: Content type fetched from the service worker URL.
   * @returns An object indicating the status and potentially a URL to fetch if more data is needed.
   */
  checkValidServiceWorker(
    serviceWorkerUrl: string,
    scope: string,
    fetchedContentType?: string
  ): Promise<{
    status: 'valid' | 'invalid' | 'needs_unregister' | 'needs_fetch' | 'needs_register';
    fetchUrl?: string;
  }>;

  /**
   * [ACTION] unregister
   * Unregisters the service worker for a given scope.
   * @param scope The scope of the service worker to unregister.
   */
  unregisterServiceWorker(scope: string): Promise<void>;

  /**
   * [ACTION] registerValidSW
   * This activity determines if a valid service worker registration process should proceed.
   * The edge `registerValidSW -> register [RECURSIVE]` implies this activity orchestrates
   * the actual `registerServiceWorker` activity, or at least signals the workflow to do so.
   * @param serviceWorkerUrl The URL of the service worker script.
   * @param scope The scope for registration.
   * @returns A boolean indicating whether the workflow should proceed with the actual registration.
   */
  registerValidServiceWorker(
    serviceWorkerUrl: string,
    scope: string
  ): Promise<{ shouldProceedWithRegistration: boolean }>;

  /**
   * [INTEGRATION] fetch(...)
   * Fetches content from a given URL. This is an external HTTP integration.
   * @param url The URL to fetch.
   * @returns The fetched content as a string (e.g., content type, or full response body).
   */
  fetchContent(url: string): Promise<string>;

  /**
   * [ACTION] register
   * Performs the actual service worker registration using browser APIs.
   * @param serviceWorkerUrl The URL of the service worker script.
   * @param scope The scope for registration.
   */
  registerServiceWorker(serviceWorkerUrl: string, scope: string): Promise<void>;
}

// Proxy activities for use within the workflow.
// Configure timeouts and other options as needed.
const activities = proxyActivities<ServiceWorkerActivities>({
  startToCloseTimeout: '1 minute', // Example timeout for activities
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumInterval: '10 seconds',
    maximumAttempts: 3,
  },
});

/**
 * Input interface for the RegisterServiceWorkerWorkflow.
 */
export interface RegisterServiceWorkerWorkflowInput {
  serviceWorkerUrl: string;
  scope: string;
}

/**
 * Temporal Workflow to orchestrate the service worker registration and management process.
 *
 * This workflow follows the provided execution path and edges, interpreting them
 * as sequential steps, conditional branches, and activity calls orchestrated by the workflow.
 *
 * @param input The input containing the service worker URL and scope.
 * @returns A string indicating the final outcome of the workflow.
 */
export async function registerServiceWorkerWorkflow(
  input: RegisterServiceWorkerWorkflowInput
): Promise<string> {
  let currentStatus:
    | 'valid'
    | 'invalid'
    | 'needs_unregister'
    | 'needs_fetch'
    | 'needs_register'
    | 'registered'
    | 'unregistered' = 'invalid';
  let fetchedContentType: string | undefined;
  let finalMessage: string = '';

  // --- TRIGGER::GET content-type -> ACTION::checkValidServiceWorker ---
  // Start the workflow by checking the current state of the service worker.
  let checkResult = await activities.checkValidServiceWorker(
    input.serviceWorkerUrl,
    input.scope
  );
  currentStatus = checkResult.status;

  // --- Handle fetching if required by checkValidServiceWorker ---
  // Edge: ACTION::checkValidServiceWorker -> INTEGRATION::HTTP::fetch
  // If the initial check indicates a need to fetch external content (e.g., content-type),
  // the workflow orchestrates the fetch and then re-evaluates the service worker status.
  while (currentStatus === 'needs_fetch') {
    if (!checkResult.fetchUrl) {
      throw new Error('checkValidServiceWorker returned needs_fetch but no fetchUrl');
    }
    fetchedContentType = await activities.fetchContent(checkResult.fetchUrl);
    checkResult = await activities.checkValidServiceWorker(
      input.serviceWorkerUrl,
      input.scope,
      fetchedContentType
    );
    currentStatus = checkResult.status;
  }

  // --- Handle unregistration if required ---
  // Edge: ACTION::checkValidServiceWorker -> ACTION::unregister
  // If the service worker is invalid and needs to be unregistered.
  if (currentStatus === 'needs_unregister') {
    await activities.unregisterServiceWorker(input.scope);
    currentStatus = 'unregistered';
    finalMessage += `Service Worker at ${input.serviceWorkerUrl} was unregistered. `;
    // Edge: ACTION::unregister -> INTEGRATION::HTTP::fetch (This implies unregister might need fetch,
    // which is assumed to be handled internally by the unregister activity or workflow re-evaluates if needed.)
    // After unregistration, we typically proceed to register a valid one.
    currentStatus = 'needs_register';
  }

  // --- Handle registration if required ---
  // Edge: ACTION::checkValidServiceWorker -> ACTION::registerValidSW
  // Edge: ACTION::register -> ACTION::registerValidSW (implies re-evaluation or retry after a registration attempt)
  // If the service worker is invalid, was just unregistered, or explicitly needs registration.
  if (currentStatus === 'needs_register' || currentStatus === 'invalid') {
    // Call registerValidServiceWorker to determine if we should proceed with actual registration.
    // This activity encapsulates the logic for deciding if a registration attempt is valid.
    let registerValidSWDecision = await activities.registerValidServiceWorker(
      input.serviceWorkerUrl,
      input.scope
    );

    if (registerValidSWDecision.shouldProceedWithRegistration) {
      // Edge: ACTION::registerValidSW -> ACTION::register [RECURSIVE: recurses]
      // If registerValidSW decides to proceed, the workflow calls the low-level register activity.
      await activities.registerServiceWorker(input.serviceWorkerUrl, input.scope);
      currentStatus = 'registered';
      finalMessage += `Service Worker at ${input.serviceWorkerUrl} was successfully registered. `;

      // Edge: ACTION::register -> ACTION::checkValidServiceWorker
      // After registration, perform a final check to confirm validity and active status.
      checkResult = await activities.checkValidServiceWorker(
        input.serviceWorkerUrl,
        input.scope
      );
      currentStatus = checkResult.status;
      // Handle fetch if this final check also needs it.
      if (currentStatus === 'needs_fetch') {
        if (!checkResult.fetchUrl) {
          throw new Error(
            'checkValidServiceWorker returned needs_fetch but no fetchUrl after registration'
          );
        }
        fetchedContentType = await activities.fetchContent(checkResult.fetchUrl);
        checkResult = await activities.checkValidServiceWorker(
          input.serviceWorkerUrl,
          input.scope,
          fetchedContentType
        );
        currentStatus = checkResult.status;
      }
    } else {
      finalMessage += `Service Worker at ${input.serviceWorkerUrl} was not registered as per 'registerValidSW' decision. `;
    }
  }

  // --- Final status evaluation and message ---
  if (currentStatus === 'valid' || currentStatus === 'registered') {
    finalMessage = `Service Worker at ${input.serviceWorkerUrl} is valid and active. ` + finalMessage;
  } else if (currentStatus === 'unregistered') {
    finalMessage = `Service Worker at ${input.serviceWorkerUrl} remains unregistered. ` + finalMessage;
  } else {
    finalMessage = `Service Worker at ${input.serviceWorkerUrl} ended in an unexpected state: ${currentStatus}. ` + finalMessage;
  }

  return finalMessage.trim();
}