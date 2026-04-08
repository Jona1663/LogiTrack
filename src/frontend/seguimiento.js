const API = 'http://localhost:3000/envios';

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. GESTIÓN DE SESIÓN EN EL HEADER (PERSISTENTE) ---
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    const user = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    
    const infoClienteElement = document.getElementById('info-cliente');
    const btnLogout = document.getElementById('btn-logout');

    if (user) {
        // Si hay usuario, inyectamos su nombre y rol
        if (infoClienteElement) {
            const rol = user.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'Cliente';
            infoClienteElement.textContent = `${rol} | ${user.nombre}`;
        }
        // Nos aseguramos de que el botón de cerrar sesión (icono 👤) sea visible
        if (btnLogout) {
            btnLogout.style.display = 'inline-block';
        }
    } else {
        // Si es consulta pública (sin sesión)
        if (infoClienteElement) {
            infoClienteElement.textContent = "Consulta Pública";
        }
        // Ocultamos el icono de cerrar sesión si no hay nadie logueado
        if (btnLogout) {
            btnLogout.style.display = 'none';
        }
    }

    // Lógica del botón de Cerrar Sesión
    if (btnLogout) {
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

            // PRIVACIDAD: El destinatario solo se genera si 'user' no es null
            const htmlDestinatario = user 
                ? `<div class="form-group">
                        <label>Destinatario:</label>
                        <p style="font-weight:bold; margin-top:5px;">${envio.destinatario}</p>
                   </div>`
                : ''; 

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