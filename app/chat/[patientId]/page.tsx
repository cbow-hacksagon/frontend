"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGenerativeUIHooks } from "@/lib/copilotkit/generative-ui-hooks";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { useCoAgent } from "@copilotkit/react-core";
import { ImageChatPopup } from "@/components/copilotkit/ImageChatPopup";
import { DebugPanel } from "@/components/copilotkit/debug-panel";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";

interface AgentState {
  patient_id?: string;
  patient_name?: string;
  Imaging?: Array<{ id: number; base64: string; mimeType: string; description: string }>;
}

export default function PatientChatPage() {
  useGenerativeUIHooks();
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  const [patientName, setPatientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { state, setState } = useCoAgent<AgentState>({
    name: "default",
    initialState: { Imaging: [] },
  });

  useEffect(() => {
    const fetchPatient = async () => {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("patients")
        .select("full_name")
        .eq("id", patientId)
        .single();

      if (err || !data) {
        setError(true);
        setLoading(false);
        return;
      }

      setPatientName(data.full_name);
      setState({
        patient_id: patientId,
        patient_name: data.full_name,
        Imaging: [],
      });
      setLoading(false);
    };

    fetchPatient();
  }, [patientId, setState]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Loading patient context...</p>
      </div>
    );
  }

  if (error || !patientName) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="bg-card border border-border rounded-3xl p-12 shadow-2xl flex flex-col items-center max-w-sm mx-4">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
            <MessageSquare className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">Patient Not Found</h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            This patient record doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.replace("/")}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Registry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen">
      <header className="flex items-center gap-3 px-6 py-4 bg-card border-b border-border shrink-0">
        <button
          onClick={() => router.push("/")}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20">
          {patientName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-sm tracking-tight">{patientName}</span>
          <span className="text-[10px] text-muted-foreground font-mono">ID: {patientId.slice(0, 8)}</span>
        </div>
      </header>

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
