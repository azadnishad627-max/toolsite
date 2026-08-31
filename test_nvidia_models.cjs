const API_KEY = "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";
const BASE_URL = "https://integrate.api.nvidia.com/v1";

const TOP_MODELS = [
  "meta/llama-3.1-70b-instruct",
  "meta/llama-3.1-8b-instruct",
  "meta/llama-3.3-70b-instruct",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "deepseek-ai/deepseek-r1",
  "deepseek-ai/deepseek-v3",
  "mistralai/mistral-large-2-instruct",
  "google/gemma-2-9b-it",
  "google/gemma-3-12b-it",
  "qwen/qwen2.5-72b-instruct",
  "microsoft/phi-3-medium-128k-instruct"
];

async function testTopModels() {
    console.log("=== Testing Popular Models on NVIDIA NIM ===");

    for (const model of TOP_MODELS) {
        process.stdout.write(`Testing [${model}] ... `);
        try {
            const start = Date.now();
            const res = await fetch(`${BASE_URL}/chat/completions`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: "Say hello in 5 words!" }],
                    max_tokens: 30,
                    temperature: 0.2
                })
            });

            const duration = Date.now() - start;
            if (res.ok) {
                const data = await res.json();
                const reply = data.choices?.[0]?.message?.content?.trim();
                console.log(`✅ PASS (${duration}ms): "${reply}"`);
            } else {
                const err = await res.text();
                let msg = err;
                try { msg = JSON.parse(err).detail || JSON.parse(err).title || err; } catch(e){}
                console.log(`❌ FAIL (${res.status}): ${msg.slice(0, 100)}`);
            }
        } catch (e) {
            console.log(`❌ ERROR: ${e.message}`);
        }
    }
}

testTopModels();
