const NARA_API_KEY = "sk-nry-N9x2vinWSSErTHlfxxHd5nzXpTS_vUvq1mKThFcbUS4";
const NVIDIA_API_KEY = "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";

const CANDIDATES = [
  { provider: 'nara', model: 'deepseek-v4-flash', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', model: 'qwen-3.8-max-free', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', model: 'mistral-medium-3-5', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', model: 'agnes-2.0-flash', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nvidia', model: 'meta/llama-3.2-11b-vision-instruct', url: 'https://integrate.api.nvidia.com/v1', key: NVIDIA_API_KEY },
  { provider: 'nvidia', model: 'google/diffusiongemma-26b-a4b-it', url: 'https://integrate.api.nvidia.com/v1', key: NVIDIA_API_KEY }
];

async function findFastest() {
  console.log("Testing candidate models for Speed & JSON output...\n");

  const prompt = 'Output raw JSON: {"title": "Photosynthesis", "notes": ["Plants use sunlight"], "mcq": {"q": "Byproduct?", "ans": "Oxygen"}}';

  for (const c of CANDIDATES) {
    process.stdout.write(`Testing [${c.provider}] ${c.model} ... `);
    try {
      const start = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${c.url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: c.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      const dur = Date.now() - start;

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        console.log(`✅ SUCCESS in ${dur}ms!`);
        console.log(`   Sample: ${content?.slice(0, 100).replace(/\n/g, ' ')}\n`);
      } else {
        console.log(`❌ Error ${res.status}: ${await res.text()}\n`);
      }
    } catch (e) {
      console.log(`❌ Failed: ${e.message}\n`);
    }
  }
}

findFastest();
