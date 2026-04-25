import { PageHeader } from "@/components/dashboard/PageHeader";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Badge } from "@/components/ui/badge";

export default function ChatPage() {
  return (
    <>
      <PageHeader
        eyebrow="Inteligencia"
        title="Chat"
        description="useChat() del AI SDK conectado al agent Mastra a través de /api/chat."
        actions={
          <>
            <Badge variant="outline">agent · assistant</Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              /api/chat
            </Badge>
          </>
        }
      />
      <ChatPanel agentId="assistant" />
    </>
  );
}
