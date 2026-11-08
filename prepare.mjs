// Buildless static output for hosting. The root HTML files are also GitHub Pages ready.
import { mkdir, copyFile, cp } from 'node:fs/promises';
const files=['index.html','drills.html','session.html','about.html','style.css','nav.js','drill-data.js','drills.js','session.js','favicon-32.png','apple-touch-icon.png','.nojekyll'];
await mkdir(new URL('./dist/',import.meta.url),{recursive:true});
for(const file of files) await copyFile(new URL(file,import.meta.url),new URL('dist/' + file,import.meta.url));
await cp(new URL('./images/',import.meta.url),new URL('./dist/images/',import.meta.url),{recursive:true});
console.log('Prepared four-page static site in dist.');

