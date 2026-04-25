import type { Verifier, VerificationKind, VerificationSpec, VerificationResult } from '@edhack/contracts';

/**
 * Registry of verifiers, keyed by VerificationKind.
 *
 * Dev C plugs implementations in here from packages/verifiers/.
 * Until then, the default registry returns a "not implemented" result so the
 * MCP surface is callable end-to-end for testing.
 */

class VerifierRegistry {
  private readonly verifiers = new Map<VerificationKind, Verifier>();

  register<K extends VerificationKind>(verifier: Verifier<K>): void {
    this.verifiers.set(verifier.kind, verifier as unknown as Verifier);
  }

  async verify(spec: VerificationSpec, studentAnswer: string): Promise<VerificationResult> {
    const verifier = this.verifiers.get(spec.kind);
    if (!verifier) {
      return {
        passed: false,
        feedback: `[mcp-server] No verifier registered for kind="${spec.kind}". ` +
          `Dev C: implement in packages/verifiers/ and register on boot.`,
      };
    }
    // Type assertion: registry guarantees kind matches at runtime.
    return verifier.verify(spec as never, studentAnswer);
  }

  has(kind: VerificationKind): boolean {
    return this.verifiers.has(kind);
  }
}

export const verifierRegistry = new VerifierRegistry();
