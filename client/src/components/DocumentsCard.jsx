import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { uploadDocument, ingestDocument } from "../lib/api";

export default function DocumentsCard({ documents, totalChunks, onRefresh }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const uploadRes = await uploadDocument(file);
      setStatus({ type: "success", msg: `Uploading… now ingesting` });
      await ingestDocument(uploadRes.filename);
      setStatus({ type: "success", msg: `Ingested ${uploadRes.filename}` });
      onRefresh?.();
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
    >
      <Card className="h-full hover:shadow-md hover:shadow-indigo-100/60 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <CardTitle>Documents</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Upload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFile}
          />

          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No documents uploaded yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {documents.map((name) => (
                <li key={name} className="flex items-center gap-2 text-xs text-slate-600 py-1 px-2 rounded-lg bg-slate-50">
                  <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{name}</span>
                </li>
              ))}
            </ul>
          )}

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg ${
                  status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                }`}>
                  {status.type === "success" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {status.msg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
