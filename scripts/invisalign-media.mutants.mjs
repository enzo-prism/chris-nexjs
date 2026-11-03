import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const IMAGE = "client/src/components/invisalign/InvisalignMediaImage.tsx";
const VIDEO = "client/src/components/invisalign/InvisalignMediaVideo.tsx";
const DATA = "client/src/pages/invisalignConsultMedia.ts";

const originals = new Map();

function read(file) {
  if (!originals.has(file)) {
    originals.set(file, readFileSync(file, "utf8"));
  }
  return originals.get(file);
}

function restoreAll() {
  for (const [file, contents] of originals) {
    writeFileSync(file, contents);
  }
}

function apply(file, from, to) {
  const source = read(file);
  if (!source.includes(from)) {
    throw new Error(`Mutant seed not found in ${file}: ${from}`);
  }
  writeFileSync(file, source.replace(from, to));
}

function run(command) {
  const result = spawnSync(command, {
    shell: true,
    encoding: "utf8",
    env: process.env,
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

const mutants = [
  {
    name: "fetchPriority=high",
    apply: () =>
      apply(
        IMAGE,
        '      loading="lazy"',
        '      loading="lazy"\n      fetchPriority="high"',
      ),
    tests: ["unit", "e2e"],
  },
  {
    name: "loading=eager",
    apply: () => apply(IMAGE, '      loading="lazy"', '      loading="eager"'),
    tests: ["unit", "e2e"],
  },
  {
    name: "track never rendered",
    apply: () =>
      apply(
        VIDEO,
        `      <track
        kind="captions"
        srcLang="en"
        label="English"
        src={video.captions}
        default
      />`,
        "",
      ),
    tests: ["e2e"],
  },
  {
    name: "kind=subtitles",
    apply: () => apply(VIDEO, '        kind="captions"', '        kind="subtitles"'),
    tests: ["e2e"],
  },
  {
    name: "plain <img> for everything",
    apply: () => {
      apply(IMAGE, 'import Image from "next/image";\n\n', "");
      apply(
        IMAGE,
        `    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading="lazy"`,
        `    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading="lazy"`,
      );
    },
    tests: ["unit", "e2e"],
  },
  {
    name: "load-time caption check removed",
    apply: () =>
      apply(
        DATA,
        `assertProductionVideos(INVISALIGN_CONSULT_VIDEOS);
assertProductionGraphics(INVISALIGN_CONSULT_GRAPHICS);
`,
        "",
      ),
    tests: ["unit"],
  },
];

const commands = {
  unit: "pnpm run test:invisalign-media",
  e2e: "pnpm run test:invisalign-media:e2e",
};

function mutantKilled(mutant) {
  for (const kind of mutant.tests) {
    const result = run(commands[kind]);
    if (!result.ok) {
      return { killed: true, by: kind, status: result.status };
    }
  }
  return { killed: false };
}

const results = [];

try {
  for (const mutant of mutants) {
    restoreAll();
    mutant.apply();
    const outcome = mutantKilled(mutant);
    results.push({ name: mutant.name, ...outcome });
    console.log(
      outcome.killed
        ? `KILLED  ${mutant.name} (${outcome.by})`
        : `SURVIVED ${mutant.name}`,
    );
  }
} finally {
  restoreAll();
}

const survived = results.filter((result) => !result.killed);
console.log("");
console.log(
  `Mutants: ${results.length - survived.length}/${results.length} killed`,
);
if (survived.length) {
  console.error(`Surviving mutants: ${survived.map((item) => item.name).join(", ")}`);
  process.exit(1);
}

console.log("All targeted mutants were killed.");
