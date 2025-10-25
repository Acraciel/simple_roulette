// =================================================================
// SOLID IMPLEMENTATION: MODULAR JAVASCRIPT
// =================================================================

/**
 * 1. CONFIG (SRP: Single Responsibility Principle)
 */
const Config = {
  // Colores temáticos GÓTICOS/SOBRIOS para los segmentos:
  COLORS: [
    "#400000", // Rojo oscuro (Sangre Seca)
    "#2A0A2A", // Morado fúnebre
    "#1A301A", // Verde moho
    "#550000", // Rojo óxido intenso
    "#300050", // Púrpura noche
    "#101010", // Negro carbón profundo
    "#660000", // Rojo vino
    "#3A0A3A", // Morado sombra
    "#224422", // Verde pantano
    "#700000", // Rojo ladrillo
    "#440077", // Índigo espectral
    "#1B1B1B", // Gris basalto
    "#800000", // Rojo visceral
    "#500050", // Magenta macabro
    "#335533", // Verde esmeralda sucio
    "#900000", // Rojo carmesí
    "#5D0093", // Violeta cadavérico
    "#252525", // Gris medianoche
    "#A00000", // Rojo brillante
    "#660066", // Morado ciruela
    "#446644", // Verde militar
    "#B00000", // Rojo infierno
    "#7700AA", // Púrpura oscuro
    "#2F2F2F", // Negro ceniza
    "#C00000", // Rojo lava
    "#8800BB", // Magenta oscuro
    "#557755", // Verde oliva oscuro
    "#D00000", // Rojo vívido
    "#9900CC", // Violeta vampiro
    "#353535", // Gris pizarra
    "#E00000", // Rojo arterial
    "#AA00DD", // Morado veneno
    "#668866", // Verde pantano claro
    "#F00000", // Rojo sangre fresco
    "#BB00EE", // Púrpura neón
  ],
  WHEEL_DURATION: 4000, // 6 segundos
  STORAGE_KEY: "rouletteSouls",
  CONTINUE_FADE_DURATION: 500, // Nuevo: Duración del desvanecimiento (0.5s)
};

/**
 * 2. STATE MANAGER (SRP: Single Responsibility Principle)
 * Ahora guarda temporalmente al ganador para eliminarlo después.
 */
const StateManager = (() => {
  let names = JSON.parse(localStorage.getItem(Config.STORAGE_KEY)) || [];
  let isSpinning = false;
  let winnerIndex = -1; // Nuevo: Para guardar el índice del ganador

  const _saveToLocalStorage = () => {
    localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(names));
  };

  return {
    getNames: () => [...names],
    setNames: (newNames) => {
      names = newNames;
      _saveToLocalStorage();
    },
    getIsSpinning: () => isSpinning,
    setIsSpinning: (state) => {
      isSpinning = state;
    },
    addName: (name) => {
      if (name) {
        const uniqueName = name.trim();
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
        names.splice(index, 1);
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
    // Nuevos métodos para gestionar el ganador
    setWinnerIndex: (index) => {
      winnerIndex = index;
    },
    getWinnerIndex: () => winnerIndex,
    clearWinner: () => {
      winnerIndex = -1;
    },
  };
})();

/**
 * 3. AUDIO CONTROLLER (SRP: Single Responsibility Principle)
 */
const AudioController = (() => {
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

      const topPosition = names.length > 30 ? "top-[1%]" : "top-[3%]";

      // NUEVA CLASE: Marcar el segmento ganador
      const isWinnerSegment = index === stateManager.getWinnerIndex();

      nameText.className = `name-text absolute ${topPosition} left-1/2 -translate-x-1/2 py-1 px-2 text-sm md:text-base font-bold rounded-lg max-w-[80px] truncate ${
        isWinnerSegment ? "winner-segment" : ""
      }`;
      nameText.style.transform = `translate(-50%, -50%)`;

      textContainer.appendChild(nameText);
      rouletteWheel.appendChild(textContainer);
    });

    // Si hay un ganador, lo resaltamos y preparamos el efecto de desvanecimiento
    if (stateManager.getWinnerIndex() !== -1) {
      // En este punto, el segmento ganador tiene la clase 'winner-segment'
    }
  };

  // NUEVO MÉTODO: Para el efecto de desvanecimiento antes de la eliminación
  const fadeOutWinner = () => {
    const winnerSegments = rouletteWheel.querySelectorAll(".winner-segment");
    rouletteWheel.style.transition = `opacity ${
      config.CONTINUE_FADE_DURATION / 1000
    }s ease-in-out`;

    // Aplicar el efecto visual de 'desvanecimiento' al segmento ganador
    winnerSegments.forEach((segment) => {
      segment.style.transition =
        "opacity 0.5s ease-in-out, transform 0.5s ease-in-out";
      segment.style.opacity = "0"; // Desaparecer el texto
      // Podemos también desvanecer el color de fondo del segmento
      segment.closest(".name-text").style.backgroundColor = "transparent";
    });

    // Nota: El desvanecimiento del color del *conic-gradient* es más complejo,
    // así que nos enfocamos en el texto y el borde visual.
  };

  // NUEVO MÉTODO: Limpiar el estado de desvanecimiento
  const resetFade = () => {
    rouletteWheel.style.transition = rouletteWheel.style.transition.replace(
      /opacity.*?,/g,
      ""
    ); // Remover la transición de opacidad
    rouletteWheel.style.opacity = "1";
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
    fadeOutWinner, // Exportar el nuevo método
    resetFade, // Exportar el nuevo método
  };
})(StateManager, Config);

/**
 * 5. UI CONTROLLER (SRP: Single Responsibility Principle)
 */
const UIController = ((
  stateManager,
  audioController,
  wheelRenderer,
  config
) => {
  // Agregado config
  const spinButton = document.getElementById("spinButton");
  const winnerDisplay = document.getElementById("winnerDisplay");
  const resultBox = document.getElementById("resultBox");
  const nameCountDisplay = document.getElementById("nameCount");
  const emptyMessage = document.getElementById("emptyMessage");
  const nameListElement = document.getElementById("nameList");
  const finishedModal = document.getElementById("finishedModal");
  const rouletteContainer = document.getElementById("rouletteContainer");

  let onDeleteNameCallback = () => {};
  let onContinueCallback = () => {}; // Nuevo: Callback para el botón Continuar

  const toggleSpinButton = (isSpinning) => {
    spinButton.disabled = isSpinning || stateManager.getNames().length === 0;
  };

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

      // NUEVO: Añadir botón de Continuar
      const continueButtonId = "continueButton";
      const existingButton = document.getElementById(continueButtonId);

      if (!existingButton) {
        const continueBtn = document.createElement("button");
        continueBtn.id = continueButtonId;
        continueBtn.textContent = "¡Continuar con el Sacrificio!";
        continueBtn.className =
          "mt-4 w-full bg-orange-700 hover:bg-orange-800 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md border-b-4 border-orange-900 active:border-b-0";
        continueBtn.addEventListener("click", onContinueCallback);
        resultBox.appendChild(continueBtn);
      }

      // 1. Reset state for animation
      resultBox.classList.remove("active");
      resultBox.classList.add("sealed-destiny-enter");

      // 2. Activate animation and sound
      setTimeout(() => {
        resultBox.classList.add("active");
        audioController.playWinSound();
      }, 10);

      // Desactivar el botón de giro hasta que se continúe
      spinButton.disabled = true;
    },
    hideResultBox: () => {
      // Remover el botón de Continuar cuando se oculta
      const continueBtn = document.getElementById("continueButton");
      if (continueBtn) {
        continueBtn.remove();
      }

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
    registerDeleteNameCallback: (callback) => {
      onDeleteNameCallback = callback;
    },
    // Nuevo: Registro del callback de Continuar
    registerContinueCallback: (callback) => {
      onContinueCallback = callback;
    },
  };
})(StateManager, AudioController, WheelRenderer, Config);

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
    stateManager.clearWinner(); // Limpiar cualquier ganador previo

    const names = stateManager.getNames();
    const numNames = names.length;
    const segmentAngle = 360 / numNames;

    // 2. Select Winner and Calculate Rotation
    const winningIndex = Math.floor(Math.random() * numNames);
    const winnerName = names[winningIndex];

    stateManager.setWinnerIndex(winningIndex); // Guardar el índice del ganador

    const centerOfSegment = winningIndex * segmentAngle + segmentAngle / 2;
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

      wheelRenderer.render(); // Re-renderizar para marcar el segmento ganador visualmente
      uiController.showWinner(winnerName);

      // ******* CAMBIO CLAVE AQUI *******
      // NO REMOVER NI RE-RENDERIZAR AÚN.
      // Permitimos que el UIController maneje el estado de 'isSpinning'.
      stateManager.setIsSpinning(false); // Listo para el botón de 'Continuar'
      // *********************************
    }, config.WHEEL_DURATION);
  };

  // NUEVA FUNCIÓN: Maneja la eliminación del ganador y la siguiente ronda
  const continueGame = () => {
    const winningIndex = stateManager.getWinnerIndex();

    // Iniciar el efecto de desvanecimiento
    wheelRenderer.fadeOutWinner();

    // Esperar a que termine el desvanecimiento para eliminar el elemento
    setTimeout(() => {
      // 1. Eliminar el ganador
      if (winningIndex !== -1) {
        stateManager.removeNameByIndex(winningIndex);
      }
      stateManager.clearWinner(); // Limpiar el índice guardado

      // 2. Re-renderizar la rueda sin el ganador
      wheelRenderer.resetFade(); // Limpiar estilos de fade
      wheelRenderer.render();

      // 3. Limpiar la UI
      uiController.hideResultBox();
      uiController.updateUI(); // Esto reactiva el botón de giro

      // Mostrar modal si se terminaron las almas
      if (stateManager.getNames().length === 0) {
        uiController.showFinishedModal();
      }
    }, config.CONTINUE_FADE_DURATION);
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

  const deleteNameHandler = (name) => {
    if (stateManager.removeNameByValue(name)) {
      wheelRenderer.render();
      uiController.updateUI();
    }
  };

  const resetHandler = () => {
    stateManager.resetNames();
    stateManager.clearWinner();
    wheelRenderer.stopSpin(0); // Reset visual position
    uiController.hideResultBox();
    wheelRenderer.render();
    uiController.updateUI();
    csvFile.value = "";
  };

  const loadNamesFromCSV = (file) => {
    // (Lógica de CSV... sin cambios)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      let newNames = [];
      let currentNames = stateManager.getNames();

      lines.forEach((line) => {
        const firstColumn = line.split(",")[0].trim();
        if (
          firstColumn &&
          !newNames.includes(firstColumn) &&
          !currentNames.includes(firstColumn)
        ) {
          newNames.push(firstColumn);
        }
      });

      if (newNames.length > 0) {
        stateManager.setNames(currentNames.concat(newNames));
        wheelRenderer.render();
        uiController.updateUI();
      } else {
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
    // Registrar el nuevo callback para el botón 'Continuar'
    uiController.registerContinueCallback(continueGame);
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
