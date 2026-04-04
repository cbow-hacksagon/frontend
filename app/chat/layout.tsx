import "@copilotkit/react-core/v2/styles.css";

import { CopilotKit } from "@copilotkit/react-core";
import { ThemeProvider } from "@/lib/copilotkit/theme-provider";

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider>
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        enableInspector={false}
      >
        {children}
      </CopilotKit>
    </ThemeProvider>
  );
}
