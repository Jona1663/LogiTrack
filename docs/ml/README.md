# Modelo de Prioridad de Envíos - LogiTrack

Se implementa un modelo de clasificación simulado para asignar prioridad automática a los envíos.


Categorías:
- Alta
- Media
- Baja

Regla de priorización (simulada):

Prioridad Alta:
- tipo de envío express
- distancia alta
- restricciones especiales (frágil o refrigeración)
- saturación de rutas alta
- ventana horaria corta

Prioridad Media:
- combinaciones intermedias
- tipo express con distancia media
- envío normal con alguna restricción
- saturación media

Prioridad Baja:
- tipo de envío normal
- distancia corta
- sin restricciones
- saturación baja
- ventana horaria amplia

Features utilizadas:
- distancia estimada
- tipo de envío (normal / express)
- ventana horaria
- volumen
- restricciones
- saturación de rutas

El dataset utilizado fue generado manualmente para simular escenarios de retraso.

