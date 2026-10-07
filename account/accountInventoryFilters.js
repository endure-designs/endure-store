// ==========================================================================
// ACCOUNT INVENTORY FILTERS
// Filtros para movimientos de inventario administrativo
// ==========================================================================

const accountInventoryFilters = {

    // ================================================================
    // FILTRAR MOVIMIENTOS POR FECHA
    // ================================================================

    filtrarPorDia(movimientos, fecha) {

        // ------------------------------------------------------------
        // No hay filtro de fecha
        // ------------------------------------------------------------

        if (
            !fecha ||
            !fecha.desde
        ) {
            return movimientos;
        }


        // ------------------------------------------------------------
        // Determinar fecha inicial y final
        // ------------------------------------------------------------

        const desde = fecha.desde;

        const hasta =
            fecha.hasta || fecha.desde;


        // ------------------------------------------------------------
        // Filtrar movimientos
        // ------------------------------------------------------------

        return movimientos.filter(movement => {

            const movementDate =
                new Date(movement.createdAt);

            if (
                Number.isNaN(
                    movementDate.getTime()
                )
            ) {
                return false;
            }


            // --------------------------------------------------------
            // Convertir la fecha del movimiento a YYYY-MM-DD
            // --------------------------------------------------------

            const year =
                movementDate.getFullYear();

            const month =
                String(
                    movementDate.getMonth() + 1
                ).padStart(2, '0');

            const day =
                String(
                    movementDate.getDate()
                ).padStart(2, '0');


            const movementDateString =
                `${year}-${month}-${day}`;


            // --------------------------------------------------------
            // Comprobar si está dentro del rango
            // --------------------------------------------------------

            return (
                movementDateString >= desde &&
                movementDateString <= hasta
            );

        });
    },


    // ================================================================
    // FILTRAR MOVIMIENTOS POR TIPO
    // ================================================================

    filtrarPorMovimiento(movimientos, tipos) {

        // ------------------------------------------------------------
        // No hay tipos seleccionados
        // ------------------------------------------------------------

        if (
            !Array.isArray(tipos) ||
            tipos.length === 0
        ) {
            return movimientos;
        }


        // ------------------------------------------------------------
        // Mantener movimientos cuyo tipo esté seleccionado
        // ------------------------------------------------------------

        return movimientos.filter(movement => {

            return tipos.includes(
                movement.type
            );

        });
    },


    // ================================================================
    // FILTRAR MOVIMIENTOS POR USUARIO
    // ================================================================

    filtrarPorUsuario(movimientos, usuarios) {

        // ------------------------------------------------------------
        // No hay usuarios seleccionados
        // ------------------------------------------------------------

        if (
            !Array.isArray(usuarios) ||
            usuarios.length === 0
        ) {
            return movimientos;
        }


        // ------------------------------------------------------------
        // Mantener movimientos cuyo usuario esté seleccionado
        // ------------------------------------------------------------

        return movimientos.filter(movement => {

            return usuarios.includes(
                Number(movement.createdById)
            );

        });
    },


    // ================================================================
    // ORQUESTADOR DE FILTROS
    // ================================================================

    aplicarFiltros(movimientos, filtros = {}) {

        // ------------------------------------------------------------
        // Asegurar que recibimos un array
        // ------------------------------------------------------------

        let resultado =
            Array.isArray(movimientos)
                ? [...movimientos]
                : [];


        // ------------------------------------------------------------
        // FILTRO POR FECHA
        // ------------------------------------------------------------

        resultado =
            this.filtrarPorDia(
                resultado,
                filtros.fecha
            );


        // ------------------------------------------------------------
        // FILTRO POR TIPO DE MOVIMIENTO
        // ------------------------------------------------------------

        resultado =
            this.filtrarPorMovimiento(
                resultado,
                filtros.tipos
            );


        // ------------------------------------------------------------
        // FILTRO POR USUARIO
        // ------------------------------------------------------------

        resultado =
            this.filtrarPorUsuario(
                resultado,
                filtros.usuarios
            );


        // ------------------------------------------------------------
        // Resultado final
        // ------------------------------------------------------------

        return resultado;
    }

};


// ====================================================================
// EXPONER GLOBALMENTE
// ====================================================================

window.accountInventoryFilters =
    accountInventoryFilters;