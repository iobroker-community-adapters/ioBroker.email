/**
 *
 *      ioBroker email Adapter
 *
 *      (c) 2014 bluefox
 *
 *      MIT License
 *
 */

var nodemailer;

var adapter = require(__dirname + '/../../lib/adapter.js')({

    name:           'email',

    objectChange: function (id, obj) {

    },

    stateChange: function (id, state) {
        
    },

    unload: function (callback) {
        try {
            adapter.log.info('terminating');
            callback();
        } catch (e) {
            callback();
        }
    },

    ready: function () {
        adapter.config.transportOptions.auth.pass = decrypt("Zgfr56gFe87jJOM", adapter.config.transportOptions.auth.pass);
        main();
    },
    
    // New message arrived. obj is array with current messages
    message: function (obj) {
        if (obj && obj.command == "send") processMessage(obj.message);
        processMessages();
        return true;
    }

});

var stopTimer = null;
var emailTransport;

function decrypt(key, value) {
    var result = "";
    for(var i = 0; i < value.length; ++i) {
        result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
    }
    return result;
}

// Terminate adapter after 30 seconds idle
function stop() {
    if (stopTimer) {
        clearTimeout(stopTimer);
    }
    // Stop only if subscribe mode
    if (adapter.common && adapter.common.mode == 'subscribe') {
        stopTimer = setTimeout(function () {
            stopTimer = null;
            adapter.stop();
        }, 30000);
    }
}

function processMessage(message) {
    if (stopTimer) {
        clearTimeout(stopTimer);
    }

    sendEmail(message);

    stop();
}

function processMessages() {
    adapter.getMessage(function (err, obj) {
        if (obj) {
            processMessage(obj.message);
            processMessages();
        }
    });
}

function main() {
    // Adapter is started only if some one writes into "system.adapter.email.X.messagebox" new value
    processMessages();
    stop();
}

function sendEmail(message, callback) {
    if (!message) {
        message = {};
    }
    
    if (!emailTransport) {
        if (!adapter.config.transportOptions.host || !adapter.config.transportOptions.port) {
            delete adapter.config.transportOptions.host;
            delete adapter.config.transportOptions.port;
            delete adapter.config.transportOptions.secure;
        }

        emailTransport = require("nodemailer").createTransport(adapter.config.transportOptions);
    }

    if (typeof message != "object") {
        message = {text: message};
    }
    message.from =    message.from    || adapter.config.defaults.from;
    message.to =      message.to      || adapter.config.defaults.to;
    message.subject = message.subject || adapter.config.defaults.subject;
    message.text =    message.text    || adapter.config.defaults.text;

    adapter.log.info("Send email: " + JSON.stringify(message));

    emailTransport.sendMail(message, function (error, response) {
        if (error) {
            adapter.log.error("Error " + JSON.stringify(error));
            if (callback) callback(error);
        } else {
            adapter.log.info("sent to " + message.to);
            if (callback) callback(null);
        }
        stop();
    });
}
