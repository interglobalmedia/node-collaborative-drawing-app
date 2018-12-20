document.addEventListener('DOMContentLoaded', function() {
    const mouse = {
        click: false,
        move: false,
        pos: {
            x: 0,
            y: 0
        },
        pos_prev: false
    };
    // get canvas element and create context
    const canvas = document.getElementById('drawing');
    const context = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    // resize canvas size to size of window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // base settings
    canvas.style.backgroundColor = '#d2cc77';

    const socket = io.connect();

    // register mouse event handlers
    canvas.onmousedown = function(e) {
        mouse.click = true;
    };
    canvas.onmouseup = function(e) {
        mouse.click = false;
    };
    canvas.onmousemove = function(e) {
        // normalize mouse position to range 0.0 - 1.0
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;
    };
    // draw line received from server
    socket.on('draw_line', function(data) {
        // if (!isDrawing) return;
        console.log(data);
        const line = data.line;
        context.strokeStyle = 'red';
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.lineWidth = 2;
        context.stroke();
    });

    socket.on('clearit', function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        console.log('client clearit');
    });

    function clearit() {
        socket.emit('clearit', true);
    }

    const clear = document.querySelector('.clear');

    clear.addEventListener('click', () => {
        clearit();
    });

    // main loop, running every 25ms
    function mainLoop() {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
            socket.emit('draw_line', {
                line: [mouse.pos, mouse.pos_prev]
            });
            mouse.move = false;
        }
        mouse.pos_prev = {
            x: mouse.pos.x,
            y: mouse.pos.y
        };
        setTimeout(mainLoop, 25);
    }
    mainLoop();
});