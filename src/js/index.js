window.addEventListener('DOMContentLoaded', () => {
	const fetchDataBtn = document.querySelector('#fetchData'),
		  clearTableBtn = document.querySelector('#clearTable'),
		  tableContainer = document.querySelector('#tableContainer'),
		  loader = document.querySelector('#loader'),
		  apiUrl = 'https://swapi.dev/api/people/';


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
				const results = data && data.results;  // Явно указываем структуру объекта
				if (results) {
					renderTable(results)
					hideLoader();
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
		}

		// Очищаем контейнер и добавляем таблицу
		tableContainer.innerHTML = '';
		tableContainer.appendChild(table);
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