from __future__ import annotations
import argparse
import concurrent.futures as cf
import os
from pathlib import Path
import subprocess
from typing import Iterable, List, Tuple

# ================= CONFIG =================

TARGET_SECONDS = 10
DEFAULT_EXTS = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v"}

CROP_WIDTH = None
CROP_HEIGHT = None
CROP_X = "((iw-ow)/2)"
CROP_Y = "((ih-oh)/2)"

# ---- Final canvas (must be divisible by 14) ----
TARGET_W = 504  
TARGET_H = 504   

def run(cmd: List[str]) -> Tuple[int, str, str]:
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return proc.returncode, proc.stdout, proc.stderr

def ffprobe_duration(path: Path) -> float | None:
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=nk=1:nw=1",
        str(path)
    ]
    code, out, _ = run(cmd)
    if code != 0:
        return None
    try:
        return float(out.strip())
    except ValueError:
        return None

def build_filter_chain() -> str:
    """
    1) Crop (per config; no clamp).
    2) Scale with AR preserved to *cover* TARGET_W x TARGET_H
       (force_original_aspect_ratio=increase → upscales small inputs, downscales large).
    3) Center-crop to EXACT TARGET_W x TARGET_H (no padding).
    4) Format for broad compatibility.
    """
    
    auto_square = "min(iw\\,ih)"

    w_expr = str(CROP_WIDTH) if CROP_WIDTH is not None else auto_square
    h_expr = str(CROP_HEIGHT) if CROP_HEIGHT is not None else auto_square
    x_expr = CROP_X or "((iw-ow)/2)"
    y_expr = CROP_Y or "((ih-oh)/2)"

    crop1 = f"crop={w_expr}:{h_expr}:{x_expr}:{y_expr}"
    scale = f"scale={TARGET_W}:{TARGET_H}:force_original_aspect_ratio=increase"
    crop2 = f"crop={TARGET_W}:{TARGET_H}:(iw-ow)/2:(ih-oh)/2"
    fmt   = "format=yuv420p"

    return f"{crop1},{scale},{crop2},{fmt}"

def build_ffmpeg_cmd(in_path: Path, out_path: Path, seconds: int = TARGET_SECONDS) -> List[str]:
    chain = build_filter_chain()
    return [
        "ffmpeg", "-hide_banner", "-y",
        "-i", str(in_path),        # put -i before -t to make -t act on output
        "-t", str(seconds),
        "-vf", chain,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        str(out_path)
    ]

def iter_videos(root: Path, exts: set[str]) -> Iterable[Path]:
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in exts:
            yield p

def make_outpath(in_path: Path, in_root: Path, out_root: Path) -> Path:
    rel = in_path.relative_to(in_root)
    return (out_root / rel).with_suffix(".mp4")

def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

def process_one(in_path: Path, in_root: Path, out_root: Path, overwrite: bool) -> Tuple[Path, str]:
    try:
        dur = ffprobe_duration(in_path)
        if dur is None:
            return in_path, "SKIP: could not read duration"
        if dur < TARGET_SECONDS:
            return in_path, f"SKIP: duration {dur:.2f}s < {TARGET_SECONDS}s"

        out_path = make_outpath(in_path, in_root, out_root)
        if out_path.exists() and not overwrite:
            return in_path, "SKIP: already exists (use --overwrite)"

        ensure_parent(out_path)
        cmd = build_ffmpeg_cmd(in_path, out_path, TARGET_SECONDS)
        code, _, err = run(cmd)
        if code != 0:
            if out_path.exists():
                try: out_path.unlink()
                except Exception: pass
            last = (err.splitlines()[-1] if err else "unknown error")
            return in_path, f"ERROR: ffmpeg failed: {last}"
        return in_path, "OK"
    except Exception as e:
        return in_path, f"ERROR: {e}"



def parse_args() -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Crop+trim videos to 10s and scale (no pad) to 504x504 (divisible by 14).")
    ap.add_argument("--input", "-i", default=Path("path/to/input/videos"), type=Path, help="Input folder")
    ap.add_argument("--output", "-o", default=Path("path/to/output/videos"), type=Path, help="Output folder")
    ap.add_argument("--exts", nargs="*", default=sorted(DEFAULT_EXTS),
                    help=f"File extensions to include (default: {sorted(DEFAULT_EXTS)})")
    ap.add_argument("--workers", type=int, default=4, help="Parallel workers")
    ap.add_argument("--overwrite", action="store_true", help="Overwrite existing outputs")
    return ap.parse_args()

def main():
    args = parse_args()
    in_root: Path = args.input.resolve()
    out_root: Path = args.output.resolve()
    exts = {e.lower() if e.startswith(".") else f".{e.lower()}" for e in args.exts}

    if not in_root.exists() or not in_root.is_dir():
        raise SystemExit(f"Input folder not found: {in_root}")
    out_root.mkdir(parents=True, exist_ok=True)

    videos = list(iter_videos(in_root, exts))
    if not videos:
        print("No matching video files found.")
        return

    print(f"Found {len(videos)} files. Processing with {args.workers} workers...")
    results: List[Tuple[Path, str]] = []
    with cf.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(process_one, v, in_root, out_root, args.overwrite) for v in videos]
        for fut in cf.as_completed(futures):
            results.append(fut.result())

    ok = sum(1 for _, s in results if s == "OK")
    skipped = [(p, s) for p, s in results if s.startswith("SKIP")]
    errors = [(p, s) for p, s in results if s.startswith("ERROR")]

    print(f"\nDone. OK: {ok}, SKIP: {len(skipped)}, ERROR: {len(errors)}")
    if skipped:
        print("\nSkipped:")
        for p, s in skipped[:50]:
            print(f"  {p}: {s}")
        if len(skipped) > 50:
            print(f"  ... ({len(skipped)-50} more)")
    if errors:
        print("\nErrors:")
        for p, s in errors:
            print(f"  {p}: {s}")

if __name__ == "__main__":
    main()
