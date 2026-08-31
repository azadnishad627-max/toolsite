async function testEndpoint() {
  console.log("Testing POST http://localhost:3001/api/ai/study-notes ...");

  try {
    const res = await fetch("http://localhost:3001/api/ai/study-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Photosynthesis and Light Reactions",
        grade: "Class 10 Biology",
        language: "English"
      })
    });

    console.log("HTTP Status:", res.status, res.statusText);
    const data = await res.json();
    console.log("Response Body:", JSON.stringify(data, null, 2).slice(0, 500));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testEndpoint();
