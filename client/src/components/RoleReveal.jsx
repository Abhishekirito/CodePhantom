import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RoleReveal = ({ role, onComplete }) => {
  const [stage, setStage] = useState('curtain'); // 'curtain', 'loading', 'reveal'

  useEffect(() => {
    // Timeline: 
    // 0s: Curtain drops (Black screen)
    // 1s: "Compiling..." text appears
    // 4s: Role is revealed
    // 8s: Animation finishes -> Go to Game
    const timer1 = setTimeout(() => setStage('loading'), 1000);
    const timer2 = setTimeout(() => setStage('reveal'), 4000);
    const timer3 = setTimeout(onComplete, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const isImposter = role === 'Imposter';
  const bgColor = isImposter ? 'bg-black' : 'bg-white';
  const textColor = isImposter ? 'text-red-600' : 'text-blue-600';
  const subText = isImposter ? "SABOTAGE THE CODEBASE." : "FIX THE BUGS. TRUST NO ONE.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-pixel uppercase">
      <AnimatePresence>
        {(stage === 'curtain' || stage === 'loading') && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center text-green-500"
          >
            {stage === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl tracking-widest animate-pulse"
              >
                COMPILING PLAYERS...
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === 'reveal' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute inset-0 ${bgColor} flex flex-col items-center justify-center`}
          >
            <motion.h1 className={`text-6xl font-bold ${textColor} mb-4 tracking-tighter`}>
              {role.toUpperCase()}
            </motion.h1>
            <p className="text-gray-500 text-xl tracking-widest">{subText}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleReveal;