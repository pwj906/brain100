import React from "react";

// 실제 사용하는 컬러만 남긴 팔레트
const COLORS = {
  green: '#6BCB77', // 메인 밝은 연두
  blue: '#62A9FF', // 서브 블루
  yellow: '#FFC300', // 강조 옐로우
  card: '#ECECEC', // 카드/배경
  bg: '#F8F9FA', // 전체 배경
};

// 게임별 이모지 매핑 (fallback: 🎮)
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

const brainAreas = [
  {
    key: "memory",
    name: "기억력",
    desc: "과거 경험, 정보, 사실을 저장하고 떠올리는 능력",
    level: 1,
    exp: 0,
    expToNext: 10,
    games: [
      { id: 1, name: "카드 뒤집기", rewardExp: 10, stage: 1 },
    ],
  },
  {
    key: "language",
    name: "언어능력",
    desc: "단어, 문장, 언어를 이해하고 표현하는 능력",
    level: 1,
    exp: 0,
    expToNext: 10,
    games: [
      { id: 1, name: "단어 맞추기", rewardExp: 10, stage: 1 },
    ],
  },
  {
    key: "calculation",
    name: "계산력",
    desc: "숫자와 수식을 빠르게 계산하는 능력",
    level: 1,
    exp: 0,
    expToNext: 10,
    games: [
      { id: 1, name: "수식 맞추기", rewardExp: 10, stage: 1 },
    ],
  },
];

const maxLevel = 100;

export default function Home() {
  // 영역별 레벨 바 차트용 데이터
  const areaColors = [
    "#2563eb", // 기억력
    "#10b981", // 집중력
    "#f59e42", // 주의력
    "#e11d48", // 판단력
    "#a21caf", // 반응력
    "#0ea5e9", // 언어능력
    "#facc15", // 공간지각력
    "#7c3aed", // 계산력
    "#14b8a6", // 추론력
    "#f43f5e", // 창의력
  ];

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-2 sm:px-0" style={{background: COLORS.bg}}>
      <header className="w-full max-w-2xl mb-8 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-neutral-900 tracking-tight">치매예방 뇌운동 게임 100선</h1>
      </header>
      <main className="w-full max-w-2xl flex flex-col gap-8">
        {brainAreas.map((area) => (
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
                <button
                  key={game.id}
                  className="font-extrabold rounded-xl py-5 px-6 text-lg sm:text-xl transition-colors shadow-md w-full min-h-[64px] flex flex-col items-center justify-center border-2 bg-white text-neutral-900 border-blue-300"
                  // onClick={() => router.push(`/game/${area.key}/${game.id}`)}
                  disabled
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
              ))}
            </div>
          </section>
        ))}
      </main>
      <footer className="mt-10 text-xs text-gray-400">© 2024 치매예방 뇌운동 게임 100선</footer>
    </div>
  );
}
