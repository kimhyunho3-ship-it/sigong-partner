import React, { useState, useEffect, useRef } from "react";
import { User, Project, ChatMessage } from "../types";
import { Send, MessageSquare, ShieldAlert, Sparkles, Plus, AlertCircle, ArrowLeft } from "lucide-react";

interface ChatRoomProps {
  project: Project;
  currentUser: User;
  chatMessages: ChatMessage[];
  onSendMessage: (projectId: string, text: string) => void;
  onClose: () => void;
  onRaiseDispute: (projectId: string, title: string, description: string) => void;
}

export default function ChatRoom({
  project,
  currentUser,
  chatMessages,
  onSendMessage,
  onClose,
  onRaiseDispute,
}: ChatRoomProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI 채팅 가이드라인 추천 칩 목록 (실제 Gemini 호출 결과 또는 디폴트 지능형 칩셋)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 분쟁 신청 모달 제어
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeTitle, setDisputeTitle] = useState("");
  const [disputeDesc, setDisputeDesc] = useState("");

  // 1. 컴포넌트 부트 시, Gemini를 통해 현장 맞춤형 사전 체크 가이드 4종 생성
  useEffect(() => {
    const fetchChatSuggestions = async () => {
      setIsAiLoading(true);
      try {
        const response = await fetch("/api/ai/chat-suggestion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            process: project.process,
            area: project.area,
            notes: project.notes,
          }),
        });
        const data = await response.json();
        if (data.suggestions) {
          setAiSuggestions(data.suggestions);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchChatSuggestions();
  }, [project]);

  // 2. 새로운 메시지 수신 시 하단 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(project.id, inputText);
    setInputText("");
  };

  // 3. AI 가이드 추천 칩 클릭 시 입력창으로 자동 복사
  const handleApplySuggestion = (text: string) => {
    setInputText(text);
  };

  // 4. 분쟁 제기 접수
  const handleRaiseDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeTitle || !disputeDesc) {
      alert("분쟁 타이틀과 내용을 모두 작성해 주세요.");
      return;
    }
    onRaiseDispute(project.id, disputeTitle, disputeDesc);
    setShowDisputeModal(false);
    setDisputeTitle("");
    setDisputeDesc("");
    alert("🚨 분쟁 및 하자 조율 안건이 본사 관리자팀에 접수되었습니다.\n어드민 대시보드(Admin) 탭에서 해당 조율 결과를 실시간으로 모니터링하고 종결 처리할 수 있습니다.");
  };

  // 현재 이 공사와 연동된 채팅 목록
  const activeMessages = chatMessages.filter((m) => m.projectId === project.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]" id="chat-room-root">
      
      {/* 1. 채팅방 헤더 */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            id="chat-back-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              1:1 안전 계약 협의방
            </h4>
            <p className="text-[10px] text-slate-400">{project.title} (에스크로 안전 예치 완료)</p>
          </div>
        </div>

        {/* 중재 신청 버튼 */}
        <button
          id="raise-dispute-btn"
          onClick={() => setShowDisputeModal(true)}
          className="flex items-center gap-1 text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1.5 rounded-lg font-bold hover:bg-rose-100 transition"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          하자/분쟁 중재 신청
        </button>
      </div>

      {/* 2. 에스크로 고지 및 AI 사전 협의 사항 제안 영역 */}
      <div className="p-3 bg-indigo-50/40 border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-extrabold text-indigo-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Gemini AI 추천 - 채팅 사전 체크 가이드라인
          </span>
          {isAiLoading && <span className="text-[8px] text-slate-400 animate-pulse">AI 분석중...</span>}
        </div>

        {/* AI 가이드 칩 버튼들 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {aiSuggestions.map((sug, i) => (
            <button
              key={i}
              id={`ai-chat-sug-chip-${i}`}
              onClick={() => handleApplySuggestion(sug)}
              className="flex-none bg-white border border-indigo-100 text-slate-600 px-3 py-1 rounded-full text-[10px] hover:border-indigo-500 hover:bg-indigo-50/30 transition-all font-medium"
            >
              💬 {sug.slice(0, 24)}...
            </button>
          ))}
          {aiSuggestions.length === 0 && !isAiLoading && (
            <span className="text-[10px] text-slate-400">현장 분석에 맞춰 협의 가이드 칩이 로드됩니다.</span>
          )}
        </div>
      </div>

      {/* 3. 대화 메시지 렌더 영역 */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30">
        
        {/* 안전 결제 안심 문구 */}
        <div className="flex items-center gap-2 justify-center py-2 bg-emerald-50/50 rounded-xl border border-emerald-100/30 max-w-sm mx-auto text-[10px] text-emerald-800 font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
          안전 결제 에스크로 대금이 임시 금고에 보증 보관 중입니다.
        </div>

        {activeMessages.map((msg) => {
          const isMe = msg.senderRole === currentUser.role;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] text-slate-400 font-bold">
                  {isMe ? "나 (" + (currentUser.role === "interior" ? "인테리어" : "시공사") + ")" : "상대방"}
                </span>
                <span className="text-[8px] text-slate-300">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-xs ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. 대화 작성 인풋 */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="사전 조율 사항을 물어보거나 위에 표시된 AI 협의 추천 칩을 클릭해 보세요."
          className="flex-1 text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
        />
        <button
          type="submit"
          id="chat-send-btn"
          className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* 하자 / 대금 분쟁 제기 팝업 모달 */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="dispute-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="text-center border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-rose-700 flex items-center gap-1.5 justify-center">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                플랫폼 본사 직권 중재 신청
              </h4>
              <p className="text-xs text-slate-500 mt-1">공사 마감 하자, 대금 이견 등 갈등 발생 시 관리자가 개입하여 즉시 사실 조사를 대행합니다.</p>
            </div>

            <form onSubmit={handleRaiseDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">분쟁 안건 타이틀 *</label>
                <input
                  type="text"
                  required
                  placeholder="예) 마루 시공 들뜸 현상 하자 보수 이견"
                  value={disputeTitle}
                  onChange={(e) => setDisputeTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">상세 분쟁 및 피해 사실 사유 *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="하자 사진이나 실제 협의 과정에서의 피해 규모 등을 소상히 적어주시면 중재에 큰 도움이 됩니다."
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  id="cancel-dispute-btn"
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500"
                >
                  취소하기
                </button>
                <button
                  type="submit"
                  id="submit-dispute-btn"
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                >
                  중재 신청 접수하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
