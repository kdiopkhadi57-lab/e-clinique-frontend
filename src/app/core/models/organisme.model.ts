import { Encaissement } from './comptabilite.model';
import { ModePaiement, StatutFacture } from './facture.model';

export type TypeOrganisme = 'ASSURANCE' | 'IPM';

export interface Organisme {
  id?: number;
  nom: string;
  type: TypeOrganisme;
  tauxPriseEnCharge: number;
  adresse?: string;
  telephone?: string;
  email?: string;
  ninea?: string;
  contact?: string;
  actif: boolean;
}

export interface CreanceOrganisme {
  organismeId: number;
  nom: string;
  type: TypeOrganisme;
  nombrePrisesEnCharge: number;
  totalPrisEnCharge: number;
  nonFacture: number;
  factureEnAttente: number;
  paye: number;
}

export interface FactureOrganisme {
  id: number;
  numero: string;
  organisme: Organisme;
  periodeDebut: string;
  periodeFin: string;
  dateEmission: string;
  montantTotal: number;
  statut: StatutFacture;
  modePaiement?: ModePaiement;
  datePaiement?: string;
  observations?: string;
  creeParNom?: string;
  nombreLignes: number;
  lignes: Encaissement[];
}

export interface FactureOrganismeRequest {
  organismeId: number;
  periodeDebut: string;
  periodeFin: string;
  observations?: string;
}
