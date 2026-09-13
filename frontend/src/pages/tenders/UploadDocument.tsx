import { useRef, useState } from "react";
import { ArrowLeft, FileUp, UploadCloud } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadTenderDocument } from "../../lib/tenders";

export default function UploadDocument() {
    const { tenderId } = useParams<{ tenderId: string }>();
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!tenderId || !selectedFile) {
            setError("Please choose a document before uploading.");
            return;
        }

        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await uploadTenderDocument(tenderId, selectedFile);
            setSuccess(`${selectedFile.name} uploaded successfully.`);
            setSelectedFile(null);

            if (inputRef.current) {
                inputRef.current.value = "";
            }

            setTimeout(() => navigate(`/tenders/${tenderId}`), 900);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Upload failed.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-[900px] space-y-6 p-7">
            <button
                type="button"
                onClick={() => navigate(`/tenders/${tenderId}`)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300"
            >
                <ArrowLeft size={14} />
                Back to tender
            </button>

            <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                <div className="mb-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-400">Tender upload</p>
                    <h1 className="mt-2 text-xl font-semibold text-white">Upload bid/tender document</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-10 text-center transition hover:border-blue-500/60"
                    >
                        <UploadCloud size={28} className="text-blue-400" />
                        <span className="mt-3 text-sm font-medium text-slate-200">
                            {selectedFile ? selectedFile.name : "Click to select a file"}
                        </span>
                        <span className="mt-1 text-xs text-slate-500">PDF, DOC, or DOCX only</span>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                        />
                    </label>

                    {error && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-400">
                            {success}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/tenders/${tenderId}`)}
                            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedFile || submitting}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                        >
                            <FileUp size={16} />
                            {submitting ? "Uploading..." : "Upload document"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
