"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Eye, EyeOff, ArrowLeft, HeartPulse, Stethoscope, 
  User, Loader2, Mail, Lock, ShieldCheck, 
  Activity, BrainCircuit, ArrowRight 
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from '@/utils/supabase/client'

const DNABackground = () => {
  return (
    <div className="absolute inset-x-0 inset-y-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-25">
      <motion.div
        animate={{ y: [0, 1080] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[1080px] flex flex-col gap-[24px]"
        style={{ perspective: "1000px" }}
      >
        {Array.from({ length: 90 }).map((_, i) => {
          const rotationOffset = i * (360 / 30);
          return (
            <motion.div
              key={i}
              className="flex items-center justify-between w-64 relative h-[12px]"
              initial={{ rotateY: rotationOffset }}
              animate={{ rotateY: rotationOffset + 360 }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "linear"
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-4 h-4 bg-primary/90 rounded-full shadow-[0_0_15px_hsl(var(--primary)_/_0.8)]"></div>
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent absolute left-0 top-1/2 -z-10 -translate-y-1/2"></div>
              <div className="w-4 h-4 bg-primary/90 rounded-full shadow-[0_0_15px_hsl(var(--primary)_/_0.8)]"></div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

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

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError
        window.location.href = "/"
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: "doctor",
              specialization: specialization,
              license_number: licenseNumber
            }
          }
        })
        if (signUpError) throw signUpError
        alert("Registration successful! Please check your email and then log in.")
        setIsLogin(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-sans selection:bg-primary/30">
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-card border-r border-border relative overflow-hidden">
        <DNABackground />
        
        <div className="relative z-10 w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-2xl shadow-primary/20">H</div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tighter">HouseMedi<span className="text-primary">.</span></h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-muted/50 backdrop-blur-xl border border-border rounded-[32px] p-8 space-y-6">
              <h2 className="text-3xl font-bold text-foreground leading-tight">Advanced Clinical Intelligence</h2>
              <p className="text-muted-foreground leading-relaxed font-medium">PathRad AI engine for high‑fidelity clinical diagnostics and multi‑agent medical orchestration.</p>
              
              <div className="space-y-4 pt-4">
                {[
                  { icon: <ShieldCheck className="w-5 h-5" />, text: "HIPAA Compliant Architecture" },
                  { icon: <Activity className="w-5 h-5" />, text: "Real-time AI Diagnostic Pipeline" },
                  { icon: <BrainCircuit className="w-5 h-5" />, text: "Multi-Model Inference (MedGemma 4B)" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-foreground/80">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{item.icon}</div>
                    <span className="text-sm font-bold tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] pl-4">Systems Status: <span className="text-primary">Operational</span></p>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-6 lg:p-12 bg-background relative">
        <div className="w-full max-w-sm">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center lg:text-left mb-10"
          >
            <h2 className="text-3xl font-bold text-foreground mb-2">{isLogin ? "Welcome Back, Clinician" : "Join PathRad AI"}</h2>
            <p className="text-muted-foreground font-medium">{isLogin ? "Enter your credentials to access the diagnostic portal" : "Register your clinical credentials to begin analysis"}</p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAuth} 
              className="space-y-5"
            >
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Clinical Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text" required 
                        placeholder="Dr. John Doe"
                        className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        value={fullName} onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Registry Specialization</label>
                      <div className="relative">
                        <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select 
                          required 
                          className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                          value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                        >
                          <option value="">Select Specialization</option>
                          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Medical License ID</label>
                      <input 
                        type="text" required 
                        placeholder="LIC-123456"
                        className="w-full bg-card border border-border rounded-2xl py-4 px-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Registry</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="email" required 
                    placeholder="doctor@housemedi.com"
                    className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Security Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="password" required 
                    placeholder="••••••••"
                    className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-4 rounded-2xl flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">!</div>
                  {error}
                </motion.div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 rounded-2xl transition-all shadow-xl shadow-primary/20 text-md relative overflow-hidden group"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : (
                  <span className="flex items-center justify-center gap-2">
                    {isLogin ? "Authenticate" : "Register Credentials"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-muted-foreground text-sm font-medium">
              {isLogin ? "Need a clinical profile?" : "Already registered?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-foreground hover:text-primary font-bold transition-colors underline underline-offset-4 decoration-primary/50"
              >
                {isLogin ? "Create account" : "Sign in to portal"}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
    </div>
  )
}
