"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { useCopilotKit } from "@copilotkit/react-core/v2";

type Section = "state" | "messages" | "imaging" | "connection";
type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<Section>>(
    new Set(["state", "messages", "imaging", "connection"])
  );
  const { agent } = useAgent();
  const copilotKit = useCopilotKit();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastPing, setLastPing] = useState<number | null>(null);

  useEffect(() => {
    if (!copilotKit) {
      setConnectionStatus("disconnected");
      setConnectionError("CopilotKit context not found");
      return;
    }

    const checkConnection = async () => {
      try {
        const start = Date.now();
        const langgraphUrl = process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123";
        const response = await fetch(langgraphUrl, {
          method: "GET",
        });

        const elapsed = Date.now() - start;
        setLastPing(elapsed);

        if (response.ok) {
          setConnectionStatus("connected");
          setConnectionError(null);
        } else {
          setConnectionStatus("error");
          setConnectionError(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch {
        setConnectionStatus("error");
        setConnectionError("LangGraph server not reachable");
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [copilotKit]);

  const toggleSection = useCallback((section: Section) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const stateKeys = useMemo(
    () => (agent.state ? Object.keys(agent.state) : []),
    [agent.state]
  );

  const messages = useMemo(
    () => agent.messages || [],
    [agent.messages]
  );

  const imaging = useMemo(
    () => (agent.state?.Imaging as Array<{ id: number; description: string }> | undefined) ?? [],
    [agent.state?.Imaging]
  );

  const connectionStatusConfig = useMemo(() => ({
    disconnected: { color: "text-muted-foreground", dot: "bg-muted-foreground", label: "Disconnected", animate: false },
    connecting: { color: "text-yellow-400", dot: "bg-yellow-400", label: "Connecting...", animate: true },
    connected: { color: "text-primary", dot: "bg-primary", label: "Connected", animate: false },
    error: { color: "text-destructive", dot: "bg-destructive", label: "Connection Error", animate: true },
  }), []);

  const statusConfig = connectionStatusConfig[connectionStatus];

  const sectionButton = useCallback((section: Section, label: string, color: string) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-muted rounded transition-colors"
    >
      <span className={color}>{label}</span>
      <span className="text-muted-foreground text-[10px]">
        {expandedSections.has(section) ? "▼" : "▶"}
      </span>
    </button>
  ), [toggleSection, expandedSections]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Toggle debug panel"
        className="fixed bottom-4 left-4 z-40 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-primary hover:bg-muted transition-colors text-xs font-mono"
        title="Toggle debug panel"
      >
        🐛
      </button>
    );
  }

  return (
    <aside
      role="complementary"
      aria-label="Debug panel"
      className="fixed top-0 right-0 w-96 h-full bg-card text-primary font-mono text-[11px] overflow-auto p-4 z-50 shadow-2xl border-l border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground text-sm tracking-wider">AGENT DEBUG</h3>
        <button
          aria-label="Close debug"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {sectionButton("connection", "Connection", "text-cyan-400")}
        {expandedSections.has("connection") && (
          <div className="bg-muted/40 rounded-lg p-3 space-y-2 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">LangGraph Server</span>
              <span className="text-yellow-400 truncate ml-2 max-w-[200px]">
                {process.env.NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${statusConfig.dot} ${statusConfig.animate ? "animate-pulse" : ""}`} />
                <span className={statusConfig.color}>{statusConfig.label}</span>
              </span>
            </div>
            {lastPing !== null && connectionStatus === "connected" && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Latency</span>
                <span className="text-primary">{lastPing}ms</span>
              </div>
            )}
            {connectionError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded p-2">
                <p className="text-destructive font-bold mb-1">Error:</p>
                <p className="text-destructive/80 break-all">{connectionError}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Agent Type</span>
              <span className="text-yellow-400">LangGraph</span>
            </div>
          </div>
        )}

        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-yellow-400 font-bold mb-2 text-xs uppercase tracking-wider">Agent Status</p>
          <div className="flex items-center gap-2">
            {agent.isRunning ? (
              <>
                <span className="inline-block h-3 w-3 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                <span className="text-yellow-400 font-bold">AGENT RUNNING</span>
              </>
            ) : connectionStatus === "disconnected" || connectionStatus === "error" ? (
              <>
                <span className="inline-block h-3 w-3 rounded-full bg-destructive" />
                <span className="text-destructive font-bold">AGENT UNREACHABLE</span>
              </>
            ) : (
              <>
                <span className="inline-block h-3 w-3 rounded-full bg-primary" />
                <span className="text-primary font-bold">AGENT IDLE</span>
              </>
            )}
          </div>
          {connectionStatus !== "connected" && connectionStatus !== "connecting" && (
            <p className="text-muted-foreground text-[10px] mt-2">
              {connectionStatus === "disconnected"
                ? "CopilotKit provider not initialized"
                : "Cannot determine agent status — connection failed"}
            </p>
          )}
        </div>

        {sectionButton("state", "State Keys", "text-purple-400")}
        {expandedSections.has("state") && (
          <div className="bg-muted/40 rounded-lg p-3">
            <pre className="text-[10px] text-foreground/70 overflow-x-auto whitespace-pre-wrap break-all">
              {stateKeys.length > 0 ? stateKeys.join(", ") : "(no state keys)"}
            </pre>
            <p className="text-muted-foreground mt-1 text-[10px]">
              {stateKeys.length} key{stateKeys.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {sectionButton("state", "Full Agent State", "text-cyan-400")}
        {expandedSections.has("state") && (
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-yellow-400 font-bold mb-2 text-xs uppercase tracking-wider">Full Agent State</p>
            <pre className="text-[10px] text-foreground/70 overflow-x-auto whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
              {agent.state ? JSON.stringify(agent.state, null, 2) : "(no state)"}
            </pre>
          </div>
        )}

        {sectionButton("imaging", `Imaging (${imaging.length} image${imaging.length !== 1 ? "s" : ""})`, "text-pink-400")}
        {expandedSections.has("imaging") && (
          <div className="bg-muted/40 rounded-lg p-3 space-y-2">
            {imaging.length === 0 ? (
              <p className="text-muted-foreground text-[10px]">(no images)</p>
            ) : (
              imaging.map((img) => (
                <div key={img.id} className="border border-border rounded p-2">
                  <p className="text-yellow-400 font-bold text-[10px]">#{img.id}</p>
                  <p className="text-foreground/70 text-[10px] mt-1">{img.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {sectionButton("messages", `Messages (${messages.length})`, "text-blue-400")}
        {expandedSections.has("messages") && (
          <div className="bg-muted/40 rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-[10px]">(no messages)</p>
            ) : (
              messages.map((msg: { id: string; role: string; content?: string | unknown }) => (
                <div key={msg.id} className="border border-border rounded p-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        msg.role === "user"
                          ? "bg-blue-500/20 text-blue-400"
                          : msg.role === "assistant"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {msg.role}
                    </span>
                  </div>
                  <p className="text-foreground/70 text-[10px] mt-1 line-clamp-3">
                    {typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
