var socket = io.connect();
var brightness = 0;
var onOff = 0;
var colorTemperature = 0;
var mode = $('input[type="radio"][name="options"]:checked').val();


socket.on('watch dog', function(msg) {
    onOff = msg;
});


$("#switch").on('click', function(e) {
    if (onOff === 0) {
        onOff = 1;
    } else {
        onOff = 0;
    }
    socket.emit('all LED', {
        value: onOff
    });
});


$(document).ready(function() {
    function modeInformationSet() {
        setTimeout(function() {
            colorTemperature = document.getElementById('color-temperature').value;
            brightness = document.getElementById('brightness').value;
            mode = $('input[type="radio"][name="options"]:checked').val();
            if (mode == 3) {
                brightness = 99;
                colorTemperature = 99;
            } else if (mode == 2) {
                brightness = 99;
                colorTemperature = 50;
            } else if (mode == 1) {
                brightness = 99;
                colorTemperature = 80;
            }
            blink(brightness);
            socket.emit('LED state', {
                LEDBrightness: brightness,
                temperature: colorTemperature
            });
            modeInformationSet();
        }, 30);
    }
    modeInformationSet();

    $(".timing").click(function() {
        $(".mdl-progress.tomato-card-progress").css("display", "block");
        $(".mdl-button.giveup").css("display", "inline-block");
        $(".mdl-button.timing").css("display", "none");
        $(".tomato-card-instruction").hide(360);
        socket.emit('start timing', { value: 1 });
    });
    $(".giveup").click(function() {
         $('.timing-content-title').html('1分钟');
        $(".mdl-progress.tomato-card-progress").css("display", "none");
        $(".mdl-button.giveup").css("display", "none");
        $(".mdl-button.timing").css("display", "inline-block");
        $(".tomato-card-instruction").show(360);
        socket.emit('giveup timing', { value: 'giveup timing' });
    });
    socket.on('now second', function(msg) {
        msg = 1 * 60 - msg;
        $('.timing-content-title').html('剩余' + msg);
    });
    socket.on('timing over', function() {
        $('.timing-content-title').html('1分钟');
    });


});


function blink(currentBirghtness) {
    var temp = currentBirghtness;
    var n = 0;
    setTimeout(function() {
        if (currentBirghtness >= 2) {
            currentBirghtness = currentBirghtness - currentBirghtness / 6;
        } else {
            currentBirghtness = temp;
            n++;
            if (n === 4) {
                return;
            }

        }
        socket.emit('LED state', {
            LEDBrightness: brightness,
            temperature: colorTemperature
        });
    }, 30);

}