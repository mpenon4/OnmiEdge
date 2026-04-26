const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyBGh1iOFsX564XSlbakUa_HgujOlvuUg3U";
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    console.log(`\nTesting: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hola");
    const response = await result.response;
    const text = response.text();
    console.log(`✅ ${modelName} WORKS!`);
    console.log(`Response: ${text.substring(0, 150)}`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName}: ${error.message.substring(0, 120)}`);
    return false;
  }
}

async function test() {
  const models = ["gemini-2.0-flash-exp", "gemini-1.5-pro-exp", "gemini-exp"];
  
  for (const m of models) {
    if (await testModel(m)) process.exit(0);
  }
  
  console.log("\n🔥 No models available!");
  process.exit(1);
}

test();

