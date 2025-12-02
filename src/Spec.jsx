import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './spec.css';

function Spec() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    selectedDuties: [],
    selectedSubDuty: null,
    selectedPosition: null,
    selectedCompanyType: null,
    selectedRegion: null,
    editingSpecId: null
  });

  const [specs, setSpecs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [careerYears, setCareerYears] = useState(0);
  const [careerMonths, setCareerMonths] = useState(0);
  const [showDetailBox, setShowDetailBox] = useState(false);
  const [showAdditionalBox, setShowAdditionalBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://192.168.225.44:8000';

  const data = {
    duties: ["개발", "데이터", "인공지능/머신러닝", "디자인", "QA/테스트"],
    subDuties: {
      "개발": ["FE", "BE", "APP"],
      "데이터": ["데이터 분석가", "데이터 엔지니어", "머신러닝 엔지니어"],
      "인공지능/머신러닝": ["머신러닝 엔지니어", "AI 연구원", "데이터 사이언티스트"],
      "디자인": ["UIUX", "BX", "그래픽 디자이너", "모션 디자이너"],
      "QA/테스트": ["QA", "테스트 엔지니어"]
    },
    positions: ["신입", "주임", "대리", "과장", "차장", "부장", "임원"],
    companyTypes: ["대기업", "중견기업", "중소기업", "외국계", "공기업", "벤처기업"],
    regions: [
      "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주",
      "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"
    ]
  };

  useEffect(() => {
    loadSpecs();
  }, []);

  const loadSpecs = () => {
    try {
      setLoading(true);
      const savedSpecs = localStorage.getItem('userSpecs');
      console.log('📦 Loaded specs from localStorage:', savedSpecs);
      
      if (savedSpecs) {
        const parsed = JSON.parse(savedSpecs);
        const specsArray = Array.isArray(parsed) ? parsed : [parsed];
        const withIds = specsArray.map((spec, idx) => ({
          ...spec,
          id: spec.id || `spec-${Date.now()}-${idx}`
        }));
        console.log('✅ Parsed specs:', withIds);
        setSpecs(withIds);
      } else {
        console.log('❌ No specs found in localStorage');
        setSpecs([]);
      }
    } catch (e) {
      console.error('⚠️ Error loading specs:', e);
      setSpecs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (item, category) => {
    setState(prevState => {
      const key = `selected${category}`;
      const selectedItems = prevState[key];

      if (category === 'Duties') {
        // 직무는 단일 선택 - 이미 선택된 항목을 다시 클릭하면 해제, 다른 항목 클릭하면 변경
        const isCurrentlySelected = selectedItems?.includes(item);
        const newSelected = isCurrentlySelected ? [] : [item];
        
        if (newSelected.length > 0) {
          return {
            ...prevState,
            selectedDuties: newSelected,
            selectedSubDuty: null,
            showDetailBox: true,
            showAdditionalBox: false
          };
        } else {
          return {
            ...prevState,
            selectedDuties: [],
            selectedSubDuty: null,
            showDetailBox: false,
            showAdditionalBox: false
          };
        }
      }

      return prevState;
    });
  };

  const selectSubDuty = (subDuty) => {
    setState(prevState => {
      if (prevState.selectedSubDuty === subDuty) {
        return {
          ...prevState,
          selectedSubDuty: null,
          showAdditionalBox: false
        };
      } else {
        return {
          ...prevState,
          selectedSubDuty: subDuty,
          showAdditionalBox: true
        };
      }
    });
  };

  const selectItem = (item, stateKey) => {
    setState(prevState => {
      const currentValue = prevState[stateKey];
      return {
        ...prevState,
        [stateKey]: currentValue === item ? null : item
      };
    });
  };

  const renderButtons = (category) => {
    const items = data[category];
    let selectedItems;
    
    // 카테고리별로 올바른 state 키 매핑
    if (category === 'duties') {
      selectedItems = state.selectedDuties;
    } else {
      const key = `selected${category.charAt(0).toUpperCase() + category.slice(1)}`;
      selectedItems = state[key];
    }

    if (!items) {
      return <div>No items found for {category}</div>;
    }

    return items.map((item, idx) => {
      const isSelected = selectedItems?.includes(item);

      return (
        <button
          key={idx}
          className={isSelected ? 'selected' : ''}
          onClick={() => toggleSelect(item, category === 'duties' ? 'Duties' : category.charAt(0).toUpperCase() + category.slice(1))}
        >
          {item}
        </button>
      );
    });
  };

  const renderSelectionButtons = (items, selectedItem, stateKey) => {
    return items.map((item, idx) => {
      const isSelected = selectedItem === item;
      
      return (
        <button
          key={idx}
          className={isSelected ? 'selected' : ''}
          onClick={() => selectItem(item, stateKey)}
        >
          {item}
        </button>
      );
    });
  };

  const handleSave = () => {
    // 필수 필드 검증
    if (!state.selectedDuties || state.selectedDuties.length === 0) {
      alert('직무를 선택해주세요.');
      return;
    }
    
    if (!state.selectedSubDuty) {
      alert('세부 직무를 선택해주세요.');
      return;
    }

    const years = parseInt(careerYears) || 0;
    const months = parseInt(careerMonths) || 0;

    let careerString = '';
    if (years === 0 && months === 0) {
      careerString = '경력 없음';
    } else if (years === 0) {
      careerString = `${months}개월`;
    } else if (months === 0) {
      careerString = `${years}년`;
    } else {
      careerString = `${years}년 ${months}개월`;
    }

    const newSpec = {
      id: state.editingSpecId || `spec-${Date.now()}`,
      duty: state.selectedDuties[0] || '',
      subDuty: state.selectedSubDuty || '',
      companyName: companyName.trim(),
      career: careerString,
      position: state.selectedPosition || '',
      companyType: state.selectedCompanyType || '',
      region: state.selectedRegion || '',
      savedAt: new Date().toISOString()
    };

    console.log('💾 Saving new spec:', newSpec);

    let specsArray = [];
    const savedSpecs = localStorage.getItem('userSpecs');
    if (savedSpecs) {
      try {
        const parsed = JSON.parse(savedSpecs);
        specsArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        specsArray = [];
      }
    }

    if (state.editingSpecId) {
      // 수정 모드
      const index = specsArray.findIndex(s => s.id === state.editingSpecId);
      if (index !== -1) {
        specsArray[index] = newSpec;
        console.log('🔄 Updated existing spec at index:', index);
      }
    } else {
      // 추가 모드
      specsArray.push(newSpec);
      console.log('✨ Added new spec');
    }

    localStorage.setItem('userSpecs', JSON.stringify(specsArray));
    console.log('📝 All specs saved to localStorage:', specsArray);
    
    // 폼 초기화
    setState({
      selectedDuties: [],
      selectedSubDuty: null,
      selectedPosition: null,
      selectedCompanyType: null,
      selectedRegion: null,
      showDetailBox: false,
      showAdditionalBox: false,
      editingSpecId: null
    });
    setCompanyName('');
    setCareerYears('');
    setCareerMonths('');
    
    // 스펙 목록 다시 로드
    loadSpecs();
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/profile');
  };

  const handleEditSpec = (specId) => {
    const spec = specs.find(s => s.id === specId);
    if (spec) {
      console.log('🔧 Editing spec:', spec);
      
      const duty = spec.duty || '';
      const subDuty = spec.subDuty || '';
      
      setState({
        selectedDuties: duty ? [duty] : [],
        selectedSubDuty: subDuty || null,
        selectedPosition: spec.position || null,
        selectedCompanyType: spec.companyType || null,
        selectedRegion: spec.region || null,
        showDetailBox: !!duty,
        showAdditionalBox: !!subDuty,
        editingSpecId: specId
      });
      
      setCompanyName(spec.companyName || '');
      
      // career 필드에서 년도와 월 추출
      let years = 0;
      let months = 0;
      
      const yearMatch = spec.career?.match(/(\d+)년/);
      const monthMatch = spec.career?.match(/(\d+)개월/);
      
      if (yearMatch) {
        years = parseInt(yearMatch[1]);
      }
      if (monthMatch) {
        months = parseInt(monthMatch[1]);
      }
      
      setCareerYears(years.toString());
      setCareerMonths(months.toString());
      
      // 페이지 상단(직무 선택 영역)으로 스크롤
      setTimeout(() => {
        const dutySection = document.querySelector('.spec-container section');
        if (dutySection) {
          dutySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleDeleteSpec = (specId) => {
    if (window.confirm('이 스펙을 삭제하시겠습니까?')) {
      let specsArray = [];
      const savedSpecs = localStorage.getItem('userSpecs');
      if (savedSpecs) {
        try {
          const parsed = JSON.parse(savedSpecs);
          specsArray = Array.isArray(parsed) ? parsed : [parsed];
          specsArray = specsArray.filter(s => s.id !== specId);
          localStorage.setItem('userSpecs', JSON.stringify(specsArray));
          console.log('🗑️ Spec deleted:', specId);
          loadSpecs();
        } catch (e) {
          console.error('Error deleting spec:', e);
        }
      }
    }
  };

  const handleToggleSpec = (contentId) => {
    const content = document.getElementById(contentId);
    if (content) {
      content.classList.toggle('collapsed');
      const header = content.previousElementSibling;
      if (header) {
        const icon = header.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = content.classList.contains('collapsed') ? '▼' : '▲';
        }
      }
    }
  };

  return (
    <div className="spec-container">
      <h2>보유 스펙 수정</h2>

      <div id="currentSpecSummary" className="current-spec-summary">
        <h3>현재 등록된 스펙</h3>
        <div id="currentSpecsContainer">
          {loading ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>로딩 중...</p>
          ) : specs.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>등록된 스펙이 없습니다.</p>
          ) : (
            specs.map(spec => (
              <div key={spec.id} className="spec-preview-box">
                <div className="spec-preview-header" onClick={() => handleToggleSpec(`spec-${spec.id}`)}>
                  <div className="spec-preview-info">
                    <span className="preview-company">{spec.companyName || '회사명 없음'}</span>
                    <span className="preview-career">
                      {spec.career || '경력 없음'}
                    </span>
                    {spec.savedAt && (
                      <span className="preview-modified">
                        {new Date(spec.savedAt).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                  <span className="toggle-icon">▼</span>
                </div>
                <div id={`spec-${spec.id}`} className="current-spec-content collapsed">
                  <div className="spec-section">
                    {spec.duty && (
                      <div className="spec-item">
                        <strong>직무:</strong> {spec.duty}
                      </div>
                    )}
                    {spec.subDuty && (
                      <div className="spec-item">
                        <strong>세부직무:</strong> {spec.subDuty}
                      </div>
                    )}
                    {spec.position && (
                      <div className="spec-item">
                        <strong>직급:</strong> {spec.position}
                      </div>
                    )}
                    {spec.career && (
                      <div className="spec-item">
                        <strong>경력:</strong> {spec.career}
                      </div>
                    )}
                    {spec.companyType && (
                      <div className="spec-item">
                        <strong>기업형태:</strong> {spec.companyType}
                      </div>
                    )}
                    {spec.region && (
                      <div className="spec-item">
                        <strong>지역:</strong> {spec.region}
                      </div>
                    )}
                    {spec.companyName && (
                      <div className="spec-item">
                        <strong>회사명:</strong> {spec.companyName}
                      </div>
                    )}
                  </div>
                  <div className="spec-actions">
                    <button className="edit-spec-btn" onClick={() => handleEditSpec(spec.id)}>
                      수정
                    </button>
                    <button className="delete-spec-btn" onClick={() => handleDeleteSpec(spec.id)}>
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="company-input-row">
        <label htmlFor="companyNameInput">회사명</label>
        <input
          type="text"
          id="companyNameInput"
          placeholder="회사명을 입력하세요"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>

      <section>
        <h3>직무</h3>
        <div className="grid" id="duties-grid">
          {renderButtons('duties')}
        </div>
      </section>

      {state.showDetailBox && (
        <section className="detail-box">
          <h3>세부 직무</h3>
          <div className="grid" id="sub-duties-grid">
            {state.selectedDuties[0] && data.subDuties[state.selectedDuties[0]]?.map((subDuty, idx) => (
              <button
                key={idx}
                className={state.selectedSubDuty === subDuty ? 'selected' : ''}
                onClick={() => selectSubDuty(subDuty)}
              >
                {subDuty}
              </button>
            ))}
          </div>
        </section>
      )}

      {state.showAdditionalBox && (
        <div className="additional-box">
          <section>
            <h3>경력</h3>
            <div className="career-input-group">
              <div className="input-row">
                <input
                  type="number"
                  id="careerYears"
                  min="0"
                  max="50"
                  placeholder="0"
                  value={careerYears}
                  onChange={(e) => setCareerYears(e.target.value)}
                />
                <span className="suffix">년</span>
              </div>
              <div className="input-row">
                <input
                  type="number"
                  id="careerMonths"
                  min="0"
                  max="11"
                  placeholder="0"
                  value={careerMonths}
                  onChange={(e) => setCareerMonths(e.target.value)}
                />
                <span className="suffix">개월</span>
              </div>
            </div>
          </section>

          <section>
            <h3>직급/직책</h3>
            <div className="grid" id="positions-grid">
              {renderSelectionButtons(data.positions, state.selectedPosition, 'selectedPosition')}
            </div>
          </section>

          <section>
            <h3>기업형태</h3>
            <div className="grid" id="company-types-grid">
              {renderSelectionButtons(data.companyTypes, state.selectedCompanyType, 'selectedCompanyType')}
            </div>
          </section>

          <section>
            <h3>근무지역</h3>
            <div className="grid" id="regions-grid">
              {renderSelectionButtons(data.regions, state.selectedRegion, 'selectedRegion')}
            </div>
          </section>
        </div>
      )}

      <div className="save-box">
        <button 
          className="save-btn" 
          id="save-button" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '저장 중...' : '정보 저장하기'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
          {error}
        </div>
      )}

      {showModal && (
        <div id="saveModal" className="modal" aria-hidden="false">
          <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <p id="modalTitle">정보가 저장되었습니다</p>
            <button id="modalOk" className="save-btn" onClick={handleModalClose}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Spec;
