import { createRequire } from "node:module";
import { arch, platform } from "node:os";

const require = createRequire(import.meta.url);

// The published `chroma` CLI refuses Windows x64 before it loads the binary,
// even though chromadb-js-bindings-win32-x64-msvc ships that binary.
if (platform() !== "win32" || arch() !== "x64") {
  console.error(
    `This Chroma launcher supports Windows x64. This machine is ${platform()} ${arch()}.`
  );
  process.exit(1);
}

const binding = require("chromadb-js-bindings-win32-x64-msvc");
binding.cli(["chroma", ...process.argv.slice(2)]);
