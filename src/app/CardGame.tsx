"use client";
import React, { useState, useEffect } from "react";

const EMOJIS = ["🍎", "🍌", "🍇", "🍉", "🍒", "🍋", "🍑", "🍍", "🥝", "🥑", "🍓", "🍈"];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

interface CardGameProps {
  onClose?: () => void;
  onPass?: (xp: number, stage: number) => void;
  onFail?: () => void;
}

export default function CardGame({ onClose, onPass, onFail }: CardGameProps) {
  const [stage, setStage] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [timer, setTimer] = useState(60);
  const [gameState, setGameState] = useState<'ready'|'playing'|'pass'|'fail'>('ready');
  const [xp, setXp] = useState(0);

  const getCardCount = (stage: number) => 4 + (stage - 1) * 2;
  const getGrid = (count: number) => {
    const rows = 2;
    const cols = count / 2;
    return { rows, cols };
  };

  useEffect(() => {
    const count = getCardCount(stage);
    const selected = shuffle(EMOJIS).slice(0, count / 2);
    const cardList = shuffle(
      selected.concat(selected).map((emoji, idx) => ({
        id: idx,
        emoji,
        flipped: true,
        matched: false,
      }))
    );
    setCards(cardList);
    setFlippedIdx([]);
    setLock(true);
    setIsPreview(true);
    setGameState('ready');
    setTimer(60);
    const timerId = setTimeout(() => {
      setCards(cards => cards.map(card => ({ ...card, flipped: false })));
      setLock(false);
      setIsPreview(false);
      setGameState('playing');
    }, 1500);
    return () => clearTimeout(timerId);
  }, [stage]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timer <= 0) {
      setGameState('fail');
      setLock(true);
      if (onFail) onFail();
      return;
    }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, gameState, onFail]);

  const handleFlip = (idx: number) => {
    if (lock || isPreview || cards[idx].flipped || cards[idx].matched || gameState !== 'playing') return;
    const newFlipped = [...flippedIdx, idx];
    const newCards = cards.map((card, i) =>
      i === idx ? { ...card, flipped: true } : card
    );
    setCards(newCards);
    setFlippedIdx(newFlipped);

    if (newFlipped.length === 2) {
      setLock(true);
      setTimeout(() => {
        const [a, b] = newFlipped;
        if (newCards[a].emoji === newCards[b].emoji) {
          setCards(cards => {
            const updated = cards.map((card, i) =>
              i === a || i === b ? { ...card, matched: true } : card
            );
            if (updated.every(card => card.matched)) {
              setGameState('pass');
              setXp(xp => xp + 10 * stage);
              if (onPass) onPass(10 * stage, stage);
            }
            return updated;
          });
        } else {
          setCards(cards =>
            cards.map((card, i) =>
              i === a || i === b ? { ...card, flipped: false } : card
            )
          );
        }
        setFlippedIdx([]);
        setLock(false);
      }, 1000);
    }
  };

  const handleNextStage = () => {
    setStage(stage + 1);
  };
  const handleRetry = () => {
    setStage(1);
    setXp(0);
    if (onFail) onFail();
  };

  const { cols } = getGrid(getCardCount(stage));

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: 32, minWidth: 360, position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
      <h2 style={{marginTop:0}}>카드 뒤집기 게임</h2>
      <div style={{marginBottom:8, color:'#888', fontSize:16}}>
        스테이지: {stage} / XP: {xp} / 남은시간: {gameState==='playing'? timer : '-'}초
      </div>
      {isPreview && <div style={{marginBottom:8, color:'#888'}}>카드를 외우세요!</div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 80px)`, gap: "16px", marginBottom: 16 }}>
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleFlip(idx)}
            style={{
              width: 80,
              height: 80,
              fontSize: 36,
              background: card.flipped || card.matched ? "#fff" : "#bbb",
              border: "2px solid #888",
              borderRadius: 12,
              cursor: card.flipped || card.matched || isPreview || gameState!=='playing' ? "default" : "pointer",
              transition: "background 0.2s",
            }}
            disabled={card.flipped || card.matched || isPreview || gameState!=='playing'}
          >
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>
      {gameState==='pass' && (
        <div style={{marginTop:16, color:'#2a8', fontWeight:'bold'}}>
          🎉 성공! XP +{10*stage}
          <br/>
          <button onClick={handleNextStage} style={{marginTop:8, padding:'8px 20px', fontSize:16, borderRadius:8, border:'none', background:'#2a8', color:'#fff', cursor:'pointer'}}>다음 스테이지 ▶</button>
        </div>
      )}
      {gameState==='fail' && (
        <div style={{marginTop:16, color:'#d33', fontWeight:'bold'}}>
          ⏰ 실패!<br/>
          <button onClick={handleRetry} style={{marginTop:8, padding:'8px 20px', fontSize:16, borderRadius:8, border:'none', background:'#d33', color:'#fff', cursor:'pointer'}}>처음부터 다시</button>
        </div>
      )}
    </div>
  );
} 