#!/usr/bin/env node
/**
 * Mac launcher for Books to Read.
 *
 * Setup:
 *   1. Make sure Node.js (version 12 or higher) is installed.
 *   2. Make this file runnable:
 *        chmod +x genbookstoread.js
 *   3. Optionally move it to a folder on your PATH.
 *
 * Use this file on Mac as your main script. It is meant to be run directly:
 *   ./genbookstoread.js --source /path/to/your/book/folder
 *   ./genbookstoread.js --source /path/to/your/book/folder --out output.md
 *   ./genbookstoread.js --out existing-note.md
 *
 * If you omit --source, then --out must point to an existing note whose
 * frontmatter already contains:
 *   source: "/path/to/your/book/folder"
 *
 * Examples:
 *   ./genbookstoread.js --source ~/Documents/MyBooks
 *   ./genbookstoread.js --source ~/Documents/MyBooks --out reading-list.md
 *   ./genbookstoread.js --source ~/Documents/MyBooks --out ~/Output/my-reading-list.md
 *   ./genbookstoread.js --out ~/Vault/Books\ to\ Read.md
 */
const { fail, main } = require("./genbookstoread-core");

main(
  process.argv.slice(2),
  [
    "./genbookstoread.js --source /path/to/your/book/folder",
    "./genbookstoread.js --source /path/to/your/book/folder --out output.md",
    "./genbookstoread.js --out existing-note.md",
  ]
).catch((err) => {
  fail(`Error: ${err.message}`, 3);
});
