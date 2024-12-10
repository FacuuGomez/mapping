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
