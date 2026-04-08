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
    document.getElementById('info-cliente').textContent = `Cliente | ${user.nombre}`;
    document.getElementById('nombre-cliente').textContent = user.nombre;

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
            
            const trackingId = document.getElementById('input-tracking').value.trim().toUpperCase();
            
            if (trackingId) {
                // Redirigimos a la página de detalle enviando el ID por la URL
                window.location.href = `detalle.html?id=${trackingId}`;
            }
        });
    }
});