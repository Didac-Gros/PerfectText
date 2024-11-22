import { motion } from 'framer-motion';
import { Wand2, AlertCircle, Copy, Check, Settings2, Megaphone, BookOpen, Search, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';

interface TextOutputProps {
  correctedText: string;
  enhancedText: string;
  summarizedText: string;
  error?: string;
  mode: string;
  activeTab: 'correct' | 'summarize';
}

const modeIcons = {
  general: Settings2,
  advertising: Megaphone,
  academic: BookOpen,
  seo: Search,
} as const;

const modeNames = {
  general: 'General',
  advertising: 'Publicitario',
  academic: 'Académico',
  seo: 'SEO',
} as const;

const TextWithExpand = memo(({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowExpand, setShouldShowExpand] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
      const height = textRef.current.scrollHeight;
      const lines = Math.floor(height / lineHeight);
      setShouldShowExpand(lines > 5);
    }
  }, [text]);

  return (
    <div className="relative">
      <div className={!isExpanded && shouldShowExpand ? "relative max-h-[120px] overflow-hidden" : ""}>
        <p 
          ref={textRef}
          className="text-gray-700 whitespace-pre-wrap leading-relaxed"
        >
          {text}
        </p>
        {!isExpanded && shouldShowExpand && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      
      {shouldShowExpand && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200 group"
        >
          <span className="text-sm font-medium">
            {isExpanded ? 'Mostrar menos' : 'Mostrar texto completo'}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            )}
          </motion.div>
        </motion.button>
      )}
    </div>
  );
});

const CopyButton = memo(({ text, onCopy }: { text: string; onCopy: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onCopy}
    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
    title="Copiar texto"
  >
    <Copy className="w-5 h-5 text-gray-500" />
  </motion.button>
));

function TextOutputComponent({ 
  correctedText, 
  enhancedText, 
  summarizedText,
  error, 
  mode,
  activeTab 
}: TextOutputProps) {
  const [copiedStates, setCopiedStates] = useState({
    corrected: false,
    enhanced: false,
    summary: false
  });

  const handleCopy = async (text: string, type: keyof typeof copiedStates) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const ModeIcon = modeIcons[mode as keyof typeof modeIcons] || Settings2;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      </motion.div>
    );
  }

  if (activeTab === 'summarize' && summarizedText) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-lg font-semibold">Resumen</h2>
              <p className="text-sm text-gray-500">Optimización: {modeNames[mode as keyof typeof modeNames]}</p>
            </div>
          </div>
          {copiedStates.summary ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <CopyButton text={summarizedText} onCopy={() => handleCopy(summarizedText, 'summary')} />
          )}
        </div>
        <TextWithExpand text={summarizedText} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {correctedText && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold">Texto corregido</h2>
            </div>
            {copiedStates.corrected ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <CopyButton text={correctedText} onCopy={() => handleCopy(correctedText, 'corrected')} />
            )}
          </div>
          <TextWithExpand text={correctedText} />
        </div>
      )}

      {enhancedText && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ModeIcon className="w-5 h-5 text-purple-500" />
              <div>
                <h2 className="text-lg font-semibold">Versión mejorada</h2>
                <p className="text-sm text-gray-500">
                  Optimización: {modeNames[mode as keyof typeof modeNames]}
                </p>
              </div>
            </div>
            {copiedStates.enhanced ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <CopyButton text={enhancedText} onCopy={() => handleCopy(enhancedText, 'enhanced')} />
            )}
          </div>
          <TextWithExpand text={enhancedText} />
        </div>
      )}
    </motion.div>
  );
}

export const TextOutput = memo(TextOutputComponent);