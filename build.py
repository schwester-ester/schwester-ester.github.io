#!/usr/bin/env python3
"""Build the content index with Python's standard library. Run: python3 build.py"""
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
SECTIONS = ("math", "conversations", "blog")
PHOTO_TYPES = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
FILE_TYPES = {".txt", ".md", ".pdf", ".tex", ".csv", ".zip"}


def read(path):
    return path.read_text(encoding="utf-8-sig")


def url(path):
    return quote(path.relative_to(ROOT).as_posix(), safe="/")


def build():
    data = {"intro": read(ROOT / "content/intro.txt"), "portrait": None, "sections": {}}
    photos = sorted(path for path in (ROOT / "profile-pic").iterdir()
                    if path.is_file() and path.suffix.lower() in PHOTO_TYPES)
    if photos:
        # Naming a photo 'profile' explicitly selects it when there are multiple.
        chosen = next((photo for photo in photos if photo.stem.lower() == "profile"), photos[0])
        data["portrait"] = url(chosen)
    for section in SECTIONS:
        folder = ROOT / "content" / section
        files = []
        for path in sorted(folder.rglob("*")):
            if (not path.is_file() or path.suffix.lower() not in FILE_TYPES
                    or path == folder / "index.txt"
                    or any(part.startswith(".") for part in path.relative_to(folder).parts)):
                continue
            kind = path.suffix.lower().lstrip(".")
            entry = {"title": path.stem.replace("-", " ").replace("_", " "),
                     "path": url(path), "type": kind}
            if kind in {"txt", "md"}:
                entry["text"] = read(path)
                first_line = entry["text"].splitlines()
                if first_line and first_line[0].startswith("# "):
                    entry["title"] = first_line[0][2:].strip()
            files.append(entry)
        data["sections"][section] = {"intro": read(folder / "index.txt"), "files": files}
    (ROOT / "content.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Built content.json: {sum(len(s['files']) for s in data['sections'].values())} files; "
          f"portrait: {data['portrait'] or 'placeholder'}")


if __name__ == "__main__":
    build()
