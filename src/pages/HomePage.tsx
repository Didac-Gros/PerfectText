import React, { useState } from "react";
import { Hero } from "../components/home/hero"; // Importación del Hero
import { PricingSection } from "../components/home/PricingSection"; // Importación del PricingSection
import { Navigation } from "../components/home/navigation/Navigation";
import { QuizGame } from "../components/QuizGame/QuizGame";
import { ConceptMapGenerator } from "../components/ConceptMap/ConceptMapGenerator";
import { SummarizeTab } from "../components/summarize/SummarizeTab";
import { CorrectTab } from "../components/correct/CorrectTab";
import { useAuth } from "../hooks/useAuth";
import { updateUserTokens } from "../services/firestore/firestore";
import { TabType } from "../types/global";
import { StripePricingTable } from "../components/shared/StripePricingTable";
import { TokensPopUp } from "../components/shared/TokensPopUp";
import { TraductorTab } from "../components/traductor/TraductorTab";

export const HomePage: React.FC = () => {
  const { user, userStore } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(
    user ? "correct" : "home"
  ); // Establecer home como tab inicial
  const [tokens, setTokens] = useState<number | null>(userStore?.tokens! ?? 0); // Establecer home como tab inicial
  const [showPopUp, setShowPopUp] = useState<boolean>(false);

  const removeTokens = async (tokensToRemove: number) => {
    await updateUserTokens(tokensToRemove);
    setTokens(tokens! - tokensToRemove);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[93rem] mx-auto px-4 md:py-6">
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          user={user}
          tokens={tokens ?? 0}
          userStore={userStore}
        />

        {activeTab === "home" && (
          <>
            <Hero onTabChange={setActiveTab} />
            <PricingSection />
          </>
        )}

        {showPopUp && (
          <div className="text-center mb-8">
            <TokensPopUp
              onClose={() => setShowPopUp(false)}
              onUpdatePlan={() => {
                setActiveTab("plans");
                setShowPopUp(false);
              }}
              userExpirationDate={userStore!.expirationDate}
            ></TokensPopUp>
          </div>
        )}

        {activeTab === "correct" && (
          <CorrectTab
            onTabChange={setActiveTab}
            user={user}
            removeTokens={removeTokens}
            userTokens={userStore?.tokens ?? 0}
            setShowPopUpTokens={setShowPopUp}
          />
        )}

        {activeTab === "traductor" && (
          <TraductorTab
            onTabChange={setActiveTab}
            activeTab={activeTab}
            removeTokens={removeTokens}
            userTokens={userStore?.tokens ?? null}
            setShowPopUpTokens={setShowPopUp}
          />
        )}

        {activeTab === "summarize" && (
          <SummarizeTab
            onTabChange={setActiveTab}
            user={user}
            removeTokens={removeTokens}
            userTokens={userStore?.tokens ?? 0}
            setShowPopUpTokens={setShowPopUp}
          />
        )}

        {activeTab === "quiz" && (
          <QuizGame
            removeTokens={removeTokens}
            userTokens={userStore?.tokens ?? 0}
            setShowPopUpTokens={setShowPopUp}
          />
        )}

        {activeTab === "conceptmap" && (
          <ConceptMapGenerator
            user={user}
            removeTokens={removeTokens}
            userTokens={userStore?.tokens ?? 0}
            setShowPopUpTokens={setShowPopUp}
          />
        )}

        {user && activeTab === "plans" && <StripePricingTable />}

        {/* {activeTab === 'plans' && <StripePricingTable />} */}
      </div>
    </div>
  );
};
