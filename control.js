'use strict';

const net = require('net');
const fs = require('fs');

function Socket(path, successCallback, cmdCallback) {
    let server = net.createServer();
	let invokedSuccess = false;
	
	function invokeSuccess() {
		if (invokedSuccess) {
			return;
		}
		
		invokedSuccess = true;
		
		successCallback();
	}
    
    server.on('connection', function(connection) {
        console.info('CONTROL: Socket open');
        
        connection.on('end', function() {
            console.info('CONTROL: Socket closed');
        });
        
        connection.on('data', function(data) {
            //console.log('CONTROL: Got raw data:', data);
            let text = data.toString();
            
            let lines = text.split('\n').filter(function(val, idx, arr) {
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

        fs.chmod(path, parseInt('775', 8), invokeSuccess);
    });

    server.on('error', function (e) {
        switch (e.code) {
            case 'EADDRINUSE':
                console.warn('CONTROL: Socket in use, retrying...');
                fs.unlink(path, bindSocket);
            break;
            case 'EACCES':
				console.warn('CONTROL: Access denied');
			break;
            default:
                throw e;
            break;
        }
		
		console.warn('Starting without control socket...');
		invokeSuccess();
    });

    function bindSocket() {
        console.info('CONTROL: Attempting to bind socket...');
        server.listen(path);
    }

    bindSocket();
}

exports.Socket = Socket;
