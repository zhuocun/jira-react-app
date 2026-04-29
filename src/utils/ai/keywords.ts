const STOPWORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "was",
    "were",
    "with",
    "this",
    "these",
    "those",
    "i",
    "we",
    "you",
    "they",
    "but",
    "if",
    "then",
    "so"
]);

export const tokenize = (input: string): string[] => {
    return (input || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
};

export const tokenSet = (input: string): Set<string> =>
    new Set(tokenize(input));

export const jaccard = (a: Set<string>, b: Set<string>): number => {
    if (a.size === 0 && b.size === 0) return 0;
    let intersection = 0;
    a.forEach((token) => {
        if (b.has(token)) intersection += 1;
    });
    const union = a.size + b.size - intersection;
    return union === 0 ? 0 : intersection / union;
};
