import { hslToRgb } from "./utils";

//set up canvas
const WIDTH_CNVS = 1500;
const HEIGHT_CNVS = 1500;

//ref canvas elem
const CANVAS= document.querySelector('canvas');

//2d canvas is selected
const CANVASCONTXT= CANVAS.getContext('2d');

CANVAS.width= WIDTH_CNVS;
CANVAS.height=HEIGHT_CNVS;

let audioAnalzer;

//start execution of phonic visualization
requestAudio();

//must be on secure origin to access microphone localhost or https
async function requestAudio(){
const audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
const audioContxt= new AudioContext();
//init audio analyzer
audioAnalzer= audioContxt.createAnalyser();
//init audio source (mic)
const audioIN = audioContxt.createMediaStreamSource(audioStream);
//connect the audioIN to the analzer
audioIN.connect(audioAnalzer); 
//specify how much data should be collected/portrayed on canvas
audioAnalzer.fftSize=Math.pow(2,8); //higher the second value => more data recieved
//extract data from audioIN uInt8 can hold 8 bits large data analysis
const timeSpanData= new Uint8Array(audioAnalzer.frequencyBinCount); 
//console.log(timeSpanData);
const freqSpanData= new Uint8Array(audioAnalzer.frequencyBinCount);
//console.log(freqSpanData);
paintTimeData(timeSpanData);
paintFrequencyData(freqSpanData);
}


function paintTimeData(timeSpanData){
CANVASCONTXT.clearRect(0,0,WIDTH_CNVS,HEIGHT_CNVS);
audioAnalzer.getByteTimeDomainData(timeSpanData); //chose which array to inject timedata into
//repeatedly call itself ASAP
CANVASCONTXT.lineWidth=10;
CANVASCONTXT.strokeStyle='#b056a2';
CANVASCONTXT.beginPath();
//size of each slice in visualization
const pieceWidth= WIDTH_CNVS / (audioAnalzer.frequencyBinCount);
let xC= 0; //x coordinate
//have to divide by 128 because when c = 1 data = 128
timeSpanData.forEach((data,i) =>{
const c = data/128;
const yC= c*HEIGHT_CNVS/2; // y coordinate
//draw lines
if(i!=0){
    CANVASCONTXT.lineTo(xC,yC)
}
else {
    CANVASCONTXT.moveTo(xC,yC);
}
xC+=pieceWidth;
});
CANVASCONTXT.stroke();
requestAnimationFrame(()=> paintTimeData(timeSpanData));
}



function paintFrequencyData(freqSpanData){
audioAnalzer.getByteFrequencyData(freqSpanData); //chose which array to inject frequency data into
const freqBarWidth= (WIDTH_CNVS/audioAnalzer.frequencyBinCount)*2.5;
let inc =0;
freqSpanData.forEach((data)=>{
 // 0 - 255
 const [h, s, l] = [360 / ((data / 255) * 360) - 0.5, 0.8, 0.5];
 const barHeight = HEIGHT_CNVS * (data / 255) * 0.5;
 //  Convert the HSL to rgb color
 const [r, g, b] = hslToRgb(h, s, l);
 CANVASCONTXT.fillStyle = `rgb(${r},${g},${b})`;
 CANVASCONTXT.fillRect(inc, HEIGHT_CNVS - barHeight, freqBarWidth, barHeight);
 inc+= freqBarWidth + 2;
});
requestAnimationFrame(()=> paintFrequencyData(freqSpanData));
}

