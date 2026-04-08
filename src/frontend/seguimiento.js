const API = 'http://localhost:3000/envios';

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. GESTIÓN DE SESIÓN EN EL HEADER (NUEVO) ---
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    if (!usuarioGuardado) {
        // Si no hay sesión, al login
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(usuarioGuardado);
    
    // Cargamos "Cliente | luis veliz"
    const infoClienteElement = document.getElementById('info-cliente');
    if (infoClienteElement) {
        infoClienteElement.textContent = `Cliente | ${user.nombre}`;
    }

    // Funcionalidad para Cerrar Sesión (en el icono👤)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('¿Deseas cerrar la sesión?')) {
                localStorage.removeItem('usuarioLogueado');
                window.location.href = 'index.html';
            }
        });
    }
    // --------------------------------------------------

    // --- 2. LÓGICA DE BÚSQUEDA DEL ENVÍO ---
    const params = new URLSearchParams(window.location.search);
    const trackingId = params.get('id');
    const contenedor = document.getElementById('detalle-envio-cliente');

    if (!trackingId) {
        contenedor.innerHTML = '<p style="text-align:center; color:red;">No se proporcionó un número de seguimiento.</p>';
        return;
    }

    try {
        // Buscamos por trackingId usando filtro de API
        const res = await fetch(`${API}?trackingId=${trackingId}`);
        const datos = await res.json();

        if (datos.length > 0) {
            const envio = datos[0];
            
            // Función auxiliar para clase del badge (reutilizando estilos existentes)
            const getEstadoClass = (estado) => {
                const map = {
                    'Pendiente': 'estado-pendiente',
                    'En tránsito': 'estado-entransito',
                    'En sucursal': 'estado-ensucursal',
                    'Entregado': 'estado-entregado',
                    'Cancelado': 'estado-cancelado'
                };
                return map[estado] || '';
            };

            // Renderizamos solo los campos permitidos para el cliente
            contenedor.innerHTML = `
                <div class="form-section" style="background:white; border:none; padding:0;">
                    <h2 style="color:#118ab2; border-bottom:2px solid #eee; padding-bottom:10px;">Información del Paquete: #${envio.trackingId}</h2>
                    
                    <div class="form-group" style="margin-top:20px;">
                        <label>Estado actual:</label>
                        <span class="badge ${getEstadoClass(envio.estado)}">${envio.estado}</span>
                    </div>
                    
                    <div class="form-group">
                        <label>Destinatario:</label>
                        <p style="font-weight:bold; margin-top:5px;">${envio.destinatario}</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Origen:</label>
                        <p style="color:#555; margin-top:5px;">${envio.origen}</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Destino:</label>
                        <p style="color:#555; margin-top:5px;">${envio.destino}</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Última actualización de estado:</label>
                        <p style="font-style:italic; color:#888; margin-top:5px;">${envio.fecha}</p>
                    </div>
                </div>
            `;
        } else {
            contenedor.innerHTML = '<p style="text-align:center; color:orange; font-weight:bold;">El código de tracking no existe.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = '<p style="text-align:center; color:red;">Error al conectar con el servidor. ¿json-server está corriendo?</p>';
    }
});