import {Injectable} from '@angular/core';

interface ImageOptimizationOptions {
    maxSize?: number;
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
        maxSize: number,
        cropToSquare = false
    ): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        let {width, height} = img;

        if (width > maxSize || height > maxSize) {
            const ratio = maxSize / Math.min(width, height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Impossible d\'obtenir le contexte canvas');
        }

        ctx.drawImage(img, 0, 0, width, height);

        if (cropToSquare) {
            const canvas2 = document.createElement('canvas');

            let offsetX = 0;
            let offsetY = 0;

            if (width > maxSize) offsetX = Math.max(0, (width - maxSize) / 2);
            if (height > maxSize) offsetY = Math.max(0, (height - maxSize) / 2);

            canvas2.width = maxSize;
            canvas2.height = maxSize;

            const ctx2 = canvas2.getContext('2d');
            if (!ctx2) {
                throw new Error('Impossible d\'obtenir le contexte canvas2');
            }

            ctx2.drawImage(canvas, offsetX, offsetY, maxSize, maxSize, 0, 0, maxSize, maxSize);

            return canvas2;
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
            maxSize = 600,
            quality = 0.8,
            format = 'webp',
            cropToSquare = true
        } = options;

        const img = await this.loadImage(file);
        const canvas = this.resizeImageOnCanvas(img, maxSize, cropToSquare);
        const blob = await this.canvasToBlob(canvas, format, quality);

        return new File(
            [blob],
            `${file.name.split('.')[0]}.${format}`,
            {type: `image/${format}`}
        );
    }

    async createPreview(
        file: File,
        maxSize = 200
    ): Promise<string> {
        const img = await this.loadImage(file);
        const canvas = this.resizeImageOnCanvas(img, maxSize);
        return canvas.toDataURL('image/webp', 0.8);
    }
}
