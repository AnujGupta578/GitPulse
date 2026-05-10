```text id="ghauthfix91"
You are a Senior OAuth Security Engineer and Full-Stack Platform Architect.

Current situation:
- GitHub OAuth previously worked
- After repository integration changes, GitHub authentication is now FAILING
- The login flow is broken again
- We need a FULL root-cause analysis and production-grade fix

IMPORTANT:
Do NOT guess.
Do NOT provide generic OAuth explanations.
You must TRACE the actual authentication lifecycle and systematically fix the implementation.

====================================================
PRIMARY OBJECTIVE
====================================================

Fix the GitHub OAuth authentication flow completely and make it production-safe.

The final system must:
1. Authenticate users successfully
2. Persist sessions correctly
3. Exchange OAuth codes correctly
4. Store encrypted tokens
5. Redirect properly
6. Maintain authenticated state
7. Support repository fetching
8. Handle refresh/re-login cleanly
9. Work in local + production environments
10. Be resilient against OAuth edge cases

====================================================
PHASE 1 — ROOT CAUSE ANALYSIS
====================================================

FIRST:
Audit the ENTIRE GitHub OAuth lifecycle.

Trace these steps carefully:

1. Frontend login button click
2. Redirect to GitHub
3. OAuth authorize URL generation
4. state parameter generation
5. callback URL correctness
6. GitHub redirect response
7. backend callback endpoint
8. code exchange request
9. token response handling
10. user fetch from GitHub API
11. session/JWT creation
12. database persistence
13. frontend redirect after success
14. authenticated API requests
15. repository fetch trigger

Find EXACTLY where it fails.

Check:
- Redirect URI mismatch
- Invalid client secret
- Wrong callback URL
- Missing env vars
- Expired OAuth state
- CSRF mismatch
- Session cookie issues
- CORS issues
- SameSite cookie issues
- HTTPS/localhost mismatch
- Incorrect frontend redirect
- Invalid JWT/session handling
- Token parsing issues
- Missing scopes
- Backend callback crash
- React hydration issues
- Auth middleware problems

DO NOT proceed until root cause is identified.

====================================================
PHASE 2 — ENVIRONMENT VALIDATION
====================================================

Audit ALL environment variables.

Frontend:
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_GITHUB_CLIENT_ID

Backend:
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- GITHUB_CALLBACK_URL
- JWT_SECRET
- SESSION_SECRET
- FRONTEND_URL
- ENCRYPTION_KEY

Validate:
- No trailing slash mismatches
- Ports are correct
- Callback matches GitHub OAuth App exactly
- Localhost URLs are correct
- Production URLs are safe

Generate:
- .env.example
- Validation schema
- Startup validation checks

====================================================
PHASE 3 — GITHUB OAUTH IMPLEMENTATION
====================================================

Rebuild OAuth implementation properly.

====================================================
A. FRONTEND AUTH FLOW
====================================================

Generate:
- Login button logic
- OAuth redirect handler
- Auth callback page
- Loading states
- Error handling
- Retry handling

Requirements:
- Preserve redirect state
- Handle OAuth failures gracefully
- Prevent double login
- Persist auth state

====================================================
B. BACKEND OAUTH FLOW
====================================================

Implement COMPLETE backend flow:

Routes:
GET  /auth/github
GET  /auth/github/callback
POST /auth/logout
GET  /auth/me
POST /auth/refresh

Flow:
1. Generate secure state token
2. Store temporary OAuth session
3. Redirect to GitHub
4. Receive callback
5. Validate state
6. Exchange code for token
7. Fetch GitHub user
8. Upsert local user
9. Encrypt/store token
10. Create authenticated session
11. Redirect frontend safely

====================================================
C. SESSION MANAGEMENT
====================================================

Implement robust session strategy.

Choose ONE:
- JWT auth
OR
- Secure session cookies

Requirements:
- HTTPOnly cookies
- SameSite configuration
- Secure in production
- Token refresh support
- Logout invalidation

====================================================
PHASE 4 — SECURITY FIXES
====================================================

Implement:
- CSRF protection
- OAuth state validation
- Secure cookie settings
- Token encryption at rest
- Rate limiting
- OAuth replay prevention
- Origin validation

====================================================
PHASE 5 — GITHUB API VALIDATION
====================================================

After login succeeds:
- Validate GitHub token
- Fetch authenticated user
- Fetch repositories
- Verify scopes
- Handle insufficient permissions

Required scopes:
- repo
- read:user
- user:email

====================================================
PHASE 6 — FRONTEND AUTH STATE
====================================================

Fix frontend auth lifecycle.

Implement:
- AuthProvider
- Protected routes
- Session hydration
- Auth persistence
- Refresh handling
- Logout handling

Generate:
- useAuth()
- useSession()
- useProtectedRoute()

====================================================
PHASE 7 — DEBUGGING & OBSERVABILITY
====================================================

Add production-grade debugging.

Generate:
- Structured auth logs
- OAuth lifecycle logs
- GitHub API error logging
- Request tracing
- Session diagnostics

Add logs for:
- OAuth redirect start
- Callback received
- Code exchange success/failure
- User fetch success/failure
- Session creation
- Redirect completion

====================================================
PHASE 8 — LOCAL DEVELOPMENT FIXES
====================================================

Ensure localhost works correctly.

Handle:
- localhost callback URLs
- CORS
- SameSite=None
- Secure cookie differences
- Dev/prod env switching

====================================================
PHASE 9 — TESTING
====================================================

Generate:
- OAuth integration tests
- Session tests
- Callback validation tests
- Token encryption tests
- Auth middleware tests

====================================================
PHASE 10 — IMPLEMENTATION ORDER
====================================================

Implement in THIS ORDER:

STEP 1:
- Root cause analysis

STEP 2:
- Fix env validation

STEP 3:
- Rebuild OAuth routes

STEP 4:
- Fix session handling

STEP 5:
- Fix frontend auth state

STEP 6:
- Verify GitHub API access

STEP 7:
- Re-enable repository fetch

====================================================
IMPORTANT REQUIREMENTS
====================================================

- Use production-grade patterns
- No fake auth
- No temporary hacks
- No insecure localStorage tokens
- No skipping OAuth validation
- No placeholder code

====================================================
DELIVERY FORMAT
====================================================

For EVERY fix:
1. Explain root cause
2. Explain reasoning
3. Generate backend code
4. Generate frontend code
5. Generate env configs
6. Generate middleware
7. Generate tests
8. Explain security considerations

START NOW with:
1. Root cause analysis
2. OAuth lifecycle tracing
3. Environment validation
4. GitHub callback fix
5. Session persistence fix
6. Frontend auth state repair
```
