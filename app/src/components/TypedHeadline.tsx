import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface TypedHeadlineProps {
  staticText: string;
  typedText: string;
  className?: string;
}

export default function TypedHeadline({ staticText, typedText, className = '' }: TypedHeadlineProps) {
  const typedCharacters = typedText.split('');
  const totalDuration = 3.5;
  const delayPerChar = totalDuration / typedCharacters.length;
  const textRef = useRef<HTMLSpanElement>(null);
  const [visibleChars, setVisibleChars] = useState(0);
  const [cursorX, setCursorX] = useState(0);

  useEffect(() => {
    typedCharacters.forEach((_, i) => {
      setTimeout(() => {
        setVisibleChars(i + 1);
      }, i * delayPerChar * 1000);
    });
  }, [typedCharacters.length, delayPerChar]);

  useEffect(() => {
    if (textRef.current) {
      const width = textRef.current.offsetWidth;
      setCursorX(width);
    }
  }, [visibleChars]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delayPerChar,
        delayChildren: 0,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div className={className} style={{ display: 'inline' }}>
      <span>{staticText}</span>
      <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
        <motion.span
          ref={textRef}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ display: 'inline' }}
        >
          {typedCharacters.slice(0, visibleChars).map((char, i) => (
            <motion.span key={i} variants={charVariants} style={{ display: 'inline' }}>
              {char}
            </motion.span>
          ))}
        </motion.span>
        <motion.span
          className="inline-block w-0.5 bg-[#008C9E] dark:bg-[#4CAF50]"
          style={{
            height: '1.5em',
            verticalAlign: 'text-bottom',
          }}
          animate={{
            opacity: visibleChars < typedCharacters.length ? 1 : [1, 0, 1, 0, 1, 0],
          }}
          transition={{
            duration: visibleChars < typedCharacters.length ? 0.1 : 1.8,
            ease: 'linear',
          }}
        />
      </div>
    </div>
  );
}
