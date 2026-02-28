"use client";

import type { ComponentProps, HTMLAttributes } from "react";
import { createContext, useContext } from "react";

import { cn } from "~/lib/utils";

type MessageRole = "user" | "assistant" | "system";

const MessageRoleContext = createContext<MessageRole | null>(null);

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: MessageRole;
};

export const Message = ({
  className,
  from,
  children,
  ...props
}: MessageProps) => (
  <MessageRoleContext.Provider value={from}>
    <div
      className={cn(
        "flex w-full",
        from === "user" && "justify-end",
        from === "assistant" && "justify-start",
        from === "system" && "justify-center",
        className
      )}
      data-message-role={from}
      {...props}
    >
      {children}
    </div>
  </MessageRoleContext.Provider>
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => {
  const role = useContext(MessageRoleContext);
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
        role === "user" && "bg-primary text-primary-foreground",
        (role === "assistant" || !role) && "bg-muted/80 text-foreground",
        role === "system" && "bg-muted/60 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export type MessageResponseProps = ComponentProps<"div">;

export const MessageResponse = ({
  className,
  children,
  ...props
}: MessageResponseProps) => (
  <div className={cn("whitespace-pre-wrap break-words", className)} {...props}>
    {children}
  </div>
);
