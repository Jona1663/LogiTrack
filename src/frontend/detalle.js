document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el Tracking ID de la URL (ej: ?id=TRK12345)
    const urlParams = new URLSearchParams(window.location.search);
    const trackingIdBuscado = urlParams.get('id');

    const contenedorDetalle = document.getElementById('contenedor-detalle');
    const mensajeError = document.getElementById('mensaje-error');

    if (!trackingIdBuscado) {
        mensajeError.classList.remove('hidden');
        return;
    }

    // 2. NUEVO: Buscamos por la propiedad trackingId filtrando (?trackingId=...)
    // Esto evita el problema de los IDs autogenerados por json-server
    fetch(`http://localhost:3000/envios?trackingId=${trackingIdBuscado}`)
        .then(response => response.json())
        .then(data => {
            // Como usamos un filtro, el servidor devuelve un array [].
            // Si el array está vacío, significa que no existe.
            if (data.length === 0) {
                throw new Error('Envío no encontrado');
            }
            
            // Agarramos el primer resultado de la búsqueda
            const envio = data[0]; 

            // 3. Llenamos los datos en el HTML
            document.getElementById('det-trackingId').textContent = `#${envio.trackingId}`;
            
            document.getElementById('det-rem-nombre').textContent = envio.remitente;
            document.getElementById('det-rem-origen').textContent = envio.origen;
            
            document.getElementById('det-dest-nombre').textContent = envio.destinatario;
            document.getElementById('det-dest-destino').textContent = envio.destino;
            
            document.getElementById('det-fecha').textContent = envio.fecha;

            // Configurar los badges de Estado y Prioridad
            const spanEstado = document.getElementById('det-estado');
            spanEstado.textContent = envio.estado;
            spanEstado.className = `badge ${getEstadoClass(envio.estado)}`;

            const spanPrioridad = document.getElementById('det-prioridad');
            spanPrioridad.textContent = envio.prioridad;
            spanPrioridad.className = `badge ${getPrioridadClass(envio.prioridad)}`;

            // Mostrar el contenedor de detalles
            contenedorDetalle.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            mensajeError.classList.remove('hidden');
        });

    // Funciones auxiliares
    function getEstadoClass(estado) {
        switch(estado) {
            case 'Pendiente': return 'estado-pendiente';
            case 'En tránsito': return 'estado-entransito';
            case 'En sucursal': return 'estado-ensucursal';
            case 'Entregado': return 'estado-entregado';
            case 'Cancelado': return 'estado-cancelado';
            default: return '';
        }
    }

    // Funcionalidad para Cerrar Sesión con confirmación
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
            if (confirmar) {
                localStorage.removeItem('usuarioLogueado');
                window.location.href = 'index.html';
            }
        });
    }

    function getPrioridadClass(prioridad) {
        switch(prioridad) {
            case 'Alta': return 'prioridad-alta';
            case 'Media': return 'prioridad-media';
            case 'Baja': return 'prioridad-baja';
            default: return '';
        }
    }
});