import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder

print("Iniciando generador de IA para LogiTrack...\n")

# ==========================================
# 1. GENERACIÓN DEL DATASET INVENTADO
# ==========================================
# Generamos 1000 envios simulados con las features 
np.random.seed(42)
cantidad_datos = 1000

data = {
    'distancia_km': np.random.randint(10, 1500, cantidad_datos),
    'tipo_envio': np.random.choice(['Normal', 'Express'], cantidad_datos, p=[0.7, 0.3]),
    'volumen': np.random.choice(['Pequeño', 'Mediano', 'Grande'], cantidad_datos),
    'restricciones': np.random.choice(['Ninguna', 'Frágil', 'Refrigerado'], cantidad_datos, p=[0.6, 0.2, 0.2]),
    'saturacion_ruta': np.random.choice(['Baja', 'Media', 'Alta'], cantidad_datos)
}

df = pd.DataFrame(data)

# Función para asignar la prioridad lógica (así el modelo tiene un patrón real que aprender)
def asignar_prioridad(row):
    # Si es Express, o necesita frío/cuidado especial en ruta saturada -> ALTA
    if row['tipo_envio'] == 'Express' or row['restricciones'] == 'Refrigerado':
        return 'Alta'
    # Si es Normal pero la ruta está colapsada o va muy lejos -> MEDIA
    elif row['saturacion_ruta'] == 'Alta' or row['distancia_km'] > 800:
        return 'Media'
    # El resto de los paquetes tranquilos -> BAJA
    else:
        return 'Baja'

df['prioridad_real'] = df.apply(asignar_prioridad, axis=1)

# Guardamos el dataset en un CSV 
df.to_csv('dataset_envios_logitrack.csv', index=False)
print("Dataset 'dataset_envios_logitrack.csv' generado con 1000 registros.")

# ==========================================
# 2. PREPARACIÓN DE DATOS (PRE-PROCESSING)
# ==========================================
# Las IAs solo entienden números, así que convertimos el texto a valores numéricos
le_tipo = LabelEncoder()
df['tipo_envio_num'] = le_tipo.fit_transform(df['tipo_envio'])

le_volumen = LabelEncoder()
df['volumen_num'] = le_volumen.fit_transform(df['volumen'])

le_restricc = LabelEncoder()
df['restricciones_num'] = le_restricc.fit_transform(df['restricciones'])

le_saturacion = LabelEncoder()
df['saturacion_num'] = le_saturacion.fit_transform(df['saturacion_ruta'])

# Separamos las variables predictoras (X) de lo que queremos adivinar (y)
X = df[['distancia_km', 'tipo_envio_num', 'volumen_num', 'restricciones_num', 'saturacion_num']]
y = df['prioridad_real']

# Dividimos el dataset: 80% para entrenar la IA, 20% para tomarle examen
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ==========================================
# 3. ENTRENAMIENTO DEL MODELO (RANDOM FOREST)
# ==========================================
print("Entrenando el modelo Random Forest...")
modelo_rf = RandomForestClassifier(n_estimators=100, random_state=42)
modelo_rf.fit(X_train, y_train)

# ==========================================
# 4. EVALUACIÓN Y MÉTRICAS DE PRECISIÓN
# ==========================================
# Le pedimos a la IA que prediga sobre el 20% de datos que no conoce
y_pred = modelo_rf.predict(X_test)

print("\nRESULTADOS Y MÉTRICAS DE PRECISIÓN:")
print("-" * 50)
print(f"Precisión General (Accuracy): {accuracy_score(y_test, y_pred) * 100:.2f}%")
print("\nReporte Detallado:")
print(classification_report(y_test, y_pred))
print("-" * 50)

# ==========================================
# 5. PRUEBA EN VIVO CON UN ENVÍO NUEVO
# ==========================================
print("\nProbando el modelo con un paquete nuevo simulado...")
# Supongamos que entra un envío: 1200km, Normal, Grande, Frágil, Ruta Media
nuevo_paquete = pd.DataFrame({
    'distancia_km': [1200],
    'tipo_envio_num': le_tipo.transform(['Normal']),
    'volumen_num': le_volumen.transform(['Grande']),
    'restricciones_num': le_restricc.transform(['Frágil']),
    'saturacion_num': le_saturacion.transform(['Media'])
})

prediccion = modelo_rf.predict(nuevo_paquete)
print(f"Características del paquete: 1200km, Normal, Grande, Frágil, Ruta Media")
print(f"El modelo de ML clasifica este envío con Prioridad: {prediccion[0].upper()}")
