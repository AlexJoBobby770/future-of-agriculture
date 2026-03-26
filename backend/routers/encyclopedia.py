"""
routers/encyclopedia.py
/encyclopedia endpoint — Agri Encyclopedia Data Server

Serves the contents of backend/data/agri_encyclopedia.json to the frontend.
All data is read from disk on each request so any future edits to the JSON
are reflected immediately without restarting the server.

Endpoints:
    GET /encyclopedia          — Full crop list + metadata
    GET /encyclopedia/{crop_id} — Single crop detail by ID (e.g. "paddy_01")
"""

import json
import os

from fastapi import APIRouter, HTTPException

# ── Router ─────────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/encyclopedia", tags=["Agri Encyclopedia"])

# ── Path to the data file ──────────────────────────────────────────────────────
# __file__ = backend/routers/encyclopedia.py
# We go up two levels (..) to reach the project root, then into backend/data/
_ENCYCLOPEDIA_PATH = os.path.join(
    os.path.dirname(__file__),   # backend/routers/
    "..",                         # backend/
    "data",
    "agri_encyclopedia.json",
)


def _load_encyclopedia() -> dict:
    """
    Reads and parses agri_encyclopedia.json from disk.
    Raises a 503 (not a 500) if the file is missing or malformed —
    this signals a configuration/deployment problem, not a bad request.
    """
    try:
        with open(_ENCYCLOPEDIA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail=(
                "Encyclopedia data file not found. "
                "Ensure 'backend/data/agri_encyclopedia.json' exists on the server."
            ),
        )
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Encyclopedia data file is corrupt or invalid JSON: {exc}",
        )


# ── GET /encyclopedia ──────────────────────────────────────────────────────────

@router.get(
    "",
    summary="List all crops in the Agri Encyclopedia",
    description=(
        "Returns the full encyclopedia: metadata about the dataset and the complete "
        "list of all crop entries including optimal conditions, pest management, "
        "climate resilience tips, and rotation rules."
    ),
)
def get_all_crops():
    """
    Returns the entire encyclopedia payload as-is.

    Response shape:
        {
            "metadata": { ... },
            "total_crops": int,
            "crops": [ { crop }, ... ],
            "rotation_logic_rules": { ... }
        }
    """
    data = _load_encyclopedia()
    crops = data.get("crops", [])

    return {
        "metadata": data.get("metadata", {}),
        "total_crops": len(crops),
        "crops": crops,
        "rotation_logic_rules": data.get("rotation_logic_rules", {}),
    }


# ── GET /encyclopedia/{crop_id} ────────────────────────────────────────────────

@router.get(
    "/{crop_id}",
    summary="Get a single crop by ID",
    description=(
        "Returns full details for one crop using its encyclopedia ID. "
        "Example IDs: `paddy_01`, `banana_01`, `cowpea_01`, `horsegram_01`. "
        "Returns 404 if the crop ID does not exist in the dataset."
    ),
)
def get_crop_by_id(crop_id: str):
    """
    Looks up a single crop entry by its `id` field.

    Args:
        crop_id: The encyclopedia crop identifier (e.g. "paddy_01").

    Returns:
        The full crop dict if found.

    Raises:
        404: If no crop with the given ID exists in the encyclopedia.
    """
    data = _load_encyclopedia()
    crops = data.get("crops", [])

    # Linear scan — 12 crops, so O(n) is perfectly fine here.
    # If the encyclopedia grows significantly, replace with a dict keyed by id.
    for crop in crops:
        if crop.get("id") == crop_id:
            return crop

    # Build a helpful error: tell the caller what IDs are actually valid
    valid_ids = [c.get("id") for c in crops if c.get("id")]
    raise HTTPException(
        status_code=404,
        detail={
            "error": f"Crop '{crop_id}' not found in the encyclopedia.",
            "valid_crop_ids": valid_ids,
        },
    )