"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { nanoid } from "nanoid";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "~/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "~/components/ai-elements/prompt-input";
import { Shimmer } from "~/components/ai-elements/shimmer";
import type { ChatMessage } from "~/types/chat";
import {
  sendPrompt,
  getChatResponse,
  CHAT_POLL_INTERVAL,
} from "../../api/chat";

function toDataUrl(content: string): string {
  if (content.startsWith("data:")) return content;
  return `data:image/png;base64,${content}`;
}

export default function ChatConversation() {
  const location = useLocation();
  const initialPrompt = (location.state as { initialPrompt?: string } | null)
    ?.initialPrompt;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingHash, setPendingHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialSentRef = useRef(false);

  const pollOnce = useCallback(async (hash: string) => {
    try {
      const result = await getChatResponse(hash);
      if (result.status === "ready") {
        setPendingHash(null);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        const response = result.response;
        const id = nanoid();
        if (response.type === "text") {
          setMessages((prev) => [
            ...prev,
            { id, role: "assistant", content: response.content },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id,
              role: "assistant",
              imageBase64: response.content,
            },
          ]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
      setPendingHash(null);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!pendingHash) return;
    pollOnce(pendingHash);
    pollRef.current = setInterval(() => {
      pollOnce(pendingHash);
    }, CHAT_POLL_INTERVAL);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [pendingHash, pollOnce]);

  const handleSend = useCallback(async (payload: { text: string }) => {
    const text = payload.text?.trim();
    if (!text) return;
    setError(null);
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    try {
      const { hash } = await sendPrompt(text);
      setPendingHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send prompt");
    }
  }, []);

  useEffect(() => {
    if (!initialPrompt || initialSentRef.current) return;
    initialSentRef.current = true;
    handleSend({ text: initialPrompt });
  }, [initialPrompt, handleSend]);

  return (
    <div className="flex h-full w-full max-w-4xl flex-1 flex-col overflow-hidden">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent>
          {messages.length === 0 && !pendingHash && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
              <p className="text-sm">
                Send a message to start the conversation.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <Message key={msg.id} from={msg.role}>
              <MessageContent>
                {msg.role === "user" ? (
                  <MessageResponse>{msg.content}</MessageResponse>
                ) : msg.imageBase64 ? (
                  <img
                    src={toDataUrl(msg.imageBase64)}
                    alt="Assistant response"
                    className="max-h-80 max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <MessageResponse>{msg.content ?? ""}</MessageResponse>
                )}
              </MessageContent>
            </Message>
          ))}
          {pendingHash && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer className="text-muted-foreground">Thinking...</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {error && (
        <div className="px-4 py-2 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}
      <div className="w-full border-t border-border bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60">
        <PromptInput onSubmit={handleSend}>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Message..."
              disabled={!!pendingHash}
            />
            <PromptInputFooter>
              <PromptInputSubmit
                status={pendingHash ? "submitted" : undefined}
              />
            </PromptInputFooter>
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}
