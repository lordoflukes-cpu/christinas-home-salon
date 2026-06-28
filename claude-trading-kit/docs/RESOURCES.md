# Resources — shared Google Drive folder (action required)

A shared resources folder accompanies this kit:

**<https://drive.google.com/drive/folders/1b_RddzT8fyUalYx_G7JiIiAkhYvvb2qi?usp=sharing>**

## Status: NOT yet incorporated
The folder's contents could **not** be pulled into the kit automatically. Two access attempts both
failed:
- The **Google Drive connector (MCP)** returned `requires approval` — the assistant can't grant
  that itself.
- The **public link** returned `403 Forbidden` — the folder isn't open to anonymous fetch.

So nothing from the Drive folder is in this kit yet. This file is the placeholder/pointer.

## What needs to be done — pick ONE
**Option A — authorize the Drive connector (preferred, lets the assistant fetch directly)**
1. In Claude, enable/authorize the **Google Drive** integration for the session/account that owns
   (or has been shared) this folder.
2. When prompted, **approve** the Google Drive tool call.
3. Ask the assistant: *"fetch the Drive folder `1b_RddzT8fyUalYx_G7JiIiAkhYvvb2qi` and incorporate
   the relevant resources."* It will list the contents, fold in what's useful, and note what it
   used.

**Option B — make the link publicly viewable**
1. In Google Drive: right-click the folder → **Share** → **General access** → **Anyone with the
   link** → **Viewer**.
2. Ask the assistant to fetch the link again. (Note: even then, programmatic fetch of Drive folder
   listings can be unreliable — Option A or C is more dependable.)

**Option C — drop the files in directly**
1. Download the folder contents and place them under `resources/` in this kit (create the folder),
   **or** attach/upload them in the chat.
2. Ask the assistant to incorporate them. Tell it what each file is if the names aren't obvious.

## What the assistant will do once it has access
- List every file, then fold relevant items into the right place: sample datasets →
  `resources/` (and referenced from `data-explore` / `data-validate` examples); plugin notes →
  the matching `external-plugins/*.md`; anything trading-doc-like → `docs/`.
- Cite exactly which files were used and where, and skip anything containing secrets/credentials
  (those never get committed — see `connectors/README.md` security note).
