export type ChatResponseType = "text" | "image";

export interface ChatResponseText {
  type: "text";
  content: string;
}

export interface ChatResponseImage {
  type: "image";
  content: string; // base64 or data URL
}

export type ChatResponsePayload = ChatResponseText | ChatResponseImage;

export interface SendPromptResponsePending {
  status: "pending";
}

export interface SendPromptResponseReady {
  status: "ready";
  response: ChatResponsePayload;
}

export type ChatResponseResult =
  | SendPromptResponsePending
  | SendPromptResponseReady;

export interface SendPromptResult {
  hash: string;
}

export interface AgentProcessChartData {
  labels: string[];
  data: number[];
}

export interface AgentProcessResponse {
  crew: string;
  query: string;
  data?: AgentProcessChartData;
  text?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content?: string;
  imageBase64?: string;
  chartData?: AgentProcessChartData;
}
