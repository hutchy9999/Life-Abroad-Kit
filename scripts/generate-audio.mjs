import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { scenarios } from '../src/content.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = await readFile(resolve(root, '.env.audio.local'), 'utf8');
const values = Object.fromEntries(config.replace(/^\uFEFF/, '').split(/\r?\n/)
  .filter(line => line.trim() && !line.trim().startsWith('#'))
  .map(line => {
    const split = line.indexOf('=');
    return [line.slice(0, split).trim(), line.slice(split + 1).trim().replace(/^(["'])(.*)\1$/, '$2')];
  }));
const key = values.AZURE_SPEECH_KEY;
const region = values.AZURE_SPEECH_REGION;
if (!key || !/^[a-z]+\d*$/.test(region || '')) throw new Error('Configure the private .env.audio.local file first.');
const voice = 'es-ES-ElviraNeural';
const format = 'audio-48khz-192kbitrate-mono-mp3';
const xml = text => text.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const manifest = {};
const phrases = scenarios.flatMap(s => s.phrases);
await mkdir(resolve(root, 'public/audio/es-ES'), { recursive: true });
await mkdir(resolve(root, 'src/generated'), { recursive: true });
let requested = false;
for (const [index, phrase] of phrases.entries()) {
  // Text, voice and format form the cache key, so edits cannot play stale speech.
  const hash = createHash('sha256').update(JSON.stringify([phrase.es, voice, format])).digest('hex').slice(0, 16);
  const path = `audio/es-ES/${hash}.mp3`;
  const target = resolve(root, 'public', path);
  let exists = false;
  try { await access(target); exists = true; } catch {}
  if (!exists) {
    // Stay below the F0 limit of 20 synthesis requests per 60 seconds.
    if (requested) await new Promise(resolve => setTimeout(resolve, 3500));
    requested = true;
    let response;
    try {
      response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': format,
          'User-Agent': 'LifeAbroadKitLocalAudioGenerator',
        },
        body: `<speak version="1.0" xml:lang="es-ES"><voice name="${voice}">${xml(phrase.es)}</voice></speak>`,
        signal: AbortSignal.timeout(60000),
      });
    } catch { throw new Error('Azure connection failed. Rerun to resume cached progress.'); }
    if (!response.ok) throw new Error(`Azure returned HTTP ${response.status}. Check resource credentials or quota, then rerun to resume.`);
    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.length < 1000 || !response.headers.get('content-type')?.startsWith('audio/')) throw new Error('Azure returned invalid audio.');
    await writeFile(target, audio);
  }
  manifest[phrase.es] = path;
  console.log(`${index + 1}/${phrases.length} ${phrase.id}${exists ? ' (cached)' : ''}`);
}
await writeFile(resolve(root, 'src/generated/audio.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Ready: ${phrases.length} phrases in ${voice}. Credentials stay local.`);
