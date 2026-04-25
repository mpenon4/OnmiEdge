from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yaml # Esta librería es la que lee tu archivo .yaml

app = FastAPI()

# Esto permite que tu frontend (v0) pueda hablar con este motor de Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"mensaje": "OmniEdge Engine Online 🚀"}

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