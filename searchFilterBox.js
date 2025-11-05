const itemsPerPage = 14; // 페이지당 표시할 아이템 수
let fullDataSet = []; // 전체 JSON 데이터를 저장할 변수
let currentFilteredData = []; // 현재 필터와 텍스트 검색이 적용된 최종 데이터
let currentPage = 1; // 현재 페이지 번호
let currentFilter = 'all'; // 현재 버튼 필터

// JSON 파일 로드 함수
function loadJSON(callback) {
  const xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', '1.json', true); // JSON 파일의 경로를 수정하세요
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

// 데이터 로드 및 초기화
loadJSON(function(response) {
  fullDataSet = JSON.parse(response);
  
  // 초기 로드 시 'all' 필터 적용 및 초기 페이지 렌더링
  const allButton = document.querySelector('.btn.all');
  if (allButton) {
	// 'all' 버튼이 있으면 클릭 이벤트 발생 (활성화 및 필터링)
	allButton.click();
  } else {
	// 'all' 버튼이 없을 경우 수동으로 초기화
	filterSelection('all'); 
  }

  // 👇👇👇 엔터 키 검색 기능 추가 (여기부터) 👇👇👇
  const searchInput = document.getElementById('textSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        // 검색 버튼의 onclick 함수와 동일한 로직을 실행합니다.
        filterSelection(currentFilter, true); 
        event.preventDefault(); // Enter를 눌렀을 때 폼이 제출되어 페이지가 새로고침되는 것을 방지합니다.
      }
    });
  }
  // 👆👆👆 엔터 키 검색 기능 추가 (여기까지) 👆👆👆
});


/**
 * 현재 필터 버튼 카테고리와 텍스트 검색어를 기반으로 데이터를 필터링합니다.
 * @param {string} category - 현재 선택된 버튼 필터 ('all', '강남구' 등)
 * @param {string} searchTerm - 검색창에 입력된 텍스트
 */
function textSearchAndFilter(category, searchTerm) {
	let dataToFilter = fullDataSet;

	// 1. 버튼 카테고리 필터링 적용
	if (category !== 'all') {
		dataToFilter = dataToFilter.filter(item => {
			// item.category가 "집공개, 강남구" 와 같이 여러 값일 수 있으므로 배열로 처리
			const categories = item.category.split(',').map(c => c.trim());
			return categories.includes(category);
		});
	}

	// 2. 텍스트 검색어 필터링 적용
	if (searchTerm && searchTerm.trim() !== '') {
		const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
		dataToFilter = dataToFilter.filter(item => {
			// item의 모든 속성(title, category, img url, link 등)에서 검색
			return Object.values(item).some(value => {
				// 값이 문자열인 경우에만 검색을 시도합니다.
				if (typeof value === 'string') {
					return value.toLowerCase().includes(lowerCaseSearchTerm);
				}
				return false;
			});
		});
	}

	// 최종 필터링된 데이터를 전역 변수에 저장
	currentFilteredData = dataToFilter; 
}


    function showPage(pageNumber) {
      // 페이지 번호에 따라 필터링된 데이터를 표시합니다.
      const startIndex = (pageNumber - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const itemsToShow = currentFilteredData.slice(startIndex, endIndex);
      const dataContainer = document.getElementById('dataContainer');
	  
	  dataContainer.innerHTML = ''; // 기존 내용 삭제

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
      // 페이지 맨 위로 스크롤
      window.scrollTo(0, 200);
    }

    function renderPagination() {
      // 페이지네이션 렌더링
      const totalPages = Math.ceil(currentFilteredData.length / itemsPerPage);
      const paginationContainer = document.getElementById('pagination');
      paginationContainer.innerHTML = '';
      
      // 이전 페이지 버튼 생성
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
      
      // 페이지 번호 버튼 생성 (최대 5개만 표시)
      const maxVisiblePages = 5; 
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // 첫 페이지 표시 (범위 밖일 때)
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
      
	  if(totalPages > 0){
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
      
      // 마지막 페이지 표시 (범위 밖일 때)
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
      
      // 다음 페이지 버튼 생성
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
 * 버튼 필터링을 수행하고 텍스트 검색을 포함하여 데이터를 업데이트합니다.
 * 이 함수는 HTML의 버튼과 검색 버튼의 onclick 이벤트에 연결됩니다.
 * @param {string} c - 클릭된 버튼의 카테고리 (버튼 클릭 시에만 사용)
 * @param {boolean} isTextSearch - 텍스트 검색 버튼에 의해 호출되었는지 여부
 */
function filterSelection(c, isTextSearch = false) {
    currentPage = 1; // 필터링 시 현재 페이지를 1로 초기화
    
    if (!isTextSearch) {
		// 버튼 필터 클릭 시에만 currentFilter와 버튼 활성화 상태를 업데이트합니다.
		currentFilter = c; 
		const buttons = document.querySelectorAll('.btn');
		buttons.forEach(button => {
			button.classList.remove('active');
		});
		
		// 이벤트 타겟을 찾아서 활성화합니다.
		// NOTE: loadJSON에서 allButton.click()을 호출할 때는 event 객체가 없습니다.
        // 이 부분을 수정하여 event.target 대신 c (currentFilter)를 사용해 버튼을 찾도록 합니다.
		const clickedButton = event ? event.target : document.querySelector('.btn.' + c); // event가 없을 때 c로 찾기
		
		if (clickedButton && clickedButton.classList.contains('btn')) {
			clickedButton.classList.add('active');
		} else {
			// 초기 로드 시 'all' 버튼 활성화 로직 (안전 장치)
			const allButton = document.querySelector('.btn.all');
			if (allButton) allButton.classList.add('active');
		}
    }

	// 현재 텍스트 검색 필드의 값을 가져옵니다.
	const searchTerm = document.getElementById('textSearchInput').value;

	// 버튼 필터와 텍스트 검색을 모두 적용합니다.
	textSearchAndFilter(currentFilter, searchTerm);
	
    showPage(currentPage);
    renderPagination();
    updateSearchResultCount(); // 검색 결과 개수 업데이트
}


    // 검색 결과 개수를 업데이트하는 함수
    function updateSearchResultCount() {
      const totalCount = currentFilteredData.length;
      // HTML의 #searchResultCount 요소에 텍스트를 업데이트합니다.
      document.getElementById('searchResultCount').textContent = `Search results: ${totalCount}`;
    }