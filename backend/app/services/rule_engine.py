"""
BidRakshak Deterministic Rule Engine

Evaluates compliance rules without external AI.
Supports: numeric comparisons, boolean checks, document presence,
count requirements, and threshold verification.
"""


def evaluate_rule(
    rule_type: str,
    observed_value: str | None,
    expected_value: str | None,
    operator: str | None
) -> dict:
    """
    Evaluate a single compliance rule deterministically.

    Returns dict with:
        result: PASS | FAIL | MISSING | REVIEW_REQUIRED
        calculation: human-readable calculation string
        explanation: why this result was produced
    """

    if observed_value is None or observed_value.strip() == "":
        return {
            "result": "MISSING",
            "calculation": "No observed value available",
            "explanation": "No evidence value was found for this requirement."
        }

    if rule_type == "NUMERIC_MINIMUM":
        return _evaluate_numeric_min(
            observed_value, expected_value, operator
        )

    if rule_type == "NUMERIC_MAXIMUM":
        return _evaluate_numeric_max(
            observed_value, expected_value, operator
        )

    if rule_type == "BOOLEAN":
        return _evaluate_boolean(observed_value, expected_value)

    if rule_type == "DOCUMENT_PRESENT":
        return _evaluate_document_present(observed_value)

    if rule_type == "COUNT_MINIMUM":
        return _evaluate_count_min(
            observed_value, expected_value, operator
        )

    if rule_type == "EQUALITY":
        return _evaluate_equality(observed_value, expected_value)

    if rule_type == "DATE_VALID":
        return _evaluate_date_valid(observed_value)

    # Default for unknown rule types
    return {
        "result": "REVIEW_REQUIRED",
        "calculation": f"Rule type '{rule_type}' requires manual review",
        "explanation": "This rule type could not be automatically evaluated."
    }


def _parse_numeric(value: str) -> float | None:
    """Extract numeric value from string, handling currency/units."""
    clean = value.strip()

    # Remove common prefixes/suffixes
    for prefix in ["₹", "Rs.", "Rs", "INR", "$"]:
        clean = clean.replace(prefix, "")

    for suffix in [
        "lakh", "lakhs", "crore", "crores",
        "GHz", "MHz", "GB", "TB", "MB",
        "kg", "mm", "cm", "m", "%",
        "years", "year", "months", "month",
        "days", "day"
    ]:
        clean = clean.replace(suffix, "")

    clean = clean.replace(",", "").strip()

    try:
        return float(clean)
    except (ValueError, TypeError):
        return None


def _evaluate_numeric_min(
    observed: str,
    expected: str | None,
    operator: str | None
) -> dict:
    obs_num = _parse_numeric(observed)
    exp_num = _parse_numeric(expected) if expected else None

    if obs_num is None or exp_num is None:
        return {
            "result": "REVIEW_REQUIRED",
            "calculation": f"Could not parse: observed='{observed}', expected='{expected}'",
            "explanation": "Numeric values could not be extracted for comparison."
        }

    op = operator or ">="
    calc = f"{obs_num} {op} {exp_num}"

    if op == ">=":
        passed = obs_num >= exp_num
    elif op == ">":
        passed = obs_num > exp_num
    else:
        passed = obs_num >= exp_num

    return {
        "result": "PASS" if passed else "FAIL",
        "calculation": calc,
        "explanation": (
            f"Observed value {obs_num} {'meets' if passed else 'does not meet'} "
            f"the minimum threshold of {exp_num}."
        )
    }


def _evaluate_numeric_max(
    observed: str,
    expected: str | None,
    operator: str | None
) -> dict:
    obs_num = _parse_numeric(observed)
    exp_num = _parse_numeric(expected) if expected else None

    if obs_num is None or exp_num is None:
        return {
            "result": "REVIEW_REQUIRED",
            "calculation": f"Could not parse: observed='{observed}', expected='{expected}'",
            "explanation": "Numeric values could not be extracted for comparison."
        }

    op = operator or "<="
    calc = f"{obs_num} {op} {exp_num}"
    passed = obs_num <= exp_num

    return {
        "result": "PASS" if passed else "FAIL",
        "calculation": calc,
        "explanation": (
            f"Observed value {obs_num} {'is within' if passed else 'exceeds'} "
            f"the maximum threshold of {exp_num}."
        )
    }


def _evaluate_boolean(
    observed: str,
    expected: str | None
) -> dict:
    obs_lower = observed.strip().lower()
    positive = obs_lower in (
        "true", "yes", "found", "present",
        "submitted", "available", "valid", "1"
    )

    exp_positive = True
    if expected:
        exp_positive = expected.strip().lower() in (
            "true", "yes", "required", "1"
        )

    passed = positive == exp_positive

    return {
        "result": "PASS" if passed else "FAIL",
        "calculation": f"'{observed}' == expected '{expected or 'Yes'}'",
        "explanation": (
            f"Requirement {'is satisfied' if passed else 'is not satisfied'}. "
            f"Evidence indicates: {observed}."
        )
    }


def _evaluate_document_present(observed: str) -> dict:
    obs_lower = observed.strip().lower()
    present = obs_lower in (
        "found", "present", "submitted",
        "available", "uploaded", "yes", "true"
    )

    return {
        "result": "PASS" if present else "MISSING",
        "calculation": f"Document presence: {observed}",
        "explanation": (
            f"Required document {'was found' if present else 'was not found'} "
            f"in the bid submission."
        )
    }


def _evaluate_count_min(
    observed: str,
    expected: str | None,
    operator: str | None
) -> dict:
    obs_num = _parse_numeric(observed)
    exp_num = _parse_numeric(expected) if expected else None

    if obs_num is None or exp_num is None:
        return {
            "result": "REVIEW_REQUIRED",
            "calculation": f"Could not parse counts: observed='{observed}', expected='{expected}'",
            "explanation": "Count values could not be extracted for comparison."
        }

    obs_int = int(obs_num)
    exp_int = int(exp_num)

    calc = f"{obs_int} >= {exp_int}"
    passed = obs_int >= exp_int

    if not passed and obs_int > 0:
        return {
            "result": "REVIEW_REQUIRED",
            "calculation": calc,
            "explanation": (
                f"Found {obs_int} out of {exp_int} required. "
                f"Partial evidence exists but does not fully meet the threshold."
            )
        }

    return {
        "result": "PASS" if passed else "FAIL",
        "calculation": calc,
        "explanation": (
            f"Count of {obs_int} {'meets' if passed else 'does not meet'} "
            f"the minimum requirement of {exp_int}."
        )
    }


def _evaluate_equality(
    observed: str,
    expected: str | None
) -> dict:
    if expected is None:
        return {
            "result": "REVIEW_REQUIRED",
            "calculation": f"No expected value to compare with '{observed}'",
            "explanation": "Expected value is not defined."
        }

    match = observed.strip().lower() == expected.strip().lower()

    return {
        "result": "PASS" if match else "FAIL",
        "calculation": f"'{observed}' == '{expected}'",
        "explanation": (
            f"Values {'match' if match else 'do not match'}. "
            f"Observed: '{observed}', Expected: '{expected}'."
        )
    }


def _evaluate_date_valid(observed: str) -> dict:
    obs_lower = observed.strip().lower()
    valid = obs_lower in (
        "valid", "current", "active", "yes", "true", "not expired"
    )

    return {
        "result": "PASS" if valid else "FAIL",
        "calculation": f"Date validity: {observed}",
        "explanation": (
            f"Date/validity check: {observed}. "
            f"{'Valid and current.' if valid else 'May be expired or invalid.'}"
        )
    }
