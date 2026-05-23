type CoffeeAnalysis = {
  qualityScore: number;
  exportReady: boolean;
  defects: {
    brokenBeans: number;
    discoloration: number;
    moldRisk: number;
    unevenRoast: number;
  };
};

type Decision = {
  option: string;
  profit: number;
  risk: number;
  timeCost: number;
  confidence: number;
  reasoning: string;
  score: number;
};

function calculateDefectRate(defects: CoffeeAnalysis["defects"]) {
  return (
    (defects.brokenBeans +
      defects.discoloration +
      defects.moldRisk +
      defects.unevenRoast) /
    4
  );
}

function score(decision: Omit<Decision, "score">) {
  return decision.profit * decision.confidence - (decision.risk + decision.timeCost);
}

export function generateDecisions(data: CoffeeAnalysis): Decision[] {
  const defectRate = calculateDefectRate(data.defects);
  const baseQuality = data.qualityScore;

  const decisions: Omit<Decision, "score">[] = [
    {
      option: "Export Immediately",
      profit: baseQuality > 80 ? 90 : 60,
      risk: defectRate > 50 ? 85 : 40,
      timeCost: 10,
      confidence: 70,
      reasoning:
        "Fast export option but risk depends on defect severity and quality score",
    },
    {
      option: "Re-sort Beans",
      profit: 85,
      risk: 30,
      timeCost: 50,
      confidence: 90,
      reasoning:
        "Sorting removes defective beans and significantly improves export grade",
    },
    {
      option: "Re-roast Batch",
      profit: 95,
      risk: 60,
      timeCost: 80,
      confidence: 75,
      reasoning:
        "Reprocessing improves quality but increases cost and time",
    },
  ];

  return decisions
    .map((d) => ({
      ...d,
      score: score(d),
    }))
    .sort((a, b) => b.score - a.score);
}