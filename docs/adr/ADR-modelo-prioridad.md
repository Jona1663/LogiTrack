# ADR: Modelo de priorización automática

## Contexto
El sistema LogiTrack requiere asignar prioridad automática a los envíos
para anticipar posibles retrasos utilizando datos no sensibles.

## Decisión
Se selecciona Random Forest como algoritmo de clasificación para
predecir la prioridad de envíos en tres categorías:
- Alta
- Media
- Baja

## Motivación
- Permite clasificación multiclase
- Fácil de simular con dataset pequeño
- No requiere entrenamiento complejo
- Adecuado para prototipo académico

## Consecuencias
La priorización se basa en reglas simuladas y un dataset inventado,
por lo que no representa un modelo productivo real.

## Estado
Aprobado
