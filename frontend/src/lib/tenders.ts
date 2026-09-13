import api from "./api";
import type {
    AnalysisStatus,
    AuditLog,
    Evidence,
    ReportSummary,
    Requirement,
    RequirementDetail,
    ReviewDecision,
    RiskSummary,
    TenderDetail,
    VerificationResult,
} from "../types/index";

// ── Tenders ─────────────────────────────────────

export async function getTender(tenderNumber: string): Promise<TenderDetail> {
    const res = await api.get<TenderDetail>(`/tenders/${tenderNumber}`);
    return res.data;
}

// ── Analysis ────────────────────────────────────

export async function getAnalysis(tenderNumber: string): Promise<AnalysisStatus> {
    const res = await api.get<AnalysisStatus>(`/tenders/${tenderNumber}/analysis`);
    return res.data;
}

export async function runAnalysis(tenderNumber: string): Promise<AnalysisStatus> {
    const res = await api.post<AnalysisStatus>(`/tenders/${tenderNumber}/analysis`);
    return res.data;
}

// ── Requirements ────────────────────────────────

export async function getRequirements(
    tenderNumber: string,
    params?: { category?: string; status?: string; search?: string }
): Promise<Requirement[]> {
    const res = await api.get<Requirement[]>(
        `/tenders/${tenderNumber}/requirements`,
        { params }
    );
    return res.data;
}

export async function getRequirement(requirementId: number): Promise<RequirementDetail> {
    const res = await api.get<RequirementDetail>(`/requirements/${requirementId}`);
    return res.data;
}

export async function uploadTenderDocument(tenderNumber: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);

    await api.post(`/tenders/${tenderNumber}/documents`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

// ── Evidence ────────────────────────────────────

export async function getEvidence(tenderNumber: string): Promise<Evidence[]> {
    const res = await api.get<Evidence[]>(`/tenders/${tenderNumber}/evidence`);
    return res.data;
}

export async function getRequirementEvidence(requirementId: number): Promise<Evidence[]> {
    const res = await api.get<Evidence[]>(`/requirements/${requirementId}/evidence`);
    return res.data;
}

// ── Verification ────────────────────────────────

export async function getVerification(tenderNumber: string): Promise<VerificationResult[]> {
    const res = await api.get<VerificationResult[]>(`/tenders/${tenderNumber}/verification`);
    return res.data;
}

// ── Review ──────────────────────────────────────

export async function submitReview(
    requirementId: number,
    decision: { officer_decision: string; comment?: string }
): Promise<ReviewDecision> {
    const res = await api.post<ReviewDecision>(
        `/requirements/${requirementId}/review`,
        decision
    );
    return res.data;
}

// ── Risk ────────────────────────────────────────

export async function getRisk(tenderNumber: string): Promise<RiskSummary> {
    const res = await api.get<RiskSummary>(`/tenders/${tenderNumber}/risk`);
    return res.data;
}

// ── Report ──────────────────────────────────────

export async function getReport(tenderNumber: string): Promise<ReportSummary> {
    const res = await api.get<ReportSummary>(`/tenders/${tenderNumber}/report`);
    return res.data;
}

export async function generatePdfReport(tenderNumber: string): Promise<Blob> {
    const res = await api.post(
        `/tenders/${tenderNumber}/report/generate`,
        {},
        { responseType: "blob" }
    );
    return res.data;
}

// ── Audit ───────────────────────────────────────

export async function getAudit(tenderNumber: string): Promise<AuditLog[]> {
    const res = await api.get<AuditLog[]>(`/tenders/${tenderNumber}/audit`);
    return res.data;
}
