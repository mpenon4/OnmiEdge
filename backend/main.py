from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar la lógica de simulación desde core
from core.simulator import get_hardware_status

app = FastAPI(title="OmniEdge Studio - Hardware Engine")

# CORS - permite que el frontend (v0) pueda hablar con este motor
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    """Endpoint de bienvenida."""
    return {
        "mensaje": "OmniEdge Engine Online 🚀",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/status")
def status():
    """
    Endpoint principal que retorna el estado del hardware.
    
    Utiliza la lógica centralizada en core.simulator.
    Integrable con MCP y otros protocolos.
    """
    return get_hardware_status()


@app.get("/health")
def health_check():
    """Health check para orchestración."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)