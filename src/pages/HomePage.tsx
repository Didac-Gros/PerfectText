import React, { useRef, useState } from 'react';
import { Hero } from '../components/home/hero'; // Importación del Hero
import { PricingSection } from '../components/home/PricingSection'; // Importación del PricingSection
import { TextInput } from '../components/correctText/TextInput';
import { TextOutput } from '../components/correctText/TextOutput';
import { OptimizationModes } from '../components/home/OptimizationModes';
import { Navigation } from '../components/home/Navigation';
import { QuizGame } from '../components/QuizGame/QuizGame';
import { ConceptMapGenerator } from '../components/ConceptMap/ConceptMapGenerator';
import { correctText, summarizeText } from '../services/api';



type TabType = 'home' | 'correct' | 'summarize' | 'quiz' | 'conceptmap';

export const HomePage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [selectedMode, setSelectedMode] = useState('general');
  const [activeTab, setActiveTab] = useState<TabType>('home'); // Establecer home como tab inicial
  const [correctedText, setCorrectedText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [summarizedText, setSummarizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const resumenRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const scrollToResumen = () => {
    if (resumenRef.current) {
      resumenRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToQuiz = () => {
    if (quizRef.current) {
      quizRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToMap = () => {
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(undefined);

    try {
      if (activeTab === 'correct') {
        const { corrected, enhanced } = await correctText(inputText, selectedLanguage, selectedMode);
        setCorrectedText(corrected);
        setEnhancedText(enhanced);
        setSummarizedText('');
      } else if (activeTab === 'summarize') {
        const summary = await summarizeText(inputText, selectedLanguage, selectedMode);
        setSummarizedText(summary);
        setCorrectedText('');
        setEnhancedText('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setCorrectedText('');
      setEnhancedText('');
      setSummarizedText('');
    } finally {
      setIsLoading(false);
    }
  };

  const hasOutput = correctedText || enhancedText || summarizedText || error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} onScrollToResumen={scrollToResumen} onScrollToQuiz={scrollToQuiz} onScrollToMap={scrollToMap} />
        {activeTab === 'home' && (
          <>
            <Hero />
            <PricingSection /> {/* PricingSection añadido debajo de Hero */}
          </>
        )}
        {activeTab === 'correct' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <OptimizationModes
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
              />
            </div>

            <div className="lg:col-span-9" ref={resumenRef}>
              <div className={`grid gap-8 ${hasOutput ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                <TextInput
                  inputText={inputText}
                  selectedLanguage={selectedLanguage}
                  isLoading={isLoading}
                  onTextChange={setInputText}
                  onLanguageChange={setSelectedLanguage}
                  onSubmit={handleSubmit}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />

                {hasOutput && (
                  <TextOutput
                    correctedText={correctedText}
                    enhancedText={enhancedText}
                    summarizedText={summarizedText}
                    error={error}
                    mode={selectedMode}
                    activeTab={activeTab}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'summarize' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <OptimizationModes
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
              />
            </div>

            <div className="lg:col-span-9" ref={resumenRef}>
              <div className={`grid gap-8 ${hasOutput ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                <TextInput
                  inputText={inputText}
                  selectedLanguage={selectedLanguage}
                  isLoading={isLoading}
                  onTextChange={setInputText}
                  onLanguageChange={setSelectedLanguage}
                  onSubmit={handleSubmit}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />

                {hasOutput && (
                  <TextOutput
                    correctedText={correctedText}
                    enhancedText={enhancedText}
                    summarizedText={summarizedText}
                    error={error}
                    mode={selectedMode}
                    activeTab={activeTab}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'quiz' && <QuizGame quizRef={quizRef} />} {/* QuizGame para la pestaña quiz */}
        {activeTab === 'conceptmap' && <ConceptMapGenerator mapRef={mapRef} />} {/* ConceptMap para la pestaña conceptmap */}
      </div>
    </div>
  );
};

