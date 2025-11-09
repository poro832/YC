import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./Header";
import MiniProfile from "./MiniProfile";
import LoginForm from "./LoginForm";
import Mentoring from "./Mentoring";
import MentoringChat from "./MentoringChat";
import Headhunting from "./Headhunting";
import AIInterview from "./AIInterview";

// 메인 페이지 컴포넌트 추가
function MainPage() {
  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      <MiniProfile />
      {/* 여기에 메인 페이지 콘텐츠 추가 가능 */}
      <div style={{ padding: '2rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#455492' }}>
          YourConnect에 오신 것을 환영합니다
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b', lineHeight: '1.75' }}>
          AI 기반 커리어 개발 플랫폼으로 당신의 성공적인 커리어를 설계하세요.
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="bg-body text-main">
      {/* 로그인 페이지가 아닐 때만 헤더 표시 */}
      {!isLoginPage && <Header />}
      
      <main>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/ai-interview" element={<AIInterview />} />
          <Route path="/mentoring" element={<Mentoring />} />
          <Route path="/mentoring-chat" element={<MentoringChat />} />
          <Route path="/headhunting" element={<Headhunting />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </main>
      
      {!isLoginPage && <footer>{/* 푸터 영역 */}</footer>}
    </div>
  );
}

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AppContent />
    </Router>
  );
}

export default App;