import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {SafeResourceUrl, DomSanitizer} from '@angular/platform-browser';
import {ProfileService} from '../../../core/auth/profile.service';
import {ButtonComponent} from '../button/button';
import {LucideUpload} from '@lucide/angular';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.html',

    imports: [
        ButtonComponent,
        LucideUpload
    ]
})
export class AvatarComponent {
    _avatarUrl = signal<SafeResourceUrl | undefined>(undefined);
    uploading = signal(false);
    loading = signal(false);

    @Input()
    set avatarUrl(url: string | null) {
        if (url) {
            this.downloadImage(url);
        }
    }

    @Output() upload = new EventEmitter<string>();

    constructor(
        private profileService: ProfileService,
        private readonly dom: DomSanitizer
    ) {
    }

    async downloadImage(path: string) {
        try {
            this.loading.set(true);
            const {data} = await this.profileService.downLoadImage(path);
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

    async uploadAvatar(event: any) {
        try {
            this.uploading.set(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${Math.random()}.${fileExt}`;

            await this.profileService.uploadAvatar(filePath, file);
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
