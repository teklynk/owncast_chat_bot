# Owncast chat bot overlay



## What is this?

This is an OBS browser source overlay that checks each chat message for chat commands like: !fart, !wow, !dance. You configure each chat command using the commands.json file. Supports playback of video files, audio clips, images...

### ** Do not use this on a public server. This is meant to run locally (localhost) or on an internal server ([http://localhost/bot.html...](http://localhost/bot.html...))

### JSON files

- Rename **sample.comands.json** to **commands.json**
- Rename **sample.config.json** to **config.json**

**comands.json**. Add your own custom !action commands and other bot responses.

**config.json** Contains your OwnCast Access Token and OwnCast server domain url.

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
    "timelimit": "5000"
  },
  {
    "command": "!test",
    "image": "teklynk_logo.png",
    "audio": "",
    "video": "",
    "message": "",
    "say": "",
    "timelimit": "8000"
  },
  {
    "command": "!fart",
    "image": "",
    "audio": "fart1.mp3",
    "video": "",
    "message": "",
    "say": "",
    "timelimit": "3000"
  },
  {
    "command": "!dance",
    "image": "",
    "audio": "",
    "video": "safetydance.webm",
    "message": "DANCE!",
    "say": "",
    "timelimit": "60000"
  }
]
```

- **"command":** Your alert command.
- **"image":** Show image in the overlay
- **"audio":** Plays an audio file
- **"video":** Plays a video file
- **"message":** Displays a message in the overlay
- **"say":** Says a message in chat (coming soon)
- **"timelimit":** (miliseconds) How long the alert runs

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
