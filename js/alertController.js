/*
    Script with the Alert class for showing my custom alerts
 */
var alert = null;
var alertDuration = 5000;
var notificationsHeight = 0;
var messagesShown = [];

class Alert {
    constructor() {
    }

    alert(type, title, text, duration) {
        //console.log('Showing Alert: ' + type);
        var diese = this;

        var message = $('.' + type)[0].cloneNode(true);

        if(title == null) title = type.charAt(0).toUpperCase() + type.slice(1);
        message.getElementsByTagName("H3")[0].innerHTML = title;
        message.getElementsByTagName("P")[0].innerHTML = text;

        if(messagesShown.length === 1) messagesShown.length = 0;

        //var height = messagesShown.length;
        //console.log(height);
        //var locY = messagesShown.length * 60;
        //console.log(duration);

        if(duration == null) duration = alertDuration;
        message.id = message.id + messagesShown.length;

        document.getElementById('alerts').appendChild(message);
        $(message).animate({opacity:1}, 500, function() {
            setTimeout(diese.closeMessage.bind(this, message.id), duration);
            messagesShown.push(this);
        });
    }

    closeMessage(id) {
        messagesShown.pop();
        $("#" + id).animate({opacity: 0}, 500, function() {
            document.getElementById(id).remove();
            //console.log('Message closed');
        });
    }
}

alert = new Alert();
