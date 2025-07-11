'use client';
import React, { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useSession, signIn, signOut } from "next-auth/react";
import "./globals.css";
import CardGame from "./CardGame";
import { useUserGameData } from "@/hooks/useUserGameData";

// 컬러 팔레트 상수
const COLORS = {
  green: '#6BCB77', // 메인 밝은 연두
  blue: '#62A9FF', // 서브 블루
  yellow: '#FFC300', // 강조 옐로우
  card: '#ECECEC', // 카드/배경
  bg: '#F8F9FA', // 전체 배경
};

// 게임별 이모지 매핑
const gameEmojis: { [key: string]: string } = {
  '카드 뒤집기': '🃏',
  '숫자 기억하기': '🔢',
  '그림 순서 맞추기': '🖼️',
  '단어 맞추기': '🔤',
  '끝말잇기': '📝',
  '문장 완성하기': '✍️',
  '빠른 계산': '➗',
  '수식 맞추기': '🔣',
  '숫자 퍼즐': '🧩',
};

// 뇌 영역 데이터 (사용하지 않음 - 주석 처리)
// const brainAreas = [
//   {
//     key: "memory",
//     name: "기억력",
//     desc: "과거 경험, 정보, 사실을 저장하고 떠올리는 능력",
//     level: 1,
//     exp: 0,
//     expToNext: 10,
//     games: [
//       { id: 1, name: "카드 뒤집기", rewardExp: 10, stage: 1 },
//     ],
//   },
//   {
//     key: "language",
//     name: "언어능력",
//     desc: "단어, 문장, 언어를 이해하고 표현하는 능력",
//     level: 1,
//     exp: 0,
//     expToNext: 10,
//     games: [
//       { id: 1, name: "단어 맞추기", rewardExp: 10, stage: 1 },
//     ],
//   },
//   {
//     key: "calculation",
//     name: "계산력",
//     desc: "숫자와 수식을 빠르게 계산하는 능력",
//     level: 1,
//     exp: 0,
//     expToNext: 10,
//     games: [
//       { id: 1, name: "수식 맞추기", rewardExp: 10, stage: 1 },
//     ],
//   },
// ];

type Game = { id: number; name: string; rewardExp: number; stage: number };
type BrainArea = {
  key: string;
  name: string;
  desc: string;
  level: number;
  exp: number;
  expToNext: number;
  games: Game[];
};

// 게임 버튼 컴포넌트
function GameButton({ game, onClick }: { game: Game; onClick?: () => void }) {
  return (
    <button
      key={game.id}
      className="font-extrabold rounded-xl py-5 px-6 text-lg sm:text-xl transition-colors shadow-md w-full min-h-[64px] flex flex-col items-center justify-center border-2 bg-white text-neutral-900 border-blue-300"
      onClick={onClick}
    >
      <span className="flex items-center gap-2 mb-1">
        <span className="text-2xl" aria-label="게임 이모지">{gameEmojis[game.name] || '🎮'}</span>
        <span>{game.name}</span>
      </span>
      <span className="flex items-center gap-2 text-base mt-1 font-bold justify-center text-blue-500">
        현재 스테이지: {game.stage}
        <span style={{color: COLORS.yellow, fontWeight: 900, textShadow: '0 1px 2px #4448, 0 0 2px #fff'}}>+{game.rewardExp}XP</span>
      </span>
    </button>
  );
}

// 뇌 영역 섹션 컴포넌트
function BrainAreaSection({ area, onGameClick }: { area: BrainArea; onGameClick?: (game: Game) => void }) {
  return (
    <section
      key={area.key}
      className="rounded-2xl shadow p-6 flex flex-col gap-5 border"
      style={{background: COLORS.card, borderColor: '#ddd', borderWidth: 2}}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">{area.name}</h2>
            <span className="text-xl sm:text-2xl font-bold text-neutral-800">Lv.{area.level}</span>
          </div>
          <p className="text-lg sm:text-xl mt-3 leading-snug font-semibold text-neutral-700">{area.desc}</p>
          <div className="w-full max-w-md mt-3 h-9 rounded-xl relative flex items-center shadow-inner border border-gray-300 bg-white">
            <div
              className="h-full rounded-xl transition-all duration-300"
              style={{
                width: `${Math.min((area.exp / area.expToNext) * 100, 100)}%`,
                background: COLORS.green,
              }}
            ></div>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg sm:text-xl font-extrabold select-none text-neutral-900" style={{textShadow:'0 1px 2px #fff8'}}>
              {area.exp} / {area.expToNext} XP
            </span>
          </div>
        </div>
      </div>
      {/* 게임 버튼 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {area.games.map((game) => (
          <GameButton key={game.id} game={game} onClick={() => onGameClick && onGameClick(game)} />
        ))}
      </div>
    </section>
  );
}

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

// const CARD_SIZE = 2; // 2x2 (사용하지 않음 - 주석 처리)

export default function Home() {
  // const { data: session } = useSession(); // 사용하지 않음 - 주석 처리
  
  // 카드 뒤집기 게임 성공 시 XP/스테이지 업데이트
  const handleCardGamePass = async (xp: number, stage: number) => {
    console.log('Card game passed! XP:', xp, 'Stage:', stage);
  };

  // 카드 초기화
  const [stage, setStage] = useState(1); // 스테이지
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [isPreview, setIsPreview] = useState(true); // 전체 공개 상태
  const [timer, setTimer] = useState(60); // 1분 제한
  const [gameState, setGameState] = useState<'ready'|'playing'|'pass'|'fail'>('ready');
  // const [xp, setXp] = useState(0); // 사용하지 않음 - 주석 처리

  // 카드 개수 계산
  const getCardCount = (stage: number) => 4 + (stage - 1) * 2;
  const getGrid = (count: number) => {
    // 2줄 고정, 열 개수 자동
    const rows = 2;
    const cols = count / 2;
    return { rows, cols };
  };

  // 카드 세팅
  useEffect(() => {
    const count = getCardCount(stage);
    const selected = shuffle(EMOJIS).slice(0, count / 2);
    const cardList = shuffle(
      selected.concat(selected).map((emoji, idx) => ({
        id: idx,
        emoji,
        flipped: true, // 처음엔 모두 공개
        matched: false,
      }))
    );
    setCards(cardList);
    setFlippedIdx([]);
    setLock(true);
    setIsPreview(true);
    setGameState('ready');
    setTimer(60);
    // 1.5초 후 자동으로 모두 뒤집기
    const timerId = setTimeout(() => {
      setCards(cards => cards.map(card => ({ ...card, flipped: false })));
      setLock(false);
      setIsPreview(false);
      setGameState('playing');
    }, 1500);
    return () => clearTimeout(timerId);
  }, [stage]);

  // 타이머
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timer <= 0) {
      setGameState('fail');
      setLock(true);
      return;
    }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, gameState]);

  // 카드 클릭 핸들러
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
          // 짝 맞춤
          setCards(cards => {
            const updated = cards.map((card, i) =>
              i === a || i === b ? { ...card, matched: true } : card
            );
            // 모두 맞췄는지 체크
            if (updated.every(card => card.matched)) {
              setGameState('pass');
            }
            return updated;
          });
        } else {
          // 다시 뒤집기
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

  // 다음 스테이지
  const handleNextStage = () => {
    setStage(stage + 1);
  };
  // 재시도
  const handleRetry = () => {
    setStage(1);
    // setXp(0); // 사용하지 않음 - 주석 처리
  };

  // const { cols } = getGrid(getCardCount(stage)); // 사용하지 않음 - 주석 처리

  return (
    <SessionProvider>
      <HomeContent onCardGamePass={handleCardGamePass} />
    </SessionProvider>
  );
}

function HomeContent({ onCardGamePass }: { onCardGamePass: (xp: number, stage: number) => void }) {
  const { data: session, status } = useSession();
  const [showCardGame, setShowCardGame] = useState(false);
  const [cardStage, setCardStage] = useState(1); // 카드게임 스테이지 상태를 HomeContent에서 관리
  const [isDev, setIsDev] = useState(false);
  const { brainAreas, loading, error, updateGameProgress } = useUserGameData();

  // 유저별 게임 데이터 불러오기
  useEffect(() => {
    if (session?.user?.email) {
      // 카드 게임 스테이지를 메모리 영역의 현재 스테이지로 설정
      const memoryArea = brainAreas.find(area => area.key === 'memory');
      if (memoryArea) {
        setCardStage(memoryArea.games[0].stage);
      }
    }
  }, [session?.user?.email, brainAreas]);

  // 개발환경 체크를 useEffect로 이동하여 Hydration 에러 방지
  useEffect(() => {
    setIsDev(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);

  // 카드 뒤집기 게임 성공 시 스테이지 업데이트
  const handleCardGamePass = async (xp: number, stage: number) => {
    console.log('Card game passed! XP:', xp, 'Stage:', stage);
    await updateGameProgress('memory', xp, stage + 1);
    setCardStage(stage + 1);
    onCardGamePass(xp, stage);
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-2xl font-bold text-neutral-700">게임 데이터를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-xl text-red-600">데이터 로딩 중 오류가 발생했습니다: {error}</div>
      </div>
    );
  }

  // 개발환경에서는 로그인 없이 바로 통과
  if (isDev) {
    if (showCardGame) {
      return (
        <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CardGame 
          onClose={() => setShowCardGame(false)} 
          onPass={handleCardGamePass}
          onFail={() => setCardStage(cardStage)}
          stage={cardStage}
          brainArea={brainAreas.find(area => area.key === "memory")}
        />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center py-8 px-2 sm:px-0" style={{background: COLORS.bg}}>
        <header className="w-full max-w-2xl mb-8 flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-neutral-900 tracking-tight">치매예방 뇌운동 게임 100선</h1>
        </header>
        <main className="w-full max-w-2xl flex flex-col gap-8">
          {brainAreas.map((area) => (
            <BrainAreaSection key={area.key} area={area} onGameClick={(game) => {
              if (game.name === "카드 뒤집기") {
                setCardStage(game.stage);
                setShowCardGame(true);
              }
            }} />
          ))}
        </main>
        <footer className="mt-10 text-xs text-gray-400">© 2024 치매예방 뇌운동 게임 100선</footer>
      </div>
    );
  }

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8F9FA]">
        <h1 className="text-2xl font-bold mb-6">치매예방 뇌운동 게임 100선</h1>
        <button onClick={() => signIn("kakao")}
          className="px-6 py-3 rounded bg-yellow-300 hover:bg-yellow-400 font-bold text-neutral-900 text-lg shadow">
          카카오로 로그인
        </button>
      </div>
    );
  }
  
  if (showCardGame) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardGame 
          onClose={() => setShowCardGame(false)} 
          onPass={handleCardGamePass}
          onFail={() => setCardStage(cardStage)}
          stage={cardStage}
          brainArea={brainAreas.find(area => area.key === "memory")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-2 sm:px-0" style={{background: COLORS.bg}}>
      <header className="w-full max-w-2xl mb-8 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-neutral-900 tracking-tight">치매예방 뇌운동 게임 100선</h1>
        <div className="mt-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{session.user?.name}님 환영합니다!</span>
            <button onClick={() => signOut()} className="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm">로그아웃</button>
          </div>
        </div>
      </header>
      <main className="w-full max-w-2xl flex flex-col gap-8">
        {brainAreas.map((area) => (
          <BrainAreaSection key={area.key} area={area} onGameClick={(game) => {
            if (game.name === "카드 뒤집기") {
              setCardStage(game.stage);
              setShowCardGame(true);
            }
          }} />
        ))}
      </main>
      <footer className="mt-10 text-xs text-gray-400">© 2024 치매예방 뇌운동 게임 100선</footer>
    </div>
  );
}
