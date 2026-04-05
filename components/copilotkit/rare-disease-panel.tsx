"use client";

import { memo, useCallback, useState } from "react";
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
  FilterX,
  Link2Off,
  Database,
  Percent,
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

interface FlaggedDisease {
  disease_name: string;
  umls_cui: string;
  mondo_id: string | null;
  status: "selected" | "eliminated";
  elimination_stage: string | null;
  elimination_reason: string | null;
  confidence: number;
  symptom_overlap_score: number;
  llm_judgment: string | null;
  llm_reasoning: string | null;
}

interface RareDiseaseResults {
  rare_disease_matches: RareDiseaseMatch[];
  all_flagged_diseases: FlaggedDisease[];
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

const eliminationStageConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  no_mondo_mapping: {
    icon: <Link2Off className="w-3 h-3" />,
    label: "No MONDO Mapping",
    color: "text-muted-foreground",
    bg: "bg-muted/30 border-border",
  },
  no_symptoms_in_kg: {
    icon: <Database className="w-3 h-3" />,
    label: "No KG Symptoms",
    color: "text-muted-foreground",
    bg: "bg-muted/30 border-border",
  },
  no_symptom_overlap: {
    icon: <Percent className="w-3 h-3" />,
    label: "No Symptom Overlap",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  llm_judged_implausible: {
    icon: <FilterX className="w-3 h-3" />,
    label: "Judged Implausible",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
};

const DiseaseCard = memo(function DiseaseCard({
  match,
  index,
}: {
  match: RareDiseaseMatch;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const badge = judgmentBadge(match.llm_judgment);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={toggleExpanded}
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
}, (prev, next) => prev.match === next.match && prev.index === next.index);

const EliminatedDiseaseCard = memo(function EliminatedDiseaseCard({
  disease,
  index,
}: {
  disease: FlaggedDisease;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const stageConfig = eliminationStageConfig[disease.elimination_stage || ""] || {
    icon: <FilterX className="w-3 h-3" />,
    label: "Eliminated",
    color: "text-muted-foreground",
    bg: "bg-muted/30 border-border",
  };

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card/50 border border-border/50 rounded-2xl overflow-hidden"
    >
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${stageConfig.bg} ${stageConfig.color}`}>
            {stageConfig.icon}
            {stageConfig.label}
          </div>
          <div>
            <h4 className="font-semibold text-foreground/70 text-sm tracking-tight">
              {disease.disease_name}
            </h4>
            <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
              UMLS: {disease.umls_cui}
              {disease.mondo_id ? ` | MONDO: ${disease.mondo_id}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-sm font-bold ${confidenceColor(disease.confidence)}`}>
              {Math.round(disease.confidence * 100)}%
            </div>
            <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-bold">
              FAISS
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
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Elimination Reason
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {disease.elimination_reason}
                </p>
              </div>

              {disease.symptom_overlap_score > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Symptom Overlap
                  </span>
                  <span className="text-xs text-foreground/70">
                    {Math.round(disease.symptom_overlap_score * 100)}%
                  </span>
                </div>
              )}

              {disease.llm_judgment && disease.llm_reasoning && (
                <div className="bg-muted/20 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    LLM Assessment
                  </span>
                  <p className="text-xs text-muted-foreground/80 italic leading-relaxed mt-1">
                    "{disease.llm_reasoning}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const AskableQuestions = memo(function AskableQuestions({
  questions,
  onSubmit,
}: {
  questions: string[];
  onSubmit: (answers: Record<string, string>) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(() => {
    onSubmit(answers);
  }, [onSubmit, answers]);

  const handleAnswerChange = useCallback((q: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [q]: value }));
  }, []);

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
              onChange={(e) => handleAnswerChange(q, e.target.value)}
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
});

export const RareDiseasePanel = memo(function RareDiseasePanel({
  results,
  onSubmitAnswers,
  onDismiss,
}: RareDiseasePanelProps) {
  const { rare_disease_matches, all_flagged_diseases, scan_summary, recommendation, has_askable_symptoms, askable_questions } = results;

  const [activeTab, setActiveTab] = useState<"selected" | "eliminated">("selected");

  const eliminated = (all_flagged_diseases || []).filter(d => d.status === "eliminated");
  const selected = rare_disease_matches;

  const hasMatches = selected.length > 0;
  const hasEliminated = eliminated.length > 0;

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

      {hasMatches || hasEliminated ? (
        <>
          <div className="flex gap-1 bg-muted/30 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("selected")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "selected"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              Selected ({selected.length})
            </button>
            <button
              onClick={() => setActiveTab("eliminated")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "eliminated"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              Eliminated ({eliminated.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "selected" && (
              <motion.div
                key="selected"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                {selected.map((match, i) => (
                  <DiseaseCard key={match.disease_name + i} match={match} index={i} />
                ))}
              </motion.div>
            )}
            {activeTab === "eliminated" && (
              <motion.div
                key="eliminated"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                {eliminated.map((disease, i) => (
                  <EliminatedDiseaseCard key={disease.disease_name + disease.umls_cui + i} disease={disease} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
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
});
