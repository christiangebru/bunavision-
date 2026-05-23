/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { jsPDF } from "jspdf";
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  Download,
  FileImage,
  Gauge,
  Loader2,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AnalysisResult,
  DefectProfile,
  defectLabels,
  normalizeAnalysis,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";

const defectColors = ["#f59e0b", "#ef4444", "#22d3ee", "#a3e635"];

const sampleTrend = [
  { label: "Lot 01", score: 74 },
  { label: "Lot 02", score: 81 },
  { label: "Lot 03", score: 78 },
  { label: "Lot 04", score: 86 },
  { label: "Current", score: 0 },
];

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ElementType;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="text-xs text-zinc-500">{detail}</p>
        </div>
        <div className="grid size-10 place-items-center rounded-lg border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}

function buildDefectData(defects: DefectProfile) {
  return Object.entries(defects).map(([key, value], index) => ({
    key,
    name: defectLabels[key as keyof DefectProfile],
    value,
    fill: defectColors[index],
  }));
}

export default function AnalyzePage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setChartsReady(true));

    return () => cancelAnimationFrame(frame);
  }, []);

  const defectData = useMemo(
    () => (result ? buildDefectData(result.defects) : []),
    [result]
  );

  const trendData = useMemo(
    () =>
      sampleTrend.map((item) =>
        item.label === "Current" && result
          ? { ...item, score: result.qualityScore }
          : item
      ),
    [result]
  );

  const handleFile = (file?: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Upload a clear image file of coffee beans.");
      return;
    }

    setImage(file);
    setResult(null);
    setError(null);
    setPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return URL.createObjectURL(file);
    });
  };

  const analyzeCoffee = async () => {
    if (!image) {
      setError("Upload a coffee bean image before starting analysis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Analysis failed.");
      }

      setResult(normalizeAnalysis(data));
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Unable to complete the inspection."
      );
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!result) {
      return;
    }

    const report = new jsPDF();
    const timestamp = new Date(result.timestamp).toLocaleString();
    const readiness = result.exportReady ? "Approved for export" : "Rework required";

    report.setFillColor(13, 18, 15);
    report.rect(0, 0, 210, 40, "F");
    report.setTextColor(255, 255, 255);
    report.setFont("helvetica", "bold");
    report.setFontSize(22);
    report.text("BunaVision Coffee Inspection Report", 16, 20);
    report.setFontSize(10);
    report.setFont("helvetica", "normal");
    report.text(`Generated: ${timestamp}`, 16, 30);

    report.setTextColor(20, 20, 20);
    report.setFont("helvetica", "bold");
    report.setFontSize(16);
    report.text("Quality Summary", 16, 55);
    report.setFont("helvetica", "normal");
    report.setFontSize(12);
    report.text(`Quality score: ${result.qualityScore}/100`, 16, 68);
    report.text(`Grade: ${result.grade}`, 16, 78);
    report.text(`Export readiness: ${readiness}`, 16, 88);

    report.setFont("helvetica", "bold");
    report.text("Defect Analysis", 16, 108);
    report.setFont("helvetica", "normal");
    Object.entries(result.defects).forEach(([key, value], index) => {
      report.text(
        `${defectLabels[key as keyof DefectProfile]}: ${value}%`,
        16,
        121 + index * 10
      );
    });

    report.setFont("helvetica", "bold");
    report.text("AI Recommendation", 16, 170);
    report.setFont("helvetica", "normal");
    report.text(report.splitTextToSize(result.recommendation, 178), 16, 183);
    report.save(`bunavision-report-${Date.now()}.pdf`);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070907] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_48%),linear-gradient(135deg,rgba(245,158,11,0.12),transparent_35%),linear-gradient(315deg,rgba(34,211,238,0.12),transparent_38%)]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            BunaVision
          </Link>
          <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
            <Sparkles className="size-3" />
            Gemini Vision Inspection
          </Badge>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                AI Quality Lab
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Inspect coffee lots with export-grade AI intelligence.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-400">
                Upload a coffee bean image and BunaVision will score quality,
                detect defects, classify grade, and generate a professional PDF
                report for buyers or cooperative review.
              </p>
            </div>

            <Card className="border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
              <label
                className={cn(
                  "relative flex min-h-[360px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/15 bg-black/20 p-5 text-center transition",
                  "hover:border-emerald-300/50 hover:bg-emerald-300/[0.04]"
                )}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleFile(event.dataTransfer.files[0]);
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Uploaded coffee bean preview"
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="space-y-5">
                    <div className="mx-auto grid size-16 place-items-center rounded-lg border border-amber-300/20 bg-amber-300/10 text-amber-200">
                      <UploadCloud className="size-8" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-white">
                        Drop a coffee bean image here
                      </p>
                      <p className="mx-auto max-w-sm text-sm text-zinc-500">
                        Use a sharp overhead image with enough light to reveal
                        bean color, cracks, contamination, and roast variance.
                      </p>
                    </div>
                  </div>
                )}
                {preview && (
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/70 p-3 text-left backdrop-blur-md">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {image?.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {image ? `${(image.size / 1024 / 1024).toFixed(2)} MB` : ""}
                      </p>
                    </div>
                    <FileImage className="size-5 shrink-0 text-emerald-200" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
              </label>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={analyzeCoffee}
                  disabled={loading || !image}
                  size="lg"
                  className="h-11 flex-1 bg-emerald-300 text-zinc-950 hover:bg-emerald-200"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ScanLine className="size-4" />
                  )}
                  {loading ? "Analyzing beans" : "Run AI inspection"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={exportReport}
                  disabled={!result}
                  className="h-11 border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                >
                  <Download className="size-4" />
                  Export PDF
                </Button>
              </div>

              {loading && (
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Vision model inspecting defect patterns</span>
                    <span>Live</span>
                  </div>
                  <Progress value={68} className="bg-white/10 [&>div]:bg-cyan-300" />
                </div>
              )}

              {error && (
                <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Quality Score"
                value={result ? `${result.qualityScore}` : "--"}
                detail="AI visual confidence index"
                icon={Gauge}
              />
              <MetricCard
                label="Grade"
                value={result ? result.grade : "--"}
                detail="A, B, or C coffee lot class"
                icon={BadgeCheck}
              />
              <MetricCard
                label="Export"
                value={result ? (result.exportReady ? "Ready" : "Hold") : "--"}
                detail="Buyer documentation signal"
                icon={ShieldCheck}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <Card className="border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-zinc-400">Inspection Score</p>
                    <h2 className="text-xl font-semibold text-white">
                      Export Quality Index
                    </h2>
                  </div>
                  <Activity className="size-5 text-cyan-200" />
                </div>
                <div className="h-[260px]">
                  {chartsReady ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="68%"
                        outerRadius="100%"
                        data={[
                          {
                            name: "score",
                            value: result?.qualityScore ?? 0,
                            fill: "#34d399",
                          },
                        ]}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={10} background />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="size-full rounded-lg bg-white/[0.04]" />
                  )}
                  <div className="-mt-[160px] grid place-items-center text-center">
                    <p className="text-5xl font-semibold text-white">
                      {result?.qualityScore ?? 0}
                    </p>
                    <p className="text-sm text-zinc-500">out of 100</p>
                  </div>
                </div>
              </Card>

              <Card className="border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                <div className="mb-4">
                  <p className="text-sm text-zinc-400">Defect Detection</p>
                  <h2 className="text-xl font-semibold text-white">
                    Visual defect severity
                  </h2>
                </div>
                <div className="h-[260px]">
                  {chartsReady ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={defectData} margin={{ left: -20, right: 10 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip
                          cursor={{ fill: "rgba(255,255,255,0.06)" }}
                          contentStyle={{
                            background: "#101411",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 8,
                            color: "#fff",
                          }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {defectData.map((entry) => (
                            <Cell key={entry.key} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="size-full rounded-lg bg-white/[0.04]" />
                  )}
                </div>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card className="border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                <div className="mb-4">
                  <p className="text-sm text-zinc-400">Dashboard Analytics</p>
                  <h2 className="text-xl font-semibold text-white">
                    Lot performance benchmark
                  </h2>
                </div>
                <div className="h-[220px]">
                  {chartsReady ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ left: -20, right: 10 }}>
                        <defs>
                          <linearGradient id="scoreFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: "#101411",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 8,
                            color: "#fff",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#22d3ee"
                          strokeWidth={2}
                          fill="url(#scoreFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="size-full rounded-lg bg-white/[0.04]" />
                  )}
                </div>
              </Card>

              <Card className="border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                <div className="flex h-full flex-col justify-between gap-6">
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-400">AI Recommendation</p>
                    <h2 className="text-xl font-semibold text-white">
                      Operational next step
                    </h2>
                    <p className="leading-7 text-zinc-300">
                      {result
                        ? result.recommendation
                        : "Upload a lot image to receive sorting, rework, and export readiness guidance from the vision model."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {defectData.map((defect) => (
                      <div
                        key={defect.key}
                        className="rounded-lg border border-white/10 bg-black/20 p-3"
                      >
                        <p className="text-zinc-500">{defect.name}</p>
                        <p className="text-lg font-semibold text-white">
                          {defect.value}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
