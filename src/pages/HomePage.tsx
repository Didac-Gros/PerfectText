import React, { useState } from 'react';
import { Hero } from '../components/home/hero'; // Importación del Hero
import { PricingSection } from '../components/home/PricingSection'; // Importación del PricingSection
import { Navigation } from '../components/home/Navigation';
import { QuizGame } from '../components/QuizGame/QuizGame';
import { ConceptMapGenerator } from '../components/ConceptMap/ConceptMapGenerator';
import { SummarizeTab } from '../components/correct-summarise/SummarizeTab';
import { CorrectTab } from '../components/correct-summarise/CorrectTab';
import { useAuth } from '../hooks/useAuth';

type TabType = 'home' | 'correct' | 'summarize' | 'quiz' | 'conceptmap';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home'); // Establecer home como tab inicial
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'home' && (
          <>
            <Hero />
            <PricingSection /> {/* PricingSection añadido debajo de Hero */}
          </>
        )}

        {activeTab === 'correct' && (
          <CorrectTab onTabChange={setActiveTab} user={user} />)}

        {activeTab === 'summarize' && (
          <SummarizeTab onTabChange={setActiveTab} user={user} />)}

        {activeTab === 'quiz' &&
          <QuizGame />}

        {activeTab === 'conceptmap' &&
          <ConceptMapGenerator user={user} />}
      </div>
    </div>
  );
};

