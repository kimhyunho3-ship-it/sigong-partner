import React, { useState } from "react";
import { Database, FileText, GitFork, Smartphone, Award, Landmark, Eye, Code, Layers } from "lucide-react";

export default function DocsTab() {
  const [activeSubTab, setActiveSubTab] = useState<string>("erd");

  const menuItems = [
    { id: "erd", label: "ERD & DB 설계", icon: Database },
    { id: "flow", label: "사용자 플로우", icon: GitFork },
    { id: "ui", label: "화면 설계서", icon: FileText },
    { id: "flutter", label: "Flutter 구조", icon: Smartphone },
    { id: "roadmap", label: "MVP 로드맵", icon: Award },
    { id: "revenue", label: "수익모델 & 비전", icon: Landmark },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="docs-tab-root">
      <div className="border-b border-slate-100 bg-slate-50/50 p-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          플랫폼 설계 기획서 & 개발 가이드
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          시공파트너 서비스의 백엔드, 프론트엔드, 비즈니스 모델 상세 사양서입니다.
        </p>
      </div>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* 사이드 네비게이션 */}
        <div className="w-full md:w-64 border-r border-slate-100 p-3 bg-slate-50/20 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`docs-menu-btn-${item.id}`}
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSubTab === item.id
                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${activeSubTab === item.id ? "text-indigo-600" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* 세부 상세 내용 */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[800px]">
          {activeSubTab === "erd" && (
            <div className="space-y-6" id="erd-doc">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Database className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800">전체 ERD 및 데이터베이스 구조 설계</h3>
              </div>

              <div>
                <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
                  Firebase Firestore 데이터 관계 (NoSQL 모델)
                </h4>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  시공파트너는 Firebase Firestore의 유연한 문서 구조를 적극 채택합니다. 
                  관계형 데이터 모델을 NoSQL 다큐먼트 및 서브컬렉션 패턴으로 이식하여 지연 시간을 극대화하고 실시간 통신을 매끄럽게 처리합니다.
                </p>

                <div className="space-y-4">
                  {/* Users Collection */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <span className="font-bold text-slate-800 text-sm">📁 /users (사용자 정보 컬렉션)</span>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px]">Collection</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-600">
                      <li><strong className="text-indigo-600">uid (String, PK)</strong>: Firebase Auth 고유 식별자</li>
                      <li><strong>role (String)</strong>: 사용자 역할 (&quot;interior&quot; | &quot;contractor&quot; | &quot;admin&quot;)</li>
                      <li><strong>name (String)</strong>: 담당자 실명</li>
                      <li><strong>companyName (String)</strong>: 상호명 (예: 디자인디올, 신한바스)</li>
                      <li><strong>businessNumber (String, Optional)</strong>: 사업자 등록 번호</li>
                      <li><strong>isApproved (Boolean)</strong>: 관리자 승인 여부 (시공업자 필수)</li>
                      <li><strong>specialty (Array[String])</strong>: 전문 공정 목록 (타일, 도배, 전기 등)</li>
                      <li><strong>regions (Array[String])</strong>: 활동 가능 지역 목록 (서울, 경기 등)</li>
                      <li><strong>rating (Number)</strong>: 평균 평점</li>
                      <li><strong>reviewCount (Number)</strong>: 누적 리뷰 개수</li>
                    </ul>
                  </div>

                  {/* Projects Collection */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <span className="font-bold text-slate-800 text-sm">📁 /projects (공사 현장 컬렉션)</span>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px]">Collection</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-600">
                      <li><strong className="text-indigo-600">projectId (String, PK)</strong>: 자동 생성 고유 키</li>
                      <li><strong>interiorId (String, FK)</strong>: 등록한 인테리어 업체 ID</li>
                      <li><strong>title (String)</strong>: 현장명 및 공종명 (&quot;광주 북구 32평 아파트 타일공사&quot;)</li>
                      <li><strong>address (String)</strong>: 상세 주소</li>
                      <li><strong>region (String)</strong>: 대표 시/도 지역 필터링용</li>
                      <li><strong>area (Number)</strong>: 공급/전용 평수</li>
                      <li><strong>process (String)</strong>: 선택 공정 (&quot;타일&quot;, &quot;도배&quot; 등)</li>
                      <li><strong>startDate / endDate (String)</strong>: 공사 일정 범위</li>
                      <li><strong>blueprintUrl / photos (Array[String])</strong>: 도면 PDF 및 현장 사진 URL</li>
                      <li><strong>notes (String)</strong>: 특이사항</li>
                      <li><strong>status (String)</strong>: 현장 상태 (&quot;bidding&quot; | &quot;pending_payment&quot; | &quot;paid&quot; | &quot;completed&quot; | &quot;dispute&quot;)</li>
                      <li><strong>winnerBidId / winnerContractorId (String, FK)</strong>: 최종 선택 낙찰 건 및 시공업자 ID</li>
                      <li><strong>createdAt (Timestamp)</strong>: 등록 일시</li>
                    </ul>
                  </div>

                  {/* Bids Collection (Sub-collection of Projects to restrict unauthorized reads) */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <span className="font-bold text-slate-800 text-sm">📁 /projects/&#123;projectId&#125;/bids (입찰 정보 서브컬렉션)</span>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px]">Sub-Collection (강력 권장)</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                      * 보안 게이트: 인테리어 업체는 전체 리스트를 조회할 수 있으나 낙찰 전까지 시공업자 식별값(contractorId)을 클라이언트 단에서 숨기며, 타 시공업자는 본인의 입찰 건만 접근이 가능하도록 보안 규칙을 설정합니다.
                    </p>
                    <ul className="space-y-1.5 text-slate-600">
                      <li><strong className="text-indigo-600">bidId (String, PK)</strong>: 자동 생성 고유 키</li>
                      <li><strong>contractorId (String, FK)</strong>: 입찰에 참여한 시공업자 ID (비공개 처리 대상)</li>
                      <li><strong>contractorName (String)</strong>: 시공자명 (선결제 완료 시에만 노출)</li>
                      <li><strong>contractorRating (Number)</strong>: 시공자 평점</li>
                      <li><strong>amount (Number)</strong>: 제안한 견적 금액 (최저가 역경매 필터 타겟)</li>
                      <li><strong>availableDates (String)</strong>: 작업 희망일 및 설명</li>
                      <li><strong>memo (String)</strong>: 추가 비고/특이사항 설명</li>
                      <li><strong>createdAt (Timestamp)</strong>: 입찰 일시</li>
                    </ul>
                  </div>

                  {/* Chats Collection */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                      <span className="font-bold text-slate-800 text-sm">📁 /chats (1:1 실시간 소통 컬렉션)</span>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px]">Collection</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-600">
                      <li><strong className="text-indigo-600">chatId (String, PK)</strong>: &quot;project_&#123;projectId&#125;&quot; 형식으로 프로젝트당 1개 매핑</li>
                      <li><strong>projectId (String, FK)</strong>: 관련 현장 고유 ID</li>
                      <li><strong>interiorId / contractorId (String)</strong>: 대화 참가자 고유 UIDs</li>
                      <li><strong>lastMessage (String)</strong>: 마지막 채팅 텍스트</li>
                      <li><strong>updatedAt (Timestamp)</strong>: 최근 메시지 발송 시간</li>
                      <li><strong>📁 messages (Sub-collection)</strong>: 개별 대화 내역 (senderId, text, createdAt)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "flow" && (
            <div className="space-y-6" id="flow-doc">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <GitFork className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800">사용자 저니 플로우 (User Journey Flow)</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">1. 인테리어 업체 플로우</h4>
                  <div className="relative pl-6 border-l-2 border-indigo-100 space-y-4">
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">현장 정보 기입 및 도면 등록</p>
                      <p className="text-xs text-slate-500 mt-0.5">평수, 공종(타일/도배 등), 일정을 입력한 후 현장 도면을 첨부하여 입찰 등록</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-indigo-200 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">AI 입찰가 사전 시뮬레이션 및 알림 발송</p>
                      <p className="text-xs text-slate-500 mt-0.5">서버사이드 Gemini가 예상 최저가 범위를 피드백하고 매칭 업자에게 모바일 푸시 알림을 즉시 발송</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-indigo-200 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">최저가 역경매 현황 실시간 감시</p>
                      <p className="text-xs text-slate-500 mt-0.5">업체명은 완전히 블라인드 처리되며, 평점과 입찰 제안 금액 순으로 1위, 2위, 3위 입찰 리스트 정렬</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-indigo-200 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">낙찰 및 안전 선결제 (에스크로)</p>
                      <p className="text-xs text-slate-500 mt-0.5">가장 매력적인 금액과 평점을 지닌 업자를 낙찰한 뒤 플랫폼에 계약금을 안전하게 예치(선결제)</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">시공업자 정보 봉인 해제 & 실시간 소통</p>
                      <p className="text-xs text-slate-500 mt-0.5">낙찰자의 상호명, 연락처가 공개되고 AI 추천 채팅 체크리스트를 품은 1:1 채팅방이 자동 열림</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">2. 전문 시공업자 플로우</h4>
                  <div className="relative pl-6 border-l-2 border-indigo-100 space-y-4">
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">회원가입 및 전문 인증</p>
                      <p className="text-xs text-slate-500 mt-0.5">자신의 전문 공정(예: 타일/마루)과 주로 활동할 지역(예: 서울/경기)을 고르고 사업자등록증 첨부</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-indigo-200 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">맞춤형 공사 푸시 알림 수신</p>
                      <p className="text-xs text-slate-500 mt-0.5">자신의 주 종목과 지역에 꼭 맞는 &quot;광주 북구 32평 아파트 신규 입찰 등록&quot; 같은 타겟팅 푸시 알림을 즉시 수신</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-indigo-200 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">경쟁 입찰 참여 (견적 제출)</p>
                      <p className="text-xs text-slate-500 mt-0.5">공사 희망 날짜, 추가 어필 메모 및 최저 입찰 금액을 작성해 빠르게 견적 경쟁에 돌입</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-indigo-200 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">에스크로 예치 확인 및 시공 수행</p>
                      <p className="text-xs text-slate-500 mt-0.5">인테리어 업체의 선결제 예치 여부를 안전하게 확인한 뒤, 안심하고 현장으로 출근하여 시공 작업 수행</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></span>
                      <p className="text-sm font-semibold text-slate-800">정산 청구 및 상호 리뷰 작성</p>
                      <p className="text-xs text-slate-500 mt-0.5">완료 버튼을 눌러 예치금을 정산받고 서로에 대한 정직한 평점과 거래 후기 공유</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "ui" && (
            <div className="space-y-6" id="ui-doc">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800">주요 화면 설계서 (Screen Layouts)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">1</span>
                    <h4 className="text-sm font-bold text-slate-800">인테리어 : 신규 현장 등록 홈</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <li>• <strong>메인 배너:</strong> 직관적이고 시원한 타이틀과 &quot;내 주변 공정 전문가를 최저가로 매칭&quot; 표기</li>
                    <li>• <strong>공사정보 입력 폼:</strong> 현장명, 주소, 평수, 공정선택(셀렉박스), 일정 기간 설정 기능 배치</li>
                    <li>• <strong>첨부자료:</strong> 도면(PDF) 및 현장 가이드 사진 업로드 시뮬레이션 버튼 탑재</li>
                    <li>• <strong>AI 가이드 패널:</strong> 등록하기 전, 예상 견적 범위를 Gemini를 통해 실시간 조회 가능한 AI 추천 위젯 작동</li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">2</span>
                    <h4 className="text-sm font-bold text-slate-800">인테리어 : 역경매 실시간 입찰 비교</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <li>• <strong>상태 표시판:</strong> 현재 등록된 총 입찰 개수와 실시간 접수 알림 애니메이션 표시</li>
                    <li>• <strong>비공개 최저가 리스트:</strong> 시공사의 상세 프로필과 상호는 자물쇠 아이콘과 함께 &quot;결제 후 공개&quot;로 표시, 순수 견적 금액과 평점만 순위별로 정렬</li>
                    <li>• <strong>낙찰 액션:</strong> 리스트 아이템마다 우측에 &quot;낙찰하기&quot; 큰 컬러 버튼을 배치하여 손쉬운 결제 진입 가능</li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">3</span>
                    <h4 className="text-sm font-bold text-slate-800">시공사 : 맞춤 일감 매칭 알림 센터</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <li>• <strong>알림 피드:</strong> 상단에 종 모양 아이콘과 함께 실시간 매칭 알고리즘이 발생시킨 신규 일감 알림들 나열</li>
                    <li>• <strong>간편 입찰 팝업:</strong> 알림 클릭 시 해당 현장의 상세 조건(도면, 주소, 평수, 시작일)을 단일 팝업에서 확인하고 견적 제안 가능</li>
                    <li>• <strong>금액 가이드:</strong> 적정가 범위를 표시해 무분별한 덤핑이나 출혈 경쟁을 방지하는 상하한선 표시</li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">4</span>
                    <h4 className="text-sm font-bold text-slate-800">공동 : 에스크로 채팅 및 최종 승인</h4>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <li>• <strong>상단 안전 패널:</strong> 플랫폼 에스크로 보관 중(&quot;보관 금액: 2,700,000원&quot;) 상태 메시지 실시간 노출</li>
                    <li>• <strong>AI 사전 조율 칩:</strong> 대화창 위쪽에 AI가 생성해 주는 조율 가이드 질문지 칩 배치 (클릭 시 자동 텍스트 입력)</li>
                    <li>• <strong>원클릭 완결 프로세스:</strong> 작업 완료 시 시공업자의 &quot;정산 승인 신청&quot; 버튼과 인테리어 업체의 &quot;시공 완료 승인&quot; 버튼이 교차 작동</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "flutter" && (
            <div className="space-y-6" id="flutter-doc">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Smartphone className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800">Flutter 크로스플랫폼 소스코드 구조</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  프로덕션 모바일 앱을 Flutter 3.x 버전을 기준으로 구현할 경우의 아키텍처 및 디렉토리 구조 가이드라인입니다. 
                  상태 관리는 **Riverpod** 패키지를 채택하여 비즈니스 로직과 UI를 완벽히 격리합니다.
                </p>

                <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner border border-slate-800">
                  <span className="text-indigo-400 font-bold">// Flutter 프로젝트 lib/ 핵심 폴더 구조</span><br />
                  📁 lib/<br />
                  &nbsp;&nbsp;📁 main.dart <span className="text-slate-500">// 앱 엔트리 포인트, Firebase 초기화 및 ProviderScope 설정</span><br />
                  &nbsp;&nbsp;📁 app.dart <span className="text-slate-500">// 라우터(GoRouter) 및 글로벌 테마 정의</span><br />
                  &nbsp;&nbsp;📁 core/ <span className="text-slate-500">// 앱 전역 공유 유틸 및 공통 테마, 상수</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📁 theme/ <span className="text-slate-500">// 당근+배민 느낌의 직관적인 디자인 토큰 (Primary: #6366F1, Accent: #F97316)</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📁 constants/ <span className="text-slate-500">// 공정 카테고리 (타일, 도배 등), 하드코딩 스트링 목록</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📁 network/ <span className="text-slate-500">// API 클라이언트 및 에러 핸들러</span><br />
                  &nbsp;&nbsp;📁 models/ <span className="text-slate-500">// 데이터 모델 레이어 (Freeze 패키지 활용하여 직렬화 및 불변성 확보)</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 user_model.dart<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 project_model.dart<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 bid_model.dart<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 message_model.dart<br />
                  &nbsp;&nbsp;📁 providers/ <span className="text-slate-500">// Riverpod Providers (상태 전역 관리)</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 auth_provider.dart <span className="text-slate-500">// 로그인 상태, 역할 분담 관리</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 project_provider.dart <span className="text-slate-500">// 공사 리스트 스트림 및 신규 등록 상태</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 bid_provider.dart <span className="text-slate-500">// 특정 공사의 입찰 비교 상태 제어</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 chat_provider.dart <span className="text-slate-500">// Firestore 실시간 채팅 스트림 수신기</span><br />
                  &nbsp;&nbsp;📁 services/ <span className="text-slate-500">// 인프라 통신 서비스 모듈</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 firebase_service.dart <span className="text-slate-500">// Firebase Auth, Firestore 통신 기본 래퍼</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 fcm_service.dart <span className="text-slate-500">// Firebase Cloud Messaging 푸시 알림 수신 및 로컬 알림 처리</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📄 gemini_service.dart <span className="text-slate-500">// Gemini AI 활용 가이드 수신용 API</span><br />
                  &nbsp;&nbsp;📁 views/ <span className="text-slate-500">// 화면단 (UI Components & Pages)</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📁 auth/ <span className="text-slate-500">// 로그인 및 전문 시공사 회원가입 (사업자등록증 제출 포함)</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📁 interior/ <span className="text-slate-500">// 인테리어 업체 홈, 현장 등록 뷰, 입찰 비교 분석 뷰</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📁 contractor/ <span className="text-slate-500">// 시공사 홈, 내 알림 매칭 목록, 입찰 제출 상세 뷰</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📁 chat/ <span className="text-slate-500">// 실시간 1:1 대화 화면 및 AI 협의 가이드 칩</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📁 admin/ <span className="text-slate-500">// 관리자용 승인, 분쟁 및 정산 가이드 뷰</span><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;📁 common_widgets/ <span className="text-slate-500">// 커스텀 버튼, 평점 카드, 로딩 스피너 공용 위젯</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "roadmap" && (
            <div className="space-y-6" id="roadmap-doc">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Award className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800">MVP 버전 개발 로드맵 (Milestones)</h3>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-indigo-600 pl-4 py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">1단계</span>
                    <h4 className="text-sm font-bold text-slate-800">핵심 흐름 및 DB 정초 (1~3주차)</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    - Firebase Firestore 연동 설계 완료 및 Security Rules 배포<br />
                    - 인테리어 업체의 공사 및 도면 업로드 기능 구축<br />
                    - 시공업자의 타겟팅 입찰 목록 조회 및 즉시 제안 기능 구현
                  </p>
                </div>

                <div className="border-l-4 border-indigo-200 pl-4 py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">2단계</span>
                    <h4 className="text-sm font-bold text-slate-800">AI 매칭 고도화 & 역경매 블라인드 해제 (4~6주차)</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    - Gemini API를 활용한 입찰 등록 즉시 예상가 범위 분석 피드백 구현<br />
                    - 시공사 정보 비공개 역경매 로직 및 낙찰 결제 플로우 정밀 구성<br />
                    - 에스크로 정산 결제 API 및 PG 가상계좌(무통장 입금 등) 계약 연동
                  </p>
                </div>

                <div className="border-l-4 border-indigo-200 pl-4 py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">3단계</span>
                    <h4 className="text-sm font-bold text-slate-800">실시간 채팅, 분쟁 중재 및 검증 (7~9주차)</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    - 1:1 채팅방 자동 생성 및 이미지 전송 기능 구현<br />
                    - 시공 분쟁 접수 시스템 및 관리자 어드민 제어 센터 완성<br />
                    - 앱 스토어 및 구글 플레이 클로즈 베타 검증 및 시공 전문가 사전 100개소 모집 타겟팅 마케팅
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "revenue" && (
            <div className="space-y-6" id="revenue-doc">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Landmark className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800">비즈니스 수익 모델 및 서비스 확장 비전</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h4 className="text-sm font-bold text-indigo-600 mb-3">수익 모델 (Revenue Model)</h4>
                  <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                    <li>
                      <strong>1. 중개 수수료 방식 (Take Rate)</strong><br />
                      낙찰 성공 및 시공 대금 정산 승인 시, 플랫폼에서 <strong>3% ~ 5%</strong>의 수수료를 에스크로 정산액에서 제하고 시공업자에게 지급합니다.
                    </li>
                    <li>
                      <strong>2. 시공 광고 및 우선 매칭 쿠폰</strong><br />
                      전문가 회원들이 본인의 입찰을 상위 추천 구역에 우선 노출시키고 싶을 때 구매하는 월정액 정기 구독 형태의 광고 솔루션을 적용합니다.
                    </li>
                    <li>
                      <strong>3. 안심 보증 보험 연동 옵션</strong><br />
                      하자 발생 걱정이 많은 인테리어 업체를 타겟으로, 추가 비용 지불 시 안전 이행 보증 보험과 연계하여 분쟁 손실액의 일부를 커버해 줍니다.
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <h4 className="text-sm font-bold text-emerald-600 mb-3">향후 확장 계획 (Future Roadmap)</h4>
                  <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                    <li>
                      <strong>1. 공동 자재 벌크 구매 연계</strong><br />
                      타일, 마루, 도배 등 대형 도매업체들과 연동하여 플랫폼 내에서 활동하는 시공업자들에게 자재 공동구매 특가를 다이렉트로 소싱해 줍니다.
                    </li>
                    <li>
                      <strong>2. 현장 인력 긴급 수수 매칭</strong><br />
                      공정 당일 갑작스러운 펑크나 인력 부족 시, 2시간 이내 인근 지역 가용 전문가를 수배하는 '긴급 인력 출동 대기 시스템' 확장.
                    </li>
                    <li>
                      <strong>3. 기성 검수 대행 드론 솔루션</strong><br />
                      대단지 상업공사 및 빌딩 현장의 시공 완성도를 드론이나 스마트 센서 및 AI 컴퓨터 비전을 활용하여 비대면으로 기성을 검수해 주는 기술 제안.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
