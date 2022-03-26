'use strict';

function Socket(options, cmdCallback) {
	const net = require('net');
	const fs = require('fs');

    const server = net.createServer();

    server.on('connection', function(connection) {
        console.info('CONTROL: Socket open');

        connection.on('error', function(e) {
            console.error('CONTROL: Error in socket, code=' + e.code);
        });

        connection.on('end', function() {
            console.info('CONTROL: Socket closed');
        });

        connection.on('data', function(data) {
            //console.log('CONTROL: Got raw data:', data);
            let text = data.toString();

            let lines = text.split('\n').filter(function(val) {
                return !!val;
            });

            //console.log(lines);

            let len = lines.length;

            for (let i = 0; i < len; ++i) {
				let line = lines[i];
                console.log('CONTROL: Got data:', line);
                cmdCallback(line);
            }
        });
    });

    server.on('listening', function() {
        console.info('CONTROL: Socket bound');


		if ('path' in options) {
			fs.chmodSync(options.path, 0o775);
		}
    });

    server.on('error', function (e) {
        switch (e.code) {
            case 'EADDRINUSE':
				if ('path' in options) {
					console.warn('CONTROL: Socket in use, retrying...');
					fs.unlink(options.path, bindSocket);
				}
				else {
					console.warn('CONTROL: Socket in use!');
				}
            break;
            case 'EACCES':
				console.error('CONTROL: Access denied');
			break;
            default:
                console.error('CONTROL: Error opening socket, code=' + e.code);
            break;
        }

		console.warn('CONTROL: Starting without control socket');
    });

    function bindSocket() {
        console.info('CONTROL: Attempting to bind socket...');
        server.listen(options);
    }

    bindSocket();
}

exports.Socket = Socket;
