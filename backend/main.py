from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yaml # Esta librería es la que lee tu archivo .yaml
from pydantic import BaseModel

app = FastAPI()

# Esto permite que tu frontend (v0) pueda hablar con este motor de Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"mensaje": "OmniEdge Engine Online 🚀"}

@app.get("/api/hardware-manifest")
def get_hardware_manifest():
    """
    Devuelve el contenido del hardware manifest en formato JSON
    """
    try:
        with open("hardware_manifest.yaml", "r") as file:
            data = yaml.safe_load(file)
        return data
    except Exception as e:
        return {"error": str(e)}

@app.get("/status")
def get_hardware_status():
    # Abrimos y leemos el archivo que creaste recién
    with open("hardware_manifest.yaml", "r") as file:
        data = yaml.safe_load(file)
    
    # Simulamos un procesamiento de ingeniería
    mcu = data['target_hardware']['mcu_id']
    sram = data['target_hardware']['sram']
    
    # Enviamos la respuesta procesada
    return {
        "mcu_detectado": mcu,
        "memoria_disponible": sram,
        "estado": "Sincronizado",
        "telemetria": {
            "cpu_usage": "15%",
            "temp": "38°C"
        }
    }

# Modelo para recibir datos del Oracle Chat
class OracleQueryRequest(BaseModel):
    mcu_id: str
    hardware_manifest: dict
    query: str

@app.post("/api/oracle")
def oracle_query(request: OracleQueryRequest):
    """
    Endpoint que recibe consultas del frontend y devuelve análisis de Oracle
    """
    return {
        "status": "success",
        "mcu_id": request.mcu_id,
        "query": request.query,
        "analysis": {
            "verdict": "VALID",
            "headline": "Hardware configuration is valid",
            "reason": "All components are compatible with the selected MCU",
            "target": {
                "mcu": request.mcu_id,
                "clockMhz": 480
            },
            "memory": {
                "sramTotalKb": 2048,
                "sramEstimatedUsedKb": 512,
                "sramUtilizationPercent": 25,
                "flashTotalKb": 2048
            },
            "buses": [
                {
                    "bus": "SPI1",
                    "components": 1,
                    "utilizationPercent": 30
                }
            ],
            "pinConflicts": [],
            "issues": [],
            "checksRun": 12,
            "timestamp": "2026-04-25T10:30:00Z"
        },
        "message": f"Oracle analyzed your query about {request.mcu_id}: {request.query}"
    }