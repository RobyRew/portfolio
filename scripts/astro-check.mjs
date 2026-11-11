// Astro's type check (what `astro check` runs) on TypeScript 6: TypeScript 7 ships without the JS API Astro's
// checker drives, and @astrojs/check declares typescript ^5 || ^6 as a peer.
import { createRequire, registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const ts6 = require.resolve('typescript-6');

// @volar/kit (under @astrojs/language-server) takes typescript as a peer and
// calls require('typescript') itself, which resolves to the root TypeScript 7
// and its missing JS API. Point that bare specifier at typescript-6 for this
// process only.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'typescript') return { url: pathToFileURL(ts6).href, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});

const { AstroCheck } = await import('@astrojs/language-server');
const checker = new AstroCheck(root, ts6, undefined);
const result = await checker.lint({ logErrors: { level: 'hint' } });
console.info(`Result (${result.fileChecked} files, TypeScript ${checker.ts.version}): ${result.errors} errors, ${result.warnings} warnings, ${result.hints} hints`);
process.exitCode = result.errors > 0 ? 1 : 0;
