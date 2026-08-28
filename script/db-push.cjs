const { spawnSync } = require("node:child_process");

const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
const executable = (name) => process.platform === "win32" ? `${name}.cmd` : name;

if (isRender) {
  console.log("Render detectado: executando o build do site sem alterar o banco de dados...");

  const result = spawnSync(executable("npm"), ["run", "build"], {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ""} --max-old-space-size=1024`.trim(),
    },
  });

  if (result.error) {
    console.error("Não foi possível executar o build do Render.", result.error);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

const result = spawnSync(
  executable("npx"),
  ["drizzle-kit", "push", ...process.argv.slice(2)],
  { stdio: "inherit", env: process.env },
);

if (result.error) {
  console.error("Não foi possível executar o Drizzle Kit.", result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
