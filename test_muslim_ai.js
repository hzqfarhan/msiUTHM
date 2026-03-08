async function testMuslimAI() {
    const query = "Apa hukum solat?";
    const endpoint = `https://x.0cd.fun/ai/agent/muslim-ai?query=${encodeURIComponent(query)}&language=ms`;
    const apiKey = "0cd-b5df99832b42af16e3313b4845759a5e95fc9da16a39e1ee";

    console.log("Fetching from:", endpoint);

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
            },
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Data keys:", Object.keys(data));
        console.log("Full Data:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testMuslimAI();
