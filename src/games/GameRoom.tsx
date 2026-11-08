import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Trophy, X } from 'lucide-react';
import Race3DGame from './Race3DGame';

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
  racer3d: 'Turbo Track Legends', quest: 'Adventure Quest', builder: 'Creative Builder', sports: 'Sports Arena', space: 'Space Explorer',
};
const memorySymbols = ['SUN','MOON','STAR','RAINBOW','LEAF','PLANET','COMET','CLOUD','FLOWER','OCEAN','HEART','LIGHTNING','MOUNTAIN','SNOWFLAKE','GALAXY'];
function createMemoryCards(level: number) {
  const pairs = Math.min(memorySymbols.length, 6 + Math.max(0, level - 1));
  return [...memorySymbols.slice(0, pairs), ...memorySymbols.slice(0, pairs)].sort(() => Math.random() - .5).map((symbol, id) => ({ id, symbol, matched: false }));
}
function makeQuestion(level = 1): Question {
  const a = 2 + Math.floor(Math.random() * (14 + level * 4)), b = 2 + Math.floor(Math.random() * (8 + level * 2));
  const answer = Math.random() > .5 ? a + b : a * b;
  const choices = Array.from(new Set([answer, answer + 2, Math.max(1, answer - 3), answer + 7])).sort(() => Math.random() - .5);
  return { prompt: `${a} ${answer === a + b ? '+' : '×'} ${b} = ?`, answer, choices };
}
function ActionButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label: string }) {
  return <button className="play-control" onClick={onClick} aria-label={label}>{children}</button>;
}
export default function GameRoom({ gameId, level, onClose, onReward }: Props) {
  if (gameId === 'racer3d') return <Race3DGame level={level} onClose={onClose} onReward={onReward} />;
