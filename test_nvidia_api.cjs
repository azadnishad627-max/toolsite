const API_KEY = "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";
const BASE_URL = "https://integrate.api.nvidia.com/v1";

async function testNvidia() {
    console.log("=== Testing NVIDIA NIM API Key ===");
    console.log("Key:", API_KEY.slice(0, 10) + "..." + API_KEY.slice(-5));

    // 1. Check Models
    try {
        console.log("\n1. Fetching available models...");
        const res = await fetch(`${BASE_URL}/models`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            }
        });

        console.log("Models HTTP Status:", res.status, res.statusText);
        if (!res.ok) {
            const errText = await res.text();
            console.log("Error Response:", errText);
            return;
        }

        const data = await res.json();
        console.log(`Successfully connected! Total Models available: ${data.data ? data.data.length : 'N/A'}`);
        if (data.data && data.data.length > 0) {
            console.log("\nSample Models Available on this key:");
            data.data.slice(0, 15).forEach(m => console.log(" - " + m.id));
        }

        // 2. Test a sample completion with Llama 3.3 / Nemotron
        console.log("\n2. Testing Chat Completion with 'meta/llama-3.3-70b-instruct'...");
        const testModel = data.data?.find(m => m.id.includes("llama-3.3-70b") || m.id.includes("llama-3.1-70b") || m.id.includes("nemotron"))?.id || data.data?.[0]?.id;
        
        console.log(`Using model: ${testModel}`);
        const chatRes = await fetch(`${BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: testModel,
                messages: [{ role: "user", content: "Hello! Answer in 1 short sentence: who are you?" }],
                max_tokens: 50,
                temperature: 0.2
            })
        });

        console.log("Chat Completion HTTP Status:", chatRes.status);
        if (chatRes.ok) {
            const chatData = await chatRes.json();
            console.log("\n🎉 AI Response Success:");
            console.log(chatData.choices?.[0]?.message?.content);
            console.log("\nUsage / Tokens:", chatData.usage);
        } else {
            const chatErr = await chatRes.text();
            console.log("Chat error:", chatErr);
        }

    } catch (e) {
        console.error("Test failed with exception:", e);
    }
}

testNvidia();
