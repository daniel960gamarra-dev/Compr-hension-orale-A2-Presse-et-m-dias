/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Key, useRef } from 'react';
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
  const [audioUrl, setAudioUrl] = useState<string>('/flashinfoa2.mp3'); // Placeholder
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

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
    const audio = audioElementRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(e => {
        console.error("Audio play error:", e);
        if (state === 'quiz') setAudioError("Impossible de lire l'audio. Vérifiez que le lien est direct.");
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, state]);

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const updateAudioUrl = (url: string) => {
    setAudioUrl(url);
    localStorage.setItem('eco_audition_audio', url);
    setIsPlaying(false);
    setAudioError(null);
    setAudioStatus('loading');
    if (audioElementRef.current) {
      audioElementRef.current.load();
    }
  };

  const handleTimeUpdate = () => {
    if (audioElementRef.current) {
      const progress = (audioElementRef.current.currentTime / audioElementRef.current.duration) * 100;
      setAudioProgress(isNaN(progress) ? 0 : progress);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioElementRef.current) {
      setAudioDuration(audioElementRef.current.duration);
      setAudioStatus('ready');
      setAudioError(null);
    }
  };

  const handleAudioError = () => {
    setAudioStatus('error');
    setAudioError("Erreur : Le lien fourni n'est pas un fichier audio valide ou l'accès est bloqué.");
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
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden select-none">
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setState('home')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Eco-Audition</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Niveau A1-Niveau A2 • Module Écoute</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setState('home')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${state === 'home' || state === 'quiz' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Pratique
            </button>
            <button 
              onClick={() => setState('history')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${state === 'history' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Progrès
            </button>
          </nav>
          
          <div className="h-8 w-px bg-slate-200 hidden md:block" />

          {state === 'quiz' && !showResults && (
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score actuel</div>
                <div className="text-xl font-mono font-bold text-indigo-600">{calculateScore()} / {totalQuestions}</div>
              </div>
              <button 
                onClick={finishQuiz}
                className="px-5 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                Terminer l'exercice
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <audio 
          src={audioUrl} 
          ref={audioElementRef}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleAudioError}
          onCanPlay={() => setAudioStatus('ready')}
          onWaiting={() => setAudioStatus('loading')}
          onPlaying={() => setAudioStatus('ready')}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {state === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center text-center"
            >
              <div className="max-w-xl space-y-8">
                <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  Nouvel exercice disponible
                </div>
                <h2 className="text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  Pratiquez votre <span className="text-indigo-600">Compréhension Orale</span>.
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Une simulation d'examen complète sur le thème de l'environnement, avec feedback instantané et suivi détaillé de vos progrès.
                </p>
                
                <div className="flex flex-col gap-6 items-center pt-8">
                  <button 
                    onClick={startQuiz}
                    className="group bg-indigo-600 text-white pl-8 pr-6 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all transform hover:-translate-y-1 shadow-2xl shadow-indigo-200 flex items-center gap-4"
                  >
                    Lancer l'exercice 
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>

                  <div className="pt-12 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-3">
                    <div className="w-8 h-px bg-slate-200"></div>
                    Prêt pour l'examen
                    <div className="w-8 h-px bg-slate-200"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'quiz' && !showResults && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex h-full p-6 gap-6 overflow-hidden"
            >
              {/* Sidebar */}
              <aside className="w-72 flex flex-col gap-6 shrink-0 h-full overflow-y-auto">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Progression</h2>
                  <div className="space-y-6">
                    {quizData.map((section, idx) => (
                      <div 
                        key={section.id} 
                        className={`flex items-center gap-4 transition-all ${
                          idx === currentSectionIndex 
                            ? 'opacity-100 scale-105' 
                            : idx < currentSectionIndex 
                              ? 'opacity-60' 
                              : 'opacity-40'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          idx === currentSectionIndex 
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' 
                            : idx < currentSectionIndex 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : 'bg-slate-100 text-slate-400'
                        }`}>
                          {idx < currentSectionIndex ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            `0${idx + 1}`
                          )}
                        </div>
                        <span className={`text-sm tracking-tight ${idx === currentSectionIndex ? 'font-bold text-indigo-600' : 'font-medium text-slate-600'}`}>
                          {section.title.split(' – ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                    <div className="text-4xl font-black text-slate-800 tracking-tighter">{calculateScore()} <span className="text-lg text-slate-300 font-bold">/ {totalQuestions}</span></div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Points estimés</div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-500 rounded-full opacity-10 blur-2xl" />
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                    Consignes
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300 font-medium">
                    {currentSectionIndex === 0 && "Identifiez la nature du document, le nombre d'intervenants et le thème général."}
                    {currentSectionIndex === 1 && "Portez une attention particulière aux détails : météo, activités scolaires et score sportif."}
                    {currentSectionIndex === 2 && "Saisissez précisément les dates, lieux et termes techniques manquants."}
                  </p>
                </div>
              </aside>

              {/* Main Quiz Area */}
              <section className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Audio Component */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center gap-6">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-100"
                  >
                    {isPlaying ? <Pause className="fill-white" /> : <Play className="fill-white ml-0.5" />}
                  </button>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Sonore</span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {isPlaying ? 'LECTURE EN COURS' : 'PRÊT À ÉCOUTER'}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)] transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3 rounded-xl transition-colors ${isMuted ? 'bg-slate-100 text-slate-400' : 'hover:bg-slate-100 text-slate-400 hover:text-indigo-600'}`}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Question Area */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  {audioError && (
                    <div className="bg-red-50 border-b border-red-100 p-4 text-red-600 text-xs font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        {audioError}
                      </div>
                      <button onClick={() => setAudioError(null)} className="opacity-50 hover:opacity-100">Ignorer</button>
                    </div>
                  )}
                  <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div>
                      <h3 className="font-bold text-slate-800 tracking-tight">{quizData[currentSectionIndex].title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{quizData[currentSectionIndex].points} points à gagner</p>
                    </div>
                    <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                      En cours
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    <div className="max-w-3xl mx-auto space-y-8">
                      {quizData[currentSectionIndex].questions.map((q) => (
                        <QuestionCard 
                          key={q.id} 
                          question={q} 
                          value={userAnswers[q.id]} 
                          onChange={(val) => handleAnswer(q.id, val)} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <button 
                      disabled={currentSectionIndex === 0}
                      onClick={() => setCurrentSectionIndex(prev => prev - 1)}
                      className="px-6 py-3 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 disabled:opacity-20 transition-all flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" /> Précédent
                    </button>
                    
                    <div className="flex gap-4">
                      {currentSectionIndex < quizData.length - 1 ? (
                        <button 
                          onClick={() => setCurrentSectionIndex(prev => prev + 1)}
                          className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
                        >
                          Étape Suivante <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={finishQuiz}
                          className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-2"
                        >
                          Terminer <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {showResults && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mb-8 relative">
                <Award className="w-12 h-12 text-indigo-600" />
                <motion.div 
                  className="absolute inset-0 bg-indigo-400 rounded-3xl"
                  initial={{ scale: 1, opacity: 0.2 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-4">Exercice Terminé</h2>
              <div className="text-8xl font-black text-indigo-600 tracking-tighter mb-8 flex items-baseline justify-center">
                {calculateScore()} <span className="text-3xl text-slate-300 ml-4">/ {totalQuestions}</span>
              </div>
              
              <div className="bg-white rounded-3xl p-8 border border-slate-200 max-w-lg mb-10 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${calculateScore() / totalQuestions >= 0.7 ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                <p className="text-slate-600 leading-relaxed font-medium">
                  {calculateScore() / totalQuestions >= 0.8 ? "Félicitations ! Vous avez une excellente oreille. Votre niveau de compréhension est très élevé." : 
                   calculateScore() / totalQuestions >= 0.5 ? "Bon travail ! Vous avez saisi la majeure partie du document sonore." :
                   "Continuez ainsi. Nous vous conseillons de réécouter le document pour identifier les détails manquants."}
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={resetQuiz}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3"
                >
                  <RotateCcw className="w-4 h-4" /> Recommencer
                </button>
                <button 
                  onClick={() => setState('history')}
                  className="px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3"
                >
                  <History className="w-4 h-4" /> Mon historique
                </button>
              </div>
            </motion.div>
          )}

          {state === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full"
            >
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Votre progression</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Historique des sessions locales</p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('eco_audition_history');
                    setHistory([]);
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 px-4 py-2 hover:bg-red-50 rounded-lg transition-all"
                >
                  Réinitialiser les données
                </button>
              </div>

              {history.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 border border-slate-100 text-center shadow-2xl shadow-slate-200/50">
                  <div className="bg-slate-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <BarChart2 className="w-12 h-12 text-slate-300" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800 mb-2">Aucune donnée pour le moment</h4>
                  <p className="text-slate-400 font-medium mb-10 max-w-xs mx-auto">Complétez votre premier exercice pour commencer à suivre votre progression.</p>
                  <button 
                    onClick={() => setState('home')}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all"
                  >
                    Lancer mon premier test
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {history.map((result, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-3xl p-8 border border-slate-100 flex justify-between items-center transition-all hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 group"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${result.score / result.total >= 0.7 ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                          <Award className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-800 tracking-tight">Score: {result.score} / {result.total}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <History className="w-3 h-3 text-slate-300" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result.date}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black tracking-tighter text-indigo-600 group-hover:scale-110 transition-transform">
                          {Math.round((result.score / result.total) * 100)}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <p className="text-sm font-bold text-slate-700 italic flex gap-3 leading-relaxed">
        <span className="text-indigo-600 tabular-nums font-black not-italic">{question.id}.</span> 
        {question.text}
      </p>
      
      {question.type === 'text' ? (
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Saisissez votre réponse ici..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl p-5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 font-medium text-sm shadow-sm group-hover:border-slate-200"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options?.map((opt) => (
            <button 
              key={opt}
              onClick={() => handleToggle(opt)}
              className={`text-left p-4 rounded-xl border transition-all flex justify-between items-center group relative overflow-hidden ${
                isSelected(opt) 
                ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200 text-indigo-800' 
                : 'bg-white border-slate-100 hover:border-indigo-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isSelected(opt) && (
                <motion.div 
                  layoutId="selected-indicator" 
                  className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600" 
                />
              )}
              <span className={`text-[13px] font-bold tracking-tight pr-4 ${isSelected(opt) ? 'text-indigo-800' : 'text-slate-600'}`}>{opt}</span>
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isSelected(opt) ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200 group-hover:border-indigo-300'
              }`}>
                {isSelected(opt) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
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
