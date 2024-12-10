import React, { useState } from 'react';
import { Hero } from '../components/home/hero'; // Importación del Hero
import { PricingSection } from '../components/home/PricingSection'; // Importación del PricingSection
import { Navigation } from '../components/home/Navigation';
import { QuizGame } from '../components/QuizGame/QuizGame';
import { ConceptMapGenerator } from '../components/ConceptMap/ConceptMapGenerator';
import { SummarizeTab } from '../components/summarize/SummarizeTab';
import { CorrectTab } from '../components/correct/CorrectTab';
import { useAuth } from '../hooks/useAuth';

type TabType = 'home' | 'correct' | 'summarize' | 'quiz' | 'conceptmap' | 'plans';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(user ? 'correct' : 'home'); // Establecer home como tab inicial

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} user={user} />
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

        {activeTab === 'plans' &&
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-2xl opacity-50" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-2xl opacity-50" />

            {/* Stripe Pricing Table */}
            <div className="relative bg-white rounded-2xl shadow-xl p-8">
              <stripe-pricing-table
                pricing-table-id="prctbl_1QRBjOKIdUQC1kmZrYJVBP0Q"
                publishable-key="pk_live_51QRAsiKIdUQC1kmZ2An7o3OBNt54xFKdlTpByQz92H4xvh1NZvonLBUMooGH8k6XRXJ7zy3LLW3AlXlfdf00sDJK00OicnLdCI">
              </stripe-pricing-table>
            </div>
          </div>}
      </div>
    </div>
  );
};

