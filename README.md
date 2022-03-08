# Owncast chat bot overlay



## What is this?

This is an OBS browser source overlay that checks each chat message for chat commands like: !fart, !wow, !dance. You configure each chat command using the commands.json file. Supports playback of video files, audio clips, images...

Future developement can be tracked here: [https://github.com/teklynk/owncast_chat_bot/projects/1](https://github.com/teklynk/owncast_chat_bot/projects/1)

### ** Do not use this on a public server. This is meant to run locally (localhost) or on an internal server ([http://localhost/owncast_bot/bot.html](http://localhost/bot.html...))

### JSON files

- Rename **sample.comands.json** to **commands.json**
- Rename **sample.config.json** to **config.json**

**comands.json**. Add your own custom !action commands and other bot responses.

**config.json** Contains your OwnCast Access Token and OwnCast server domain url.

Generate an Access Token from your Owncast Admin page > Integrations > Access Token. 
Create Access Token. Choose the middle option "Can send chat messages on behalf of the owner of this token." 
The name of your accesstoken will also be used as the chat name. So, you may want to name it something like: "mybot" or "chatbot"

### Example comands.json file with variables
```json
[
    {
        "command": "!alert",
        "image": "",
        "audio": "",
        "video": "",
        "message": "",
        "say": "",
        "timelimit": "5000",
    	"cooldown": "90000"
    },
    {
        "command": "!hello",
        "image": "",
        "audio": "",
        "video": "",
        "message": "Hello {username}. Welcome in.",
        "say": "",
        "timelimit": "8000",
    	"cooldown": "90000"
    },
    {
        "command": "!fart",
        "image": "",
        "audio": "fart1.mp3",
        "video": "",
        "message": "{username} just farted!",
        "say": "ewww",
        "timelimit": "3000",
    	"cooldown": "90000"
    },
    {
        "command": "!dance",
        "image": "",
        "audio": "",
        "video": "safetydance.webm",
        "message": "DANCE!",
        "say": "",
        "timelimit": "60000",
    	"cooldown": "90000"
    },
    {
        "command": "!socials",
        "image": "",
        "audio": "",
        "video": "",
        "message": "",
        "say": "Here are my social media links: https://discord.com, https://mastodon.social",
        "timelimit": "3000",
    	"cooldown": "90000"
    }
]
```

- **"command":** Your alert command.
- **"image":** Show image in the overlay
- **"audio":** Plays an audio file
- **"video":** Plays a video file
- **"message":** Displays a message in the overlay. Can include {username}.
- **"say":** Says a message in chat. Can include {username}.
- **"timelimit":** (miliseconds) How long the alert runs
- **"cooldown":** (miliseconds) How long to wait before the alert can be used again.

### Media Support
Place all media (images, sounds, videos) inside the media folder/directory

- **Video** : webm, ogg, mp4
- **Audio** : mp3, ogg
- **Images** : gif, png, jpg

### Style Sheet

assets/css/alerts.css

### Install and Run

- Clone or download this repo.
- Setup a simple NGINX web server on your local machine.
- Use XAMPP, WampServer.
- If you have Python installed on your machine, you can run a simple http web server using python. `python3 -m http.server 8000 --bind 127.0.0.1` OR `python2 -m SimpleHTTPServer 8000`
