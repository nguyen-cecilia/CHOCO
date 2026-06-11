import {Injectable} from '@angular/core';

interface ImageOptimizationOptions {
    maxWidth?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    cropToSquare?: boolean;
}

@Injectable({providedIn: 'root'})
export class ImageOptimizerService {
    private loadImage(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Impossible de charger l\'image'));
                img.src = event.target?.result as string;
            };

            reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
            reader.readAsDataURL(file);
        });
    }

    private resizeImageOnCanvas(
        img: HTMLImageElement,
        maxWidth: number,
        cropToSquare = false
    ): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        let {width, height} = img;

        if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = Math.round(height * ratio);
        }

        if (cropToSquare) {
            const size = Math.min(width, height);
            const offsetX = (width - size) / 2;
            const offsetY = (height - size) / 2;

            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Impossible d\'obtenir le contexte canvas');
            }

            ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
        } else {
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Impossible d\'obtenir le contexte canvas');
            }

            ctx.drawImage(img, 0, 0, width, height);
        }

        return canvas;
    }

    private canvasToBlob(
        canvas: HTMLCanvasElement,
        format: 'webp' | 'jpeg' | 'png',
        quality: number
    ): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Impossible de créer le blob'));
                        return;
                    }
                    resolve(blob);
                },
                `image/${format}`,
                quality
            );
        });
    }

    async optimizeImage(
        file: File,
        options: ImageOptimizationOptions = {}
    ): Promise<File> {
        const {
            maxWidth = 800,
            quality = 0.8,
            format = 'webp',
            cropToSquare = true
        } = options;

        const img = await this.loadImage(file);
        const canvas = this.resizeImageOnCanvas(img, maxWidth, cropToSquare);
        const blob = await this.canvasToBlob(canvas, format, quality);

        return new File(
            [blob],
            `${file.name.split('.')[0]}.${format}`,
            {type: `image/${format}`}
        );
    }

    async createPreview(
        file: File,
        maxWidth = 400
    ): Promise<string> {
        const img = await this.loadImage(file);
        const canvas = this.resizeImageOnCanvas(img, maxWidth);
        return canvas.toDataURL('image/webp', 0.8);
    }
}
