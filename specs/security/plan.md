# Blueprint: Security, Audit, and Compliance

## Architecture
- Security services reside in `src/core/security/`.
- We utilize Node's native `crypto` module to avoid third-party dependencies for encryption and basic JWT operations.
- The CI pipeline utilizes standard GitHub actions to enforce code quality.

## File-Level Implementation Plan (Epic 4)
1. `src/core/security/EncryptionService.ts`: Native implementation of AES-256-GCM encryption/decryption for agent messages.
2. `src/core/security/EncryptionService.test.ts`: Unit tests validating encryption integrity and authentication tag validation.
3. `src/core/security/AuthService.ts`: JWT generator and verifier utility for authenticating external actors.
4. `src/core/security/AuthService.test.ts`: Unit tests verifying token signing, expiration handling, and tampering detection.
5. `.github/workflows/compliance.yml`: CI configuration for running linting, tests, and security scans.
