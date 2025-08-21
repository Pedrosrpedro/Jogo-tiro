// --- CONFIGURAÇÃO INICIAL ---
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Referências para os elementos da UI
const menuContainer = document.getElementById("menuContainer");
const gameUiContainer = document.getElementById("gameUiContainer");
const playButton = document.getElementById("playButton");
const scoreElement = document.getElementById("score");
const shootButton = document.getElementById("shootButton"); // Novo botão

let score = 0;
let gameScene;
let menuScene;

gameUiContainer.style.display = 'none';

// --- CENA DO MENU (sem alterações) ---
const createMenuScene = function() {
    // ... (código da cena de menu permanece o mesmo de antes) ...
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    const camera = new BABYLON.ArcRotateCamera("menuCamera", -Math.PI / 2, Math.PI / 2.5, 15, BABYLON.Vector3.Zero(), scene);
    scene.registerBeforeRender(() => { camera.alpha += 0.001 * scene.getAnimationRatio(); });
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 0, -5), scene);
    pointLight.intensity = 0.5;
    const font_url = "https://assets.babylonjs.com/fonts/Fira%20Code%20Regular.json";
    fetch(font_url)
        .then(response => response.json())
        .then(fontData => {
            const textMesh = BABYLON.MeshBuilder.CreateText("title", "TIRO AO ALVO", fontData, { size: 2, resolution: 16, depth: 0.5 }, scene);
            const center = textMesh.getAbsolutePosition();
            textMesh.position.x -= center.x;
            const textMaterial = new BABYLON.StandardMaterial("textMat", scene);
            textMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
            textMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            textMesh.material = textMaterial;
        });
    return scene;
};

// --- CENA DO JOGO (com as modificações para mobile) ---
const createGameScene = function() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.2, 0.3, 0.5);

    // MUDANÇA 1: Usando a VirtualJoysticksCamera no lugar da FreeCamera
    const camera = new BABYLON.VirtualJoysticksCamera("VJC", new BABYLON.Vector3(0, 0, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // Iluminação
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    
    // Função para criar um novo alvo
    const createTarget = function() {
        const target = BABYLON.MeshBuilder.CreateSphere("target", {diameter: 1.5, segments: 32}, scene);
        const material = new BABYLON.StandardMaterial("targetMaterial", scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        target.material = material;
        target.tag = "target";
        
        target.position.x = (Math.random() - 0.5) * 20;
        target.position.y = (Math.random() - 0.5) * 12;
        target.position.z = Math.random() * 10;
    };
    
    // Função de tiro (a lógica interna é a mesma)
    const shoot = function() {
        const pickResult = scene.pick(engine.getRenderWidth() / 2, engine.getRenderHeight() / 2);

        if (pickResult.hit && pickResult.pickedMesh.tag === "target") {
            pickResult.pickedMesh.dispose();
            score++;
            scoreElement.innerText = `Pontuação: ${score}`;
            // Esta linha garante que os alvos nunca acabem!
            createTarget();
        }
    };

    // MUDANÇA 2: Acionar o tiro com o botão, não mais com o clique na tela
    // Usamos 'touchstart' para resposta imediata em dispositivos de toque
    shootButton.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Impede comportamentos indesejados (como zoom)
        shoot();
    });

    // Cria 3 alvos iniciais
    for (let i = 0; i < 3; i++) {
        createTarget();
    }
    
    return scene;
};

// --- LÓGICA PRINCIPAL E TRANSIÇÃO (sem alterações) ---
menuScene = createMenuScene();
let currentScene = menuScene;

playButton.addEventListener("click", () => {
    menuContainer.style.display = "none";
    gameUiContainer.style.display = "block";
    
    if (!gameScene) {
        gameScene = createGameScene();
    }
    currentScene = gameScene;
});

engine.runRenderLoop(() => {
    if (currentScene) {
        currentScene.render();
    }
});

window.addEventListener("resize", () => {
    engine.resize();
});
