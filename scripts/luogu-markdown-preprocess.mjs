import fs from "node:fs";
import path from "node:path";

const sourceDir = path.resolve("content");
const outputDir = path.resolve("content-luogu");
let files = 0, changedFiles = 0, containers = 0;

if (!fs.existsSync(sourceDir)) {
  console.error("找不到 content 目录，请确认当前项目路径。");
  process.exit(1);
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function convert(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out = [], stack = [];
  let fence = "", fenceLen = 0, count = 0;

  for (const line of lines) {
    if (fence) {
      out.push(line);
      const c = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (c && c[1][0] === fence && c[1].length >= fenceLen) {
        fence = ""; fenceLen = 0;
      }
      continue;
    }

    const f = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (f) {
      const info = f[2].trim();
      const numbered = info.match(/^([^\s]+)\s+line-numbers$/);
      out.push(numbered
        ? line.match(/^ */)[0] + f[1] + numbered[1] + " {linenos=true}"
        : line);
      fence = f[1][0]; fenceLen = f[1].length;
      continue;
    }

    const s = line.replace(/\\\s*$/, "");
    const o = s.match(/^(\s*)(:{3,})(info|success|warning|error|epigraph)\[([^\]]*)\](?:\{([^}]*)\})?\s*$/);

    if (o) {
      const [, indent, marks, type, label, flags = ""] = o;
      if (type === "epigraph") {
        out.push(`${indent}{{% epigraph author="${esc(label.trim())}" %}}`);
        stack.push({ n: marks.length, tag: "epigraph" });
      } else {
        const open = /(?:^|[\s,])open(?:$|[\s,])/.test(flags);
        out.push(`${indent}{{% callout type="${type}" title="${esc(label.trim())}"${open ? ' open="true"' : ""} %}}`);
        stack.push({ n: marks.length, tag: "callout" });
      }
      count++;
      continue;
    }

    const c = s.match(/^\s*(:{3,})\s*$/);
    if (c && stack.length && c[1].length === stack[stack.length - 1].n) {
      out.push(`{{% /${stack.pop().tag} %}}`);
      count++;
      continue;
    }
    out.push(line);
  }
  return { text: out.join("\n"), count };
}

function walk(srcDir) {
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, ent.name);
    const rel = path.relative(sourceDir, src);
    const dst = path.join(outputDir, rel);

    if (ent.isDirectory()) {
      fs.mkdirSync(dst, { recursive: true });
      walk(src);
    } else if (ent.isFile() && /\.(md|markdown|mdown)$/i.test(ent.name)) {
      files++;
      const r = convert(fs.readFileSync(src, "utf8"));
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.writeFileSync(dst, r.text, "utf8");
      if (r.count) { changedFiles++; containers += r.count; }
    } else if (ent.isFile()) {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
    }
  }
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
walk(sourceDir);

console.log(`扫描 Markdown 文件：${files}`);
console.log(`发生转换的文件：${changedFiles}`);
console.log(`转换的容器标记：${containers}`);
console.log(`输出目录：${outputDir}`);
