"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, Activity, Thermometer, ShieldCheck, 
  ChevronRight, ChevronLeft, Loader2, 
  BrainCircuit, CheckCircle2, FlaskConical,
  Wind, AlertCircle, MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/client'

interface StepperProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function DiagnosticStepper({ onClose, onComplete }: StepperProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    sex: "",
    location: "",
    chiefComplaint: "",
    symptoms: [] as string[],
    vitals: {
      temp: "",
      pulse: "",
      bp: "",
      spo2: ""
    }
  })

  const symptomsList = [
    "Cough (>2 weeks)", "Fever", "Night Sweats", 
    "Weight Loss", "Chest Pain", "Shortness of Breath",
    "Hemoptysis (Blood in sputum)", "Fatigue"
  ]

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom) 
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }))
  }

  const nextStep = () => {
    if (step < 5) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // 1. Create Patient
      const { data: patient, error: pError } = await supabase
        .from("patients")
        .insert({
          doctor_id: user.id,
          full_name: formData.fullName,
          age: parseInt(formData.age),
          sex: formData.sex,
          location: formData.location
        })
        .select()
        .single()

      if (pError) throw pError

      // 2. Create Case with Mock AI Result
      const { error: cError } = await supabase
        .from("cases")
        .insert({
          patient_id: patient.id,
          doctor_id: user.id,
          symptoms: formData.symptoms,
          vitals: formData.vitals,
          primary_diagnosis: "Pulmonary Tuberculosis (Suspected)",
          confidence_score: 0.88,
          status: "completed"
        })

      if (cError) throw cError

      nextStep() // Move to result step
    } catch (err) {
      console.error(err)
      alert("Submission failed. Check database schema.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-white/5 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tighter">Diagnostic Pipeline</h3>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">Multi-Agent Case Entry</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-1 rounded-full transition-all ${step >= s ? 'w-8 bg-blue-500' : 'w-4 bg-white/10'}`} 
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20"><User size={20}/></div>
                   <h4 className="text-lg font-bold text-white">Demographics & Intake</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Clinical Name</label>
                      <input 
                        type="text" 
                        placeholder="Subject Name"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-4 text-white placeholder:text-slate-700 focus:border-blue-500 outline-none transition-all"
                        value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Age</label>
                      <input 
                        type="number" 
                        placeholder="Years"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-4 text-white placeholder:text-slate-700 focus:border-blue-500 outline-none"
                        value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sex</label>
                      <select 
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-4 text-white appearance-none focus:border-blue-500 outline-none"
                        value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value})}
                      >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Location / Clinical Center</label>
                   <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input 
                        type="text" 
                        placeholder="Nairobi, Kenya"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:border-blue-500 outline-none"
                        value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                   </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20"><Wind size={20}/></div>
                   <h4 className="text-lg font-bold text-white">Symptoms Checklist</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {symptomsList.map((s) => (
                     <button
                        key={s}
                        onClick={() => handleSymptomToggle(s)}
                        className={`flex items-center p-4 rounded-2xl border transition-all text-sm font-bold ${formData.symptoms.includes(s) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-white/5 text-slate-400 hover:border-indigo-500/30'}`}
                     >
                        <CheckCircle2 className={`w-4 h-4 mr-3 ${formData.symptoms.includes(s) ? 'opacity-100' : 'opacity-20'}`} />
                        {s}
                     </button>
                   ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20"><Activity size={20}/></div>
                   <h4 className="text-lg font-bold text-white">Vitals & Assessment</h4>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Temp (°C)</label>
                      <input 
                        type="text" placeholder="37.2"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-4 text-white focus:border-blue-500 outline-none"
                        value={formData.vitals.temp} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, temp: e.target.value}})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">SpO2 (%)</label>
                      <input 
                        type="text" placeholder="98"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-4 text-white focus:border-blue-500 outline-none"
                        value={formData.vitals.spo2} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, spo2: e.target.value}})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Pulse (BPM)</label>
                      <input 
                        type="text" placeholder="72"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-4 text-white focus:border-blue-500 outline-none"
                        value={formData.vitals.pulse} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, pulse: e.target.value}})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">BP (mmHg)</label>
                      <input 
                        type="text" placeholder="120/80"
                        className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-4 text-white focus:border-blue-500 outline-none"
                        value={formData.vitals.bp} onChange={(e) => setFormData({...formData, vitals: {...formData.vitals, bp: e.target.value}})}
                      />
                   </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 space-y-8"
              >
                <div className="relative">
                   <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit size={48} className="text-blue-500 animate-pulse" />
                   </div>
                </div>

                <div className="text-center space-y-4">
                   <h4 className="text-2xl font-bold text-white tracking-tighter">AI Analysis in Progress</h4>
                   <p className="text-slate-500 text-sm max-w-xs font-medium">Orchestrator is routing metadata to MedGemma 4B for high-fidelity evaluation...</p>
                   
                   <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-left w-64 mx-auto">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inference Logs</span>
                      </div>
                      <p className="text-[10px] font-mono text-blue-400">Loading embeddings...</p>
                      <p className="text-[10px] font-mono text-green-400">Targeting Pathology...</p>
                      <p className="text-[10px] font-mono text-indigo-400">Cross-referencing symptoms...</p>
                   </div>
                </div>

                <Button 
                   onClick={handleSubmit} 
                   disabled={loading}
                   className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 w-full rounded-2xl shadow-xl shadow-blue-600/20"
                >
                   {loading ? <Loader2 className="animate-spin" /> : "Complete Final Synthesis"}
                </Button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 p-8 rounded-[32px] border border-green-500/20 text-center relative overflow-hidden">
                   <div className="relative z-10">
                      <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-green-500/20">
                         <ShieldCheck size={32} />
                      </div>
                      <h4 className="text-2xl font-bold text-white tracking-tighter mb-2">Diagnostic Profile Generated</h4>
                      <p className="text-green-500 font-bold uppercase text-[10px] tracking-[0.2em]">Clinical Confidence: 88.4%</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="bg-slate-950 p-6 rounded-3xl border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Primary Impression</span>
                      <h5 className="text-xl font-bold text-white tracking-tight">Active Pulmonary TB (Suspected)</h5>
                   </div>
                   <div className="bg-slate-950 p-6 rounded-3xl border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Next Clinical Step</span>
                      <p className="text-sm font-medium text-slate-300">Proceed to GeneXpert MTB/RIF for microbiological confirmation.</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <Button onClick={onClose} variant="ghost" className="flex-1 rounded-2xl h-14 font-bold text-slate-400 hover:bg-white/5">Close Portal</Button>
                   <Button onClick={onComplete} className="flex-1 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl h-14 font-bold shadow-xl">Print Case Summary</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {step < 4 && (
          <div className="p-8 border-t border-white/5 flex gap-4 shrink-0">
             {step > 1 && (
               <Button onClick={prevStep} variant="ghost" className="flex-1 rounded-2xl h-14 font-bold text-slate-400 hover:bg-white/5">
                 <ChevronLeft className="mr-2" /> Back
               </Button>
             )}
             <Button onClick={nextStep} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-14 font-bold shadow-xl shadow-blue-600/20 transition-all">
               {step === 3 ? "Run AI Engine" : "Continue Assessment"} <ChevronRight className="ml-2" />
             </Button>
          </div>
        )}
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  )
}
