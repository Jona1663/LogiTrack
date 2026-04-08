# LogiTrack - Paquete Base de Gestión de Envíos

Proyecto desarrollado para el Laboratorio de Construcción de Software / Proyecto Profesional I (UNGS)
LogiTrack es un Producto Mínimo Viable (MVP) para la gestión logística, desarrollado por el Grupo 6.

## Equipo de Desarrollo ( Grupo 6 )
* Stornello Nadia 
* Veliz Luis 
* Fernandez Jonatan 

## Tecnologías Utilizadas
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Mock API:** JSON Server (Persistencia temporal).
* **Machine Learning:** Python, Scikit-learn (Random Forest).
* **CI/CD:** GitHub Actions (Linter ESLint).

## Instrucciones de Instalación y Ejecución

### 1. Levantar la Interfaz y la Mock API
Para que la aplicación funcione y guarde los datos correctamente, es necesario levantar el servidor local simulado:
1. Asegurate de tener [Node.js](https://nodejs.org/) instalado.
2. Abrí una terminal en la raíz del proyecto y ejecutá:
   \`\`\`bash
   npx json-server db.json --port 3000
   \`\`\`
3. Una vez que el servidor esté corriendo, abrí el archivo `src/index.html` en tu navegador web.

### 2. Ejecutar el Modelo de Machine Learning
El sistema cuenta con un modelo de clasificación automática de prioridades.
1. Asegurate de tener [Python 3](https://www.python.org/) instalado.
2. Instalá las dependencias necesarias:
   \`\`\`bash
   pip install pandas numpy scikit-learn
   \`\`\`
3. Ejecutá el script generador y de entrenamiento:
   \`\`\`bash
   python ml_logitrack.py
   \`\`\`
Esto generará el archivo `dataset_envios_logitrack.csv` y mostrará las métricas de precisión en la consola.
