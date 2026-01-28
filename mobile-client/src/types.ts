export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  type: string;
  location: string;
  status: 'available' | 'maintenance' | 'busy';
}

export interface Inspection {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  status: 'progress' | 'completed' | 'synced' | 'waiting';
  startedAt: string;
  inspector: string;
  image?: string;
}

export interface Template {
  id: string;
  name: string; // Renamed from title to match DB and Web
  description: string;
  duration?: string;
  icon?: string;
  iconColorClass?: string;
  iconBgClass?: string;
  validate_docs?: boolean;
  validate_user_docs?: boolean;
  validate_vehicle_docs?: boolean;
  validate_trailer_docs?: boolean;
}

export interface User {
  name: string;
  role: string;
  email: string;
  avatar: string;
}