/**
 * Windows Node.js entry point for Books to Read.
 *
 * Most Windows users should run genbookstoread-windows.bat instead of calling
 * this file directly. The batch file launches this script for you.
 *
 * Keep this file in the same folder as genbookstoread-windows.bat.
 *
 * Direct usage:
 *   node genbookstoread-windows.js C:\path\to\your\book\folder [output.md]
 */
const { fail, main } = require("./genbookstoread-core");

main(
  process.argv.slice(2),
  "node genbookstoread-windows.js C:\\path\\to\\your\\book\\folder [output.md]"
).catch((err) => {
  fail(`Error: ${err.message}`, 3);
});
