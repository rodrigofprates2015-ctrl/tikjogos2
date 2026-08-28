const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");

const serverBundle = "dist/index.cjs";

if (!existsSync(serverBundle)) {
  console.log(`${serverBundle} não encontrado; executando o build de produção...`);

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "build"], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error("Não foi possível iniciar o build de produção.", result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(serverBundle)) {
  console.error(`O build terminou sem gerar ${serverBundle}.`);
  process.exit(1);
}
