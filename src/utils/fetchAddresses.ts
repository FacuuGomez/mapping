// import Papa from 'papaparse';

// interface CsvRow {
// 	[key: string]: string;
// }

// export const fetchAddresses = (csvUrl: string): Promise<string[]> => {
// 	return new Promise((resolve, reject) => {
// 		fetch(csvUrl)
// 			.then((response) => response.text())
// 			.then((csvData) => {
// 				Papa.parse(csvData, {
// 					complete: (result) => {
// 						const addressesData = (result.data as CsvRow[])
// 							.map((row) => row['customer.address1'])
// 							.filter((address) => address);

// 						resolve(addressesData);
// 					},
// 					header: true,
// 				});
// 			})
// 			.catch((error) => reject(`Error reading CSV file: ${error}`));
// 	});
// };

// import Papa from 'papaparse';

// interface CsvRow {
// 	[key: string]: string;
// }

// export const fetchAddresses = (csvUrl: string): Promise<string[]> => {
// 	return new Promise((resolve, reject) => {
// 		fetch(csvUrl)
// 			.then((response) => response.text())
// 			.then((csvData) => {
// 				Papa.parse(csvData, {
// 					complete: (result) => {
// 						const addressesData = (result.data as CsvRow[])
// 							.map((row) => {
// 								const address = row['customer.address1'];
// 								const city = row['customer.city'];

// 								// Si tanto la dirección como la ciudad existen, las concatenamos
// 								if (address && city) {
// 									return `${address}, ${city}`;
// 								} else if (address) {
// 									return address; // Solo la dirección
// 								} else if (city) {
// 									return city; // Solo la ciudad
// 								}
// 								return ''; // Si no hay dirección ni ciudad, retornamos un string vacío
// 							})
// 							.filter((address) => address); // Filtra las entradas vacías

// 						resolve(addressesData);
// 					},
// 					header: true,
// 				});
// 			})
// 			.catch((error) => reject(`Error reading CSV file: ${error}`));
// 	});
// };

import Papa from 'papaparse';

interface CsvRow {
	[key: string]: string;
}

export const fetchAddresses = (csvUrl: string): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		fetch(csvUrl)
			.then((response) => response.text())
			.then((csvData) => {
				Papa.parse(csvData, {
					complete: (result) => {
						// Utilizamos un Set para almacenar solo direcciones únicas
						const uniqueAddresses = new Set<string>();

						const addressesData = (result.data as CsvRow[])
							.map((row) => {
								const address = row['customer.address1'];
								const city = row['customer.city'];

								// Si tanto la dirección como la ciudad existen, las concatenamos
								if (address && city) {
									return `${address}, ${city}`;
								} else if (address) {
									return address; // Solo la dirección
								} else if (city) {
									return city; // Solo la ciudad
								}
								return ''; // Si no hay dirección ni ciudad, retornamos un string vacío
							})
							.filter((address) => {
								// Filtra direcciones únicas y no vacías
								if (address && !uniqueAddresses.has(address)) {
									uniqueAddresses.add(address); // Añade al Set si es única
									return true;
								}
								return false;
							})
							.slice(0, 100); // Limita el resultado a los primeros 10

						resolve(addressesData);
					},
					header: true,
				});
			})
			.catch((error) => reject(`Error reading CSV file: ${error}`));
	});
};
