FROM python:3.11-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Instalamos dependencias de sistema necesarias para cálculos biónicos y simulación
# (gcc y openblas son vitales para que numpy y scipy vuelen)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalamos las dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código del backend
COPY . .

# Exponemos el puerto de FastAPI
EXPOSE 8000

# Arrancamos el servidor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]