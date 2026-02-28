"use client";

import { useNavigate } from "react-router";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "~/components/ai-elements/prompt-input";

export default function HomePrompt() {
  const navigate = useNavigate();

  const handleSubmit = (message: { text: string }) => {
    const text = message.text?.trim();
    if (!text) return;
    navigate("/chat", { state: { initialPrompt: text } });
  };

  return (
    <div className="flex w-full max-w-2xl flex-1 flex-col items-stretch justify-center gap-10 px-4 py-8 mx-auto">
      <h1 className="text-center text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        What&apos;s your question?
      </h1>
      <div className="w-full min-w-0">
        <PromptInput
          className="w-full min-w-0 max-w-full"
          maxFiles={0}
          onSubmit={handleSubmit}
        >
          <PromptInputBody>
            <PromptInputTextarea placeholder="Ask anything..." />
            <PromptInputFooter>
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}
