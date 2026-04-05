"use client";

import { useRef } from "react";
import { z } from "zod";
import { useTheme } from "@/lib/copilotkit/theme-provider";
import {
  useDefaultRenderTool,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { ToolReasoning } from "@/components/copilotkit/tool-rendering";

export const useGenerativeUIHooks = () => {
  const { theme, setTheme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

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
        const currentTheme = themeRef.current;
        setTheme(currentTheme === "dark" ? "light" : "dark");
      },
    },
    [setTheme],
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
        return { success: true, answers };
      },
    },
    [],
  );
};
