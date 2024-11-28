import React, { useEffect, useState } from 'react';
import { fetchAddresses } from '../utils/fetchAddresses';

const CsvReader: React.FC = () => {
	const [addresses, setAddresses] = useState<string[]>([]);

	useEffect(() => {
		fetchAddresses('/data.csv')
			.then((addressesData: string[]) => {
				setAddresses(addressesData);
			})
			.catch((error: Error) => console.error(error));
	}, []);

	return (
		<div>
			<h3>Direcciones:</h3>
			<ul>
				{addresses.map((address, index) => (
					<li key={index}>{address}</li>
				))}
			</ul>
		</div>
	);
};

export default CsvReader;
