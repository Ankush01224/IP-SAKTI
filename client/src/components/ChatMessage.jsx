import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, User, ChevronDown, ChevronRight, FileText } from "lucide-react";

function SourceItem({ source }) {
  return (
    <div className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
      <FileText className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-slate-700 truncate">{source.filename}</span>
          <span className="text-slate-400">p.{source.page}</span>
        </div>
        <p className="text-slate-500 line-clamp-2 leading-relaxed">{source.excerpt}</p>
      </div>
    </div>
  );
}

function SourcesCollapsible({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {sources.length} source{sources.length > 1 ? "s" : ""}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 space-y-1.5"
        >
          {sources.map((s) => (
            <SourceItem key={s.chunk_id} source={s} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex items-start">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
      )}
      <div className={`max-w-[75%] min-w-0 ${isUser ? "order-first" : ""}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-indigo-600 text-white rounded-br-md"
              : "bg-slate-100 text-slate-800 rounded-bl-md"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        {!isUser && <SourcesCollapsible sources={message.sources} />}
      </div>
      {isUser && (
        <div className="flex items-start">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
