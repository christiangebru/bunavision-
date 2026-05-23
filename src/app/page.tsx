/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const capabilities = [
  {
    title: "Vision defect detection",
    text: "Broken beans, discoloration, mold risk, and roast inconsistency scored from the uploaded image.",
    icon: ScanSearch,
  },
  {
    title: "Export readiness",
    text: "Instant grade classification with a buyer-facing readiness signal for lot decisions.",
    icon: ShieldCheck,
  },
  {
    title: "Report automation",
    text: "Download professional inspection reports with timestamped AI recommendations.",
    icon: FileText,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070907] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.2),transparent_50%),linear-gradient(135deg,rgba(245,158,11,0.12),transparent_38%),linear-gradient(315deg,rgba(34,211,238,0.1),transparent_42%)]" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
        <div className="space-y-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border border-emerald-300/20 bg-emerald-300/10">
                <BarChart3 className="size-5 text-emerald-200" />
              </div>
              <span className="text-lg font-semibold tracking-tight">BunaVision</span>
            </div>
            <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100">
              Hackathon AI Lab
            </Badge>
          </nav>

          <div className="space-y-6">
            <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              Coffee Export Intelligence
            </Badge>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              BunaVision
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-400">
              AI-powered coffee bean quality inspection for farmers,
              cooperatives, and exporters who need fast visual grading,
              defect intelligence, and professional buyer-ready reports.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-emerald-300 px-5 text-base text-zinc-950 hover:bg-emerald-200"
            >
              <Link href="/analyze">
                Analyze Coffee Beans
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-white/10 bg-white/[0.04] px-5 text-base text-white hover:bg-white/10"
            >
              <Link href="/analyze">Open Dashboard</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {capabilities.map((item) => (
              <Card
                key={item.title}
                className="border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl"
              >
                <item.icon className="mb-4 size-5 text-emerald-200" />
                <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="relative min-h-[560px] overflow-hidden rounded-lg border border-white/10 bg-black/30 shadow-2xl shadow-black/40">
          <img
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=85"
            alt="Roasted coffee beans prepared for AI quality inspection"
            className="absolute inset-0 size-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070907] via-[#070907]/45 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 space-y-4 rounded-lg border border-white/10 bg-black/55 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">Live lot snapshot</p>
                <p className="text-2xl font-semibold text-white">Grade A candidate</p>
              </div>
              <div className="grid size-12 place-items-center rounded-lg border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                92
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-white/[0.06] p-3">
                <p className="text-zinc-500">Mold risk</p>
                <p className="mt-1 font-semibold text-emerald-100">Low</p>
              </div>
              <div className="rounded-lg bg-white/[0.06] p-3">
                <p className="text-zinc-500">Export</p>
                <p className="mt-1 font-semibold text-emerald-100">Ready</p>
              </div>
              <div className="rounded-lg bg-white/[0.06] p-3">
                <p className="text-zinc-500">Report</p>
                <p className="mt-1 font-semibold text-emerald-100">PDF</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
