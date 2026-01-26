import { motion } from 'motion/react';

export interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  labels?: string[];
}

const defaultLabels = [
  '매우 반대',
  '반대',
  '약간 반대',
  '중립',
  '약간 찬성',
  '찬성',
  '매우 찬성',
];

export function LikertScale({ 
  value, 
  onChange, 
  labels = defaultLabels 
}: LikertScaleProps) {
  return (
    <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
      {labels.map((label, index) => {
        const scaleValue = index - 3; // -3 to 3
        const isSelected = value === scaleValue;

        return (
          <button
            key={index}
            onClick={() => onChange(scaleValue)}
            className={`w-full p-3 sm:p-4 rounded-xl transition-all ${
              isSelected
                ? 'bg-white text-black scale-105'
                : 'bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm sm:text-base">{label}</span>
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${
                  isSelected ? 'bg-black border-black' : 'border-white/30'
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-full h-full rounded-full bg-black flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                  </motion.div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
