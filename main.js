var mraa = require('mraa');
console.log('MRAA Version: ' + mraa.getVersion());

var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var pwm3 = new mraa.Pwm(3);
var pwm9 = new mraa.Pwm(9);
pwm3.enable(true);
pwm9.enable(true);

var Pos = new mraa.Gpio(2);
var Neg = new mraa.Gpio(4);
var Pos2 = new mraa.Gpio(8);
var Neg2 = new mraa.Gpio(12);
var Switch = new mraa.Gpio(13);


var cold = 0;
var warm = 0;




Pos.dir(mraa.DIR_OUT);
Neg.dir(mraa.DIR_OUT);
Pos2.dir(mraa.DIR_OUT);
Neg2.dir(mraa.DIR_OUT);
Switch.dir(mraa.DIR_IN);

Neg.write(0);
Neg2.write(0);

Pos.write(1);
Pos2.write(1);

pwm9.write(1);
pwm3.write(1);


var switch_value = Switch.read();



function  watchdog() {
    setTimeout(function () {
        if (switch_value != Switch.read())
        {
            if(Pos.read()){
                Pos.write(0);
                Pos2.write(0);
                switch_value = Switch.read();

            }else{
                Pos.write(1);
                Pos2.write(1);
                switch_value = Switch.read();
            }

        }
        io.emit('watch dog', Pos.read());
        watchdog();
    },200);
}
watchdog();

io.on('connection', function (socket) {
    socket.on('all LED', function (msg) {
        Pos.write(msg.value);
        Pos2.write(msg.value);
    });

    socket.on('LED state', function (msg) {
        if(msg.temperature>50){
            cold = (50-(msg.temperature-50))/50;
            warm = 1;
        }else{
            warm = (msg.temperature/50);
            cold = 1;
        }
        pwm9.write(msg.LEDBrightness/100*cold);
        pwm3.write(msg.LEDBrightness/100*warm);
    });

});






app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/client', 'index.html'));
});
app.use(express.static(__dirname + '/client'));
app.use('/client', express.static(__dirname + '/client'));

http.listen(3000, function () {
    console.log('Web server Active listening on *:3000');
});