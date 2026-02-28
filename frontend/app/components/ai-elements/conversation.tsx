"use client";

import type { ComponentProps } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { ArrowDownIcon, DownloadIcon } from "lucide-react";

type ConversationContextValue = {
  isAtBottom: boolean;
  scrollToBottom: () => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const ConversationContext = createContext<ConversationContextValue | null>(null);

function useConversationContext() {
  const ctx = useContext(ConversationContext);
  if (!ctx) {
    throw new Error("ConversationScrollButton must be used inside Conversation");
  }
  return ctx;
}

export type ConversationProps = ComponentProps<"div">;

export const Conversation = ({ className, children, ...props }: ConversationProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    contentRef.current?.scrollTo({
      top: contentRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const checkAtBottom = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const threshold = 50;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(atBottom);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkAtBottom);
    const ro = new ResizeObserver(checkAtBottom);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkAtBottom);
      ro.disconnect();
    };
  }, [checkAtBottom]);

  const value: ConversationContextValue = {
    isAtBottom,
    scrollToBottom,
    contentRef,
  };

  return (
    <ConversationContext.Provider value={value}>
      <div
        className={cn("relative flex-1 overflow-y-hidden", className)}
        role="log"
        {...props}
      >
        {children}
      </div>
    </ConversationContext.Provider>
  );
};

export type ConversationContentProps = ComponentProps<"div">;

export const ConversationContent = ({
  className,
  children,
  ...props
}: ConversationContentProps) => {
  const { contentRef } = useConversationContext();

  return (
    <div
      ref={contentRef}
      className={cn("flex h-full flex-col gap-8 overflow-y-auto p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useConversationContext();

  if (isAtBottom) return null;

  return (
    <Button
      className={cn(
        "absolute bottom-4 left-[50%] z-10 translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted",
        className
      )}
      onClick={scrollToBottom}
      size="icon"
      type="button"
      variant="outline"
      {...props}
    >
      <ArrowDownIcon className="size-4" />
    </Button>
  );
};

export interface ConversationMessage {
  role: "user" | "assistant" | "system" | "data" | "tool";
  content: string;
}

export type ConversationDownloadProps = Omit<
  ComponentProps<typeof Button>,
  "onClick"
> & {
  messages: ConversationMessage[];
  filename?: string;
  formatMessage?: (message: ConversationMessage, index: number) => string;
};

const defaultFormatMessage = (message: ConversationMessage): string => {
  const roleLabel =
    message.role.charAt(0).toUpperCase() + message.role.slice(1);
  return `**${roleLabel}:** ${message.content}`;
};

export const messagesToMarkdown = (
  messages: ConversationMessage[],
  formatMessage: (
    message: ConversationMessage,
    index: number
  ) => string = defaultFormatMessage
): string => messages.map((msg, i) => formatMessage(msg, i)).join("\n\n");

export const ConversationDownload = ({
  messages,
  filename = "conversation.md",
  formatMessage = defaultFormatMessage,
  className,
  children,
  ...props
}: ConversationDownloadProps) => {
  const handleDownload = useCallback(() => {
    const markdown = messagesToMarkdown(messages, formatMessage);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [messages, filename, formatMessage]);

  return (
    <Button
      className={cn(
        "absolute top-4 right-4 rounded-full dark:bg-background dark:hover:bg-muted",
        className
      )}
      onClick={handleDownload}
      size="icon"
      type="button"
      variant="outline"
      {...props}
    >
      {children ?? <DownloadIcon className="size-4" />}
    </Button>
  );
};
