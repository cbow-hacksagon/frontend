"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, Calendar, MapPin, FileText, 
  Upload, CheckCircle2, Loader2, ArrowLeft,
  X, ExternalLink, Activity, Thermometer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/client'

interface PatientProfileProps {
  patient: any;
  onBack: () => void;
}

export default function PatientProfile({ patient, onBack }: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState<'records' | 'history'>('records')
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [records, setRecords] = useState<any[]>([])
  const [uploads, setUploads] = useState<{ [key: string]: File | null }>({
    blood: null,
    xray: null,
    lab: null
  })
  
  const supabase = createClient()

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("cases")
      .select(`
        *,
        reports:reports(*)
      `)
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: false })
    
    if (!error && data) setRecords(data)
  }

  useEffect(() => {
    fetchHistory()
  }, [patient.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      setUploads(prev => ({ ...prev, [type]: e.target.files![0] }))
    }
  }

  const handleSaveRecord = async () => {
    if (!notes && !Object.values(uploads).some(v => v)) {
      return alert("Please enter notes or upload a file.")
    }
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // 1. Create the Case (Note Entry)
      const { data: newCase, error: caseError } = await supabase
        .from("cases")
        .insert({
          patient_id: patient.id,
          doctor_id: user.id,
          notes: notes,
          status: "completed"
        })
        .select()
        .single()

      if (caseError) throw caseError

      // 2. Upload Files and link to Case
      for (const [type, file] of Object.entries(uploads)) {
        if (file) {
          const fileName = `${Date.now()}_${file.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("reports") // Ensure this bucket exists in Supabase Storage
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage.from("reports").getPublicUrl(fileName)

          // Insert into reports table
          await supabase.from("reports").insert({
            case_id: newCase.id,
            patient_id: patient.id,
            doctor_id: user.id,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: file.type,
            category: type.charAt(0).toUpperCase() + type.slice(1)
          })
        }
      }

      setNotes("")
      setUploads({ blood: null, xray: null, lab: null })
      fetchHistory()
      alert("✅ Record saved successfully.")
    } catch (err: any) {
      console.error("Clinical Record Error:", err)
      const errorMsg = err.message || "Unknown error"
      
      if (errorMsg.includes("storage")) {
        alert("❌ Storage Error: Please ensure you have created the 'reports' bucket in Supabase Storage and set it to Public.")
      } else if (errorMsg.includes("relation") || errorMsg.includes("column")) {
        alert("❌ Database Error: Please ensure you have applied the latest SQL schema (including the 'notes' column).")
      } else {
        alert(`❌ Save Failed: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-8 pb-20">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-slate-900 border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
            <ArrowLeft className="text-slate-400" />
          </button>
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-blue-600/20">
            {patient.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tighter">{patient.full_name}</h2>
            <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Calendar size={12}/> {patient.age} YRS</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="flex items-center gap-1.5"><User size={12}/> {patient.sex}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="flex items-center gap-1.5 text-blue-500"><MapPin size={12}/> {patient.location}</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-right opacity-50">
           <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resident ID</p>
              <p className="text-sm font-mono text-white">#PAT-{patient.id.slice(0,8)}</p>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] pointer-events-none" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-3xl w-fit border border-white/5 self-center lg:self-start">
        <button 
          onClick={() => setActiveTab('records')}
          className={`px-8 py-3 rounded-2xl font-bold transition-all text-sm ${activeTab === 'records' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Clinical Records
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-8 py-3 rounded-2xl font-bold transition-all text-sm ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Entry History ({records.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'records' ? (
          <motion.div 
            key="records" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Medical Notes */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                     <FileText size={18} className="text-blue-500" />
                     Medical Documentation
                   </h3>
                   <span className="text-[10px] font-bold text-blue-500 uppercase">Real-time Persistence</span>
                </div>
                <textarea 
                  placeholder="Enter clinical observations, symptoms, and medical notes here..."
                  className="w-full h-64 bg-slate-950 border border-white/5 rounded-3xl p-6 text-white placeholder:text-slate-700 focus:border-blue-500 outline-none transition-all resize-none font-medium"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSaveRecord}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-16 rounded-3xl shadow-2xl flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Save Medical Record <CheckCircle2 size={18}/></>}
              </Button>
            </div>

            {/* Asset Uploads */}
            <div className="space-y-6">
               {[
                 { id: 'blood', label: 'Blood Report', icon: <Activity className="text-red-500" /> },
                 { id: 'xray', label: 'Chest X-ray', icon: <Thermometer className="text-blue-500" /> },
                 { id: 'lab', label: 'Laboratory Results', icon: <ExternalLink className="text-indigo-500" /> }
               ].map((asset) => (
                 <div key={asset.id} className="bg-slate-900 border border-white/5 p-6 rounded-[32px] group relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                            {asset.icon}
                          </div>
                          <span className="font-bold text-white text-sm">{asset.label}</span>
                       </div>
                    </div>
                    <label className="block w-full border-2 border-dashed border-white/5 rounded-2xl p-4 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all">
                       <input type="file" className="hidden" onChange={(e) => handleFileChange(e, asset.id)} />
                       {uploads[asset.id] ? (
                          <span className="text-xs font-bold text-blue-500 truncate block px-4">{uploads[asset.id]?.name}</span>
                       ) : (
                          <div className="flex items-center justify-center gap-2 text-slate-500 group-hover:text-slate-300">
                             <Upload size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Select Asset</span>
                          </div>
                       )}
                    </label>
                 </div>
               ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
             {records.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 border border-dashed border-white/5 rounded-[40px] text-slate-600 italic">
                  No historical data found for this clinical subject.
                </div>
             ) : (
               records.map((rec) => (
                 <div key={rec.id} className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Observation Log</span>
                          <span className="text-xs font-bold text-slate-500">{new Date(rec.created_at).toLocaleString()}</span>
                       </div>
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">{rec.notes}</p>
                    {rec.reports && rec.reports.length > 0 && (
                      <div className="flex flex-wrap gap-4 pt-4">
                         {rec.reports.map((rep: any) => (
                           <a 
                             key={rep.id} href={rep.file_url} target="_blank" rel="noreferrer"
                             className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-2xl hover:bg-white/10 transition-all group"
                           >
                              <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                <FileText size={14} />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-white truncate max-w-[150px]">{rep.file_name}</span>
                                 <span className="text-[8px] font-bold text-slate-600 uppercase">{rep.category}</span>
                              </div>
                              <ExternalLink size={12} className="text-slate-500 group-hover:text-white" />
                           </a>
                         ))}
                      </div>
                    )}
                 </div>
               ))
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
