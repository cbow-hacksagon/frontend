import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
import { NextRequest } from "next/server";

console.log("=== COPILOTKIT API ROUTE LOADED ===");
console.log("LANGGRAPH_DEPLOYMENT_URL:", process.env.LANGGRAPH_DEPLOYMENT_URL);
console.log("LANGSMITH_API_KEY set:", !!process.env.LANGSMITH_API_KEY);

const deploymentUrl = process.env.LANGGRAPH_DEPLOYMENT_URL || process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123";
console.log("Resolved deployment URL:", deploymentUrl);

const defaultAgent = new LangGraphAgent({
  deploymentUrl,
  graphId: "sample_agent",
  langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
});

export const POST = async (req: NextRequest) => {
  console.log("=== POST /api/copilotkit ===");
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  console.log("Using deployment URL:", deploymentUrl);

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: "/api/copilotkit",
    serviceAdapter: new ExperimentalEmptyAdapter(),
    runtime: new CopilotRuntime({
      agents: { default: defaultAgent },
    }),
  });

  return handleRequest(req);
};
