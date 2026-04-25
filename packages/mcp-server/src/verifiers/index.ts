import { verifierRegistry } from '../verifierRegistry.js';
import { pythonTestsVerifier } from './pythonTests.js';

/**
 * Registers every verifier this build supports. Call BEFORE the MCP server
 * starts handling requests, otherwise evaluate_answer falls back to the
 * "no verifier registered" placeholder.
 */
export function registerDefaultVerifiers(): void {
  verifierRegistry.register(pythonTestsVerifier);
}
