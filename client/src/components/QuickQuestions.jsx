import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const QUESTIONS = [
  "What is TKDL and what does it cover?",
  "Can classical Ayurvedic formulations be patented?",
  "What qualifies for patent protection under Indian Patent Act?",
];

export default function QuickQuestions({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
    >
      <Card className="h-full hover:shadow-md hover:shadow-indigo-100/60 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <CardTitle>Quick questions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            {QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => onSelect(q)}
                className="text-left text-xs text-slate-600 px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-150 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
