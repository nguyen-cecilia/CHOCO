import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ColorService {
    getColorsByNote(note: number): { border: string; bg: string } {
        if (note <= 2) {
            return {border: 'border-pink', bg: 'from-yellow to-yellow/50'};
        } else if (note <= 5) {
            return {border: 'border-orange', bg: 'from-purple-light to-purple-light/50'};
        } else if (note <= 8) {
            return {border: 'border-yellow', bg: 'from-blue-light to-blue-light/50'};
        } else {
            return {border: 'border-blue-light', bg: 'from-green to-green/50'};
        }
    }
}
