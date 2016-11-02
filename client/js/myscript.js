var socket = io.connect();
var brightness = 0;
var onOff = 0;
var colorTemperature = 0;
var mode = $('input[type="radio"][name="options"]:checked').val();



socket.on('watch dog', function (msg) {
    onOff = msg;
});



$("#switch").on('click', function (e) {
    if (onOff === 0){
        onOff = 1;
    }else{
        onOff = 0;
    }
    socket.emit('all LED', {
        value: onOff
    });
});


$(document).ready(function () {
    setInterval(function () {
        colorTemperature = document.getElementById('color-temperature').value;
        brightness = document.getElementById('brightness').value;
        mode = $('input[type="radio"][name="options"]:checked').val();
        if(mode == 3){
            brightness = 99;
            colorTemperature = 99;
        }else if(mode == 2){
            brightness = 99;
            colorTemperature = 50;
        }else if(mode == 1){
            brightness = 99;
            colorTemperature = 80;
        }
        
        socket.emit('LED state', {
            LEDBrightness: brightness,
            temperature: colorTemperature
        });
    }, 30);
});
