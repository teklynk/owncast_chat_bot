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

    function getMessage() {
        // Owncast chat api
        let getChatJson = JSON.parse($.getJSON({
            'url': "" + owncastDomain + "/api/chat?accessToken=" + accessToken + "",
            'async': false
        }).responseText);

        // Sort messages array by timestamp
        getChatJson.sort(sortByProperty('timestamp'));

        // Return the most recent message object
        let messageBody = getChatJson[0].body;

        if (messageBody.startsWith('!') && localStorage.getItem('oc_alert_timestamp') !== getChatJson[0].timestamp) {
            getAlert(messageBody, getChatJson[0].timestamp);
        }
    }

    function getAlert(chatMsg, timeStamp) {
        $.each(commandsJson, function (idx, obj) {
            if (chatMsg.trim().toLowerCase() === obj.command) {
                console.log(obj.command);
                console.log(obj.image);
                console.log(obj.audio);
                console.log(obj.video);
                console.log(obj.message);
                console.log(obj.timelimit);

                // Store timestamp of the message that contained a command so that we can reference it later
                localStorage.setItem('oc_alert_timestamp', timeStamp);

                // Remove divs before displaying new alert
                $("#container .alertItem").remove();

                $("<div class='alertItem " + obj.command.slice(1) + "'>").appendTo("#container");

                if (obj.audio) {
                    let ext = obj.audio.split('.').pop();
                    $("<audio class='audio' preload='auto' src='./media/" + obj.audio + "' autoplay type='audio/" + ext + "'></audio>").appendTo(".alertItem");
                }

                if (obj.video) {
                    let ext = obj.video.split('.').pop();
                    $("<video class='video' autoplay src='./media/" + obj.video + "'><source src='./media/" + obj.video + "' type='video/" + ext + "'></video>").appendTo(".alertItem");
                }

                if (obj.image) {
                    $("<img class='image' src='./media/" + obj.image + "'/>").appendTo(".alertItem");
                }

                if (obj.message) {
                    $("<p class='message'>" + obj.message + "</p>").appendTo(".alertItem");
                }

                $("#container .alertItem").fadeIn(500).delay(parseInt(obj.timelimit)).fadeOut(500, function () {
                    console.log('timelimit reached. removing alertItem');
                    $(this).remove();
                });
            }
        })
    }

    // Check for new messages every second
    setInterval(getMessage, 1000);

})