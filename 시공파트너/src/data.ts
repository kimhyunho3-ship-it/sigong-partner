import { ProcessType, User, Project, Bid, ChatMessage } from "./types";

export const PROCESS_OPTIONS = Object.values(ProcessType);

export const REGIONS_LIST = [
  "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산",
  "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
] as const;

// 1. 초기 사용자 리스트
export const INITIAL_USERS: User[] = [
  {
    id: "user_interior_1",
    role: "interior",
    name: "김민재 실장",
    email: "design_minjae@naver.com",
    phone: "010-3333-5555",
    companyName: "(주)민재디자인",
    isApproved: true,
    rating: 4.8,
    reviewCount: 12
  },
  {
    id: "user_contractor_1",
    role: "contractor",
    name: "박타일 반장",
    email: "tile_park@gmail.com",
    phone: "010-8888-9999",
    companyName: "대우바스 & 타일",
    businessNumber: "120-15-44321",
    isApproved: true,
    rating: 4.9,
    reviewCount: 34,
    specialty: [ProcessType.TILE, ProcessType.PLUMBING],
    regions: ["서울", "경기", "인천", "광주"]
  },
  {
    id: "user_contractor_2",
    role: "contractor",
    name: "이도배 팀장",
    email: "wallpaper_lee@daum.net",
    phone: "010-7777-6666",
    companyName: "한울 도배하우스",
    businessNumber: "212-09-88776",
    isApproved: true,
    rating: 4.6,
    reviewCount: 19,
    specialty: [ProcessType.WALLPAPER, ProcessType.FILM],
    regions: ["서울", "경기", "인천"]
  },
  {
    id: "user_contractor_3",
    role: "contractor",
    name: "최목수 반장",
    email: "wood_choi@naver.com",
    phone: "010-2222-1111",
    companyName: "뚝딱 목공 인테리어",
    businessNumber: "305-18-54321",
    isApproved: false, // 대기 중인 회원 시뮬레이션용
    rating: 0,
    reviewCount: 0,
    specialty: [ProcessType.WOODWORK],
    regions: ["서울", "경기"]
  },
  {
    id: "user_admin",
    role: "admin",
    name: "플랫폼 관리자",
    email: "admin@sigongpartner.com",
    phone: "1588-0000",
    companyName: "시공파트너 본사",
    isApproved: true,
    rating: 5.0,
    reviewCount: 100
  }
];

// 2. 초기 공사 현장 데이터
export const INITIAL_PROJECTS: Project[] = [
  {
    id: "project_1",
    title: "광주 북구 32평 아파트 타일공사",
    interiorId: "user_interior_1",
    interiorName: "김민재 실장",
    address: "광주광역시 북구 용봉동 현대아파트 104동",
    region: "광주",
    area: 32,
    process: ProcessType.TILE,
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    blueprintUrl: "simulation_blueprint_32py.pdf",
    photos: ["https://images.unsplash.com/photo-1502005229762-fc1b2381f0d5?auto=format&fit=crop&w=600&q=80"],
    notes: "욕실 2개 덧방 시공 및 주방 싱크대 벽면 타일 시공 필요합니다. 타일은 600각 포세린 타일 졸리컷 마감 희망합니다.",
    status: "bidding",
    createdAt: "2026-06-23T10:00:00Z"
  },
  {
    id: "project_2",
    title: "강남 청담동 24평 아파트 친환경 도배",
    interiorId: "user_interior_1",
    interiorName: "김민재 실장",
    address: "서울특별시 강남구 청담동 99-1 청담자이",
    region: "서울",
    area: 24,
    process: ProcessType.WALLPAPER,
    startDate: "2026-07-15",
    endDate: "2026-07-17",
    blueprintUrl: "simulation_blueprint_24py.pdf",
    photos: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80"],
    notes: "거실 전체 실크 벽지 시공, 방 3개 합지 시공 희망합니다. 벽면 석고보드 밑작업 꼼꼼하게 부탁드립니다.",
    status: "bidding",
    createdAt: "2026-06-22T08:30:00Z"
  }
];

// 3. 초기 입찰 데이터
export const INITIAL_BIDS: Bid[] = [
  {
    id: "bid_1",
    projectId: "project_1",
    contractorId: "user_contractor_1",
    contractorName: "대우바스 & 타일 (박타일 반장)",
    contractorRating: 4.9,
    amount: 2700000,
    availableDates: "7/10~7/13 전체 공정 가능",
    memo: "졸리컷 정밀 마감 전문입니다. 포세린 전용 고성능 접착제를 사용하여 하자 없는 명품 시공을 약속드립니다.",
    createdAt: "2026-06-23T14:20:00Z"
  },
  {
    id: "bid_2",
    projectId: "project_1",
    contractorId: "user_contractor_2",
    contractorName: "한울 도배하우스 (이도배 팀장)",
    contractorRating: 4.6,
    amount: 2850000,
    availableDates: "7/10부터 일정 가동 가능",
    memo: "주 시공 공정은 도배지만 제휴 타일 시공팀이 있어 최저가 단가 조합으로 시공 보증 가능합니다.",
    createdAt: "2026-06-23T15:10:00Z"
  }
];

// 4. 초기 채팅 내역
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg_1",
    projectId: "project_1",
    senderId: "user_contractor_1",
    senderRole: "contractor",
    text: "안녕하세요 실장님! 대우바스 & 타일의 박타일입니다. 낙찰해 주셔서 감사드리며, 현장 상세 도면 확인했습니다.",
    createdAt: "2026-06-24T00:05:00Z"
  },
  {
    id: "msg_2",
    projectId: "project_1",
    senderId: "user_interior_1",
    senderRole: "interior",
    text: "네 반장님 반가워요. 포세린 600각 졸리컷 마감 품질이 정말 중요해서 평점이 좋으신 반장님을 선택하게 되었습니다. 잘 부탁드려요.",
    createdAt: "2026-06-24T00:07:00Z"
  }
];
