const API_KEY = "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";
const BASE_URL = "https://integrate.api.nvidia.com/v1";

async function testFullGeneration() {
    console.log("Testing generation with 'meta/llama-3.2-11b-vision-instruct'...");

    const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "meta/llama-3.2-11b-vision-instruct",
            messages: [
                { role: "system", content: "You are an expert tutor." },
                { role: "user", content: "Write a 3-bullet summary of Photosynthesis for Class 10 with 1 MCQ." }
            ],
            max_tokens: 250,
            temperature: 0.3
        })
    });

    if (res.ok) {
        const data = await res.json();
        console.log("\n=== SUCCESSFUL OUTPUT ===");
        console.log(data.choices[0].message.content);
        console.log("\nUsage:", data.usage);
    } else {
        console.log("Error:", await res.text());
    }
}

testFullGeneration();
