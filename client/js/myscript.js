var socket = io.connect();
var brightness = 0;
var onOff = 0;
var colorTemperature = 0;
var mode = $('input[type="radio"][name="options"]:checked').val();




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

function IdShowUp(id) {
    $('#' + id).hide();
    $('#' + id).show(720);
}

$(document).ready(function() {
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
        $(".mdl-progress.tomato-card-progress").css("display", "none");
        $(".mdl-button.giveup").css("display", "none");
        $(".mdl-button.timing").css("display", "inline-block");
        $(".tomato-card-instruction").show(360);
    });

    $("#showTime").on('click', function() {
        var timePicker = new DateTimePicker.Time();
        timePicker.on('selected', function(formatTime, now) {
            $("#showTime").html(formatTime);
        });
    });
    $("#confirm-add-alarm").on('click', function() {
        var naturalWakeUp = $('#natural-wake-up-switch:checkbox:checked').val();
        var alarmNote = $('#alarm-note').val();
        var alarmTime = $("#showTime").html();
        if (alarmTime == '/ / : / /') {
            $("#showTime").css('background-color', '#DDDDDD');
            setTimeout(function() {
                $("#showTime").css('background-color', '#FFFFFF');
                setTimeout(function() {
                    $("#showTime").css('background-color', '#DDDDDD');
                    setTimeout(function() {
                        $("#showTime").css('background-color', '#FFFFFF');
                    }, 160);
                }, 260);
            }, 160);
        } else {
            socket.emit('new alarm info', {
                natural_wakeUp: naturalWakeUp,
                alarm_tag: alarmNote,
                alarm_time: alarmTime
            });

        }
    });
    socket.on('new alarm setting', function(msg) {
        var alarmKey = msg.alarm_time.replace(":", "");
        var cardId = 'a' + alarmKey;
        var wakeupMode = "";
        var wakeupModeInfo = "";
        if (msg.alarm_time.naturalWakeUp) {
            wakeupMode = "自然唤醒";
            wakeupModeInfo = "模拟日出光线的变化，用自然的方式，自然的唤醒你";
        } else {
            wakeupMode = "日常提醒";
            wakeupModeInfo = "呼吸灯，灯，等灯等灯";
        }
        if (msg.alarmNote != "") {
            wakeupModeInfo = msg.alarmNote;
        }
        $('.alarm-zone').prepend("<div" + " id = a" + alarmKey + " class='alarm-card mdl-card'><div class='mdl-card__title'><h2 class='mdl-card__title-text timing-content-title'>" + msg.alarm_time + " " + wakeupMode + "</h2></div><div class='mdl-card__supporting-text'>" + wakeupModeInfo + "<div class='alarm-card-instruction'></div></div><div class='mdl-card__actions mdl-card--border'><a class='mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect'>停用闹钟</a><a class='mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect'>删除闹钟</a></div></div><br/>");
        IdShowUp(cardId);
    });
});