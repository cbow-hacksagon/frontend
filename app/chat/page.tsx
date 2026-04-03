"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bot, 
  Menu,
  MessageSquare,
  Microscope,
  Plus,
  Send, 
  Stethoscope, 
  User, 
  X,
  Activity,
  BrainCircuit,
  Trash2,
  Dna
} from "lucide-react"

// Types for Chat
type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

type ChatSession = {
  id: string
  title: string
  updatedAt: number
  messages: Message[]
}

export default function ChatDashboard() {
  const [chats, setChats] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load from local storage on mount
  useEffect(() => {
    setIsClient(true)
    try {
      const stored = localStorage.getItem("houseMedi_chats")
      if (stored) {
        const parsed = JSON.parse(stored)
        setChats(parsed)
        if (parsed.length > 0) setActiveChatId(parsed[0].id)
      }
    } catch (e) {
      console.error("Local storage error:", e)
    }
  }, [])

  // Save to local storage whenever chats update
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("houseMedi_chats", JSON.stringify(chats))
    }
  }, [chats, isClient])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats, activeChatId])

  const activeChat = chats.find(c => c.id === activeChatId) || null

  const createNewChat = () => {
    const newId = `chat-${Date.now()}`
    const initialMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "system",
      content: "HouseMedi Multi-Agent Reinforcement Learning framework initialized. Group Relative Policy Optimization (GRPO) active. Synthesizing cross-disciplinary diagnostic pathways. Ready to analyze rare disease phenomenology.",
      timestamp: Date.now()
    }
    const newChat: ChatSession = {
      id: newId,
      title: "New Diagnostic Session",
      updatedAt: Date.now(),
      messages: [initialMessage]
    }
    setChats(prev => [newChat, ...prev])
    setActiveChatId(newId)
    setIsSidebarOpen(false)
  }

  const deleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updatedChats = chats.filter(c => c.id !== id)
    setChats(updatedChats)
    if (activeChatId === id) {
      setActiveChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
  }

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputMessage.trim()) return

    // If no active chat, create one automatically
    let currentId = activeChatId
    let updatedChats = [...chats]
    
    if (!currentId) {
      currentId = `chat-${Date.now()}`
      const newChat: ChatSession = {
        id: currentId,
        title: inputMessage.slice(0, 30) + (inputMessage.length > 30 ? "..." : ""),
        updatedAt: Date.now(),
        messages: [{
          id: `msg-sys-${Date.now()}`,
          role: "system",
          content: "HouseMedi MARL framework activated. Analyzing symptom cluster...",
          timestamp: Date.now() - 100
        }]
      }
      updatedChats = [newChat, ...updatedChats]
      setActiveChatId(currentId)
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: "user",
      content: inputMessage,
      timestamp: Date.now()
    }

    // Add user message to active chat
    const chatIndex = updatedChats.findIndex(c => c.id === currentId)
    if (chatIndex > -1) {
      const active = { ...updatedChats[chatIndex] }
      active.messages = [...active.messages, newMessage]
      
      // Update title if it was named "New Diagnostic Session"
      if (active.messages.length <= 2 && active.title === "New Diagnostic Session") {
        active.title = inputMessage.slice(0, 30) + (inputMessage.length > 30 ? "..." : "")
      }
      active.updatedAt = Date.now()
      
      updatedChats[chatIndex] = active
      
      // Sort so newest updated chat is at top
      updatedChats.sort((a, b) => b.updatedAt - a.updatedAt)
      setChats([...updatedChats])
      setInputMessage("")

      // Simulate AI response stream
      simulateAgentResponse(currentId)
    }
  }

  const simulateAgentResponse = (chatId: string) => {
    setTimeout(() => {
      setChats(prev => {
        return prev.map(c => {
          if (c.id === chatId) {
            const aiMessage: Message = {
              id: `msg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              role: "assistant",
              content: "Analyzing phenotypic variations against rare disease databases. Engaging Multi-Agent GRPO protocols to isolate atypical presenting features...\n\nCould you elaborate on the chronological onset of these symptoms? Any specific triggers or mitigating factors?",
              timestamp: Date.now()
            }
            return {
              ...c,
              messages: [...c.messages, aiMessage],
              updatedAt: Date.now()
            }
          }
          return c
        }).sort((a, b) => b.updatedAt - a.updatedAt)
      })
    }, 1500)
  }

  if (!isClient) return null // Prevent hydration mismatch

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed md:relative z-50 flex h-full w-[280px] sm:w-[320px] flex-col bg-card/50 backdrop-blur-md border-r border-border/50 text-card-foreground transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-card to-card/40">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
              H
            </div>
            <span className="text-lg text-foreground">HouseMedi</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={createNewChat}
            className="flex w-full items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
          >
            <Plus size={18} />
            New Diagnostic Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
          <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Recent Sessions
          </div>
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground px-4 text-center">
              <Microscope className="mb-3 opacity-20" size={40} />
              <p className="text-sm">No diagnostic sessions yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id)
                    setIsSidebarOpen(false)
                  }}
                  className={`group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all ${
                    activeChatId === chat.id 
                      ? "bg-accent text-accent-foreground font-medium shadow-sm ring-1 ring-border/50" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <MessageSquare size={16} className={`shrink-0 ${activeChatId === chat.id ? "text-primary" : "text-muted-foreground/70"}`} />
                  <div className="truncate flex-1 pr-6">{chat.title}</div>
                  
                  <button 
                    onClick={(e) => deleteChat(e, chat.id)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                    title="Delete session"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border/50 bg-card/60">
      
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col h-full bg-gradient-to-b from-background to-muted/10 relative">
        
        {/* Header (Mobile) */}
        <div className="flex items-center justify-between p-4 md:px-8 md:py-5 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-2 md:hidden p-2 rounded-md hover:bg-muted text-foreground transition-colors"
            >
              <Menu size={20} />
            </button>
            <Dna className="text-primary hidden md:block" size={24} />
            <h1 className="font-semibold text-lg text-foreground tracking-tight">
              {activeChat ? activeChat.title : "HouseMedi Diagnostics"}
            </h1>
          </div>
          <div className="flex items-center gap-2">

          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar scroll-smooth">
          <div className="mx-auto max-w-4xl space-y-6 md:space-y-8 pb-32">
            {!activeChat || activeChat.messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center mt-20 md:mt-32 text-center"
              >
                <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/5 ring-1 ring-primary/20">
                  <Stethoscope className="size-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                  Multi-Agent Rare Disease Diagnostics
                </h2>
                <p className="max-w-2xl text-muted-foreground leading-relaxed">
                  Utilizing <strong className="text-foreground">Group Relative Policy Optimization (GRPO)</strong>. Navigating complex phenotypic networks to end the diagnostic odyssey. Ask a clinical query to begin MARL analysis.
                </p>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                   {["Analyze multi-systemic symptoms over 5 years", "Correlate atypical pediatric genetic markers", "Review unresolved immunology cases"].map((suggestion, i) => (
                      <div 
                        key={i} 
                        onClick={() => setInputMessage(suggestion)}
                        className="bg-card p-4 rounded-xl border border-border/60 hover:border-primary/50 text-sm text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >
                         <div className="flex items-center gap-2 mb-2 font-medium">
                            <BrainCircuit size={16} className="text-primary/70 group-hover:text-primary transition-colors" />
                            Suggestion
                         </div>
                         <p className="text-muted-foreground">{suggestion}</p>
                      </div>
                   ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {activeChat.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 md:gap-5 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex mt-1 size-8 md:size-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                        message.role === "user"
                          ? "bg-accent text-accent-foreground border border-border/50"
                          : message.role === "system"
                            ? "bg-muted/80 text-muted-foreground border border-border/40"
                            : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-primary/20"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User size={18} />
                      ) : message.role === "system" ? (
                        <Activity size={18} />
                      ) : (
                        <Bot size={18} />
                      )}
                    </div>
                    
                    <div className={`flex flex-col gap-1 min-w-[30%] max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-sm font-semibold tracking-tight text-foreground/80">
                          {message.role === "user" ? "Clinician / User" : message.role === "system" ? "System Core" : "HouseMedi MARL Agent"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div
                        className={`rounded-2xl px-5 py-3.5 text-sm md:text-[15px] leading-relaxed relative ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md shadow-primary/10"
                            : message.role === "system"
                              ? "bg-muted text-muted-foreground italic rounded-tl-sm border border-border/40 text-xs"
                              : "bg-card text-card-foreground border border-border/50 rounded-tl-sm shadow-sm"
                        }`}
                      >
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className={i !== 0 ? "mt-3" : ""}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-4">
          <div className="mx-auto max-w-4xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-[28px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <form
              onSubmit={sendMessage}
              className="relative flex items-end gap-2 rounded-[24px] bg-card p-2 border border-border/60 shadow-lg ring-1 ring-border/20 transition-all focus-within:ring-primary/40 focus-within:border-primary/50"
            >
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Describe patient's atypical clinical presentation..."
                className="min-h-[52px] w-full resize-none bg-transparent px-4 py-3.5 text-sm md:text-base outline-none custom-scrollbar text-foreground placeholder:text-muted-foreground/70"
                style={{ maxHeight: '200px' }}
                rows={1}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="mb-1.5 mr-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary shadow-md active:scale-95"
              >
                <Send size={18} className="translate-x-[1px]" />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Global styles for custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: hsl(var(--muted-foreground) / 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: hsl(var(--muted-foreground) / 0.5);
        }
      `}} />
    </div>
  )
}
