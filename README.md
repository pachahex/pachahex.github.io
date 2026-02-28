# pachahex.github.io

Sitio web personal alojado en **GitHub Pages** que muestra el perfil público de **pachahex** junto con todos sus repositorios y colaboraciones en GitHub, con búsqueda en tiempo real y ordenamiento dinámico.

🌐 **Demo en vivo:** [https://pachahex.github.io](https://pachahex.github.io)

---

## Características

- **Perfil dinámico:** avatar, nombre, bio, número de repositorios, seguidores y seguidos, obtenidos en tiempo real desde la API de GitHub.
- **Repositorios propios:** listado completo con paginación automática (hasta 100 repos por petición).
- **Colaboraciones:** detección de repos ajenos a los que el usuario ha contribuido (push, pull requests, issues, etc.) a partir de sus eventos públicos.
- **Búsqueda en tiempo real:** filtra por nombre, descripción, lenguaje o propietario.
- **Ordenamiento:** por fecha de actualización, estrellas, nombre o fecha de creación.
- **Tarjetas de repositorio** con: lenguaje de programación (con color identificativo), estrellas, forks, tiempo relativo de última actualización, badge de *Fork* y badge de *Colaborador*.
- **Diseño responsivo** adaptado a dispositivos móviles.
- **Tema oscuro** con paleta verde/marrón definida mediante variables CSS.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de la página |
| CSS3 (variables, Grid, Flexbox, animaciones) | Estilos y diseño responsivo |
| JavaScript (ES6+, `async/await`, `fetch`) | Lógica de la aplicación y consumo de la API |
| [GitHub REST API v3](https://docs.github.com/en/rest) | Datos de perfil, repositorios y eventos |
| [Google Fonts – Inter](https://fonts.google.com/specimen/Inter) | Tipografía |
| GitHub Pages | Alojamiento estático gratuito |

No se utilizan frameworks ni dependencias externas: todo el código corre en el navegador sin proceso de *build*.

---

## Estructura del proyecto

```
pachahex.github.io/
├── index.html        # Estructura HTML de la página
├── css/
│   └── styles.css    # Estilos y diseño responsivo
├── js/
│   └── app.js        # Lógica de la aplicación y consumo de la API
└── README.md         # Documentación del proyecto
```

---

## Cómo funciona

1. Al cargar la página, `init()` lanza en paralelo:
   - `fetchProfile()` → `GET /users/pachahex` para mostrar los datos del perfil.
   - `fetchRepos()` → `GET /users/pachahex/repos` (con paginación) para obtener todos los repositorios públicos propios.
2. Tras cargar los repos propios, se inicia `fetchCollabRepos()` en segundo plano:
   - Consulta hasta 3 páginas de `GET /users/pachahex/events/public`.
   - Filtra eventos de tipo push, pull request, issue, etc. en repos cuyo propietario no sea *pachahex*.
   - Obtiene los detalles completos de cada repo colaborado con `GET /repos/{owner}/{repo}`.
3. La función `filterAndRender()` aplica el filtro de búsqueda y el criterio de orden en cada cambio del input o del selector, y vuelve a pintar la cuadrícula de tarjetas.

---

## Uso y despliegue

### Ver en local

Al ser una página estática sin dependencias, basta con abrir `index.html` en cualquier navegador:

```bash
# Con cualquier servidor estático, por ejemplo:
npx serve .
# o simplemente abrir el archivo directamente en el navegador
```

> **Nota:** La API pública de GitHub tiene un límite de **60 peticiones/hora** para peticiones no autenticadas. Si se alcanza ese límite, los datos no se cargarán hasta que la ventana de una hora se reinicie.

### Despliegue en GitHub Pages

El sitio se publica automáticamente en `https://<usuario>.github.io` al hacer push a la rama principal del repositorio `<usuario>.github.io`. No se necesita ninguna configuración adicional.

### Personalización

Para adaptar este sitio a otro usuario de GitHub, sólo hay que cambiar la constante al inicio de `js/app.js`:

```js
const USERNAME = 'pachahex'; // ← reemplaza con el nombre de usuario deseado
```

---

## Licencia

Este proyecto no incluye una licencia de código abierto explícita. Por lo tanto, todos los derechos están reservados por el autor — **© pachahex**. No se permite el uso, copia, modificación ni distribución del código sin autorización expresa. Si deseas reutilizar o adaptar el código, contacta al autor en [github.com/pachahex](https://github.com/pachahex).
