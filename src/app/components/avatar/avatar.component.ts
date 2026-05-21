import {Component, EventEmitter, Input, Output, signal, inject} from '@angular/core';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import {ProfileService} from '../../features/profile/profile.service';
import {ButtonComponent} from '../button/button.component';
import {LucideLoader, LucideUpload} from '@lucide/angular';
import {AuthStateService} from '../../features/auth/auth-state.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    imports: [
        ButtonComponent,
        LucideUpload,
        LucideLoader
    ]
})
export class AvatarComponent {
    private profileService = inject(ProfileService);
    private readonly dom = inject(DomSanitizer);
    private authStateService = inject(AuthStateService);

    _avatarUrl = signal<SafeResourceUrl | undefined>(undefined);
    uploading = signal(false);
    loading = signal(false);

    @Input()
    set avatarUrl(url: string | null) {
        if (url) {
            this.downloadImage(url);
        }
    }

    @Input() oldAvatarUrl: string | null = null;
    @Output() upload = new EventEmitter<string>();

    async downloadImage(path: string) {
        const user = this.authStateService.getCurrentUser();
        if (!user?.id) {
            throw new Error('User not authenticated.');
        }

        try {
            this.loading.set(true);
            const {data} = await this.profileService.downLoadImage(path, user.id);
            if (data instanceof Blob) {
                this._avatarUrl.set(this.dom.bypassSecurityTrustResourceUrl(URL.createObjectURL(data)));
            }
            this.loading.set(false);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error downloading image: ', error.message);
            }
        }
    }

    async uploadAvatar(event: Event) {
        const user = this.authStateService.getCurrentUser();
        if (!user?.id) {
            throw new Error('User not authenticated.');
        }

        try {
            this.uploading.set(true);
            const input = event.target as HTMLInputElement;
            if (!input.files || input.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = input.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${Math.random()}.${fileExt}`;

            await this.profileService.uploadAvatar(filePath, file, user.id, this.oldAvatarUrl || undefined);
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
