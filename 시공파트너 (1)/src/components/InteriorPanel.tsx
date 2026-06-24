import React, { useState } from "react";
import { Plus, MapPin, Calendar, FileText, Sparkles, Trophy, Lock, Unlock, MessageSquare, CheckCircle, Star, AlertCircle, TrendingDown, Image } from "lucide-react";
import { Project, Bid, ProcessType, Region, User } from "../types";
import { PROCESS_OPTIONS, REGIONS_LIST } from "../data";

interface InteriorPanelProps {
  projects: Project[];
  bids: Bid[];
  currentUser: User;
  onAddProject: (project: Omit<Project, "id" | "interiorId" | "interiorName" | "createdAt">) => Promise<Project>;
  onSelectWinner: (projectId: string, bidId: string, contractorId: string) => void;
  onCompleteProject: (projectId: string) => void;
  onSubmitReview: (projectId: string, rating: number, quality: number, schedule: number, comms: number, rehire: boolean, comment: string) => void;
  onOpenChat: (projectId: string) => void;
}

export default function InteriorPanel({
  projects,
  bids,
  currentUser,
  onAddProject,
  onSelectWinner,
  onCompleteProject,
  onSubmitReview,
  onOpenChat,
}: InteriorPanelProps) {
  // 신규 등록 폼 상태
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState<Region>("서울");
  const [area, setArea] = useState<number>(32);
  const [process, setProcess] = useState<ProcessType>(ProcessType.TILE);
  const [startDate, setStartDate] = useState("2026-07-10");
  const [endDate, setEndDate] = useState("2026-07-13");
  const [notes, setNotes] = useState("");
  const [blueprintName, setBlueprintName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // AI 분석/추천 상태
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{
    estimatedLow: number;
    estimatedHigh: number;
    recommendations: string[];
    keyFactors: string[];
  } | null>(null);

  // UI 상태 제어
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBid, setPendingBid] = useState<Bid | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // 리뷰 피드백 상태
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewQuality, setReviewQuality] = useState(5);
  const [reviewSchedule, setReviewSchedule] = useState(5);
  const [reviewComms, setReviewComms] = useState(5);
  const [reviewRehire, setReviewRehire] = useState(true);
  const [reviewComment, setReviewComment] = useState("");

  // 1. 등록 전에 AI가 예측하는 입찰 가이드 요청
  const handleAiAnalyze = async () => {
    if (!address) {
      alert("AI 분석을 위해 먼저 주소를 입력해주세요.");
      return;
    }
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ process, address, area, notes }),
      });
      const data = await response.json();
      setAiReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 2. 신규 공사 현장 등록 액션
  const handleRegisterProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !address || !notes) {
      alert("모든 필수 입력칸을 기입해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newProj = await onAddProject({
        title,
        address,
        region,
        area,
        process,
        startDate,
        endDate,
        notes,
        blueprintUrl: blueprintName || "simulation_blueprint.pdf",
        photos: photoUrl ? [photoUrl] : ["https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=600&q=80"],
        status: "bidding",
      });
      
      // 폼 초기화 및 새로 등록된 현장 자동선택
      setTitle("");
      setAddress("");
      setNotes("");
      setBlueprintName("");
      setPhotoUrl("");
      setAiReport(null);
      setSelectedProject(newProj);
      alert("🎉 시공파트너 입찰이 정상 등록되었습니다! 인근 공정 전문가에게 매칭 알림이 즉시 발송됩니다.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. 낙찰 및 선결제 개시
  const handleInitiateAward = (bid: Bid) => {
    setPendingBid(bid);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (selectedProject && pendingBid) {
      onSelectWinner(selectedProject.id, pendingBid.id, pendingBid.contractorId);
      // 로컬 선택 상태 업데이트
      setSelectedProject({
        ...selectedProject,
        status: "paid",
        winnerBidId: pendingBid.id,
        winnerContractorId: pendingBid.contractorId,
      });
      setShowPaymentModal(false);
      setPendingBid(null);
      alert("💳 에스크로 선결제가 정상 완료되었습니다!\n상대 시공사의 실명 및 연락처 정보가 모두 해제되고, 1:1 실시간 협의 채팅방이 자동 개설되었습니다.");
    }
  };

  // 4. 평가 제출
  const handleReviewSubmit = () => {
    if (selectedProject) {
      onSubmitReview(
        selectedProject.id,
        reviewRating,
        reviewQuality,
        reviewSchedule,
        reviewComms,
        reviewRehire,
        reviewComment
      );
      // 로컬 선택 상태 완료로 전환
      setSelectedProject({
        ...selectedProject,
        status: "completed",
      });
      setShowReviewModal(false);
      alert("⭐ 정직한 시공 평가가 정상 등록되었습니다. 해당 대금이 에스크로 안전 금고에서 시공업자에게 성공적으로 정산되었습니다.");
    }
  };

  // 현재 인테리어 업체의 프로젝트 필터
  const myProjects = projects.filter((p) => p.interiorId === currentUser.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="interior-panel-root">
      {/* 1. 신규 입찰 현장 등록 폼 (좌측 5칸) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-bold">인테리어 전용</span>
          <h3 className="text-lg font-bold text-slate-800 mt-2 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            신규 공사현장 입찰 등록
          </h3>
          <p className="text-xs text-slate-500 mt-1">현장 정보와 공정을 입력하면 매칭 업자에게 모바일 알림이 즉시 전송됩니다.</p>
        </div>

        <form onSubmit={handleRegisterProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">현장 타이틀 *</label>
            <input
              type="text"
              required
              placeholder="예) 광주 북구 32평 아파트 타일 공사"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">상세 주소 *</label>
              <input
                type="text"
                required
                placeholder="예) 광주광역시 북구 용봉동 현대아파트"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">지역 시/도 *</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
              >
                {REGIONS_LIST.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">시공 평수 *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full text-xs pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">평</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">지정 공정 *</label>
              <select
                value={process}
                onChange={(e) => setProcess(e.target.value as ProcessType)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
              >
                {PROCESS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">공사 시작일 *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">공사 종료일 *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">도면 업로드 (시뮬레이션)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="pdf-upload-btn"
                  onClick={() => setBlueprintName("design_drawing_ver2.pdf")}
                  className="flex-1 text-center border border-dashed border-slate-200 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-50 transition"
                >
                  {blueprintName ? "📄 " + blueprintName : "📁 도면 PDF 첨부"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">현장 사진 (시뮬레이션)</label>
              <button
                type="button"
                id="photo-upload-btn"
                onClick={() => setPhotoUrl("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80")}
                className="w-full text-center border border-dashed border-slate-200 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-50 transition"
              >
                {photoUrl ? "🖼️ 현장사진1.jpg 등록됨" : "📸 현장 실물사진 등록"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">특이사항 & 요구 사양 *</label>
            <textarea
              required
              rows={3}
              placeholder="자재 등급 설정, 현장 층수, 엘리베이터 유무 및 졸리컷 마감 필수 등 특이사항을 적어주세요."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* AI 리포트 추천 미리보기 패널 */}
          {aiReport && (
            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-4 border border-indigo-100/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini AI 분석 견적 리포트
                </span>
                {aiReport.isFallback && <span className="text-[9px] text-indigo-500 font-mono bg-indigo-100 px-1.5 py-0.2 rounded">Simulated</span>}
              </div>
              
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="text-xs text-slate-500">예상 적정 최저가 범위</span>
                <span className="text-sm font-bold text-indigo-600">
                  ₩{aiReport.estimatedLow.toLocaleString()} ~ ₩{aiReport.estimatedHigh.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 block">💡 성공적인 매칭을 위한 시공 가이드</span>
                  <ul className="list-disc list-inside text-[10px] text-slate-600 mt-1 space-y-1">
                    {aiReport.recommendations.slice(0, 2).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              id="ai-analyze-btn"
              onClick={handleAiAnalyze}
              disabled={isAiLoading}
              className="px-4 py-3 rounded-xl border border-indigo-200 text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition flex items-center gap-1.5 justify-center"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAiLoading ? "분석 중..." : "AI 사전 진단"}
            </button>
            <button
              type="submit"
              id="register-submit-btn"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
            >
              {isSubmitting ? "공사 등록 중..." : "입찰 현장으로 등록하기"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. 등록된 현장 목록 & 역경매 실시간 비교 패널 (우측 7칸) */}
      <div className="lg:col-span-7 space-y-6">
        {/* 등록된 나의 현장 리스트 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            내 입찰 등록 현장 ({myProjects.length}건)
          </h3>

          {myProjects.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">등록된 공사 현장이 없습니다. 좌측에서 등록해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[220px] overflow-y-auto pr-1">
              {myProjects.map((proj) => {
                const projectBids = bids.filter((b) => b.projectId === proj.id);
                return (
                  <button
                    key={proj.id}
                    id={`project-select-btn-${proj.id}`}
                    onClick={() => setSelectedProject(proj)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                      selectedProject?.id === proj.id
                        ? "border-indigo-600 bg-indigo-50/20 shadow-sm"
                        : "border-slate-100 hover:border-slate-300 bg-slate-50/20"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{proj.title}</span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium">
                          {proj.process}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {proj.address} ({proj.area}평)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          proj.status === "bidding"
                            ? "bg-amber-100 text-amber-700"
                            : proj.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : proj.status === "completed"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-rose-100 text-rose-700"
                        }`}>
                          {proj.status === "bidding" ? "입찰 중" : proj.status === "paid" ? "선결제 완료(공사중)" : "공사 완료"}
                        </span>
                        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{projectBids.length}개 입찰 접수</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 선택한 현장의 실시간 최저가 입찰 현황 (역경매 화면) */}
        {selectedProject && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  최저가 입찰 실시간 비교 패널
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">역경매 특성에 따라 시공업체 상호 및 성명은 낙찰 완료 전까지 절대 비공개 처리됩니다.</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold">
                {selectedProject.process} 역경매 진행
              </span>
            </div>

            {/* 입찰 내역 및 정렬 (금액 오름차순으로 역경매 구현) */}
            {(() => {
              const projectBids = bids
                .filter((b) => b.projectId === selectedProject.id)
                .sort((a, b) => a.amount - b.amount); // 최저가 1위 순

              if (projectBids.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs">현재 도착한 입찰이 없습니다.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">시공사 모드로 전환하여 입찰에 직접 참여해 보세요!</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {projectBids.map((bid, index) => {
                    const isWinner = selectedProject.winnerBidId === bid.id;
                    const isPaid = selectedProject.status === "paid" || selectedProject.status === "completed";
                    const isMasked = !isWinner && !isPaid;

                    return (
                      <div
                        key={bid.id}
                        id={`bid-item-${bid.id}`}
                        className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                          isWinner
                            ? "bg-emerald-50/30 border-emerald-500/50"
                            : index === 0
                            ? "bg-amber-50/20 border-amber-300"
                            : "bg-slate-50/30 border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="bg-amber-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <TrendingDown className="w-2.5 h-2.5" />
                                최저가 1위
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-800">
                              {index + 1}순위 제안
                            </span>
                            
                            {/* 업체 정보 비공개 자물쇠 처리 */}
                            {isMasked ? (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                                <Lock className="w-2.5 h-2.5 text-slate-400" />
                                시공업체 {index + 1} (낙찰 전 봉인)
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                <Unlock className="w-2.5 h-2.5 text-emerald-500" />
                                {bid.contractorName} 공개완료
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                              ₩{bid.amount.toLocaleString()}원
                            </span>
                            <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="font-bold">{bid.contractorRating.toFixed(1)}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">일정: {bid.availableDates}</span>
                          </div>

                          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 mt-1 leading-relaxed">
                            {bid.memo}
                          </p>
                        </div>

                        {/* 시추에이션별 버튼 제어 */}
                        <div className="w-full md:w-auto flex flex-row md:flex-col gap-2">
                          {selectedProject.status === "bidding" ? (
                            <button
                              id={`award-btn-${bid.id}`}
                              onClick={() => handleAiAnalyze().then(() => handleInitiateAward(bid))}
                              className="w-full md:w-28 text-center bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                            >
                              낙찰 및 선결제
                            </button>
                          ) : isWinner ? (
                            <div className="w-full space-y-1">
                              <span className="block text-[10px] text-center font-bold text-emerald-700 bg-emerald-100/50 py-1 rounded-md mb-1.5">
                                🎉 최종 낙찰업체
                              </span>
                              
                              <div className="flex md:flex-col gap-1.5">
                                <button
                                  id={`chat-open-btn-${selectedProject.id}`}
                                  onClick={() => onOpenChat(selectedProject.id)}
                                  className="flex-1 md:w-28 flex items-center justify-center gap-1 bg-emerald-500 text-white py-1.5 rounded-lg text-[11px] font-bold hover:bg-emerald-600 transition"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  1:1 채팅방
                                </button>

                                {selectedProject.status === "paid" && (
                                  <button
                                    id={`complete-confirm-btn`}
                                    onClick={() => setShowReviewModal(true)}
                                    className="flex-1 md:w-28 flex items-center justify-center gap-1 bg-indigo-600 text-white py-1.5 rounded-lg text-[11px] font-bold hover:bg-indigo-700 transition"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    시공완료 승인
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium px-4 py-2 bg-slate-50 rounded-lg">입찰 종료</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 에스크로 선결제 모달 시뮬레이터 */}
      {showPaymentModal && pendingBid && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="payment-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-5">
            <div className="text-center">
              <span className="p-3 bg-indigo-50 text-indigo-600 rounded-full inline-block">
                <Lock className="w-6 h-6" />
              </span>
              <h4 className="text-base font-bold text-slate-800 mt-3">안전 에스크로 가상 선결제</h4>
              <p className="text-xs text-slate-500 mt-1">플랫폼 안전 거래 에스크로 금고에 계약 대금을 예치합니다.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">지정 공사</span>
                <span className="font-bold text-slate-800">{selectedProject.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">낙찰 가격 (견적가)</span>
                <span className="font-bold text-indigo-600">₩{pendingBid.amount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-800">
                <span>총 안전 결제액</span>
                <span className="text-indigo-600">₩{pendingBid.amount.toLocaleString()}원</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 leading-relaxed bg-amber-50 p-3 rounded-lg border border-amber-100">
              💡 <strong>에스크로 보증 방식이란?</strong><br />
              전체 공사 대금을 시공파트너가 안심 금고에 임시 보관한 뒤, 공사가 하자 없이 안전하게 완료된 후 인테리어 업체의 승인을 거쳐 시공사에게 최종 정산 처리됩니다.
            </div>

            <div className="flex gap-2.5">
              <button
                id="cancel-payment-btn"
                onClick={() => { setShowPaymentModal(false); setPendingBid(null); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                취소하기
              </button>
              <button
                id="confirm-payment-btn"
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                선결제 이체 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 시공 완료 승인 및 상호 평점/후기 작성 모달 */}
      {showReviewModal && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="review-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="text-center border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-800">시공 기성 승인 및 정직한 평가</h4>
              <p className="text-xs text-slate-500">공사가 완벽히 완료되었나요? 솔직한 시공 경험을 남겨주시면 정산이 진행됩니다.</p>
            </div>

            <div className="space-y-4">
              {/* 별점 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">전체 평점 (5점 만점)</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="text-amber-400 hover:scale-110 transition"
                    >
                      <Star className={`w-6 h-6 ${reviewRating >= star ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 세부 항목 평가 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">🛠️ 시공 품질</span>
                  <select
                    value={reviewQuality}
                    onChange={(e) => setReviewQuality(Number(e.target.value))}
                    className="border border-slate-200 rounded px-2 py-1 bg-slate-50"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}점</option>)}
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">📅 일정 준수</span>
                  <select
                    value={reviewSchedule}
                    onChange={(e) => setReviewSchedule(Number(e.target.value))}
                    className="border border-slate-200 rounded px-2 py-1 bg-slate-50"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}점</option>)}
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">💬 의사소통</span>
                  <select
                    value={reviewComms}
                    onChange={(e) => setReviewComms(Number(e.target.value))}
                    className="border border-slate-200 rounded px-2 py-1 bg-slate-50"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}점</option>)}
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">🤝 재계약 의사</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReviewRehire(true)}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition ${reviewRehire ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "border-slate-200 text-slate-500"}`}
                    >
                      있음
                    </button>
                    <button
                      onClick={() => setReviewRehire(false)}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition ${!reviewRehire ? "bg-rose-50 border-rose-600 text-rose-600" : "border-slate-200 text-slate-500"}`}
                    >
                      없음
                    </button>
                  </div>
                </div>
              </div>

              {/* 후기 코멘트 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">상세 시공 코멘트</label>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="예) 마감이 정말 정밀하고 피드백도 잘 수용해주셨습니다. 강력히 추천합니다!"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                id="cancel-review-btn"
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                닫기
              </button>
              <button
                id="submit-review-btn"
                onClick={handleReviewSubmit}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                평가 완료 및 정산 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
