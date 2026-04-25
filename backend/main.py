from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yaml
from pydantic import BaseModel
from typing import Dict, Any

# Importar la lógica de simulación desde core de tu colega
from core.simulator import get_hardware_status

app = FastAPI(title="OmniEdge Studio - Hardware Engine")

# CORS - Configuración unificada para frontend y comunicación local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS DE DATOS ---

class OracleQueryRequest(BaseModel):
    mcu_id: str
    hardware_manifest: Dict[str, Any]
    query: str

# --- ENDPOINTS ---

@app.get("/")
def home():
    return {
        "mensaje": "OmniEdge Engine Online 🚀",
        "version": "1.0.0",
        "status": "Ready",
        "docs": "/docs"
    }

@app.get("/api/hardware-manifest")
def get_hardware_manifest():
    """Lee el archivo YAML real del disco."""
    try:
        with open("hardware_manifest.yaml", "r") as file:
            data = yaml.safe_load(file)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error leyendo manifest: {str(e)}")

@app.get("/status")
def status():
    """
    Retorna el estado del hardware usando la lógica de core.simulator
    esto alimenta la telemetría del frontend.
    """
    return get_hardware_status()

@app.post("/api/oracle")
def oracle_query(request: OracleQueryRequest):
    """
    Endpoint del Oráculo: Procesa consultas de IA sobre el hardware.
    """
    # Aquí es donde más adelante inyectaremos el MCP y la IA real
    return {
        "status": "success",
        "mcu_id": request.mcu_id,
        "analysis": {
            "verdict": "VALID",
            "headline": "Hardware configuration synced with Simulator",
            "reason": "La configuración es compatible con los modelos físicos definidos en core.",
            "target": {
                "mcu": request.mcu_id,
                "clockMhz": 480
            },
            "memory": {
                "sramTotalKb": 1024,
                "sramEstimatedUsedKb": 256,
                "sramUtilizationPercent": 25
            }
        },
        "message": f"Oracle analizó tu consulta sobre {request.mcu_id} usando el motor físico."
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)