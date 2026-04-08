document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Verificamos la sesión del usuario
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    if (!usuarioGuardado) {
        // Si no hay sesión, lo pateamos al login
        window.location.href = 'index.html';
        return;
    }
    
    // 2. Cargamos los datos del cliente en el Header y en el mensaje de bienvenida
    const user = JSON.parse(usuarioGuardado);
    
    const infoClienteElement = document.getElementById('info-cliente');
    const nombreClienteElement = document.getElementById('nombre-cliente');

    if (infoClienteElement) infoClienteElement.textContent = `Cliente | ${user.nombre}`;
    if (nombreClienteElement) nombreClienteElement.textContent = user.nombre;

    // 3. Funcionalidad para Cerrar Sesión
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogueado');
            window.location.href = 'index.html';
        });
    }

    // 4. Funcionalidad para el buscador de envíos
    const formBuscar = document.getElementById('form-buscar-envio');
    if (formBuscar) {
        formBuscar.addEventListener('submit', (e) => {
            e.preventDefault(); // Evitamos que la página se recargue
            
            // Obtenemos el valor del input (Asegúrate que el ID sea 'input-tracking' en tu HTML)
            const inputElement = document.getElementById('input-tracking');
            const trackingId = inputElement ? inputElement.value.trim().toUpperCase() : "";
            
            if (trackingId) {
                // REDIRECCIÓN CORRECTA: Usamos trackingId que es la variable con el valor
                window.location.href = `seguimiento.html?id=${trackingId}`;
            } else {
                alert("Por favor, ingresa un código de seguimiento.");
            }
        });
    }
});