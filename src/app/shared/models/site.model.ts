export interface Site {
  id?: number;
  nom: string;
  description?: string;
  adresse: string;
  ville: string;
  region: string;
  pays: string;
  latitude: number;
  longitude: number;
  type: TypeSite;
  statut: StatutSite;
  contactPersonne?: string;
  contactTelephone?: string;
  contactEmail?: string;
  nombreEmployes?: number;
  horairesOuverture?: string;
  equipements?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum TypeSite {
  SIEGE_SOCIAL = 'SIEGE_SOCIAL',
  BUREAU_REGIONAL = 'BUREAU_REGIONAL',
  CENTRE_OPERATIONNEL = 'CENTRE_OPERATIONNEL',
  DATACENTER = 'DATACENTER',
  SITE_CLIENT = 'SITE_CLIENT',
  FORMATION = 'FORMATION'
}

export enum StatutSite {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  EN_CONSTRUCTION = 'EN_CONSTRUCTION',
  EN_MAINTENANCE = 'EN_MAINTENANCE'
}