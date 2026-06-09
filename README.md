# AURA STUDIO - E-commerce de Streetwear

Este es el código fuente para tu tienda de ropa online. El diseño es responsivo, moderno y está optimizado para alojarse de forma 100% gratuita en **GitHub Pages**.

---

## 🚀 Cómo Empezar a Usarlo Localmente

1. Abre tu editor de código (como VS Code).
2. Establece la carpeta `clothing-brand-store` como tu espacio de trabajo (active workspace).
3. Para ver la página en tu navegador:
   * Puedes usar una extensión como **Live Server** en tu editor.
   * O simplemente haz doble clic en el archivo `index.html` para abrirlo en tu navegador favorito.

---

## ⚙️ Personalización (Lo que debes configurar)

### 1. Colocar tu Número de WhatsApp
Abre el archivo [app.js](file:///C:/Users/Ricardo/.gemini/antigravity/scratch/clothing-brand-store/app.js) y en la línea 56 busca esta variable:
```javascript
const WHATSAPP_PHONE = "+525512345678";
```
Reemplaza ese número con tu propio número de WhatsApp (con el código de país, pero **sin espacios, guiones ni el signo "+"**). Ejemplo para México: `5215512345678`.

### 2. Usar tus Propias Fotos de Producto
1. Crea una carpeta llamada `assets` dentro del directorio `clothing-brand-store`.
2. Guarda las fotos de tus prendas dentro de esa carpeta.
3. Abre el archivo [app.js](file:///C:/Users/Ricardo/.gemini/antigravity/scratch/clothing-brand-store/app.js) y en la base de datos `PRODUCTS` (las primeras líneas) actualiza las propiedades `image` con las rutas locales de tus fotos. Ejemplo:
```javascript
image: "assets/mi-sudadera-azul.jpg",
```
También puedes modificar el nombre (`name`), la descripción (`description`), el precio (`price`), las tallas disponibles (`sizes`) y la etiqueta especial (`tag`) de cada producto.

---

## 🌐 Cómo Subirlo a GitHub Pages (Gratis)

Para que cualquier persona pueda entrar a tu tienda desde internet, sigue estos pasos:

### Paso 1: Crear un Repositorio en GitHub
1. Entra a tu cuenta de [GitHub](https://github.com/).
2. Haz clic en el botón **"New"** (Nuevo) para crear un repositorio.
3. Ponle un nombre descriptivo a tu repositorio (por ejemplo: `tienda-aura`).
4. Déjalo como **Público**.
5. No agregues archivos README, gitignore o licencias automáticas (déjalos desmarcados). Haz clic en **Create repository**.

### Paso 2: Subir tus Archivos
Puedes subir tus archivos usando Git en tu terminal o directamente desde la web de GitHub:
#### Opción A (Por la web - Más fácil):
1. En la pantalla que aparece en tu repositorio nuevo, haz clic en el enlace que dice **"uploading an existing file"** (subir un archivo existente).
2. Arrastra y suelta todos los archivos de tu carpeta `clothing-brand-store` (incluyendo `index.html`, `styles.css`, `app.js` y tu carpeta `assets` con tus fotos).
3. Espera a que se carguen y haz clic en **Commit changes** (Confirmar cambios).

#### Opción B (Usando la Terminal de Git):
Abre la terminal en la carpeta del proyecto y ejecuta:
```bash
git init
git add .
git commit -m "primer commit: tienda streetwear"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```
*(Reemplaza `TU-USUARIO` y `TU-REPOSITORIO` con tus datos reales).*

### Paso 3: Activar GitHub Pages
1. Entra a tu repositorio en GitHub desde tu navegador.
2. Ve a la pestaña **Settings** (Configuración) en el menú superior.
3. En el menú lateral izquierdo, bajo la sección "Code and automation", haz clic en **Pages**.
4. En la sección **Build and deployment**, bajo "Source", asegúrate de que esté seleccionado **Deploy from a branch**.
5. Bajo "Branch", selecciona **main** (o `master`) y la carpeta `/ (root)`. Haz clic en **Save** (Guardar).
6. ¡Listo! Espera unos 1-2 minutos. GitHub te dará un enlace arriba en esa misma página, que se verá similar a:
   `https://tu-usuario.github.io/tu-repositorio/`

¡Cualquiera que visite ese enlace podrá ver tu tienda y realizar pedidos directos a tu WhatsApp!
