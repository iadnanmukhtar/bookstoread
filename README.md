# Books to Read

## What this script does

Looks through your digital library (PDFs and other file types) and builds a "Books to Read" document in Markdown format. It helps you keep track of what you're currently reading, what's up next, what you've already finished, and what you did not finish.

## How it could look in Obsidian

<img width="1048" height="915" alt="image" src="https://github.com/user-attachments/assets/db937f4b-23c1-4c1c-8f1e-401b5a1352b2" />

## How it works

- Walks through your digital library folder and all its subfolders.
- Ignores hidden files and folders whose names start with a period.
- Figures out the reading status of each book based on labels you've added to the file or folder name.
- Produces a neatly organized document grouped by status and folder.
- Saves the result to a file, or just prints it to the screen if you don't specify one.

## Labels

Add these labels to your file or folder names to set the reading status:

- `[In Progress]` — you're currently reading this
- `[To Do]` — you plan to read this
- `[Complete]` — you've finished this
- `[Not Complete]` — you started it but did not finish it
- `[Exclude]` — skip this; it gets collected at the bottom of the document

These labels map to the generated section headings like this:

- `[In Progress]` → `Currently Reading`
- `[To Do]` → `Reading Next`
- `[Complete]` → `Read`
- `[Not Complete]` → `Did Not Finish`

## A couple of things to know

- Books inside a folder labeled `[Exclude]` won't show up in the main list. They'll appear together in a separate section at the end.
- Labels are stripped from the titles shown in the document, so your reading list stays clean. The links still point to the right files on your computer.

---

## Getting started

### Mac

These steps assume you're using Terminal.

1. Make sure Node.js (version 12 or higher) is installed on your computer.
2. Put the script files somewhere you'll remember.
3. Open Terminal and make the script runnable:
   ```bash
   chmod +x genbookstoread.js
   ```
4. Optionally, move it to a folder on your PATH so you can run it from anywhere.

Use `genbookstoread.js` as your main script. It's set up to run directly as `./genbookstoread.js ...` without any extra typing.

### Windows

> **Note:** The Windows version has not been tested. The instructions below are provided as a guide, but you may run into issues. If something doesn't work, check that Node.js is installed and that both script files are in the same folder.

1. Make sure Node.js (version 12 or higher) is installed on your computer.
2. Put `genbookstoread-windows.bat` and `genbookstoread-windows.js` in the same folder. You don't need `chmod +x` on Windows.
3. Use `genbookstoread-windows.bat` as your launcher. It calls the `.js` file for you, so you don't need to type `node` each time.

---

## Running the script

The script takes two options:

- `--source` tells it which folder to scan.
- `--out` tells it where to save the output file.

If you leave out `--out`, the list prints to the screen. If you leave out `--source`, the script will look for a `source:` path inside the frontmatter of your existing `--out` file and use that instead.

### Mac

**Just see the list in Terminal:**
```bash
./genbookstoread.js --source ~/Documents/MyBooks
```

**Save the list to a file:**
```bash
./genbookstoread.js --source ~/Documents/MyBooks --out reading-list.md
```

**Save it to a specific location:**
```bash
./genbookstoread.js --source ~/Documents/MyBooks --out ~/Output/my-reading-list.md
```

### Windows

> **Note:** The Windows version has not been tested.

**Just see the list in PowerShell:**
```powershell
genbookstoread-windows.bat --source C:\Users\YourName\Documents\MyBooks
```

**Save it to a file:**
```powershell
genbookstoread-windows.bat --source C:\Users\YourName\Documents\MyBooks --out reading-list.md
```

**Save it to a specific location:**
```powershell
genbookstoread-windows.bat --source C:\Users\YourName\Documents\MyBooks --out C:\Users\YourName\Output\my-reading-list.md
```

### What the options mean

- `--source` (required, unless your `--out` file already has a `source:` value in its frontmatter): The folder where your digital library lives.
- `--out` (optional): Where to save the generated list. Leave it out and the list prints to the screen instead.

### What you get

The script produces a Markdown document with sections for Currently Reading, Reading Next, Read, Did Not Finish, and Excluded books, organized by subfolder, with a clickable link and status indicator for each book. It also writes `source:` and `lastupdated:` into the document's frontmatter automatically, with `lastupdated:` stored in your current local time zone.

---

## Using it inside Obsidian

If you use Obsidian, you can wire this script up to run with a single click using the Shell commands plugin.

### Setup

1. **Install the Shell commands plugin:**
   - Go to Settings → Community plugins → Browse
   - Search for "Shell commands," install it, and turn it on

2. **Create a template note:**
   - Make a new note in your vault, for example `Books to Read.md`
   - Add this at the very top, replacing the path with the actual location of your digital library:
     ```yaml
     ---
     type: "Books to Read"
     source: "/path/to/your/digital-library"
     ---
     ```
   - Leave the rest blank, or add a line like "Generating..." as a placeholder. The script will replace it when you run the command. The `source:` path and `lastupdated:` value are preserved and updated automatically each time using your current local time zone.

3. **Set up the shell command:**
   - Go to Settings → Shell commands and click "Add command"
   - In the Command field, enter the full path to the script along with `--out` pointing to the active note. If the note already has a `source:` value in its frontmatter, you can leave out `--source`. If it doesn't yet, include `--source` with the path to your digital library.
   - The paths below are just examples. Swap in the actual location where you saved the script.

   **Mac, using the note's existing `source:` frontmatter:**
   ```
   /Users/yourname/bin/genbookstoread.js --out {{file_path:absolute}}
   ```

   **Mac, setting the source folder explicitly:**
   ```
   /Users/yourname/bin/genbookstoread.js --out {{file_path:absolute}} --source /path/to/your/digital-library
   ```

   **Windows, using the note's existing `source:` frontmatter:**
   ```
   C:\Users\YourName\bin\genbookstoread-windows.bat --out {{file_path:absolute}}
   ```

   **Windows, setting the source folder explicitly:**
   ```
   C:\Users\YourName\bin\genbookstoread-windows.bat --out {{file_path:absolute}} --source C:\path\to\your\digital-library
   ```

   - Under "Show in," pick Editor menu or File menu so it's easy to find.
   - Turn on "Save output to active file" so the generated list replaces your template.
   - Give it a name like "Generate Books to Read."

### Running it in Obsidian

1. Open your `Books to Read.md` note.
2. Right-click in the editor (or use the file menu) and choose your shell command.
3. The script finds your digital library folder from `--source`, or from the note's existing `source:` frontmatter if you left `--source` out, then writes the generated list into the note.
4. Save when prompted.

Whenever you add new books or update labels, just run the command again to refresh the list.
