"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { ImageChatPopup } from "@/components/copilotkit/ImageChatPopup";
import { DebugPanel } from "@/components/copilotkit/debug-panel";
import { useGenerativeUIHooks } from "@/lib/copilotkit/generative-ui-hooks";

export default function ChatPage() {
  useGenerativeUIHooks();

  return (
    <div className="relative flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <CopilotChat />
      </div>

      <ImageChatPopup />
      <DebugPanel />
    </div>
  );
}
