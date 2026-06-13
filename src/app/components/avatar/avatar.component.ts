import {Component, EventEmitter, Input, Output, signal, inject, OnChanges, SimpleChanges} from '@angular/core';
import {ProfileService} from '../../features/profile/profile.service';
import {ButtonComponent} from '../button/button.component';
import {LucideImage, LucideLoader, LucideUpload} from '@lucide/angular';
import {User} from '@supabase/supabase-js';
import {ImageOptimizerService} from '../../core/image-optimizer.service';
import {NgOptimizedImage} from '@angular/common';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    imports: [
        ButtonComponent,
        LucideUpload,
        LucideLoader,
        LucideImage,
        NgOptimizedImage
    ]
})
export class AvatarComponent implements OnChanges {
    private profileService = inject(ProfileService);
    private imageOptimizerService = inject(ImageOptimizerService);

    _avatarUrl = signal<string>('');
    oldAvatarUrl = signal<string | null>(null);
    uploading = signal(false);
    loading = signal(false);

    @Input() avatarUrl: string | null = null;
    @Input() user: User | null = null;
    @Output() upload = new EventEmitter<string>();

    async ngOnChanges(changes: SimpleChanges<AvatarComponent>) {
        if (changes['avatarUrl']) {
            const url = changes['avatarUrl'].currentValue;
            this.oldAvatarUrl.set(url);
            if (url) {
                await this.downloadImage(url);
            }
        }
    }

    async downloadImage(path: string) {
        if (!this.user) {
            throw new Error('User not authenticated.');
        }

        try {
            this.loading.set(true);

            if (path && this.user) {
                const url = await this.profileService.getAvatarUrl(path, this.user.id);
                this._avatarUrl.set(url || '');
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error downloading image: ', error.message);
            }
        } finally {
            this.loading.set(false);
        }
    }

    async uploadAvatar(event: Event) {
        if (!this.user) {
            throw new Error('User not authenticated.');
        }

        try {
            this.uploading.set(true);
            const input = event.target as HTMLInputElement;

            if (!input.files || input.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            let file = input.files[0];

            file = await this.imageOptimizerService.optimizeImage(file, {
                maxSize: 300,
                quality: 0.8,
                format: 'webp',
                cropToSquare: true
            });

            const fileExt = file.name.split('.').pop();
            const filePath = `${Math.random()}.${fileExt}`;

            await this.profileService.uploadAvatar(filePath, file, this.user.id, this.oldAvatarUrl());
            this.upload.emit(filePath);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            }
        } finally {
            this.uploading.set(false);
        }
    }
}
