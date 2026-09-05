import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Globe } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export const LANGUAGES = [
  { code: "auto", label: "Auto-detect" },
  { code: "en",   label: "English" },
  { code: "hi",   label: "हिंदी" },
  { code: "ta",   label: "தமிழ்" },
  { code: "te",   label: "తెలుగు" },
  { code: "bn",   label: "বাংলা" },
];

const PLACEHOLDER = "Ask about Ayurveda IP & regulations…";

export default function ChatInput({ onSend, disabled, language, onLanguageChange }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (!q || disabled) return;
    onSend(q);
    setValue("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="hover:shadow-md hover:shadow-indigo-100/60 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Ask about Ayurveda IP &amp; regulations
              </h2>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                disabled={disabled}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 cursor-pointer"
                title="Response language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={PLACEHOLDER}
              disabled={disabled}
              className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-300 disabled:opacity-50 transition-all duration-200"
            />
            <Button type="submit" disabled={!value.trim() || disabled} size="default" className="h-11 px-5">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}
