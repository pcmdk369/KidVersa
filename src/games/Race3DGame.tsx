import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Gauge, Pause, Play, RotateCcw, Trophy, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { playRaceEffect, startRaceAudio, stopRaceAudio, updateRaceAudio } from './raceAudio';
import './race3d.css';

type Props = { level: number; onClose: () => void; onReward: (amount: number) => void };
type CarKind = 'sport' | 'super' | 'kart' | 'monster';
type WorldKind = 'city' | 'desert' | 'forest' | 'mountain' | 'beach';
type RaceMode = 'quick' | 'championship' | 'time';
const laneX = [-2.25, 0, 2.25];
const palettes: Record<WorldKind, { sky: string; ground: string; road: string; accent: string; label: string }> = {
  city: { sky: '#9bc8ed', ground: '#7896a4', road: '#303747', accent: '#f6c85f', label: 'Neon City' },
  desert: { sky: '#f4c58b', ground: '#d9a65e', road: '#51463e', accent: '#e9d08b', label: 'Sunset Desert' },
  forest: { sky: '#a8d9c4', ground: '#4f956f', road: '#344b42', accent: '#a9e5a0', label: 'Emerald Forest' },
  mountain: { sky: '#b9d6ed', ground: '#8b9aab', road: '#414957', accent: '#e9f4ff', label: 'Cloud Peaks' },
  beach: { sky: '#8ed8e9', ground: '#e5ca8b', road: '#59666a', accent: '#fff0a8', label: 'Sunny Coast' },
};
const carNames: Record<CarKind, string> = { sport: 'Street Racer', super: 'Hyper GT', kart: 'Turbo Kart', monster: 'Monster Truck' };

function Vehicle({ color, kind, position, rotation = 0 }: { color: string; kind: CarKind; position: [number, number, number]; rotation?: number }) {
  const monster = kind === 'monster';
  const kart = kind === 'kart';
  const bodyLength = kart ? 1.45 : monster ? 2.05 : kind === 'super' ? 2.15 : 1.9;
  const wheelRadius = monster ? 0.39 : kart ? 0.2 : 0.27;
  return <group position={position} rotation={[0, rotation, 0]} scale={monster ? [1.12, 1.22, 1.12] : kart ? [0.86, 0.78, 0.86] : [1, 1, 1]}>
    <mesh position={[0, 0.48, 0]} castShadow><boxGeometry args={[1.22, 0.42, bodyLength]} /><meshStandardMaterial color={color} roughness={0.32} metalness={0.35} /></mesh>
    <mesh position={[0, 0.79, -0.12]} castShadow><boxGeometry args={[0.88, 0.48, bodyLength * 0.42]} /><meshStandardMaterial color="#bfe8f6" metalness={0.2} roughness={0.16} /></mesh>
    <mesh position={[0, 0.34, bodyLength * 0.43]}><boxGeometry args={[0.82, 0.12, 0.08]} /><meshStandardMaterial color="#fff2bd" emissive="#ffbd54" emissiveIntensity={0.7} /></mesh>
    <mesh position={[0, 0.36, -bodyLength * 0.48]}><boxGeometry args={[0.82, 0.12, 0.08]} /><meshStandardMaterial color="#f05252" emissive="#b91c1c" emissiveIntensity={0.35} /></mesh>
    {([-1, 1] as const).flatMap(side => [-1, 1].map(axle => <mesh key={side + ':' + axle} position={[side * (monster ? 0.69 : 0.65), wheelRadius, axle * bodyLength * 0.31]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[wheelRadius, wheelRadius, monster ? 0.3 : 0.2, 16]} /><meshStandardMaterial color="#18202a" roughness={0.9} /></mesh>))}
    {kind === 'super' && <mesh position={[0, 0.78, -bodyLength * 0.45]}><boxGeometry args={[1.35, 0.08, 0.18]} /><meshStandardMaterial color={color} /></mesh>}
    {monster && <mesh position={[0, 0.9, -0.72]}><boxGeometry args={[1.45, 0.12, 0.18]} /><meshStandardMaterial color="#242b36" /></mesh>}
    {kart && <mesh position={[0, 0.84, -0.35]}><boxGeometry args={[0.12, 0.35, 0.12]} /><meshStandardMaterial color="#222" /></mesh>}
  </group>;
}

function TrackWorld({ lane, color, kind, world, speed, paused, onCrash, onDistance }: {
  lane: number; color: string; kind: CarKind; world: WorldKind; speed: number; paused: boolean;
  onCrash: () => void; onDistance: (distance: number) => void;
}) {
  const theme = palettes[world];
  const stripes = useRef<THREE.Group>(null);
  const scenery = useRef<THREE.Group>(null);
  const traffic = useRef<THREE.Group>(null);
  const distance = useRef(0);
  const hitCooldown = useRef(0);
  const lastReport = useRef(0);
  const cars = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ lane: (i * 7 + 1) % 3, z: -12 - i * 17, color: ['#f97316', '#8b5cf6', '#22a6a1', '#eab308'][i % 4] })), []);
  const sceneryItems = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ x: (i % 2 ? 1 : -1) * (5 + (i % 3) * 1.7), z: -i * 7 - 5, size: 0.7 + (i % 4) * 0.22 })), []);
  useFrame((_, delta) => {
    if (paused) return;
    const step = Math.min(delta, 0.05) * speed * 0.32;
    distance.current += step;
    if (stripes.current) stripes.current.children.forEach(child => { child.position.z += step; if (child.position.z > 8) child.position.z -= 80; });
    if (scenery.current) scenery.current.children.forEach(child => { child.position.z += step; if (child.position.z > 10) child.position.z -= 245; });
    if (traffic.current) traffic.current.children.forEach((child, i) => {
      child.position.z += step * (i % 2 === 0 ? 0.88 : 0.72);
      if (child.position.z > 6) {
        child.position.z = -100 - (i * 11);
        child.position.x = laneX[(i * 5 + Math.floor(distance.current / 90)) % 3];
      }
      if (child.position.z > -1.3 && child.position.z < 1.3 && Math.abs(child.position.x - laneX[lane]) < 0.95 && hitCooldown.current <= 0) {
        hitCooldown.current = 1.5;
        onCrash();
      }
    });
    hitCooldown.current = Math.max(0, hitCooldown.current - delta);
    if (distance.current - lastReport.current > 8) { lastReport.current = distance.current; onDistance(distance.current); }
  });
  return <group>
    <color attach="background" args={[theme.sky]} />
    <fog attach="fog" args={[theme.sky, 35, 145]} />
    <ambientLight intensity={1.15} />
    <directionalLight position={[8, 14, 5]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, -45]} receiveShadow><planeGeometry args={[240, 260]} /><meshStandardMaterial color={theme.ground} /></mesh>
    <mesh position={[0, 0, -45]}><boxGeometry args={[8.2, 0.2, 250]} /><meshStandardMaterial color={theme.road} roughness={0.95} /></mesh>
    <group ref={stripes}>{Array.from({ length: 20 }, (_, i) => <group key={i} position={[0, 0, -i * 4]}><mesh position={[-1.12, 0.015, 0]}><boxGeometry args={[0.045, 0.025, 1.7]} /><meshStandardMaterial color="#e8edf2" /></mesh><mesh position={[1.12, 0.015, 0]}><boxGeometry args={[0.045, 0.025, 1.7]} /><meshStandardMaterial color="#e8edf2" /></mesh></group>)}</group>
    <group ref={scenery}>{sceneryItems.map((item, i) => <group key={i} position={[item.x, 0, item.z]} scale={item.size}>
      {world === 'city' ? <><mesh position={[0, 2.4, 0]}><boxGeometry args={[2.1, 4.8, 2]} /><meshStandardMaterial color={i % 2 ? '#64748b' : '#8b9ab0'} /></mesh><mesh position={[0, 4.9, 0]}><boxGeometry args={[1.5, 0.12, 1.5]} /><meshStandardMaterial color={theme.accent} emissive={theme.accent} emissiveIntensity={0.4} /></mesh></>
        : world === 'mountain' ? <mesh position={[0, 1.8, 0]}><coneGeometry args={[2.5, 4.5, 5]} /><meshStandardMaterial color={i % 2 ? '#71859a' : '#9cabb9'} /></mesh>
        : <><mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.13, 0.2, 2.2, 8]} /><meshStandardMaterial color="#76523a" /></mesh><mesh position={[0, 2.5, 0]}><coneGeometry args={[1.25, 2.6, 7]} /><meshStandardMaterial color={world === 'desert' ? '#58804c' : world === 'beach' ? '#4d9d73' : '#2e8058'} /></mesh></>}
    </group>)}</group>
    <group ref={traffic}>{cars.map((car, i) => <group key={i} position={[laneX[car.lane], 0, car.z]}><Vehicle color={car.color} kind={i % 3 === 0 ? 'kart' : 'sport'} position={[0, 0, 0]} rotation={Math.PI} /></group>)}</group>
    <Vehicle color={color} kind={kind} position={[laneX[lane], 0, 3.3]} />
    <mesh position={[0, 0.02, 7]}><boxGeometry args={[8.2, 0.04, 0.12]} /><meshStandardMaterial color={theme.accent} /></mesh>
  </group>;
}

export default function Race3DGame({ level, onClose, onReward }: Props) {
  const [lane, setLane] = useState(1);
  const [car, setCar] = useState<CarKind>('sport');
  const [world, setWorld] = useState<WorldKind>('city');
  const [mode, setMode] = useState<RaceMode>('quick');
  const [paint, setPaint] = useState('#ff6b4a');
  const [speed, setSpeed] = useState(54);
  const [nitro, setNitro] = useState(100);
  const [distance, setDistance] = useState(0);
  const [crashes, setCrashes] = useState(0);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [runId, setRunId] = useState(0);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('kidversa-race-sound') !== 'false');
  const [accelerating, setAccelerating] = useState(false);
  const [braking, setBraking] = useState(false);
  const [status, setStatus] = useState('Pick your car and world, then start your race.');
  const target = mode === 'time' ? 500 : mode === 'championship' ? 1800 : 1000;
  const onDistance = (value: number) => { setDistance(value); if (value >= target && !finished) { setFinished(true); setPaused(true); setStatus('Finish line! Brilliant driving.'); if (soundOn) playRaceEffect('finish'); if (!rewarded) { setRewarded(true); onReward(12 + Math.min(8, Math.floor(level / 2))); } } };
  const onCrash = () => { setCrashes(value => value + 1); setSpeed(value => Math.max(28, value - 7)); setStatus('Bump! Keep steering and get back on track.'); if (soundOn) playRaceEffect('crash'); };
  useEffect(() => { if (soundOn && started && !paused && !finished) { startRaceAudio(); updateRaceAudio(speed); } else stopRaceAudio(); return () => { if (!started || paused || finished || !soundOn) stopRaceAudio(); }; }, [soundOn, started, paused, finished]);
  useEffect(() => { updateRaceAudio(speed); }, [speed]);
  useEffect(() => { localStorage.setItem('kidversa-race-sound', String(soundOn)); }, [soundOn]);
  useEffect(() => () => stopRaceAudio(), []);
  useEffect(() => { if (started && !paused && !finished) { const id = window.setInterval(() => { if (boosting && nitro > 0) { setSpeed(108); setNitro(value => Math.max(0, value - 2.8)); } else if (accelerating) setSpeed(value => Math.min(88, value + 2.2)); else if (braking) setSpeed(value => Math.max(25, value - 3.2)); else { setSpeed(value => Math.max(42, value - 0.45)); setNitro(value => Math.min(100, value + 1.1)); } }, 100); return () => window.clearInterval(id); } }, [started, paused, finished, boosting, accelerating, braking, nitro]);
  useEffect(() => { const down = (event: KeyboardEvent) => { if (!started || paused || finished) return; if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key)) event.preventDefault(); if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') changeLane(-1); if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') changeLane(1); if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') setAccelerating(true); if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') setBraking(true); if (event.key === ' ') boostStart(); }; const up = (event: KeyboardEvent) => { if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') setAccelerating(false); if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') setBraking(false); if (event.key === ' ') boostStop(); }; window.addEventListener('keydown', down); window.addEventListener('keyup', up); return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); }; }, [started, paused, finished, nitro]);
  const changeLane = (direction: number) => setLane(value => Math.max(0, Math.min(2, value + direction)));
  const boostStart = () => { if (nitro > 4 && started && !paused && !finished) { setBoosting(true); if (soundOn) playRaceEffect('boost'); } };
  const boostStop = () => setBoosting(false);
  const restart = () => { setLane(1); setDistance(0); setCrashes(0); setSpeed(54); setNitro(100); setStarted(false); setPaused(false); setFinished(false); setRewarded(false); setBoosting(false); setAccelerating(false); setBraking(false); stopRaceAudio(); setRunId(value => value + 1); setStatus('Ready for another race.'); };
  const progress = Math.min(100, distance / target * 100);
  return <div className="game-overlay race3d-overlay"><section className="race3d-panel">
    <header className="race3d-header"><div><span className="eyebrow">KIDVERSA 3D RACING WORLD · LEVEL {level}</span><h2>Turbo Track Legends</h2><p>Race smart, dodge safely, and collect your next star.</p></div><button className="icon-button" onClick={onClose} aria-label="Close 3D race"><X /></button></header>
    <div className="race3d-toolbar">
      <label>Race mode<select value={mode} onChange={e => setMode(e.target.value as RaceMode)} disabled={started}><option value="quick">Quick Race</option><option value="championship">Championship</option><option value="time">Time Trial</option></select></label>
      <label>World<select value={world} onChange={e => setWorld(e.target.value as WorldKind)} disabled={started}>{(Object.keys(palettes) as WorldKind[]).map(key => <option key={key} value={key}>{palettes[key].label}</option>)}</select></label>
      <label>Car<select value={car} onChange={e => setCar(e.target.value as CarKind)} disabled={started}>{(Object.keys(carNames) as CarKind[]).map(key => <option key={key} value={key}>{carNames[key]}</option>)}</select></label>
      <label>Paint<span className="paint-options">{['#ff6b4a','#39a7ff','#a78bfa','#f6c453','#35bd91','#202938'].map(value => <button key={value} aria-label={'Paint ' + value} className={paint === value ? 'paint-dot selected' : 'paint-dot'} style={{ background: value }} onClick={() => setPaint(value)} disabled={started} />)}</span></label>
    </div>
    <div className="race3d-stage">
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 6.4, 11.5], fov: 48 }} gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <TrackWorld key={runId} lane={lane} color={paint} kind={car} world={world} speed={speed} paused={!started || paused || finished} onCrash={onCrash} onDistance={onDistance} />
      </Canvas>
      <div className="race3d-hud"><span><Gauge size={15}/> {Math.round(speed)} km/h</span><span><Zap size={15}/> Nitro {Math.round(nitro)}%</span><span>Distance {Math.round(distance)} / {target} m</span></div>
      <div className="race3d-progress"><i style={{ width: progress + '%' }} /></div>
      {!started && <div className="race3d-start"><span>3D ARCADE RACING</span><strong>{palettes[world].label}</strong><p>Use the steering controls to dodge the rival cars.</p><button className="primary-game-button" onClick={() => { setStarted(true); setPaused(false); setStatus('Race on! Watch the road ahead.'); }}><Play size={17} fill="currentColor"/> Start race</button></div>}
      {paused && started && !finished && <div className="race3d-pause"><strong>Race paused</strong><button className="primary-game-button" onClick={() => setPaused(false)}><Play size={16}/> Resume</button></div>}
      {finished && <div className="race3d-finish"><Trophy size={34}/><strong>Race complete!</strong><p>You earned {12 + Math.min(8, Math.floor(level / 2))} stars. Great driving!</p><button className="primary-game-button" onClick={restart}><RotateCcw size={16}/> Race again</button></div>}
    </div>
    <div className="race3d-bottom"><div className="race3d-stats"><span>Rival bumps <b>{crashes}</b></span><span>Race progress <b>{Math.round(progress)}%</b></span><span>{status}</span></div>
      <div className="race3d-controls"><button className="race-steer" onClick={() => changeLane(-1)} aria-label="Steer left" disabled={!started || paused || finished}><ArrowLeft/></button><button className="race-steer" onClick={() => changeLane(1)} aria-label="Steer right" disabled={!started || paused || finished}><ArrowRight/></button><button className="race-accelerate" onPointerDown={() => setAccelerating(true)} onPointerUp={() => setAccelerating(false)} onPointerLeave={() => setAccelerating(false)} onPointerCancel={() => setAccelerating(false)} disabled={!started || paused || finished}><ArrowUp size={17}/> Gas</button><button className="race-brake" onPointerDown={() => setBraking(true)} onPointerUp={() => setBraking(false)} onPointerLeave={() => setBraking(false)} onPointerCancel={() => setBraking(false)} disabled={!started || paused || finished}><ArrowDown size={17}/> Brake</button><button className="race-action" onClick={() => { if (started && !finished) setPaused(value => !value); }} disabled={!started || finished}><Pause size={17}/>{paused ? 'Resume' : 'Pause'}</button><button className="race-nitro" onPointerDown={boostStart} onPointerUp={boostStop} onPointerLeave={boostStop} onContextMenu={e => e.preventDefault()} disabled={!started || paused || finished || nitro < 5}><Zap size={17}/> Nitro</button><button className="race-action" onClick={() => setSoundOn(value => !value)} aria-label={soundOn ? 'Mute race sounds' : 'Enable race sounds'}>{soundOn ? <Volume2 size={17}/> : <VolumeX size={17}/>} Sound</button></div>
    </div>
    <p className="race3d-note">Kid-safe arcade racing · No purchases · Progress stays on this device</p>
  </section></div>;
}
