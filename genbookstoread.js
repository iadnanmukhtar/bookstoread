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
 *   ./genbookstoread.js /path/to/your/book/folder [output.md]
 *
 * Examples:
 *   ./genbookstoread.js ~/Documents/MyBooks
 *   ./genbookstoread.js ~/Documents/MyBooks reading-list.md
 *   ./genbookstoread.js ~/Documents/MyBooks ~/Output/my-reading-list.md
 */
const { fail, main } = require("./genbookstoread-core");

main(
  process.argv.slice(2),
  "./genbookstoread.js /path/to/your/book/folder [output.md]"
).catch((err) => {
  fail(`Error: ${err.message}`, 3);
});
