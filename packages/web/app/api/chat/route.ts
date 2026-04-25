import { createUIMessageStream, JsonToSseTransformStream } from "ai";

import { mastraClient } from "@/lib/mastra";

export const runtime = "nodejs";
export const maxDuration = 300;

interface UIMessagePart {
  type: string;
  text?: string;
}

interface UIMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  parts?: UIMessagePart[];
  content?: string;
}

interface MastraTextDeltaChunk {
  type: "text-delta";
  payload: { id: string; text: string };
}

interface MastraStreamChunk {
  type: string;
  payload?: Record<string, unknown>;
}

function uiMessageToText(msg: UIMessage): string {
  if (typeof msg.content === "string") return msg.content;
  return (
    msg.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("") ?? ""
  );
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    messages?: UIMessage[];
    agentId?: string;
    sessionContext?: Record<string, string>;
  };

  const agentId = body.agentId ?? "assistant";
  const incoming = body.messages ?? [];

  // Convert UIMessages → plain { role, content } that Mastra understands.
  const baseMessages = incoming
    .filter((m) => m.role === "user" || m.role === "assistant" || m.role === "system")
    .map((m) => ({ role: m.role, content: uiMessageToText(m) }))
    .filter((m) => m.content.length > 0);

  // Inject session context (e.g. course_id + student_id for the tutor agent)
  // as a system message at the head of the conversation, so the agent can pass
  // those exact ids into tool calls without the user having to repeat them.
  const ctx = body.sessionContext;
  const systemPrefix =
    ctx && Object.keys(ctx).length > 0
      ? [
          {
            role: "system" as const,
            content:
              "Contexto de la sesión (úsalos como argumentos en las tools cuando aplique):\n" +
              Object.entries(ctx)
                .map(([k, v]) => `${k}=${v}`)
                .join("  "),
          },
        ]
      : [];

  const mastraMessages = [...systemPrefix, ...baseMessages];

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const messageId = crypto.randomUUID();
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: messageId });

      try {
        const agent = mastraClient.getAgent(agentId);
        const response = await agent.stream(mastraMessages);

        await response.processDataStream({
          onChunk: async (chunk) => {
            const c = chunk as MastraStreamChunk;
            if (c.type === "text-delta") {
              const delta = (c as unknown as MastraTextDeltaChunk).payload?.text;
              if (delta) {
                writer.write({ type: "text-delta", id: messageId, delta });
              }
            }
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        writer.write({
          type: "text-delta",
          id: messageId,
          delta: `\n\n_Error: ${message}_`,
        });
      }

      writer.write({ type: "text-end", id: messageId });
      writer.write({ type: "finish" });
    },
  });

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "x-vercel-ai-ui-message-stream": "v1",
    },
  });
}
