import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { getEvidence } from "../../lib/tenders";
import type { Evidence as EvidenceType } from "../../types/index";

export default function EvidencePage() {
    const { tenderId } = useParams<{ tenderId: string }>();
    const [evidence, setEvidence] = useState<EvidenceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<EvidenceType | null>(null);

    useEffect(() => {
        if (!tenderId) return;
        getEvidence(tenderId).then(setEvidence).catch(() => {}).finally(() => setLoading(false));
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Evidence Explorer</h2>
                    <p className="text-xs text-slate-500">{evidence.length} evidence records with document traceability</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                {/* Evidence list */}
                <div className="space-y-3">
                    {evidence.map(ev => (
                        <div
                            key={ev.id}
                            onClick={() => setSelected(ev)}
                            className={`cursor-pointer rounded-xl border p-4 transition ${
                                selected?.id === ev.id
                                    ? "border-blue-500/40 bg-blue-500/5"
                                    : "border-slate-800 bg-[#0b1728] hover:border-slate-700"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{ev.document_name}</p>
                                        <p className="text-xs text-slate-500">
                                            {ev.page_number ? `Page ${ev.page_number}` : ""}
                                            {ev.extracted_value ? ` · ${ev.extracted_value}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                        ev.evidence_status === "FOUND"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : ev.evidence_status === "PARTIAL"
                                            ? "bg-amber-500/10 text-amber-400"
                                            : "bg-red-500/10 text-red-400"
                                    }`}>
                                        {ev.evidence_status.replace("_", " ")}
                                    </span>
                                    <span className="text-xs text-slate-500">{ev.confidence}%</span>
                                </div>
                            </div>
                            {ev.source_text && (
                                <p className="mt-2 truncate text-xs text-slate-500 italic">
                                    "{ev.source_text}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Detail panel */}
                <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                    {selected ? (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white">Evidence Detail</h3>

                            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Document</p>
                                <p className="mt-1 text-sm text-white">{selected.document_name}</p>
                            </div>

                            {selected.page_number && (
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Page</p>
                                    <p className="mt-1 text-sm text-white">{selected.page_number}</p>
                                </div>
                            )}

                            {selected.source_text && (
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Source Text</p>
                                    <p className="mt-2 text-xs leading-5 text-slate-400 italic">"{selected.source_text}"</p>
                                </div>
                            )}

                            {selected.extracted_value && (
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Extracted Value</p>
                                    <p className="mt-1 text-sm font-medium text-white">{selected.extracted_value}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                                    <p className={`mt-1 text-sm font-medium ${
                                        selected.evidence_status === "FOUND" ? "text-emerald-400" :
                                        selected.evidence_status === "PARTIAL" ? "text-amber-400" : "text-red-400"
                                    }`}>
                                        {selected.evidence_status.replace("_", " ")}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Confidence</p>
                                    <p className="mt-1 text-sm font-medium text-white">{selected.confidence}%</p>
                                </div>
                            </div>

                            {selected.assessment && (
                                <div className="rounded-lg border border-slate-800 p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Assessment</p>
                                    <p className="mt-2 text-xs leading-5 text-slate-400">{selected.assessment}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center">
                            <div className="text-xs text-slate-500">
                                Select an evidence record to view details
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
