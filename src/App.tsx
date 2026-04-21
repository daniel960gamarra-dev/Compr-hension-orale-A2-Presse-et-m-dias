/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Key } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  History, 
  BookOpen, 
  Award, 
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  VolumeX,
  Plus
} from 'lucide-react';
import { quizData, QuizSection, Question } from './data/quizData';

type AppState = 'home' | 'quiz' | 'history';

interface QuizResult {
  date: string;
  score: number;
  total: number;
  answers: Record<number, string | string[]>;
}

export default function App() {
  const [state, setState] = useState<AppState>('home');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); // Placeholder
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('eco_audition_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    const savedAudio = localStorage.getItem('eco_audition_audio');
    if (savedAudio) {
      setAudioUrl(savedAudio);
    }
  }, []);

  useEffect(() => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.play().catch(e => console.log("Auto-play blocked or error:", e));
      } else {
        audioRef.pause();
      }
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    if (audioRef) {
      audioRef.muted = isMuted;
    }
  }, [isMuted, audioRef]);

  const updateAudioUrl = (url: string) => {
    setAudioUrl(url);
    localStorage.setItem('eco_audition_audio', url);
    setIsPlaying(false);
  };

  const saveToHistory = (score: number, total: number) => {
    const newResult: QuizResult = {
      date: new Date().toLocaleString(),
      score,
      total,
      answers: userAnswers,
    };
    const updatedHistory = [newResult, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('eco_audition_history', JSON.stringify(updatedHistory));
  };

  const calculateScore = () => {
    let score = 0;
    quizData.forEach(section => {
      section.questions.forEach(q => {
        const userAns = userAnswers[q.id];
        if (q.type === 'multiple') {
          if (Array.isArray(userAns) && Array.isArray(q.correctAnswer)) {
            const isCorrect = userAns.length === q.correctAnswer.length && 
                             userAns.every(v => (q.correctAnswer as string[]).includes(v));
            if (isCorrect) score += 1;
          }
        } else if (q.type === 'text') {
          if (typeof userAns === 'string' && userAns.toLowerCase().trim() === (q.correctAnswer as string).toLowerCase().trim()) {
            score += 1;
          }
        } else {
          if (userAns === q.correctAnswer) score += 1;
        }
      });
    });
    return score;
  };

  const totalQuestions = quizData.reduce((acc, section) => acc + section.questions.length, 0);

  const handleAnswer = (questionId: number, answer: string | string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const startQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
    setCurrentSectionIndex(0);
    setState('quiz');
  };

  const finishQuiz = () => {
    const score = calculateScore();
    saveToHistory(score, totalQuestions);
    setShowResults(true);
  };

  const resetQuiz = () => {
    startQuiz();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1C1917] font-sans selection:bg-[#E7E5E4]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E7E5E4] px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setState('home')}
          >
            <div className="bg-[#1C1917] p-1.5 rounded-lg">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Eco-Audition</h1>
          </div>
          
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setState('home')}
              className={`text-sm font-medium transition-colors ${state === 'home' || state === 'quiz' ? 'text-[#1C1917]' : 'text-[#78716C] hover:text-[#1C1917]'}`}
            >
              Pratique
            </button>
            <button 
              onClick={() => setState('history')}
              className={`text-sm font-medium transition-colors ${state === 'history' ? 'text-[#1C1917]' : 'text-[#78716C] hover:text-[#1C1917]'}`}
            >
              Progrès
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <audio 
          src={audioUrl} 
          ref={(node) => setAudioRef(node)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {state === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <h2 className="text-5xl font-light mb-6 tracking-tight">Entraînez votre oreille.</h2>
              <p className="text-[#78716C] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Préparez-vous à votre examen de compréhension orale avec notre plateforme interactive. 
                Sujets d'actualité, environnement et plus encore.
              </p>
              
              <div className="flex flex-col gap-8">
                <button 
                  onClick={startQuiz}
                  className="bg-[#1C1917] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#44403C] transition-all transform hover:scale-105 shadow-lg shadow-black/10 flex items-center gap-2 mx-auto"
                >
                  Commencer l'exercice <ChevronRight className="w-5 h-5" />
                </button>

                <div className="mt-12 bg-white rounded-2xl p-6 border border-[#E7E5E4] max-w-md mx-auto text-left shadow-sm">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Espace Enseignant
                  </h4>
                  <p className="text-sm text-[#78716C] mb-4">Lien vers le fichier audio (MP3) :</p>
                  <input 
                    type="text" 
                    value={audioUrl}
                    onChange={(e) => updateAudioUrl(e.target.value)}
                    placeholder="https://exemple.com/audio.mp3"
                    className="w-full bg-[#F5F5F4] border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#1C1917] outline-none"
                  />
                  <p className="text-[10px] text-[#A8A29E] mt-2 italic">
                    *Le fichier doit être accessible publiquement (URL directe).
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'quiz' && !showResults && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Audio Controls */}
              <div className="bg-white rounded-3xl p-6 border border-[#E7E5E4] shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 bg-[#1C1917] text-white rounded-full flex items-center justify-center hover:bg-[#44403C] transition-colors"
                  >
                    {isPlaying ? <Pause className="fill-white" /> : <Play className="fill-white ml-1" />}
                  </button>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#A8A29E] mb-1">Document Audio</p>
                    <p className="font-semibold">Examen: Compréhension Globale & Détailée</p>
                  </div>
                </div>
                
                <div className="flex-1 w-full flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-[#F5F5F4] rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-[#1C1917]"
                      initial={{ width: 0 }}
                      animate={{ width: isPlaying ? '100%' : '0%' }}
                      transition={{ duration: 180, ease: 'linear' }} // Simulated 3 min audio
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(!isMuted)}>
                      {isMuted ? <VolumeX className="w-5 h-5 text-[#A8A29E]" /> : <Volume2 className="w-5 h-5 text-[#A8A29E]" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quiz Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#A8A29E] mb-2">Section {currentSectionIndex + 1}/{quizData.length}</p>
                    <h3 className="text-3xl font-semibold tracking-tight">{quizData[currentSectionIndex].title}</h3>
                  </div>
                  <div className="bg-[#E7E5E4] px-4 py-1.5 rounded-full text-sm font-medium">
                    {quizData[currentSectionIndex].points} Points
                  </div>
                </div>

                <div className="space-y-6">
                  {quizData[currentSectionIndex].questions.map((q) => (
                    <QuestionCard 
                      key={q.id} 
                      question={q} 
                      value={userAnswers[q.id]} 
                      onChange={(val) => handleAnswer(q.id, val)} 
                    />
                  ))}
                </div>

                <div className="flex justify-between pt-8 border-t border-[#E7E5E4]">
                  <button 
                    disabled={currentSectionIndex === 0}
                    onClick={() => setCurrentSectionIndex(prev => prev - 1)}
                    className="flex items-center gap-2 text-sm font-medium disabled:opacity-30 px-4 py-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </button>
                  
                  {currentSectionIndex < quizData.length - 1 ? (
                    <button 
                      onClick={() => setCurrentSectionIndex(prev => prev + 1)}
                      className="bg-[#1C1917] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#44403C] transition-colors flex items-center gap-2"
                    >
                      Suivant <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={finishQuiz}
                      className="bg-[#1C1917] text-white px-8 py-2 rounded-full text-sm font-medium hover:bg-[#44403C] transition-colors flex items-center gap-2"
                    >
                      Terminer <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {showResults && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 max-w-2xl mx-auto text-center"
            >
              <div>
                <Award className="w-16 h-16 mx-auto mb-6 text-[#1C1917]" />
                <h2 className="text-5xl font-light mb-4">Exercice terminé !</h2>
                <div className="text-6xl font-bold mb-6 tracking-tighter">
                  {calculateScore()} <span className="text-[#A8A29E] font-normal text-3xl">/ {totalQuestions}</span>
                </div>
                <p className="text-[#78716C] mb-8">
                  {calculateScore() / totalQuestions >= 0.8 ? "Excellent travail ! Votre compréhension est très précise." : 
                   calculateScore() / totalQuestions >= 0.5 ? "Bon résultat. Continuez à pratiquer pour améliorer votre score." :
                   "Un peu plus de pratique vous aidera à mieux saisir les détails."}
                </p>
              </div>

              <div className="flex justify-center flex-wrap gap-4">
                <button 
                  onClick={resetQuiz}
                  className="bg-[#1C1917] text-white px-8 py-3 rounded-full font-medium hover:bg-[#44403C] transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Recommencer
                </button>
                <button 
                  onClick={() => setState('history')}
                  className="border border-[#E7E5E4] px-8 py-3 rounded-full font-medium hover:bg-white transition-colors flex items-center gap-2"
                >
                  <History className="w-4 h-4" /> Voir mes progrès
                </button>
              </div>
            </motion.div>
          )}

          {state === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-semibold tracking-tight">Suivi des progrès</h3>
                <button 
                  onClick={() => {
                    localStorage.removeItem('eco_audition_history');
                    setHistory([]);
                  }}
                  className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                >
                  Effacer l'historique
                </button>
              </div>

              {history.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-[#E7E5E4] text-center">
                  <div className="bg-[#F5F5F4] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart2 className="w-8 h-8 text-[#A8A29E]" />
                  </div>
                  <p className="text-[#78716C]">Aucun exercice complété pour le moment.</p>
                  <button 
                    onClick={() => setState('home')}
                    className="mt-6 text-[#1C1917] font-semibold underline underline-offset-4"
                  >
                    Commencer votre premier test
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {history.map((result, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-[#E7E5E4] flex justify-between items-center transition-all hover:border-[#1C1917]/20 hover:shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.score / result.total >= 0.7 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                          <Award className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold">Score: {result.score} / {result.total}</p>
                          <p className="text-xs text-[#A8A29E]">{result.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold tracking-tight">
                          {Math.round((result.score / result.total) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(#E7E5E4_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  value: any;
  onChange: (val: any) => void;
  key?: Key;
}

const QuestionCard = ({ question, value, onChange }: QuestionCardProps) => {
  const isSelected = (opt: string) => {
    if (question.type === 'multiple') {
      return Array.isArray(value) && value.includes(opt);
    }
    return value === opt;
  };

  const handleToggle = (opt: string) => {
    if (question.type === 'multiple') {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(opt)) {
        onChange(current.filter(i => i !== opt));
      } else {
        onChange([...current, opt]);
      }
    } else {
      onChange(opt);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-3xl p-8 border border-[#E7E5E4] shadow-sm"
    >
      <p className="text-lg font-medium mb-6 leading-snug">{question.text}</p>
      
      {question.type === 'text' ? (
        <div className="relative">
          <input 
            type="text" 
            placeholder="Écrivez votre réponse ici..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#F5F5F4] border-none rounded-2xl p-4 focus:ring-2 focus:ring-[#1C1917] outline-none transition-all placeholder:text-[#A8A29E] font-medium"
          />
        </div>
      ) : (
        <div className="grid gap-3">
          {question.options?.map((opt) => (
            <button 
              key={opt}
              onClick={() => handleToggle(opt)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 flex justify-between items-center group ${
                isSelected(opt) 
                ? 'bg-[#1C1917] border-[#1C1917] text-white' 
                : 'bg-white border-[#E7E5E4] hover:border-[#1C1917] text-[#44403C]'
              }`}
            >
              <span className="font-medium">{opt}</span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                isSelected(opt) ? 'border-white bg-[#1C1917]' : 'border-[#D1D5DB] group-hover:border-[#1C1917]'
              }`}>
                {isSelected(opt) && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Simple BarChart2 mock since standard lucide might not have a filled version I like
function BarChart2(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-2">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
