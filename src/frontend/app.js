document.addEventListener('DOMContentLoaded', () => { 

    // --- 1. GESTIÓN DE SESIÓN ---
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');
    const infoUsuario = document.getElementById('info-usuario');
    const btnLogout = document.getElementById('btn-logout');

    if (usuarioGuardado) {
        const user = JSON.parse(usuarioGuardado);
        if (infoUsuario) {
            const rolReal = user.rol.trim().toLowerCase();
            const rolCapitalizado = rolReal.charAt(0).toUpperCase() + rolReal.slice(1);
            infoUsuario.textContent = `${rolCapitalizado} | ${user.nombre}`;
        }
        if (btnLogout) {
            btnLogout.style.display = 'inline-block';
            btnLogout.onclick = (e) => {
                e.preventDefault(); 
                if (confirm("¿Deseas cerrar la sesión?")) {
                    localStorage.removeItem('usuarioLogueado');
                    window.location.href = 'index.html';
                }
            };
        }
    } else {
        window.location.href = 'index.html';
        return;
    }

    // --- 2. LÓGICA DE ALTA DE ENVÍO ---
    const form = document.getElementById('form-alta-envio');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation(); 

            const formData = new FormData(form);
            const tipoEnvio = formData.get('tipoEnvio');
            const restricciones = formData.get('restricciones');

            // Generación de ID de Tracking
            const randomNum = Math.floor(10000 + Math.random() * 90000);
            const trackingId = `TRK${randomNum}`;

            // Lógica de Prioridad
            let prioridadSugerida = 'Baja';
            if (tipoEnvio === 'Express' || restricciones === 'Fragil' || restricciones === 'Refrigerado') {
                prioridadSugerida = 'Alta';
            } else if (formData.get('volumen') === 'Grande') {
                prioridadSugerida = 'Media';
            }

            const nuevoEnvio = {
                id: trackingId, 
                trackingId: trackingId,
                remitente: document.getElementById('remitente-nombre').value,
                destinatario: document.getElementById('destinatario-nombre').value,
                origen: document.getElementById('remitente-direccion').value,
                destino: document.getElementById('destinatario-direccion').value,
                estado: 'Pendiente', 
                prioridad: prioridadSugerida,
                fecha: new Date().toLocaleDateString('es-AR')
            };

            try {
                const response = await fetch('http://localhost:3000/envios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoEnvio)
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Mostramos la ventana emergente que detiene el flujo
                    Swal.fire({
                        title: '¡Envío Registrado!',
                        icon: 'success',
                        html: `
                            <div style="text-align: left; background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 10px;">
                                <p style="margin: 5px 0;"><strong>Tracking ID:</strong> <span style="color: #118ab2;">${data.trackingId}</span></p>
                                <p style="margin: 5px 0;"><strong>Prioridad:</strong> <strong style="color: ${data.prioridad === 'Alta' ? '#d90429' : (data.prioridad === 'Media' ? '#f3722c' : '#90be6d')}">${data.prioridad}</strong></p>
                            </div>
                            <p style="margin-top: 15px;">El envío ha sido guardado en la base de datos.</p>
                        `,
                        confirmButtonText: 'Ir al Listado',
                        confirmButtonColor: '#118ab2',
                        allowOutsideClick: false 
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Redirigimos solo cuando el usuario hace clic
                            window.location.href = 'listado.html';
                        }
                    });

                    form.reset();
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo conectar con el servidor.',
                    icon: 'error',
                    confirmButtonColor: '#118ab2'
                });
            }
        });
    }
});