# 🎲 La Ruleta Simple 🎲

## 💀 Version de la Muerte 💀

**¡Una aplicación web simple, oscura y eficiente para la selección aleatoria de nombres!**

## ✨ Características

- **Persistencia:** La lista de nombres ("almas") se guarda automáticamente en el navegador (`localStorage`) para que no se pierdan al cerrar o recargar la página.
- **Gestión de IDs Únicos:** Cada nombre recibe un ID único que se reinicia correctamente con la función de _reset_, asegurando que la gestión de la lista sea robusta.
- **Importación por CSV:** Carga tu lista de participantes de forma masiva desde un archivo CSV. Solo toma el texto de la primera columna.
- **Diseño Gótico y Oscuro:** Utiliza una paleta de colores sombría y un diseño temático para una experiencia inmersiva.
- **Animación Realista:** La ruleta gira y se detiene suavemente en el nombre seleccionado.
- **Eliminación de Ganador:** Tras la selección, tienes la opción de eliminar al "alma sacrificada" de la lista para continuar con la ronda siguiente.

## ⚙️ Tecnologías Utilizadas

Este proyecto es completamente estático y se ejecuta en el lado del cliente (navegador).

- **HTML5:** Estructura base.
- **JavaScript (Vanilla JS):** Toda la lógica de la ruleta, gestión de estado (`StateManager`), renderizado y orquestación. Implementado bajo los principios de modularidad (como SRP y DIP).
- **Tailwind CSS:** Framework CSS para el diseño rápido y totalmente responsivo (incluido vía CDN).
- **Google Fonts:** Fuente temática (`Creepster`).

## 🛠️ Instalación y Uso

Dado que este es un proyecto estático, la instalación es trivial.

1.  **Clonar el Repositorio** (si lo tienes en GitHub):
    ```bash
    git clone https://github.com/Acraciel/simple_roulette.git
    cd simple_roulette
    ```
2.  **Abrir el Archivo:** Simplemente abre el archivo `index.html` en tu navegador web.

Alternativamente, puedes acceder al proyecto directamente a través de **GitHub Pages**

## 📝 Uso del CSV

Para importar nombres desde un archivo CSV:

1.  Asegúrate de que tu archivo CSV tenga una lista de nombres en la **primera columna**.
    ```csv
    Nombre,Apellido,Edad
    Juan,Pérez,30
    María,López,25
    Carlos,García,40
    ```
2.  Haz clic en **"Cargar CSV"** y selecciona tu archivo.
3.  La aplicación agregará todos los nombres válidos que no existan previamente en la lista.

## 🤝 Contribuciones

Si encuentras algún error o tienes ideas para mejorar la experiencia de selección de almas, ¡las contribuciones son bienvenidas!

1.  Haz un _Fork_ del repositorio.
2.  Crea una nueva rama (`git checkout -b feature/mejora-oscura`).
3.  Realiza tus cambios y haz _commit_ (`git commit -am 'feat: Añade efecto de niebla'`).
4.  Sube tus cambios (`git push origin feature/mejora-oscura`).
5.  Abre un _Pull Request_.

---

Creado con JavaScript Puro y un toque de Maldad.
