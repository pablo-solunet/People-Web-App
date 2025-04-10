# people_app
Requerimiento de Posiciones People


### Flujo de trabajo de cambios pendientes

1. **Guardar para revisión**:
    1. Cuando el usuario edita un registro y hace clic en "Guardar para revisión", los cambios se almacenan como pendientes.
    2. Los cambios no se aplican inmediatamente a la base de datos.

2. **Visualización de cambios pendientes**:
    1. Se muestra una sección de "Cambios Pendientes de Confirmación" en la parte superior de la página.
    2. Los registros con cambios pendientes se resaltan con un fondo amarillo en la tabla.
    3. El estado del registro cambia visualmente a "Pendiente de confirmación".

3. **Confirmación de cambios**:
    1. El botón "Enviar" en la fila del registro cambia a "Confirmar" cuando hay cambios pendientes.
    2. Al hacer clic en "Confirmar", se abre un diálogo que muestra una comparación detallada entre los valores originales y los nuevos.
    3. El usuario puede revisar los cambios y decidir si confirmarlos o descartarlos.

4. **Aplicación de cambios**:
    1. Al confirmar, los cambios se aplican permanentemente a la base de datos.
    2. El registro vuelve a su estado normal, pero con los nuevos valores.

5. **Descartar cambios**:
    1. Los cambios pendientes se almacenan en el estado del componente (`pendingChanges`).
    2. Si el usuario cierra la página o recarga la aplicación, estos cambios pendientes se perderían porque están solo en el estado del componente.
    4. Se implemento un botón "Descartar cambios" en el diálogo de confirmación.