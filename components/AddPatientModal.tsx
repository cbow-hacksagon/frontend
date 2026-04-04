"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  User, X, MapPin, 
  ChevronRight, Loader2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/client'

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPatientModal({ onClose, onSuccess }: ModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    sex: "",
    location: ""
  })

  const handleSubmit = async () => {
    if (!formData.fullName) return alert("Name is required")
    setLoading(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("patients")
        .insert({
          doctor_id: user.id,
          full_name: formData.fullName,
          age: parseInt(formData.age),
          sex: formData.sex,
          location: formData.location
        })

      if (error) throw error
      onSuccess()
    } catch (err) {
      console.error(err)
      alert("Failed to add patient. Ensure database schema is applied.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-8 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground tracking-tighter">Add New Patient</h3>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Clinical Registry Intake</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Clinical Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input 
                  type="text" 
                  placeholder="Subject Name"
                  className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none transition-all"
                  value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Age</label>
                <input 
                  type="number" 
                  placeholder="Years"
                  className="w-full bg-background border border-border rounded-2xl py-4 px-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none"
                  value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Sex</label>
                <select 
                  className="w-full bg-background border border-border rounded-2xl py-4 px-4 text-foreground appearance-none focus:border-primary outline-none"
                  value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value})}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Clinic/Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input 
                  type="text" 
                  placeholder="Nairobi, Kenya"
                  className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary outline-none"
                  value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Register Patient <ChevronRight size={18} /></>}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
