/**
 *
 *      ioBroker email Adapter
 *
 *      (c) 2014 bluefox
 *
 *      MIT License
 *
 */

var hue = require("nodemailer");

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
        main();
    },
    
    // New message arrived. obj is array with current messages
    message: function (obj) {
        if (obj && obj.command == "send")
            processMessage(obj.message);
        }
        return true;
    }

});

var stopTimer = null;
var emailTransport;

// Terminate adapter after 30 seconds idle
function stop() {
    if (stopTimer) {
        clearTimeout(stopTimer);
    }
    stopTimer = setTimeout(function() { 
        stopTimer = null;
        adapter.stop(); 
    }, 30000);
}

function processMessage(message) {
    if (stopTimer) {
        clearTimeout(stopTimer);
    }

    sendEmail(message);

    stop();
}

function main() {
    // Adapter is started only if some one writes into "system.adapter.email.X.messagebox" new value
    adapter.getState("messagebox", function (err, obj) {
        if (obj && obj.length) {
            adapter.setState("messagebox", [], function () {
                for (var i = 0; i < obj.length; i++) {
                    processMessage(obj);
                }
            });
        }
    });
    stop();
}

function sendEmail(message) {
    if (!emailTransport) {
        emailTransport = nodemailer.createTransport(adapter.config.transport, adapter.config.transportOptions);
    }

    if (typeof message != "object") {
        message = {text: message};
    }
    var msg = {
        from:    message.from    || adapter.config.defaults.from;
        to:      message.to      || adapter.config.defaults.to;
        subject: message.subject || adapter.config.defaults.subject;
        text:    message.text    || adapter.config.defaults.text;
    };
    
    emailTransport.sendMail(msg, function(error, response){
        if (error) {
            adapter.log.error("Error " + JSON.stringify(error))
        } else {
            adapter.log.info("sent to " + msg.to);
        }
        adapter.stop();
    });
}
