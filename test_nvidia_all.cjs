const API_KEY = "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";
const BASE_URL = "https://integrate.api.nvidia.com/v1";

async function testAllAvailableModels() {
    console.log("Fetching exact model list from NVIDIA NIM...");
    const res = await fetch(`${BASE_URL}/models`, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json'
        }
    });

    const data = await res.json();
    const modelIds = data.data.map(m => m.id);
    console.log(`Found ${modelIds.length} models on account. Testing in parallel...\n`);

    const working = [];

    await Promise.all(modelIds.map(async (id) => {
        try {
            const start = Date.now();
            const chatRes = await fetch(`${BASE_URL}/chat/completions`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: id,
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 10
                })
            });

            if (chatRes.ok) {
                const resData = await chatRes.json();
                const reply = resData.choices?.[0]?.message?.content?.trim() || "OK";
                console.log(`✅ [PASS] ${id} (${Date.now() - start}ms) -> "${reply.slice(0, 30)}"`);
                working.push(id);
            } else {
                console.log(`❌ [FAIL] ${id} (${chatRes.status})`);
            }
        } catch (e) {
            console.log(`⚠️ [ERROR] ${id}`);
        }
    }));

    console.log(`\n=== TOTAL WORKING MODELS: ${working.length} ===`);
    console.log(working.join("\n"));
}

testAllAvailableModels();
