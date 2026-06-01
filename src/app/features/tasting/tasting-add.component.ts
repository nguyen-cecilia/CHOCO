import {Component, OnInit, signal, inject, ViewChild, ElementRef} from '@angular/core';
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
    private authStateService = inject(AuthStateService);
    private tastingService = inject(TastingService);
    private fb = inject(FormBuilder);
    private viewportScroller = inject(ViewportScroller);

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    tastingAddForm: FormGroup;
    loading = signal(false);
    error = signal<string | null>(null);
    success = signal<string | null>(null);
    user: User | null = null;
    selectedFile = signal<File | null>(null);
    previewImage = signal<string | null>(null);

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

    constructor() {
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

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            if (!file.type.startsWith('image/')) {
                this.error.set('Veuillez sélectionner une image valide.');
                return;
            }

            this.selectedFile.set(file);

            const reader = new FileReader();
            reader.onload = () => {
                this.previewImage.set(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    triggerFileInput() {
        this.fileInput.nativeElement.click();
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
            let pictureUrl: string | null = null;

            if (this.selectedFile()) {
                const file = this.selectedFile()!;
                const fileExt = file.name.split('.').pop();
                const filePath = `${Math.random()}.${fileExt}`;

                pictureUrl = await this.tastingService.uploadTastingPicture(
                    filePath,
                    file,
                    this.user.id,
                );
            }

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
                picture_url: pictureUrl,
                user_id: this.user.id,
            });

            this.success.set('Dégustation ajoutée !');
            this.viewportScroller.scrollToPosition([0, 0]);
            this.resetForm();
        } catch (error) {
            this.error.set('Erreur lors de l\'ajout de la dégustation.');
            console.error('Erreur:', error);
        } finally {
            this.loading.set(false);
        }
    }

    resetForm() {
        this.tastingAddForm.reset();
        this.selectedFile.set(null);
        this.previewImage.set(null);
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
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
