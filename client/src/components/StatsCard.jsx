import { motion } from "framer-motion";
import { Database, FileStack } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export default function StatsCard({ documentCount, chunkCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
    >
      <Card className="h-full hover:shadow-md hover:shadow-indigo-100/60 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50">
              <Database className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <CardTitle>Index stats</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <FileStack className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-800">{documentCount}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Documents</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Database className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-800">{chunkCount}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Chunks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
