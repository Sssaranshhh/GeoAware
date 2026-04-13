"""
MOSDAC INSAT Satellite Data Processing Pipeline (FIXED VERSION)
===============================================================

Converts HDF5 satellite imagery from MOSDAC (ISRO) into ML-ready datasets.
Correctly handles time dimensions to avoid duplicate outputs.

Author: GeoAware ML Team
Version: 1.1 (Bug-fixed)
Date: February 2026
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Tuple, Optional, List

import h5py
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.ndimage import zoom


# =============================================================================
# CONFIG
# =============================================================================

class Config:
    PROJECT_ROOT = Path(__file__).parent

    RAW_DATA_DIR = PROJECT_ROOT / "dataset" / "raw"
    PROCESSED_DATA_DIR = PROJECT_ROOT / "dataset" / "processed"
    LOG_DIR = PROJECT_ROOT / "logs"

    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    METADATA_PATH = PROCESSED_DATA_DIR / "metadata.csv"
    LOG_FILE = LOG_DIR / f"processing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

    OUTPUT_DTYPE = "float32"
    TARGET_SHAPE = (256, 256)

    HANDLE_MISSING = "mask"       # mask | fill_mean | fill_zero
    MAX_MISSING_PERCENT = 50.0

    SAVE_PNG = True
    LOG_LEVEL = logging.INFO
    VERBOSE = True


# =============================================================================
# LOGGING
# =============================================================================

def setup_logger() -> logging.Logger:
    logger = logging.getLogger("INSAT_PIPELINE")
    logger.setLevel(Config.LOG_LEVEL)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s",
        "%Y-%m-%d %H:%M:%S"
    )

    fh = logging.FileHandler(Config.LOG_FILE)
    fh.setFormatter(formatter)

    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(formatter)

    logger.addHandler(fh)
    logger.addHandler(ch)
    return logger


# =============================================================================
# HDF5 HELPERS
# =============================================================================

def inspect_hdf5(filepath: Path) -> List[Dict]:
    datasets = []
    with h5py.File(filepath, "r") as f:
        def visitor(name, obj):
            if isinstance(obj, h5py.Dataset):
                datasets.append({
                    "name": name,
                    "shape": obj.shape,
                    "dtype": str(obj.dtype),
                    "size": obj.size
                })
        f.visititems(visitor)
    return datasets


def select_primary_band(datasets: List[Dict]) -> Optional[str]:
    preferred = ["IMC", "TIR", "VIS", "IMG", "DATA"]

    for key in preferred:
        for ds in datasets:
            if key.lower() in ds["name"].lower() and len(ds["shape"]) >= 2:
                return ds["name"]

    # fallback → largest dataset
    datasets.sort(key=lambda x: np.prod(x["shape"]), reverse=True)
    return datasets[0]["name"] if datasets else None


# =============================================================================
# DATA PROCESSING
# =============================================================================

def extract_2d_slice(data: np.ndarray, logger: logging.Logger) -> np.ndarray:
    """
    SAFELY extract a unique 2D slice.
    """
    if data.ndim == 2:
        return data

    if data.ndim == 3:
        t = data.shape[0] // 2  # middle timestep (NOT always 0)
        logger.info(f"3D data detected → using time index {t}")
        return data[t]

    raise ValueError(f"Unsupported data shape: {data.shape}")


def handle_missing(data: np.ndarray) -> Tuple[np.ndarray, int]:
    mask = np.isnan(data) | np.isinf(data)
    count = mask.sum()

    if Config.HANDLE_MISSING == "fill_mean" and count > 0:
        data[mask] = np.nanmean(data)

    elif Config.HANDLE_MISSING == "fill_zero":
        data[mask] = 0.0

    return data, count


def normalize(data: np.ndarray) -> np.ndarray:
    valid = data[~np.isnan(data)]
    if valid.size == 0:
        return data

    mn, mx = valid.min(), valid.max()
    if mn == mx:
        return np.full_like(data, 0.5)

    return np.clip((data - mn) / (mx - mn), 0, 1)


def resize(data: np.ndarray) -> np.ndarray:
    if data.shape == Config.TARGET_SHAPE:
        return data

    factors = (
        Config.TARGET_SHAPE[0] / data.shape[0],
        Config.TARGET_SHAPE[1] / data.shape[1]
    )
    return zoom(data, factors, order=1)


# =============================================================================
# FILE PROCESSOR
# =============================================================================

def process_file(filepath: Path, logger: logging.Logger) -> Optional[Dict]:
    logger.info(f"Processing {filepath.name}")

    datasets = inspect_hdf5(filepath)
    band = select_primary_band(datasets)

    if band is None:
        logger.warning("No valid dataset found")
        return None

    with h5py.File(filepath, "r") as f:
        raw = f[band][:]
        raw = extract_2d_slice(raw, logger)

    logger.info(
        f"Raw stats | mean={raw.mean():.6f}, std={raw.std():.6f}, "
        f"min={raw.min():.6f}, max={raw.max():.6f}"
    )

    raw, missing = handle_missing(raw)
    missing_pct = missing / raw.size * 100

    if missing_pct > Config.MAX_MISSING_PERCENT:
        logger.warning("Too many missing values → skipped")
        return None

    data = normalize(raw)
    data = resize(data).astype(Config.OUTPUT_DTYPE)

    out_path = Config.PROCESSED_DATA_DIR / f"{filepath.stem}.npy"
    np.save(out_path, data)

    if Config.SAVE_PNG:
        plt.imshow(data, cmap="viridis")
        plt.colorbar()
        plt.title(filepath.stem)
        plt.savefig(out_path.with_suffix(".png"), dpi=120)
        plt.close()

    return {
        "filename": filepath.name,
        "band": band,
        "shape": data.shape,
        "mean": float(data.mean()),
        "std": float(data.std()),
        "min": float(data.min()),
        "max": float(data.max()),
        "missing_pct": round(missing_pct, 3),
        "processed_at": datetime.now().isoformat()
    }


# =============================================================================
# MAIN
# =============================================================================

def main():
    logger = setup_logger()
    files = sorted(Config.RAW_DATA_DIR.glob("*.h5"))

    logger.info(f"Found {len(files)} HDF5 files")

    rows = []
    for i, f in enumerate(files, 1):
        logger.info(f"[{i}/{len(files)}]")
        result = process_file(f, logger)
        if result:
            rows.append(result)

    df = pd.DataFrame(rows)
    df.to_csv(Config.METADATA_PATH, index=False)

    logger.info("Processing complete")
    logger.info(df.head().to_string())


if __name__ == "__main__":
    main()
