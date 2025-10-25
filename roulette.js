// =================================================================
// SOLID IMPLEMENTATION: MODULAR JAVASCRIPT
// =================================================================

/**
 * 1. CONFIG (SRP: Single Responsibility Principle)
 */
const Config = {
  // Colores temáticos GÓTICOS/SOBRIOS para los segmentos:
  COLORS: [
    "#5A0000",
    "#320032",
    "#004D00",
    "#800000",
    "#4B0082",
    "#220000",
    "#003300",
    "#6A006A",
    "#200020",
  ],
  WHEEL_DURATION: 6000, // 6 segundos
  STORAGE_KEY: "rouletteSouls", // Nueva clave para localStorage
};

/**
 * 2. STATE MANAGER (SRP: Single Responsibility Principle)
 * Ahora maneja la persistencia con localStorage.
 */
const StateManager = (() => {
  // Carga inicial de nombres desde localStorage o usa un array vacío.
  let names = JSON.parse(localStorage.getItem(Config.STORAGE_KEY)) || [];
  let isSpinning = false;

  const _saveToLocalStorage = () => {
    localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(names));
  };

  return {
    getNames: () => [...names],
    setNames: (newNames) => {
      names = newNames;
      _saveToLocalStorage(); // Guardar cada vez que se actualiza el array
    },
    getIsSpinning: () => isSpinning,
    setIsSpinning: (state) => {
      isSpinning = state;
    },
    addName: (name) => {
      if (name) {
        const uniqueName = name.trim();
        // Evita duplicados y nombres vacíos
        if (uniqueName && !names.includes(uniqueName)) {
          names.push(uniqueName);
          _saveToLocalStorage();
          return true;
        }
      }
      return false;
    },
    removeNameByIndex: (index) => {
      if (index >= 0 && index < names.length) {
        names.splice(index, 1); // Uso directo de splice para mutar/actualizar
        _saveToLocalStorage();
      }
    },
    removeNameByValue: (nameToRemove) => {
      const initialLength = names.length;
      names = names.filter((name) => name !== nameToRemove);
      if (names.length !== initialLength) {
        _saveToLocalStorage();
        return true;
      }
      return false;
    },
    resetNames: () => {
      names = [];
      _saveToLocalStorage();
    },
  };
})();

/**
 * 3. AUDIO CONTROLLER (SRP: Single Responsibility Principle)
 */
const AudioController = (() => {
  // Nota: Asegúrate de que 'assets/sound/win-sound.mp3' exista en tu repositorio
  const WIN_SOUND_PATH = "assets/sound/win-sound.mp3";
  const audio = new Audio(WIN_SOUND_PATH);

  const _playWinSound = () => {
    audio.currentTime = 0;
    audio
      .play()
      .catch((e) =>
        console.error("Error al reproducir el sonido de victoria:", e)
      );
  };

  return {
    playWinSound: _playWinSound,
  };
})();

/**
 * 4. WHEEL RENDERER (SRP: Single Responsibility Principle)
 */
const WheelRenderer = ((stateManager, config) => {
  const rouletteWheel = document.getElementById("rouletteWheel");

  const getColor = (index) => config.COLORS[index % config.COLORS.length];

  const _renderSegments = (names) => {
    if (names.length === 0) {
      rouletteWheel.style.background = "#333333";
      rouletteWheel.innerHTML = `<div class="absolute inset-0 flex items-center justify-center text-xl md:text-2xl font-creepster text-orange-400 text-center p-10 drop-shadow-lg">
                ¡La Ruleta Está Vacía!<br>Añade Almas o Carga un CSV
              </div>`;
      return;
    }

    const segmentAngle = 360 / names.length;
    let gradient = "conic-gradient(";
    let currentAngle = 0;

    // 1. Crear el conic-gradient para los segmentos
    names.forEach((name, index) => {
      const color = getColor(index);
      const nextAngle = currentAngle + segmentAngle;
      gradient += `${color} ${currentAngle}deg ${nextAngle}deg`;
      if (index < names.length - 1) {
        gradient += ", ";
      }
      currentAngle = nextAngle;
    });
    gradient += ")";
    rouletteWheel.style.background = gradient;
    rouletteWheel.innerHTML = "";

    // 2. Posicionar y rotar los textos
    names.forEach((name, index) => {
      const textContainer = document.createElement("div");
      const rotation = index * segmentAngle + segmentAngle / 2;

      textContainer.className =
        "absolute top-0 left-0 w-full h-full text-center pointer-events-none";
      textContainer.style.transform = `rotate(${rotation}deg)`;

      const nameText = document.createElement("span");
      nameText.textContent = name;

      // Ajuste: Aumentar el margen del texto para segmentos grandes (pocos nombres)
      const topPosition = names.length > 8 ? "top-1/4" : "top-[35%]";

      nameText.className = `name-text absolute ${topPosition} left-1/2 -translate-x-1/2 py-1 px-2 text-sm md:text-base font-bold rounded-lg max-w-[80px] truncate`;
      nameText.style.transform = `translate(-50%, -50%) rotate(-${rotation}deg)`;

      textContainer.appendChild(nameText);
      rouletteWheel.appendChild(textContainer);
    });
  };

  return {
    render: () => {
      const names = stateManager.getNames();
      _renderSegments(names);
    },
    spin: (totalRotation) => {
      rouletteWheel.style.transition = `transform ${
        config.WHEEL_DURATION / 1000
      }s cubic-bezier(0.25, 0.1, 0.25, 1)`;
      rouletteWheel.style.transform = `rotate(${totalRotation}deg)`;
    },
    stopSpin: (normalizedRotation) => {
      rouletteWheel.style.transition = "none";
      rouletteWheel.style.transform = `rotate(${normalizedRotation}deg)`;
    },
  };
})(StateManager, Config);

/**
 * 5. UI CONTROLLER (SRP: Single Responsibility Principle)
 * Actualizado para manejar la eliminación individual.
 */
const UIController = ((stateManager, audioController, wheelRenderer) => {
  // Agregado wheelRenderer
  const spinButton = document.getElementById("spinButton");
  const winnerDisplay = document.getElementById("winnerDisplay");
  const resultBox = document.getElementById("resultBox");
  const nameCountDisplay = document.getElementById("nameCount");
  const emptyMessage = document.getElementById("emptyMessage");
  const nameListElement = document.getElementById("nameList");
  const finishedModal = document.getElementById("finishedModal");
  const rouletteContainer = document.getElementById("rouletteContainer");

  const toggleSpinButton = (isSpinning) => {
    spinButton.disabled = isSpinning || stateManager.getNames().length === 0;
  };

  // Función de callback para eliminar nombre (será definida en App)
  let onDeleteNameCallback = () => {};

  const _updateNameList = (names) => {
    nameListElement.innerHTML = "";
    if (names.length === 0) {
      emptyMessage.classList.remove("hidden");
    } else {
      emptyMessage.classList.add("hidden");
      names.forEach((name) => {
        const li = document.createElement("li");
        li.className =
          "flex justify-between items-center p-2 bg-gray-700 rounded-md text-gray-200 hover:bg-gray-600 transition duration-100 border border-gray-600";

        // Añadir botón de eliminación
        li.innerHTML = `
          <span>${name}</span>
          <button 
            data-name="${name}"
            class="delete-name-btn text-red-400 hover:text-red-600 font-bold ml-4 p-1 rounded-full leading-none transition-colors"
            title="Eliminar alma"
          >
            💀
          </button>
        `;
        nameListElement.appendChild(li);
      });

      // Añadir evento a los nuevos botones de eliminación
      nameListElement.querySelectorAll(".delete-name-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const nameToRemove = e.currentTarget.getAttribute("data-name");
          onDeleteNameCallback(nameToRemove);
        });
      });
    }
    nameCountDisplay.textContent = names.length;
  };

  return {
    updateUI: () => {
      const names = stateManager.getNames();
      _updateNameList(names);
      toggleSpinButton(stateManager.getIsSpinning());
    },
    showWinner: (winnerName) => {
      winnerDisplay.textContent = winnerName;
      resultBox.classList.remove("active");
      resultBox.classList.add("sealed-destiny-enter");

      setTimeout(() => {
        resultBox.classList.add("active");
        audioController.playWinSound();
      }, 10);
    },
    hideResultBox: () => {
      resultBox.classList.remove("active");
      resultBox.classList.add("sealed-destiny-enter");
    },
    toggleSplatter: (visible) => {
      if (visible) {
        rouletteContainer.classList.remove("hidden-splatter");
      } else {
        rouletteContainer.classList.add("hidden-splatter");
      }
    },
    showFinishedModal: () => {
      finishedModal.classList.remove("hidden");
    },
    // Nuevo método para registrar el callback de eliminación
    registerDeleteNameCallback: (callback) => {
      onDeleteNameCallback = callback;
    },
  };
})(StateManager, AudioController, WheelRenderer);

/**
 * 6. APP ORCHESTRATOR (DIP: Dependency Inversion Principle & Control)
 */
const App = ((stateManager, uiController, wheelRenderer, config) => {
  const nameInput = document.getElementById("nameInput");
  const spinButton = document.getElementById("spinButton");
  const resetButton = document.getElementById("resetButton");
  const csvFile = document.getElementById("csvFile");

  // --- Core Logic ---
  const spinWheel = () => {
    if (stateManager.getIsSpinning() || stateManager.getNames().length === 0) {
      if (stateManager.getNames().length === 0) {
        uiController.showFinishedModal();
      }
      return;
    }

    // 1. Initial State Setup
    stateManager.setIsSpinning(true);
    uiController.updateUI();
    uiController.hideResultBox();
    uiController.toggleSplatter(true);

    const names = stateManager.getNames();
    const numNames = names.length;
    const segmentAngle = 360 / numNames;

    // 2. Select Winner and Calculate Rotation
    const winningIndex = Math.floor(Math.random() * numNames);
    const winnerName = names[winningIndex];

    const centerOfSegment = winningIndex * segmentAngle + segmentAngle / 2;
    // Rotación total: 5 vueltas completas + la rotación necesaria para apuntar al segmento
    const totalRotation =
      360 * 5 +
      (360 - centerOfSegment) +
      Math.random() * (segmentAngle * 0.8) -
      segmentAngle * 0.4;

    // 3. Start Spin Animation
    wheelRenderer.spin(totalRotation);

    // 4. Handle Result After Animation
    setTimeout(() => {
      uiController.toggleSplatter(false);

      // Normalizar rotación para un stop limpio
      const normalizedRotation = totalRotation % 360;
      wheelRenderer.stopSpin(normalizedRotation);

      uiController.showWinner(winnerName);

      // Update State (Remove winner) - Usamos removeNameByValue por seguridad, aunque el índice debería ser correcto.
      stateManager.removeNameByIndex(winningIndex);

      // Update UI/Renderer
      wheelRenderer.render();
      stateManager.setIsSpinning(false);
      uiController.updateUI();

      if (stateManager.getNames().length === 0) {
        uiController.showFinishedModal();
      }
    }, config.WHEEL_DURATION);
  };

  // --- Auxiliary Handlers ---
  const addNameHandler = () => {
    const name = nameInput.value.trim();
    if (stateManager.addName(name)) {
      nameInput.value = "";
      wheelRenderer.render();
      uiController.updateUI();
    }
  };

  // Nuevo Handler para eliminar un nombre por su valor
  const deleteNameHandler = (name) => {
    if (stateManager.removeNameByValue(name)) {
      wheelRenderer.render();
      uiController.updateUI();
    }
  };

  const resetHandler = () => {
    stateManager.resetNames();
    wheelRenderer.stopSpin(0); // Reset visual position
    uiController.hideResultBox();
    wheelRenderer.render();
    uiController.updateUI();
    csvFile.value = "";
  };

  const loadNamesFromCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      let newNames = [];
      let currentNames = stateManager.getNames();

      lines.forEach((line) => {
        const firstColumn = line.split(",")[0].trim();
        // Previene duplicados
        if (
          firstColumn &&
          !newNames.includes(firstColumn) &&
          !currentNames.includes(firstColumn)
        ) {
          newNames.push(firstColumn);
        }
      });

      if (newNames.length > 0) {
        // Concatenar los nuevos nombres con los existentes
        stateManager.setNames(currentNames.concat(newNames));
        wheelRenderer.render();
        uiController.updateUI();
      } else {
        // En un entorno de usuario, esto debería ser un mensaje de error visible, no solo un console.error
        console.error(
          "ERROR: No se encontraron nombres válidos en la primera columna del archivo CSV o ya existen."
        );
      }
    };
    reader.onerror = () => {
      console.error("ERROR: No se pudo leer el archivo CSV.");
    };
    reader.readAsText(file);
  };

  // --- Initialization and Event Binding ---
  const init = () => {
    // Registra el handler de eliminación en el UIController antes de la actualización inicial
    uiController.registerDeleteNameCallback(deleteNameHandler);

    wheelRenderer.render();
    uiController.updateUI();

    // Event Listeners
    nameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addNameHandler();
      }
    });
    spinButton.addEventListener("click", spinWheel);
    resetButton.addEventListener("click", resetHandler);
    csvFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        loadNamesFromCSV(file);
      }
    });
  };

  return { init };
})(StateManager, UIController, WheelRenderer, Config);

// Iniciar la aplicación cuando la ventana esté cargada.
window.onload = App.init;
