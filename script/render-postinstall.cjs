const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");

// Existing Render services may ignore render.yaml and only execute npm install.
// Build during Render's build phase, where more memory is available than at runtime.
if (process.env.RENDER === "true" && !existsSync("dist/index.cjs")) {
  console.log("Render detectado; gerando o bundle de produção durante a instalação...");

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "build"], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error("Não foi possível executar o build do Render.", result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
