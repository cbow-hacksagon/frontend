"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, X, Search, 
  Menu, CheckCircle2, 
  ShieldCheck, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

/**
 * @file DoctorDashboard Refactor
 * Implements Patient Registry and Clinical Profile workflow.
 */
import AddPatientModal from "@/components/AddPatientModal"
import PatientProfile from "@/components/PatientProfile"

export default function HomePage() {
  return <DoctorDashboard />
}

function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'registry' | 'settings'>('registry')
  const [doctorId, setDoctorId] = useState<string>("")
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  
  const supabase = createClient()

  const fetchPatients = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setDoctorId(user.id)
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (!error && data) {
        setPatients(data)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPatients()
    setMounted(true)
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100 selection:bg-blue-500/30">
      {/* Sidebar - PathRad Style */}
      <motion.aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-20 flex items-center px-8 border-b border-white/5 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 font-bold shadow-lg shadow-blue-600/20 text-white">H</div>
          <span className="text-xl font-bold tracking-tighter">HouseMedi<span className="text-blue-500">.</span></span>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          {[
            { id: 'registry', icon: <Users className="w-5 h-5" />, label: 'Patient Registry' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any)
                setSelectedPatient(null)
              }}
              className={`w-full flex items-center px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === item.id && !selectedPatient ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0">
           <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-500/80 hover:bg-red-500/10 rounded-xl font-bold transition-all">
             <X className="w-5 h-5 mr-3 shrink-0" />
             Sign Out
           </button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-20 bg-slate-900 border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-800 rounded-md" onClick={() => setSidebarOpen(true)}>
               <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight capitalize">
              {selectedPatient ? "Clinical Subject Profile" : activeTab}
            </h1>
            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
            <div className="relative group hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search medical records..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-10 pr-4 rounded-full bg-slate-950 border border-white/5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs w-64 transition-all placeholder:text-slate-600 text-white" 
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xl shadow-blue-500/10 border border-white/10">DR</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              {selectedPatient ? (
                <motion.div 
                  key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <PatientProfile patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
                </motion.div>
              ) : activeTab === 'registry' ? (
                <motion.div 
                  key="registry" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-white tracking-tighter">Clinical Registry</h2>
                     <Button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-2xl shadow-xl shadow-blue-600/20 px-6 gap-2"
                     >
                        Register New Subject <Users size={18}/>
                     </Button>
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950/50 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                        <tr>
                          <th className="px-8 py-6">Medical Name</th>
                          <th className="px-8 py-6">Stats</th>
                          <th className="px-8 py-6">Clinical Center</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {loading ? (
                           <tr><td colSpan={4} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 w-8 h-8" /></td></tr>
                        ) : filteredPatients.length === 0 ? (
                           <tr><td colSpan={4} className="p-12 text-center text-slate-500 italic font-medium py-20">No subjects found in registry. Add a new patient to begin documentation.</td></tr>
                        ) : (
                          filteredPatients.map(p => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedPatient(p)}>
                               <td className="px-8 py-5">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-white/5 shadow-inner">
                                       {p.full_name?.charAt(0)}
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tighter text-lg">{p.full_name}</span>
                                        <span className="text-[10px] font-mono text-slate-600">ID: {p.id.slice(0,8)}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-5">
                                 <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <span className="bg-white/5 px-2 py-1 rounded-md">{p.age}Y</span>
                                    <span className="bg-white/5 px-2 py-1 rounded-md">{p.sex}</span>
                                 </div>
                               </td>
                               <td className="px-8 py-5 text-sm font-bold text-slate-500 italic">{p.location || "Global Registry"}</td>
                               <td className="px-8 py-5 text-right">
                                  <Button size="sm" variant="ghost" className="rounded-xl font-bold text-slate-400 hover:text-white hover:bg-blue-600 transition-all px-4">Initialize Profile</Button>
                               </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-40 text-slate-500 font-bold uppercase tracking-widest opacity-20">
                   Clinic Settings Under Maintenance
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Add Patient Modal */}
      {showAddModal && (
        <AddPatientModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            fetchPatients();
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; hright: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  )
}
