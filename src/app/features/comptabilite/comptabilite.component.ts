import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComptabiliteService } from '../../core/services/comptabilite.service';
import { ComptabiliteResume, Encaissement, PaiementEmploye } from '../../core/models/comptabilite.model';
import { Utilisateur } from '../../core/models/user.model';

@Component({
  selector: 'app-comptabilite', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <h4><i class="bi bi-calculator"></i> Comptabilité & employés</h4>
    <div class="row g-3 my-2" *ngIf="resume">
      <div class="col-md-3"><div class="card p-3"><small>Total recettes</small><strong>{{ resume.totalRecettes | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-md-3"><div class="card p-3"><small>Encaissements du jour</small><strong>{{ resume.encaissementsAujourdhui | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-md-3"><div class="card p-3"><small>Paiements employés</small><strong>{{ resume.totalPaiementsEmployes | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-md-3"><div class="card p-3"><small>Solde</small><strong>{{ resume.solde | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-md-3"><div class="card p-3"><small>Accueil — consultations</small><strong>{{ resume.encaissementsConsultations | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-md-3"><div class="card p-3"><small>Accueil — rendez-vous</small><strong>{{ resume.encaissementsRendezVous | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-md-3"><div class="card p-3"><small>Factures consultations</small><strong>{{ resume.totalConsultations | number:'1.0-0' }} FCFA</strong></div></div>
      <div class="col-md-3"><div class="card p-3"><small>Factures hospitalisations</small><strong>{{ resume.totalHospitalisations | number:'1.0-0' }} FCFA</strong></div></div>
    </div>
    <div class="card p-3 mb-3">
      <h6>Encaissements à l'accueil (consultations & rendez-vous)</h6>
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead><tr><th>Date</th><th>Patient</th><th>Type</th><th>Médecin</th><th>Enregistré par</th><th class="text-end">Montant</th></tr></thead>
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
              <td>{{ e.enregistreParNom || '-' }}</td>
              <td class="text-end"><strong>{{ e.montant | number:'1.0-0' }} FCFA</strong></td>
            </tr>
            <tr *ngIf="encaissements.length === 0"><td colspan="6" class="text-muted text-center">Aucun encaissement enregistré.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="row g-3"><div class="col-12"><div class="card p-3"><h6>Effectuer un paiement</h6>
        <select class="form-select mb-2" [(ngModel)]="paiement.employeId"><option [ngValue]="null">-- Employé --</option><option *ngFor="let e of employes" [ngValue]="e.id">{{ e.prenom }} {{ e.nom }} - {{ e.profession || e.role }}</option></select>
        <input class="form-control mb-2" type="number" placeholder="Montant FCFA" [(ngModel)]="paiement.montant">
        <input class="form-control mb-2" placeholder="Période (ex: Septembre 2026)" [(ngModel)]="paiement.periode">
        <input class="form-control mb-2" placeholder="Motif" [(ngModel)]="paiement.motif">
        <button class="btn btn-success" (click)="payer()">Enregistrer le paiement</button>
        <hr><h6>Historique traçable</h6><div *ngFor="let p of paiements" class="border-bottom py-2">{{ p.datePaiement | date:'dd/MM/yyyy HH:mm' }} - {{ p.employeNom }} : <strong>{{ p.montant | number:'1.0-0' }} FCFA</strong> ({{ p.periode }})</div>
      </div></div>
    </div>
  `
})
export class ComptabiliteComponent implements OnInit {
  resume?: ComptabiliteResume; employes: Utilisateur[] = []; paiements: PaiementEmploye[] = []; encaissements: Encaissement[] = [];
  nouveau: any = { role: 'EMPLOYE', actif: true }; paiement: any = {};
  constructor(private service: ComptabiliteService) {}
  ngOnInit(): void { this.charger(); }
  charger(): void { this.service.resume().subscribe(r => this.resume = r); this.service.employes().subscribe(e => this.employes = e); this.service.paiements().subscribe(p => this.paiements = p); this.service.encaissements().subscribe(e => this.encaissements = e); }
  creerEmploye(): void { this.service.creerEmploye(this.nouveau).subscribe(() => { this.nouveau = { role: 'EMPLOYE', actif: true }; this.charger(); }); }
  payer(): void { this.service.payer(this.paiement).subscribe(() => { this.paiement = {}; this.charger(); }); }
}