import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import ChatMessage from "./ChatMessage";

export default function ChatView({ messages, onSend, onBack, loading }) {
  const [value, setValue] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (!q || loading) return;
    onSend(q);
    setValue("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-1 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-sm font-semibold text-slate-800">IP-SAKTI Sahayak</h2>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-1">
        <div className="space-y-4 py-4 pr-2">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-slate-400 pl-10"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking…
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="shrink-0 py-3 px-1 border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask a follow-up question…"
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 disabled:opacity-50 transition-all duration-200"
          />
          <Button type="submit" disabled={!value.trim() || loading} className="h-11 px-5">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
