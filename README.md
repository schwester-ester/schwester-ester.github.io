# Maya (Esty) Gusak

A small static website for https://schwester-ester.github.io. No framework, package installation, or database is needed.

## Edit the introduction or a section

Edit the relevant plain-text file:

- `content/intro.txt` — introduction on the home page.
- `content/math/index.txt` — text at the top of the math page.
- `content/conversations/index.txt` — text at the top of the conversations page.
- `content/blog/index.txt` — text at the top of the blog page.

Separate paragraphs with a blank line. You can also use a small Markdown subset: `# Heading`, `## Subheading`, `**bold**`, backtick code, lists beginning with `- `, and `[link text](https://example.com)`.

## Add a document

Drop a file into `content/math/`, `content/conversations/`, or `content/blog/`. Subfolders also work. It appears automatically in that section after the next build. Supported types: `.txt`, `.md`, `.pdf`, `.tex`, `.csv`, and `.zip`. Dot-prefixed files and folders are ignored. Only put files here that you intend to make public.

Text and Markdown files open inside the website with a **Back to math** (or the corresponding section) link. PDFs open in an embedded reader with the same back link and a download option. Other files download directly. Visitors can also use their browser's back button; document URLs can be bookmarked and shared.

The filename becomes the displayed title (`my-notes.txt` → `my notes`). To choose a title for a text or Markdown file, start it with `# My title`, followed by a blank line and the body:

```text
# A question about compactness

Here is the text of my note.
```

`.txt` files retain their line breaks and spacing. `.md` files use the small Markdown subset above. Arbitrary HTML is never executed. Math expressions are displayed as typed; LaTeX typesetting is not configured.

To link to one of your files from a section's intro, use its relative filename:

```text
Here are my [compactness notes](compactness.txt).

You can also find [a useful resource](https://example.com).
```

Files are listed alphabetically by filename. Prefix filenames with a date (such as `2026-11-08-a-note.txt`) or a number to control their order. A `# Title` on the first line lets you keep a clean displayed title.

## Add your profile photo

Put a JPG, PNG, WebP, or AVIF image in `profile-pic/`. The next build picks it up automatically. If there is more than one image, name the preferred one `profile.jpg` (or `profile.png`, etc.). The photo is cropped to fit; adjust `.portrait { object-position: ...; }` in `assets/style.css` if needed.

## Preview locally

```sh
python3 build.py
python3 -m http.server 8000
```

Open http://localhost:8000. Run `python3 build.py` again after changing content or adding a photo, then refresh. Open through the server rather than double-clicking `index.html`, because the site loads `content.json` with `fetch`.

## Publish on GitHub Pages

1. Sign in to the **schwester-ester** GitHub account and create a **public** repository named **schwester-ester.github.io**.
2. Upload these source files, including the `.github/workflows/pages.yml` file, to its `main` branch.
3. In the repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
4. In **Actions**, run the **Publish website** workflow (or push a new change).

After the workflow succeeds, the site is available at **https://schwester-ester.github.io/**. Every subsequent push to `main` rebuilds the document list and republishes the site. You can edit text or upload documents directly on GitHub; no local tools are required for future updates.

The publishing workflow uploads only the website assets, content folders, and supported profile photos. This README and the build script are not included in the deployed website.
