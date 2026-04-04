"use client";

import { z } from "zod";
import { useTheme } from "@/lib/copilotkit/theme-provider";
import {
  useDefaultRenderTool,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { ToolReasoning } from "@/components/copilotkit/tool-rendering";

export const useGenerativeUIHooks = () => {
  const { theme, setTheme } = useTheme();

  useDefaultRenderTool({
    render: ({ name, status, parameters }) => {
      return <ToolReasoning name={name} status={status} args={parameters} />;
    },
  });

  useFrontendTool(
    {
      name: "toggleTheme",
      description: "Frontend tool for toggling the theme of the app.",
      parameters: z.object({}),
      handler: async () => {
        setTheme(theme === "dark" ? "light" : "dark");
      },
    },
    [theme, setTheme],
  );

  useFrontendTool(
    {
      name: "submitRareDiseaseAnswers",
      description:
        "Submit answers to rare disease scan follow-up questions. Answers are sent back to the agent for re-scanning.",
      parameters: z.object({
        answers: z.record(z.string()),
      }),
      handler: async ({ answers }) => {
        const { useCoAgent } = await import("@copilotkit/react-core");
        console.log("Rare disease answers submitted:", answers);
        return { success: true, answers };
      },
    },
    [],
  );
};
