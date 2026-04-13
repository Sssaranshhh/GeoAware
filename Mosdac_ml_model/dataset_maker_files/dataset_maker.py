import h5py
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

RAW_DIR = Path("dataset/raw")
EXCEL_OUT = "raw_flood_dataset.xlsx"
CSV_OUT = "IMC_raw_flood_dataset.csv"

rows = []

h5_files = sorted(RAW_DIR.glob("*.h5"))

if not h5_files:
    raise FileNotFoundError("No HDF5 files found in dataset/raw")

for idx, file in enumerate(h5_files, 1):
    print(f"[{idx}/{len(h5_files)}] Processing {file.name}")

    with h5py.File(file, "r") as f:
        if "IMC" not in f:
            print("  Skipped: IMC dataset not found")
            continue

        data = f["IMC"][:]

        # Handle (time, H, W)
        if data.ndim == 3:
            data = data[0]

        data = data.astype(np.float32)

        # ---- statistics ----
        row = {
            "filename": file.name,
            "height": data.shape[0],
            "width": data.shape[1],
            "mean": float(np.mean(data)),
            "std": float(np.std(data)),
            "min": float(np.min(data)),
            "max": float(np.max(data)),
            "pct_gt_1": float(np.mean(data > 1) * 100),
            "pct_gt_5": float(np.mean(data > 5) * 100),
            "pct_gt_10": float(np.mean(data > 10) * 100),
            "timestamp": f["time"][0] if "time" in f else None,
            "processed_at": datetime.utcnow().isoformat()
        }

        rows.append(row)

# Create DataFrame
df = pd.DataFrame(rows)

# Save outputs
df.to_excel(EXCEL_OUT, index=False)
df.to_csv(CSV_OUT, index=False)

print("\n✅ Extraction completed")
print(f"Excel saved → {EXCEL_OUT}")
print(f"CSV saved   → {CSV_OUT}")
print(df.head())
