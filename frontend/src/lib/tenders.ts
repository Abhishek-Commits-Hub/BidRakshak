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
import {
    createDemoReview,
    demoAnalysis,
    demoAudit,
    demoEvidence,
    demoReport,
    demoRequirements,
    demoRisk,
    demoTender,
    demoVerification,
    getDemoRequirementDetail,
} from "./demoData";

// ── Tenders ─────────────────────────────────────

export async function getTender(tenderNumber: string): Promise<TenderDetail> {
    return { ...demoTender, tender_number: tenderNumber || demoTender.tender_number };
}

// ── Analysis ────────────────────────────────────

export async function getAnalysis(tenderNumber: string): Promise<AnalysisStatus> {
    return { ...demoAnalysis, tender_number: tenderNumber || demoAnalysis.tender_number };
}

export async function runAnalysis(tenderNumber: string): Promise<AnalysisStatus> {
    return getAnalysis(tenderNumber);
}

// ── Requirements ────────────────────────────────

export async function getRequirements(
    tenderNumber: string,
    params?: { category?: string; status?: string; search?: string }
): Promise<Requirement[]> {
    void tenderNumber;
    return demoRequirements.filter((requirement) =>
        (!params?.category || requirement.category === params.category) &&
        (!params?.status || requirement.compliance_status === params.status) &&
        (!params?.search || `${requirement.requirement_code} ${requirement.title}`.toLowerCase().includes(params.search.toLowerCase()))
    );
}

export async function getRequirement(requirementId: number): Promise<RequirementDetail> {
    const requirement = getDemoRequirementDetail(requirementId);
    if (!requirement) throw new Error("Requirement not found");
    return requirement;
}

export async function uploadTenderDocument(tenderNumber: string, file: File): Promise<void> {
    void tenderNumber;
    void file;
}

// ── Evidence ────────────────────────────────────

export async function getEvidence(tenderNumber: string): Promise<Evidence[]> {
    void tenderNumber;
    return demoEvidence;
}

export async function getRequirementEvidence(requirementId: number): Promise<Evidence[]> {
    return demoEvidence.filter((evidence) => evidence.requirement_id === requirementId);
}

// ── Verification ────────────────────────────────

export async function getVerification(tenderNumber: string): Promise<VerificationResult[]> {
    void tenderNumber;
    return demoVerification;
}

// ── Review ──────────────────────────────────────

export async function submitReview(
    requirementId: number,
    decision: { officer_decision: string; comment?: string }
): Promise<ReviewDecision> {
    return createDemoReview(requirementId, decision);
}

// ── Risk ────────────────────────────────────────

export async function getRisk(tenderNumber: string): Promise<RiskSummary> {
    void tenderNumber;
    return demoRisk;
}

// ── Report ──────────────────────────────────────

export async function getReport(tenderNumber: string): Promise<ReportSummary> {
    return { ...demoReport, tender_number: tenderNumber || demoReport.tender_number };
}

export async function generatePdfReport(tenderNumber: string): Promise<Blob> {
    const report = await getReport(tenderNumber);
    return new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
}

// ── Audit ───────────────────────────────────────

export async function getAudit(tenderNumber: string): Promise<AuditLog[]> {
    void tenderNumber;
    return demoAudit;
}
