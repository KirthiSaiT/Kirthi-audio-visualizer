let audioContext;
let source;
let analyser;
let animationFrameId;

document.getElementById("audio").addEventListener("change", (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
        const arrayBuffer = event.target.result;

        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
            visualize(audioBuffer, audioContext);
        });
    });

    reader.readAsArrayBuffer(file);
});

document.getElementById("stopButton").addEventListener("click", () => {
    if (source) {
        source.stop();
        source.disconnect();
    }
    if (analyser) {
        analyser.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
    cancelAnimationFrame(animationFrameId);
    const canvas = document.getElementById("canvas");
    const canvasContext = canvas.getContext("2d");
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
});

function visualize(audioBuffer, audioContext) {
    const canvas = document.getElementById("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const frequencyBufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(frequencyBufferLength);

    source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    source.start();

    const canvasContext = canvas.getContext("2d");

    const barWidth = canvas.width / frequencyBufferLength;

    function draw() {
        animationFrameId = requestAnimationFrame(draw);
        canvasContext.fillStyle = "rgb(30, 30, 30)";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        analyser.getByteFrequencyData(frequencyData);

        for (let i = 0; i < frequencyBufferLength; i++) {
            canvasContext.fillStyle = `rgb(${frequencyData[i]}, 119, 189)`;
            canvasContext.fillRect(
                i * barWidth,
                canvas.height - frequencyData[i],
                barWidth - 1,
                frequencyData[i]
            );
        }
    }

    draw();
}
