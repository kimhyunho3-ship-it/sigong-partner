import React, { useState } from "react";
import { User, Project, Bid, ProcessType, Region } from "../types";
import { PROCESS_OPTIONS, REGIONS_LIST } from "../data";
import { Bell, MapPin, Calendar, ClipboardList, PenTool, Star, RefreshCw, Send, CheckCircle, MessageSquare } from "lucide-react";

interface ContractorPanelProps {
  currentUser: User;
  projects: Project[];
  bids: Bid[];
  onUpdateSpecialty: (specialty: ProcessType[], regions: Region[]) => void;
  onSubmitBid: (projectId: string, amount: number, availableDates: string, memo: string) => void;
  onOpenChat: (projectId: string) => void;
}

export default function ContractorPanel({
  currentUser,
  projects,
  bids,
  onUpdateSpecialty,
  onSubmitBid,
  onOpenChat,
}: ContractorPanelProps) {
  // 프로필 편집 상태
  const [selectedSpecialties, setSelectedSpecialties] = useState<ProcessType[]>(currentUser.specialty || []);
  const [selectedRegions, setSelectedRegions] = useState<Region[]>(currentUser.regions || []);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // 입찰 입력 폼 상태
  const [activeBidProject, setActiveBidProject] = useState<Project | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(2500000);
  const [bidDates, setBidDates] = useState("전체 공정 기간 완벽 소화 가능");
  const [bidMemo, setBidMemo] = useState("");

  // 전문분야 다중 토글
  const handleToggleSpecialty = (p: ProcessType) => {
    if (selectedSpecialties.includes(p)) {
      setSelectedSpecialties(selectedSpecialties.filter((x) => x !== p));
    } else {
      setSelectedSpecialties([...selectedSpecialties, p]);
    }
  };

  // 활동지역 다중 토글
  const handleToggleRegion = (r: Region) => {
    if (selectedRegions.includes(r)) {
      setSelectedRegions(selectedRegions.filter((x) => x !== r));
    } else {
      setSelectedRegions([...selectedRegions, r]);
    }
  };

  // 프로필 저장
  const handleSaveProfile = () => {
    onUpdateSpecialty(selectedSpecialties, selectedRegions);
    setIsEditingProfile(false);
    alert("🔧 전문 공정 및 지역 필터 설정이 완료되었습니다!\n이 기준에 매칭되는 입찰 알림만 실시간 수신하게 됩니다.");
  };

  // 견적 제출
  const handleFormSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBidProject) return;
    if (bidAmount <= 0) {
      alert("올바른 견적 금액을 기입해주세요.");
      return;
    }

    onSubmitBid(activeBidProject.id, bidAmount, bidDates, bidMemo);
    setActiveBidProject(null);
    setBidMemo("");
    alert("🚀 최저가 역경매 입찰이 성공적으로 전송되었습니다!\n인테리어 업체에서 비공개 실시간 금액 검토 후 낙찰을 진행합니다.");
  };

  // 자동 매칭 조건: 프로젝트의 공정이 시공사의 전문 분야에 포함되고, 지역이 활동지역에 포함되는 경우
  const matchedProjects = projects.filter((proj) => {
    // 입찰 중인 공사만
    if (proj.status !== "bidding") return false;
    // 이미 본인이 입찰한 것은 매칭 알림에서 빼기 위해 필터
    const alreadyBidded = bids.some((b) => b.projectId === proj.id && b.contractorId === currentUser.id);
    if (alreadyBidded) return false;

    const matchesSpecialty = (currentUser.specialty || []).includes(proj.process);
    const matchesRegion = (currentUser.regions || []).includes(proj.region);
    return matchesSpecialty && matchesRegion;
  });

  // 본인이 참여한 입찰 리스트
  const myBids = bids.filter((b) => b.contractorId === currentUser.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="contractor-panel-root">
      
      {/* 1. 좌측 4칸: 시공자 전문 프로필 구성 */}
      <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold">시공사 전용</span>
            <h3 className="text-lg font-bold text-slate-800 mt-2 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-amber-500" />
              전문 공정 &amp; 활동지 설정
            </h3>
            <p className="text-xs text-slate-500 mt-1">이 설정값을 기준으로 인근의 공사 매칭 알림이 타겟팅되어 전송됩니다.</p>
          </div>
        </div>

        {/* 미승인 상태 경고 (시뮬레이션 가치 극대화) */}
        {!currentUser.isApproved && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl space-y-1.5 text-xs">
            <p className="font-bold">⚠️ 회원 가입 심사 중</p>
            <p className="leading-relaxed">관리자가 아직 귀하의 사업자등록증 검수를 완료하지 않았습니다. 승인 전까지는 실제 입찰 매칭 및 알림 조회가 불가할 수 있으니, 상단 스위치로 관리자(Admin) 모드로 가셔서 승인 처리 버튼을 눌러주세요!</p>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">👤 {currentUser.companyName} ({currentUser.name})</span>
            <div className="flex items-center gap-0.5 text-amber-500 text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold">{currentUser.rating > 0 ? currentUser.rating.toFixed(1) : "평가없음"}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium mb-1">내 전문 공정</span>
              <div className="flex flex-wrap gap-1">
                {(currentUser.specialty || []).map((s) => (
                  <span key={s} className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-medium mb-1">내 활동 구역</span>
              <div className="flex flex-wrap gap-1">
                {(currentUser.regions || []).map((r) => (
                  <span key={r} className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">{r}</span>
                ))}
              </div>
            </div>
          </div>

          {!isEditingProfile ? (
            <button
              id="edit-profile-btn"
              onClick={() => setIsEditingProfile(true)}
              className="w-full py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition"
            >
              매칭 필터 정보 수정하기
            </button>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">공정 선택 (다중 토글)</span>
                <div className="grid grid-cols-3 gap-1">
                  {PROCESS_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      id={`specialty-toggle-${p}`}
                      onClick={() => handleToggleSpecialty(p)}
                      className={`py-1.5 rounded text-[10px] font-bold border transition ${
                        selectedSpecialties.includes(p)
                          ? "bg-indigo-50 border-indigo-600 text-indigo-600"
                          : "border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">활동 지역 (다중 토글)</span>
                <div className="grid grid-cols-3 gap-1 max-h-[120px] overflow-y-auto p-1 border border-slate-100 rounded bg-white">
                  {REGIONS_LIST.map((r) => (
                    <button
                      key={r}
                      type="button"
                      id={`region-toggle-${r}`}
                      onClick={() => handleToggleRegion(r)}
                      className={`py-1 rounded text-[10px] font-bold border transition ${
                        selectedRegions.includes(r)
                          ? "bg-indigo-50 border-indigo-600 text-indigo-600"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  id="cancel-profile-btn"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500"
                >
                  취소
                </button>
                <button
                  id="save-profile-btn"
                  onClick={handleSaveProfile}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  저장하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 우측 8칸: 실시간 일감 알림판 및 내가 낸 견적 확인 */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* 실시간 매칭 일감 알림 센터 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-amber-500 animate-swing" />
              내 맞춤 공사 매칭 알림 피드 ({matchedProjects.length}건)
            </h3>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">실시간 매칭 AI</span>
          </div>

          {!currentUser.isApproved ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl">
              <p className="text-xs">사업자 심사 승인이 완료되어야 실시간 알림 피드를 이용할 수 있습니다.</p>
            </div>
          ) : matchedProjects.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-100 rounded-xl">
              <p className="text-xs">현재 맞춤 조건에 맞는 새로운 신규 공사 건이 없습니다.</p>
              <p className="text-[10px] text-slate-400 mt-1">인테리어 업체 모드로 가셔서 &quot;{currentUser.regions?.[0] || "전국"}&quot; 지역의 &quot;{currentUser.specialty?.[0] || "공정"}&quot; 공사를 직접 등록해 보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchedProjects.map((proj) => (
                <div
                  key={proj.id}
                  id={`matched-project-${proj.id}`}
                  className="p-4 rounded-xl border border-amber-100 bg-amber-50/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-amber-300"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-bold">NEW 자동알림</span>
                      <span className="text-xs font-bold text-slate-800">{proj.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {proj.address} ({proj.area}평) | 📅 공기: {proj.startDate} ~ {proj.endDate}
                    </p>
                    <p className="text-[10px] text-slate-600 bg-white/60 p-2 rounded border border-slate-100 mt-1 max-w-xl">
                      <strong>현장 요청사항:</strong> {proj.notes}
                    </p>
                  </div>

                  <button
                    id={`open-bid-form-btn-${proj.id}`}
                    onClick={() => {
                      setActiveBidProject(proj);
                      setBidAmount(proj.area * 80000); // 평수에 비례해 임시 추천 가격 설정
                    }}
                    className="w-full md:w-auto px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition"
                  >
                    견적 입찰하기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 내가 참여한 입찰 현황 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ClipboardList className="w-4.5 h-4.5 text-indigo-600" />
            내 견적 제출 &amp; 입찰 현황 ({myBids.length}건)
          </h3>

          {myBids.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-xs">아직 제출한 견적서가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBids.map((bid) => {
                const proj = projects.find((p) => p.id === bid.projectId);
                if (!proj) return null;

                const isWinner = proj.winnerBidId === bid.id;

                return (
                  <div
                    key={bid.id}
                    className={`p-4 rounded-xl border transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                      isWinner
                        ? "border-emerald-500 bg-emerald-50/10"
                        : "border-slate-100 bg-slate-50/30"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{proj.title}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          isWinner
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {isWinner ? "낙찰 성공" : "입찰 대기중"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>제안 견적액: <strong className="text-indigo-600">₩{bid.amount.toLocaleString()}원</strong></span>
                        <span>가능정산일: {bid.availableDates}</span>
                      </div>
                    </div>

                    <div className="w-full md:w-auto">
                      {isWinner ? (
                        <div className="flex items-center gap-2">
                          <button
                            id={`contractor-chat-btn-${proj.id}`}
                            onClick={() => onOpenChat(proj.id)}
                            className="flex-1 md:w-28 flex items-center justify-center gap-1 bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            채팅 협의방
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">인테리어 검토 대기</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 견적 입찰 제출 모달 */}
      {activeBidProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="bid-form-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="text-center border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-800">최저가 역경매 견적 제안</h4>
              <p className="text-xs text-slate-500 mt-1">{activeBidProject.title}</p>
            </div>

            <form onSubmit={handleFormSubmitBid} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">제안 견적 금액 (인건비/부자재 포함) *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={10000}
                    step={10000}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full text-sm pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50/50"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">원</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">현장 평수({activeBidProject.area}평)에 걸맞은 가장 경쟁력 있는 최저 견적을 입력해 보세요!</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">시공 가능 일정 상세 *</label>
                <input
                  type="text"
                  required
                  value={bidDates}
                  onChange={(e) => setBidDates(e.target.value)}
                  placeholder="예) 공기 기간 내 전체 동원 가능합니다."
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">시공 어필 한마디 (메모) *</label>
                <textarea
                  required
                  rows={3}
                  value={bidMemo}
                  onChange={(e) => setBidMemo(e.target.value)}
                  placeholder="예) 하자 발생율 0%를 자부합니다! 국산 고급 접착제 사용하며 꼼꼼히 보양 후 마감하겠습니다."
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  id="cancel-bid-modal"
                  onClick={() => setActiveBidProject(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500"
                >
                  취소하기
                </button>
                <button
                  type="submit"
                  id="submit-bid-btn"
                  className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  견적서 제안하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
