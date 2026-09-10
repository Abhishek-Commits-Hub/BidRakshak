from __future__ import annotations
import re
from dataclasses import dataclass, field
from typing import Any


REQUIREMENT_ID_PATTERN = re.compile(
    r"\b((?:ELIG|FIN|TECH|STAT|DOC|COMM|COM|GEN)[-_]\d{1,4})\b",
    re.IGNORECASE
)

CATEGORY_BY_PREFIX = {
    "ELIG": "ELIGIBILITY",
    "FIN": "FINANCIAL",
    "TECH": "TECHNICAL",
    "STAT": "STATUTORY",
    "DOC": "DOCUMENT",
    "COMM": "COMMERCIAL",
    "COM": "COMMERCIAL",
    "GEN": "GENERAL"
}

NOISE_PATTERNS = [
    r"^page\s+\d+",
    r"^contents?$",
    r"^table\s+of\s+contents?$",
    r"^annexure\s+[a-z0-9\-]+$",
    r"^schedule\s+[a-z0-9\-]+$",
    r"^note\s*:?",
    r"^notes?\s*:?",
    r"^disclaimer\s*:?",
    r"^important\s*:?",
    r"^instructions?\s+to\s+(?:bidders?|bidders?)",
    r"^sample\s+(?:format|form|template)",
    r"^format\s+for\s+",
    r"^technical\s+compliance\s+format$",
    r"^technical\s+specification\s+format$",
    r"^compliance\s+format$",
    r"^bidder'?s?\s+signature$",
    r"^signature\s+of\s+",
    r"^name\s+of\s+",
    r"^date\s*:?",
    r"^place\s*:?"
]

PROCESS_PATTERNS = [
    r"\bshall\s+submit\b",
    r"\bto\s+be\s+submitted\b",
    r"\bmust\s+upload\b",
    r"\bshould\s+upload\b",
    r"\bsubmit\s+the\s+following\b",
    r"\bfill\s+in\s+the\s+format\b",
    r"\buse\s+the\s+following\s+format\b",
    r"\bsample\s+format\b",
    r"\bcompliance\s+format\b"
]

DEFINITION_PATTERNS = [
    r"^definition\s*:?",
    r"^definitions?\s*$",
    r"^abbreviations?\s*$",
    r"^glossary\s*$"
]

EVIDENCE_KEYWORDS = [
    "certificate",
    "certification",
    "document",
    "proof",
    "evidence",
    "letter",
    "declaration",
    "undertaking",
    "registration",
    "license",
    "licence",
    "gst",
    "pan",
    "udyam",
    "mca",
    "audited",
    "audit report",
    "ca certificate",
    "chartered accountant",
    "work order",
    "purchase order",
    "invoice",
    "completion certificate",
    "experience certificate",
    "authorization",
    "oem",
    "iso"
]

MANDATORY_PATTERNS = [
    r"\bshall\b",
    r"\bmust\b",
    r"\bmandatory\b",
    r"\brequired\b",
    r"\bcompulsory\b",
    r"\bessential\b",
    r"\bminimum\b",
    r"\bat\s+least\b",
    r"\bnot\s+less\s+than\b",
    r"\bnot\s+more\s+than\b",
    r"\bwithin\b"
]

NON_MANDATORY_PATTERNS = [
    r"\bpreferred\b",
    r"\bpreferable\b",
    r"\boptional\b",
    r"\bdesirable\b",
    r"\bmay\s+be\b",
    r"\bwherever\s+possible\b"
]

SEVERITY_KEYWORDS = {
    "CRITICAL": [
        "disqualification",
        "ineligible",
        "rejected",
        "mandatory",
        "statutory",
        "blacklisted",
        "debarred",
        "emd",
        "bid security",
        "performance security"
    ],
    "HIGH": [
        "minimum",
        "eligibility",
        "turnover",
        "experience",
        "gst",
        "pan",
        "oem",
        "authorization",
        "warranty",
        "uptime"
    ],
    "MEDIUM": [
        "support",
        "maintenance",
        "delivery",
        "response",
        "resolution"
    ]
}


@dataclass
class Constraint:
    metric: str
    operator: str
    threshold_value: float | None = None
    unit: str | None = None
    currency: str | None = None
    raw_text: str | None = None


@dataclass
class AtomicRequirement:
    requirement_code: str
    text: str
    canonical_text: str
    category: str
    mandatory: bool
    evidence_required: bool
    severity: str
    source_page: int
    constraints: list[Constraint] = field(default_factory=list)


def normalize_whitespace(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_line(text: str) -> str:
    text = normalize_whitespace(text)
    text = re.sub(r"^[•●▪◦\-–—]+\s*", "", text)
    text = re.sub(r"^\(?\d+[\.\)]\s*", "", text)
    return text.strip()


def is_noise(text: str) -> bool:
    value = text.strip().lower()

    if not value:
        return True

    if len(value) < 4:
        return True

    for pattern in NOISE_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            return True

    for pattern in DEFINITION_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            return True

    if re.fullmatch(r"[\W_]+", value):
        return True

    return False


def is_process_only(text: str) -> bool:
    value = text.lower()

    if any(re.search(pattern, value, re.IGNORECASE) for pattern in PROCESS_PATTERNS):
        requirement_terms = [
            "turnover",
            "experience",
            "quantity",
            "capacity",
            "minimum",
            "maximum",
            "warranty",
            "uptime",
            "gst",
            "pan",
            "registration",
            "license",
            "security",
            "emd",
            "delivery"
        ]

        if not any(term in value for term in requirement_terms):
            return True

    return False


def detect_category(code: str, text: str) -> str:
    prefix = code.split("-")[0].upper()

    if prefix in CATEGORY_BY_PREFIX:
        return CATEGORY_BY_PREFIX[prefix]

    value = text.lower()

    if any(term in value for term in ["turnover", "revenue", "financial", "emd", "security"]):
        return "FINANCIAL"

    if any(term in value for term in ["gst", "pan", "statutory", "registration", "license", "licence"]):
        return "STATUTORY"

    if any(term in value for term in ["technical", "processor", "memory", "display", "storage", "warranty"]):
        return "TECHNICAL"

    if any(term in value for term in ["experience", "eligible", "eligibility"]):
        return "ELIGIBILITY"

    if any(term in value for term in ["document", "certificate", "proof", "declaration"]):
        return "DOCUMENT"

    if any(term in value for term in ["delivery", "payment", "commercial"]):
        return "COMMERCIAL"

    return "GENERAL"


def detect_mandatory(text: str) -> bool:
    value = text.lower()

    if any(
        re.search(pattern, value, re.IGNORECASE)
        for pattern in NON_MANDATORY_PATTERNS
    ):
        return False

    if any(
        re.search(pattern, value, re.IGNORECASE)
        for pattern in MANDATORY_PATTERNS
    ):
        return True

    return False


def detect_evidence_required(text: str, category: str) -> bool:
    value = text.lower()

    if any(keyword in value for keyword in EVIDENCE_KEYWORDS):
        return True

    if category in {
        "ELIGIBILITY",
        "FINANCIAL",
        "STATUTORY",
        "DOCUMENT"
    }:
        return True

    return False


def detect_severity(text: str, mandatory: bool) -> str:
    value = text.lower()

    for severity in ["CRITICAL", "HIGH", "MEDIUM"]:
        if any(keyword in value for keyword in SEVERITY_KEYWORDS[severity]):
            return severity

    if mandatory:
        return "HIGH"

    return "LOW"


def canonicalize(text: str) -> str:
    value = normalize_whitespace(text)
    value = re.sub(
        r"^(?:ELIG|FIN|TECH|STAT|DOC|COMM|COM|GEN)[-_]\d{1,4}\s*[:.)-]?\s*",
        "",
        value,
        flags=re.IGNORECASE
    )
    return value.strip(" :-")


def parse_number(value: str) -> float | None:
    value = value.replace(",", "").strip()

    if not value:
        return None

    try:
        return float(value)
    except ValueError:
        return None


def normalize_unit(unit: str) -> str:
    value = unit.strip().lower()

    aliases = {
        "rs": "INR",
        "rs.": "INR",
        "₹": "INR",
        "inr": "INR",
        "crore": "CRORE",
        "crores": "CRORE",
        "lakh": "LAKH",
        "lakhs": "LAKH",
        "years": "YEARS",
        "year": "YEARS",
        "yrs": "YEARS",
        "yr": "YEARS",
        "months": "MONTHS",
        "month": "MONTHS",
        "days": "DAYS",
        "day": "DAYS",
        "hours": "HOURS",
        "hour": "HOURS",
        "hrs": "HOURS",
        "minutes": "MINUTES",
        "minute": "MINUTES",
        "percent": "%",
        "%": "%",
        "gb": "GB",
        "tb": "TB",
        "mhz": "MHZ",
        "ghz": "GHZ",
        "inch": "INCH",
        "inches": "INCH",
        "units": "UNITS",
        "unit": "UNITS"
    }

    return aliases.get(value, value.upper())


def extract_constraints(text: str) -> list[Constraint]:
    value = normalize_whitespace(text)
    constraints: list[Constraint] = []

    money_pattern = re.compile(
        r"(?:₹|rs\.?|inr)\s*"
        r"(\d+(?:,\d+)*(?:\.\d+)?)"
        r"\s*(crores?|crore|lakhs?|lakh)?",
        re.IGNORECASE
    )

    for match in money_pattern.finditer(value):
        number = parse_number(match.group(1))

        if number is None:
            continue

        scale = (match.group(2) or "").lower()

        if scale.startswith("crore"):
            number *= 10_000_000
            unit = "INR"
        elif scale.startswith("lakh"):
            number *= 100_000
            unit = "INR"
        else:
            unit = "INR"

        start = max(0, match.start() - 80)
        end = min(len(value), match.end() + 100)
        context = value[start:end].lower()

        if re.search(
            r"(?:at\s+least|minimum|not\s+less\s+than|>=|greater\s+than|above)",
            context
        ):
            operator = ">="

        elif re.search(
            r"(?:at\s+most|maximum|not\s+more\s+than|<=|less\s+than|below)",
            context
        ):
            operator = "<="

        elif re.search(r"(?:equal\s+to|equals|=)", context):
            operator = "="

        else:
            continue

        constraints.append(
            Constraint(
                metric="financial_amount",
                operator=operator,
                threshold_value=number,
                unit=unit,
                currency="INR",
                raw_text=match.group(0)
            )
        )

    number_unit_pattern = re.compile(
        r"(?P<number>\d+(?:,\d+)*(?:\.\d+)?)"
        r"\s*(?P<unit>%|percent|years?|yrs?|months?|days?|hours?|hrs?|minutes?|mins?|"
        r"gb|tb|mhz|ghz|inches?|inch|units?)\b",
        re.IGNORECASE
    )

    for match in number_unit_pattern.finditer(value):
        number = parse_number(match.group("number"))

        if number is None:
            continue

        unit = normalize_unit(match.group("unit"))

        start = max(0, match.start() - 100)
        end = min(len(value), match.end() + 100)
        context = value[start:end].lower()

        if re.search(
            r"(?:at\s+least|minimum|not\s+less\s+than|>=|greater\s+than|above)",
            context
        ):
            operator = ">="

        elif re.search(
            r"(?:at\s+most|maximum|not\s+more\s+than|<=|less\s+than|below)",
            context
        ):
            operator = "<="

        elif re.search(r"(?:between)", context):
            operator = "BETWEEN"

        elif re.search(r"(?:equal\s+to|equals|=)", context):
            operator = "="

        else:
            continue

        metric = infer_metric(value, match.start())

        constraints.append(
            Constraint(
                metric=metric,
                operator=operator,
                threshold_value=number,
                unit=unit,
                raw_text=match.group(0)
            )
        )

    between_pattern = re.compile(
        r"between\s+"
        r"(\d+(?:\.\d+)?)\s*(%|percent|years?|months?|days?|hours?|gb|tb|mhz|ghz|inches?|inch)"
        r"\s+and\s+"
        r"(\d+(?:\.\d+)?)\s*(%|percent|years?|months?|days?|hours?|gb|tb|mhz|ghz|inches?|inch)",
        re.IGNORECASE
    )

    for match in between_pattern.finditer(value):
        lower = parse_number(match.group(1))
        upper = parse_number(match.group(3))

        if lower is None or upper is None:
            continue

        lower_unit = normalize_unit(match.group(2))
        upper_unit = normalize_unit(match.group(4))

        if lower_unit != upper_unit:
            continue

        metric = infer_metric(value, match.start())

        constraints.append(
            Constraint(
                metric=metric,
                operator="BETWEEN",
                threshold_value=lower,
                unit=lower_unit,
                raw_text=f"{lower} {lower_unit} to {upper} {upper_unit}"
            )
        )

        constraints.append(
            Constraint(
                metric=metric,
                operator="<=",
                threshold_value=upper,
                unit=upper_unit,
                raw_text=f"{upper} {upper_unit}"
            )
        )

    return deduplicate_constraints(constraints)


def infer_metric(text: str, position: int) -> str:
    value = text.lower()
    context = value[max(0, position - 120):position + 120]

    metric_keywords = [
        ("turnover", "annual_turnover"),
        ("revenue", "revenue"),
        ("experience", "experience"),
        ("warranty", "warranty_period"),
        ("response", "response_time"),
        ("resolution", "resolution_time"),
        ("uptime", "uptime"),
        ("delivery", "delivery_period"),
        ("duration", "duration"),
        ("memory", "memory"),
        ("ram", "memory"),
        ("storage", "storage"),
        ("display", "display_size"),
        ("screen", "display_size"),
        ("processor", "processor"),
        ("capacity", "capacity"),
        ("quantity", "quantity"),
        ("speed", "speed"),
        ("frequency", "frequency"),
        ("support", "support_period")
    ]

    for keyword, metric in metric_keywords:
        if keyword in context:
            return metric

    return "numeric_threshold"


def deduplicate_constraints(
    constraints: list[Constraint]
) -> list[Constraint]:
    result: list[Constraint] = []
    seen: set[tuple[Any, ...]] = set()

    for constraint in constraints:
        key = (
            constraint.metric,
            constraint.operator,
            constraint.threshold_value,
            constraint.unit,
            constraint.currency
        )

        if key in seen:
            continue

        seen.add(key)
        result.append(constraint)

    return result


def looks_like_requirement(text: str) -> bool:
    value = text.lower()

    if is_noise(value):
        return False

    if is_process_only(value):
        return False

    meaningful_terms = [
        "shall",
        "must",
        "required",
        "minimum",
        "maximum",
        "at least",
        "not less",
        "not more",
        "eligible",
        "eligibility",
        "experience",
        "turnover",
        "gst",
        "pan",
        "registration",
        "certificate",
        "certificate",
        "technical",
        "specification",
        "processor",
        "memory",
        "storage",
        "display",
        "warranty",
        "delivery",
        "support",
        "uptime",
        "security",
        "emd",
        "bidder",
        "oem",
        "authorization",
        "document",
        "proof"
    ]

    return any(term in value for term in meaningful_terms)


def split_page_into_atomic_records(
    page_number: int,
    page_text: str
) -> list[tuple[str, str, int]]:
    lines = [
        clean_line(line)
        for line in page_text.splitlines()
        if clean_line(line)
    ]

    records: list[tuple[str, str, int]] = []
    current_code: str | None = None
    current_parts: list[str] = []

    def flush() -> None:
        nonlocal current_code
        nonlocal current_parts

        if not current_code:
            current_parts = []
            return

        text = normalize_whitespace(" ".join(current_parts))

        if looks_like_requirement(text):
            records.append(
                (
                    current_code.upper(),
                    text,
                    page_number
                )
            )

        current_code = None
        current_parts = []

    for line in lines:
        matches = list(REQUIREMENT_ID_PATTERN.finditer(line))

        if matches:
            first_match = matches[0]

            if current_code:
                flush()

            current_code = first_match.group(1).upper()

            remainder = line[first_match.end():].strip()
            remainder = re.sub(r"^[\s:.)\-–—]+", "", remainder)

            if remainder:
                current_parts.append(remainder)

            continue

        if current_code:
            if is_noise(line):
                continue

            current_parts.append(line)

    flush()

    return records


def extract_implicit_records(
    page_number: int,
    page_text: str
) -> list[tuple[str, str, int]]:
    lines = [
        clean_line(line)
        for line in page_text.splitlines()
        if clean_line(line)
    ]

    records: list[tuple[str, str, int]] = []

    for line in lines:
        if is_noise(line):
            continue

        if not looks_like_requirement(line):
            continue

        if REQUIREMENT_ID_PATTERN.search(line):
            continue

        if len(line) < 20:
            continue

        records.append(
            (
                "",
                line,
                page_number
            )
        )

    return records


def merge_continuation_records(
    records: list[tuple[str, str, int]]
) -> list[tuple[str, str, int]]:
    merged: list[tuple[str, str, int]] = []

    for code, text, page_number in records:
        if not merged:
            merged.append((code, text, page_number))
            continue

        previous_code, previous_text, previous_page = merged[-1]

        if (
            code
            and previous_code
            and code.upper() == previous_code.upper()
        ):
            merged[-1] = (
                previous_code,
                normalize_whitespace(previous_text + " " + text),
                previous_page
            )
        else:
            merged.append((code, text, page_number))

    return merged


def build_requirement(
    code: str,
    text: str,
    page_number: int,
    generated_number: int
) -> AtomicRequirement | None:
    clean_text = normalize_whitespace(text)

    if not looks_like_requirement(clean_text):
        return None

    if not code:
        code = f"GEN-{generated_number:03d}"

    category = detect_category(code, clean_text)
    mandatory = detect_mandatory(clean_text)
    evidence_required = detect_evidence_required(
        clean_text,
        category
    )
    severity = detect_severity(
        clean_text,
        mandatory
    )
    canonical_text = canonicalize(clean_text)
    constraints = extract_constraints(clean_text)

    return AtomicRequirement(
        requirement_code=code.upper(),
        text=clean_text,
        canonical_text=canonical_text,
        category=category,
        mandatory=mandatory,
        evidence_required=evidence_required,
        severity=severity,
        source_page=page_number,
        constraints=constraints
    )


def deduplicate_requirements(
    requirements: list[AtomicRequirement]
) -> list[AtomicRequirement]:
    result: list[AtomicRequirement] = []
    seen_codes: set[str] = set()
    seen_texts: set[str] = set()

    for requirement in requirements:
        code_key = requirement.requirement_code.upper()
        text_key = re.sub(
            r"\W+",
            " ",
            requirement.canonical_text.lower()
        ).strip()

        if code_key in seen_codes:
            continue

        if text_key in seen_texts:
            continue

        seen_codes.add(code_key)
        seen_texts.add(text_key)
        result.append(requirement)

    return result


def extract_requirements_from_pages(
    pages: list[dict[str, Any]]
) -> list[AtomicRequirement]:
    all_records: list[tuple[str, str, int]] = []

    for page in pages:
        page_number = int(page["page_number"])
        page_text = page.get("text", "") or ""

        explicit_records = split_page_into_atomic_records(
            page_number,
            page_text
        )

        all_records.extend(explicit_records)

    explicit_codes = {
        code.upper()
        for code, _, _ in all_records
        if code
    }

    for page in pages:
        page_number = int(page["page_number"])
        page_text = page.get("text", "") or ""

        implicit_records = extract_implicit_records(
            page_number,
            page_text
        )

        for code, text, source_page in implicit_records:
            if code:
                if code.upper() in explicit_codes:
                    continue

            all_records.append(
                (
                    code,
                    text,
                    source_page
                )
            )

    all_records = merge_continuation_records(
        all_records
    )

    requirements: list[AtomicRequirement] = []
    generated_number = 1

    for code, text, page_number in all_records:
        requirement = build_requirement(
            code,
            text,
            page_number,
            generated_number
        )

        if requirement is None:
            continue

        if requirement.requirement_code.startswith("GEN-"):
            generated_number += 1

        requirements.append(requirement)

    return deduplicate_requirements(requirements)


def requirement_to_dict(
    requirement: AtomicRequirement
) -> dict[str, Any]:
    return {
        "requirement_code": requirement.requirement_code,
        "text": requirement.text,
        "canonical_text": requirement.canonical_text,
        "category": requirement.category,
        "mandatory": requirement.mandatory,
        "evidence_required": requirement.evidence_required,
        "severity": requirement.severity,
        "source_page": requirement.source_page,
        "constraints": [
            {
                "metric": constraint.metric,
                "operator": constraint.operator,
                "threshold_value": constraint.threshold_value,
                "unit": constraint.unit,
                "currency": constraint.currency,
                "raw_text": constraint.raw_text
            }
            for constraint in requirement.constraints
        ]
    }
