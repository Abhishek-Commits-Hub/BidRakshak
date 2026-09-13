import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { runAnalysis } from "../../lib/tenders";
import type { AnalysisStatus } from "../../types/index";

const STEPS = [
    "Reading tender document",
    "Extracting requirements",
    "Reading bidder documents",
    "Finding evidence",
    "Mapping evidence to requirements",
    "Checking compliance rules",
    "Calculating risk priorities",
];

export default function Analysis() {
    const { tenderId } = useParams<{ tenderId: string }>();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [done, setDone] = useState(false);
    const [result, setResult] = useState<AnalysisStatus | null>(null);

    useEffect(() => {
        if (!tenderId) return;

        let cancelled = false;

        const runSteps = async () => {
            for (let i = 0; i < STEPS.length; i++) {
                if (cancelled) return;
                await new Promise(r => setTimeout(r, 600 + Math.floor(i * 100)));
                if (cancelled) return;
                setCurrentStep(i + 1);
            }

            try {
                const res = await runAnalysis(tenderId);
                if (!cancelled) {
                    setResult(res);
                    setDone(true);
                }
            } catch {
                if (!cancelled) setDone(true);
            }
        };

        runSteps();
        return () => { cancelled = true; };
    }, [tenderId]);

    return (
        <div className="mx-auto max-w-[800px] p-7">
            <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-8">
                <div className="text-center">
                    {!done ? (
                        <div className="flex items-center justify-center gap-2 text-blue-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm font-semibold">Analyzing Bid</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                            <CheckCircle2 size={20} />
                            <span className="text-sm font-semibold">Analysis Complete</span>
                        </div>
                    )}

                    <p className="mt-2 text-xs text-slate-500">
                        {done
                            ? "Precomputed demonstration analysis — deterministic results"
                            : "Processing bid documents against tender requirements..."}
                    </p>
                </div>

                <div className="mt-8 space-y-3">
                    {STEPS.map((step, i) => {
                        const completed = i < currentStep;
                        const active = i === currentStep && !done;

                        return (
                            <div
                                key={step}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                                    completed
                                        ? "bg-emerald-500/5 text-emerald-400"
                                        : active
                                        ? "bg-blue-500/5 text-blue-400"
                                        : "text-slate-600"
                                }`}
                            >
                                {completed ? (
                                    <CheckCircle2 size={16} />
                                ) : active ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Circle size={16} />
                                )}
                                <span className="text-sm">{step}</span>
                            </div>
                        );
                    })}
                </div>

                {done && result && (
                    <div className="mt-8">
                        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-5">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <StatBox label="Total" value={result.total_requirements} />
                                <StatBox label="Pass" value={result.pass_count} color="emerald" />
                                <StatBox label="Fail" value={result.fail_count} color="red" />
                                <StatBox label="Review" value={result.review_count} color="amber" />
                            </div>
                            <div className="mt-4 text-center">
                                <span className="text-2xl font-bold text-white">
                                    {result.compliance_percentage}%
                                </span>
                                <span className="ml-2 text-xs text-slate-500">compliance</span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => navigate(`/tenders/${tenderId}/requirements`)}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                            >
                                View Requirements
                            </button>
                            <button
                                onClick={() => navigate(`/tenders/${tenderId}/verification`)}
                                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500/40"
                            >
                                View Verification
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
    const colorClasses: Record<string, string> = {
        emerald: "text-emerald-400",
        red: "text-red-400",
        amber: "text-amber-400",
    };

    return (
        <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-xl font-bold ${color ? colorClasses[color] : "text-white"}`}>
                {value}
            </p>
        </div>
    );
}
