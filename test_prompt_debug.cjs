const NVIDIA_API_KEY = "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";
const NARA_API_KEY = "sk-nry-N9x2vinWSSErTHlfxxHd5nzXpTS_vUvq1mKThFcbUS4";

async function testPrompt() {
  console.log("=== Debugging AI Generation Request ===");

  const promptText = `
You are an expert tutor.
Create concise study material in JSON format for:
Topic: "Photosynthesis"
Language: "Hindi"

Output format:
{
  "chapterTitle": "प्रकाश संश्लेषण",
  "subject": "जीव विज्ञान (कक्षा 10)",
  "keyTakeaway": "पौधे सूर्य के प्रकाश में भोजन बनाते हैं।",
  "handwrittenNotes": [
    {
      "heading": "1. परिभाषा",
      "bulletPoints": ["पौधे सौर ऊर्जा को रासायनिक ऊर्जा में बदलते हैं।"],
      "highlightNote": "क्लोरोफिल मुख्य वर्णक है।"
    }
  ],
  "diagram": {
    "title": "प्रकाश संश्लेषण प्रक्रिया",
    "steps": [{ "step": "प्रकाश अवशोषण", "detail": "क्लोरोफिल प्रकाश सोखता है" }]
  },
  "mcqs": [
    {
      "question": "प्रकाश संश्लेषण का मुख्य उत्पाद क्या है?",
      "options": ["ग्लूकोज", "नाइट्रोजन", "मीथेन", "अमोनिया"],
      "correctIndex": 0,
      "explanation": "पौधे ग्लूकोज बनाते हैं।"
    }
  ],
  "examQuestions": [
    {
      "marks": 2,
      "question": "प्रकाश संश्लेषण क्या है?",
      "answer": "पौधों द्वारा भोजन बनाने की प्रक्रिया।"
    }
  ]
}

CRITICAL: Return ONLY raw JSON without markdown code fences.
`;

  // 1. Test NVIDIA
  console.log("\n1. Testing NVIDIA NIM (meta/llama-3.2-11b-vision-instruct)...");
  try {
    const start = Date.now();
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages: [
          { role: "system", content: "You are an expert tutor. Output raw JSON only." },
          { role: "user", content: promptText }
        ],
        max_tokens: 1500,
        temperature: 0.2
      })
    });

    console.log(`NVIDIA Status: ${res.status} (${Date.now() - start}ms)`);
    if (res.ok) {
      const data = await res.json();
      console.log("NVIDIA Content length:", data.choices?.[0]?.message?.content?.length);
      console.log("NVIDIA Content sample:", data.choices?.[0]?.message?.content?.slice(0, 300));
    } else {
      console.log("NVIDIA Error:", await res.text());
    }
  } catch (e) {
    console.log("NVIDIA Catch Error:", e.message);
  }

  // 2. Test Nara
  console.log("\n2. Testing Nara Router (deepseek-v4-flash)...");
  try {
    const start = Date.now();
    const res = await fetch("https://router.bynara.id/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NARA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          { role: "system", content: "You are an expert tutor. Output raw JSON only." },
          { role: "user", content: promptText }
        ],
        max_tokens: 1500,
        temperature: 0.2
      })
    });

    console.log(`Nara Status: ${res.status} (${Date.now() - start}ms)`);
    if (res.ok) {
      const data = await res.json();
      console.log("Nara Content length:", data.choices?.[0]?.message?.content?.length);
      console.log("Nara Content sample:", data.choices?.[0]?.message?.content?.slice(0, 300));
    } else {
      console.log("Nara Error:", await res.text());
    }
  } catch (e) {
    console.log("Nara Catch Error:", e.message);
  }
}

testPrompt();
