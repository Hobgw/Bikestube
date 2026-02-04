export interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  servicesPreview: string[];
  distance?: number;
}

export interface SearchLocation {
  latitude: number;
  longitude: number;
  address?: string;
}
