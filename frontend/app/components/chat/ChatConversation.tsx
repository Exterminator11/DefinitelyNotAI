"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { Loader2 } from "lucide-react";
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
import { BarChartFromEntry } from "~/components/charts/BarChartFromEntry";
import type { ChatMessage } from "~/types/chat";
import { processAgentQuery } from "../../api/chat";

function toDataUrl(content: string): string {
  if (content.startsWith("data:")) return content;
  return `data:image/png;base64,${content}`;
}

export default function ChatConversation() {
  const location = useLocation();
  const initialPrompt = (location.state as { initialPrompt?: string } | null)
    ?.initialPrompt;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialSentRef = useRef(false);

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
    setIsLoading(true);
    try {
      const response = await processAgentQuery(text);
      const id = nanoid();
      const hasChart =
        response.data &&
        Array.isArray(response.data.labels) &&
        Array.isArray(response.data.data) &&
        response.data.labels.length > 0;
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: "assistant",
          ...(response.text && { content: response.text }),
          ...(hasChart && { chartData: response.data }),
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process query",
      );
    } finally {
      setIsLoading(false);
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
          {messages.length === 0 && !isLoading && (
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
                ) : (
                  <>
                    {msg.content != null && msg.content !== "" && (
                      <MessageResponse>{msg.content}</MessageResponse>
                    )}
                    {msg.chartData && (
                      <div className="mt-2">
                        <BarChartFromEntry
                          entry={msg.chartData}
                          title={undefined}
                        />
                      </div>
                    )}
                    {msg.imageBase64 && (
                      <img
                        src={toDataUrl(msg.imageBase64)}
                        alt="Assistant response"
                        className="max-h-80 max-w-full rounded-lg object-contain"
                      />
                    )}
                    {msg.role === "assistant" &&
                      !msg.content &&
                      !msg.chartData &&
                      !msg.imageBase64 && (
                        <MessageResponse>No response.</MessageResponse>
                      )}
                  </>
                )}
              </MessageContent>
            </Message>
          ))}
          {isLoading && (
            <Message from="assistant">
              <MessageContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  <Shimmer>Thinking...</Shimmer>
                </div>
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
              disabled={isLoading}
            />
            <PromptInputFooter>
              <PromptInputSubmit
                status={isLoading ? "submitted" : undefined}
              />
            </PromptInputFooter>
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}
