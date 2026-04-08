document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GESTIÓN DE SESIÓN Y HEADER PERSISTENTE ---
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    const infoClienteElement = document.getElementById('info-cliente');
    const nombreClienteElement = document.getElementById('nombre-cliente');
    const btnLogout = document.getElementById('btn-logout');

    if (usuarioGuardado) {
        const user = JSON.parse(usuarioGuardado);
        
        // Llenamos el header: "Cliente | Juan Perez"
        if (infoClienteElement) {
            infoClienteElement.textContent = `Cliente | ${user.nombre}`;
        }
        
        // Llenamos el saludo de bienvenida en el cuerpo de la página
        if (nombreClienteElement) {
            nombreClienteElement.textContent = user.nombre;
        }

        // Configuración del botón de Cerrar Sesión (Icono 👤)
        if (btnLogout) {
            btnLogout.style.display = 'inline-block';
            btnLogout.onclick = () => {
                if (confirm("¿Deseas cerrar la sesión?")) {
                    localStorage.removeItem('usuarioLogueado');
                    window.location.href = 'index.html';
                }
            };
        }
    } else {
        // Si un cliente intenta entrar sin loguearse, al login
        window.location.href = 'index.html';
        return;
    }

    // --- 2. LÓGICA DEL BUSCADOR DE ENVÍOS ---
    const formBuscar = document.getElementById('form-buscar-envio');
    
    if (formBuscar) {
        formBuscar.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const inputElement = document.getElementById('input-tracking');
            const trackingId = inputElement ? inputElement.value.trim().toUpperCase() : "";
            
            if (trackingId) {
                // Redirigimos a seguimiento.html pasando el ID por la URL
                window.location.href = `seguimiento.html?id=${trackingId}`;
            } else {
                alert("Por favor, ingresa un código de seguimiento.");
            }
        });
    }
});