import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { getVerification } from "../../lib/tenders";
import type { VerificationResult } from "../../types/index";

const STATUS_MAP: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string; bg: string }> = {
    PASS: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    FAIL: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
    MISSING: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
    REVIEW_REQUIRED: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
};

export default function Verification() {
    const { tenderId } = useParams<{ tenderId: string }>();
    const [results, setResults] = useState<VerificationResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenderId) return;
        getVerification(tenderId).then(setResults).catch(() => {}).finally(() => setLoading(false));
    }, [tenderId]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1500px] space-y-5 p-7">
            <div>
                <h2 className="text-lg font-semibold text-white">Verification Results</h2>
                <p className="text-xs text-slate-500">
                    Deterministic rule-based compliance verification — {results.length} results
                </p>
            </div>

            <div className="space-y-3">
                {results.map(vr => {
                    const cfg = STATUS_MAP[vr.result] || STATUS_MAP.REVIEW_REQUIRED;
                    const Icon = cfg.icon;
                    const req = vr.requirement;

                    return (
                        <div key={vr.id} className="rounded-xl border border-slate-800 bg-[#0b1728] p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-blue-400">
                                            {req?.requirement_code || `REQ-${vr.requirement_id}`}
                                        </span>
                                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                            {req?.category || ""}
                                        </span>
                                    </div>
                                    <h3 className="mt-1 text-sm font-medium text-slate-200">
                                        {req?.title || "Requirement"}
                                    </h3>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 rounded-full ${cfg.bg} px-3 py-1 text-[11px] font-semibold ${cfg.color}`}>
                                    <Icon size={13} />
                                    {vr.result.replace("_", " ")}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <VerifBox label="Observed Value" value={vr.observed_value || "—"} />
                                <VerifBox label="Required Value" value={vr.expected_value || "—"} />
                                <VerifBox label="Calculation" value={vr.calculation || "—"} mono />
                                <VerifBox label="Confidence" value={vr.confidence > 0 ? `${vr.confidence}%` : "—"} />
                            </div>

                            {vr.rule && (
                                <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Rule: </span>
                                    <span className="font-mono text-xs text-slate-300">{vr.rule}</span>
                                </div>
                            )}

                            {vr.explanation && (
                                <p className="mt-3 text-xs leading-5 text-slate-500">{vr.explanation}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function VerifBox({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-0.5 text-sm ${mono ? "font-mono text-blue-400" : "text-white"}`}>{value}</p>
        </div>
    );
}
