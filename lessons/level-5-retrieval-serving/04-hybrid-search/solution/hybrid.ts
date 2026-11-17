export interface Doc {
  id: string;
  text: string;
}

export function keywordRank(docs: Doc[], query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return docs
    .map((doc, index) => {
      const text = doc.text.toLowerCase();
      return { id: doc.id, index, score: terms.filter((t) => text.includes(t)).length };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.id);
}

export function reciprocalRankFusion(rankings: string[][], k = 60): string[] {
  const score = new Map<string, number>();
  const firstSeen = new Map<string, number>();
  let order = 0;
  for (const ranking of rankings) {
    ranking.forEach((id, i) => {
      score.set(id, (score.get(id) ?? 0) + 1 / (k + i + 1));
      if (!firstSeen.has(id)) firstSeen.set(id, order++);
    });
  }
  return [...score.keys()].sort((a, b) => score.get(b)! - score.get(a)! || firstSeen.get(a)! - firstSeen.get(b)!);
}

export function hybridSearch(docs: Doc[], query: string, vectorRanking: string[], topN: number): string[] {
  return reciprocalRankFusion([keywordRank(docs, query), vectorRanking]).slice(0, topN);
}
