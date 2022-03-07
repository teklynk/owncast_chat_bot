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

            // Remove html characters from message body/string
            messageBody = messageBody.replace(/(<([^>]+)>)/ig, '');

            // Check if message starts with !
            if (messageBody.startsWith('!') && localStorage.getItem('oc_alert_timestamp') !== getChatJson[0].timestamp) {
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
        $.each(commandsJson, function (idx, obj) {
            if (chatMsg.trim().toLowerCase() === obj.command) {

                // Ignore commands if already playing the command from that user
                if ($("#container .alertItem." + obj.command.slice(1) + "." + userId + "").length) {
                    console.log(obj.command + ': is currently playing');
                    return false;
                }

                // Debugging - safe to leave this here
                console.log(obj.command);
                console.log(obj.image);
                console.log(obj.audio);
                console.log(obj.video);
                console.log(obj.message);
                console.log(obj.timelimit);

                // Remove html characters from message userName/string
                //userName = userName.replace(/(<([^>]+)>)/ig, '');

                // Replace {username} from commands.json with the actual username
                obj.message = obj.message.replace("{username}", userName.trim());

                // Store timestamp of the message that contained a command so that we can reference it later
                localStorage.setItem('oc_alert_timestamp', timeStamp);

                // Remove divs before displaying new alert
                $("#container .alertItem." + obj.command.slice(1) + "").remove();

                // Create alertItem element
                $("<div class='alertItem " + obj.command.slice(1) + " " + userId + "'>").appendTo("#container");

                if (obj.audio) {
                    $("<audio class='audio' preload='auto' src='./media/" + obj.audio + "' autoplay></audio>").appendTo(".alertItem." + obj.command.slice(1) + "." + userId + "");
                }

                // Video overlay
                if (obj.video) {
                    let ext = obj.video.split('.').pop();
                    $("<video id='clip_" + obj.command.slice(1) + "' class='video' autoplay><source src='./media/" + obj.video + "' type='video/" + ext + "'></video>").appendTo(".alertItem." + obj.command.slice(1) + "." + userId + "");
                }

                // Displays an image in the overlay
                if (obj.image) {
                    $("<img class='image' src='./media/" + obj.image + "'/>").appendTo(".alertItem." + obj.command.slice(1) + "." + userId + "");
                }

                // Displays text in the overlay
                if (obj.message) {
                    $("<p class='message'>" + obj.message + "</p>").appendTo(".alertItem." + obj.command.slice(1) + "." + userId + "");
                }

                // Say a chat message - uses the Name from your accesstoken
                if (obj.say) {
                    sendMessage(obj.say);
                }

                // Remove alertItem element after timelimit has been reached
                $("#container .alertItem." + obj.command.slice(1) + "." + userId + "").fadeIn(500).delay(parseInt(obj.timelimit)).fadeOut(500, function () {
                    console.log('timelimit reached. removing ' + obj.command);
                    $(this).remove();
                });
            }
        })
    }

    // Check for new messages every second - polls the api
    setInterval(getMessage, 1000);

});