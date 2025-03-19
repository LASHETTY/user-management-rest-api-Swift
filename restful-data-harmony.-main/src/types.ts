
// User types
export interface GeoLocation {
  lat: string;
  lng: string;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: GeoLocation;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface Comment {
  id: number;
  postId?: number;
  name: string;
  email: string;
  body: string;
}

export interface Post {
  id: number;
  userId?: number;
  title: string;
  body: string;
  comments?: Comment[];
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
  posts?: Post[];
}

// API Response types
export interface ApiResponse {
  status: number;
  data?: any;
  error?: string;
}
