// --- CONFIGURAÇÃO INICIAL ---
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Referências para os elementos da UI
const menuContainer = document.getElementById("menuContainer");
const gameUiContainer = document.getElementById("gameUiContainer");
const playButton = document.getElementById("playButton");
const scoreElement = document.getElementById("score");

let score = 0;
let gameScene;
let menuScene;

// Esconde a UI do jogo no início
gameUiContainer.style.display = 'none';


// --- CENA DO MENU ---
const createMenuScene = function() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Fundo preto

    // Câmera do menu que gira lentamente
    const camera = new BABYLON.ArcRotateCamera("menuCamera", -Math.PI / 2, Math.PI / 2.5, 15, BABYLON.Vector3.Zero(), scene);
    
    // Animação da câmera
    scene.registerBeforeRender(() => {
        camera.alpha += 0.001 * scene.getAnimationRatio(); // Gira lentamente
    });

    // Iluminação
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 0, -5), scene);
    pointLight.intensity = 0.5;

    // Criando o Texto 3D (requer o FontData)
    const font_url = "https://assets.babylonjs.com/fonts/Fira%20Code%20Regular.json";
    fetch(font_url)
        .then(response => response.json())
        .then(fontData => {
            const textMesh = BABYLON.MeshBuilder.CreateText("title", "TIRO AO ALVO", fontData, {
                size: 2,
                resolution: 16,
                depth: 0.5
            }, scene);

            // Centraliza o texto
            const center = textMesh.getAbsolutePosition();
            textMesh.position.x -= center.x;

            // Material para o texto (aparência metálica vermelha)
            const textMaterial = new BABYLON.StandardMaterial("textMat", scene);
            textMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
            textMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            textMesh.material = textMaterial;
        });

    return scene;
};


// --- CENA DO JOGO ---
const createGameScene = function() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.2, 0.3, 0.5); // Cor de fundo do céu
    
    // Trava o ponteiro do mouse para uma experiência FPS
    scene.onPointerDown = (evt) => {
        if (evt.button === 0) { // Botão esquerdo do mouse
            engine.enterPointerlock();
            shoot(scene); // Chama a função de tiro
        }
    };
    
    // Câmera em primeira pessoa
    const camera = new BABYLON.FreeCamera("gameCamera", new BABYLON.Vector3(0, 0, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true); // Permite o controle da câmera com o mouse
    camera.speed = 0.3; // Velocidade de movimento da câmera (opcional)

    // Iluminação
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;
    
    // Função para criar um novo alvo
    const createTarget = function() {
        const target = BABYLON.MeshBuilder.CreateSphere("target", {diameter: 1.5, segments: 32}, scene);
        const material = new BABYLON.StandardMaterial("targetMaterial", scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Vermelho
        target.material = material;
        target.tag = "target"; // Tag para identificar o alvo
        
        // Gera posição aleatória
        target.position.x = (Math.random() - 0.5) * 20;
        target.position.y = (Math.random() - 0.5) * 12;
        target.position.z = Math.random() * 10;
    };
    
    // Função de tiro
    const shoot = function(scene) {
        // Dispara um raio do centro da tela (onde a mira está)
        const pickResult = scene.pick(engine.getRenderWidth() / 2, engine.getRenderHeight() / 2);

        if (pickResult.hit && pickResult.pickedMesh.tag === "target") {
            pickResult.pickedMesh.dispose(); // Remove o alvo
            score++;
            scoreElement.innerText = `Pontuação: ${score}`;
            createTarget(); // Cria um novo alvo
        }
    };

    // Cria 3 alvos iniciais
    for (let i = 0; i < 3; i++) {
        createTarget();
    }
    
    return scene;
};


// --- LÓGICA PRINCIPAL E TRANSIÇÃO ---

// Inicia com a cena do menu
menuScene = createMenuScene();
let currentScene = menuScene;

// Botão de Jogar
playButton.addEventListener("click", () => {
    // Esconde a UI do menu e mostra a do jogo
    menuContainer.style.display = "none";
    gameUiContainer.style.display = "block";
    
    // Cria a cena do jogo (se ainda não existir)
    if (!gameScene) {
        gameScene = createGameScene();
    }

    // Muda a cena ativa
    currentScene = gameScene;
});

// Loop de renderização principal
engine.runRenderLoop(() => {
    if (currentScene) {
        currentScene.render();
    }
});

// Redimensionamento da janela
window.addEventListener("resize", () => {
    engine.resize();
});
