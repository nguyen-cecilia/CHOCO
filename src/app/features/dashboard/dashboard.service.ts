import {Injectable} from '@angular/core';
import {Tasting} from '../tasting/tasting.model';

export interface TastingStatistics {
    totalCount: number;
    averageNote: number;
    lastFiveTastings: Tasting[];
    noteDistribution: Record<string, number>;
    topThreeBest: Tasting[];
    topThreeWorst: Tasting[];
    uniqueLocations: number;
    mostTastedLocation: { location: string; count: number } | null;
    excellentPercentage: number;
}

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    calculateStatistics(tastings: Tasting[]): TastingStatistics {
        if (tastings.length === 0) {
            return {
                totalCount: 0,
                averageNote: 0,
                lastFiveTastings: [],
                noteDistribution: {},
                topThreeBest: [],
                topThreeWorst: [],
                uniqueLocations: 0,
                mostTastedLocation: null,
                excellentPercentage: 0,
            };
        }

        const totalCount = tastings.length;

        const averageNote = tastings.reduce((sum, t) => sum + t.note, 0) / totalCount;

        const lastFiveTastings = [...tastings]
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 5);

        const noteDistribution = this.calculateNoteDistribution(tastings);

        const topThreeBest = [...tastings]
            .sort((a, b) => b.note - a.note)
            .slice(0, 3);

        const topThreeWorst = [...tastings]
            .sort((a, b) => a.note - b.note)
            .slice(0, 3);

        const uniqueLocations = new Set(
            tastings.map(t => t.cafe_location).filter((loc): loc is string => !!loc)
        ).size;

        const mostTastedLocation = this.getMostTastedLocation(tastings);

        const excellentCount = tastings.filter(t => t.note >= 8).length;
        const excellentPercentage = Math.round((excellentCount / totalCount) * 100);

        return {
            totalCount,
            averageNote: Math.round(averageNote * 10) / 10,
            lastFiveTastings,
            noteDistribution,
            topThreeBest,
            topThreeWorst,
            uniqueLocations,
            mostTastedLocation,
            excellentPercentage,
        };
    }

    private calculateNoteDistribution(tastings: Tasting[]): Record<string, number> {
        const distribution = {
            '0-2': 0,
            '3-5': 0,
            '6-8': 0,
            '9-10': 0,
        };

        tastings.forEach(t => {
            if (t.note <= 2) distribution['0-2']++;
            else if (t.note <= 5) distribution['3-5']++;
            else if (t.note <= 8) distribution['6-8']++;
            else distribution['9-10']++;
        });

        return distribution;
    }

    private getMostTastedLocation(tastings: Tasting[]): { location: string; count: number } | null {
        const locationCount: Record<string, number> = {};

        tastings.forEach(t => {
            if (t.cafe_location) {
                locationCount[t.cafe_location] = (locationCount[t.cafe_location] || 0) + 1;
            }
        });

        if (Object.keys(locationCount).length === 0) {
            return null;
        }

        const mostTasted = Object.entries(locationCount).reduce((prev, current) =>
            prev[1] >= current[1] ? prev : current
        );

        return {
            location: mostTasted[0],
            count: mostTasted[1],
        };
    }
}
