const fs = require('fs');

const API_KEY = "sk-nry-N9x2vinWSSErTHlfxxHd5nzXpTS_vUvq1mKThFcbUS4";
const BASE_URL = "https://router.bynara.id/v1";

async function testModels() {
    console.log("Fetching models...");
    const modelsRes = await fetch(`${BASE_URL}/models`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const modelsData = await modelsRes.json();
    const models = modelsData.data.map(m => m.id);
    console.log(`Found ${models.length} models. Testing them now...\n`);

    const workingModels = [];
    const failedModels = [];

    // Test sequentially or in small batches to avoid rate limits
    for (const model of models) {
        try {
            const res = await fetch(`${BASE_URL}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 5
                })
            });

            if (res.ok) {
                workingModels.push(model);
                console.log(`[PASS] ${model}`);
            } else {
                const errData = await res.text();
                let errMsg = errData;
                try { errMsg = JSON.parse(errData).error.message; } catch(e){}
                failedModels.push({ model, error: errMsg });
                console.log(`[FAIL] ${model} - ${errMsg}`);
            }
        } catch (err) {
            failedModels.push({ model, error: err.message });
            console.log(`[ERROR] ${model} - ${err.message}`);
        }
    }

    console.log("\n=== WORKING MODELS ===");
    console.log(workingModels.join("\n"));
    
    fs.writeFileSync("working_models.txt", workingModels.join("\n"));
    console.log("\nDone.");
}

testModels();
