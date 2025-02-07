// Sélection des éléments HTML
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");

// Création de l'instance de MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

// Configuration des options, ici on définit maxNumHands à 10
hands.setOptions({
  maxNumHands: 1000,            // Nombre maximum de mains à détecter
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// Callback : fonction appelée à chaque résultat détecté
function onResults(results) {
  // Sauvegarde de l'état du canvas
  canvasCtx.save();
  // Efface le canvas
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  // Dessine l'image de la vidéo en fond
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  // Initialisation du compteur de mains détectées
  let nbMains = 0;

  // Si des mains ont été détectées, on dessine les repères
  if (results.multiHandLandmarks) {
    nbMains = results.multiHandLandmarks.length; // On compte le nombre de mains
    for (const landmarks of results.multiHandLandmarks) {
      // Dessine les connexions entre les repères
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 5
      });
      // Dessine les points des repères
      drawLandmarks(canvasCtx, landmarks, {
        color: '#FF0000',
        lineWidth: 2
      });
    }
  }

  // Affichage du compteur de mains sur le canvas
  canvasCtx.font = "24px Arial";
  canvasCtx.fillStyle = "black";
  canvasCtx.fillText("Mains détectées: " + nbMains, 10, 470);
  
  // Restauration du contexte du canvas
  canvasCtx.restore();
}

// Attache la fonction onResults à l'instance hands
hands.onResults(onResults);

// Utilisation de Camera pour gérer le flux webcam
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
camera.start();
// On a testé en ml5.js pour compter plusieurs mains mais ml5.js ne peut pas me permettre de compter + de 2 mains, donc on est passé par MediaPipeHands