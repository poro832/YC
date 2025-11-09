import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './LoginForm.module.css'; // 👈 이 import는 올바릅니다.
import myLogo from './logo.png'; // 회사 로고 이미지 경로

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`로그인 시도: ${username}`);
    console.log('Username:', username);
    console.log('Password:', password);
    // 로그인 성공 후 메인 페이지 등으로 리다이렉트하는 로직이 추가됩니다.
    // 예: history.push('/');
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} 계정으로 로그인합니다.`);
  };

  return (
    
    <div className={styles['login-page-wrapper']}>
      <div className={styles['login-box']}>
        <Link to="/">
          <img src={myLogo} alt="회사 로고" className={styles['login-logo']} />
        </Link>
        <form onSubmit={handleSubmit}>
          <h2>로그인</h2>
          
          <div className={styles['input-group']}>
            <input
              type="text"
              placeholder="이메일을 입력해주세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          {/* 👇 수정 */}
          <div className={styles['input-group']}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* 👇 수정 */}
          <button type="submit" className={styles['login-btn']}>로그인</button>
        </form>

        {/* 👇 수정 */}
        <div className={styles['separator']}>
          <span>또는</span>
        </div>

        {/* 👇 수정 */}
        <div className={styles['social-login']}>
          {/* ... (기존 소셜 로그인 버튼 코드) */}
          
          {/* 👇 클래스가 2개 이상일 경우 템플릿 리터럴(``)을 사용합니다. */}
          <button type="button" className={`${styles['social-btn']} ${styles['google-btn']}`} onClick={() => handleSocialLogin('Google')}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            <span>Google로 로그인</span>
          </button>
          {/* 👇 클래스가 2개 이상일 경우 템플릿 리터럴(``)을 사용합니다. */}
          <button type="button" className={`${styles['social-btn']} ${styles['kakao-btn']}`} onClick={() => handleSocialLogin('Kakao')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c-5.523 0-10 3.582-10 8 0 2.923 1.933 5.515 4.783 6.946-.237 1.002-.756 3.21-.861 3.693-.117.544.113.88.513.88.227 0 .42-.08.59-.214 1.554-1.2 3.26-2.863 3.824-3.41.593.093 1.205.14 1.834.14 5.523 0 10-3.582 10-8s-4.477-8-10-8z" fill="#191919"/></svg>
            <span>카카오로 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;