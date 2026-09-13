import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    AlertTriangle, ArrowLeft, CheckCircle2, Clock, FileText,
    MessageSquare, Save, XCircle
} from "lucide-react";
import { getRequirement, submitReview } from "../../lib/tenders";
import type { RequirementDetail as ReqDetail } from "../../types/index";

const STATUS_MAP: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string; bg: string }> = {
    PASS: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    FAIL: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    MISSING: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    REVIEW_REQUIRED: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
};

export default function RequirementDetail() {
    const { tenderId, requirementId } = useParams();
    const navigate = useNavigate();
    const [req, setReq] = useState<ReqDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSaving, setReviewSaving] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState("");

    useEffect(() => {
        if (!requirementId) return;
        getRequirement(Number(requirementId))
            .then(setReq)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [requirementId]);

    const handleReview = async (decision: string) => {
        if (!req) return;
        setReviewSaving(true);
        try {
            await submitReview(req.id, {
                officer_decision: decision,
                comment: reviewComment || undefined
            });
            setReviewSuccess(`Decision saved: ${decision}`);
            // Refresh
            const updated = await getRequirement(req.id);
            setReq(updated);
        } catch {
            setReviewSuccess("Failed to save decision.");
        } finally {
            setReviewSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!req) {
        return (
            <div className="p-7 text-center text-red-400">Requirement not found.</div>
        );
    }

    const statusCfg = STATUS_MAP[req.compliance_status] || STATUS_MAP.REVIEW_REQUIRED;
    const StatusIcon = statusCfg.icon;
    const evidence = req.evidence_records?.[0];
    const verification = req.verification;

    return (
        <div className="mx-auto max-w-[1200px] space-y-6 p-7">
            {/* Back */}
            <button
                onClick={() => navigate(`/tenders/${tenderId}/requirements`)}
                className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-blue-400"
            >
                <ArrowLeft size={14} /> Back to Requirements
            </button>

            {/* Header */}
            <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <span className="font-mono text-xs text-blue-400">{req.requirement_code}</span>
                        <h1 className="mt-1 text-xl font-semibold text-white">{req.title}</h1>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                                {req.category}
                            </span>
                            {req.mandatory && (
                                <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-medium text-red-400">
                                    MANDATORY
                                </span>
                            )}
                            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                                {req.priority} PRIORITY
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border ${statusCfg.bg} px-3 py-1.5 text-xs font-semibold ${statusCfg.color}`}>
                            <StatusIcon size={14} />
                            {req.compliance_status.replace("_", " ")}
                        </span>
                        {req.confidence > 0 && (
                            <span className="text-xs text-slate-500">Confidence: {req.confidence}%</span>
                        )}
                    </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Requirement Text</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{req.requirement_text}</p>
                </div>

                {req.source_document && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <FileText size={12} />
                        <span>Source: {req.source_document}, Page {req.source_page}</span>
                    </div>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Evidence */}
                <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                    <h2 className="text-sm font-semibold text-white">Evidence</h2>
                    {evidence ? (
                        <div className="mt-4 space-y-4">
                            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-blue-400" />
                                    <span className="text-sm font-medium text-slate-200">{evidence.document_name}</span>
                                    {evidence.page_number && (
                                        <span className="text-xs text-slate-500">Page {evidence.page_number}</span>
                                    )}
                                </div>
                                {evidence.source_text && (
                                    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Source Text</p>
                                        <p className="mt-1 text-xs leading-5 text-slate-400 italic">
                                            "{evidence.source_text}"
                                        </p>
                                    </div>
                                )}
                                {evidence.extracted_value && (
                                    <div className="mt-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Extracted Value</p>
                                        <p className="mt-1 text-sm font-medium text-white">{evidence.extracted_value}</p>
                                    </div>
                                )}
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`text-xs ${
                                        evidence.evidence_status === "FOUND" ? "text-emerald-400" :
                                        evidence.evidence_status === "PARTIAL" ? "text-amber-400" :
                                        "text-red-400"
                                    }`}>
                                        Evidence: {evidence.evidence_status.replace("_", " ")}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Confidence: {evidence.confidence}%
                                    </span>
                                </div>
                            </div>
                            {evidence.assessment && (
                                <div className="rounded-lg border border-slate-800 p-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Assessment</p>
                                    <p className="mt-2 text-xs leading-5 text-slate-400">{evidence.assessment}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                            No evidence found for this requirement.
                        </div>
                    )}
                </div>

                {/* Verification */}
                <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                    <h2 className="text-sm font-semibold text-white">Verification Rule</h2>
                    {verification ? (
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Observed</p>
                                    <p className="mt-1 text-sm font-medium text-white">
                                        {verification.observed_value || "—"}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Required</p>
                                    <p className="mt-1 text-sm font-medium text-white">
                                        {verification.expected_value || "—"}
                                    </p>
                                </div>
                            </div>
                            {verification.rule && (
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Rule</p>
                                    <p className="mt-1 font-mono text-sm text-blue-400">{verification.rule}</p>
                                </div>
                            )}
                            {verification.calculation && (
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Calculation</p>
                                    <p className="mt-1 font-mono text-sm text-white">{verification.calculation}</p>
                                </div>
                            )}
                            {verification.explanation && (
                                <div className="rounded-lg border border-slate-800 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Explanation</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-400">{verification.explanation}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                            No verification result available.
                        </div>
                    )}
                </div>
            </div>

            {/* Traceability chain */}
            <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                <h2 className="text-sm font-semibold text-white">Evidence Traceability Chain</h2>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <Step label="Requirement" value={req.requirement_code} />
                    <Arrow />
                    <Step label="Evidence" value={evidence?.evidence_status || "N/A"} />
                    <Arrow />
                    <Step label="Document" value={evidence?.document_name || "N/A"} />
                    <Arrow />
                    <Step label="Page" value={evidence?.page_number ? `${evidence.page_number}` : "N/A"} />
                    <Arrow />
                    <Step label="Rule" value={verification?.calculation || "N/A"} />
                    <Arrow />
                    <Step label="Verdict" value={req.compliance_status.replace("_", " ")} highlight />
                </div>
            </div>

            {/* Officer Review */}
            {(req.compliance_status !== "PASS" || req.review_decision) && (
                <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                        <MessageSquare size={16} className="text-blue-400" />
                        Officer Review
                    </h2>

                    {req.review_decision && (
                        <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-400">Previous Decision</p>
                            <p className="mt-1 text-sm text-white">
                                {req.review_decision.officer_decision}
                            </p>
                            {req.review_decision.comment && (
                                <p className="mt-1 text-xs text-slate-400">{req.review_decision.comment}</p>
                            )}
                            <p className="mt-2 text-[10px] text-slate-500">
                                By {req.review_decision.reviewed_by} at {new Date(req.review_decision.reviewed_at).toLocaleString()}
                            </p>
                        </div>
                    )}

                    <div className="mt-4">
                        <textarea
                            placeholder="Officer comment (optional)..."
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                            rows={2}
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            onClick={() => handleReview("PASS")}
                            disabled={reviewSaving}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 px-4 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-600/30 disabled:opacity-50"
                        >
                            <CheckCircle2 size={14} /> Confirm PASS
                        </button>
                        <button
                            onClick={() => handleReview("FAIL")}
                            disabled={reviewSaving}
                            className="flex items-center gap-1.5 rounded-lg bg-red-600/20 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-600/30 disabled:opacity-50"
                        >
                            <XCircle size={14} /> Confirm FAIL
                        </button>
                        <button
                            onClick={() => handleReview("MISSING")}
                            disabled={reviewSaving}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-600/20 px-4 py-2 text-xs font-medium text-amber-400 transition hover:bg-amber-600/30 disabled:opacity-50"
                        >
                            <AlertTriangle size={14} /> Mark Missing
                        </button>
                        <button
                            onClick={() => handleReview("REVIEW_REQUIRED")}
                            disabled={reviewSaving}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-600/20 px-4 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-600/30 disabled:opacity-50"
                        >
                            <Clock size={14} /> Keep Review
                        </button>
                    </div>

                    {reviewSuccess && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
                            <Save size={14} />
                            {reviewSuccess}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function Step({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`rounded-lg border ${highlight ? "border-blue-500/30 bg-blue-500/10" : "border-slate-800 bg-slate-900/50"} px-3 py-2`}>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-0.5 text-xs font-medium ${highlight ? "text-blue-400" : "text-slate-300"}`}>{value}</p>
        </div>
    );
}

function Arrow() {
    return <span className="text-slate-600">→</span>;
}
