from dataclasses import dataclass
import re


@dataclass
class Constraint:
    metric: str
    operator: str
    value: float | None
    unit: str | None
    qualifier: str | None
    context: str | None
    source_text: str


@dataclass
class RequirementCandidate:
    text: str
    category: str
    mandatory: bool
    evidence_required: bool
    severity: str
    source_page: int
    source_clause: str | None
    constraints: list[Constraint]


OBVIOUS_NOISE_PATTERNS = [
    r"^specimen\b",
    r"^demonstration document\b",
    r"^not a real tender\b",
    r"^this document is fictional\b",
    r"^illustrative\b",
    r"^example\b",
    r"^sample\b",
    r"^table of contents\b",
    r"^contents\b",
    r"^page\s+\d+\b",
    r"^minimum number of\b",
    r"^minimum value of\b",
    r"^maximum value of\b",
    r"^serial number\b",
    r"^sl\.\s*no\b",
    r"^s\.\s*no\b",
    r"^sr\.\s*no\b",
    r"^to be completed\b",
    r"^reproduce the table\b",
    r"^blank cells\b"
]


PROCESS_ONLY_PATTERNS = [
    r"only technically qualified bidders",
    r"financial bids shall be opened",
    r"financial bids will be opened",
    r"l1 bidder",
    r"l1 shall be",
    r"recommended for award",
    r"evaluation stages",
    r"evaluation process",
    r"bids shall be evaluated",
    r"verification of compliance",
    r"failure to meet.*shall result",
    r"missing.*document.*shall.*reject",
    r"non-compliance.*shall.*result"
]


DEFINITION_PATTERNS = [
    r"^for the purpose of this tender",
    r"^for this tender",
    r"^means\b",
    r"^shall mean\b",
    r"^definition\b",
    r"^similar contract means\b"
]


OBLIGATION_PATTERNS = [
    r"\bshall\b",
    r"\bmust\b",
    r"\brequired\b",
    r"\bmandatory\b",
    r"\bshould\b",
    r"\bneed to\b",
    r"\bis required to\b",
    r"\bare required to\b",
    r"\bto be submitted\b",
    r"\bsubmit\b",
    r"\bprovide\b",
    r"\bcomply\b",
    r"\bmaintain\b",
    r"\bpossess\b",
    r"\bhold\b"
]


EVIDENCE_PATTERNS = [
    r"certificate",
    r"certification",
    r"document",
    r"copy",
    r"proof",
    r"letter",
    r"authorization",
    r"undertaking",
    r"declaration",
    r"registration",
    r"license",
    r"datasheet",
    r"invoice",
    r"agreement",
    r"statement",
    r"audited",
    r"return"
]


CATEGORY_PATTERNS = {
    "ELIGIBILITY": [
        r"eligib",
        r"experience",
        r"similar contract",
        r"similar work",
        r"turnover",
        r"net worth",
        r"years.*operation",
        r"financial year",
        r"qualified",
        r"bidder shall",
        r"bidder must"
    ],
    "FINANCIAL": [
        r"turnover",
        r"net worth",
        r"earnest money",
        r"\bemd\b",
        r"performance security",
        r"bank guarantee",
        r"penalty",
        r"liquidated damages",
        r"payment"
    ],
    "STATUTORY": [
        r"gst",
        r"pan",
        r"udyam",
        r"msme",
        r"mca",
        r"statutory",
        r"tax",
        r"license",
        r"registration",
        r"legal"
    ],
    "TECHNICAL": [
        r"technical",
        r"processor",
        r"ram",
        r"storage",
        r"ssd",
        r"hdd",
        r"display",
        r"resolution",
        r"battery",
        r"ups",
        r"warranty",
        r"hardware",
        r"software",
        r"tpm",
        r"operating system",
        r"installation",
        r"configuration",
        r"commissioning",
        r"spare"
    ],
    "COMMERCIAL": [
        r"delivery",
        r"payment",
        r"price",
        r"tax",
        r"penalty",
        r"inspection",
        r"force majeure",
        r"arbitration",
        r"dispute"
    ],
    "DOCUMENT": [
        r"document",
        r"upload",
        r"annexure",
        r"checklist",
        r"certificate",
        r"authorization letter",
        r"undertaking",
        r"declaration"
    ]
}


def normalize_text(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def is_noise(text: str) -> bool:
    lowered = text.lower().strip()

    if len(lowered) < 25:
        return True

    for pattern in OBVIOUS_NOISE_PATTERNS:
        if re.search(pattern, lowered, re.IGNORECASE):
            return True

    return False


def is_process_only(text: str) -> bool:
    lowered = text.lower()

    for pattern in PROCESS_ONLY_PATTERNS:
        if re.search(pattern, lowered, re.IGNORECASE):
            return True

    return False


def is_definition(text: str) -> bool:
    lowered = text.lower().strip()

    for pattern in DEFINITION_PATTERNS:
        if re.search(pattern, lowered, re.IGNORECASE):
            return True

    return False


def has_obligation(text: str) -> bool:
    lowered = text.lower()

    for pattern in OBLIGATION_PATTERNS:
        if re.search(pattern, lowered, re.IGNORECASE):
            return True

    return False


def has_evidence_signal(text: str) -> bool:
    lowered = text.lower()

    for pattern in EVIDENCE_PATTERNS:
        if re.search(pattern, lowered, re.IGNORECASE):
            return True

    return False


def classify_category(text: str) -> str:
    lowered = text.lower()

    scores = {
        category: 0
        for category in CATEGORY_PATTERNS
    }

    for category, patterns in CATEGORY_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, lowered, re.IGNORECASE):
                scores[category] += 1

    if "technical specification" in lowered:
        scores["TECHNICAL"] += 8

    if "technical specifications" in lowered:
        scores["TECHNICAL"] += 8

    if "eligibility criteria" in lowered:
        scores["ELIGIBILITY"] += 8

    if "statutory compliance" in lowered:
        scores["STATUTORY"] += 8

    if "performance security" in lowered:
        scores["FINANCIAL"] += 8

    if "annexure" in lowered or "checklist" in lowered:
        scores["DOCUMENT"] += 4

    if "delivery" in lowered or "payment" in lowered:
        scores["COMMERCIAL"] += 4

    best_category = max(
        scores,
        key=scores.get
    )

    if scores[best_category] == 0:
        return "GENERAL"

    return best_category


def classify_mandatory(text: str) -> bool:
    lowered = text.lower()

    negative_patterns = [
        r"not mandatory",
        r"not compulsory",
        r"not required",
        r"desirable but not mandatory",
        r"preferred but not mandatory",
        r"preferred and not mandatory",
        r"optional",
        r"desirable"
    ]

    for pattern in negative_patterns:
        if re.search(pattern, lowered):
            return False

    strong_patterns = [
        r"\bshall\b",
        r"\bmust\b",
        r"\bmandatory\b",
        r"\brequired\b",
        r"\bcompulsory\b"
    ]

    for pattern in strong_patterns:
        if re.search(pattern, lowered):
            return True

    return False


def classify_severity(
    text: str,
    category: str,
    mandatory: bool
) -> str:
    lowered = text.lower()

    critical_terms = [
        "disqualif",
        "rejection",
        "reject",
        "statutory",
        "gst",
        "pan",
        "emd",
        "performance security",
        "mandatory eligibility"
    ]

    high_terms = [
        "turnover",
        "net worth",
        "experience",
        "technical specification",
        "warranty",
        "delivery",
        "penalty"
    ]

    for term in critical_terms:
        if term in lowered:
            return "CRITICAL"

    for term in high_terms:
        if term in lowered:
            return "HIGH"

    if mandatory:
        return "HIGH"

    if category == "TECHNICAL":
        return "MEDIUM"

    return "LOW"


def parse_number(value: str) -> float | None:
    if not value:
        return None

    cleaned = value.replace(",", "").strip()

    if not cleaned:
        return None

    try:
        return float(cleaned)
    except ValueError:
        return None


def determine_operator(text: str) -> str | None:
    lowered = text.lower()

    if re.search(
        r"\bnot\s+be\s+less\s+than\b|\bnot\s+less\s+than\b|\bat\s+least\b|\bminimum\b",
        lowered
    ):
        return ">="

    if re.search(
        r"\bnot\s+exceed(?:ing)?\b|\bmaximum\b|\bup\s+to\b|\bwithin\b",
        lowered
    ):
        return "<="

    if re.search(
        r"\bexactly\b|\bequal\s+to\b",
        lowered
    ):
        return "="

    return None


def build_context(
    text: str,
    start: int,
    end: int
) -> str:
    context_start = max(
        0,
        start - 100
    )

    context_end = min(
        len(text),
        end + 100
    )

    return text[
        context_start:context_end
    ].strip()


def add_constraint(
    constraints: list[Constraint],
    metric: str,
    operator: str,
    value: float | None,
    unit: str | None,
    text: str,
    start: int,
    end: int,
    qualifier: str | None = None
) -> None:
    constraints.append(
        Constraint(
            metric=metric,
            operator=operator,
            value=value,
            unit=unit,
            qualifier=qualifier,
            context=build_context(
                text,
                start,
                end
            ),
            source_text=text[start:end]
        )
    )


def extract_constraints(
    text: str
) -> list[Constraint]:
    constraints = []
    lowered = text.lower()

    general_operator = determine_operator(
        text
    )

    percentage_pattern = r"(\d+(?:\.\d+)?)\s*%"

    for match in re.finditer(
        percentage_pattern,
        lowered
    ):
        value = parse_number(
            match.group(1)
        )

        if value is None:
            continue

        metric = "percentage"

        if "performance security" in lowered:
            metric = "performance_security"
        elif "uptime" in lowered:
            metric = "uptime"
        elif "penalty" in lowered:
            metric = "penalty"
        elif "turnover" in lowered:
            metric = "turnover_percentage"

        operator = general_operator or "="

        if metric == "uptime":
            operator = ">="

        add_constraint(
            constraints=constraints,
            metric=metric,
            operator=operator,
            value=value,
            unit="PERCENT",
            text=text,
            start=match.start(),
            end=match.end()
        )

    currency_pattern = r"(?:₹|Rs\.?|INR)\s*([0-9][0-9,]*(?:\.[0-9]+)?)"

    for match in re.finditer(
        currency_pattern,
        text,
        re.IGNORECASE
    ):
        value = parse_number(
            match.group(1)
        )

        if value is None:
            continue

        context = build_context(
            text,
            match.start(),
            match.end()
        ).lower()

        metric = "currency"

        if "turnover" in context:
            metric = "annual_turnover"
        elif "net worth" in context:
            metric = "net_worth"
        elif "emd" in context or "earnest money" in context:
            metric = "emd"
        elif "performance security" in context:
            metric = "performance_security_amount"
        elif "penalty" in context:
            metric = "penalty_amount"
        elif "contract value" in context:
            metric = "contract_value"

        operator = general_operator or "="

        if "penalty" in context:
            operator = "="

        add_constraint(
            constraints=constraints,
            metric=metric,
            operator=operator,
            value=value,
            unit="INR",
            text=text,
            start=match.start(),
            end=match.end()
        )

    year_pattern = r"(\d+(?:\.\d+)?)\s*(?:years?|yrs?)"

    for match in re.finditer(
        year_pattern,
        lowered
    ):
        value = parse_number(
            match.group(1)
        )

        if value is None:
            continue

        context = build_context(
            text,
            match.start(),
            match.end()
        ).lower()

        metric = "duration"

        if "experience" in context:
            metric = "experience"
        elif "operation" in context:
            metric = "operational_experience"
        elif "warranty" in context:
            metric = "warranty"
        elif "spare" in context and "availability" in context:
            metric = "spare_availability"
        elif "contract period" in context:
            metric = "contract_period"

        operator = general_operator or ">="

        add_constraint(
            constraints=constraints,
            metric=metric,
            operator=operator,
            value=value,
            unit="YEARS",
            text=text,
            start=match.start(),
            end=match.end()
        )

    month_pattern = r"(\d+(?:\.\d+)?)\s*(?:months?|mos?)"

    for match in re.finditer(
        month_pattern,
        lowered
    ):
        value = parse_number(
            match.group(1)
        )

        if value is None:
            continue

        context = build_context(
            text,
            match.start(),
            match.end()
        ).lower()

        metric = "duration"

        if "valid" in context:
            metric = "validity_period"

        add_constraint(
            constraints=constraints,
            metric=metric,
            operator=general_operator or ">=",
            value=value,
            unit="MONTHS",
            text=text,
            start=match.start(),
            end=match.end()
        )

    day_pattern = r"(\d+(?:\.\d+)?)\s*(days?)"

    for match in re.finditer(
        day_pattern,
        lowered
    ):
        value = parse_number(
            match.group(1)
        )

        if value is None:
            continue

        context = build_context(
            text,
            match.start(),
            match.end()
        ).lower()

        metric = "duration"
        operator = general_operator or ">="

        if "response" in context:
            metric = "response_time"
            operator = "<="
        elif "resolution" in context:
            metric = "resolution_time"
            operator = "<="
        elif "submission" in context:
            metric = "submission_deadline"
            operator = "<="
        elif "payment" in context:
            metric = "payment_period"
            operator = "<="
        elif "notice" in context:
            metric = "notice_period"
            operator = "<="
        elif "valid" in context:
            metric = "validity_period"
            operator = ">="
        elif "within" in context:
            operator = "<="

        add_constraint(
            constraints=constraints,
            metric=metric,
            operator=operator,
            value=value,
            unit="DAYS",
            text=text,
            start=match.start(),
            end=match.end()
        )

    hour_pattern = r"(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)"

    for match in re.finditer(
        hour_pattern,
        lowered
    ):
        value = parse_number(
            match.group(1)
        )

        if value is None:
            continue

        context = build_context(
            text,
            match.start(),
            match.end()
        ).lower()

        metric = "duration"
        operator = general_operator or ">="

        if "response" in context:
            metric = "response_time"
            operator = "<="
        elif "resolution" in context:
            metric = "resolution_time"
            operator = "<="
        elif "within" in context:
            operator = "<="

        add_constraint(
            constraints=constraints,
            metric=metric,
            operator=operator,
            value=value,
            unit="HOURS",
            text=text,
            start=match.start(),
            end=match.end()
        )

    deduplicated = []
    seen = set()

    for constraint in constraints:
        key = (
            constraint.metric,
            constraint.operator,
            constraint.value,
            constraint.unit
        )

        if key in seen:
            continue

        seen.add(key)
        deduplicated.append(
            constraint
        )

    return deduplicated


def canonicalize_text(text: str) -> str:
    text = normalize_text(
        text
    )

    text = re.sub(
        r"^\s*(?:\d+(?:\.\d+)*|[A-Z]{1,5}-\d+)[\s:.-]+",
        "",
        text
    )

    return text.strip()


def looks_like_requirement(text: str) -> bool:
    text = normalize_text(
        text
    )

    if is_noise(text):
        return False

    if is_process_only(text):
        return False

    if is_definition(text):
        return False

    if not has_obligation(text):
        return False

    if re.match(
        r"^(section|chapter|annexure|table|contents)\b",
        text.lower()
    ):
        return False

    return True


def deduplicate(
    candidates: list[RequirementCandidate]
) -> list[RequirementCandidate]:
    seen = set()
    result = []

    for candidate in candidates:
        key = re.sub(
            r"[^a-z0-9]+",
            " ",
            candidate.text.lower()
        ).strip()

        if len(key) < 25:
            continue

        if key in seen:
            continue

        seen.add(key)
        result.append(candidate)

    return result


def extract_requirements(
    pages: list[dict]
) -> list[RequirementCandidate]:
    candidates = []

    for page in pages:
        page_number = page["page_number"]
        raw_text = page.get(
            "text",
            ""
        )

        paragraphs = re.split(
            r"\n\s*\n",
            raw_text
        )

        for paragraph in paragraphs:
            paragraph = normalize_text(
                paragraph
            )

            if not looks_like_requirement(
                paragraph
            ):
                continue

            canonical_text = canonicalize_text(
                paragraph
            )

            if len(canonical_text) < 30:
                continue

            category = classify_category(
                canonical_text
            )

            mandatory = classify_mandatory(
                canonical_text
            )

            evidence_required = (
                has_evidence_signal(
                    canonical_text
                )
            )

            severity = classify_severity(
                canonical_text,
                category,
                mandatory
            )

            constraints = extract_constraints(
                canonical_text
            )

            candidates.append(
                RequirementCandidate(
                    text=canonical_text,
                    category=category,
                    mandatory=mandatory,
                    evidence_required=evidence_required,
                    severity=severity,
                    source_page=page_number,
                    source_clause=None,
                    constraints=constraints
                )
            )

    return deduplicate(
        candidates
    )
