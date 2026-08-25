import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/components/panels/ProductMaster');
const storeAbs = path.resolve('src/store');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory()
      ? walk(p)
      : entry.name.endsWith('.jsx')
        ? [p]
        : [];
  });
}

const files = walk(root).filter((file) => {
  const s = fs.readFileSync(file, 'utf8');
  return s.includes('productStore') || s.includes('upsertProductPageData');
});

const changed = [];

for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const rel = path
    .relative(path.dirname(file), storeAbs)
    .split(path.sep)
    .join('/');
  const esc = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 1. Retarget productStore -> GeneralContext (same directory).
  s = s.replace(/productStore'/g, "GeneralContext'");
  s = s.replace(/productStore"/g, 'GeneralContext"');

  // 2. Rename hook tokens.
  s = s.replace(/\buseProductField\b/g, 'useEntityField');
  s = s.replace(/\buseProductRows\b/g, 'useEntityRows');
  s = s.replace(/\buseProductSelector\b/g, 'useEntitySelector');

  // 3. Inject the entity key ('product') as the first argument.
  s = s.replace(/\buseUpsertField\(/g, "useEntityField('product', ");
  s = s.replace(/\buseUpsertRows\(/g, "useEntityRows('product', ");
  s = s.replace(/\buseEntitySelector\(/g, "useEntitySelector('product', ");

  const isWriter = s.includes('upsertProductPageData');
  if (isWriter) {
    // Remove the now-unused context destructure and its import.
    s = s.replace(
      /\s*const \{ upsertProductPageData \} = useProductContext\(\);\n/g,
      '\n',
    );
    s = s.replace(
      /import \{ useProductContext \} from ['"].*ProductContext['"];\n/g,
      '',
    );

    // Swap the write for the generic upsertEntityData call.
    s = s.replace(/upsertProductPageData\(/g, "upsertEntityData('product', ");
    // Any remaining identifier references (dependency arrays etc.).
    s = s.replace(/\bupsertProductPageData\b/g, 'upsertEntityData');

    // Ensure upsertEntityData is imported from GeneralContext.
    const importRe = new RegExp(
      `(import \\{)([^{}]*)(\\} from ['"]${esc}/GeneralContext['"];)`,
    );
    if (importRe.test(s)) {
      s = s.replace(importRe, '$1upsertEntityData, $2$3');
    } else {
      const lines = s.split('\n');
      const idx = lines.findIndex((l) => l.startsWith('import '));
      lines.splice(
        idx >= 0 ? idx + 1 : 0,
        0,
        `import { upsertEntityData } from '${rel}/GeneralContext';`,
      );
      s = lines.join('\n');
    }
  }

  fs.writeFileSync(file, s);
  changed.push(file);
}

console.log(`CHANGED ${changed.length} files`);
changed.forEach((f) => console.log(path.relative(process.cwd(), f)));
