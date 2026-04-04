"use client";

import { useGenerativeUIHooks } from "@/lib/copilotkit/generative-ui-hooks";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { ImageChatPopup } from "@/components/copilotkit/ImageChatPopup";
import { DebugPanel } from "@/components/copilotkit/debug-panel";

export default function ChatPage() {
  useGenerativeUIHooks();

  return (
    <div className="relative flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <CopilotChat
          input={{
            disclaimer: () => null,
            className: "pb-6",
          }}
        />
      </div>

      <ImageChatPopup />
      <DebugPanel />
    </div>
  );
}
