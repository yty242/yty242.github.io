const itemsPerPage = 14;
let currentPage = 1;
let currentFilter = 'all';

function showPage(pageNumber) {
  if (!filteredData || !filteredData[currentFilter]) return;

  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = filteredData[currentFilter].slice(startIndex, endIndex);

  const container = document.getElementById('dataContainer');
  if (!container) return;
  container.innerHTML = '';

  itemsToShow.forEach(item => {
    const div = document.createElement('div');
    div.className = 'filterDiv ' + item.category;

    const a = document.createElement('a');
    a.href = item.link;

    const img = document.createElement('img');
    img.src = item['img url'];

    const divTitle = document.createElement('div');
    divTitle.className = 'divTitle';
    divTitle.textContent = item.title;

    a.appendChild(img);
    a.appendChild(divTitle);
    div.appendChild(a);
    container.appendChild(div);
  });
}

function renderPagination() {
  if (!filteredData || !filteredData[currentFilter]) return;

  const totalPages = Math.ceil(filteredData[currentFilter].length / itemsPerPage);
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('div');
    pageButton.classList.add('page-btn');
    pageButton.textContent = i;

    if (i === currentPage) pageButton.classList.add('active');

    pageButton.addEventListener('click', () => {
      currentPage = i;
      showPage(currentPage);
      updatePaginationButtons();
    });

    paginationContainer.appendChild(pageButton);
  }
}

function updatePaginationButtons() {
  document.querySelectorAll('.page-btn').forEach(button => {
    const pageNumber = parseInt(button.textContent);
    button.classList.toggle('active', pageNumber === currentPage);
  });
}
