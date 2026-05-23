export type CoffeeGrade = "A" | "B" | "C";

export type DefectProfile = {
  brokenBeans: number;
  discoloration: number;
  moldRisk: number;
  unevenRoast: number;
};

export type AnalysisResult = {
  qualityScore: number;
  grade: CoffeeGrade;
  exportReady: boolean;
  recommendation: string;
  defects: DefectProfile;
  timestamp: string;
};

export const defectLabels: Record<keyof DefectProfile, string> = {
  brokenBeans: "Broken Beans",
  discoloration: "Discoloration",
  moldRisk: "Mold Risk",
  unevenRoast: "Uneven Roast",
};

export function clampPercent(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(number)));
}

export function normalizeAnalysis(input: Partial<AnalysisResult>): AnalysisResult {
  const score = clampPercent(input.qualityScore);
  const grade =
    input.grade === "A" || input.grade === "B" || input.grade === "C"
      ? input.grade
      : score >= 82
        ? "A"
        : score >= 65
          ? "B"
          : "C";

  return {
    qualityScore: score,
    grade,
    exportReady:
      typeof input.exportReady === "boolean"
        ? input.exportReady
        : score >= 78 && grade !== "C",
    recommendation:
      typeof input.recommendation === "string" && input.recommendation.trim()
        ? input.recommendation.trim()
        : "Improve sorting consistency, remove visible defects, and retest the lot before export documentation.",
    defects: {
      brokenBeans: clampPercent(input.defects?.brokenBeans),
      discoloration: clampPercent(input.defects?.discoloration),
      moldRisk: clampPercent(input.defects?.moldRisk),
      unevenRoast: clampPercent(input.defects?.unevenRoast),
    },
    timestamp: input.timestamp ?? new Date().toISOString(),
  };
}
