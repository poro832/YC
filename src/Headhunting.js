import React, { useState } from 'react';
import './Headhunting.css';

function Headhunting() {
  const [selectedFilters, setSelectedFilters] = useState({
    ranks: [],
    careers: [],
    jobs: [],
    companies: [],
    regions: []
  });
  const [searchKeyword, setSearchKeyword] = useState('');

  const data = {
    ranks: ["과장·차장급", "부장급", "팀장/매니저/실장", "파트장/그룹장", "임원/CEO", "주임·대리급", "본부장/센터장"],
    careers: ["1년~3년", "3년~5년", "5년~7년", "7년~10년", "10년~15년", "15년~"],
    jobs: [
      "개발자", "FE (프론트엔드)", "BE (백엔드)", "App (모바일 앱 개발)", "Data Engineer/Data Scientist", "",
      "DevOps (시스템 운영/배포 엔지니어)", "",
      "PM/PO/기획자", "서비스 기획", "PO (프로덕트 오너)", "PM (프로젝트/프로덕트 매니저)", "",
      "UI/UX", "BX (브랜드 경험 디자이너)", "그래픽 디자이너", "모션 디자이너", "",
      "데이터 분석가", "데이터 엔지니어", "머신러닝 엔지니어", "",
      "인프라/클라우드", "클라우드", "보안", "",
      "QA/테스터", "QA 테스트 엔지니어", "",
      "마케터", "콘텐츠", "브랜드", "성장 마케터", "",
      "경영/운영", "사업전략", "운영 매니저", "",
      "HR/리크루터", "HR 매니저", "리크루터"
    ],
    companies: ["대기업", "중견기업", "중소기업", "외국계", "공기업", "벤처기업"],
    regions: ["전국", "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주", "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"]
  };

  const maxSelections = {
    ranks: 3,
    careers: 1,
    jobs: 5,
    companies: 2,
    regions: 2
  };

  const jobData = [
    { title: "보령 [경기] IT 디지털 기획 과장, 차장급 구함 (국가사업)", job: "IT 기획", exp: "8년 이상", location: "경기", date: "10/27" },
    { title: "[파견/2개월/강남] 대기업 솔루션 업체 프론트엔드 개발자 고급 모집", job: "프론트엔드 개발", exp: "7년 이상", location: "서울", date: "10/20" },
    { title: "[파견/2개월/서대문] 공공기관 java 풀스택 개발자 중급 모집", job: "백엔드 개발", exp: "5년 이상", location: "서울", date: "09/30" },
    { title: "[파견/2개월/서대문] 공공기관 java 풀스택 개발자 중급 모집", job: "백엔드 개발", exp: "5년 이상", location: "서울", date: "09/30" },
    { title: "유한양행 [인천] IT 시스템 운영, 관리 담당자 모집", job: "IT 운영", exp: "8년 이상", location: "인천", date: "09/15" },
    { title: "보험 대기업 인프라 운영, 관리(미들웨어) 대리급 구함 (굿커리어)", job: "데이터 관리", exp: "3년 이상", location: "서울", date: "08/26" },
    { title: "클라우드 실행 본부 PM (10년 이상)", job: "클라우드 관리", exp: "10년 이상", location: "서울", date: "08/18" },
    { title: "유명 리걸테크기업 백엔드 개발팀장(차/부장급)", job: "백엔드 개발", exp: "8년 이상", location: "서울", date: "07/29" },
    { title: "[긴급] IT 정보보호 담당 (8~15년)", job: "정보보안", exp: "8년 이상", location: "서울", date: "07/29" }
  ];

  const toggleSelection = (category, item) => {
    const currentSelections = selectedFilters[category];
    const maxSelect = maxSelections[category];

    if (currentSelections.includes(item)) {
      // 선택 해제
      setSelectedFilters({
        ...selectedFilters,
        [category]: currentSelections.filter(i => i !== item)
      });
    } else {
      // 선택 추가 (최대값 체크)
      if (currentSelections.length < maxSelect) {
        setSelectedFilters({
          ...selectedFilters,
          [category]: [...currentSelections, item]
        });
      }
    }
  };

  const renderButtons = (category, items) => {
    return items.map((item, idx) => {
      if (item === "") {
        return <button key={idx} className="separator"></button>;
      }

      const isSelected = selectedFilters[category].includes(item);
      const isDisabled = !isSelected && selectedFilters[category].length >= maxSelections[category];

      return (
        <button
          key={idx}
          className={`filter-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={() => toggleSelection(category, item)}
          disabled={isDisabled}
        >
          {item}
        </button>
      );
    });
  };

  return (
    <div className="headhunt-container">
      <h2>헤드헌팅 채용 정보</h2>

      <section className="filter-section">
        <div className="filter-group">
          <label>직급 / 직책 ({selectedFilters.ranks.length}/{maxSelections.ranks})</label>
          <div className="grid">
            {renderButtons('ranks', data.ranks)}
          </div>
        </div>

        <div className="filter-group">
          <label>경력 ({selectedFilters.careers.length}/{maxSelections.careers})</label>
          <div className="grid">
            {renderButtons('careers', data.careers)}
          </div>
        </div>

        <div className="filter-group">
          <label>직무 ({selectedFilters.jobs.length}/{maxSelections.jobs})</label>
          <div className="grid">
            {renderButtons('jobs', data.jobs)}
          </div>
        </div>

        <div className="filter-group">
          <label>기업형태 ({selectedFilters.companies.length}/{maxSelections.companies})</label>
          <div className="grid">
            {renderButtons('companies', data.companies)}
          </div>
        </div>

        <div className="filter-group">
          <label>근무지역 ({selectedFilters.regions.length}/{maxSelections.regions})</label>
          <div className="grid">
            {renderButtons('regions', data.regions)}
          </div>
        </div>

        <div className="filter-group">
          <label>검색어</label>
          <input type="text" placeholder="채용직무, 기업명, 키워드 등을 입력하세요." />
          <button className="search-btn">검색</button>
        </div>
      </section>

      <section className="selected">
        <label>선택된 조건</label>
        <p>
          {Object.values(selectedFilters).flat().length === 0 
            ? "현재 선택된 조건이 없습니다." 
            : Object.values(selectedFilters).flat().join(', ')}
        </p>
      </section>

      <section className="job-list">
        <h3>총 6,402건</h3>
        
        {jobData.map((job, idx) => (
          <div key={idx} className="job-card">
            <div className="job-info">
              <h4>{job.title}</h4>
              <p>직무: {job.job} | 경력: {job.exp} | 지역: {job.location} | 등록일: {job.date}</p>
            </div>
            <button className="apply-btn">지원 공고 확인</button>
          </div>
        ))}

        <div className="pagination">
          <button>&lt;</button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <button>5</button>
          <button>&gt;</button>
        </div>
      </section>
    </div>
  );
}

export default Headhunting;