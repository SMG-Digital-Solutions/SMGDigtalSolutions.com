import { motion } from 'framer-motion';

interface TypedHeadlineProps {
  staticText: string;
  typedText: string;
  className?: string;
}

export default function TypedHeadline({ staticText, typedText, className = '' }: TypedHeadlineProps) {
  const typedCharacters = typedText.split('');
  const totalDuration = 3.5;
  const delayPerChar = totalDuration / typedCharacters.length;

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
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ display: 'inline' }}
        >
          {typedCharacters.map((char, i) => (
            <motion.span key={i} variants={charVariants} style={{ display: 'inline' }}>
              {char}
            </motion.span>
          ))}
        </motion.span>
        <motion.span
          className="inline-block w-0.5 bg-[#008C9E] dark:bg-[#4CAF50]"
          style={{
            height: '1.5em',
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
          }}
          initial={{ opacity: 1 }}
          animate={{
            opacity: [
              1, 1, 1, 1, 1, 1, 1,
              0, 1, 0, 1, 0, 1, 0,
            ]
          }}
          transition={{
            duration: totalDuration + 1.2,
            times: [
              0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.98,
              0.98, 1, 1, 1, 1, 1, 1,
            ],
            ease: 'linear',
          }}
        />
      </div>
    </div>
  );
}
