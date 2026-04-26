const apiKey = "AIzaSyBGh1iOFsX564XSlbakUa_HgujOlvuUg3U";

async function listAvailableModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("📋 Modelos disponibles:");
    if (data.models) {
      data.models.forEach(model => {
        console.log(`  - ${model.name}`);
      });
    } else {
      console.log("Error:", data);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listAvailableModels();
