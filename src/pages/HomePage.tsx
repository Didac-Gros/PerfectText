import React, { useEffect, useState } from 'react';
import { Hero } from '../components/home/hero'; // Importación del Hero
import { PricingSection } from '../components/home/PricingSection'; // Importación del PricingSection
import { Navigation } from '../components/home/Navigation';
import { QuizGame } from '../components/QuizGame/QuizGame';
import { ConceptMapGenerator } from '../components/ConceptMap/ConceptMapGenerator';
import { SummarizeTab } from '../components/summarize/SummarizeTab';
import { CorrectTab } from '../components/correct/CorrectTab';
import { useAuth } from '../hooks/useAuth';
import { updateUserTokens } from '../services/firestore';

type TabType = 'home' | 'correct' | 'summarize' | 'quiz' | 'conceptmap' | 'plans';

export const HomePage: React.FC = () => {
  const { user, userStore } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(user ? 'correct' : 'home'); // Establecer home como tab inicial
  const [tokens, setTokens] = useState<number|null>(userStore?.tokens! ?? 0); // Establecer home como tab inicial

  const removeTokens = async (tokensToRemove: number) => {
    await updateUserTokens(tokensToRemove);
    setTokens(tokens! - tokensToRemove)
  }

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} user={user} tokens={tokens ?? 0} />
        {activeTab === 'home' && (
          <>
            <Hero />
            <PricingSection />
          </>
        )}

        {activeTab === 'correct' && (
          <CorrectTab onTabChange={setActiveTab} user={user} removeTokens={removeTokens}/>)}

        {activeTab === 'summarize' && (
          <SummarizeTab onTabChange={setActiveTab} user={user} removeTokens={removeTokens} />)}

        {activeTab === 'quiz' &&
          <QuizGame removeTokens={removeTokens} />}

        {activeTab === 'conceptmap' &&
          <ConceptMapGenerator user={user} removeTokens={removeTokens} />}

        {activeTab === 'plans' &&
          <div className="relative">
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

