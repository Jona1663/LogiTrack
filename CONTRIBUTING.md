
# Guía de Contribución - LogiTrack

Para mantener el orden en el repositorio y asegurar que el pipeline de Integración Continua (CI) funcione correctamente, el equipo ha acordado las siguientes reglas:

## Estrategia de Ramas (Branching)
* `main`: Contiene el código estable y listo para presentar al Product Owner.
* `dev` (o ramas por funcionalidad): Ramas de trabajo donde se desarrollan las nuevas Historias de Usuario antes de integrarlas.

## Convención de Commits
Para estandarizar el historial, todos los commits deben llevar un prefijo descriptivo:
* `feat:` Para nuevas funcionalidades (ej. *feat: agregar alta de envío*).
* `fix:` Para solucionar errores o bugs (ej. *fix: corregir validación de formulario*).
* `docs:` Para cambios en la documentación (ej. *docs: actualizar README*).
* `test:` Para agregar o modificar casos de prueba.

## Pipeline de CI
Cada vez que se realiza un *push* o *Pull Request* hacia la rama `main`, GitHub Actions ejecutará automáticamente el Linter (ESLint). **No se deben fusionar ramas si el pipeline falla.**
