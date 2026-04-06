# Books to Read

## What this script does

Looks through your digital book collection (PDFs and other file types) and builds a "Books to Read" document in Markdown format. It helps you keep track of what you're currently reading, what's up next, and what you've already finished.

## How it works

- Walks through your book folder and all its subfolders.
- Figures out the reading status of each book based on labels you've added to the file or folder name.
- Produces a neatly organized document grouped by status and folder.
- Saves the result to a file, or just prints it to the screen if you don't specify one.

## Labels

Add these labels to your file or folder names to set the reading status:

- `[In Progress]` — you're currently reading this
- `[To Do]` — you plan to read this
- `[Complete]` — you've finished this
- `[Exclude]` — skip this; it gets collected at the bottom of the document

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

1. Make sure Node.js (version 12 or higher) is installed on your computer.
2. Put `genbookstoread-windows.bat` and `genbookstoread-windows.js` in the same folder. You don't need `chmod +x` on Windows.
3. Use `genbookstoread-windows.bat` as your launcher. It calls the `.js` file for you, so you don't need to type `node` each time.

---

## Running the script

### Mac

**Just see the list in Terminal:**
```bash
./genbookstoread.js ~/Documents/MyBooks
```

**Save the list to a file:**
```bash
./genbookstoread.js ~/Documents/MyBooks reading-list.md
```

**Save it to a specific location:**
```bash
./genbookstoread.js ~/Documents/MyBooks ~/Output/my-reading-list.md
```

### Windows

**Just see the list in PowerShell:**
```powershell
genbookstoread-windows.bat C:\Users\YourName\Documents\MyBooks
```

**Save it to a file:**
```powershell
genbookstoread-windows.bat C:\Users\YourName\Documents\MyBooks reading-list.md
```

**Save it to a specific location:**
```powershell
genbookstoread-windows.bat C:\Users\YourName\Documents\MyBooks C:\Users\YourName\Output\my-reading-list.md
```

### What the two inputs mean

- **Your book folder** (required): The folder where your book files live.
- **Output file** (optional): Where to save the generated list. Leave this out and it prints to the screen instead.

### What you get

The script produces a Markdown document with sections for In Progress, To Do, Complete, and Excluded books, organized by subfolder, with a clickable link and status indicator for each book.

---

## Using it inside Obsidian

If you use Obsidian, you can wire this script up to run with a single click using the Shell commands plugin.

### Setup

1. **Install the Shell commands plugin:**
   - Go to Settings → Community plugins → Browse
   - Search for "Shell commands," install it, and turn it on

2. **Create a template note:**
   - Make a new note in your vault, for example `Books to Read.md`
   - Add this at the very top:
     ```yaml
     ---
     type: "Books to Read"
     source: ""
     ---
     ```
   - Leave the rest blank, or add a line like "Generating..." as a placeholder. The script will replace it when you run the command.

3. **Set up the shell command:**
   - Go to Settings → Shell commands and click "Add command"
   - In the Command field, enter the full path to the script, followed by the active file variable. The paths below are examples showing where you might have saved the script.

   **Mac:**
   ```
   /Users/yourname/bin/genbookstoread.js {{file_path:absolute}}
   ```

   **Windows:**
   ```
   C:\Users\YourName\bin\genbookstoread-windows.bat {{file_path:absolute}}
   ```

   - Swap in the actual location where you saved the script.
   - Under "Show in," pick Editor menu or File menu so it's easy to find.
   - Turn on "Save output to active file" so the generated list replaces your template.
   - Give it a name like "Generate Books to Read."

### Running it in Obsidian

1. Open your `Books to Read.md` note.
2. Right-click in the editor (or use the file menu) and choose your shell command.
3. The note fills in with your current book list organized by status and folder.
4. Save when prompted.

Whenever you add new books or update labels, just run the command again to refresh the list.