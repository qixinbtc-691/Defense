import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Target, Trophy, RotateCcw, Play, Info, Languages, Plane, TowerControl as TowerIcon } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import { GameStatus } from './types';
import { WIN_SCORE } from './constants';

type Language = 'en' | 'zh';

const TRANSLATIONS = {
  en: {
    title: 'Joanne Nova Defense',
    start: 'Start Mission',
    restart: 'Play Again',
    gameOver: 'Defense Line Collapsed...',
    win: 'Nova Secured!',
    roundEnd: 'Round Clear!',
    score: 'Score',
    target: 'Target',
    instructions: "Planes are falling from the sky,\nCities scream and people cry!\nClick the screen to fire away,\nSave the world and win the day!",
    ammo: 'Ammo',
    status: 'Status',
    language: '中文',
    rules: 'Rules',
    close: 'Close',
  },
  zh: {
    title: 'Joanne新星防御',
    start: '开始任务',
    restart: '再玩一次',
    gameOver: '防线崩溃……',
    win: '新星已安全！',
    roundEnd: '本轮结束！',
    score: '得分',
    target: '目标',
    instructions: "敌机呼啸从天降，\n城市危在旦夕间！\n指尖轻点发导弹，\n守卫家园保平安！\n\n【游戏规则】\n1. 点击屏幕发射导弹拦截敌机\n2. 导弹在点击位置爆炸产生范围伤害\n3. 保护底部的城市和炮台不被摧毁\n4. 击毁敌机获得积分，达到1000分获胜\n5. 炮台弹药有限，每轮结束后会自动补充",
    ammo: '弹药',
    status: '状态',
    language: 'English',
    rules: '游戏规则',
    close: '关闭',
  }
};

export default function App() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [score, setScore] = useState(0);
  const [lang, setLang] = useState<Language>('zh');
  const [showRules, setShowRules] = useState(false);

  const t = TRANSLATIONS[lang];

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {t.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{t.score}</span>
            <span className="text-2xl font-mono font-bold text-emerald-400">{score.toString().padStart(5, '0')}</span>
          </div>
          <div className="h-10 w-[1px] bg-zinc-800" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{t.target}</span>
            <span className="text-2xl font-mono font-bold text-zinc-300">{WIN_SCORE}</span>
          </div>
          <button 
            onClick={toggleLang}
            className="ml-4 p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          >
            <Languages className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative w-full max-w-4xl">
        <GameCanvas 
          status={status} 
          onScoreChange={setScore} 
          onStatusChange={setStatus} 
        />

        {/* Overlays */}
        <AnimatePresence>
          {status !== 'PLAYING' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center p-8 max-w-md"
              >
                {status === 'START' && (
                  <div className="border-2 border-emerald-500/30 bg-emerald-500/5 p-8 rounded-2xl backdrop-blur-md shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)]">
                    <div className="mb-6 flex justify-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/40 rotate-12">
                        <Plane className="w-8 h-8 text-red-400" />
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/40 -rotate-12">
                        <TowerIcon className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 tracking-tighter">{t.title}</h2>
                    
                    <div className="flex flex-col gap-4 mb-8">
                      <button 
                        onClick={() => setStatus('PLAYING')}
                        className="group relative px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 w-full shadow-lg shadow-emerald-500/20"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        {t.start}
                      </button>

                      <button 
                        onClick={() => setShowRules(true)}
                        className="px-10 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-full transition-all flex items-center justify-center gap-2 border border-zinc-700"
                      >
                        <Info className="w-4 h-4" />
                        {t.rules}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showRules && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        >
                          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                            <h3 className="text-xl font-bold mb-4 text-emerald-400 flex items-center gap-2">
                              <Info className="w-5 h-5" />
                              {t.rules}
                            </h3>
                            <div className="text-left text-zinc-300 text-sm space-y-2 mb-6 whitespace-pre-line leading-relaxed">
                              {t.instructions}
                            </div>
                            <button 
                              onClick={() => setShowRules(false)}
                              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors"
                            >
                              {t.close}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {status === 'GAME_OVER' && (
                  <>
                    <div className="mb-6 flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/40">
                        <RotateCcw className="w-10 h-10 text-red-400" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-red-400">{t.gameOver}</h2>
                    <p className="text-zinc-400 mb-8">{t.score}: {score}</p>
                    <button 
                      onClick={() => setStatus('START')}
                      className="px-8 py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                    >
                      <RotateCcw className="w-5 h-5" />
                      {t.restart}
                    </button>
                  </>
                )}

                {status === 'WIN' && (
                  <>
                    <div className="mb-6 flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/40">
                        <Trophy className="w-10 h-10 text-yellow-400" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-yellow-400">{t.win}</h2>
                    <p className="text-zinc-400 mb-8">{t.score}: {score}</p>
                    <button 
                      onClick={() => setStatus('START')}
                      className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                    >
                      <RotateCcw className="w-5 h-5" />
                      {t.restart}
                    </button>
                  </>
                )}

                {status === 'ROUND_END' && (
                  <>
                    <div className="mb-6 flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                        <Shield className="w-10 h-10 text-blue-400" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-blue-400">{t.roundEnd}</h2>
                    <p className="text-zinc-400 mb-4">{t.score}: {score}</p>
                    <p className="text-zinc-500 text-sm italic">Ammo refilled. Bonus points added.</p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Controls Info */}
      <div className="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-zinc-500 mt-1 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Defense</h4>
            <p className="text-sm text-zinc-400">Protect the 6 cities and 3 missile batteries from incoming rockets.</p>
          </div>
        </div>
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-start gap-3">
          <Target className="w-5 h-5 text-zinc-500 mt-1 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Intercept</h4>
            <p className="text-sm text-zinc-400">Click to fire. Interceptors explode at the target location. Lead your shots!</p>
          </div>
        </div>
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-start gap-3">
          <Trophy className="w-5 h-5 text-zinc-500 mt-1 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Victory</h4>
            <p className="text-sm text-zinc-400">Reach 1000 points to secure the Nova. Each rocket destroyed is 20 points.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
