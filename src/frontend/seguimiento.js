const API = 'http://localhost:3000/envios';

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. GESTIÓN DE SESIÓN EN EL HEADER (MODIFICADO) ---
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    
    const infoClienteElement = document.getElementById('info-cliente');
    
    // Si hay usuario, mostramos sus datos, si no, un texto genérico o vacío
    if (infoClienteElement) {
        if (user) {
            // Capitalizamos el rol para que quede prolijo
            const rol = user.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'Cliente';
            infoClienteElement.textContent = `${rol} | ${user.nombre}`;
        } else {
            infoClienteElement.textContent = "Consulta Pública";
        }
    }

    // Funcionalidad para Cerrar Sesión
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        // Si no hay usuario, ocultamos el botón de cerrar sesión
        if (!user) btnLogout.style.display = 'none';

        btnLogout.addEventListener('click', () => {
            if (confirm('¿Deseas cerrar la sesión?')) {
                localStorage.removeItem('usuarioLogueado');
                window.location.href = 'index.html';
            }
        });
    }

    // --- 2. LÓGICA DE BÚSQUEDA DEL ENVÍO ---
    const params = new URLSearchParams(window.location.search);
    const trackingId = params.get('id');
    const contenedor = document.getElementById('detalle-envio-cliente');

    if (!trackingId) {
        contenedor.innerHTML = '<p style="text-align:center; color:red; margin-top:20px;">No se proporcionó un número de seguimiento.</p>';
        return;
    }

    try {
        const res = await fetch(`${API}?trackingId=${trackingId}`);
        const datos = await res.json();

        if (datos.length > 0) {
            const envio = datos[0];
            
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

            // LÓGICA DE PRIVACIDAD: Solo creamos el HTML del destinatario si hay sesión
            const htmlDestinatario = user 
                ? `<div class="form-group">
                        <label>Destinatario:</label>
                        <p style="font-weight:bold; margin-top:5px;">${envio.destinatario}</p>
                   </div>`
                : ''; // Si no hay user, esto queda vacío

            // Renderizamos la tarjeta
            contenedor.innerHTML = `
                <div class="form-section" style="background:white; border:none; padding:0;">
                    <h2 style="color:#118ab2; border-bottom:2px solid #eee; padding-bottom:10px;">
                        Información del Paquete: #${envio.trackingId}
                    </h2>
                    
                    <div class="form-group" style="margin-top:20px;">
                        <label>Estado actual:</label>
                        <span class="badge ${getEstadoClass(envio.estado)}">${envio.estado}</span>
                    </div>
                    
                    ${htmlDestinatario}
                    
                    <div class="form-group">
                        <label>Origen:</label>
                        <p style="color:#555; margin-top:5px;">${envio.origen}</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Destino:</label>
                        <p style="color:#555; margin-top:5px;">${envio.destino}</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Última actualización:</label>
                        <p style="font-style:italic; color:#888; margin-top:5px;">${envio.fecha}</p>
                    </div>
                </div>
            `;
        } else {
            contenedor.innerHTML = '<p style="text-align:center; color:orange; font-weight:bold; margin-top:20px;">El código de tracking no existe.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = '<p style="text-align:center; color:red; margin-top:20px;">Error al conectar con el servidor.</p>';
    }
});