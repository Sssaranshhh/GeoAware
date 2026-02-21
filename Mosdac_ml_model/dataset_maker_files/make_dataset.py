import h5py
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

RAW_DIR = Path("dataset/raw_third_dataset")
CSV_OUT = "CTP_features_dataset.csv"

rows = []

h5_files = sorted(RAW_DIR.glob("*.h5"))

for idx, file in enumerate(h5_files, 1):
    print(f"[{idx}/{len(h5_files)}] Processing {file.name}")

    with h5py.File(file, "r") as f:

        if "CTP" not in f:
            print("Skipped: CTP not found")
            continue

        ctp = f["CTP"][:]
        ctt = f["CTT"][:]

        # Remove time dimension
        if ctp.ndim == 3:
            ctp = ctp[0]
        if ctt.ndim == 3:
            ctt = ctt[0]

        ctp = ctp.astype(np.float32)
        ctt = ctt.astype(np.float32)

        row = {
            "filename": file.name,
            "height": ctp.shape[0],
            "width": ctp.shape[1],

            # CTP stats
            "ctp_mean": float(np.mean(ctp)),
            "ctp_std": float(np.std(ctp)),
            "ctp_min": float(np.min(ctp)),
            "ctp_max": float(np.max(ctp)),
            "pct_ctp_lt_300": float(np.mean(ctp < 300) * 100),
            "pct_ctp_lt_200": float(np.mean(ctp < 200) * 100),

            # CTT stats
            "ctt_mean": float(np.mean(ctt)),
            "ctt_std": float(np.std(ctt)),
            "pct_ctt_lt_220": float(np.mean(ctt < 220) * 100),
            "pct_ctt_lt_240": float(np.mean(ctt < 240) * 100),

            "timestamp": f["time"][0] if "time" in f else None,
            "processed_at": datetime.utcnow().isoformat()
        }

        rows.append(row)

df = pd.DataFrame(rows)
df.to_csv(CSV_OUT, index=False)

print("\n✅ Extraction completed")
print(df.nunique())
