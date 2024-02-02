window.addEventListener('DOMContentLoaded', () => {
	const getButton = document.querySelector('.main__get'),
		  clearButton = document.querySelector('.main__clear'),
	      table = document.querySelector('#data-table'),
		  placeholder = document.querySelector('#placeholder'),
		  loadSpinner = document.querySelector('#spinn'),
		  apiUrl = 'https://swapi.dev/api/people/';

	let sortDirection = 1;
	let currentSortColumn = null;



	// function fetchData() {
	// 	return new Promise((resolve, reject) => {
	// 		fetch(apiUrl)
	// 			.then(response => {
	// 				if (!response.ok) {
	// 					throw new Error(`HTTP error! Status: ${response.status}`);
	// 				}
	// 				return response.json();
	// 			})
	// 			.then(data => resolve(data.results))
	// 			.catch(error => reject(error));
	// 	});
	// }
	//
	// function getData() {
	// 	fetchData()
	// 		.then(data => {
	// 			loadSpinner.style.display = 'block';
	// 			currentData = data;
	// 			displayData(currentData);
	// 		})
	// 		.catch(error => {
	// 			console.error('Ошибка при получении данных:', error);
	// 			loadSpinner.style.display = 'none';
	// 		});
	// }

	getButton.addEventListener('click', () => {
		loadData().then(r => r);
	})

	clearButton.addEventListener('click', () => {
		clearTable();
	})

	function getData() {
		loadSpinner.style.display = 'block';

		return new Promise(async (resolve, reject) => {
			try {
				const response = await fetch(apiUrl);
				const data = await response.json();
				resolve(data.results);
			} catch (error) {
				console.error('Ошибка при получении данных:', error);
				reject(error);
			} finally {
				loadSpinner.style.display = 'none';
			}
		});
	}

	async function loadData() {
		try {
			const results = await getData();
			displayData(results);
		} catch (error) {
			console.error('Ошибка при загрузке данных:', error);
			// alert(`Ошибка при получении данных:  ${error}`);
		}

	}




	function displayData(results) {
		table.innerHTML = '';
		loadSpinner.style.display = 'none';

		if (results.length > 0) {
			const rowsToDisplay = Math.min(5, results.length),
				  cellsToDisplay = Math.min(10, Object.keys(results[0]).length);

			const headerRow = table.createTHead().insertRow();

			for (let i = 0; i < cellsToDisplay; i++) {
				const headerCell = headerRow.insertCell();
				headerCell.textContent = Object.keys(results[0])[i];
				headerCell.addEventListener('click', () => sortData(Object.keys(results[0])[i]));
			}
			headerRow.insertCell();

			for (let i = 0; i < rowsToDisplay; i++) {
				const row = table.insertRow();
				for (let j =  0; j < cellsToDisplay; j++) {
					const cell = row.insertCell();
					cell.textContent = results[i][Object.keys(results[i])[j]];
				}

				const deleteCell = row.insertCell();
				const deleteButton = document.createElement('button');
				deleteButton.className = 'delete-button';
				deleteButton.textContent = 'Удалить';
				deleteButton.addEventListener('click', () => deleteRow(row.rowIndex));
				deleteCell.appendChild(deleteButton);
			}

			table.style.display = 'table';
			placeholder.style.display = 'none';
		} else {
			placeholder.style.display = 'block';
			table.style.display = 'none';
		}
	}

	function clearTable() {
		table.innerHTML = ''
		table.style.display = 'none';

		placeholder.style.display = 'block';
	}

	function deleteRow(rowIndex) {
		table.deleteRow(rowIndex);
	}

	function sortData(column) {
		const rows = Array.from(table.rows);
		const columnIndex = Object.keys(rows[0].cells).findIndex(cell => rows[0].cells[cell].textContent === column);

		rows.shift(); // Удалить строку заголовка

		rows.sort((a, b) => {
			const aValue = a.cells[columnIndex].textContent;
			const bValue = b.cells[columnIndex].textContent;

			if (isNaN(aValue) && isNaN(bValue)) {
				return sortDirection * aValue.localeCompare(bValue);
			} else {
				return  sortDirection * (Number(aValue) - Number(bValue));
			}
		});

		// Удаляем существующие строки
		rows.forEach(row => table.deleteRow(row.rowIndex));

		// Добавляем отсортированные строки
		rows.forEach(row => table.appendChild(row));

		sortDirection *= -1;
		currentSortColumn = column;
	}

	// let currentData = [];
	//
	// getButton.addEventListener('click', () => {
	// 	getData();
	// })
	//
	// const message = {
	// 	spinner: 'image/spinner.gif',
	// 	failure: 'Что-то пошло не так....'
	// }
	//
	// function fetchData()  {
	// 	return new Promise((resolve, reject) => {
	// 		fetch(apiUrl)
	// 			.then(response => {
	// 				if (!response.ok) {
	// 					throw new Error(`HTTP error! Status: ${response.status}`)
	// 				}
	// 				return response.json();
	// 			})
	// 			.then(data => resolve(data.results))
	// 			.catch(err => reject(err));
	// 	});
	// }
	//
	// function getData() {
	//
	// 	fetchData()
	// 		.then(data => {
	// 			currentData = data;
	// 			renderTable(currentData);
	// 		})
	// 		.catch(err => {
	// 			console.error('Ошибка при получений данных: ', err)
	// 		});
	// }
	//

	// function renderTable(data) {
	// 	// Очищаем таблицу перед новыми данными
	// 	table.innerHTML = '';
	//
	// 	if (data.length > 0) {
	// 		showTable()
	// 		const headerRow = table.createTHead().insertRow();
	//
	// 		for (let key in data[0]) {
	// 			placeholder.style.display = 'none'
	//
	// 			const th = document.createElement('th')
	// 			th.textContent = key;
	// 			th.addEventListener('click', () => sortData(key))
	// 			headerRow.appendChild(th)
	// 		}
	//
	// 		data.forEach((item, i) => {
	// 			const row= table.insertRow();
	// 			for (let key in item) {
	// 				const cell = row.insertCell()
	// 				cell.textContent = item[key];
	// 			}
	//
	// 			const deleteCell = row.insertCell();
	// 			const deleteButton = document.createElement('button');
	// 			deleteButton.textContent = 'Удалить';
	// 			deleteButton.addEventListener('click', () => deleteRow(index + 1));
	// 			deleteCell.appendChild(deleteButton)
	// 		})
	// 	} else {
	// 		placeholder.style.display = 'block';
	// 	}
	// }


	// function renderTable(data) {
	// 	// Очищаем таблицу перед новыми данными
	// 	table.innerHTML = '';
	//
	// 	if (data.length > 0) {
	// 		showTable()
	// 		const headerRow = table.createTHead().insertRow();
	//
	// 		if (data.length > 0) {
	// 			data.forEach(item => {
	// 				const row = table.insertRow();
	// 				for (let key in item) {
	// 					const cell = row.insertCell();
	// 					cell.textContent = item[key];
	// 				}
	// 			});
	// 			placeholder.style.display = 'none';
	// 		} else {
	// 			placeholder.style.display = 'block';
	// 		}
	// 	}
	// }
	//
	// function clearTable() {
	// 	clearButton.addEventListener('click', () => {
	//
	// 		// очистка таблицы
	// 		table.innerHTML = '';
	//
	// 		// Показать заглушку
	// 		placeholder.style.display = 'block'
	// 		currentData = [];
	// 	})
	// }
	//
	// function showTable() {
	// 	table.innerHTML = '<tr><th>Имя</th><th>Рост</th><th>Вес</th><th>Цвет волос</th><th>Цвет кожи</th></tr>';
	// 	placeholder.style.display = 'block';
	// }
	//
	// function deleteRow(rowIndex) {
	// 	table.deleteRow(rowIndex);
	// 	currentData.splice(rowIndex - 1, 1);
	// }
	//
	// function sortData(key) {
	// 	currentData.sort((a, b) => {
	// 		const valueA = a[key].toString().toLowerCase();
	// 		const valueB = b[key].toString().toLowerCase();
	// 		return valueA.localeCompare(valueB)
	// 	});
	//
	// 	renderTable(currentData);
	// }
})