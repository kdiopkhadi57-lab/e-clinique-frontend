import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { Utilisateur } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="mb-3">
      <i class="bi bi-person-lines-fill"></i>
      {{ patientId ? 'Modifier le patient' : 'Nouveau patient' }}
    </h4>

    <div class="card p-4">
      <form [formGroup]="form" (ngSubmit)="enregistrer()">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nom *</label>
            <input class="form-control" formControlName="nom">
          </div>
          <div class="col-md-6">
            <label class="form-label">Prénom *</label>
            <input class="form-control" formControlName="prenom">
          </div>
          <div class="col-md-4">
            <label class="form-label">Date de naissance</label>
            <input type="date" class="form-control" formControlName="dateNaissance">
          </div>
          <div class="col-md-4">
            <label class="form-label">Sexe</label>
            <select class="form-select" formControlName="sexe">
              <option value="">-- Choisir --</option>
              <option value="HOMME">Homme</option>
              <option value="FEMME">Femme</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Groupe sanguin</label>
            <select class="form-select" formControlName="groupeSanguin">
              <option value="">-- Inconnu --</option>
              <option *ngFor="let g of groupesSanguins" [value]="g">{{ g }}</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Téléphone</label>
            <input class="form-control" formControlName="telephone" placeholder="+221 77 123 45 67">
            <div class="invalid-feedback d-block" *ngIf="form.controls.telephone.touched && form.controls.telephone.invalid">
              Numéro de téléphone invalide.
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" placeholder="patient@exemple.com">
            <div class="invalid-feedback d-block" *ngIf="form.controls.email.touched && form.controls.email.invalid">
              Adresse email invalide.
            </div>
          </div>
          <div class="col-12">
            <label class="form-label">Adresse</label>
            <input class="form-control" formControlName="adresse">
          </div>
          <div class="col-md-6">
            <label class="form-label">Allergies</label>
            <textarea class="form-control" rows="2" formControlName="allergies"></textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label">Antécédents médicaux</label>
            <textarea class="form-control" rows="2" formControlName="antecedentsMedicaux"></textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label">Personne à contacter</label>
            <input class="form-control" formControlName="personneAContacter">
          </div>
          <div class="col-md-6">
            <label class="form-label">Téléphone personne à contacter</label>
            <input class="form-control" formControlName="telephonePersonneAContacter" placeholder="+221 77 123 45 67">
            <div class="invalid-feedback d-block" *ngIf="form.controls.telephonePersonneAContacter.touched && form.controls.telephonePersonneAContacter.invalid">
              Numéro de téléphone invalide.
            </div>
          </div>
          <div class="col-12 border-top pt-3" *ngIf="!patientId">
            <h6 class="text-primary">Suite à donner au patient</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Dossier concerné par {{ suiteObligatoire ? '*' : '' }}</label>
                <select class="form-select" formControlName="suite" (change)="majMontantParDefaut()">
                  <option value="">{{ suiteObligatoire ? '-- Choisir --' : '-- Aucune --' }}</option>
                  <option value="CONSULTATION">Une consultation</option>
                  <option value="RENDEZVOUS">Un rendez-vous</option>
                </select>
              </div>
              <div class="col-md-6" *ngIf="form.controls.suite.value">
                <label class="form-label">Médecin concerné *</label>
                <select class="form-select" formControlName="medecinId">
                  <option value="">-- Choisir un médecin --</option>
                  <option *ngFor="let medecin of medecins" [value]="medecin.id">Dr. {{ medecin.prenom }} {{ medecin.nom }}</option>
                </select>
              </div>
              <ng-container *ngIf="form.controls.suite.value === 'RENDEZVOUS'">
                <div class="col-md-6">
                  <label class="form-label">Date et heure du rendez-vous *</label>
                  <input type="datetime-local" class="form-control" formControlName="dateHeure">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Durée (minutes)</label>
                  <input type="number" class="form-control" formControlName="dureeMinutes">
                </div>
                <div class="col-md-9">
                  <label class="form-label">Motif du rendez-vous</label>
                  <input class="form-control" formControlName="motifRendezVous">
                </div>
              </ng-container>
              <div class="col-md-6" *ngIf="form.controls.suite.value === 'CONSULTATION'">
                <label class="form-label">Type de consultation *</label>
                <select class="form-select" formControlName="typeConsultation" (change)="majMontantParDefaut()">
                  <option value="GENERALE">Consultation générale - 5 000 FCFA</option>
                  <option value="SPECIALISEE">Consultation spécialisée - 10 000 FCFA</option>
                </select>
              </div>
              <div class="col-md-6" *ngIf="form.controls.suite.value">
                <label class="form-label">
                  Montant {{ form.controls.suite.value === 'RENDEZVOUS' ? 'du rendez-vous' : 'de la consultation' }} (FCFA) *
                </label>
                <input type="number" min="0" class="form-control" formControlName="montant">
                <div class="invalid-feedback d-block" *ngIf="form.controls.montant.touched && form.controls.montant.invalid">
                  Montant obligatoire et positif.
                </div>
              </div>
            </div>
            <div class="text-muted small mt-2" *ngIf="form.controls.suite.value">
              Le montant sera enregistré en comptabilité. Une notification sera envoyée à l'administrateur et au médecin sélectionné.
            </div>
          </div>
        </div>

        <div class="alert alert-danger mt-3" *ngIf="erreur">{{ erreur }}</div>

        <div class="mt-4 d-flex gap-2">
          <button type="submit" class="btn btn-primary btn-save" [disabled]="form.invalid">
            <i class="bi bi-save"></i> Enregistrer
          </button>
          <button type="button" class="btn btn-outline-secondary" (click)="annuler()">Annuler</button>
        </div>
      </form>
    </div>
  `
})
export class PatientFormComponent implements OnInit {
  patientId: number | null = null;
  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  medecins: Utilisateur[] = [];
  erreur = '';

  form = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    dateNaissance: [''],
    sexe: [''],
    groupeSanguin: [''],
    telephone: ['', Validators.pattern(/^$|\+?[0-9][0-9 .()\-]{7,20}$/)],
    email: ['', Validators.email],
    adresse: [''],
    allergies: [''],
    antecedentsMedicaux: [''],
    personneAContacter: [''],
    telephonePersonneAContacter: ['', Validators.pattern(/^$|\+?[0-9][0-9 .()\-]{7,20}$/)],
    suite: [''],
    medecinId: [''],
    dateHeure: [''],
    dureeMinutes: [30],
    motifRendezVous: ['']
    ,typeConsultation: ['GENERALE']
    ,montant: [5000 as number | null, [Validators.required, Validators.min(0)]]
  });

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private utilisateurService: UtilisateurService,
    private route: ActivatedRoute,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.patientId = +idParam;
      this.patientService.findById(this.patientId).subscribe((p) => this.form.patchValue(p as any));
    }
    if (!this.patientId) {
      this.utilisateurService.findMedecins().subscribe((medecins) => (this.medecins = medecins));
    }
  }

  /** Le réceptionniste doit obligatoirement orienter le patient ; pour les autres rôles c'est facultatif. */
  get suiteObligatoire(): boolean {
    return this.auth.hasRole('RECEPTIONNISTE');
  }

  majMontantParDefaut(): void {
    const { suite, typeConsultation } = this.form.getRawValue();
    if (suite === 'CONSULTATION') {
      this.form.controls.montant.setValue(typeConsultation === 'SPECIALISEE' ? 10000 : 5000);
    }
  }

  enregistrer(): void {
    if (this.form.invalid) return;
    const donnees = this.form.getRawValue() as any;
    if (!this.patientId && this.suiteObligatoire && !donnees.suite) {
      this.erreur = 'Veuillez choisir le type de dossier (consultation ou rendez-vous).';
      return;
    }
    if (!this.patientId && donnees.suite && (!donnees.medecinId ||
      (donnees.suite === 'RENDEZVOUS' && !donnees.dateHeure))) {
      this.erreur = 'Veuillez choisir le médecin concerné' + (donnees.suite === 'RENDEZVOUS' ? ' et la date du rendez-vous.' : '.');
      return;
    }
    this.erreur = '';
    const { suite, medecinId, dateHeure, dureeMinutes, motifRendezVous, typeConsultation, montant, ...patient } = donnees;

    const operation = this.patientId
      ? this.patientService.update(this.patientId, patient)
      : this.patientService.create(patient, suite || undefined, medecinId ? Number(medecinId) : undefined,
        suite ? { type: suite === 'CONSULTATION' ? typeConsultation : undefined, montant: Number(montant) } : undefined,
        suite === 'RENDEZVOUS'
          ? { dateHeure: `${dateHeure}:00`, dureeMinutes: Number(dureeMinutes || 30), motif: motifRendezVous }
          : undefined);

    operation.subscribe({
      next: (p) => this.router.navigate(['/patients', p.id]),
      error: (err) => (this.erreur = err.error?.message || 'Erreur lors de la création du patient')
    });
  }

  annuler(): void {
    this.router.navigate(['/patients']);
  }
}
