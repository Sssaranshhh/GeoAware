"""
Process MOSDAC INSAT Third Dataset (CTP)
========================================

Reads HDF5 files from:
    dataset/raw_third_dataset/

Saves processed output to:
    dataset/third_processed/

Designed for INSAT L2B CTP (Cloud Top Properties)
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

import h5py
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.ndimage import zoom


# ==========================================================
# CONFIG
# ==========================================================

class Config:
    PROJECT_ROOT = Path(__file__).parent

    RAW_DATA_DIR = PROJECT_ROOT / "dataset" / "raw_third_dataset"
    PROCESSED_DATA_DIR = PROJECT_ROOT / "dataset" / "third_processed"
    LOG_DIR = PROJECT_ROOT / "logs"

    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    METADATA_PATH = PROCESSED_DATA_DIR / "metadata_third_dataset.csv"
    LOG_FILE = LOG_DIR / f"third_dataset_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"

    TARGET_SHAPE = (256, 256)
    OUTPUT_DTYPE = "float32"
    MAX_MISSING_PERCENT = 50.0
    SAVE_PNG = True


# ==========================================================
# LOGGER
# ==========================================================

def setup_logger():
    logger = logging.getLogger("THIRD_DATASET_PIPELINE")
    logger.setLevel(logging.INFO)

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


# ==========================================================
# HELPERS
# ==========================================================

def inspect_hdf5(filepath: Path) -> List[Dict]:
    datasets = []
    with h5py.File(filepath, "r") as f:
        def visitor(name, obj):
            if isinstance(obj, h5py.Dataset):
                datasets.append({
                    "name": name,
                    "shape": obj.shape,
                    "size": obj.size
                })
        f.visititems(visitor)
    return datasets


def select_primary_band(datasets: List[Dict]) -> Optional[str]:
    keywords = ["CTP", "DATA", "IMG"]

    for key in keywords:
        for ds in datasets:
            if key.lower() in ds["name"].lower() and len(ds["shape"]) >= 2:
                return ds["name"]

    if datasets:
        datasets.sort(key=lambda x: x["size"], reverse=True)
        return datasets[0]["name"]

    return None


def extract_2d_slice(data: np.ndarray, logger):
    if data.ndim == 2:
        return data

    if data.ndim == 3:
        mid = data.shape[0] // 2
        logger.info(f"3D data detected → using time index {mid}")
        return data[mid]

    raise ValueError(f"Unsupported shape: {data.shape}")


def handle_missing(data: np.ndarray):
    mask = np.isnan(data) | np.isinf(data)
    count = mask.sum()
    data[mask] = 0.0
    return data, count


def normalize(data: np.ndarray):
    mn, mx = data.min(), data.max()
    if mn == mx:
        return np.zeros_like(data)
    return (data - mn) / (mx - mn)


def resize(data: np.ndarray):
    if data.shape == Config.TARGET_SHAPE:
        return data

    zoom_factors = (
        Config.TARGET_SHAPE[0] / data.shape[0],
        Config.TARGET_SHAPE[1] / data.shape[1]
    )

    return zoom(data, zoom_factors, order=1)


# ==========================================================
# FILE PROCESSOR
# ==========================================================

def process_file(filepath: Path, logger):
    logger.info(f"Processing {filepath.name}")

    datasets = inspect_hdf5(filepath)
    band = select_primary_band(datasets)

    if not band:
        logger.warning("No dataset found")
        return None

    with h5py.File(filepath, "r") as f:
        raw = f[band][:]
        raw = extract_2d_slice(raw, logger)

    raw = raw.astype("float32")

    raw, missing = handle_missing(raw)
    missing_pct = (missing / raw.size) * 100

    if missing_pct > Config.MAX_MISSING_PERCENT:
        logger.warning("Too many missing values. Skipped.")
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


# ==========================================================
# MAIN
# ==========================================================

def main():
    logger = setup_logger()

    files = sorted(Config.RAW_DATA_DIR.glob("*.h5"))
    logger.info(f"Found {len(files)} HDF5 files")

    rows = []

    for i, file in enumerate(files, 1):
        logger.info(f"[{i}/{len(files)}]")
        result = process_file(file, logger)
        if result:
            rows.append(result)

    df = pd.DataFrame(rows)
    df.to_csv(Config.METADATA_PATH, index=False)

    logger.info("Processing Complete")
    logger.info(df.head().to_string())


if __name__ == "__main__":
    main()
