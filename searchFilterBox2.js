// 전체에서 항상 검색 (최종 로직 반영)
const itemsPerPage = 14; // 페이지당 표시할 아이템 수
let fullDataSet = []; // 전체 JSON 데이터를 저장할 변수
let currentFilteredData = []; // 현재 필터와 텍스트 검색이 적용된 최종 데이터
let currentPage = 1; // 현재 페이지 번호
let currentFilter = 'all'; // 현재 버튼 필터

// ✅ JSON 파일 로드 함수
function loadJSON(callback) {
  const xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', '1.json', true); // JSON 파일 경로
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

// ✅ 데이터 로드 및 초기화
loadJSON(function(response) {
  fullDataSet = JSON.parse(response);

  // 초기 로드 시 'all' 필터 적용 및 초기 페이지 렌더링
  const allButton = document.querySelector('.btn.all');
  if (allButton) {
    allButton.click();
  } else {
    filterSelection('all'); 
  }

  // ✅ 엔터 키 검색 기능 추가
  const searchInput = document.getElementById('textSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        // 엔터 입력 시, 텍스트 검색 실행
        filterSelection(currentFilter, true); 
        event.preventDefault();
      }
    });
  }
});

/**
 * ✅ 텍스트 검색 및 카테고리 필터링 처리 (textSearchAndFilter)
 *
 * @param {string} category - 필터링할 카테고리 ('all'일 경우 무시)
 * @param {string} searchTerm - 검색할 텍스트 (' '일 경우 무시)
 */
function textSearchAndFilter(category, searchTerm) {
  let dataToFilter = fullDataSet;

  // 1️⃣ 버튼 카테고리 필터 적용 (category가 'all'이 아닌 경우에만 적용)
  if (category !== 'all') {
    dataToFilter = dataToFilter.filter(item => {
      const categories = item.category.split(',').map(c => c.trim());
      return categories.includes(category);
    });
  }

  // 2️⃣ 텍스트 검색 필터 적용 (검색어가 있는 경우에만 적용)
  if (searchTerm && searchTerm.trim() !== '') {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    dataToFilter = dataToFilter.filter(item => {
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerCaseSearchTerm);
        }
        return false;
      });
    });
  }

  // 최종 필터링 결과 저장
  currentFilteredData = dataToFilter; 
}

/**
 * ✅ 페이지별 데이터 표시 (showPage)
 */
function showPage(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = currentFilteredData.slice(startIndex, endIndex);
  const dataContainer = document.getElementById('dataContainer');
  
  dataContainer.innerHTML = ''; // 기존 내용 초기화

  if (itemsToShow.length === 0 && document.getElementById('textSearchInput').value.trim() !== '') {
    // 검색 결과가 없는 경우 메시지 표시
    dataContainer.innerHTML = '<div style="text-align:center; padding: 50px; font-size: 1.2em;">검색 결과가 없습니다.</div>';
  } else if (itemsToShow.length === 0 && currentFilter !== 'all') {
    // 특정 필터에 해당하는 결과가 없는 경우 메시지 표시
    dataContainer.innerHTML = '<div style="text-align:center; padding: 50px; font-size: 1.2em;">이 카테고리에 해당하는 항목이 없습니다.</div>';
  } else {
    // 아이템 렌더링
    itemsToShow.forEach(item => {
      const div = document.createElement('div');
      div.className = 'filterDiv ' + item.category.split(',').join(' ');
      const a = document.createElement('a');
      a.href = item.link;
      const img = document.createElement('img');
      img.src = item['img url'];
      const divTitle = document.createElement('div');
      divTitle.className = 'divTitle';
      divTitle.textContent = item.title;
      div.setAttribute('data-category', item.category); 
      a.appendChild(img);
      a.appendChild(divTitle);
      div.appendChild(a);
      dataContainer.appendChild(div);
    });
  }

  window.scrollTo(0, 0); // 페이지 상단으로 스크롤 (200px 위치)
}

/**
 * ✅ 페이지네이션 렌더링 (renderPagination)
 */
function renderPagination() {
  const totalPages = Math.ceil(currentFilteredData.length / itemsPerPage);
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  // 이전 버튼
  const prevButton = document.createElement('div');
  prevButton.classList.add('page-btn', 'prev-btn');
  prevButton.textContent = '◀ 이전';
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
      renderPagination();
    }
  });
  if (currentPage === 1 || totalPages === 0) {
    prevButton.classList.add('disabled');
  }
  paginationContainer.appendChild(prevButton);

  // 페이지 번호 버튼들
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    const firstPageButton = document.createElement('div');
    firstPageButton.classList.add('page-btn');
    firstPageButton.textContent = '1';
    firstPageButton.addEventListener('click', () => {
      currentPage = 1;
      showPage(currentPage);
      renderPagination();
    });
    paginationContainer.appendChild(firstPageButton);

    if (startPage > 2) {
      const dots = document.createElement('div');
      dots.classList.add('page-dots');
      dots.textContent = '...';
      paginationContainer.appendChild(dots);
    }
  }

  if (totalPages > 0) {
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('div');
      pageButton.classList.add('page-btn');
      pageButton.textContent = i;
      if (i === currentPage) {
        pageButton.classList.add('active');
      }
      pageButton.addEventListener('click', () => {
        currentPage = i;
        showPage(currentPage);
        renderPagination();
      });
      paginationContainer.appendChild(pageButton);
    }
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement('div');
      dots.classList.add('page-dots');
      dots.textContent = '...';
      paginationContainer.appendChild(dots);
    }

    const lastPageButton = document.createElement('div');
    lastPageButton.classList.add('page-btn');
    lastPageButton.textContent = totalPages;
    lastPageButton.addEventListener('click', () => {
      currentPage = totalPages;
      showPage(currentPage);
      renderPagination();
    });
    paginationContainer.appendChild(lastPageButton);
  }

  // 다음 버튼
  const nextButton = document.createElement('div');
  nextButton.classList.add('page-btn', 'next-btn');
  nextButton.textContent = '다음 ▶';
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
      renderPagination();
    }
  });
  if (currentPage === totalPages || totalPages === 0) {
    nextButton.classList.add('disabled');
  }
  paginationContainer.appendChild(nextButton);
}

/**
 * ✅ 필터 및 검색 통합 제어 함수 (filterSelection)
 *
 * 이 함수는 버튼 클릭 및 텍스트 검색을 모두 처리하며, 
 * 텍스트 검색과 버튼 필터링을 완전히 독립적으로 분리합니다.
 *
 * @param {string} c - 클릭된 버튼 카테고리
 * @param {boolean} isTextSearch - 검색창에서 호출되었는지 여부
 */
function filterSelection(c, isTextSearch = false) {
  currentPage = 1;

  // 1. 현재 검색어 획득 (공백 제거)
  let searchTerm = document.getElementById('textSearchInput').value.trim();
  let categoryToFilter = c;

  if (isTextSearch && searchTerm !== '') {
    // 📌 [텍스트 검색 실행 시 (엔터/검색 버튼)]
    
    // 시각적 피드백: 'all' 버튼 강제 활성화
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => button.classList.remove('active'));
    const allButton = document.querySelector('.btn.all');
    if (allButton) {
        allButton.classList.add('active');
    }
    
    // 로직: 검색은 항상 전체('all') 데이터를 대상으로 합니다.
    currentFilter = 'all'; 
    categoryToFilter = 'all'; // textSearchAndFilter에 'all' 전달
  
  } else {
    // 📌 [순수 버튼 필터 클릭 또는 빈 검색어 검색 시]

    if (!isTextSearch) {
      // 순수 버튼 클릭 시에만 currentFilter 업데이트 및 버튼 활성화
      currentFilter = c; 
      const buttons = document.querySelectorAll('.btn');
      buttons.forEach(button => button.classList.remove('active'));
      const clickedButton = event ? event.target : document.querySelector('.btn.' + c);
      
      if (clickedButton && clickedButton.classList.contains('btn')) {
        clickedButton.classList.add('active');
      } else {
        const allButton = document.querySelector('.btn.all');
        if (allButton) allButton.classList.add('active');
      }
      
      // ✅ 핵심: 버튼 필터링 시 텍스트 검색창을 비워 검색 결과를 무시합니다.
      if (searchTerm !== '') {
          document.getElementById('textSearchInput').value = '';
          searchTerm = ''; // 검색 로직에 빈 값 전달
      }
    }
    
    // 버튼 필터 시: 현재 필터(currentFilter)만 적용하고 텍스트 검색은 무시(빈 값)합니다.
    categoryToFilter = currentFilter;
  }

  // 최종적으로 설정된 categoryToFilter와 searchTerm으로 데이터 필터링 실행
  textSearchAndFilter(categoryToFilter, searchTerm);

  showPage(currentPage);
  renderPagination();
  updateSearchResultCount();
}

/**
 * ✅ 검색 결과 개수 표시 (updateSearchResultCount)
 */
function updateSearchResultCount() {
  const totalCount = currentFilteredData.length;
  document.getElementById('searchResultCount').textContent = `Search results: ${totalCount}`;
}