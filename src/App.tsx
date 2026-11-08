import { useMemo, useState } from 'react';
import { Brain, CarFront, Compass, Gamepad2, Rocket, Search, ShieldCheck, Trophy, WandSparkles, Volleyball, X, RotateCcw, Star } from 'lucide-react';

type Game = { id: string; title: string; category: string; description: string; icon: typeof Brain; tone: string; tag: string };
const games: Game[] = [
  { id: 'memory', title: 'Memory Galaxy', category: 'Brain Academy', description: 'Match the hidden pairs and train your memory.', icon: Brain, tone: 'violet', tag: 'Play now' },
  { id: 'number', title: 'Number Dash', category: 'Brain Academy', description: 'Solve quick number puzzles and build your streak.', icon: Star, tone: 'blue', tag: 'Coming next' },
  { id: 'racer', title: 'Speed Racers', category: 'Speed Racers', description: 'A colourful racing world built for quick challenges.', icon: CarFront, tone: 'orange', tag: 'Coming next' },
  { id: 'quest', title: 'Adventure Quest', category: 'Adventure Quest', description: 'Explore new worlds and discover hidden paths.', icon: Compass, tone: 'green', tag: 'Coming next' },
  { id: 'builder', title: 'Creative Builder', category: 'Creative Builder', description: 'Imagine, design, and build your own little world.', icon: WandSparkles, tone: 'pink', tag: 'Coming next' },
  { id: 'sports', title: 'Sports Arena', category: 'Sports Arena', description: 'Try friendly sports challenges and beat your best.', icon: Volleyball, tone: 'teal', tag: 'Coming next' },
  { id: 'space', title: 'Space Explorer', category: 'Space Explorer', description: 'Travel through the stars and learn about space.', icon: Rocket, tone: 'indigo', tag: 'Coming next' },
];
const categories = ['All games', 'Brain Academy', 'Speed Racers', 'Adventure Quest', 'Creative Builder', 'Sports Arena', 'Space Explorer'];
const symbols = ['☀️', '🌙', '⭐', '🌈', '🍀', '🪐'];
function shuffledCards() { return [...symbols, ...symbols].map((symbol, index) => ({ id: `${index}-${Math.random()}`, symbol, matched: false })); }

function MemoryGame({ onClose, onWin }: { onClose: () => void; onWin: () => void }) {
  const [cards, setCards] = useState(() => shuffledCards());
  const [picked, setPicked] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const done = cards.every(card => card.matched);
  function choose(id: string) {
    if (locked || picked.includes(id) || cards.find(card => card.id === id)?.matched || done) return;
    const next = [...picked, id]; setPicked(next);
    if (next.length === 2) {
      setMoves(value => value + 1); setLocked(true);
      const [first, second] = next.map(key => cards.find(card => card.id === key)!);
      if (first.symbol === second.symbol) {
        setTimeout(() => { setCards(current => current.map(card => card.id === first.id || card.id === second.id ? { ...card, matched: true } : card)); setPicked([]); setLocked(false); }, 350);
      } else {
        setTimeout(() => { setPicked([]); setLocked(false); }, 850);
      }
    }
  }
  if (done) onWin();
  return <div className="game-overlay"><section className="game-panel"><div className="game-top"><div><span className="eyebrow">BRAIN ACADEMY</span><h2>Memory Galaxy</h2><p>Find all six matching pairs.</p></div><button className="icon-button" onClick={onClose} aria-label="Close game"><X /></button></div><div className="game-stats"><span>Moves <b>{moves}</b></span><span>Pairs <b>{cards.filter(c => c.matched).length}/6</b></span></div><div className="memory-grid">{cards.map(card => { const visible = card.matched || picked.includes(card.id); return <button key={card.id} className={`memory-card ${visible ? 'revealed' : ''} ${card.matched ? 'matched' : ''}`} onClick={() => choose(card.id)} aria-label={visible ? card.symbol : 'Hidden card'}>{visible ? card.symbol : '?'}</button>; })}</div><div className="game-actions"><button className="secondary-button" onClick={() => { setCards(shuffledCards()); setPicked([]); setMoves(0); setLocked(false); }}><RotateCcw size={16}/> Restart</button><span className="hint">Take your time — there is no timer.</span></div>{done && <div className="win-message"><Trophy /> Great job! You matched every pair.</div>}</section></div>;
}

export default function App() {
  const [category, setCategory] = useState('All games');
  const [query, setQuery] = useState('');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const filtered = useMemo(() => games.filter(game => (category === 'All games' || game.category === category) && `${game.title} ${game.description} ${game.category}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <main className="app-shell"><header className="topbar"><a className="brand" href="#home"><span className="brand-mark"><Gamepad2 /></span><span>Kid<span>Versa</span><small>PLAY • LEARN • CREATE • EXPLORE</small></span></a><nav><a href="#games">Games</a><a href="#worlds">Worlds</a><a href="#safety">Safe play</a></nav><div className="top-actions"><span className="star-count"><Star size={16} fill="currentColor"/> {stars}</span><button className="profile-button" aria-label="Player profile">P</button></div></header>
    <section className="hero" id="home"><div className="hero-copy"><span className="eyebrow">YOUR NEXT ADVENTURE STARTS HERE</span><h1>A universe of fun.<br/><em>A world of discovery.</em></h1><p>Play exciting games, solve clever challenges, and let your imagination explore new worlds.</p><a className="primary-button" href="#games">Explore games <span>→</span></a><div className="hero-note"><ShieldCheck size={17}/> Designed with safer play in mind</div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="planet planet-main">K<span>V</span></div><div className="planet planet-small">★</div><div className="floating f1">✦</div><div className="floating f2">✧</div><div className="floating f3">●</div><div className="art-label">IMAGINE MORE</div></div></section>
    <section className="quick-stats"><div><span className="stat-icon purple"><Gamepad2/></span><span><b>7</b><small>Game worlds</small></span></div><div><span className="stat-icon orange"><Trophy/></span><span><b>{stars}</b><small>Stars earned</small></span></div><div><span className="stat-icon green"><ShieldCheck/></span><span><b>Safe</b><small>Play-first design</small></span></div></section>
    <section className="games-section" id="games"><div className="section-heading"><div><span className="eyebrow">PICK YOUR ADVENTURE</span><h2>Explore the game zone</h2><p>Choose a world and discover something new.</p></div><label className="search-box"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search games..."/></label></div><div className="filters">{categories.map(item => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="game-grid">{filtered.map(game => { const Icon = game.icon; return <article className="game-card" key={game.id}><div className={`game-art ${game.tone}`}><Icon size={44}/><span className="art-spark">✦</span></div><div className="game-card-body"><span className="game-category">{game.category}</span><h3>{game.title}</h3><p>{game.description}</p><button className="card-link" onClick={() => game.id === 'memory' ? setActiveGame('memory') : undefined} disabled={game.id !== 'memory'}>{game.id === 'memory' ? 'Play game →' : 'Coming soon'}</button></div></article>; })}</div>{filtered.length === 0 && <p className="empty-state">No games found. Try another search.</p>}</section>
    <section className="worlds-section" id="worlds"><div><span className="eyebrow">MORE THAN A GAME</span><h2>Big ideas begin with play.</h2><p>Build confidence, curiosity, creativity, and problem-solving one adventure at a time.</p></div><div className="world-pills"><span>Think creatively</span><span>Explore science</span><span>Practice logic</span><span>Keep moving</span></div></section>
    <footer id="safety"><div className="footer-brand">KidVersa™</div><p>Play • Learn • Create • Explore</p><div className="safety-note"><ShieldCheck size={17}/> No public chat. No location sharing. No targeted ads.</div><small>© 2026 PCMDK369™. KidVersa is in active development.</small></footer>
    {activeGame === 'memory' && <MemoryGame onClose={() => setActiveGame(null)} onWin={() => setStars(value => value < 6 ? value + 6 : value)}/>}
    </main>;
}
