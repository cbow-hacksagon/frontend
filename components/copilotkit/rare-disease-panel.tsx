"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FlaskConical,
  Stethoscope,
  Pill,
  Ban,
  X,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MissingSymptoms {
  askable: string[];
  diagnostic_tests: string[];
}

interface RareDiseaseMatch {
  disease_name: string;
  umls_cui: string;
  mondo_id: string;
  confidence: number;
  llm_judgment: string;
  llm_reasoning: string;
  symptom_overlap_score: number;
  matching_symptoms: string[];
  missing_symptoms: MissingSymptoms;
  relevant_treatments: string[];
  contraindicated_treatments: string[];
  rag_evidence_snippets: string[];
}

interface RareDiseaseResults {
  rare_disease_matches: RareDiseaseMatch[];
  scan_summary: string;
  recommendation: string;
  has_askable_symptoms: boolean;
  askable_questions: string[];
  plausible_count: number;
  uncertain_count: number;
}

interface RareDiseasePanelProps {
  results: RareDiseaseResults;
  onSubmitAnswers?: (answers: Record<string, string>) => void;
  onDismiss?: () => void;
}

function confidenceColor(confidence: number): string {
  if (confidence >= 0.7) return "text-emerald-400";
  if (confidence >= 0.4) return "text-amber-400";
  return "text-muted-foreground";
}

function judgmentBadge(judgment: string): { icon: React.ReactNode; color: string; bg: string; label: string } {
  if (judgment === "plausible") {
    return {
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      color: "text-amber-300",
      bg: "bg-amber-500/10 border-amber-500/20",
      label: "Flag for Review",
    };
  }
  if (judgment === "uncertain") {
    return {
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      color: "text-blue-300",
      bg: "bg-blue-500/10 border-blue-500/20",
      label: "Uncertain",
    };
  }
  return {
    icon: <X className="w-3.5 h-3.5" />,
    color: "text-muted-foreground",
    bg: "bg-muted/30 border-border",
    label: "Unlikely",
  };
}

function DiseaseCard({
  match,
  index,
}: {
  match: RareDiseaseMatch;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const badge = judgmentBadge(match.llm_judgment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${badge.bg} ${badge.color}`}>
            {badge.icon}
            {badge.label}
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm tracking-tight">
              {match.disease_name}
            </h4>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              UMLS: {match.umls_cui} | MONDO: {match.mondo_id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-lg font-bold ${confidenceColor(match.confidence)}`}>
              {Math.round(match.confidence * 100)}%
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">
              Match
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
              {match.llm_reasoning && (
                <div className="bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {match.llm_reasoning}
                  </p>
                </div>
              )}

              {match.matching_symptoms.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Matching Symptoms ({match.matching_symptoms.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {match.matching_symptoms.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {match.missing_symptoms.diagnostic_tests.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Recommended Tests
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {match.missing_symptoms.diagnostic_tests.map((t) => (
                      <li
                        key={t}
                        className="text-xs text-foreground/70 flex items-start gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {match.missing_symptoms.askable.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Additional Symptoms to Ask About
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {match.missing_symptoms.askable.map((s) => (
                      <li
                        key={s}
                        className="text-xs text-foreground/70 flex items-start gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {match.relevant_treatments.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Pill className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Relevant Treatments
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {match.relevant_treatments.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md text-[10px] font-bold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {match.contraindicated_treatments.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Ban className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Contraindicated
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {match.contraindicated_treatments.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-md text-[10px] font-bold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {match.rag_evidence_snippets.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Evidence from Case Reports
                    </span>
                  </div>
                  <div className="space-y-2">
                    {match.rag_evidence_snippets.map((snippet, i) => (
                      <p
                        key={i}
                        className="text-[11px] text-muted-foreground italic leading-relaxed bg-muted/20 rounded-lg p-2.5"
                      >
                        "{snippet}"
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AskableQuestions({
  questions,
  onSubmit,
}: {
  questions: string[];
  onSubmit: (answers: Record<string, string>) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-amber-500/20 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-amber-400" />
        <h3 className="font-bold text-foreground text-sm tracking-tight">
          Additional Questions
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        These questions may help clarify whether a rare disease consideration is relevant.
      </p>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/80">
              {q}
            </label>
            <input
              type="text"
              value={answers[q] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q]: e.target.value }))
              }
              placeholder="Your answer..."
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none transition-all"
            />
          </div>
        ))}
      </div>
      <Button
        onClick={handleSubmit}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 rounded-xl gap-2 text-sm"
      >
        <Send className="w-4 h-4" />
        Submit Answers
      </Button>
    </motion.div>
  );
}

export function RareDiseasePanel({
  results,
  onSubmitAnswers,
  onDismiss,
}: RareDiseasePanelProps) {
  const { rare_disease_matches, scan_summary, recommendation, has_askable_symptoms, askable_questions } = results;

  const hasMatches = rare_disease_matches.length > 0;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-foreground text-sm tracking-tight">
            Rare Disease Scan
          </h3>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="bg-muted/30 rounded-xl p-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {scan_summary}
        </p>
      </div>

      {hasMatches && (
        <div className="space-y-3">
          {rare_disease_matches.map((match, i) => (
            <DiseaseCard key={match.disease_name + i} match={match} index={i} />
          ))}
        </div>
      )}

      {!hasMatches && (
        <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">No Rare Disease Flags</p>
          <p className="text-xs text-muted-foreground mt-1">
            The scan did not identify any rare diseases worth flagging for this case.
          </p>
        </div>
      )}

      {has_askable_symptoms && askable_questions.length > 0 && onSubmitAnswers && (
        <AskableQuestions questions={askable_questions} onSubmit={onSubmitAnswers} />
      )}

      {recommendation && recommendation !== "No specific recommendations at this time." && (
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Recommendation
            </span>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            {recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
