import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComptabiliteService } from '../../core/services/comptabilite.service';
import { RouterLink } from '@angular/router';
import { BarChartComponent, SerieGraphique } from '../../shared/bar-chart/bar-chart.component';
import { BilanPeriode, ComptabiliteResume, Encaissement, PaiementEmploye, PeriodeBilan } from '../../core/models/comptabilite.model';

@Component({
  selector: 'app-comptabilite', standalone: true, imports: [CommonModule, FormsModule, RouterLink, BarChartComponent],
  template: `
    <h4><i class="bi bi-calculator"></i> Comptabilité & employés</h4>
    <div class="row g-3 my-2" *ngIf="resume">
      <div class="col-6 col-md-3"><div class="card p-3"><small class="text-muted">Total recettes</small><strong class="fs-5">{{ resume.totalRecettes | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-6 col-md-3"><div class="card p-3"><small class="text-muted">Paiements employés</small><strong class="fs-5">{{ resume.totalPaiementsEmployes | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-6 col-md-3"><div class="card p-3"><small class="text-muted">Solde</small><strong class="fs-5">{{ resume.solde | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-6 col-md-3"><div class="card p-3"><small class="text-muted">Encaissé aujourd'hui</small><strong class="fs-5">{{ resume.encaissementsAujourdhui | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-6 col-md-3"><div class="card p-3"><small class="text-muted">Payé par les patients</small><strong>{{ resume.totalPartPatients | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-6 col-md-3"><div class="card p-3"><small class="text-muted">Pris en charge assurances / IPM</small><strong>{{ resume.totalPartOrganismes | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-6 col-md-3"><a routerLink="/organismes" class="card p-3 text-decoration-none"><small class="text-muted">Créances organismes à encaisser</small><strong class="text-dark">{{ resume.creancesOrganismesEnAttente | number:'1.0-0' }} FCFA</strong></a></div>
      <div class="col-6 col-md-3"><div class="card p-3"><small class="text-muted">Factures (hors annulées)</small><strong>{{ resume.totalFactures | number:'1.0-0' }} FCFA</strong></div></div>
    </div>

    <div class="card p-3 mb-3">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h6 class="mb-0">Bilan</h6>
        <div class="d-flex gap-2 flex-wrap">
          <div class="btn-group btn-group-sm" role="group" aria-label="Période">
            <button type="button" class="btn" *ngFor="let p of periodes" (click)="changerPeriode(p.code)"
                    [class.btn-primary]="periode === p.code" [class.btn-light]="periode !== p.code" [class.border]="periode !== p.code">{{ p.libelle }}</button>
          </div>
          <select class="form-select form-select-sm w-auto" [(ngModel)]="annee" (change)="chargerBilan()">
            <option *ngFor="let a of annees" [ngValue]="a">{{ periode === 'ANNEE' ? (a - 4) + '–' + a : a }}</option>
          </select>
        </div>
      </div>
      <div class="row g-3 mb-3" *ngIf="bilan.length">
        <div class="col-6 col-md-3"><small class="text-muted d-block">Recettes {{ libellePeriodeTotale }}</small><strong class="fs-5">{{ totalBilan('totalRecettes') | number:'1.0-0' }}</strong></div>
        <div class="col-6 col-md-3"><small class="text-muted d-block">Dépenses</small><strong class="fs-5">{{ totalBilan('depenses') | number:'1.0-0' }}</strong></div>
        <div class="col-6 col-md-3"><small class="text-muted d-block">Solde</small><strong class="fs-5">{{ totalBilan('solde') | number:'1.0-0' }}</strong></div>
        <div class="col-6 col-md-3"><small class="text-muted d-block">Actes à l'accueil</small><strong class="fs-5">{{ totalBilan('nombreActes') }}</strong></div>
      </div>
      <div class="row g-4">
        <div class="col-xl-6">
          <app-bar-chart titre="Recettes par origine" sousTitre="FCFA, à la date de l'acte" [empile]="true"
                         [libelles]="libellesBilan" [series]="seriesRecettes" />
        </div>
        <div class="col-xl-6">
          <app-bar-chart titre="Solde (recettes − dépenses)" sousTitre="FCFA ; dépenses = paiements des employés"
                         [libelles]="libellesBilan" [series]="seriesSolde" [infos]="infosSolde" />
        </div>
      </div>
    </div>

    <div class="card p-3 mb-3">
      <h6>Encaissements à l'accueil (consultations & rendez-vous)</h6>
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead><tr><th>Date</th><th>Patient</th><th>Type</th><th>Médecin</th><th>Prise en charge</th><th>Enregistré par</th>
            <th class="text-end">Montant</th><th class="text-end">Part patient</th><th class="text-end">Part organisme</th></tr></thead>
          <tbody>
            <tr *ngFor="let e of encaissements">
              <td>{{ e.dateEncaissement | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ e.patientNom }} <small class="text-muted">{{ e.numeroDossier }}</small></td>
              <td>
                <span class="badge" [class.bg-primary]="e.type === 'CONSULTATION'" [class.bg-info]="e.type === 'RENDEZVOUS'">
                  {{ e.type === 'CONSULTATION' ? 'Consultation' : 'Rendez-vous' }}
                </span>
                <small class="text-muted" *ngIf="e.typeConsultation"> {{ e.typeConsultation === 'SPECIALISEE' ? 'spécialisée' : 'générale' }}</small>
              </td>
              <td>{{ e.medecinNom || '-' }}</td>
              <td>{{ e.organismeNom || 'Comptant' }} <small class="text-muted" *ngIf="e.matriculeAssure">{{ e.matriculeAssure }}</small></td>
              <td>{{ e.enregistreParNom || '-' }}</td>
              <td class="text-end"><strong>{{ e.montant | number:'1.0-0' }}</strong></td>
              <td class="text-end">{{ e.partPatient | number:'1.0-0' }}</td>
              <td class="text-end">{{ e.partOrganisme | number:'1.0-0' }}</td>
            </tr>
            <tr *ngIf="encaissements.length === 0"><td colspan="9" class="text-muted text-center">Aucun encaissement enregistré.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="row g-3"><div class="col-12"><div class="card p-3">
        <h6>Historique des paiements employés</h6><div *ngFor="let p of paiements" class="border-bottom py-2">{{ p.datePaiement | date:'dd/MM/yyyy HH:mm' }} - {{ p.employeNom }} : <strong>{{ p.montant | number:'1.0-0' }} FCFA</strong> ({{ p.periode }})</div>
        <div *ngIf="paiements.length === 0" class="text-muted">Aucun paiement enregistré.</div>
      </div></div>
    </div>
  `
})
export class ComptabiliteComponent implements OnInit {
  resume?: ComptabiliteResume; paiements: PaiementEmploye[] = []; encaissements: Encaissement[] = [];
  periodes: { code: PeriodeBilan; libelle: string }[] = [
    { code: 'MOIS', libelle: 'Mensuel' }, { code: 'TRIMESTRE', libelle: '3 mois' },
    { code: 'SEMESTRE', libelle: '6 mois' }, { code: 'ANNEE', libelle: 'Annuel' }];
  periode: PeriodeBilan = 'MOIS';
  annee = new Date().getFullYear();
  annees = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  bilan: BilanPeriode[] = [];
  libellesBilan: string[] = [];
  seriesRecettes: SerieGraphique[] = [];
  seriesSolde: SerieGraphique[] = [];
  infosSolde: SerieGraphique[] = [];
  constructor(private service: ComptabiliteService) {}
  ngOnInit(): void { this.charger(); this.chargerBilan(); }
  changerPeriode(p: PeriodeBilan): void { this.periode = p; this.chargerBilan(); }
  get libellePeriodeTotale(): string { return this.periode === 'ANNEE' ? `${this.annee - 4}–${this.annee}` : String(this.annee); }
  totalBilan(champ: 'totalRecettes' | 'depenses' | 'solde' | 'nombreActes'): number { return this.bilan.reduce((s, b) => s + b[champ], 0); }
  chargerBilan(): void {
    this.service.bilan(this.periode, this.annee).subscribe(b => {
      this.bilan = b;
      this.libellesBilan = b.map(x => x.libelle);
      // Couleurs catégorielles validées (ordre fixe) : patients, organismes, factures
      this.seriesRecettes = [
        { nom: 'Payé par les patients', couleur: '#2a78d6', valeurs: b.map(x => x.recettesPatients) },
        { nom: 'Assurances / IPM', couleur: '#eb6834', valeurs: b.map(x => x.recettesOrganismes) },
        { nom: 'Factures', couleur: '#1baf7a', valeurs: b.map(x => x.recettesFactures) }];
      this.seriesSolde = [{ nom: 'Solde', couleur: '#4a3aa7', valeurs: b.map(x => x.solde) }];
      this.infosSolde = [
        { nom: 'Recettes', valeurs: b.map(x => x.totalRecettes) },
        { nom: 'Dépenses', valeurs: b.map(x => x.depenses) }];
    });
  }
  charger(): void { this.service.resume().subscribe(r => this.resume = r); this.service.paiements().subscribe(p => this.paiements = p); this.service.encaissements().subscribe(e => this.encaissements = e); }
}