#!/usr/bin/env python3
"""
Utility script that will eventually download raw hand pose recordings,
apply augmentation, and emit a training-ready dataset.
"""

from pathlib import Path


def main() -> None:
  data_dir = Path("data/hand-poses")
  data_dir.mkdir(parents=True, exist_ok=True)
  print(f"[prepare-hand-dataset] placeholder dataset directory: {data_dir.resolve()}")


if __name__ == "__main__":
  main()

