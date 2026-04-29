export const FIBONACCI_POINTS: StoryPoints[] = [1, 2, 3, 5, 8, 13];

export const clampToFibonacci = (value: number): StoryPoints => {
    if (!Number.isFinite(value) || value <= 1) return 1;
    let best: StoryPoints = FIBONACCI_POINTS[0];
    let bestDistance = Math.abs(value - best);
    for (const candidate of FIBONACCI_POINTS) {
        const distance = Math.abs(value - candidate);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = candidate;
        }
    }
    return best;
};
