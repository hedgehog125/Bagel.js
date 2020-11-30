# Bagel.js
A bread based JavaScript game framework

![alt text](https://github.com/hedgehog125/Bagel.js/blob/veryVeryUnstable/assets/imgs/bagel.png "The Bagel.js Logo")

# Introduction
When I first started using Phaser, I found it kinda annoying how you often have to keep typing the same commands over and over again (particularly the command that creates a sprite). So I made JAMESCRIPT: a rather bodged framework that kind of acts as a layer between your code and Phaser. I built a game using it so I guess it works well enough.

I started to realise though that I wasn't using a lot of the features of Phaser and they were adding to its 800KB minified file size (which isn't ideal for the web if you can minimise it). I also found there was a limit of how far I could realistically fine tune it to be how I wanted it, especially since I found it doesn't really allow you to change the resolution the canvas is rendered at (it only allows you to upscale it as far as I know).

This lead to me making Beginning.js, not a perfect framework but still better than my previous attempt. Unfortunately, I quickly realised that the code had gotten out of hand and needed improving. It also lacked some important features like sprite-sheets and had a few design quirks (e.g a game's id was defined using the "ID" argument but a sprite used the "id" argument). I decided it would be best to make as many of the changes I wanted as possible in one update so updating stuff would be easier. And that's how Bagel.js came into existence.

# Key features
 * Easy to learn, with little boilerplate code
 * Being JSON based structures the code
 * Robust input checking (for most things) with helpful errors
 * Plugins (some core stuff also uses a plugin)
 * A PWA creation tool ([example](http://hedgehog125.github.io/Bagel-PWA/))
 * Scales the resolution for any device while keeping the aspect ratio

 * Named after my favourite type of bread (fun fact: I also used to have bagels at a coding club before they stopped selling them :(, probably inspired the name)
 (now can't go to said coding club because of the pandemic :/)

 # Getting started
 Check out the wiki [here](https://github.com/hedgehog125/Bagel.js/wiki).
