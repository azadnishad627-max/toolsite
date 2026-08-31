const NVIDIA_API_KEY = "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";

async function testDiffusionGemma() {
  console.log("Testing google/diffusiongemma-26b-a4b-it on NVIDIA NIM for Study Notes...\n");

  const promptText = `
You are an expert tutor. Create complete study notes in JSON format for:
Topic: "प्रकाश संश्लेषण (Photosynthesis)"
Language: "Hindi"

Output format:
{
  "chapterTitle": "प्रकाश संश्लेषण",
  "subject": "जीव विज्ञान - कक्षा 10",
  "keyTakeaway": "पौधे सूर्य के प्रकाश, जल और CO2 से ग्लूकोज बनाते हैं।",
  "handwrittenNotes": [
    {
      "heading": "1. प्रकाश संश्लेषण की परिभाषा",
      "bulletPoints": [
        "यह एक जैव-रासायनिक प्रक्रिया है जिसमें सौर ऊर्जा को रासायनिक ऊर्जा में बदला जाता है।",
        "समीकरण: 6CO2 + 6H2O + प्रकाश -> C6H12O6 + 6O2",
        "यह क्रिया पौधों के हरित लवक (Chloroplast) में होती है।"
      ],
      "highlightNote": "क्लोरोफिल (पर्णहरित) सूर्य के प्रकाश को अवशोषित करता है।"
    }
  ],
  "diagram": {
    "title": "प्रकाश संश्लेषण प्रक्रिया प्रवाह",
    "steps": [
      { "step": "प्रकाश अवशोषण", "detail": "पत्तियों द्वारा सौर ऊर्जा ग्रहण करना" },
      { "step": "जल का अपघटन", "detail": "ऑक्सीजन गैस का निष्कासन" },
      { "step": "ग्लूकोज निर्माण", "detail": "CO2 से शर्करा का संश्लेषण" }
    ]
  },
  "mcqs": [
    {
      "question": "प्रकाश संश्लेषण में कौन सी गैस निकलती है?",
      "options": ["ऑक्सीजन", "कार्बन डाइऑक्साइड", "नाइट्रोजन", "हाइड्रोजन"],
      "correctIndex": 0,
      "explanation": "जल के प्रकाशीय अपघटन से ऑक्सीजन गैस निकलती है।"
    }
  ],
  "examQuestions": [
    {
      "marks": 2,
      "question": "प्रकाश संश्लेषण का रासायनिक समीकरण लिखिए।",
      "answer": "6CO2 + 6H2O + सूर्य का प्रकाश -> C6H12O6 + 6O2"
    }
  ]
}

Return ONLY raw JSON without markdown formatting.
`;

  const start = Date.now();
  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/diffusiongemma-26b-a4b-it",
      messages: [
        { role: "system", content: "You strictly output raw JSON." },
        { role: "user", content: promptText }
      ],
      max_tokens: 1800,
      temperature: 0.2
    })
  });

  console.log(`Status: ${res.status} in ${Date.now() - start}ms`);
  if (res.ok) {
    const data = await res.json();
    console.log("\n=== SUCCESSFUL OUTPUT ===");
    console.log(data.choices[0].message.content);
  } else {
    console.log("Error:", await res.text());
  }
}

testDiffusionGemma();
