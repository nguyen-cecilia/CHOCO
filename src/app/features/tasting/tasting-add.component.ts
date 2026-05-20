import {Component, OnInit, signal} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import {User} from '@supabase/supabase-js';
import {AuthStateService} from '../auth/auth-state.service';
import {ButtonComponent} from '../../components/button/button.component';
import {LucideSave, LucideUpload} from '@lucide/angular';
import {AlertComponent} from '../../components/alert/alert.component';
import {ViewportScroller} from '@angular/common';
import {TastingService} from './tasting.service';
import {dependantFieldValidator} from '../../core/validators/dependant-field.directive';

@Component({
    selector: 'app-tastings-add',
    imports: [
        ReactiveFormsModule,
        ButtonComponent,
        LucideUpload,
        LucideSave,
        AlertComponent
    ],
    templateUrl: './tasting-add.component.html',
})
export class TastingAddComponent implements OnInit {
    tastingAddForm: FormGroup;
    loading = signal(false);
    error = signal<string | null>(null);
    success = signal<string | null>(null);
    user: User | null = null;

    noteOptions = [
        {value: 0, label: '0'},
        {value: 1, label: '1'},
        {value: 2, label: '2'},
        {value: 3, label: '3'},
        {value: 4, label: '4'},
        {value: 5, label: '5'},
        {value: 6, label: '6'},
        {value: 7, label: '7'},
        {value: 8, label: '8'},
        {value: 9, label: '9'},
        {value: 10, label: '10'},
    ];

    chocoIntensityOptions = [
        {value: 1, label: 'Faible'},
        {value: 2, label: 'Moyen'},
        {value: 3, label: 'Fort'},
    ];

    chocoQualityOptions = [
        {value: 1, label: 'Artisanal'},
        {value: 2, label: 'Entre les deux'},
        {value: 3, label: 'Industriel'},
    ];

    chocoBalanceOptions = [
        {value: 1, label: '1'},
        {value: 2, label: '2'},
        {value: 3, label: '3'},
        {value: 4, label: '4'},
        {value: 5, label: '5'},
    ];

    constructor(
        private authStateService: AuthStateService,
        private tastingService: TastingService,
        private fb: FormBuilder,
        private viewportScroller: ViewportScroller,
    ) {
        this.tastingAddForm = this.fb.group({
            cafeName: ['', [Validators.required, Validators.minLength(2)]],
            cafeLocation: [''],
            price: ['', [Validators.min(0)]],
            priceCurrency: ['', [dependantFieldValidator('price')]],
            note: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
            chocoIntensity: [''],
            chocoQuality: [''],
            chocoBalance: ['', [Validators.min(0), Validators.max(10)]],
            comment: [''],
            pictureUrl: [''],
        });

        this.price?.valueChanges.subscribe(() => {
            this.priceCurrency?.updateValueAndValidity();
        });
    }

    async ngOnInit() {
        this.user = this.authStateService.getCurrentUser();
    }

    async updateTasting() {
        Object.keys(this.tastingAddForm.controls).forEach(key => {
            this.tastingAddForm.get(key)?.markAsTouched();
        });

        if (!this.tastingAddForm.valid || !this.user) {
            this.success.set(null);
            this.error.set('Veuillez vérifier les champs du formulaire.');
            this.viewportScroller.scrollToPosition([0, 0]);
            return;
        }

        try {
            this.error.set(null);
            this.success.set(null);
            this.loading.set(true);

            const tastingData = this.tastingAddForm.getRawValue();

            await this.tastingService.upsertTasting({
                cafe_name: tastingData.cafeName,
                cafe_location: tastingData.cafeLocation || null,
                price: tastingData.price ? Number(tastingData.price) : null,
                price_currency: tastingData.price ? tastingData.priceCurrency : null,
                note: tastingData.note,
                choco_intensity: tastingData.chocoIntensity ? Number(tastingData.chocoIntensity) : null,
                choco_quality: tastingData.chocoQuality ? Number(tastingData.chocoQuality) : null,
                choco_balance: tastingData.chocoBalance ? Number(tastingData.chocoBalance) : null,
                comment: tastingData.comment || null,
                picture_url: null,
                user_id: this.user.id,
            });

            this.success.set('Dégustation ajoutée !');
            this.viewportScroller.scrollToPosition([0, 0]);
        } catch (error) {
            this.error.set('Erreur lors de l\'ajout de la dégustation.');
            console.error('Erreur:', error);
        } finally {
            this.loading.set(false);
        }
    }

    formError(fieldName: string) {
        const field = this.tastingAddForm.get(fieldName);
        return field?.invalid && field?.touched;
    }

    get price() {
        return this.tastingAddForm.get('price')
    }

    get priceCurrency() {
        return this.tastingAddForm.get('priceCurrency')
    }
}
