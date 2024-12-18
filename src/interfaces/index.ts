export interface LatLng {
	lat: number;
	lng: number;
}

export interface CsvRow {
	[key: string]: string;
}

export interface DeliveryZone {
	deliveryZoneID: string;
	name: string;
	description: string;
	color: string;
	opacity: number;
	coordinates: LatLng[];
}

export interface CustomerLocation {
	firstName: string;
	lastName: string;
	address1: string;
	address2: string;
	city: string;
	state: string;
	zip: string;
	phone: string;
	route: string;
	latLng: google.maps.LatLngLiteral | null;
}

export interface CustomerInfo extends LatLng {
	name?: string;
	address?: string;
	state: string;
	zip: string;
	phone: string;
	route: string;
	latLng: google.maps.LatLngLiteral | null;
}
