"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowLeft } from "lucide-react";

export default function ChatRedirectPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(1.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    const timer = setTimeout(() => {
      router.replace("/");
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="bg-card border border-border rounded-3xl p-12 shadow-2xl flex flex-col items-center max-w-sm mx-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">Select a Patient</h2>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Choose a patient from the registry to start a chat session.
        </p>
        <div className="w-full bg-muted rounded-full h-1.5 mb-4 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${((1.5 - countdown) / 1.5) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Redirecting in {countdown.toFixed(1)}s
        </p>
        <button
          onClick={() => router.replace("/")}
          className="mt-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back now
        </button>
      </div>
    </div>
  );
}
