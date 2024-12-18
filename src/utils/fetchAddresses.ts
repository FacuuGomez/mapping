// 486 locations - customer.address1

import Papa from "papaparse";
import { CsvRow, CustomerLocation } from "../interfaces";

// export const fetchCustomerLocations = async (
// 	csvUrl: string
// ): Promise<CustomerLocation[]> => {
// 	if (typeof google === "undefined") {
// 		throw new Error("Google Maps API no está cargada");
// 	}

// 	return new Promise((resolve, reject) => {
// 		fetch(csvUrl)
// 			.then((response) => response.text())
// 			.then(async (csvData) => {
// 				Papa.parse(csvData, {
// 					complete: async (result) => {
// 						try {
// 							const customerLocations: CustomerLocation[] = [];

// 							for (const row of result.data as CsvRow[]) {
// 								const fullAddress = `${row["customer.address1"]}${
// 									row["customer.address2"] ? ` ${row["customer.address2"]}` : ""
// 								}, ${row["customer.city"]}, ${row["customer.state"]} ${
// 									row["customer.zip"]
// 								}`;
// 								const latLng = await geocodeAddress(fullAddress);

// 								const customerLocation: CustomerLocation = {
// 									firstName: row["customer.first_name"] || "",
// 									lastName: row["customer.last_name"] || "",
// 									address1: row["customer.address1"] || "",
// 									address2: row["customer.address2"] || "",
// 									city: row["customer.city"] || "",
// 									state: row["customer.state"] || "",
// 									zip: row["customer.zip"] || "",
// 									phone: row["customer.phone"] || "",
// 									route: row["route"] || "",
// 									latLng: latLng,
// 								};

// 								customerLocations.push(customerLocation);
// 							}

// 							resolve(customerLocations);
// 						} catch (error) {
// 							reject(`Error durante el procesamiento: ${error}`);
// 						}
// 					},
// 					header: true,
// 				});
// 			})
// 			.catch((error) => reject(`Error al leer el archivo CSV: ${error}`));
// 	});
// };

export const fetchCustomerLocations = async (
	csvUrl: string
): Promise<CustomerLocation[]> => {
	return new Promise((resolve, reject) => {
		fetch(csvUrl)
			.then((response) => response.text())
			.then(async (csvData) => {
				Papa.parse(csvData, {
					complete: async (result) => {
						try {
							const customerLocations: CustomerLocation[] = [];
							const uniqueLatLngs = new Set<string>();

							for (const row of result.data as CsvRow[]) {
								const fullAddress = `${row["customer.address1"]}${
									row["customer.address2"] ? ` ${row["customer.address2"]}` : ""
								}, ${row["customer.city"]}, ${row["customer.state"]} ${
									row["customer.zip"]
								}`;
								const latLng = await geocodeAddress(fullAddress);

								if (latLng) {
									const locationKey = `${latLng.lat},${latLng.lng}`;

									if (!uniqueLatLngs.has(locationKey)) {
										uniqueLatLngs.add(locationKey);

										const customerLocation: CustomerLocation = {
											firstName: row["customer.first_name"] || "",
											lastName: row["customer.last_name"] || "",
											address1: row["customer.address1"] || "",
											address2: row["customer.address2"] || "",
											city: row["customer.city"] || "",
											state: row["customer.state"] || "",
											zip: row["customer.zip"] || "",
											phone: row["customer.phone"] || "",
											route: row["route"] || "",
											latLng: latLng,
										};

										customerLocations.push(customerLocation);
									}
								}
							}

							resolve(customerLocations);
						} catch (error) {
							reject(`Error durante el procesamiento: ${error}`);
						}
					},
					header: true,
				});
			})
			.catch((error) => reject(`Error al leer el archivo CSV: ${error}`));
	});
};

const geocodeAddress = async (
	address: string
): Promise<google.maps.LatLngLiteral | null> => {
	if (typeof google === "undefined") {
		throw new Error("Google Maps API no está cargada");
	}

	return new Promise((resolve) => {
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode({ address }, (results, status) => {
			if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
				const location = results[0].geometry.location;
				resolve({ lat: location.lat(), lng: location.lng() });
			} else {
				console.warn(
					`Geocoding failed for address: ${address}, status: ${status}`
				);
				resolve(null);
			}
		});
	});
};

export const fetchAddresses = async (
	csvUrl: string
): Promise<google.maps.LatLngLiteral[]> => {
	if (typeof google === "undefined") {
		throw new Error("Google Maps API no está cargada");
	}

	return new Promise((resolve, reject) => {
		fetch(csvUrl)
			.then((response) => response.text())
			.then(async (csvData) => {
				Papa.parse(csvData, {
					complete: async (result) => {
						try {
							const uniqueAddresses = new Set<string>();

							const addresses = (result.data as CsvRow[])
								.map((row) => {
									const address = row["customer.address1"];
									const city = row["customer.city"];
									if (address && city) return `${address}, ${city}`;
									if (address) return address;
									if (city) return city;
									return "";
								})
								.filter((address) => {
									if (address && !uniqueAddresses.has(address)) {
										uniqueAddresses.add(address);
										return true;
									}
									return false;
								});

							console.log("addresses", addresses);

							const geocodedLocations: google.maps.LatLngLiteral[] = [];

							for (const address of addresses) {
								const location = await geocodeAddress(address);
								if (location) {
									geocodedLocations.push(location);
								}
							}

							resolve(geocodedLocations);
						} catch (error) {
							reject(`Error during geocoding: ${error}`);
						}
					},
					header: true,
				});
			})
			.catch((error) => reject(`Error reading CSV file: ${error}`));
	});
};

// export const fetchAndGeocodeAddresses = async (
//   csvUrl: string
// ): Promise<google.maps.LatLngLiteral[]> => {
//   return new Promise((resolve, reject) => {
//     fetch(csvUrl)
//       .then((response) => response.text())
//       .then(async (csvData) => {
//         Papa.parse(csvData, {
//           complete: async (result) => {
//             const uniqueAddresses = new Set<string>();

//             const addresses = (result.data as CsvRow[])
//               .map((row) => {
//                 const address = row["customer.address1"];
//                 const city = row["customer.city"];
//                 if (address && city) return `${address}, ${city}`;
//                 if (address) return address;
//                 if (city) return city;
//                 return "";
//               })
//               .filter((address) => {
//                 if (address && !uniqueAddresses.has(address)) {
//                   uniqueAddresses.add(address);
//                   return true;
//                 }
//                 return false;
//               });

//             const batchSize = 250;
//             const geocodedLocations: google.maps.LatLngLiteral[] = [];

//             // Divide las direcciones en lotes
//             for (let i = 0; i < addresses.length; i += batchSize) {
//               const batch = addresses.slice(i, i + batchSize);

//               // Geocodifica cada lote
//               for (const address of batch) {
//                 const location = await geocodeAddress(address);
//                 if (location) {
//                   geocodedLocations.push(location);
//                 }
//               }

//               // Retraso opcional para evitar superar los límites de la API
//               if (i + batchSize < addresses.length) {
//                 await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera 2 segundos
//               }
//             }

//             resolve(geocodedLocations);
//           },
//           header: true,
//         });
//       })
//       .catch((error) => reject(`Error reading CSV file: ${error}`));
//   });
// };
