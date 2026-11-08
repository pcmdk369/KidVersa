import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Trophy, X } from 'lucide-react';

type Props = { gameId: string; level: number; onClose: () => void; onReward: (amount: number) => void };
type Question = { prompt: string; answer: number; choices: number[] };
const questionBank = [
  { q: 'Which planet is known as the Red Planet?', a: 'Mars', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'] },
  { q: 'How many sides does a hexagon have?', a: '6', options: ['5', '6', '7', '8'] },
  { q: 'What gas do plants absorb?', a: 'Carbon dioxide', options: ['Oxygen', 'Hydrogen', 'Carbon dioxide', 'Helium'] },
  { q: 'What is the largest ocean on Earth?', a: 'Pacific', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'] },
  { q: 'How many minutes are in one hour?', a: '60', options: ['30', '45', '60', '90'] },
];
const titles: Record<string, string> = {
  memory: 'Memory Galaxy', number: 'Number Dash', racer: 'Speed Racers',
  quest: 'Adventure Quest', builder: 'Creative Builder', sports: 'Sports Arena', space: 'Space Explorer',
};
function makeQuestion(): Question {
  const a = 2 + Math.floor(Math.random() * 18), b = 2 + Math.floor(Math.random() * 12);
  const answer = Math.random() > .5 ? a + b : a * b;
  const choices = Array.from(new Set([answer, answer + 2, Math.max(1, answer - 3), answer + 7])).sort(() => Math.random() - .5);
  return { prompt: `${a} ${answer === a + b ? '+' : '×'} ${b} = ?`, answer, choices };
}
function ActionButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return <button className="play-control" onClick={onClick} aria-label={label}>{children}</button>;
}
export default function GameRoom({ gameId, level, onClose, onReward }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [question, setQuestion] = useState(makeQuestion);
  const [message, setMessage] = useState('Choose an answer to begin.');
  const [cards, setCards] = useState(() => [...['SUN','MOON','STAR','RAINBOW','LEAF','PLANET'], ...['SUN','MOON','STAR','RAINBOW','LEAF','PLANET']].sort(() => Math.random() - .5).map((symbol, i) => ({ id: i, symbol, matched: false })));
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [lane, setLane] = useState(1);
  const [drives, setDrives] = useState(0);
  const [hits, setHits] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gems, setGems] = useState<string[]>([]);
  const [tiles, setTiles] = useState<string[]>(Array(64).fill(''));
  const [paint, setPaint] = useState('violet');
  const [shots, setShots] = useState(0);
  const [goals, setGoals] = useState(0);
  const [lastShot, setLastShot] = useState('');
  const [scienceIndex, setScienceIndex] = useState(0);
  const [scienceScore, setScienceScore] = useState(0);

  const memoryDone = gameId === 'memory' && cards.every(card => card.matched);
  useEffect(() => { if (memoryDone && !rewarded) { setRewarded(true); onReward(10); } }, [memoryDone, rewarded, onReward]);
  useEffect(() => {
    if (gameId !== 'quest') return;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const moves: Record<string, [number, number]> = { arrowup: [0,-1], w: [0,-1], arrowdown: [0,1], s: [0,1], arrowleft: [-1,0], a: [-1,0], arrowright: [1,0], d: [1,0] };
      if (moves[key]) { event.preventDefault(); move(moves[key][0], moves[key][1]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const done = gameId === 'memory' ? cards.every(card => card.matched)
    : gameId === 'racer' ? drives >= 12
    : gameId === 'quest' ? gems.length >= 5
    : gameId === 'sports' ? shots >= 5
    : gameId === 'builder' ? false
    : gameId === 'space' ? scienceIndex >= questionBank.length
    : gameId === 'number' ? round >= 8 : complete;

  function finish(extra = 0) {
    setComplete(true);
    if (!rewarded) { setRewarded(true); onReward(Math.max(5, Math.min(20, score + extra))); }
  }
  function answerMath(value: number) {
    if (complete || round >= 8) return;
    if (value === question.answer) { setScore(s => s + 2); setMessage('Correct! Great thinking.'); }
    else setMessage(`Good try. The answer was ${question.answer}.`);
    const next = round + 1; setRound(next);
    if (next >= 8) finish(value === question.answer ? 2 : 0);
    else setQuestion(makeQuestion());
  }
  function flip(index: number) {
    if (picked.length === 2 || cards[index].matched || picked.includes(index) || complete) return;
    const next = [...picked, index]; setPicked(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = next;
      if (cards[a].symbol === cards[b].symbol) {
        window.setTimeout(() => {
          setCards(current => current.map(c => c.id === a || c.id === b ? { ...c, matched: true } : c));
          setPicked([]);
          setScore(s => s + 2);
        }, 300);
      } else window.setTimeout(() => setPicked([]), 750);
    }
  }
  function drive() {
    if (drives >= 12 || complete) return;
    const obstacle = (drives * 7 + 2) % 3;
    if (lane === obstacle) { setHits(h => h + 1); setMessage('Obstacle! Change lanes next time.'); }
    else { setScore(s => s + 1); setMessage('Nice driving! Clear road.'); }
    const next = drives + 1; setDrives(next);
    if (next === 12) finish();
  }
  function move(dx: number, dy: number) {
    if (complete) return;
    const x = Math.max(0, Math.min(6, position.x + dx));
    const y = Math.max(0, Math.min(6, position.y + dy));
    const key = `${x},${y}`;
    setPosition({ x, y });
    if (key === '6,0') { finish(5); setMessage('You reached the crystal gate!'); return; }
    if (['1,1','3,2','5,4','2,5','4,0'].includes(key) && !gems.includes(key)) {
      const next = [...gems, key]; setGems(next); setScore(s => s + 1);
      if (next.length >= 5) { setComplete(true); if (!rewarded) { setRewarded(true); onReward(10); } }
    }
  }
  function shoot(zone: number) {
    if (shots >= 5 || complete) return;
    const keeper = (shots * 2 + 1) % 5;
    const scored = zone !== keeper;
    const next = shots + 1;
    setShots(next); setGoals(g => g + (scored ? 1 : 0));
    setLastShot(scored ? 'GOAL! Great aim.' : 'The keeper saved it. Try again.');
    if (scored) setScore(s => s + 2);
    if (next === 5) finish(scored ? 2 : 0);
  }
  function chooseScience(value: string) {
    const item = questionBank[scienceIndex];
    const correct = value === item.a;
    const nextScore = scienceScore + (correct ? 1 : 0);
    setScienceScore(nextScore); setScienceIndex(i => i + 1);
    setMessage(correct ? 'Correct discovery!' : `Answer: ${item.a}`);
    if (scienceIndex + 1 === questionBank.length) {
      setScore(nextScore * 2); setComplete(true);
      if (!rewarded) { setRewarded(true); onReward(5 + nextScore * 2); }
    }
  }
  function reset() {
    setRound(0); setScore(0); setComplete(false); setRewarded(false); setQuestion(makeQuestion());
    setCards(() => [...['SUN','MOON','STAR','RAINBOW','LEAF','PLANET'], ...['SUN','MOON','STAR','RAINBOW','LEAF','PLANET']].sort(() => Math.random() - .5).map((symbol, i) => ({ id: i, symbol, matched: false })));
    setPicked([]); setMoves(0); setLane(1); setDrives(0); setHits(0); setPosition({x:0,y:0}); setGems([]);
    setTiles(Array(64).fill('')); setShots(0); setGoals(0); setLastShot(''); setScienceIndex(0); setScienceScore(0); setMessage('Ready for a new round.');
  }
  const mapCells = useMemo(() => Array.from({ length: 49 }, (_, i) => {
    const x = i % 7, y = Math.floor(i / 7), key = `${x},${y}`;
    return { key, x, y, gem: ['1,1','3,2','5,4','2,5','4,0'].includes(key), gate: key === '6,0' };
  }), []);
  const science = questionBank[scienceIndex % questionBank.length];
  return <div className="game-overlay"><section className="game-panel game-panel-wide">
    <div className="game-top"><div><span className="eyebrow">KIDVERSA GAME WORLD · LEVEL {level}</span><h2>{titles[gameId] ?? 'Game'}</h2><p>Play at your own pace. No countdowns or purchases.</p></div><button className="icon-button" onClick={onClose} aria-label="Close game"><X /></button></div>
    <div className="level-track"><div><span>LEVEL {level}</span><b>{Math.min(100, (level - 1) * 11)}% progress</b></div><div className="level-track-bar"><i style={{width: `${Math.min(100, (level - 1) * 11)}%`}}/></div></div><div className="game-stats"><span>Score <b>{score}</b></span><span>Round <b>{gameId === 'memory' ? moves : gameId === 'racer' ? drives : gameId === 'sports' ? shots : gameId === 'space' ? scienceIndex : round}</b></span><span>{gameId === 'quest' ? 'Crystals' : gameId === 'sports' ? 'Goals' : 'Best effort'} <b>{gameId === 'quest' ? gems.length : gameId === 'sports' ? goals : gameId === 'racer' ? hits + ' bumps' : 'Keep going'}</b></span></div>
    {gameId === 'memory' && <><p className="game-instruction">Match all six pairs. Remember where each symbol is hiding.</p><div className="memory-grid">{cards.map(card => { const visible = card.matched || picked.includes(card.id); return <button key={card.id} className={`memory-card ${visible ? 'revealed' : ''} ${card.matched ? 'matched' : ''}`} onClick={() => flip(card.id)} aria-label={visible ? card.symbol : 'Hidden card'}>{visible ? card.symbol : '?'}</button>; })}</div></>}
    {gameId === 'number' && <div className="challenge-box"><span className="eyebrow">MATH CHALLENGE</span><h3>{question.prompt}</h3><p>{message}</p><div className="answer-grid">{question.choices.map(n => <button key={n} className="answer-button" onClick={() => answerMath(n)} disabled={complete}>{n}</button>)}</div></div>}
    {gameId === 'racer' && <div className="race-board"><p className="game-instruction">Switch lanes to avoid the next obstacle, then drive forward.</p><div className="road">{[0,1,2].map(n => <div key={n} className={`race-lane ${lane === n ? 'selected-lane' : ''}`}><span className="road-line"/>{(drives * 7 + 2) % 3 === n && drives < 12 && <span className="obstacle">◆</span>}{lane === n && <span className="player-car">▲</span>}</div>)}</div><div className="control-row">{[0,1,2].map(n => <button key={n} className={lane === n ? 'answer-button chosen' : 'answer-button'} onClick={() => setLane(n)}>Lane {n+1}</button>)}</div><button className="primary-game-button" onClick={drive} disabled={drives >= 12}>Drive forward</button><p className="hint">{12-drives} track sections remaining</p></div>}
    {gameId === 'quest' && <div className="quest-area"><p className="game-instruction">Explore the map, collect five crystals, and reach the gate at the top-right.</p><div className="quest-grid">{mapCells.map(cell => <div key={cell.key} className={`quest-cell ${cell.gem && !gems.includes(cell.key) ? 'crystal' : ''} ${cell.gate ? 'gate' : ''} `}>{position.x === cell.x && position.y === cell.y ? 'P' : cell.gate ? 'G' : cell.gem && !gems.includes(cell.key) ? '✦' : ''}</div>)}</div><div className="direction-pad"><ActionButton label="Move up" onClick={() => move(0,-1)}><ArrowUp/></ActionButton><div><ActionButton label="Move left" onClick={() => move(-1,0)}><ArrowLeft/></ActionButton><ActionButton label="Move down" onClick={() => move(0,1)}><ArrowDown/></ActionButton><ActionButton label="Move right" onClick={() => move(1,0)}><ArrowRight/></ActionButton></div></div><p className="hint">Keyboard: arrow keys or WASD. Player starts at bottom-left.</p></div>}
    {gameId === 'builder' && <div className="builder-area"><p className="game-instruction">Create a pattern or picture. Select a tile, then tap the board to paint.</p><div className="palette">{['violet','blue','orange','green','pink','teal',''].map(color => <button key={color || 'erase'} className={`palette-swatch ${color} ${paint === color ? 'chosen' : ''}`} onClick={() => setPaint(color)} aria-label={color || 'Erase'}>{color ? '' : '×'}</button>)}</div><div className="builder-grid">{tiles.map((tile, i) => <button key={i} className={`builder-tile ${tile}`} onClick={() => setTiles(current => current.map((v, n) => n === i ? paint : v))} aria-label={`Paint tile ${i+1}`}/>)}</div><div className="game-actions"><span className="hint">Your design stays in this session.</span><button className="secondary-button" onClick={() => setTiles(Array(64).fill(''))}><RotateCcw size={15}/> Clear board</button></div></div>}
    {gameId === 'sports' && <div className="sports-area"><p className="game-instruction">Penalty shootout! Choose one of five goal zones. Avoid the goalkeeper.</p><div className="goal-frame"><div className="goal-net">{[0,1,2,3,4].map(n => <button key={n} className="goal-zone" onClick={() => shoot(n)} disabled={shots >= 5}>Shoot</button>)}</div><span className="keeper">KEEPER</span></div><p className="game-feedback">{lastShot || 'Pick your target.'}</p><p className="hint">Five shots. How many goals can you score?</p></div>}
    {gameId === 'space' && <div className="challenge-box"><span className="eyebrow">SPACE SCIENCE QUIZ</span><h3>{science.q}</h3><p>{message}</p><div className="answer-grid">{science.options.map(option => <button key={option} className="answer-button" onClick={() => chooseScience(option)} disabled={complete}>{option}</button>)}</div><p className="hint">Question {Math.min(scienceIndex+1, questionBank.length)} of {questionBank.length}</p></div>}
    {done && <div className="win-message"><Trophy/> Challenge complete! You earned stars for your effort.</div>}
    {gameId === 'builder' && <p className="builder-note">Creative mode is open-ended — finish when you are happy with your design.</p>}
    <div className="game-actions"><button className="secondary-button" onClick={reset}><RotateCcw size={15}/> Restart</button><button className="secondary-button" onClick={onClose}>Back to game zone</button></div>
  </section></div>;
}
