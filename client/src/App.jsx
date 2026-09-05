import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatInput from "./components/ChatInput";
import DocumentsCard from "./components/DocumentsCard";
import QuickQuestions from "./components/QuickQuestions";
import StatsCard from "./components/StatsCard";
import ChatView from "./components/ChatView";
import { listDocuments, sendChat } from "./lib/api";

export default function App() {
  const [view, setView] = useState("dashboard"); // 'dashboard' | 'chat'
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [language, setLanguage] = useState("auto"); // shared language state

  const refreshDocs = useCallback(async () => {
    try {
      const data = await listDocuments();
      setDocs(data.documents || []);
      setTotalChunks(data.totalChunks || 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refreshDocs();
  }, [refreshDocs]);

  const handleSend = async (query) => {
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setView("chat");
    setLoading(true);
    try {
      // "auto" means we omit the language field — server will detect it
      const langParam = language === "auto" ? undefined : language;
      const data = await sendChat(query, langParam);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer, sources: data.sources, detectedLanguage: data.detectedLanguage },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${err.message}`, sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView("dashboard");
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <h1 className="text-base font-bold tracking-tight text-slate-800">
            IP-SAKTI<span className="text-indigo-600"> Sahayak</span>
          </h1>
          <span className="ml-3 text-[10px] tracking-wider uppercase text-slate-400 font-medium hidden sm:inline">
            Ayurveda IP Assistant
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {view === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Bento grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Large card — spans full width */}
                <div className="md:col-span-2">
                  <ChatInput
                    onSend={handleSend}
                    disabled={loading}
                    language={language}
                    onLanguageChange={setLanguage}
                  />
                </div>

                {/* Medium card — documents */}
                <div className="md:col-span-1">
                  <DocumentsCard
                    documents={docs}
                    totalChunks={totalChunks}
                    onRefresh={refreshDocs}
                  />
                </div>

                {/* Right column: two small cards stacked */}
                <div className="md:col-span-1 flex flex-col gap-4">
                  <QuickQuestions onSelect={handleSend} />
                  <StatsCard documentCount={docs.length} chunkCount={totalChunks} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChatView
                messages={messages}
                onSend={handleSend}
                onBack={handleBack}
                loading={loading}
                language={language}
                onLanguageChange={setLanguage}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
