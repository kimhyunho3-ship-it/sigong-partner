import React, { useState } from "react";
import { User, Project, Bid, Dispute } from "../types";
import { Users, Landmark, AlertTriangle, Check, ShieldCheck, Scale, RefreshCw, BarChart2, DollarSign } from "lucide-react";

interface AdminPanelProps {
  users: User[];
  projects: Project[];
  bids: Bid[];
  disputes: Dispute[];
  onApproveUser: (userId: string) => void;
  onResolveDispute: (disputeId: string, status: "resolved" | "dismissed", note: string) => void;
}

export default function AdminPanel({
  users,
  projects,
  bids,
  disputes,
  onApproveUser,
  onResolveDispute,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"users" | "escrow" | "disputes">("users");

  // 분쟁 처리 의견 상태
  const [adminNote, setAdminNote] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  // 미승인 시공사 목록
  const pendingUsers = users.filter((u) => u.role === "contractor" && !u.isApproved);

  // 통계 계산
  const totalEscrowAmount = projects
    .filter((p) => p.status === "paid")
    .reduce((acc, p) => {
      const bid = bids.find((b) => b.id === p.winnerBidId);
      return acc + (bid ? bid.amount : 0);
    }, 0);

  const completedVolume = projects
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => {
      const bid = bids.find((b) => b.id === p.winnerBidId);
      return acc + (bid ? bid.amount : 0);
    }, 0);

  // 플랫폼 수수료 수익 (평균 4% 적용)
  const feeRevenue = Math.round(completedVolume * 0.04);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="admin-panel-root">
      
      {/* 관리자 헤더 */}
      <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold tracking-wider">PLATFORM CONSOLE</span>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            시공파트너 안전 거래 총괄 어드민 대시보드
          </h3>
        </div>

        {/* 미니 탭 컨트롤 */}
        <div className="flex bg-slate-800 rounded-xl p-1 w-full md:w-auto text-xs">
          <button
            id="admin-tab-users"
            onClick={() => setActiveTab("users")}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeTab === "users" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            가입 승인 ({pendingUsers.length})
          </button>
          <button
            id="admin-tab-escrow"
            onClick={() => setActiveTab("escrow")}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeTab === "escrow" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            에스크로 / 수수료
          </button>
          <button
            id="admin-tab-disputes"
            onClick={() => setActiveTab("disputes")}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              activeTab === "disputes" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            분쟁 관리 ({disputes.length})
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 min-h-[400px]">
        {/* TAB 1: 회원 사업자 가입 승인 검수 */}
        {activeTab === "users" && (
          <div className="space-y-6" id="admin-users-subtab">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-800">사업자 등록증 검수 및 승인 관리</h4>
              <p className="text-xs text-slate-400 mt-1">전문 시공 품질 확보를 위해 가입한 업체의 신원 및 사업자 진위 여부를 대조 검수합니다.</p>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-indigo-400" />
                <p className="text-xs font-bold text-slate-800">대기 중인 회원이 존재하지 않습니다.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">현재 모든 시공 회원사의 가입 승인 검수가 정상 처리 완료되었습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 block">{user.companyName}</span>
                        <p className="text-[11px] text-slate-500">담당자: {user.name} | 연락처: {user.phone}</p>
                        <p className="text-[11px] text-indigo-600 font-bold">주 공정: {user.specialty?.join(", ")}</p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 font-bold text-[9px] px-2 py-0.5 rounded">승인 대기</span>
                    </div>

                    {/* 가짜 사업자등록증 그래픽 표현 */}
                    <div className="border border-slate-200 bg-white rounded-xl p-4 font-mono text-[9px] text-slate-500 space-y-1 shadow-xs">
                      <div className="text-center font-bold text-xs text-slate-800 border-b border-slate-200 pb-1 mb-2">사업자 등록증 (시뮬레이션)</div>
                      <p>• 상호: {user.companyName}</p>
                      <p>• 대표자명: {user.name}</p>
                      <p>• 등록 번호: {user.businessNumber || "120-15-XXXXX"}</p>
                      <p>• 업태: 인테리어 / 주 종목: {user.specialty?.[0] || "전공정"}</p>
                    </div>

                    <button
                      id={`approve-user-btn-${user.id}`}
                      onClick={() => onApproveUser(user.id)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      위 사업자 승인 완료하기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 에스크로 수수료 지표 대시보드 */}
        {activeTab === "escrow" && (
          <div className="space-y-6" id="admin-escrow-subtab">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-800">에스크로 보관 자금 및 수수료 수입 현황</h4>
              <p className="text-xs text-slate-400 mt-1">현재 플랫폼 내의 총 거래 규모와 예치 안전 계좌 현황을 트래킹합니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/60 space-y-2">
                <span className="text-xs text-indigo-700 font-semibold flex items-center gap-1">
                  <Landmark className="w-4 h-4" />
                  현재 보관중인 에스크로
                </span>
                <p className="text-2xl font-bold text-indigo-900">₩{totalEscrowAmount.toLocaleString()}원</p>
                <p className="text-[10px] text-slate-500">인테리어 결제 후 공사가 아직 진행 중인 계약 예치금</p>
              </div>

              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/60 space-y-2">
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <BarChart2 className="w-4 h-4" />
                  완료된 총 거래 규모
                </span>
                <p className="text-2xl font-bold text-emerald-900">₩{completedVolume.toLocaleString()}원</p>
                <p className="text-[10px] text-slate-500">최종 승인이 완료되어 시공사 정산 이체 완료된 총액</p>
              </div>

              <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/60 space-y-2">
                <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  플랫폼 누적 중개 수수료 수입
                </span>
                <p className="text-2xl font-bold text-amber-900">₩{feeRevenue.toLocaleString()}원</p>
                <p className="text-[10px] text-slate-500">완료 거래 수수료 수익 (평균 4% 중개 이윤)</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800">에스크로 자금 보관 규정 설명</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                시공파트너 플랫폼은 공정거래위원회의 B2B 에스크로 안심 결제 매뉴얼을 준수합니다. 
                중개 거래 자금은 제1금융권 에스크로 가상 전용 계좌에 완전히 신탁 위탁 보관되며, 시공사 및 인테리어 업체의 쌍방 계약 승인 피드백 완료 시에만 출금 및 이체 지시가 처리되어 먹튀나 덤핑, 불법 하도급 문제를 예방합니다.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: 분쟁 관리 조율 어드민 */}
        {activeTab === "disputes" && (
          <div className="space-y-6" id="admin-disputes-subtab">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-800">실시간 하자 및 시공 분쟁 조율 가이드</h4>
              <p className="text-xs text-slate-400 mt-1">시공 불량, 공기 지연 등의 사유로 인테리어 사와 시공업자가 대립할 때 조율을 전담합니다.</p>
            </div>

            {disputes.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Scale className="w-10 h-10 mx-auto mb-2 text-indigo-400" />
                <p className="text-xs font-bold text-slate-800">현재 미조정된 분쟁 건이 존재하지 않습니다.</p>
                <p className="text-[10px] text-slate-400">플랫폼이 매우 클린하게 운영되고 있습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((disp) => {
                  const proj = projects.find((p) => p.id === disp.projectId);
                  return (
                    <div key={disp.id} className="p-5 rounded-2xl border border-amber-100 bg-amber-50/10 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">🚨 [{disp.creatorRole === "interior" ? "인테리어 접수" : "시공사 접수"}] {disp.title}</span>
                          <p className="text-[11px] text-slate-500 mt-1">대상 공사: {proj?.title || "현장정보 불명"}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          disp.status === "open" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {disp.status === "open" ? "중재 조율중" : "해결 완료"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                        <strong>분쟁 내용:</strong> {disp.description}
                      </p>

                      {disp.status === "open" ? (
                        <div className="space-y-3">
                          <textarea
                            rows={2}
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="관리자 직권 중재 합의 결정사항을 입력해주세요. (예: 현장 실사 조사 결과 시공사 과실 인정되어 총 대금의 10% 감액 후 정산 처리 합의함)"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              id={`resolve-btn-${disp.id}`}
                              onClick={() => {
                                onResolveDispute(disp.id, "resolved", adminNote || "합의 및 직권 정산 조율 해결됨");
                                setAdminNote("");
                              }}
                              className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
                            >
                              중재 조율 종결 (resolved)
                            </button>
                            <button
                              id={`dismiss-btn-${disp.id}`}
                              onClick={() => {
                                onResolveDispute(disp.id, "dismissed", adminNote || "접수 요건 미충족으로 기각됨");
                                setAdminNote("");
                              }}
                              className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition"
                            >
                              이의 기각 처리 (dismissed)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-100 p-3 rounded-lg text-xs text-slate-600">
                          <strong>최종 관리자 중재 비고:</strong> {disp.adminNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
