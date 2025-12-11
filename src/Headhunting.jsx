import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './headhunting.css';

function Headhunting() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    selectedRanks: [],
    selectedCareers: [],
    selectedJobs: [],
    selectedCompanies: [],
    selectedRegions: [],
    searchKeyword: '',
    currentPage: 1,
    itemsPerPage: 9
  });

  const [specs, setSpecs] = useState([]);
  const [expandedSpecs, setExpandedSpecs] = useState({});
  const [selectedMainJob, setSelectedMainJob] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '이가윤' });

  // 🔌 API 베이스 URL (필요하면 192.168 버전으로 다시 바꿔도 됨)
  const API_BASE_URL = 'http://127.0.0.1:8000';

  // 🔹 API에서 불러온 전체 공고 리스트
  const [jobPostings, setJobPostings] = useState([]);
  const [visibleCards, setVisibleCards] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobError, setJobError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();

    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        setUserInfo({ name: parsed.name || '이가윤' });
      } catch (e) {
        console.error('사용자 정보 로드 오류:', e);
      }
    }

    window.addEventListener('loginStatusChanged', checkLoginStatus);
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const data = {
    ranks: ["사원", "주임", "대리", "과장", "차장", "부장", "임원"],
    duties: ["개발", "데이터", "인프라/플랫폼/Devops", "기획", "디자인", "QA/테스트"],
    subDuties: {
      "개발": ["FE", "BE", "APP"],
      "데이터": ["데이터 분석가", "데이터 엔지니어", "머신러닝 엔지니어"],
      "인프라/플랫폼/Devops": ["Devops", "클라우드", "보안"],
      "기획": ["서비스 기획", "PO", "PM"],
      "디자인": ["UIUX", "BX", "그래픽 디자이너", "모션 디자이너"],
      "QA/테스트": ["QA", "테스트 엔지니어"]
    },
    careers: ["1년~3년", "3년~5년", "5년~7년", "7년~10년", "10년~15년", "15년~"],
    companies: ["대기업", "중견기업", "중소기업", "외국계", "공기업", "벤처기업"],
    regions: [
      "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주",
      "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"
    ]
  };

  // 레거시 매핑 (지금은 안 쓰고 있어도 남겨둠)
  const legacySubToDuty = {
    "FE (프론트엔드)": "개발", "FE": "개발", "BE (백엔드)": "개발", "BE": "개발", "App (모바일 앱 개발)": "개발", "APP": "개발",
    "Data Engineer/Data Scientist": "데이터", "데이터 엔지니어": "데이터", "머신러닝 엔지니어": "데이터", "데이터 분석가": "데이터",
    "DevOps (시스템 운영/배포 엔지니어)": "인프라/플랫폼/Devops", "Devops": "인프라/플랫폼/Devops", "클라우드": "인프라/플랫폼/Devops", "보안": "인프라/플랫폼/Devops",
    "서비스 기획": "기획", "PO (프로덕트 오너)": "기획", "PO": "기획", "PM (프로젝트/프로덕트 매니저)": "기획", "PM": "기획",
    "UI/UX": "디자인", "UIUX": "디자인", "BX (브랜드 경험 디자이너)": "디자인", "BX": "디자인", "그래픽 디자이너": "디자인", "모션 디자이너": "디자인",
    "QA 테스트 엔지니어": "QA/테스트", "QA": "QA/테스트", "테스트 엔지니어": "QA/테스트"
  };

  // ==== 🔹 Saramin / Boss 크롤링 결과용 필터 헬퍼들 ====

  const extractYears = (job) => {
    const match = job.info.match(/경력:\s*(\d+)년/);
    return match ? parseInt(match[1], 10) : null;
  };

  const extractRegion = (job) => {
    const match = job.info.match(/지역:\s*([^|]+)/);
    return match ? match[1].trim() : '';
  };

  const mainDutyKeywords = {
    '개발': ['개발', '프론트엔드', '백엔드', '풀스택', 'FE', 'BE', 'App', '모바일'],
    '데이터': ['데이터', '머신러닝', '분석'],
    '인프라/플랫폼/Devops': ['인프라', '클라우드', 'Devops', '보안', '미들웨어'],
    '기획': ['기획', 'PM', 'PO'],
    '디자인': ['디자이너', 'UI/UX', 'UIUX', 'BX', '그래픽', '모션'],
    'QA/테스트': ['QA', '테스트']
  };

  const matchesMainDuty = (job, mainDuty) => {
    if (!mainDuty) return true;
    const keywords = mainDutyKeywords[mainDuty] || [];
    const text = (job.title + ' ' + job.info);
    return keywords.some(kw => text.includes(kw));
  };

  const matchesSubDuty = (job, subDuty) => {
    if (!subDuty) return true;
    const text = (job.title + ' ' + job.info);
    return text.includes(subDuty);
  };

  const matchesCareerRange = (job, selectedRange) => {
    if (!selectedRange) return true;
    const years = extractYears(job);
    if (years === null) return true;
    const rangeMap = {
      '1년~3년': [1, 3],
      '3년~5년': [3, 5],
      '5년~7년': [5, 7],
      '7년~10년': [7, 10],
      '10년~15년': [10, 15],
      '15년~': [15, Infinity]
    };
    const [minY, maxY] = rangeMap[selectedRange] || [0, Infinity];
    return years >= minY && years < maxY;
  };

  const matchesRegion = (job, selectedRegions) => {
    if (selectedRegions.length === 0) return true;
    const region = extractRegion(job);
    return selectedRegions.some(r => region.includes(r) || job.title.includes(r));
  };

  const matchesRank = (job, selectedRanks) => {
    if (selectedRanks.length === 0) return true;
    const text = (job.title + ' ' + job.info);
    return selectedRanks.some(r => text.includes(r));
  };

  const matchesCompanyType = (job, selectedCompanies) => {
    if (selectedCompanies.length === 0) return true;
    const text = (job.title + ' ' + job.info);
    return selectedCompanies.some(c => text.includes(c));
  };

  // ==== 🔹 보유 스펙 불러오기 (localStorage) ====

  useEffect(() => {
    const loadSpecs = () => {
      try {
        const savedSpecs = localStorage.getItem('userSpecs');
        console.log('📦 [Headhunting] Loaded specs from localStorage:', savedSpecs);

        if (savedSpecs) {
          const parsed = JSON.parse(savedSpecs);
          const specsArray = Array.isArray(parsed) ? parsed : [parsed];
          const withIds = specsArray.map((spec, idx) => ({
            ...spec,
            id: spec.id || `spec-${Date.now()}-${idx}`
          }));
          console.log('✅ [Headhunting] Parsed specs:', withIds);
          setSpecs(withIds);
        } else {
          console.log('❌ [Headhunting] No specs found in localStorage');
          setSpecs([]);
        }
      } catch (e) {
        console.error('⚠️ [Headhunting] Error loading specs:', e);
        setSpecs([]);
      }
    };

    loadSpecs();

    const handleStorageChange = () => {
      loadSpecs();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pageshow', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pageshow', handleStorageChange);
    };
  }, []);

  // ==== 🔹 Django API에서 채용 데이터 가져오기 ====

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true);
        setJobError(null);

        // TODO: 나중에 실제 로그인ID로 바꾸기
        const username = 'Boss';

        const res = await fetch(`${API_BASE_URL}/api/jobs/${username}/`);
        if (!res.ok) {
          throw new Error(`채용 데이터를 불러올 수 없습니다. (status ${res.status})`);
        }

        const raw = await res.json();

        // 백엔드 JSON → 프론트에서 쓰기 좋은 형태로 변환
        const normalized = (raw || []).map((item, idx) => {
          const company = item.company || '';
          const experience = item.experience || '';
          const location = item.location || '';
          const deadline = item.deadline || '';

          return {
            id: `${username}-${idx}`,
            title: item.title || '',
            info: `회사: ${company || '-'} | 경력: ${experience || '-'} | 지역: ${location || '-'} | 마감일: ${deadline || '-'}`,
            company,
            experience,
            location,
            deadline,
            link: item.link || '',
            source: item.source || ''
          };
        });

        setJobPostings(normalized);
        setTotalCount(normalized.length);
        setVisibleCards(normalized.slice(0, state.itemsPerPage));
      } catch (err) {
        console.error('[Headhunting] 채용 데이터 로드 오류:', err);
        setJobError(err.message || '채용 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 호출

  // ==== 🔹 카테고리 버튼/선택 처리 ====

  const getMaxSelection = (category) => {
    const maxSelections = {
      ranks: 1,
      careers: 1,
      jobs: 1,
      companies: 2,
      regions: 2
    };
    return maxSelections[category];
  };

  const toggleSelect = (category, value) => {
    setState(prevState => {
      const key = `selected${category.charAt(0).toUpperCase() + category.slice(1)}`;
      const current = prevState[key];
      const max = getMaxSelection(category);

      let next;
      if (Array.isArray(current)) {
        if (current.includes(value)) {
          next = current.filter(v => v !== value);
        } else {
          if (current.length >= max) return prevState;
          next = [...current, value];
        }
      } else {
        next = current === value ? [] : [value];
      }

      return {
        ...prevState,
        [key]: next,
        currentPage: 1
      };
    });
  };

  const renderButtons = (category) => {
    const items = data[category];
    if (!items) return null;
    const key = `selected${category.charAt(0).toUpperCase() + category.slice(1)}`;
    const selected = state[key] || [];
    const max = getMaxSelection(category);

    return items.map(item => {
      const isSelected = Array.isArray(selected) ? selected.includes(item) : selected === item;
      const atMax = Array.isArray(selected) ? selected.length >= max : !!selected.length;
      const disabled = !isSelected && atMax && max === 1;
      return (
        <button
          key={item}
          className={`${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          disabled={disabled}
          onClick={() => toggleSelect(category, item)}
        >{item}</button>
      );
    });
  };

  // ==== 🔹 필터 로직 (검색어 / 조건 / 페이지네이션) ====

  useEffect(() => {
    // API 데이터가 아직 없으면 아무 것도 안 함
    if (!jobPostings || jobPostings.length === 0) {
      setVisibleCards([]);
      setTotalCount(0);
      return;
    }

    const keyword = state.searchKeyword.toLowerCase();
    const selectedRange = state.selectedCareers[0];
    const selectedSubDuty = state.selectedJobs[0];

    let filtered = jobPostings.filter(job => {
      const lowerText = (job.title + ' ' + job.info).toLowerCase();
      if (keyword && !lowerText.includes(keyword)) return false;
      if (!matchesMainDuty(job, selectedMainJob)) return false;
      if (!matchesSubDuty(job, selectedSubDuty)) return false;
      if (!matchesCareerRange(job, selectedRange)) return false;
      if (!matchesRegion(job, state.selectedRegions)) return false;
      if (!matchesRank(job, state.selectedRanks)) return false;
      if (!matchesCompanyType(job, state.selectedCompanies)) return false;
      return true;
    });

    setTotalCount(filtered.length);
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    setVisibleCards(filtered.slice(startIdx, endIdx));
  }, [
    state.searchKeyword,
    state.selectedRanks,
    state.selectedCareers,
    state.selectedJobs,
    state.selectedCompanies,
    state.selectedRegions,
    state.currentPage,
    selectedMainJob,
    jobPostings
  ]);

  const handleSearch = () => {
    const input = document.getElementById('search-input');
    if (!input.value.trim()) {
      alert('검색어를 작성해주세요.');
      return;
    }
    setState(prev => ({ ...prev, searchKeyword: input.value.trim(), currentPage: 1 }));
  };

  const handleReset = () => {
    const input = document.getElementById('search-input');
    input.value = '';
    setState(prev => ({
      ...prev,
      searchKeyword: '',
      selectedRanks: [],
      selectedCareers: [],
      selectedJobs: [],
      selectedCompanies: [],
      selectedRegions: [],
      currentPage: 1
    }));
  };

  const toggleSpecExpand = (specId) => {
    setExpandedSpecs(prev => ({
      ...prev,
      [specId]: !prev[specId]
    }));
  };

  const handleSelectSpec = (spec) => {
    const newState = { ...state };

    if (spec.position && data.ranks.includes(spec.position)) {
      newState.selectedRanks = [spec.position];
    }

    if (spec.duty && data.duties.includes(spec.duty)) {
      setSelectedMainJob(spec.duty);
      if (spec.subDuty && data.subDuties[spec.duty]?.includes(spec.subDuty)) {
        newState.selectedJobs = [spec.subDuty];
      } else {
        newState.selectedJobs = [];
      }
    }

    if (spec.companyType && data.companies.includes(spec.companyType)) {
      newState.selectedCompanies = [spec.companyType];
    }

    if (spec.region && data.regions.includes(spec.region)) {
      newState.selectedRegions = [spec.region];
    }

    if (spec.career && spec.career !== '경력 없음') {
      const yearMatch = spec.career.match(/(\d+)년/);
      const monthMatch = spec.career.match(/(\d+)개월/);
      const years = yearMatch ? parseInt(yearMatch[1], 10) : 0;
      const months = monthMatch ? parseInt(monthMatch[1], 10) : 0;
      const totalMonths = years * 12 + months;
      let range = null;
      if (totalMonths >= 12 && totalMonths < 36) range = '1년~3년';
      else if (totalMonths >= 36 && totalMonths < 60) range = '3년~5년';
      else if (totalMonths >= 60 && totalMonths < 84) range = '5년~7년';
      else if (totalMonths >= 84 && totalMonths < 120) range = '7년~10년';
      else if (totalMonths >= 120 && totalMonths < 180) range = '10년~15년';
      else if (totalMonths >= 180) range = '15년~';
      newState.selectedCareers = range ? [range] : [];
    } else {
      newState.selectedCareers = [];
    }

    setState(newState);
    alert('해당 스펙의 조건이 자동 선택되었습니다.');
  };

  const handleEditSpec = () => {
    window.location.href = '/spec';
  };

  return (
    <main className="headhunt-layout">
      <aside className="headhunt-sidebar">
        {isLoggedIn ? (
          <div className="headhunt-profile-box logged">
            <div className="headhunt-profile-content">
              <img
                className="headhunt-profile-img"
                src="https://www.gravatar.com/avatar/?d=mp&s=100"
                alt="프로필 이미지"
              />
              <div className="headhunt-profile-info">
                <h3 className="headhunt-profile-name">{userInfo.name}님</h3>
                <Link to="/profile" className="headhunt-profile-edit">
                  <span>⚙️</span>
                  <span>회원정보 수정</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="headhunt-profile-box">
            <div className="headhunt-profile-content" onClick={() => navigate('/login')}>
              <img
                className="headhunt-user-icon"
                src={`${process.env.PUBLIC_URL}/user.png`}
                alt="사용자 아이콘"
              />
              <p className="headhunt-profile-text">로그인이 필요합니다.</p>
            </div>
            <div className="headhunt-profile-footer">
              <a href="#find-id" className="headhunt-footer-link">아이디 찾기</a>
              <div className="headhunt-divider"></div>
              <a href="#find-pw" className="headhunt-footer-link">비밀번호 찾기</a>
            </div>
          </div>
        )}

        <div className="sidebar-box">
          <div className="sidebar-header">
            <strong>스크랩한 공고</strong>
            <span>0건</span>
          </div>
          <div className="sidebar-content">스크랩한 공고가 없습니다.</div>
        </div>

        <div className="sidebar-box">
          <div className="sidebar-header">
            <strong>최근 본 공고</strong>
            <span>0건</span>
          </div>
          <div className="sidebar-content">최근 본 공고가 없습니다.</div>
        </div>
      </aside>

      <div className="headhunt-content">
        <h2>헤드헌팅 채용 정보</h2>

        {/* 보유 스펙 박스 */}
        <div className="spec-summary-section">
          <h3>보유 스펙</h3>
          <div id="specBoxesContainer">
            {specs.length === 0 ? (
              <p style={{ color: '#666', fontSize: '0.95rem' }}>저장된 스펙이 없습니다.</p>
            ) : (
              <div className="spec-boxes">
                {specs.map((spec, index) => {
                  const isExpanded = expandedSpecs[spec.id];
                  return (
                    <div key={spec.id || index} className="spec-box-collapsible">
                      <div
                        className="spec-box-header-clickable"
                        onClick={() => toggleSpecExpand(spec.id)}
                      >
                        <div className="spec-box-title">
                          <strong>{spec.companyName || '회사명 없음'}</strong>
                          {!isExpanded && (
                            <span className="spec-box-company-preview">
                              {spec.duty && ` - ${spec.duty}`}
                              {spec.subDuty && ` > ${spec.subDuty}`}
                            </span>
                          )}
                        </div>
                        <span className="toggle-icon">{isExpanded ? '▲' : '▼'}</span>
                      </div>

                      {isExpanded && (
                        <div className="spec-box-content">
                          <div className="spec-box-details-grid">
                            <div className="spec-detail-row">
                              <span className="spec-label">직무:</span>
                              <span className="spec-value">{spec.duty || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">세부직무:</span>
                              <span className="spec-value">{spec.subDuty || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">회사명:</span>
                              <span className="spec-value">{spec.companyName || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">경력:</span>
                              <span className="spec-value">{spec.career || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">직급:</span>
                              <span className="spec-value">{spec.position || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">기업형태:</span>
                              <span className="spec-value">{spec.companyType || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">근무지역:</span>
                              <span className="spec-value">{spec.region || '-'}</span>
                            </div>
                          </div>

                          <div className="spec-box-actions">
                            <button className="spec-edit-btn" onClick={handleEditSpec}>
                              수정
                            </button>
                            <button className="spec-select-btn" onClick={() => handleSelectSpec(spec)}>
                              선택
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 필터 섹션 */}
        <section className="filter-section isolated">
          <h3 className="filter-section-title">원하는 직무 선택</h3>

          <div className="filter-group">
            <label>직무 (대분류)</label>
            <div className="grid">
              {data.duties.map(duty => {
                const isSelected = selectedMainJob === duty;
                return (
                  <button
                    key={duty}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => {
                      setSelectedMainJob(duty === selectedMainJob ? null : duty);
                      setState(prev => ({ ...prev, selectedJobs: [], currentPage: 1 }));
                    }}
                  >{duty}</button>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <label>직급 ({state.selectedRanks.length}/1)</label>
            <div className="grid">{renderButtons('ranks')}</div>
          </div>

          <div className="filter-group">
            <label>세부 직무</label>
            <div className="grid" id="headhunt-sub-duty-grid">
              {selectedMainJob ? (
                data.subDuties[selectedMainJob].map(sub => {
                  const isSelected = state.selectedJobs.includes(sub);
                  return (
                    <button
                      key={sub}
                      className={isSelected ? 'selected' : ''}
                      disabled={isSelected ? false : state.selectedJobs.length >= 1}
                      onClick={() => toggleSelect('jobs', sub)}
                    >{sub}</button>
                  );
                })
              ) : (
                <p style={{ color: '#9ca3af', fontSize: '0.95rem', padding: '12px' }}>
                  대분류 직무를 선택하면 세부 직무를 선택할 수 있습니다.
                </p>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label>경력 ({state.selectedCareers.length}/1)</label>
            <div className="grid">{renderButtons('careers')}</div>
          </div>

          <div className="filter-group">
            <label>기업형태 ({state.selectedCompanies.length}/2)</label>
            <div className="grid">{renderButtons('companies')}</div>
          </div>

          <div className="filter-group">
            <label>근무지역 ({state.selectedRegions.length}/2)</label>
            <div className="grid">{renderButtons('regions')}</div>
          </div>

          <section className="selected">
            <label>선택된 조건</label>
            <div className="selected-chips">
              {[...state.selectedRanks, ...state.selectedCareers, ...state.selectedJobs, ...state.selectedCompanies, ...state.selectedRegions].map(chip => (
                <span key={chip} className="chip">{chip}</span>
              ))}
            </div>
            {(state.selectedRanks.length + state.selectedCareers.length + state.selectedJobs.length + state.selectedCompanies.length + state.selectedRegions.length) === 0 && (
              <p className="selected-placeholder">현재 선택된 조건이 없습니다.</p>
            )}
          </section>
        </section>

        {/* 검색어 입력 */}
        <div className="filter-group search-group">
          <label>검색어</label>
          <input type="text" id="search-input" placeholder="채용직무, 기업명, 키워드 등을 입력하세요." />
          <button className="search-btn" onClick={handleSearch}>검색</button>
          <button className="reset-btn" onClick={handleReset}>초기화</button>
        </div>

        {/* 채용 리스트 */}
        <section className="job-list">
          <h3 id="total-count">
            {isLoadingJobs ? '로딩 중...' : jobError ? '채용 정보 로드 실패' : `총 ${totalCount}건`}
          </h3>

          {jobError && (
            <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '8px' }}>
              {jobError}
            </p>
          )}

          {!isLoadingJobs && !jobError && visibleCards.map((job, idx) => (
            <div key={job.id || idx} className="job-card">
              <div className="job-info">
                <h4>{job.title}</h4>
                <p>{job.info}</p>
                {job.company && (
                  <p className="job-meta">
                    <span>{job.company}</span>
                    {job.source && <span className="job-source">({job.source})</span>}
                  </p>
                )}
              </div>
              {job.link ? (
                <a
                  className="apply-btn"
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  지원 공고 확인
                </a>
              ) : (
                <button className="apply-btn disabled" disabled>링크 없음</button>
              )}
            </div>
          ))}

          {/* 페이지네이션 */}
          <div className="pagination" style={{ display: totalCount > 0 ? 'flex' : 'none' }}>
            <button
              className="pagination-prev"
              disabled={state.currentPage <= 1}
              onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              {'<'}
            </button>
            {[1, 2, 3, 4, 5].map(page => (
              <button
                key={page}
                className={`pagination-num ${page === state.currentPage ? 'active' : ''}`}
                onClick={() => setState(prev => ({ ...prev, currentPage: page }))}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-next"
              disabled={state.currentPage >= 5}
              onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              {'>'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Headhunting;
