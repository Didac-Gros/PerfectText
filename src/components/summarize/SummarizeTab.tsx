import React, { useState } from 'react';
import { TextInput } from './TextInputSum';
import { TextOutput } from './TextOutputSum';
import { OptimizationModes } from '../shared/OptimizationModes';
import { summarizeText } from '../../services/summarizeText';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LoginPopUp } from '../shared/LoginPopUp';

type TabType = 'home' | 'correct' | 'summarize' | 'quiz' | 'conceptmap';

type SummarizeTabProps = {
    onTabChange: (tab: TabType) => void;
    user: User | null;
    removeTokens: (tokens: number) => void;
    userTokens: number | null;
    setShowPopUpTokens: (show: boolean) => void;
};

export const SummarizeTab: React.FC<SummarizeTabProps> = ({ onTabChange, user, removeTokens, userTokens, setShowPopUpTokens }) => {
    const [inputText, setInputText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('es');
    const [selectedMode, setSelectedMode] = useState('general');
    const [correctedText, setCorrectedText] = useState('');
    const [enhancedText, setEnhancedText] = useState('');
    const [summarizedText, setSummarizedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const hasOutput = summarizedText || error;
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!user) {
            setShowPopUp(true);
        } else if(userTokens === null || userTokens >= inputText.length) {
            if (!inputText.trim()) return;

            setIsLoading(true);
            setError(undefined);
            removeTokens(inputText.length);

            try {
                const summary = await summarizeText(inputText, selectedLanguage, selectedMode);
                setSummarizedText(summary);
                setCorrectedText('');
                setEnhancedText('');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error inesperado');
                setCorrectedText('');
                setEnhancedText('');
                setSummarizedText('');
            } finally {
                setIsLoading(false);
            }
        } else {
            setShowPopUpTokens(true);
        }

    };

    const handleLogin = () => {
        try {
            navigate("/login");
        } catch (error) {
            console.error("Error al entrar en el login: ", (error as Error).message);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 ">
            <div className="lg:col-span-3">
                <OptimizationModes selectedMode={selectedMode} onModeChange={setSelectedMode} />
            </div>

            {showPopUp && (
                <div className="text-center mb-8">
                    <LoginPopUp
                        onClose={() => setShowPopUp(false)}
                        onLogin={handleLogin}
                    ></LoginPopUp>
                </div>
            )}

            <div className="lg:col-span-9">
                <div className={`grid gap-8 ${hasOutput ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                    <TextInput
                        inputText={inputText}
                        selectedLanguage={selectedLanguage}
                        isLoading={isLoading}
                        onTextChange={setInputText}
                        onLanguageChange={setSelectedLanguage}
                        onSubmit={handleSubmit}
                        activeTab='summarize'
                        onTabChange={() => onTabChange('correct')}
                    />
                    {hasOutput && (
                        <TextOutput
                            enhancedText={enhancedText}
                            correctedText={correctedText}
                            summarizedText={summarizedText}
                            error={error}
                            mode={selectedMode}
                            activeTab='summarize'
                        />
                    )}
                </div>
            </div>

        </div>


    );


};
