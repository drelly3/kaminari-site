// Lets the preview be started from the parent folder.
process.chdir(new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
await import('./serve.mjs');
