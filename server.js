const port = process.env.PORT || 8080;
const path = require('path');
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const http = require('http');
const socketIo = require('socket.io');

// start webserver on port 8080
const server = http.createServer(app);
const io = socketIo.listen(server);

// add directory with our static files
app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')))
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
// array of all lines drawn
let line_history = [];

// event-handler for new incoming connections
io.on('connection', function(socket) {
    // first send the history to the new client
    for (var i in line_history) {
        socket.emit('draw_line', {
            line: line_history[i]
        });
    }

    // add handler for message type "draw_line".
    socket.on('draw_line', function(data) {
        // add received line to history
        line_history.push(data.line);
        // send line to all clients
        io.emit('draw_line', {
            line: data.line
        });
    });
    socket.on('clearit', function() {
        line_history = [];
        io.emit('clearit', true);
    });
});