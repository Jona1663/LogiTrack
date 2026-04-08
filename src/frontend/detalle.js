document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GESTIÓN DE SESIÓN EN EL HEADER (UNIFICADO) ---
    const infoUsuario = document.getElementById('info-usuario');
    const btnLogout = document.getElementById('btn-logout');
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');

    if (usuarioGuardado) {
        const user = JSON.parse(usuarioGuardado);
        
        // Normalizamos y capitalizamos el rol para mostrar en el header
        const rolReal = user.rol.trim().toLowerCase();
        const rolCapitalizado = rolReal.charAt(0).toUpperCase() + rolReal.slice(1);
        
        if (infoUsuario) {
            infoUsuario.textContent = `${rolCapitalizado} | ${user.nombre}`;
        }

        // Configuración persistente del botón de logout
        if (btnLogout) {
            btnLogout.style.display = 'inline-block';
            btnLogout.onclick = () => { // Usamos onclick para asegurar un único evento
                if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                    localStorage.removeItem('usuarioLogueado');
                    window.location.href = 'index.html';
                }
            };
        }
    } else {
        // Si no hay sesión, redirigir al login inmediatamente
        window.location.href = 'index.html';
        return;
    }

    // --- 2. LÓGICA DE CARGA DE DETALLES DEL ENVÍO ---
    const urlParams = new URLSearchParams(window.location.search);
    const trackingIdBuscado = urlParams.get('id');

    const contenedorDetalle = document.getElementById('contenedor-detalle');
    const mensajeError = document.getElementById('mensaje-error');

    if (!trackingIdBuscado) {
        mensajeError?.classList.remove('hidden');
        return;
    }

    // Buscamos los datos por trackingId
    fetch(`http://localhost:3000/envios?trackingId=${trackingIdBuscado}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error('Envío no encontrado');
            }
            
            const envio = data[0]; 

            // Llenamos el HTML con los datos recibidos
            document.getElementById('det-trackingId').textContent = `#${envio.trackingId}`;
            document.getElementById('det-rem-nombre').textContent = envio.remitente;
            document.getElementById('det-rem-origen').textContent = envio.origen;
            document.getElementById('det-dest-nombre').textContent = envio.destinatario;
            document.getElementById('det-dest-destino').textContent = envio.destino;
            document.getElementById('det-fecha').textContent = envio.fecha;

            // Actualizamos los estados con sus clases CSS
            const spanEstado = document.getElementById('det-estado');
            spanEstado.textContent = envio.estado;
            spanEstado.className = `badge ${getEstadoClass(envio.estado)}`;

            const spanPrioridad = document.getElementById('det-prioridad');
            spanPrioridad.textContent = envio.prioridad;
            spanPrioridad.className = `badge ${getPrioridadClass(envio.prioridad)}`;

            // Mostramos el contenedor principal
            contenedorDetalle.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            mensajeError?.classList.remove('hidden');
        });

    // --- 3. FUNCIONES AUXILIARES ---
    function getEstadoClass(estado) {
        const clases = {
            'Pendiente': 'estado-pendiente',
            'En tránsito': 'estado-entransito',
            'En sucursal': 'estado-ensucursal',
            'Entregado': 'estado-entregado',
            'Cancelado': 'estado-cancelado'
        };
        return clases[estado] || '';
    }

    function getPrioridadClass(prioridad) {
        const clases = {
            'Alta': 'prioridad-alta',
            'Media': 'prioridad-media',
            'Baja': 'prioridad-baja'
        };
        return clases[prioridad] || '';
    }
});