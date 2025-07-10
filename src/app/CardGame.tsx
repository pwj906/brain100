"use client";
import React, { useState, useEffect, useRef } from "react";

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
  isPass?: boolean; // 추가된 속성
}

interface CardGameProps {
  onClose?: () => void;
  onPass?: (xp: number, stage: number) => void;
  onFail?: () => void;
  stage: number; // 부모에서 내려받는 현재 스테이지
  brainArea?: {
    level: number;
    exp: number;
    expToNext: number;
  };
}

const PASS_CARD = { id: -1, emoji: 'PASS', flipped: false, matched: false, isPass: true };

export default function CardGame({ onClose, onPass, onFail, stage, brainArea }: CardGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [timer, setTimer] = useState(60);
  const [gameState, setGameState] = useState<'ready'|'playing'|'pass'|'fail'>('ready');
  const [clearedStage, setClearedStage] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerValueRef = useRef(60);
  const stageRef = useRef(stage);

  // 타이머 시작
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerValueRef.current = 60;
    setTimer(60);
    timerRef.current = setInterval(() => {
      timerValueRef.current -= 1;
      setTimer(timerValueRef.current);
      if (timerValueRef.current <= 0) {
        setGameState('fail');
        setLock(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // stage가 바뀔 때마다 카드 세팅
  useEffect(() => {
    clearTimer();
    let count = 3 + stage; // 스테이지 1: 4장부터 시작
    let isOdd = count % 2 === 1;
    let pairCount = Math.floor(count / 2);
    const selected = shuffle(EMOJIS).slice(0, pairCount);
    let cardList = shuffle(
      selected.concat(selected).map((emoji, idx) => ({
        id: idx,
        emoji,
        flipped: true,
        matched: false,
        isPass: false,
      }))
    );
    if (isOdd) {
      cardList.push({ ...PASS_CARD, id: cardList.length });
    }
    cardList = shuffle(cardList);
    setCards(cardList);
    setFlippedIdx([]);
    setLock(true);
    setIsPreview(true);
    setGameState('ready');
    // 제한시간 계산
    const stageTime = 30 + (stage - 1) * 10;
    setTimer(stageTime);
    timerValueRef.current = stageTime;
    const timerId = setTimeout(() => {
      setCards(cardList.map(card => ({ ...card, flipped: false })));
      setLock(false);
      setIsPreview(false);
      setGameState('playing');
      startTimer();
    }, 1500);
    return () => {
      clearTimeout(timerId);
      clearTimer();
    };
  }, [stage]);

  useEffect(() => { stageRef.current = stage; }, [stage]);

  // 게임 성공 시 처리
  useEffect(() => {
    if (gameState === 'pass' && onPass && clearedStage !== null) {
      clearTimer();
      onPass(5 * clearedStage, clearedStage);
      setClearedStage(null); // 재진입 방지
    }
  }, [gameState, onPass, clearedStage]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  // handleFlip에서 PASS 카드 처리
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
        // PASS 카드가 포함되어 있으면 무조건 성공 처리
        if (newCards[a].isPass || newCards[b].isPass) {
          setCards(cards => {
            const updated = cards.map((card, i) =>
              i === a || i === b ? { ...card, matched: true } : card
            );
            // 게임 종료 조건: 짝이 있는 모든 카드가 matched=true면 종료
            const hasAllPairsMatched = updated.filter(card => !card.isPass).every(card => card.matched);
            if (hasAllPairsMatched) {
              setClearedStage(stage);
              setGameState('pass');
            }
            return updated;
          });
        } else if (newCards[a].emoji === newCards[b].emoji) {
          setCards(cards => {
            const updated = cards.map((card, i) =>
              i === a || i === b ? { ...card, matched: true } : card
            );
            // 게임 종료 조건: 짝이 있는 모든 카드가 matched=true면 종료
            const hasAllPairsMatched = updated.filter(card => !card.isPass).every(card => card.matched);
            if (hasAllPairsMatched) {
              setClearedStage(stage);
              setGameState('pass');
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
      }, 500);
    }
    // PASS 카드만 남은 경우에도 게임 종료
    setTimeout(() => {
      setCards(cards => {
        const hasAllPairsMatched = cards.filter(card => !card.isPass).every(card => card.matched);
        const onlyPassLeft = cards.filter(card => !card.matched && card.isPass).length === cards.filter(card => !card.matched).length;
        if (hasAllPairsMatched && onlyPassLeft && gameState === 'playing') {
          setClearedStage(stage);
          setGameState('pass');
        }
        return cards;
      });
    }, 0);
  };

  const handleRetry = () => {
    if (onFail) onFail();
  };
  const handleGoHome = () => {
    if (onClose) onClose();
  };

  const cols = (4 + (stage - 1) * 2) / 2;

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: 32, minWidth: 360, position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}>← 뒤로가기</button>
      <h2 style={{marginTop:0}}>카드 뒤집기 게임</h2>
      {brainArea && (
        <div style={{marginBottom:8, padding:'8px 12px', background:'#f0f0f0', borderRadius:8, fontSize:14}}>
          <div style={{fontWeight:'bold', marginBottom:4}}>기억력 Lv.{brainArea.level}</div>
          <div style={{color:'#666'}}>경험치: {brainArea.exp} / {brainArea.expToNext} XP</div>
        </div>
      )}
      <div style={{marginBottom:8, color:'#888', fontSize:16}}>
        스테이지: {stage} / XP: {5 * stage} / 남은시간: {gameState==='playing'? timer : '-'}초
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
              fontSize: (card.flipped || card.matched) ? (card.isPass ? 20 : 36) : 36, // 뒷면은 항상 36
              background: card.flipped || card.matched ? "#fff" : "#bbb",
              border: "2px solid #888",
              borderRadius: 12,
              cursor: card.flipped || card.matched || isPreview || gameState!=='playing' ? "default" : "pointer",
              transition: "background 0.1s",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 0,
              overflow: 'hidden',
            }}
            disabled={card.flipped || card.matched || isPreview || gameState!=='playing'}
          >
            {(isPreview || card.flipped || card.matched)
              ? (card.isPass
                  ? <span style={{fontWeight:'bold', fontSize:20, wordBreak:'keep-all', lineHeight:'1.1'}}>PASS</span>
                  : card.emoji)
              : "?"}
          </button>
        ))}
      </div>
      {gameState==='pass' && (
        <div style={{marginTop:16, color:'#2a8', fontWeight:'bold'}}>
          🎉 성공! XP +{5*stage}
          <br/>
          <button onClick={handleRetry} style={{marginTop:8, padding:'8px 20px', fontSize:16, borderRadius:8, border:'none', background:'#2a8', color:'#fff', cursor:'pointer'}}>다음 스테이지 ▶</button>
        </div>
      )}
      {gameState==='fail' && (
        <div style={{marginTop:16, color:'#d33', fontWeight:'bold', textAlign:'center'}}>
          ⏰ 시간 초과!
          <br/>
          <div style={{marginTop:16, display:'flex', gap:12, justifyContent:'center'}}>
            <button onClick={handleRetry} style={{padding:'8px 20px', fontSize:16, borderRadius:8, border:'none', background:'#d33', color:'#fff', cursor:'pointer'}}>다시 시도</button>
            <button onClick={handleGoHome} style={{padding:'8px 20px', fontSize:16, borderRadius:8, border:'none', background:'#666', color:'#fff', cursor:'pointer'}}>홈으로</button>
          </div>
        </div>
      )}
    </div>
  );
} 