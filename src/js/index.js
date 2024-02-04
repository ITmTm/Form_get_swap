window.addEventListener('DOMContentLoaded', function() {
	const fetchDataBtn = document.querySelector('#fetchData'),
		  clearTableBtn = document.querySelector('#clearTable'),
		  tableContainer = document.querySelector('#tableContainer'),
		  loader = document.querySelector('#loader');

	let data = [];


	function makeRowsDraggable() {
		const rows = document.querySelectorAll('table tr');
		rows.forEach(row => {
			row.draggable = true;

			row.addEventListener('dragstart', handleDragStart);
			row.addEventListener('dragover', handleDragOver);
			row.addEventListener('drop', handleDrop);
			row.addEventListener('dragend', handleDragEnd);
		});
	}

	let draggendRow = null;

	function handleDragStart(e) {
		draggendRow = e.target;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', draggendRow.innerHTML);
	}

	function handleDragOver(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	}

	function handleDrop(e) {
		e.preventDefault();
		const overRow = e.target.closest('tr');
		const table = document.querySelector('table');

		if (overRow && draggendRow) {
			if (overRow !== draggendRow) {
				const parent = overRow.parentNode;

				if (draggendRow.rowIndex < overRow.rowIndex) {
					parent.insertBefore(draggendRow, overRow.nextSibling);
				} else {
					parent.insertBefore(draggendRow, overRow);
				}

				makeRowsDraggable();  // Добавление прослушивателей событий

				// const updateData
			}
		}
	}



	const message = {
		failure: 'icon/404.gif'
	}

	let sortDirection = 1;
	let currentSortColumn = null;


	let currentPageButton = null; // Активная кнопка
	const savedActivePage = localStorage.getItem('activePage');
	// Текущая страница
	let currentPage = savedActivePage ? parseInt(savedActivePage) : 1;

	/**
	 * @param {Object} data
	 * @param {Object[]} data.results
	 */

	fetchDataBtn.addEventListener('click', fetchData);
	clearTableBtn.addEventListener('click', clearTable);

	// Использование localStorage загрузки данных при первой загрузке страницы
	if (localStorage.getItem('tableData')) {
		renderTable(JSON.parse(localStorage.getItem('tableData')) || []);
		setupSortListener();
		setupDeleteButtons();
	}

	if (localStorage.getItem('currentPage')) {
		currentPage = parseInt(localStorage.getItem('currentPage'))
	}

	async function fetchData() {
		try {
			// Показ прелоадера
			showLoader();

			const apiUrl = 'https://swapi.dev/api/people/';
			const pageUrl = `${apiUrl}?page=${currentPage}`;		// Формированеие URL страницы

			const response = await fetch(pageUrl)

			handleResponse(response);
		} catch (err) {
			handleError(err);
		} finally {
			// Скрываем прелоадер в случае ошибки
			hideLoader();
		}
	}


	function handleResponse(response) {
		if (!response.ok) {
			throw new Error('Ошибка при получений данных');
		}

		return response.json()
			.then(data => {
				const results = data && data.results;  // Явно указываем структуру объекта

				if (results) {
					renderTable(results);
					setupSortListener();  // Обработчик событий для сортировки после загрузки данных
					setupDeleteButtons(); // Обработчик событий для кнопки удаления
					renderPagination(data) // Обновление элемента пагинации

					// 			// Сохранение данных в localStorage
								localStorage.setItem('tableData', JSON.stringify(results));
				} else {
					showPlaceholder('Данные не найдены');
				}
			});
	}

	function handleError(err) {
		console.error('Ошибка при получений данных: ', err);

		// Скрытие преолоадера после загрузки данных
		hideLoader();

		renderPagination([]);
		showPlaceholder(`<img src="${message.failure}" style="display: block;margin: 0 auto;" alt="Error icon"> ${err}`);
	}

	// Создание таблицы
	function renderTable(data) {
		const table = document.createElement('table');

		if (data && data.length > 0) {
			const headerRow = table.insertRow(0);

			// Создание заголовков для таблицы
			for (let j = 0; j < 10; j++) {
				const th = document.createElement('th');
				const key = Object.keys(data[0])[j];
				th.textContent = key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
				headerRow.appendChild(th);
			}

			// Заполнение таблицы данными
			for (let i = 0; i < data.length; i++) {
				const row = table.insertRow(i + 1);
				for (let j = 0; j < 10; j++) {
					const cell = row.insertCell(j);
					const key = Object.keys(data[i])[j];
					cell.textContent = key ? data[i][key] : '';
				}

				addDeleteButton(row, i);  // Удаление каждой строки

			}

			// Обновление элементов пагинации
			renderPagination(data);
		} else {
			showPlaceholder('Данные не найдены');
		}

		// Очищаем контейнер и добавляем таблицу
		tableContainer.innerHTML = '';
		tableContainer.appendChild(table);

		setupSortListener();

		// Обновление элементов пагинации
		renderPagination(data);
	}


	// Сортировка
	function sortData(column) {
		const table = tableContainer.querySelector('table');
		const rows = Array.from(table.querySelectorAll('tr'));
		const columnIndex = Array.from(rows[0].querySelectorAll('th')).findIndex(cell => cell.textContent === column);

		rows.shift();

		rows.sort((a, b) => {
			const aValue = Array.from(a.querySelectorAll('td, th'))[columnIndex].textContent;
			const bValue = Array.from(b.querySelectorAll('td, th'))[columnIndex].textContent;

			if (isNaN(aValue) && isNaN(bValue)) {
				return sortDirection * aValue.localeCompare(bValue);
			} else {
				return sortDirection * (Number(aValue) - Number(bValue))
			}
		});

		while (table.rows.length > 1) {
			table.deleteRow(1);
		}

		rows.forEach(row => table.appendChild(row));

		sortDirection *= -1;
		currentSortColumn = column;
	}

	// Добавление слушателя событий для таблицы
	function setupSortListener() {
		const headerCells = tableContainer.querySelectorAll('th');
		headerCells.forEach(cell => {
			cell.addEventListener('click', () => {
				const column = cell.textContent;

				if (column !== currentSortColumn) {
					sortDirection = 1;
				}
				sortData(column);
			});
		});
	}

	function setupDeleteButtons() {
		const deleteButtons = tableContainer.querySelectorAll('.delete-button');
		deleteButtons.forEach((button) => {
			button.addEventListener('click', () => {
				deleteRow(1);
			});
		});
	}

	function addDeleteButton(row) {
		const deleteButtonCell = row.insertCell(-1);
		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'Удалить';
		deleteButton.className = 'delete-button';
		deleteButtonCell.appendChild(deleteButton);
	}

	function deleteRow(index) {
		const table = tableContainer.querySelector('table');
		const rowCount = table.rows.length;

		if (index === 0) {
			table.innerHTML = '';

			localStorage.removeItem('tableData');
		} else if (index >= 0 && index < rowCount) {
			const tableData = JSON.parse(localStorage.getItem('tableData')) || [];

			if (index - 1 >= 0 && index - 1 < tableData.length) {
				tableData.splice(index -1, 1);
				localStorage.setItem('tableData', JSON.stringify(tableData));

				renderTable(tableData);
				setupSortListener();
				setupDeleteButtons();
			} else {
				console.error('Последнюю строку удалить нельзя');
				alert('Последнюю строку удалить нельзя');
			}
		} else {
			console.error('Последнюю строку удалить нельзя');
		}
	}

	function renderPagination(data) {
		const paginationContainer =  document.querySelector('#pagination');
		paginationContainer.innerHTML = '';

		const itemsPerPage = null;

		// Проверка есть ли данные в localStorage
		const storedData = JSON.parse(localStorage.getItem('tableData')) || [];
		const totalCount = (data && data.count) || storedData.length;

		if (totalCount > 0) {
			// Если есть то используем их
			const totalPages = Math.ceil(totalCount / itemsPerPage);
			const maxButtons = 5;

			for (let i = 1; i <= Math.min(totalPages, maxButtons); i++) {
				const pageButton = document.createElement('button');
				pageButton.textContent = String(i); // Преобразование число в строку
				pageButton.addEventListener('click',(e) => {
					currentPage = parseInt(e.target.textContent); // Преобразование числа в число
					fetchData()
						.then(() => {
							activePageButton(pageButton);
						})
						.catch((err) => {
							console.error('Ошибка при загрузке данных:', err);
						});
					// activePageButton(pageButton)
				});
				paginationContainer.appendChild(pageButton);

				// Проверка, является ли текущая кнопка активной
				if (i === currentPage) {
					currentPageButton = pageButton;
					currentPageButton.classList.add('active-page');  // Добавление класса
				}
			}
		}
	}

	function activePageButton(activeButton) {
		if (currentPageButton) {
			currentPageButton.classList.remove('active-page');
		}
		currentPageButton = activeButton;
		currentPageButton.classList.add('active-page');

		// Сохраняем текущую активную страницу в localStorage
		localStorage.setItem('activePage', currentPage);
	}

	function clearTable() {
		tableContainer.classList.add('fade-out');


		setTimeout(() => {
			tableContainer.innerHTML = '<p>Данные не загружены...</p>';

			// Очищение данных в localStorage при очистке таблицы
			localStorage.removeItem('tableData');
			localStorage.removeItem('currentPage');  // Очистка сохраненной текущей страницы

			// Очищение пагинации при чистке таблицы
			renderPagination([]);

			tableContainer.classList.remove('fade-out');
		}, 500)
	}

	function showPlaceholder(message) {
		tableContainer.innerHTML = `<p>${message}</p>`;
	}

	function showLoader() {
		loader.style.display = 'block';
	}

	function hideLoader() {
		loader.style.display = 'none';
	}

})