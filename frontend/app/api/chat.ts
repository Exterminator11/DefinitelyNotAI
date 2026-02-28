import { postRequest } from "~/api/baseApi";
import type {
  AgentProcessResponse,
  ChatResponseResult,
  SendPromptResult,
} from "~/types/chat";

const CHAT_POLL_INTERVAL_MS = 1000;

function getEnv(): Record<string, unknown> {
  return (typeof import.meta !== "undefined" && import.meta.env) as Record<
    string,
    unknown
  >;
}

function getBaseUrl(): string {
  if (import.meta.env.DEV) return "/api";
  const base = (getEnv().VITE_API_URL as string) ?? "";
  return base.replace(/\/$/, "");
}

function useStub(): boolean {
  return getEnv().VITE_USE_CHAT_STUB === "true" || getBaseUrl() === "";
}

const stubPollCount = new Map<string, number>();
const STUB_POLLS_BEFORE_READY = 2;

export async function sendPrompt(prompt: string): Promise<SendPromptResult> {
  if (useStub()) {
    const hash = `dev-stub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    stubPollCount.set(hash, 0);
    return { hash };
  }
  const base = getBaseUrl();
  const url = `${base}/send-prompt`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    throw new Error(
      `send-prompt failed: ${response.status} ${response.statusText}`,
    );
  }
  const data = (await response.json()) as SendPromptResult;
  if (typeof data?.hash !== "string") {
    throw new Error("Invalid send-prompt response: missing hash");
  }
  return data;
}

export async function getChatResponse(
  hash: string,
): Promise<ChatResponseResult> {
  if (useStub()) {
    const count = stubPollCount.get(hash) ?? 0;
    stubPollCount.set(hash, count + 1);
    if (count < STUB_POLLS_BEFORE_READY) {
      return { status: "pending" };
    }
    stubPollCount.delete(hash);
    return {
      status: "ready",
      response: {
        type: "text",
        content:
          Math.random() < 0.5
            ? "Rachit is a great programmer."
            : "Mihnea is a great programmer.",
      },
    };
  }
  const base = getBaseUrl();
  const url = `${base}/chat-response/${encodeURIComponent(hash)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `chat-response failed: ${response.status} ${response.statusText}`,
    );
  }
  const data = (await response.json()) as ChatResponseResult;
  if (data?.status !== "pending" && data?.status !== "ready") {
    throw new Error("Invalid chat-response: status must be pending or ready");
  }
  if (data.status === "ready" && !data.response) {
    throw new Error("Invalid chat-response: ready but missing response");
  }
  return data;
}

export const CHAT_POLL_INTERVAL = CHAT_POLL_INTERVAL_MS;

const STUB_PROCESS_DELAY_MS = 1500;

export async function processAgentQuery(
  query: string,
  crew = "visualizer",
): Promise<AgentProcessResponse> {
  if (useStub()) {
    await new Promise((resolve) => setTimeout(resolve, STUB_PROCESS_DELAY_MS));
    const hasChart = Math.random() > 0.3;
    const hasText = Math.random() > 0.4 || !hasChart;
    return {
      crew: "visualizer",
      query,
      ...(hasChart && {
        data: {
          labels: [
            "California (federal)",
            "New York (federal)",
            "Illinois (federal)",
            "Michigan (federal)",
            "New York",
          ],
          data: [79, 30, 23, 9, 8],
        },
      }),
      ...(hasText && {
        text: "Here are the top 5 jurisdictions by case count from the dataset.",
      }),
    };
  }
  const data = await postRequest<AgentProcessResponse>("agents/process", {
    query,
    crew,
  });
  if (data?.error) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Agent process error",
    );
  }
  return data;
}
