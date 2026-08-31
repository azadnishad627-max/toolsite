const NARA_API_KEY = "sk-nry-N9x2vinWSSErTHlfxxHd5nzXpTS_vUvq1mKThFcbUS4";
const NVIDIA_API_KEY = "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";

const MODELS = [
  { provider: 'nara', name: 'agnes-2.0-flash', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', name: 'agnes-2.5-flash', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', name: 'minimax-m3-free', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', name: 'mistral-large', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', name: 'nemotron-3-ultra', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', name: 'ox-alpha', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', name: 'qwen3.8-27b', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', name: 'stepfun-3.7-flash', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', name: 'tencent-hy3-free', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nara', name: 'laguna-s-2.1', url: 'https://router.bynara.id/v1', key: NARA_API_KEY },
  { provider: 'nvidia', name: 'meta/llama-3.2-11b-vision-instruct', url: 'https://integrate.api.nvidia.com/v1', key: NVIDIA_API_KEY },
  { provider: 'nvidia', name: 'nvidia/riva-translate-4b-instruct-v2', url: 'https://integrate.api.nvidia.com/v1', key: NVIDIA_API_KEY }
];

async function checkAll() {
  console.log("Checking all active models simultaneously...\n");
  
  await Promise.all(MODELS.map(async (m) => {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${m.url}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${m.key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: m.name,
          messages: [{ role: "user", content: "Reply in 1 word: Ready" }],
          max_tokens: 10
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      const dur = Date.now() - start;

      if (res.ok) {
        const data = await res.json();
        const rep = data.choices?.[0]?.message?.content?.trim();
        console.log(`✅ [${dur}ms] ${m.provider} -> ${m.name} : "${rep}"`);
      } else {
        console.log(`❌ [${res.status}] ${m.provider} -> ${m.name}`);
      }
    } catch (e) {
      console.log(`⚠️ [TIMEOUT/ERR] ${m.provider} -> ${m.name}: ${e.message}`);
    }
  }));
}

checkAll();
