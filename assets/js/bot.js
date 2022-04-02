$(document).ready(function () {

    // Sort function
    function sortByProperty(property) {
        return function (a, b) {
            if (a[property] < b[property])
                return 1;
            else if (a[property] > b[property])
                return -1;
            return 0;
        }
    }

    // Parse config.json file for accesstoken and domain
    let configJson = JSON.parse($.getJSON({'url': "./config.json", 'async': false}).responseText);
    let commandsJson = JSON.parse($.getJSON({'url': "./commands.json", 'async': false}).responseText);

    let accessToken = configJson[0].accesstoken;
    let owncastDomain = configJson[0].owncastdomain;

    if (!accessToken) {
        alert('accessToken is not set in config.json');
    }

    if (!owncastDomain) {
        alert('owncastDomain is not set in config.json');
    }

    // Initial load of all commands into localStorage. Refreshing the broswer source will reset cooldown to zero
    if (commandsJson.length) {
        for (let x in commandsJson) {
            localStorage.setItem(commandsJson[x]['command'], '0');
        }
    }

    function sendMessage(sayMessage) {
        $.ajax({
            type: 'post',
            url: owncastDomain + "/api/integrations/chat/send",
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            data: JSON.stringify({"body": sayMessage}),
            processData: false,
            success: function (data, textStatus, jQxhr) {
                console.log(data);
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    function getMessage() {

        // Owncast chat api
        let getChatJson = JSON.parse($.getJSON({
            'url': "" + owncastDomain.trim() + "/api/chat?accessToken=" + accessToken.trim() + "",
            'async': false
        }).responseText);

        // Sort messages array by timestamp
        if (getChatJson[0]) {
            getChatJson.sort(sortByProperty('timestamp'));
        }

        // Only do this if messages exist
        if (getChatJson[0] && getChatJson[0].type === "CHAT") {

            // Return the most recent message object
            let messageBody = getChatJson[0].body;

            // Remove html characters from message body/string and trim
            messageBody = messageBody.replace(/(<([^>]+)>)/ig, '').trim();

            // Check if message starts with !
            if (messageBody.startsWith('!') && localStorage.getItem('oc_alert_timestamp') !== getChatJson[0].timestamp) {

                // Ignore if alert is already playing
                if ($(".alertItem").length) {
                    console.log('blocked');
                    return false; // Exit and Do nothing
                }

                // Do the alert
                getAlert(messageBody, getChatJson[0].timestamp, getChatJson[0].user.id, getChatJson[0].user.displayName);
            }

        }

        // Do something with Follows
        if (getChatJson[0] && getChatJson[0].type === "FEDIVERSE_ENGAGEMENT_FOLLOW" && localStorage.getItem('oc_alert_timestamp') !== getChatJson[0].timestamp) {
            // Do the alert for new followers
            getAlert("!fediversefollow", getChatJson[0].timestamp, getChatJson[0].id, getChatJson[0].body);
        }
    }

    function getAlert(chatMsg, timeStamp, userId, userName) {

        chatMsg = chatMsg.replace(/(<([^>]+)>)/ig, '');
        userName = userName.replace(/(<([^>]+)>)/ig, '');

        let coolDownExpired = true;

        $.each(commandsJson, function (idx, obj) {
            if (chatMsg === obj.command) {

                // common selector used through out the code
                let alertElem = ".alertItem." + obj.command.slice(1) + "." + userId + "";

                let coolDown = parseInt(obj.cooldown);

                let date = new Date();

                // Store timestamp of the message so that we can reference it later
                localStorage.setItem('oc_alert_timestamp', timeStamp);

                // Replace {username} from commands.json with the actual username
                obj.message = obj.message.replace("{username}", userName.trim());

                // Compare current time with the stored timestamp
                if (date.getTime() > parseInt(localStorage.getItem(chatMsg)) + coolDown) {
                    coolDownExpired = true;
                    localStorage.setItem(chatMsg, date.getTime());
                } else {
                    coolDownExpired = false;
                }

                // Ignore if cooldown has not expired
                if (coolDownExpired === false) {
                    return false;
                }

                // Ignore commands if already playing the command from that user
                if ($('#container ' + alertElem).length) {
                    return false;
                }

                // Remove divs before displaying new alert
                $('#container ' + alertElem).remove();

                // Create alertItem element
                $("<div class='alertItem " + obj.command.slice(1) + " " + userId + "'>").appendTo("#container");

                // Audio overlay
                if (obj.audio) {
                    $("<audio class='audio' src='./media/" + obj.audio + "' autoplay></audio>").appendTo(alertElem);
                }

                // Video overlay
                if (obj.video) {
                    let ext = obj.video.split('.').pop();
                    $("<video id='clip_" + obj.command.slice(1) + "' class='video' autoplay><source src='./media/" + obj.video + "' type='video/" + ext + "'></video>").appendTo(alertElem);
                }

                // Displays an image in the overlay
                if (obj.image) {
                    $("<img class='image' src='./media/" + obj.image + "'/>").appendTo(alertElem);
                }

                // Displays text in the overlay
                if (obj.message) {
                    $("<p class='message'>" + obj.message + "</p>").appendTo(alertElem);
                }

                // Say a chat message - uses the Name from your accesstoken
                if (obj.say) {
                    sendMessage(obj.say);
                }

                // Remove alertItem element after timelimit has been reached
                $('#container ' + alertElem).fadeIn(500).delay(parseInt(obj.timelimit)).fadeOut(500, function () {
                    $(this).remove();
                });
            }
        })
    }

    // Check for new messages every second - polls the api
    setInterval(getMessage, 1000);

});