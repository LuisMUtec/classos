"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  SendHorizontalIcon,
  Loader2Icon,
  SparklesIcon,
  RefreshCcwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/ui/icon-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TutorChatPanelProps {
  courseId: string;
  courseName: string;
}

const DEFAULT_SUGGESTIONS = [
  "Explícame qué se ve en este curso.",
  "Dame un ejercicio para practicar.",
  "Estoy atorado, dame una pista.",
];

export function TutorChatPanel({ courseId, courseName }: TutorChatPanelProps) {
  const [studentId, setStudentId] = React.useState<string | null>(null);
  const [bootError, setBootError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const tokenKey = `classos:student:${courseId}`;
    const existing = typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;
    fetch("/api/student/ensure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: courseId, anon_token: existing ?? undefined }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`ensure student ${r.status}`);
        return r.json();
      })
      .then((row: { id: string; anon_token: string }) => {
        if (cancelled) return;
        if (typeof window !== "undefined") localStorage.setItem(tokenKey, row.anon_token);
        setStudentId(row.id);
      })
      .catch((err) => {
        if (!cancelled) setBootError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const transport = React.useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          agentId: "tutor",
          sessionContext: studentId
            ? { course_id: courseId, student_id: studentId }
            : { course_id: courseId },
        },
      }),
    [courseId, studentId],
  );

  const [input, setInput] = React.useState("");
  const { messages, sendMessage, status, setMessages } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const submit = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  };

  return (
    <section className="flex h-[calc(100svh-11rem)] flex-col overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex h-11 items-center justify-between border-b border-border/70 bg-muted/30 px-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
              T
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">agent · tutor</span>
          <Badge variant="outline" className="h-5 gap-1 text-[10px] uppercase tracking-wide">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            {courseName}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMessages([])}
          disabled={messages.length === 0 || isLoading}
        >
          <RefreshCcwIcon /> Limpiar
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5"
        style={{ overscrollBehavior: "contain" }}
        aria-live="polite"
        aria-busy={isLoading}
      >
        {bootError ? (
          <p className="mx-auto max-w-md text-center text-sm text-destructive">{bootError}</p>
        ) : messages.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-5 py-10 text-center">
            <IconBadge tone="primary" size="lg">
              <SparklesIcon />
            </IconBadge>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold">Aprendamos {courseName}</p>
              <p className="text-balance text-sm text-muted-foreground">
                El tutor consulta lo que el docente dejó en las lecciones. No inventes
                datos, los toma del curso.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              {DEFAULT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setInput(s);
                    requestAnimationFrame(() => inputRef.current?.focus());
                  }}
                  className="group/sg flex w-full items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="truncate">{s}</span>
                  <SendHorizontalIcon className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover/sg:text-primary" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
            {status === "submitted" && <TypingDot />}
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-end gap-2 border-t border-border/70 bg-background/60 p-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          Mensaje
        </label>
        <textarea
          id="chat-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe un mensaje…"
          disabled={isLoading || !studentId}
          rows={1}
          spellCheck
          autoComplete="off"
          className="min-h-9 max-h-32 flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Enviar mensaje"
          disabled={!input.trim() || isLoading || !studentId}
        >
          {isLoading ? <Loader2Icon className="animate-spin" /> : <SendHorizontalIcon />}
        </Button>
      </form>
    </section>
  );
}

interface UIMessage {
  id: string;
  role: string;
  parts?: Array<{ type: string; text?: string }>;
}

function Bubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text =
    message.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("") ?? "";

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
            T
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex max-w-[78%] flex-col gap-1">
        <span className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {isUser ? "Tú" : "tutor"}
        </span>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-muted text-foreground",
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function TypingDot() {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-7 shrink-0">
        <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
          T
        </AvatarFallback>
      </Avatar>
      <div className="flex h-7 items-center gap-1 rounded-2xl bg-muted px-3">
        <span className="size-1.5 animate-pulse rounded-full bg-foreground/50" />
        <span className="size-1.5 animate-pulse rounded-full bg-foreground/50 [animation-delay:120ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-foreground/50 [animation-delay:240ms]" />
      </div>
    </div>
  );
}
