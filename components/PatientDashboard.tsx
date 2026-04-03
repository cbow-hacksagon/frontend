"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, Stethoscope, MessageSquare, Upload, 
  Calendar, Loader2, Search, Filter, 
  FileText, CheckCircle2, XCircle, ChevronRight
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// List of specialties matching the login page
const specialties = [
  "General Practitioner",
  "Rare Disease Specialist",
  "Cardiologist",
  "Neurologist",
  "Oncologist",
  "Pediatrician",
  "Dermatologist",
  "Radiologist",
  "Genetics Specialist"
]

// Component to find and select a doctor
function FindDoctor({ patientId, onAssign }: { patientId: string, onAssign: () => void }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("")
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      let query = supabase.from("profiles").select("id, full_name, specialization, license_number").eq("role", "doctor")
      if (selectedSpecialty) {
        query = query.eq("specialization", selectedSpecialty)
      }
      const { data, error } = await query
      if (error) console.error(error)
      else setDoctors(data || [])
      setLoading(false)
    }
    fetchDoctors()
  }, [selectedSpecialty, supabase])

  const assignDoctor = async (doctorId: string) => {
    const { error } = await supabase.from("patient_doctors").insert({
      patient_id: patientId,
      doctor_id: doctorId
    })
    if (error) {
      if (error.code === '23505') alert("This doctor is already in your list.")
      else console.error(error)
    } else {
      onAssign()
    }
  }

  return (
    <Card className="mb-8 border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center"><Search className="mr-2 w-5 h-5"/> Find a Specialist</h2>
        <div className="flex gap-2">
          <select 
            value={selectedSpecialty} 
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="bg-slate-800 text-xs border-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <Loader2 className="animate-spin mb-2" />
              <span className="text-sm font-medium">Searching clinicians...</span>
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">No doctors found for this specialty.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-3">Doctor Name</th>
                  <th className="px-6 py-3">Specialization</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{doc.full_name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{doc.license_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-extrabold uppercase">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="ghost" onClick={() => assignDoctor(doc.id)} className="text-blue-600 font-bold hover:bg-blue-100 transition-all">
                        Assign <ChevronRight className="ml-1 w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Component to upload medical reports with Dropbox style
function ReportDropbox({ patientId }: { patientId: string }) {
  const [uploading, setUploading] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [dragActive, setDragActive] = useState(false)
  const supabase = createClient()

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("id, file_url, file_name, uploaded_at")
      .eq("patient_id", patientId)
      .order("uploaded_at", { ascending: false })
    if (error) console.error(error)
    else setReports(data ?? [])
  }

  useEffect(() => {
    fetchReports()
  }, [patientId])

  const handleUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${patientId}/${Date.now()}.${fileExt}`
    
    // Check if bucket exists implies handle in real world
    const { error: uploadError } = await supabase.storage.from('reports').upload(fileName, file)
    
    if (uploadError) {
      console.error(uploadError)
      alert("Upload failed. Make sure the 'reports' bucket exists in Supabase.")
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('reports').getPublicUrl(fileName)
    
    const { error: dbError } = await supabase.from('reports').insert({ 
      patient_id: patientId, 
      file_url: publicUrl, 
      file_name: file.name 
    })
    
    if (dbError) console.error(dbError)
    await fetchReports()
    setUploading(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <Card className="mb-8 border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center text-slate-800"><Upload className="mr-2 text-blue-600"/>Medical Report Repository</h2>
        
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragActive ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
          }`}
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-2" />
              <p className="text-blue-700 font-bold">Uploading Diagnostic Data...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 text-blue-600">
                <FileText size={24} />
              </div>
              <p className="text-sm font-bold text-slate-900">Drag & Drop reports here</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Supports PDF, JPG, PNG (Max 10MB)</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Your Recent Uploads</h3>
          {reports.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No reports archived yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mr-3 shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{r.file_name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{new Date(r.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <a 
                    href={r.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MyDoctorsList({ patientId, refreshTrigger }: { patientId: string, refreshTrigger: number }) {
  const [doctors, setDoctors] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchMyDoctors = async () => {
      // Joining patient_doctors with profiles
      const { data, error } = await supabase
        .from("patient_doctors")
        .select(`
          doctor_id,
          doctor:profiles!doctor_id(full_name, specialization)
        `)
        .eq("patient_id", patientId)
      if (error) console.error(error)
      else setDoctors(data || [])
    }
    fetchMyDoctors()
  }, [patientId, refreshTrigger, supabase])

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center text-slate-800"><Stethoscope className="mr-2 text-blue-600"/> Your Clinical Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.length === 0 ? (
          <div className="col-span-full p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-500 italic">
            You haven't assigned any doctors yet. Use the search above to find a specialist.
          </div>
        ) : (
          doctors.map((item, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {item.doctor?.full_name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.doctor?.full_name}</p>
                    <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-tighter">{item.doctor?.specialization}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild className="rounded-lg h-8 border-slate-200 text-slate-600 hover:bg-slate-50">
                  <a href="/chat"><MessageSquare size={14} className="mr-1.5" /> Chat</a>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default function PatientDashboard() {
  const [patientId, setPatientId] = useState<string>("")
  const [refreshDoctors, setRefreshDoctors] = useState(0)
  const [activeTab, setActiveTab] = useState<'portal' | 'appointments' | 'chat'>('portal')
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setPatientId(user.id)
    }
    fetchUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!patientId) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden lg:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 font-bold shadow-lg shadow-blue-600/20">H</div>
          <span className="text-xl font-bold tracking-tight">HouseMedi</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('portal')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'portal' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-5 h-5 mr-3 shrink-0" />
            Patient Portal
          </button>
          <Link href="/chat" className="flex items-center px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors">
            <MessageSquare className="w-5 h-5 mr-3 shrink-0" />
            Direct Messages
          </Link>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'appointments' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Calendar className="w-5 h-5 mr-3 shrink-0" />
            Appointments
          </button>
        </nav>
        <div className="p-4 border-t border-white/10 shrink-0">
           <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-all">
             <XCircle className="w-5 h-5 mr-3 shrink-0" />
             Sign Out
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'portal' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Dashboard</h1>
                <p className="text-slate-500 font-medium mt-1">Manage your health data and clinical assignments.</p>
              </header>

              <MyDoctorsList patientId={patientId} refreshTrigger={refreshDoctors} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                  <FindDoctor patientId={patientId} onAssign={() => setRefreshDoctors(p => p + 1)} />
                </div>
                <div>
                  <ReportDropbox patientId={patientId} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'appointments' && (
             <div className="max-w-2xl mx-auto py-20 text-center text-slate-500 bg-white border border-dashed border-slate-200 rounded-3xl p-12">
                <Calendar size={64} className="mx-auto mb-6 opacity-20" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Appointment Scheduling</h3>
                <p>The centralized booking system is currently undergoing synchronization with external hospital calendars. Check back soon.</p>
             </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  )
}
