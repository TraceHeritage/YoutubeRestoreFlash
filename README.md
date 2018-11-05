# Youtube Flash Restorer

## About
This script aims to restore basic YouTube functionality to old versions of Firefox by replacing the default HTML5 YouTube player with the OSMF Strobe Media Playback player.  

The script has been specifically coded for **Firefox 9.0.1** running **Greasemonkey 0.9.22.1**.  Usability on newer browsers should be possible, but has not been tested.

## Prerequisites
*Adobe Flash Version 10.1 (or greater)

*Firefox 9.0.1

*Greasemonkey 0.9.22.1

# Installation
Copy [THIS](https://raw.githubusercontent.com/TraceHeritage/YoutubeRestoreFlash/master/YoutubeRestoreFlash.user.js) link into the Firefox address bar and click "Install" when prompted.

After completely loading a YouTube video page, the HTML5 player should be replaced with a flash player.  This may take a short while to load on first use.

## Limitations/Known Issues
*Not all videos may work.  Music videos are particularly troublesome.
*Some videos may not have a .mp4 source available.  A basic .webm player will be loaded instead.
*Fullscreen is not currently working.
*Videos are only available in one quality (medium).
