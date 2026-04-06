/**
 * Windows Node.js entry point for Books to Read.
 *
 * Most Windows users should run genbookstoread-windows.bat instead of calling
 * this file directly. The batch file launches this script for you.
 *
 * Keep this file in the same folder as genbookstoread-windows.bat.
 *
 * Direct usage:
 *   node genbookstoread-windows.js --source C:\path\to\your\book\folder
 *   node genbookstoread-windows.js --source C:\path\to\your\book\folder --out output.md
 *   node genbookstoread-windows.js --out existing-note.md
 *
 * If you omit --source, then --out must point to an existing note whose
 * frontmatter already contains:
 *   source: "/path/to/your/book/folder"
 */
const { fail, main } = require("./genbookstoread-core");

main(
  process.argv.slice(2),
  [
    "node genbookstoread-windows.js --source C:\\path\\to\\your\\book\\folder",
    "node genbookstoread-windows.js --source C:\\path\\to\\your\\book\\folder --out output.md",
    "node genbookstoread-windows.js --out existing-note.md",
  ]
).catch((err) => {
  fail(`Error: ${err.message}`, 3);
});
