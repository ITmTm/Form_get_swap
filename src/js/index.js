window.addEventListener('DOMContentLoaded', () => {
	const fetchDataBtn = document.querySelector('#fetchData'),
		  clearTableBtn = document.querySelector('#clearTable'),
		  tableContainer = document.querySelector('#tableContainer'),
		  loader = document.querySelector('#loader'),
		  apiUrl = 'https://swapi.dev/api/people/';

	let sortDirection = 1;
	let currentSortColumn = null;

	/**
	 * @param {Object} data
	 * @param {Object[]} data.results
	 */

	fetchDataBtn.addEventListener('click', fetchData);
	clearTableBtn.addEventListener('click', clearTable);

	function fetchData() {
		// Показ прелоадера
		showLoader();

		fetch(apiUrl)
			.then(response => response.json())
			.then(/** @param {Object} data */ data => {

				// Скрытие преолоадера после загрузки данных
				hideLoader();

				const results = data && data.results;  // Явно указываем структуру объекта
				if (results) {
					renderTable(results);
					setupSortListener();  // Обработчик событий для сортировки после загрузки данных
					setupDeleteButtons(); // Обработчик событий для кнопки удаления
				} else {
					showPlaceholder('Данные не найдены');
				}
			})
			.catch(err => {
				console.error('Ошибка при получений данных: ', err);
				// Скрываем прелоадер в случае ошибки
				hideLoader();
				showPlaceholder(`Ошибка при получений данных: ${err}`)
			});
	}

	function renderTable(data) {
		const table = document.createElement('table');
		const headerRow = table.insertRow(0);

		// Создание заголовков для таблицы
		for (let j = 0; j < 10; j++) {
			const th = document.createElement('th');
			const key = Object.keys(data[0])[j];
			th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
			headerRow.appendChild(th);
		}

		// Заполнение таблицы данными
		for (let i = 0; i < 5; i++) {
			const row = table.insertRow(i + 1);
			for (let j = 0; j < 10; j++) {
				const cell = row.insertCell(j);
				const key = Object.keys(data[i])[j];
				cell.textContent = data[i][key]
			}

			addDeleteButton(row);  // Удаление каждой строки
		}

		// Очищаем контейнер и добавляем таблицу
		tableContainer.innerHTML = '';
		tableContainer.appendChild(table);
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

	// Добавление слушателя для таблицы
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
				deleteRow(0);
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

		if (index >= 0 && index < rowCount) {
			table.deleteRow(index);
		} else {
			console.error('Последнюю строку удалить нельзя');
			alert('Последнюю строку удалить нельзя');
		}

	}

	function clearTable() {
		tableContainer.innerHTML = '<p>Данные еще не загруженны</p>';
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