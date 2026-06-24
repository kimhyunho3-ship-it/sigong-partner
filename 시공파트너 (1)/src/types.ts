/**
 * 시공파트너 B2B 역경매 플랫폼 데이터 타입 정의
 */

export enum ProcessType {
  TILE = "타일",
  WALLPAPER = "도배",
  WOODWORK = "목공",
  ELECTRIC = "전기",
  PLUMBING = "설비",
  PAINTING = "도장",
  FILM = "필름",
  FLOORING = "마루",
  DEMOLITION = "철거",
  CHASSIS = "샤시",
  FURNITURE = "가구",
  ETC = "기타",
}

export type Region = "서울" | "경기" | "인천" | "부산" | "대구" | "광주" | "대전" | "울산" | "세종" | "강원" | "충북" | "충남" | "전북" | "전남" | "경북" | "경남" | "제주";

export interface User {
  id: string;
  role: "interior" | "contractor" | "admin";
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessNumber?: string; // 사업자등록증 번호
  isApproved: boolean; // 관리자 승인 여부
  rating: number; // 평균 평점
  reviewCount: number;
  specialty?: ProcessType[]; // 시공업자 전문 공정
  regions?: Region[]; // 시공업자 활동 지역
}

export interface Project {
  id: string;
  title: string;
  interiorId: string;
  interiorName: string;
  address: string;
  region: Region;
  area: number; // 평수 (3.3 m2)
  process: ProcessType;
  startDate: string;
  endDate: string;
  blueprintUrl?: string; // 도면 시뮬레이션용 데이터
  photos?: string[]; // 현장 사진 시뮬레이션용 데이터
  notes: string;
  status: "bidding" | "pending_payment" | "paid" | "completed" | "dispute";
  createdAt: string;
  winnerBidId?: string;
  winnerContractorId?: string;
}

export interface Bid {
  id: string;
  projectId: string;
  contractorId: string;
  contractorName: string; // 낙찰 전까지 인테리어 업체에게는 비공개
  contractorRating: number;
  amount: number; // 입찰 금액
  availableDates: string; // 공사 가능 일정 설명
  memo: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderRole: "interior" | "contractor";
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  projectId: string;
  fromId: string;
  toId: string;
  rating: number; // 5점 만점
  quality: number; // 시공 품질
  schedule: number; // 일정 준수
  communication: number; // 의사소통
  rehire: boolean; // 재계약 의사
  comment: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "open" | "resolved" | "dismissed";
  creatorId: string;
  creatorRole: "interior" | "contractor";
  adminNote?: string;
  createdAt: string;
}

// AI 추천 및 입찰 전략 리포트
export interface AIReport {
  estimatedLow: number;
  estimatedHigh: number;
  recommendations: string[];
  keyFactors: string[];
}
