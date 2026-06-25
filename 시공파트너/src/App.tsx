import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { User, Project, Bid, ChatMessage, Dispute, ProcessType, Region } from "./types";
import { INITIAL_USERS, INITIAL_PROJECTS, INITIAL_BIDS, INITIAL_CHAT_MESSAGES } from "./data";
import InteriorPanel from "./components/InteriorPanel";
import ContractorPanel from "./components/ContractorPanel";
import AdminPanel from "./components/AdminPanel";
import ChatRoom from "./components/ChatRoom";
import DocsTab from "./components/DocsTab";
import { Layout, Smartphone, FileText, Settings, Users, Bell, MessageSquare, Landmark, Award, Shield, ChevronRight } from "lucide-react";

export default function App() {
  // 전역 상태 정의 (새로고침 시 영속화 지원)
  const [activeTab, setActiveTab] = useState<"simulation" | "docs">("simulation");
  const [activeRole, setActiveRole] = useState<"interior" | "contractor" | "admin">("interior");

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("sp_users");
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("sp_projects");
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [bids, setBids] = useState<Bid[]>(() => {
    const saved = localStorage.getItem("sp_bids");
    return saved ? JSON.parse(saved) : INITIAL_BIDS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("sp_chat_messages");
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [disputes, setDisputes] = useState<Dispute[]>(() => {
    const saved = localStorage.getItem("sp_disputes");
    return saved ? JSON.parse(saved) : [];
  });

  // 현재 역할군에 매칭되는 유저 데이터 가리키기
  const currentUser = users.find(
    (u) =>
      u.role === activeRole &&
      (activeRole === "interior"
        ? u.id === "user_interior_1"
        : activeRole === "contractor"
        ? u.id === "user_contractor_1"
        : u.id === "user_admin")
  ) || users[0];

  // 활성화된 실시간 채팅 프로젝트 상태
  const [activeChatProjectId, setActiveChatProjectId] = useState<string | null>(null);

  // 로컬스토리지 동기화
  useEffect(() => {
    localStorage.setItem("sp_users", JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem("sp_projects", JSON.stringify(projects));
  }, [projects]);
  useEffect(() => {
    localStorage.setItem("sp_bids", JSON.stringify(bids));
  }, [bids]);
  useEffect(() => {
    localStorage.setItem("sp_chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);
  useEffect(() => {
    localStorage.setItem("sp_disputes", JSON.stringify(disputes));
  }, [disputes]);

  // -------------------------------------------------------------------
  // 1. 입찰 등록 및 가상 응답 타이머 (역경매 시뮬레이션의 핵심!)
  // -------------------------------------------------------------------
  const handleAddProject = async (newProjData: Omit<Project, "id" | "interiorId" | "interiorName" | "createdAt">) => {
    // 1. Supabase 실시간 연동 등록 요청 (Vite 클라이언트 환경 변수 우선 활용)
    try {
      const url = (import.meta as any).env.VITE_SUPABASE_URL;
      const anonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

      if (url && anonKey && !url.includes("your-project") && !anonKey.includes("your-anon-key")) {
        console.log("Vite 클라이언트 환경 변수를 감지하여 Supabase에 직접 데이터를 저장합니다.");
        const supabaseClient = createClient(url, anonKey);
        const { data, error } = await supabaseClient
          .from("construction_sites")
          .insert([
            {
              title: newProjData.title,
              address: newProjData.address,
              size: Number(newProjData.area) || 0, // 평수 -> size 매핑
              category: newProjData.process, // 공정 -> category 매핑
              region: newProjData.region, // 지역 매핑
              start_date: newProjData.startDate, // 시작일 매핑
              end_date: newProjData.endDate, // 종료일 매핑
              description: newProjData.notes, // 특이사항 -> description 매핑
            }
          ])
          .select();

        if (error) {
          throw error;
        }

        console.log("Supabase 클라이언트 직접 저장 완료:", data);
        alert(`🎉 Supabase 데이터베이스('construction_sites' 테이블)에 성공적으로 직접 실시간 등록되었습니다!\n\n• 현장명: ${newProjData.title}\n• 주소: ${newProjData.address}\n• 지역: ${newProjData.region}\n• 평수: ${newProjData.area}평\n• 공정: ${newProjData.process}\n• 공사 기간: ${newProjData.startDate} ~ ${newProjData.endDate}\n• 특이사항: ${newProjData.notes}`);
      } else {
        // 클라이언트 환경 변수가 설정되어 있지 않으면 백엔드 API 프록시 호출로 대체합니다.
        console.log("Vite 클라이언트 환경 변수가 감지되지 않아 백엔드 API 프록시 호출을 수행합니다.");
        const response = await fetch("/api/construction-sites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newProjData.title,
            address: newProjData.address,
            size: newProjData.area, // 평수 -> size 매핑
            category: newProjData.process, // 공정 -> category 매핑
            region: newProjData.region, // 지역 매핑
            start_date: newProjData.startDate, // 시작일 매핑
            end_date: newProjData.endDate, // 종료일 매핑
            description: newProjData.notes, // 특이사항 -> description 매핑
          }),
        });
        const result = await response.json();
        if (result.success) {
          if (result.fallback) {
            console.log("Supabase 미설정 상태 - 로컬 시뮬레이션 작동:", result.message);
          } else {
            console.log("Supabase 백엔드 프록시 저장 완료:", result.data);
            alert(`🎉 Supabase 데이터베이스('construction_sites' 테이블)에 백엔드 프록시를 통해 성공적으로 실시간 등록되었습니다!\n\n• 현장명: ${newProjData.title}\n• 주소: ${newProjData.address}\n• 지역: ${newProjData.region}\n• 평수: ${newProjData.area}평\n• 공정: ${newProjData.process}\n• 공사 기간: ${newProjData.startDate} ~ ${newProjData.endDate}\n• 특이사항: ${newProjData.notes}`);
          }
        } else {
          alert(`Supabase 연동 실패: ${result.message}`);
        }
      }
    } catch (error: any) {
      console.error("Supabase API 호출 중 오류 발생:", error);
      alert(`Supabase 연동 과정에서 오류가 발생했습니다: ${error.message || error}`);
    }

    const newProject: Project = {
      ...newProjData,
      id: "project_" + (projects.length + 1),
      interiorId: "user_interior_1",
      interiorName: "김민재 실장",
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);

    // [중요 시뮬레이션 효과]
    // 3초 후 다른 경쟁 시공업체(예: 이도배 팀장 등)가 자동으로 모의 입찰을 올려
    // 역경매 플랫폼의 현장감 넘치는 입찰 경쟁을 구현합니다.
    setTimeout(() => {
      // 평당 8만원선에서 미세 난수 추가하여 입찰가 생성
      const baseBidAmount = Math.round((newProject.area * 75000 + Math.random() * 200000) / 10000) * 10000;
      
      const autoBid: Bid = {
        id: "bid_auto_" + Date.now(),
        projectId: newProject.id,
        contractorId: "user_contractor_2", // 이도배 팀장
        contractorName: "한울 도배하우스 (이도배 팀장)",
        contractorRating: 4.6,
        amount: baseBidAmount,
        availableDates: "지정 기간 내 전일 소화 가능",
        memo: "시공파트너 자동 최저가 매칭 입찰 건입니다. 친환경 도배 풀 및 고급 원사를 사용하여 깔끔한 현장 청소와 마무리를 약속합니다.",
        createdAt: new Date().toISOString(),
      };

      setBids((prev) => [...prev, autoBid]);
      
      // 모바일 기기 푸시 수신 시뮬레이션 알림 발생
      console.log(`🔔 [FCM 시뮬레이션] ${newProject.title} 현장에 최저가 입찰이 등록되었습니다.`);
    }, 4000);

    return newProject;
  };

  // -------------------------------------------------------------------
  // 2. 낙찰 및 선결제 처리
  // -------------------------------------------------------------------
  const handleSelectWinner = (projectId: string, bidId: string, contractorId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, status: "paid", winnerBidId: bidId, winnerContractorId: contractorId }
          : p
      )
    );
  };

  // -------------------------------------------------------------------
  // 3. 시공사 가입 정보 업데이트
  // -------------------------------------------------------------------
  const handleUpdateSpecialty = (specialty: ProcessType[], regions: Region[]) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, specialty, regions } : u
      )
    );
  };

  // -------------------------------------------------------------------
  // 4. 시공사 직접 입찰 제출
  // -------------------------------------------------------------------
  const handleSubmitBid = (projectId: string, amount: number, availableDates: string, memo: string) => {
    const newBid: Bid = {
      id: "bid_" + (bids.length + 1),
      projectId,
      contractorId: currentUser.id,
      contractorName: `${currentUser.companyName} (${currentUser.name})`,
      contractorRating: currentUser.rating,
      amount,
      availableDates,
      memo,
      createdAt: new Date().toISOString(),
    };
    setBids((prev) => [...prev, newBid]);
  };

  // -------------------------------------------------------------------
  // 5. 1:1 대화방 실시간 메시지 발송 & 3초 지능 응답 시뮬레이션
  // -------------------------------------------------------------------
  const handleSendMessage = (projectId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      projectId,
      senderId: currentUser.id,
      senderRole: currentUser.role as "interior" | "contractor",
      text,
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // 상대방 자동 답변 타이머 시뮬레이션
    setTimeout(() => {
      let replyText = "네, 메시지 확인했습니다. 상세 요구조건 확인 후 내일 오전에 현장에서 직접 자재 체크하며 뵙겠습니다.";
      if (text.includes("엘리베이터") || text.includes("보양")) {
        replyText = "엘리베이터 사용이나 보양 작업은 현장 상황에 맞춰 전용 보양재를 들고 가 준비하겠습니다. 보양 자재비는 낙찰가 내에 서비스로 제공됩니다!";
      } else if (text.includes("하자") || text.includes("보수")) {
        replyText = "저희는 시공 완료일 기준으로 1년간 철저히 무상 하자 이행을 보증해 드리니 하자는 염려하지 않으셔도 괜찮습니다.";
      }

      const replyMsg: ChatMessage = {
        id: "msg_reply_" + Date.now(),
        projectId,
        senderId: currentUser.role === "interior" ? "user_contractor_1" : "user_interior_1",
        senderRole: currentUser.role === "interior" ? "contractor" : "interior",
        text: replyText,
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, replyMsg]);
    }, 3000);
  };

  // -------------------------------------------------------------------
  // 6. 공사 종료 승인
  // -------------------------------------------------------------------
  const handleCompleteProject = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "completed" } : p))
    );
  };

  // -------------------------------------------------------------------
  // 7. 평점 및 후기 제출 완료
  // -------------------------------------------------------------------
  const handleReviewSubmit = (
    projectId: string,
    rating: number,
    quality: number,
    schedule: number,
    comms: number,
    rehire: boolean,
    comment: string
  ) => {
    // 프로젝트 완료 처리
    handleCompleteProject(projectId);
    
    // 시공자의 평점 가중 연산 시뮬레이션
    const proj = projects.find((p) => p.id === projectId);
    if (proj && proj.winnerContractorId) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === proj.winnerContractorId) {
            const newCount = u.reviewCount + 1;
            const newRating = (u.rating * u.reviewCount + rating) / newCount;
            return { ...u, rating: newRating, reviewCount: newCount };
          }
          return u;
        })
      );
    }
  };

  // -------------------------------------------------------------------
  // 8. 분쟁 제기 접수
  // -------------------------------------------------------------------
  const handleRaiseDispute = (projectId: string, title: string, description: string) => {
    const newDispute: Dispute = {
      id: "dispute_" + (disputes.length + 1),
      projectId,
      title,
      description,
      status: "open",
      creatorId: currentUser.id,
      creatorRole: currentUser.role as "interior" | "contractor",
      createdAt: new Date().toISOString(),
    };
    setDisputes((prev) => [newDispute, ...prev]);

    // 프로젝트 상태를 분쟁중(dispute)으로 변경
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "dispute" } : p))
    );
  };

  // -------------------------------------------------------------------
  // 9. 가입 승인 처리
  // -------------------------------------------------------------------
  const handleApproveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isApproved: true } : u))
    );
    alert("👍 해당 시공사 회원의 가입 및 사업자 인증 승인이 최종 완료되었습니다!\n이제 해당 시공사는 즉시 모든 일감의 타겟팅 푸시 알림과 입찰 경쟁에 자유롭게 참여할 수 있습니다.");
  };

  // -------------------------------------------------------------------
  // 10. 분쟁 해결/중재 종결
  // -------------------------------------------------------------------
  const handleResolveDispute = (disputeId: string, status: "resolved" | "dismissed", note: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status, adminNote: note } : d))
    );

    // 분쟁 안건에 엮인 프로젝트 복귀 (승인 종결이면 completed, 기각이면 원래대로 가거나 completed)
    const disp = disputes.find((d) => d.id === disputeId);
    if (disp) {
      setProjects((prev) =>
        prev.map((p) => (p.id === disp.projectId ? { ...p, status: "completed" } : p))
      );
    }
    alert("⚖️ 본 분쟁 건의 조율 및 이의 처리가 완료되어 사건이 최종 종결(Closed)되었습니다.");
  };

  // 시뮬레이터 화면 초기화
  const handleResetData = () => {
    if (confirm("시뮬레이터 내부 데이터를 초기 모킹 데이터셋으로 리셋하시겠습니까?")) {
      localStorage.removeItem("sp_users");
      localStorage.removeItem("sp_projects");
      localStorage.removeItem("sp_bids");
      localStorage.removeItem("sp_chat_messages");
      localStorage.removeItem("sp_disputes");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased" id="app-root">
      
      {/* 글로벌 내비게이션 바 */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-40 shadow-xs" id="header-root">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base block">시공파트너</span>
              <span className="text-[10px] text-slate-400 block font-semibold">B2B 최저가 입찰 역경매 안심 플랫폼</span>
            </div>
          </div>

          {/* 메인 탭 전환: 데모 시뮬레이션 vs 설계 사양서 */}
          <div className="flex bg-slate-100 rounded-2xl p-1 text-xs">
            <button
              id="tab-simulation-btn"
              onClick={() => setActiveTab("simulation")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "simulation"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              데모 시뮬레이터
            </button>
            <button
              id="tab-docs-btn"
              onClick={() => setActiveTab("docs")}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === "docs"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              개발 설계 기획서
            </button>
          </div>

          {/* 리셋 버튼 */}
          <button
            id="reset-btn"
            onClick={handleResetData}
            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold transition"
          >
            데이터 리셋
          </button>
        </div>
      </header>

      {/* 메인 바디 영역 */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6" id="main-content">
        
        {/* TAB 1 : 데모 시뮬레이터 */}
        {activeTab === "simulation" && (
          <div className="space-y-6" id="simulation-tab-content">
            
            {/* 상단: 모킹 전용 역할군 교체 바 (체험용 최적화) */}
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-2xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-indigo-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-500 text-white font-black text-[9px] px-2 py-0.5 rounded tracking-wide animate-pulse">ROLE SWITCHER</span>
                  <h2 className="text-base font-bold flex items-center gap-1.5 text-white">
                    현재 모드: <span className="text-orange-400">{activeRole === "interior" ? "인테리어 업체" : activeRole === "contractor" ? "시공 전문업자" : "플랫폼 본사 관리자"}</span>
                  </h2>
                </div>
                <p className="text-xs text-indigo-200">
                  {activeRole === "interior"
                    ? "현장을 등록하고 최저가 입찰 현황을 보며 안전 선결제(에스크로)를 진행하는 플로우를 체험합니다."
                    : activeRole === "contractor"
                    ? "FCM 알림 리스트에서 타겟 공사를 수신하고 최저가 입찰에 참여하여 정산을 청구하는 플로우를 체험합니다."
                    : "시공 회원사의 사업자등록증 적격 승인 처리 및 하자/대금 정산 분쟁을 조율(중재)하는 어드민 대시보드입니다."}
                </p>
              </div>

              {/* 역할 교체 버튼 3셋 */}
              <div className="grid grid-cols-3 gap-2 bg-indigo-950/60 p-1.5 rounded-2xl w-full md:w-auto text-xs">
                <button
                  id="role-interior-btn"
                  onClick={() => { setActiveRole("interior"); setActiveChatProjectId(null); }}
                  className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeRole === "interior" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "text-indigo-200 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  인테리어사
                </button>
                <button
                  id="role-contractor-btn"
                  onClick={() => { setActiveRole("contractor"); setActiveChatProjectId(null); }}
                  className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeRole === "contractor" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "text-indigo-200 hover:text-white"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  시공업자
                </button>
                <button
                  id="role-admin-btn"
                  onClick={() => { setActiveRole("admin"); setActiveChatProjectId(null); }}
                  className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeRole === "admin" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "text-indigo-200 hover:text-white"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  본사 관리자
                </button>
              </div>
            </div>

            {/* 개설된 채팅방이 활성화된 경우 화면 상단에 플랙스 */}
            {activeChatProjectId ? (
              (() => {
                const proj = projects.find((p) => p.id === activeChatProjectId);
                if (!proj) return null;
                return (
                  <ChatRoom
                    project={proj}
                    currentUser={currentUser}
                    chatMessages={chatMessages}
                    onSendMessage={handleSendMessage}
                    onClose={() => setActiveChatProjectId(null)}
                    onRaiseDispute={handleRaiseDispute}
                  />
                );
              })()
            ) : (
              /* 역할군 판넬 렌더 */
              <>
                {activeRole === "interior" && (
                  <InteriorPanel
                    projects={projects}
                    bids={bids}
                    currentUser={currentUser}
                    onAddProject={handleAddProject}
                    onSelectWinner={handleSelectWinner}
                    onCompleteProject={handleCompleteProject}
                    onSubmitReview={handleReviewSubmit}
                    onOpenChat={(pId) => setActiveChatProjectId(pId)}
                  />
                )}

                {activeRole === "contractor" && (
                  <ContractorPanel
                    currentUser={currentUser}
                    projects={projects}
                    bids={bids}
                    onUpdateSpecialty={handleUpdateSpecialty}
                    onSubmitBid={handleSubmitBid}
                    onOpenChat={(pId) => setActiveChatProjectId(pId)}
                  />
                )}

                {activeRole === "admin" && (
                  <AdminPanel
                    users={users}
                    projects={projects}
                    bids={bids}
                    disputes={disputes}
                    onApproveUser={handleApproveUser}
                    onResolveDispute={handleResolveDispute}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2 : 개발 설계 기획서 */}
        {activeTab === "docs" && <DocsTab />}
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-12" id="footer-root">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-300">시공파트너 (Sigong Partner) B2B MVP Platform Prototype</p>
            <p className="text-[10px] text-slate-500">본 대시보드는 Flutter 앱 및 Firebase Firestore NoSQL 서비스 이식을 가이드하기 위한 인터랙티브 시뮬레이터입니다.</p>
          </div>
          <div className="flex gap-4 text-slate-500 font-mono text-[10px]">
            <span>Powered by Google GenAI (Gemini)</span>
            <span>Local Time: 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
