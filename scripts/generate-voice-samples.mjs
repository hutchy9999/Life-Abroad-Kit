import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Run with Node 22.12+ from the project. Credentials never enter the website.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.argv[2] || resolve(root, '.audio-samples'));
const config = await readFile(resolve(root, '.env.audio.local'), 'utf8');
const values = Object.fromEntries(config.replace(/^\uFEFF/, '').split(/\r?\n/)
  .filter(line => line.trim() && !line.trim().startsWith('#'))
  .map(line => {
    const split = line.indexOf('=');
    return [line.slice(0, split).trim(), line.slice(split + 1).trim().replace(/^(["'])(.*)\1$/, '$2')];
  }));
const key = values.AZURE_SPEECH_KEY;
const region = values.AZURE_SPEECH_REGION;
if (!key || !/^[a-z]+\d*$/.test(region || '')) {
  console.error('Add a Speech key and valid region to .env.audio.local.');
  process.exit(1);
}
const { scenarios } = await import('../src/content.ts');
const phrases = scenarios[0].phrases.filter((_, index) => [0, 2, 5].includes(index));
const xml = text => text.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
await mkdir(output, { recursive: true });
for (const voice of ['es-ES-ElviraNeural', 'es-ES-AlvaroNeural']) {
  const ssml = `<speak version="1.0" xml:lang="es-ES"><voice name="${voice}">${phrases.map(p => xml(p.es)).join('<break time="900ms"/>')}</voice></speak>`;
  let response;
  try {
    response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
        'User-Agent': 'LifeAbroadKitLocalAudioGenerator',
      },
      body: ssml,
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    console.error('Could not connect to Azure Speech. Check network access and try again.');
    process.exit(1);
  }
  if (!response.ok) {
    console.error(`Azure Speech returned HTTP ${response.status}. Check the key, region and resource status. No credentials have been logged.`);
    process.exit(1);
  }
  const audio = Buffer.from(await response.arrayBuffer());
  if (audio.length < 1000 || !response.headers.get('content-type')?.startsWith('audio/')) {
    throw new Error('Azure did not return a usable audio file.');
  }
  await writeFile(resolve(output, `${voice}.mp3`), audio);
  console.log(`Saved ${voice}.mp3 (${audio.length} bytes)`);
}
await writeFile(resolve(output, 'sample-text.txt'), phrases.map(p => `${p.es}\n${p.en}`).join('\n\n') + '\n');
console.log(`Generated two Spain-Spanish samples using ${phrases.reduce((sum, p) => sum + p.es.length, 0) * 2} text characters.`);
