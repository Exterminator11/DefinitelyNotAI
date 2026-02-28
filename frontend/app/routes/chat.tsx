import type { Route } from "./+types/chat";
import ChatConversation from "~/components/chat/ChatConversation";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat — DAIL Assistant" },
    { name: "description", content: "Chat with DAIL Assistant" },
  ];
}

export default function Chat() {
  return (
    <div className="flex w-full flex-1 flex-col items-center px-4 py-4 md:px-8">
      <ChatConversation />
    </div>
  );
}
