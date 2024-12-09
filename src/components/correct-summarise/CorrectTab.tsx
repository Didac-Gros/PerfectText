import React, { useState } from 'react';
import { TextInput } from './TextInput';
import { TextOutput } from './TextOutput';
import { OptimizationModes } from './OptimizationModes';
import { correctText } from '../../services/correctText';
import { User } from 'firebase/auth';
import { LoginPopUp } from '../shared/LoginPopUp';
import { useNavigate } from 'react-router-dom';

type TabType = 'home' | 'correct' | 'summarize' | 'quiz' | 'conceptmap';

type CorrectTabProps = {
    onTabChange: (tab: TabType) => void;
    user: User | null;
};

export const CorrectTab: React.FC<CorrectTabProps> = ({ onTabChange, user }) => {
    const [inputText, setInputText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('es');
    const [selectedMode, setSelectedMode] = useState('general');
    const [correctedText, setCorrectedText] = useState('');
    const [enhancedText, setEnhancedText] = useState('');
    const [summarizedText, setSummarizedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!user) {
            setShowPopUp(true);
        } else {
            if (!inputText.trim()) return;

            setIsLoading(true);
            setError(undefined);

            try {
                const { corrected, enhanced } = await correctText(inputText, selectedLanguage, selectedMode);
                setCorrectedText(corrected);
                setEnhancedText(enhanced);
                setSummarizedText('');

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error inesperado');
                setCorrectedText('');
                setEnhancedText('');
                setSummarizedText('');
            } finally {
                setIsLoading(false);
            }
        }

    };

    const handleLogin = () => {
        try {
            navigate("/login");
        } catch (error) {
            console.error("Error al entrar en el login: ", (error as Error).message);
        }
    };

    const hasOutput = correctedText || enhancedText || error;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                        activeTab='correct'
                        onTabChange={() => onTabChange('summarize')}
                    />
                    {hasOutput && (
                        <TextOutput
                            enhancedText={enhancedText}
                            correctedText={correctedText}
                            summarizedText={summarizedText}
                            error={error}
                            mode={selectedMode}
                            activeTab='correct'
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
