/*
Bagel.js by hedgehog125, see https://github.com/hedgehog125/Bagel.js. License information can be found in license.txt
Button sounds from: https://scratch.mit.edu/projects/42854414/ under CC BY-SA 2.0
WebGL rendererer is somewhat based off https://github.com/quidmonkey/particle_test

TODO
Vertices have to be regenerated when texture coordinates change in the loading screen for some reason (currently being done). See lots of textures demo. Should just be able to update the texture coordinates.

Does alpha still work after increasing the size of a texture map?

The visual glitch happens because the wrong x coordinate is provided for some reason and not updated. Something to do with NaN?

The loading screen lag issue is fixed when the canvas is appended to the DOM. Something to do with it being desynchronized by default? The context option doesn't seem to make a difference

Batch texture map resolution increases but still update lines
Regenerate data for bitmap sprites that use a pending texture before it's ready
Also regenerate on texture map scale update
Updating textures
Auto downscaling textures and log which were downscaled
Single textures
Update renderer calls in internal plugin, add single texture option to canvases as an argument
Deactivate textures when count is 0
Change mode description for canvas sprites, add single texture and antialias arguments
Use auto renderer by default
Try using activateTextureMap to shrink them periodically, it'll only do it if it doesn't cut any textures off
Texture downscaling

Mention that functions as values for x, y, widths and heights were removed in the changelog
Error in spritesheet demo

== Testing ==
Should the loading screen use the full resolution? Need to commit to a set resolution otherwise. Dots are slightly off due to the resolution. Laggy in firefox

Using a separate program for rendering textures to the atlas might be faster since it reduces the complication. Only vertices and texture coordinates are needed compared to also having the alpha, texture id and tint.

Creating, deleting and modifying the same texture on the same frame multiple times. Also how it's handled the next frame when it's not just modifying what's already been queued

Are vertices scaled correctly when the drawing buffer size doesn't match the canvas dimensions?

Creating a texture, a bitmapSprite using it and deleting it on the same frame

Antialiased textures, both in canvas and WebGL renderers

Updating WebGL textures, changing settings that require recreating

== Bugs ==
The default loading screen results in a renderer error? Can't replicate for some reason

Prevent upscale aspect ratio from being different to the source unless an option is enabled.

Change WebGL rounding to match canvas <==========
Add bitmapSprite cropping and tinting to the webgl renderer

Texture space can be used by multiple textures if the resolution of the textures is changed enough. Requires multiple to change on the same frame?

Full stops are too low in bitmap text. Same with a lot of characters, they get cut off in the word wrap demo
Text is weird in the loading screen at different game dimensions. Maybe text in general? Probably due to setting widths and heights

Send to back can cause a crash in the update bitmap function. Maybe requires combination of it and bringToFront in another sprite?

request doesn't work in sprites without init scripts.

Pause videos on state change

Resume playing audio from the position it would be in rather than the start. Maybe play muted if no autoplay?

Audio is still apparently broken in Safari. Sounds can only play once? Safari tells Bagel.js the audio is playing even when it isn't. e.g onplay fires, the promise resolves and paused is false but currentTime is still 0 even after a delay

== Low priority bugs ==
Upscale unmute button when antialiasing is enabled

Sprites get pushed to left when shrinking window, test by putting a sprite with an x coordinate of the game width. Possibly out of my control? Happens when resising window and devtools

How is audio stored in PWAs? Is it only saved after it's played once?

Is storing the combined textures as images more efficient when they are deactivated?

webP is actually supported in desktop Safari Big Sur and later. (the browser version doesn't matter)

= Optimisations =
Use bitmap text in loading screen instead of images

Keep textures in single textures unless memory pressure, maybe animated textures should stay longer? Remove explainations on technical details about how the textures work as it's too complicated already.

Use texsubimage2d for updating the parts of textures that were updated. It's also faster even when the whole image needs to be updated. Might make single textures less necessary?

put in front of and behind layer operations. Should also work for groups like clones. Would make layer operations unnecessary a lot of the time. e.g spaceships in front of individual stars in joined together entry

= Features =
Text rotation? Negative widths and heights? Changing them should set font size? Would simplify the loading screen and error screen

Cropping for canvases
Tints for canvases and text. Maybe used instead of rerendering?

Renderer layers

Put ogg/webp support in console message
WebP support for PWA icons

Steps for clones

Bagel.add.asset and Bagel.add.sprite

Might be able to antialias some bitmapSprites but not others by using a different texture alias for both. Use gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); to disable antialiasing, otherwise don't run it to keep it

Allow reusing values in plugins from other plugins. Maybe can set all complicated arguments to ".<pluginID>.<...pathThroughPluginObject>" e.g ".Internal.plugin.types.sprites.sprite.listeners.fns.xy". Maybe should be a way to more easilly access functions in other plugins to use yourself.

Allow enabling antialiasing and switching renderers on the fly. Requires reinitialising the webgl context for both
game.renderTime, should these stats go in game.performance though?

Copy canvas mode and/or textures. These are prerendered using webgl or the canvas depending on renderer. Should there be built in parent textures like circles and round lines?

Auto skip mode

Include assets loaded in HTML on the current page when generating workers. Especially script tags

Drop texture contexts when they aren't being used for more than a few seconds

Alternative things to reduce boilerplate but possibly increase it for large projects. e.g src for sprite img argument (creates it as an asset), init and main functions which ignore state. (only 1, not an array). game.state should have a default.

Whole number scaling mode for games?

Remove initial delay logic and syntax

Asset preload, runs before init. Runs even when assets aren't being initialised. Sounds should preload their metadata and then wait until oncanplaythrough before they're considered loaded?

Reserve dot prefix for textures

touching.spriteSides and touching.gameSides sets last.collisionSide

Context lost handling

The ability to remove or replace a default argument for a sprite type. Maybe only for some? Prevent setting some attributes like "type"
Allow adding new methods to existing sprite types, also allow having extra processing in the plugin that modifies it. (init and main methods). Disable cloning by removing clones argument?

Built in FPS counter

FPS stabilisation. Use the time elapsed to calcuate how many times to run the main code before rendering. 30hz displays would run the main code twice and then render and 120hz would run the code once then render but only on every other frame. Should Bagel.js attempt to catch up if it lags? Should frames be able to be dropped?

Display render options in Bagel.js console message. Antialiasing and fps stabilisation?

Dynamic resolution? Non chromium browsers benefit from lower resolutions because of the lower resolution textures?

Gamepad support


= Tweaks =
Move currentFPS and maximumPossibleFPS to game.debug. Also add render percentage time, script time and render time

Tidy up canvas prerendering by using the prerender property of canvas sprites

Fix spelling errors

= Questions =
What should be read only? Should you be able to change game.width and game.height while the game is running?
*/


Bagel = {
    init: game => {
        let internal = Bagel.internal; // A shortcut
        let current = internal.current;
        let subFunctions = Bagel.internal.subFunctions.init;

        Bagel.internal.saveCurrent();
        current.game = game;
        game = subFunctions.check(game);
        let originalRenderer = game.config.display.renderer; // If it's auto, it will get changed in a bit to either webgl or canvas
        let previousGames = Object.keys(Bagel.internal.games).length;
        Bagel.internal.games[game.id] = game;

        subFunctions.misc(game);
        subFunctions.basicRendererInit(game);
        Bagel.internal.loadPlugin(Bagel.internal.plugin, game, {}); // Load the built in plugin

        subFunctions.listeners(game, game.internal.renderer.canvas, previousGames);
        subFunctions.bundledAssets(game);
        subFunctions.loadingScreen(game);

        if (! game.config.disableBagelJSMessage) { // Display a message that provides an overview of the how the game is running
            let hpText = "🥯🥯";
            let rendererText = "";
            if (game.config.display.renderer == "webgl") {
                hpText += "🥯";
                rendererText += "WebGL";
            }
            else {
                hpText += "🍞";
                rendererText += "Canvas";
            }
            if (originalRenderer == "auto") {
                rendererText += " (via auto mode)";
            }

            console.log(
                "| Bagel.js <version> | <hp> | <renderer> |\nhttps://github.com/hedgehog125/Bagel.js"
                .replace("<hp>", hpText)
                .replace("<renderer>", rendererText)
                .replace("<version>", Bagel.version)
            );
        }
        Bagel.internal.loadCurrent();
        return game;
    },
    internal: {
        plugin: { // The built-in plugin
            info: {
                id: "Internal",
                description: "The built-in plugin, adds an image based sprite type, a canvas and a text type. Also contains some useful methods.",
            },
            plugin: {
                types: {
                    assets: {
                        imgs: {
                            args: {
                                webP: {
                                    required: false,
                                    types: ["string"],
                                    description: "The src of the webP version of the image. Is only used if the browser supports it, otherwise the src is used."
                                },
                                upscale: {
                                    required: false,
                                    subcheck: {
                                        width: {
                                            required: true,
                                            types: ["number"],
                                            description: "The width you want to upscale the texture to."
                                        },
                                        height: {
                                            required: true,
                                            types: ["number"],
                                            description: "The height you want to upscale the texture to."
                                        },
                                        antialias: {
                                            required: true,
                                            types: ["boolean"],
                                            description: "If you want to use antialiasing when upscaling the texture. Don't use for pixel art."
                                        },
                                        quality: {
                                            required: false,
                                            default: "high",
                                            check: value => {
                                                if (! ["low", "medium", "high"].includes(value)) {
                                                    return "Huh, that's not a valid quality option. It has to be either \"low\", \"medium\" or \"high\".";
                                                }
                                            },
                                            types: ["string"],
                                            description: "The image smoothing quality to use if antialiasing is enabled. Either \"low\", \"medium\" or \"high\"."
                                        }
                                    },
                                    types: ["object"],
                                    description: "How the texture should be upscaled. It won't be by default. Enabling antialiasing may help smooth out low resolution textures on non-antialiased games but it's best to upscale pixel art with it disabled instead if a lot of antialiased textures are being used."
                                }
                            },
                            description: "Images give a sprite (only the sprite type though) its appearance. Just set its \"img\" argument to the id of the image you want to use.",
                            init: (asset, ready, game, plugin, index) => {
                                let img = new Image();
                                ((img, asset, game, ready) => {
                                    img.onload = _ => {
                                        if (asset.upscale) {
                                            let canvas = document.createElement("canvas");
                                            canvas.width = asset.upscale.width;
                                            canvas.height = asset.upscale.height;
                                            let ctx = canvas.getContext("2d");
                                            ctx.imageSmoothingEnabled = asset.upscale.antialias;
                                            ctx.imageSmoothingQuality = asset.upscale.quality;

                                            if (asset.upscale.antialias) { // Prevent the smoothing from clipping off the edge
                                                ctx.drawImage(img, 1, 1, canvas.width - 2, canvas.height - 2);
                                            }
                                            else {
                                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                            }
                                            img = canvas;
                                        }

                                        Bagel.internal.render.texture.new(asset.id, img, game);
                                        ready(img);
                                    };
                                })(img, asset, game, ready);
                                if (asset.webP && Bagel.device.is.webPSupported) {
                                    img.src = asset.webP;
                                }
                                else {
                                    img.src = asset.src;
                                }
                            },
                            hrefArgs: ["webP"],
                            get: "img"
                        },
                        snds: {
                            args: {
                                ogg: {
                                    required: false,
                                    types: ["string"],
                                    description: "The src of the ogg version of the sound. Is only used if the browser supports it, otherwise the src is used."
                                },
                                duration: {
                                    required: false,
                                    types: ["number"],
                                    description: "The length of the audio file. Specifying it allows the game to load more quickly as the sound will only be requested from the server when it's being played."
                                }
                            },
                            description: "Sounds can be played by anything. They're played using game.playSound(<id>)",
                            init: (asset, ready, game, plugin, index) => {
                                let snd = new Audio();
                                if (asset.duration == null) {
                                    ((snd, ready) => {
                                        snd.onloadedmetadata = _ => {
                                            ready(snd);
                                        };
                                    })(snd, ready);
                                    snd.preload = "metadata";
                                }
                                else {
                                    snd.preload = "none";
                                    (duration => {
                                        Object.defineProperty(snd, "duration", {
                                            value: duration,
                                            writable: false
                                        });
                                    })(asset.duration);
                                    ready(snd);
                                }
                                if (asset.ogg && Bagel.device.is.oggSupported) {
                                    snd.src = asset.ogg;
                                }
                                else {
                                    snd.src = asset.src;
                                }
                            },
                            hrefArgs: ["ogg"],
                            get: "snd",
                            forcePreload: true // Only the metadata is loaded anyway
                        },
                        spritesheets: {
                            args: {
                                frames: {
                                    required: true,
                                    check: value => {
                                        if (typeof value != "number") {
                                            return "Oops, this should be a number and you used " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                        }
                                    },
                                    checkEach: true,
                                    types: ["array"],
                                    description: "How many frames there are for each animation. Animation frames go along the x axis."
                                },
                                animations: {
                                    required: true,
                                    check: value => {
                                        if (typeof value != "string") {
                                            return "Oops, this should be a string and you used " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                        }
                                    },
                                    checkEach: true,
                                    types: ["array"],
                                    description: "The names of the different animations. Separate animations go down the y axis."
                                }
                            },
                            init: (asset, ready, game, plugin, index) => {
                                let img = new Image();
                                ((img, asset, game) => {
                                    img.onload = _ => {
                                        let maxWidth = 0;
                                        for (let i in asset.frames) {
                                            if (asset.frames[i] > maxWidth) {
                                                maxWidth = asset.frames[i];
                                            }
                                        }

                                        let warning = false;
                                        if (img.width % maxWidth != 0) {
                                            console.warn("The image width isn't divisible by the \"frames\" argument. You should probably check if both of them're correct.");
                                            warning = true;
                                        }
                                        if (img.height % asset.animations.length) {
                                            console.warn("The image height isn't divisible by the length of the \"animations\" argument. You should probably check if both of them're correct.");
                                            warning = true;
                                        }
                                        if (warning) {
                                            console.log("For the image asset " + JSON.stringify(asset.id) + ".");
                                        }

                                        let width = img.width / maxWidth;
                                        let height = img.height / asset.animations.length;
                                        let assets = game.internal.assets.assets;

                                        let y = 0;
                                        while (y < asset.animations.length) {
                                            let name = asset.animations[y];
                                            let x = 0;
                                            while (x < asset.frames[y]) {
                                                let id = asset.id + "." + name + "." + x;
                                                let canvas = document.createElement("canvas");
                                                canvas.width = width;
                                                canvas.height = height;
                                                let ctx = canvas.getContext("2d");
                                                ctx.drawImage(img, -(x * width), -(y * height));

                                                let textureFns = Bagel.internal.render.texture;
                                                if (textureFns.get(id, game)) {
                                                    console.error("Hmm, Bagel.js ran into a problem with the spritesheet " + JSON.stringify(asset.id) + ". The image id " + JSON.stringify(id) + " has already been taken. Double check the ids of your assets.");
                                                    Bagel.internal.oops(game);
                                                }
                                                else {
                                                    textureFns.new(id, canvas, game, false, "static");
                                                }
                                                x++;
                                            }
                                            y++;
                                        }
                                        ready(asset);
                                    };
                                })(img, asset, game);
                                img.src = asset.src;
                            },
                            description: "Contains many separate images. Useful for animations.",
                            get: "spritesheet"
                        },
                        fonts: {
                            args: {},
                            init: (assetJSON, set) => {
                                let request = fetch(assetJSON.src);
                                request.then(e => e.json().then(asset => {
                                    set(asset);
                                }));
                            },
                            set: (asset, assetJSON, ready, game, plugin) => {
                                if (Bagel.internal.getTypeOf(asset) != "object") {
                                    return "Oh no! This can only be an object but you tried to use " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ". Make sure that it's actually a Bagel.js font.";
                                }
                                let characterCount = asset.widths.length;
                                if (! plugin.vars.font.characterSets[characterCount]) {
                                    console.error("Huh, the font " + JSON.stringify(assetJSON.id) + " doesn't have a matching character set. It's got " + characterCount + ".");
                                    console.log("These are the character sets:");
                                    console.log(plugin.vars.font.characterSets);
                                    Bagel.internal.oops(game);
                                }

                                let widthTotal = 0;
                                let heightTotal = 0;
                                let starts = [];
                                let position = 0;
                                for (let i in asset.widths) {
                                    starts.push(position);
                                    widthTotal += asset.widths[i];
                                    heightTotal += asset.heights[i];
                                    position += asset.widths[i] * asset.heights[i];
                                }
                                asset.starts = starts;
                                asset.avgWidth = Math.ceil(widthTotal / asset.widths.length);
                                asset.avgHeight = Math.ceil(heightTotal / asset.widths.length);
                                asset.maxHeight = Math.max(...asset.heights);

                                ready(asset);
                            },
                            description: "For use with \"text\" sprites, generate fonts using Bagel.font.generate.",
                            get: "font"
                        }
                    },
                    sprites: {
                        sprite: {
                            args: {
                                x: {
                                    required: false,
                                    default: "centered",
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The x position for the sprite. Can also be set to \"centered\" to centre it along the x axis."
                                },
                                y: {
                                    required: false,
                                    default: "centered",
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The y position for the sprite. Can also be set to \"centered\" to centre it along the y axis."
                                },
                                left: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the left side of the sprite to be positioned along the x axis."
                                },
                                right: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the right side of the sprite to be positioned along the x axis."
                                },
                                top: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the top of the sprite to be positioned along the y axis."
                                },
                                bottom: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the bottom of the sprite to be positioned along the y axis."
                                },


                                img: {
                                    required: false,
                                    default: null,
                                    types: [
                                        "string",
                                        "undefined"
                                    ],
                                    description: "The image for the sprite to use to start with. If set to null or not specified, the sprite will be invisible."
                                },
                                width: {
                                    required: false,
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The width for the sprite. Defaults to the width of the image. You can also set it to a multiple of the image width by setting it to \"1x\", \"2x\", etc."
                                },
                                height: {
                                    required: false,
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The height for the sprite. Defaults to the height of the image. You can also set it to a multiple of the image height by setting it to \"1x\", \"2x\", etc."
                                },
                                scale: {
                                    required: false,
                                    default: 1,
                                    types: ["number"],
                                    description: "The scale of the sprite. If both the width and height are unspecified, the sprite width and height are set to the image width and height multiplied by the scale."
                                },
                                alpha: {
                                    required: false,
                                    default: 1,
                                    types: ["number"],
                                    description: "The alpha of the sprite. 1 is fully visible, 0.5 is partially and 0's invisible."
                                },
                                angle: {
                                    required: false,
                                    default: 90,
                                    types: [
                                        "number"
                                    ],
                                    description: "The angle of the sprite. In degrees. 0º = up. 180º = down. -90º = left. 90º = right (not rotated)."
                                },
                                crop: {
                                    required: false,
                                    default: {},
                                    subcheck: {
                                        x: {
                                            required: false,
                                            default: null,
                                            types: ["number"],
                                            description: "The x coordinate to start using the image data. Anything before it won't be used."
                                        },
                                        y: {
                                            required: false,
                                            default: null,
                                            types: ["number"],
                                            description: "The y coordinate to start using the image data. Anything before it won't be used."
                                        },
                                        width: {
                                            required: false,
                                            default: null,
                                            types: ["number"],
                                            description: "The number of horizontal pixels to use from the image. (from the x coordinate). Anything after isn't used."
                                        },
                                        height: {
                                            required: false,
                                            default: null,
                                            types: ["number"],
                                            description: "The number of vertical pixels to use from the image. (from the y coordinate). Anything after isn't used."
                                        }
                                    },
                                    types: ["object"],
                                    description: "How the sprite should be cropped."
                                },
                                tint: {
                                    required: false,
                                    types: ["string"],
                                    description: "The HTML colour to tint the sprite with. Defaults to none (#00000000). The alpha is the amount."
                                }
                            },
                            cloneArgs: {
                                x: {
                                    syntax: {
                                        description: "The x position for the clone. Can also be set to \"centered\" to centre it along the x axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width - 50\""
                                    },
                                    mode: "replace"
                                },
                                y: {
                                    syntax: {
                                        description: "The y position for the clone. Can also be set to \"centered\" to centre it along the y axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.height - 50\""
                                    },
                                    mode: "replace"
                                },
                                left: {
                                    mode: "replace"
                                },
                                right: {
                                    mode: "replace"
                                },
                                top: {
                                    mode: "replace"
                                },
                                bottom: {
                                    mode: "replace"
                                },

                                img: {
                                    syntax: {
                                        description: "The image for the clone to use to start with. If set to null or not specified anywhere, the clone will be invisible."
                                    },
                                    mode: "replace"
                                },
                                width: {
                                    syntax: {
                                        description: "The width for the clone. Defaults to the width of the image. You can also set it to a multiple of the image width by setting it to \"1x\", \"2x\", etc."
                                    },
                                    mode: "replace"
                                },
                                height: {
                                    syntax: {
                                        description: "The height for the clone. Defaults to the height of the image. You can also set it to a multiple of the image height by setting it to \"1x\", \"2x\", etc."
                                    },
                                    mode: "replace"
                                },
                                scale: {
                                    syntax: {
                                        description: "The scale of the clone. If both the width and height are unspecified, the sprite width and height are set to the image width and height multiplied by the scale."
                                    },
                                    mode: "replace"
                                },
                                alpha: {
                                    syntax: {
                                        description: "The alpha of the clone. 1 is fully visible, 0.5 is partially and 0's invisible."
                                    },
                                    mode: "replace"
                                },
                                angle: {
                                    syntax: {
                                        description: "The angle of the clone. In degrees. 0º = up. 180º = down. -90º = left. 90º = right."
                                    },
                                    mode: "replace"
                                },
                                crop: {
                                    mode: "replace"
                                },
                                tint: {
                                    mode: "replace"
                                }
                            },
                            listeners: {
                                fns: {
                                    xy: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                        if (typeof value == "number") {
                                            if (isNaN(value)) {
                                                return "Huh, looks like you've done something wrong in a calculation somewhere in your program. Sprite " + JSON.stringify(triggerSprite.id) + "'s " + property + " is NaN. This is usually caused by having a non number somewhere in a calcuation.";
                                            }
                                            else {
                                                plugin.vars.sprite.updateAnchors(triggerSprite, property == "x", property == "y");
                                                triggerSprite.internal.renderUpdate = true;
                                                return;
                                            }
                                        }
                                        if (typeof value == "string") {
                                            if (value == "centered") {
                                                if (initialTrigger) {
                                                    if (
                                                        (property == "x" && (sprite.hasOwnProperty("left") || sprite.hasOwnProperty("right")))
                                                        || (property == "y" && (sprite.hasOwnProperty("top") || sprite.hasOwnProperty("bottom")))
                                                    ) {
                                                        return;
                                                    }
                                                }

                                                sprite[property] = game[property == "x"? "width" : "height"] / 2;
                                                plugin.vars.sprite.updateAnchors(triggerSprite, property == "x", property == "y");
                                                triggerSprite.internal.renderUpdate = true;
                                                return;
                                            }
                                        }

                                        // It's invalid if it wasn't any of those valid values
                                        return "Oops, this can only be a number or the string \"centered\". In the sprite " + JSON.stringify(triggerSprite.id) + "." + property + ". You tried to set it to " + JSON.stringify(value) + ".";
                                    },
                                    dimensions: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                        if (! game.loaded) { // The game needs to have loaded first
                                            return ".rerun";
                                        }

                                        if (typeof value == "number") {
                                            if (isNaN(value)) {
                                                return "Huh, looks like you've done something wrong in a calculation somewhere in your program. Sprite " + JSON.stringify(triggerSprite.id) + "'s " + property + " is NaN. This is usually caused by having a non number somewhere in a calcuation.";
                                            }
                                            else {
                                                let img;
                                                if (sprite.img) {
                                                    img = Bagel.get.asset.img(sprite.img, triggerSprite.game, true);
                                                    if (! img) {
                                                        img = Bagel.internal.render.texture.get(sprite.img, triggerSprite.game);
                                                    }
                                                    if (img) {
                                                        if (typeof img == "boolean") return ".rerun";

                                                        // Update the scale
                                                        let scaleX = Math.abs(sprite.width) / img.width;
                                                        let scaleY = Math.abs(sprite.height) / img.height;
                                                        sprite.scale = (scaleX + scaleY) / 2; // Use the average of the two
                                                    }
                                                    else {
                                                        return "Huh, Bagel.js couldn't find an image asset or texture with the id " + JSON.stringify(sprite.img) + ". Make sure you added it in Game.game.assets.imgs or if you're making or using a plugin, that the texture is created before it's accessed.";
                                                    }
                                                }
                                                if (! initialTrigger) {
                                                    plugin.vars.sprite.updateAnchors(triggerSprite, property == "width", property == "height");
                                                    plugin.vars.sprite.resetCrop(triggerSprite, img? img : {
                                                        width: 1,
                                                        height: 1
                                                    });
                                                }
                                                triggerSprite.internal.renderUpdate = true;
                                                return;
                                            }
                                        }

                                        if (typeof value == "string") {
                                            if (value.includes("x")) {
                                                let scale = parseFloat(value.split("x")[0]);

                                                if (sprite.img == null) {
                                                    sprite[property] = 1;
                                                    if (! initialTrigger) {
                                                        plugin.vars.sprite.updateAnchors(triggerSprite, property == "width", property == "height");
                                                        plugin.vars.sprite.resetCrop(triggerSprite, {
                                                            width: 1,
                                                            height: 1
                                                        });
                                                    }
                                                    return;
                                                }
                                                let img = Bagel.get.asset.img(sprite.img, triggerSprite.game, true);
                                                if (! img) {
                                                    img = Bagel.internal.render.texture.get(sprite.img, triggerSprite.game);
                                                }
                                                if (! img) {
                                                    return ":/ Bagel.js couldn't find an image asset or texture with the id " + JSON.stringify(sprite.img) + ". Make sure you added it in Game.game.assets.imgs or if you're making or using a plugin, that the texture is created before it's accessed.";
                                                }

                                                if (typeof img == "boolean") return ".rerun";
                                                sprite[property] = img[property] * scale;

                                                if (sprite.width && sprite.height) { // Make sure there isn't a missing dimention otherwise can't update scale
                                                    // Update the scale
                                                    let scaleX = sprite.width / img.width;
                                                    let scaleY = sprite.height / img.height;
                                                    sprite.scale = (scaleX + scaleY) / 2; // Use the average of the two
                                                }
                                                if (! initialTrigger) {
                                                    plugin.vars.sprite.updateAnchors(triggerSprite, property == "width", property == "height");
                                                    plugin.vars.sprite.resetCrop(triggerSprite, img);
                                                }
                                                triggerSprite.internal.renderUpdate = true;
                                                return;
                                            }
                                        }
                                        if (value == null) {
                                            if (sprite.scale) {
                                                if (sprite.img == null) {
                                                    sprite[property] = 1;
                                                    if (! initialTrigger) {
                                                        plugin.vars.sprite.updateAnchors(triggerSprite, property == "width", property == "height");
                                                        plugin.vars.sprite.resetCrop(triggerSprite, {
                                                            width: 1,
                                                            height: 1
                                                        });
                                                    }
                                                    return;
                                                }
                                                let img = Bagel.get.asset.img(sprite.img, triggerSprite.game, true);
                                                if (! img) {
                                                    img = Bagel.internal.render.texture.get(sprite.img, triggerSprite.game);
                                                }
                                                if (! img) {
                                                    return "Oh no! Bagel.js couldn't find an image asset or texture with the id " + JSON.stringify(sprite.img) + ". Make sure you added it in Game.game.assets.imgs or if you're making or using a plugin, that the texture is created before it's accessed.";
                                                }

                                                if (typeof img == "boolean") return ".rerun";
                                                sprite[property] = img[property] * sprite.scale;

                                                if (! initialTrigger) {
                                                    plugin.vars.sprite.updateAnchors(triggerSprite, property == "width", property == "height");
                                                    plugin.vars.sprite.resetCrop(triggerSprite, img);
                                                }
                                                triggerSprite.internal.renderUpdate = true;
                                                return;
                                            }
                                        }

                                        return "Hmm. This can only be a multiple of its image " + property + " (e.g 1x, 2x, 0.3x etc.) or a number. In the sprite " + JSON.stringify(triggerSprite.id) + "." + property + ". You tried to set it to " + JSON.stringify(value) + ".\nIf you tried to set the other width/height attribute, you'll need to define this one as well.";
                                    }
                                },
                                property: {
                                    x: {
                                        set: "xy"
                                    },
                                    y: {
                                        set: "xy"
                                    },

                                    img: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            triggerSprite.internal.imgWaiting = true;
                                            if (value) {
                                                let img = Bagel.get.asset.img(value, game, true);
                                                if (typeof img == "boolean") {
                                                    if (img) { // Loading
                                                        return ".rerun";
                                                    }
                                                    else { // No asset
                                                        img = Bagel.internal.render.texture.get(value, game);
                                                        if (! img) {
                                                            if (game.loaded) {
                                                                return "Oh no! Bagel.js couldn't find an image asset or a texture with the id " + JSON.stringify(value) + ". Make sure you added it in Game.game.assets.imgs or if you're making or using a plugin, that the texture is created before it's accessed.";
                                                            }
                                                            else {
                                                                return ".rerun"; // It might exist when the game has loaded
                                                            }
                                                        }
                                                    }
                                                }

                                                if (! initialTrigger) {
                                                    let scale = sprite.scale;
                                                    triggerSprite.width = img.width * scale;
                                                    triggerSprite.height = img.height * scale;
                                                }
                                                triggerSprite.internal.imgWaiting = false;
                                            }
                                            triggerSprite.internal.renderUpdate = true;
                                        }
                                    },
                                    width: {
                                        set: "dimensions"
                                    },
                                    height: {
                                        set: "dimensions"
                                    },

                                    left: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.x != "centered") { // Only takes priority when the x is the default value
                                                    return;
                                                }
                                                if (sprite.width == null) {
                                                    triggerSprite.x = value;
                                                    return ".rerun";
                                                }
                                            }
                                            triggerSprite.x = value + (sprite.width / 2);
                                        }
                                    },
                                    right: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.x != "centered") { // Only takes priority when the x is the default value
                                                    return;
                                                }
                                                if (sprite.width == null) {
                                                    triggerSprite.x = value;
                                                    return ".rerun";
                                                }
                                            }
                                            triggerSprite.x = value - (sprite.width / 2);
                                        }
                                    },
                                    top: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.y != "centered") { // Only takes priority when the y is the default value
                                                    return;
                                                }
                                                if (sprite.height == null) {
                                                    triggerSprite.y = value;
                                                    return ".rerun";
                                                }
                                            }
                                            triggerSprite.y = value + (sprite.height / 2);
                                        }
                                    },
                                    bottom: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.y != "centered") { // Only takes priority when the y is the default value
                                                    return;
                                                }
                                                if (sprite.height == null) {
                                                    triggerSprite.y = value;
                                                    return ".rerun";
                                                }
                                            }
                                            triggerSprite.y = value - (sprite.height / 2);
                                        }
                                    },

                                    scale: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.width != null || sprite.height != null) {
                                                    return; // Ignore scale
                                                }
                                            }
                                            if (! game.loaded) return ".rerun";


                                            if (typeof value == "number") {
                                                if (sprite.img) {
                                                    let img = Bagel.get.asset.img(sprite.img, game, true);
                                                    if (! img) {
                                                        img = Bagel.internal.render.texture.get(sprite.img, game);
                                                    }
                                                    if (! img) {
                                                        return "Hmm, Bagel.js couldn't find an image asset or texture with the id " + JSON.stringify(sprite.img) + " (Sprite.img must be set in order to change the sprite scale). Make sure you added it in Game.game.assets.imgs or if you're making or using a plugin, that the texture is created before it's accessed.";
                                                    }
                                                    if (typeof img == "boolean") return ".rerun";

                                                    // Update the scale
                                                    sprite.width = img.width * value;
                                                    sprite.height = img.height * value;
                                                }
                                                else {
                                                    sprite.width = 1;
                                                    sprite.height = 1;
                                                }
                                            }
                                            else {
                                                return "Erm, this can only be a number. In the sprite " + JSON.stringify(triggerSprite.id) + ".scale. You tried to set it to " + JSON.stringify(value) + ".";
                                            }
                                            if (! initialTrigger) {
                                                triggerSprite.internal.renderUpdate = true;
                                            }
                                        }
                                    },
                                    alpha: {
                                        set: (sprite, value, property, game, plugin, triggerSprite) => {
                                            if (value > 1) {
                                                sprite.alpha = 1;
                                            }
                                            else if (value < 0) {
                                                sprite.alpha = 0;
                                            }
                                            triggerSprite.internal.renderUpdate = true;
                                        }
                                    },
                                    angle: {
                                        set: (sprite, value, property, game, plugin, triggerSprite) => {
                                            let cache = triggerSprite.internal.cache;
                                            // Update the cached stuff
                                            let rad = Bagel.maths.degToRad(sprite.angle);
                                            cache.sin = Math.sin(rad);
                                            cache.cos = Math.cos(rad);

                                            sprite.angle = Bagel.maths.capAngle(sprite.angle); // Make sure it's in range

                                            triggerSprite.internal.renderUpdate = true;
                                        }
                                    },

                                    crop: {
                                        set: (crop, value, property, game, plugin, sprite, triggerSprite, step, initialTrigger, original) => {
                                            let valid, img;
                                            if (sprite.img) {
                                                img = Bagel.get.asset.img(sprite.img, triggerSprite.game, true);
                                                if (! img) {
                                                    img = Bagel.internal.render.texture.get(sprite.img, triggerSprite.game);
                                                }
                                            }

                                            if (initialTrigger && value == null) {
                                                if (property == "x" || property == "y") {
                                                    crop[property] = 0;
                                                }
                                                else {
                                                    if (! game.loaded) { // The game needs to have loaded first
                                                        return ".rerun";
                                                    }

                                                    if (img) {
                                                        if (typeof img == "boolean") return ".rerun";

                                                        crop[property] = img[property] - crop[property == "width"? "x" : "y"];
                                                    }
                                                    else {
                                                        crop[property] = 1;
                                                    }
                                                }
                                                valid = true;
                                            }

                                            if (! valid) {
                                                if (typeof value == "number") {
                                                    if (isNaN(value)) {
                                                        return "Huh, something must have gone wrong in a calculation. You tried to set this to NaN.";
                                                    }
                                                    else {
                                                        if (value < 0) {
                                                            return "Hmm, this has to be at least 0.";
                                                        }
                                                        triggerSprite.internal.renderUpdate = true;
                                                        valid = true;
                                                    }
                                                }
                                            }

                                            if (valid) {
                                                if (! img) {
                                                    img = {
                                                        width: 1,
                                                        height: 1
                                                    };
                                                }

                                                if ((property == "x" || property == "y") && original != null) {
                                                    crop[property == "x"? "width" : "height"] += original - value;
                                                }

                                                if (crop.width + crop.x > img.width) crop.width = img.width - crop.x;
                                                if (crop.height + crop.y > img.height) crop.height = img.height - crop.y;
                                                triggerSprite.internal.crop = ! (crop.x == 0 && crop.y == 0 && crop.width == img.width && crop.height == crop.height);
                                                return;
                                            }
                                            return "Oh no! This has to be a number and you tried to use " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                        },
                                        subListen: true
                                    },
                                    tint: {
                                        set: (sprite, value, property, game, plugin, triggerSprite) => {
                                            triggerSprite.internal.renderUpdate = true;
                                            triggerSprite.internal.tint = ! (value == null || value == "#00000000" || value == "rbga(0, 0, 0, 0)");
                                        }
                                    }
                                },
                                trigger: true
                            },
                            description: "A basic type of sprite. Has the appearance of the image specified.",
                            check: (sprite, game, check, index, where) => {

                            },
                            init: (sprite, game, plugin) => {
                                sprite.last = {
                                    collision: null
                                };
                                sprite.internal.cache = {};
                                sprite.internal.imgWaiting = true;

                                let properties = sprite.internal.Bagel.properties;
                                let specified = (properties.width != null) + (properties.height != null);
                                if (specified == 1) {
                                    console.error("Oh no! You only specified one of the dimensions for this sprite. You need to specifiy both unless you set the \"scale\" attribute instead.");
                                    Bagel.internal.oops(game);
                                }
                                else if (specified == 2) {
                                    let img = game.get.asset.img(properties.img, true) || Bagel.internal.render.texture.get(properties.img, game);
                                    if (typeof img == "object") {
                                        properties.scale = ((properties.width / img.width) + (properties.height / img.width)) / 2;
                                    }
                                }
                            },
                            render: {
                                onVisible: (sprite, newBitmap) => {
                                    sprite.internal.renderUpdate = false;
                                    let internal = sprite.internal;
                                    if (! internal.imgWaiting) {
                                        let properties = sprite.internal.Bagel.properties;

                                        return newBitmap({
                                            x: properties.x,
                                            y: properties.y,
                                            width: properties.width,
                                            height: properties.height,
                                            image: properties.img,
                                            rotation: properties.angle,
                                            alpha: properties.alpha,
                                            crop: internal.crop? properties.crop : null,
                                            tint: internal.tint? properties.tint : null
                                        }, sprite.game, false);
                                    }
                                },
                                onInvisible: (sprite, deleteBitmap) => deleteBitmap(sprite.internal.Bagel.renderID, sprite.game),
                                whileVisible: (sprite, updateBitmap, newBitmap, deleteBitmap) => {
                                    let internal = sprite.internal;
                                    if (internal.renderUpdate) {
                                        internal.renderUpdate = false;
                                        if (internal.imgWaiting) {
                                            return deleteBitmap(internal.Bagel.renderID, sprite.game);
                                        }
                                        else {
                                            let properties = internal.Bagel.properties;
                                            return updateBitmap(internal.Bagel.renderID, {
                                                x: properties.x,
                                                y: properties.y,
                                                width: properties.width,
                                                height: properties.height,
                                                image: properties.img,
                                                rotation: properties.angle,
                                                alpha: properties.alpha,
                                                crop: internal.crop? properties.crop : null,
                                                tint: internal.tint? properties.tint : null
                                            }, sprite.game, false);
                                        }
                                    }
                                }
                            }
                        },
                        canvas: {
                            args: {
                                x: {
                                    required: false,
                                    default: "centered",
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The x position for the canvas. Can also be set to \"centered\" to centre it along the x axis."
                                },
                                y: {
                                    required: false,
                                    default: "centered",
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The y position for the canvas. Can also be set to \"centered\" to centre it along the y axis."
                                },
                                left: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the left side of the canvas sprite to be positioned along the x axis."
                                },
                                right: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the right side of the canvas sprite to be positioned along the x axis."
                                },
                                top: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the top of the canvas sprite to be positioned along the y axis."
                                },
                                bottom: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the bottom of the canvas sprite to be positioned along the y axis."
                                },

                                width: {
                                    required: true,
                                    types: [
                                        "number",
                                        "function"
                                    ],
                                    description: "The width for the canvas."
                                },
                                height: {
                                    required: true,
                                    types: [
                                        "number",
                                        "function"
                                    ],
                                    description: "The height for the canvas."
                                },
                                angle: {
                                    required: false,
                                    default: 90,
                                    types: ["number"],
                                    description: "The angle of the canvas. In degrees. 0º = up. 180º = down. -90º = left. 90º = right (not rotated)."
                                },
                                alpha: {
                                    required: false,
                                    default: 1,
                                    types: ["number"],
                                    description: "The alpha of the canvas. 1 is fully visible, 0.5 is partially and 0's invisible."
                                },
                                fullRes: {
                                    required: false,
                                    default: false,
                                    types: ["boolean"],
                                    description: "If true, the canvas width and height will be automatically changed to ensure it's rendered at the full resolution."
                                },
                                updateRes: {
                                    required: false,
                                    default: true,
                                    types: ["boolean"],
                                    description: "If the canvas width and height should be changed after the sprite is made. Disabling this is useful for prerendering things onto this canvas as the canvas is cleared when the resolution is changed. Overwrites fullRes except when the canvas is first created."
                                },
                                render: {
                                    required: false,
                                    types: ["function"],
                                    description: "Renders each frame for the canvas. The arguments provided are: \"sprite\", \"game\", \"ctx\", \"canvas\", \"scaleX\" and \"scaleY\"."
                                },
                                prerender: {
                                    required: false,
                                    types: ["function"],
                                    description: "Prerenders the canvas. Called when the canvas sprite is first made and when the resolution is updated. The arguments provided are: \"sprite\", \"game\", \"ctx\", \"canvas\", \"scaleX\" and \"scaleY\"."
                                },
                                mode: {
                                    required: false,
                                    default: "auto",
                                    check: value => {
                                        if (! ["auto", "static", "animated"].includes(value)) {
                                            return "Huh, that's not a valid value. It has to be \"auto\", \"static\" or \"animated\". You tried to use " + JSON.stringify(value) + ".";
                                        }
                                    },
                                    types: ["string"],
                                    description: "Tells Bagel.js how to optimise for this canvas. It's not important in the canvas renderer but in the WebGL renderer, the value determines how the texture is handled internally.\n\"auto\" will detect when you render to the canvas and update the texture after. This adds a slight overhead.\n\"static\" will assume the canvas won't be updated frequently but you can still update it by returning true from the function you set for your \"render\" argument.\nLastly \"animated\" will assume the canvas will be updated every frame, you can return true if you haven't though.\n\nFor all of these modes, Bagel.js can optimise differently depending on how you use it on a second by second basis. A the texture of even a static canvas can become a more memory intensive but faster to update single texture if it's updated on 3 consecutive frames (auto and animated become a single texture after 1). If any canvas isn't updated at all for a whole second, it'll become part of a combined texture to reduce memory usage. \"auto\" will also use a single texture if less than 80% of the total textures supported by the GPU are being used. Both \"auto\" and \"static\" canvases will be moved to a combined texture once updated if 90% of textures are being used or will be moved before an update if 100% of textures are full and a new WebGL texture is required.\nIn most circumstances, the \"mode\" argument only specifies the start point and in the case of \"auto\", how the renders will be detected."
                                }
                            },
                            cloneArgs: {
                                x: {
                                    syntax: {
                                        description: "The x position for the clone. Can also be set to \"centered\" to centre it along the x axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width - 50\""
                                    },
                                    mode: "replace"
                                },
                                y: {
                                    syntax: {
                                        description: "The y position for the clone. Can also be set to \"centered\" to centre it along the x axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.height - 50\""
                                    },
                                    mode: "replace"
                                },
                                left: {
                                    mode: "replace"
                                },
                                right: {
                                    mode: "replace"
                                },
                                top: {
                                    mode: "replace"
                                },
                                bottom: {
                                    mode: "replace"
                                },

                                width: {
                                    syntax: {
                                        description: "The width for the clone. Can also be a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width * 0.2\""
                                    },
                                    mode: "replace"
                                },
                                height: {
                                    syntax: {
                                        description: "The height for the clone. Can also be a function that returns a position when the game loads. e.g:\n\"(me, game) => game.height * 0.2\""
                                    },
                                    mode: "replace"
                                },
                                angle: {
                                    syntax: {
                                        description: "The angle of the clone. In degrees. 0º = up. 180º = down. -90º = left. 90º = right (not rotated)."
                                    },
                                    mode: "replace"
                                },
                                alpha: {
                                    syntax: {
                                        description: "The alpha of the clone. 1 is fully visible, 0.5 is partially and 0's invisible."
                                    },
                                    mode: "replace"
                                },
                                fullRes: {
                                    mode: "replace"
                                },
                                updateRes: {
                                    mode: "replace"
                                },
                                render: {
                                    syntax: {
                                        description: "Renders each frame for the clone. The arguments provided are: \"sprite\", \"game\", \"ctx\" and \"canvas\"."
                                    },
                                    mode: "replace"
                                },
                                prerender: {
                                    syntax: {
                                        description: "Prerenders the canvas. Called when the clone is first made and when the resolution is updated. The arguments provided are: \"sprite\", \"game\", \"ctx\", \"canvas\", \"scaleX\" and \"scaleY\"."
                                    },
                                    mode: "replace"
                                },
                                mode: {
                                    mode: "replace"
                                }
                            },
                            listeners: {
                                fns: {
                                    xy: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                        if (typeof value == "number") {
                                            if (isNaN(value)) {
                                                return "Huh, looks like you've done something wrong in a calculation somewhere in your program. Sprite " + JSON.stringify(triggerSprite.id) + "'s " + property + " is NaN. This is usually caused by having a non number somewhere in a calcuation.";
                                            }
                                            else {
                                                plugin.vars.sprite.updateAnchors(triggerSprite, property == "x", property != "x");
                                                triggerSprite.internal.renderUpdate = true;
                                                return;
                                            }
                                        }
                                        if (typeof value == "string") {
                                            if (value == "centered") {
                                                if (initialTrigger) {
                                                    if (
                                                        (property == "x" && (sprite.hasOwnProperty("left") || sprite.hasOwnProperty("right")))
                                                        || (property == "y" && (sprite.hasOwnProperty("top") || sprite.hasOwnProperty("bottom")))
                                                    ) {
                                                        return;
                                                    }
                                                }

                                                sprite[property] = game[property == "x"? "width" : "height"] / 2;
                                                plugin.vars.sprite.updateAnchors(triggerSprite, property == "x", property != "x");
                                                triggerSprite.internal.renderUpdate = true;
                                                return;
                                            }
                                        }

                                        // It's invalid if it wasn't any of those valid values
                                        console.error("Oops, this can only be a number or the string \"centered\". In the sprite " + JSON.stringify(triggerSprite.id) + "." + property + ". You tried to set it to " + JSON.stringify(value) + ".");
                                        Bagel.internal.oops(game);
                                    },
                                    dimensions: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                        let valid = false;
                                        if (typeof value == "number") {
                                            plugin.vars.sprite.updateAnchors(triggerSprite, property == "width", property != "width");
                                            triggerSprite.internal.renderUpdate = true;
                                            valid = true;
                                        }

                                        if (triggerSprite.updateRes) { // If the canvas resolution should be modified by Bagel.js
                                            let scaleX = triggerSprite.game.internal.renderer.scaleX;
                                            let scaleY = triggerSprite.game.internal.renderer.scaleY;

                                            let width;
                                            let height;
                                            if (triggerSprite.fullRes) {
                                                width = sprite.width * scaleX * window.devicePixelRatio;
                                                height = sprite.height * scaleY * window.devicePixelRatio;
                                            }
                                            else {
                                                width = sprite.width;
                                                height = sprite.height;
                                            }
                                            let last = triggerSprite.internal.last;
                                            if (last.width != width || last.height != height) {
                                                triggerSprite.canvas.width = width;
                                                triggerSprite.canvas.height = height;
                                                last.width = width;
                                                last.height = height;

                                                triggerSprite.scaleX = triggerSprite.canvas.width / sprite.width;
                                                triggerSprite.scaleY = triggerSprite.canvas.height / sprite.height;
                                            }
                                        }

                                        if (! valid) {
                                            console.error("Oops, this can only be a number. In the sprite " + JSON.stringify(triggerSprite.id) + "." + property + ". You tried to set it to " + JSON.stringify(value) + ".");
                                            Bagel.internal.oops(game);
                                        }
                                    }
                                },
                                property: {
                                    x: {
                                        set: "xy"
                                    },
                                    y: {
                                        set: "xy"
                                    },

                                    left: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.x != "centered") { // Only takes priority when the x is the default value
                                                    return;
                                                }
                                            }
                                            triggerSprite.x = value + (sprite.width / 2);
                                        }
                                    },
                                    right: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.x != "centered") { // Only takes priority when the x is the default value
                                                    return;
                                                }
                                            }
                                            triggerSprite.x = value - (sprite.width / 2);
                                        }
                                    },
                                    top: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.y != "centered") { // Only takes priority when the y is the default value
                                                    return;
                                                }
                                            }
                                            triggerSprite.y = value + (sprite.height / 2);
                                        }
                                    },
                                    bottom: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.y != "centered") { // Only takes priority when the y is the default value
                                                    return;
                                                }
                                            }
                                            triggerSprite.y = value - (sprite.height / 2);
                                        }
                                    },

                                    width: {
                                        set: "dimensions"
                                    },
                                    height: {
                                        set: "dimensions"
                                    },
                                    alpha: {
                                        set: (sprite, value, property, game, plugin, triggerSprite) => {
                                            if (value > 1) {
                                                sprite.alpha = 1;
                                            }
                                            else if (value < 0) {
                                                sprite.alpha = 0;
                                            }
                                            triggerSprite.internal.renderUpdate = true;
                                        }
                                    },
                                    angle: {
                                        set: (sprite, value, property, game, plugin, triggerSprite) => {
                                            let cache = triggerSprite.internal.cache;
                                            // Update the cached stuff
                                            let rad = Bagel.maths.degToRad(sprite.angle);
                                            cache.sin = Math.sin(rad);
                                            cache.cos = Math.cos(rad);

                                            sprite.angle = Bagel.maths.capAngle(sprite.angle); // Make sure it's in range

                                            triggerSprite.internal.renderUpdate = true;
                                        }
                                    }
                                },
                                events: {
                                    delete: sprite => {
                                        if (sprite.internal.canvasID) {
                                            Bagel.internal.render.texture.delete(sprite.internal.canvasID, sprite.game);
                                        }
                                    }
                                },
                                trigger: true
                            },
                            description: "A \"2d\" canvas sprite. Anything rendered onto the canvas gets rendered onto the main canvas. (but will usually be scaled down depending on the width and height of the canvas)",
                            init: (sprite, game, plugin) => {
                                let canvas = document.createElement("canvas");
                                let ctx = canvas.getContext("2d", {
                                    desynchronized: false
                                });
                                if (sprite.mode == "auto") { // Create the listener methods
                                    ((sprite, canvas, ctx) => {
                                        let fns = {
                                            clearRect: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internalclearRect(...args);
                                            },
                                            drawFocusIfNeeded: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internaldrawFocusIfNeeded(...args);
                                            },
                                            drawImage: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internaldrawImage(...args);
                                            },
                                            fill: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internalfill(...args);
                                            },
                                            fillRect: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internalfillRect(...args);
                                            },
                                            fillText: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internalfillText(...args);
                                            },
                                            putImageData: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internalputImageData(...args);
                                            },
                                            rect: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internalrect(...args);
                                            },
                                            stroke: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internalstroke(...args);
                                            },
                                            strokeRect: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internalstrokeRect(...args);
                                            },
                                            strokeText: (...args) => {
                                                sprite.internal.canvasUpdated = true;
                                                ctx.internalstrokeText(...args);
                                            }
                                        };
                                        for (let i in fns) {
                                            ctx["internal" + i] = ctx[i];
                                            ctx[i] = fns[i];
                                        }
                                    })(sprite, canvas, ctx);
                                }

                                sprite.canvas = canvas;
                                canvas.width = sprite.width;
                                canvas.height = sprite.height;
                                if (sprite.fullRes) {
                                    canvas.width *= game.internal.renderer.scaleX;
                                    canvas.height *= game.internal.renderer.scaleY;
                                }
                                sprite.ctx = ctx;

                                let internal = sprite.internal;
                                internal.canvasID = ".Internal.canvas." + sprite.id;
                                internal.canvasUpdated = false;
                                internal.last = {};
                                internal.prerendered = false;
                                internal.cache = {};
                                sprite.last = {
                                    collision: null
                                };

                                sprite.internal.prerenderBase = sprite.prerender;
                                (sprite => {
                                    Object.defineProperty(sprite, "prerender", {
                                        set: value => {
                                            sprite.internal.prerenderBase = value;
                                            if (typeof value == "function") {
                                                sprite.internal.prerender = _ => {
                                                    Bagel.internal.saveCurrent();
                                                    let current = Bagel.internal.current;
                                                    current.game = sprite.game;
                                                    current.plugin = null;
                                                    current.sprite = sprite;

                                                    sprite.internal.prerenderBase(sprite, sprite.game, sprite.ctx, sprite.canvas, sprite.scaleX, sprite.scaleY);
                                                    sprite.updated = true;
                                                    sprite.internal.prerendered = true;
                                                    Bagel.internal.loadCurrent();
                                                }
                                            }
                                        },
                                        get: _ => sprite.internal.prerender
                                    });
                                })(sprite);
                                sprite.prerender = sprite.internal.prerenderBase;

                                sprite.scaleX = sprite.canvas.width / sprite.width;
                                sprite.scaleY = sprite.canvas.height / sprite.height;
                                sprite.updated = false;
                                plugin.vars.sprite.updateAnchors(sprite, true, true);
                            },
                            render: {
                                init: (sprite, newBitmap) => {
                                    let canvas = sprite.canvas;

                                    let width;
                                    let height;
                                    if (sprite.fullRes) {
                                        width = sprite.width * sprite.game.internal.renderer.scaleX;
                                        height = sprite.height * sprite.game.internal.renderer.scaleY;
                                    }
                                    else {
                                        width = sprite.width;
                                        height = sprite.height;
                                    }
                                    width = Math.max(Math.round(width), 1);
                                    height = Math.max(Math.round(height), 1);

                                    canvas.width = width;
                                    canvas.height = height;
                                    sprite.internal.last.width = width;
                                    sprite.internal.last.height = height;
                                    sprite.scaleX = canvas.width / sprite.width;
                                    sprite.scaleY = canvas.height / sprite.height;

                                    Bagel.internal.render.texture.new(sprite.internal.canvasID, canvas, sprite.game);
                                    sprite.internal.renderUpdate = false;
                                },
                                onVisible: (sprite, newBitmap) => {
                                    let internal = sprite.internal;
                                    internal.renderUpdate = false;
                                    if (! internal.prerendered) {
                                        if (internal.prerenderBase) {
                                            sprite.prerender();
                                        }
                                    }
                                    return newBitmap({
                                        x: sprite.x,
                                        y: sprite.y,
                                        width: sprite.width,
                                        height: sprite.height,
                                        image: internal.canvasID,
                                        rotation: sprite.angle,
                                        alpha: sprite.alpha
                                    }, sprite.game, false);
                                },
                                onInvisible: (sprite, deleteBitmap) => deleteBitmap(sprite.internal.Bagel.renderID, sprite.game),
                                whileVisible: (sprite, updateBitmap, newBitmap, deleteBitmap, game, plugin) => {
                                    let internal = sprite.internal;
                                    let properties = internal.Bagel.properties;
                                    let current = Bagel.internal.current;

                                    if (sprite.updateRes) { // If the canvas resolution should be modified by Bagel.js
                                        let width;
                                        let height;
                                        if (sprite.fullRes) {
                                            width = sprite.width * game.internal.renderer.scaleX;
                                            height = sprite.height * game.internal.renderer.scaleY;
                                        }
                                        else {
                                            width = sprite.width;
                                            height = sprite.height;
                                        }
                                        width = Math.max(width, 1); // Must be at least a pixel wide
                                        height = Math.max(height, 1); // Must be at least a pixel wide

                                        let last = internal.last;
                                        if (last.width != width || last.height != height) {
                                            sprite.canvas.width = width;
                                            sprite.canvas.height = height;
                                            last.width = width;
                                            last.height = height;

                                            sprite.scaleX = sprite.canvas.width / sprite.width;
                                            sprite.scaleY = sprite.canvas.height / sprite.height;
                                            if (internal.prerenderBase) {
                                                sprite.prerender();
                                            }
                                        }
                                    }

                                    if (! internal.prerendered) {
                                        if (internal.prerenderBase) {
                                            sprite.prerender();
                                            if (! properties.visible) return;
                                        }
                                    }

                                    let output;
                                    if (sprite.render) {
                                        Bagel.internal.saveCurrent();
                                        current.plugin = null;
                                        current.sprite = sprite;

                                        output = sprite.render(sprite, game, sprite.ctx, sprite.canvas, sprite.scaleX, sprite.scaleY);

                                        Bagel.internal.loadCurrent();
                                        if (! properties.visible) return;
                                    }


                                    if (sprite.updated || internal.canvasUpdated || (sprite.mode == "animated" && output !== true) || (sprite.mode != "animated" && output === true)) {
                                        Bagel.internal.render.texture.update(internal.canvasID, sprite.canvas, game);
                                        internal.canvasUpdated = false;
                                        sprite.updated = false;
                                        plugin.vars.sprite.updateAnchors(sprite, true, true);
                                    }
                                    if (internal.renderUpdate) {
                                        internal.renderUpdate = false;
                                        updateBitmap(internal.Bagel.renderID, {
                                            x: properties.x,
                                            y: properties.y,
                                            width: properties.width,
                                            height: properties.height,
                                            image: internal.canvasID,
                                            rotation: properties.angle,
                                            alpha: properties.alpha
                                        }, game, false);
                                    }
                                }
                            }
                        },
                        text: {
                            args: {
                                x: {
                                    required: false,
                                    default: "centered",
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The x position for the text. Can also be set to \"centered\" to centre it along the x axis."
                                },
                                y: {
                                    required: false,
                                    default: "centered",
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The y position for the text. Can also be set to \"centered\" to centre it along the y axis."
                                },
                                left: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the left side of the text to be positioned along the x axis."
                                },
                                right: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the right side of the text to be positioned along the x axis."
                                },
                                top: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the top of the text to be positioned along the y axis."
                                },
                                bottom: {
                                    required: false,
                                    types: ["number"],
                                    description: "Where you want the bottom of the text to be positioned along the y axis."
                                },

                                alpha: {
                                    required: false,
                                    default: 1,
                                    types: ["number"],
                                    description: "The alpha of the text. 1 is fully visible, 0.5 is partially and 0's invisible."
                                },
                                text: {
                                    required: true,
                                    types: ["string"],
                                    description: "The text that this sprite should display."
                                },
                                font: {
                                    required: false,
                                    check: (value, ob) => {
                                        if (value === undefined) {
                                            if (ob.bitmap) {
                                                ob.font = ".Internal.defaultFont";
                                            }
                                            else {
                                                ob.font = "Arial";
                                            }
                                        }
                                    },
                                    types: ["string"],
                                    description: "The name of the font to use. An HTML font if \"bitmap\" is false or a font asset if it's true."
                                },
                                wordWrapWidth: {
                                    required: false,
                                    types: ["number"],
                                    description: "The maximum width of a line before it wraps. Defaults to no wrapping."
                                },
                                size: {
                                    required: false,
                                    default: 20,
                                    types: ["number"],
                                    description: "The font size in game pixels."
                                },
                                bitmap: {
                                    required: false,
                                    default: false,
                                    types: ["boolean"],
                                    description: "If HTML (false) or bitmap (true) fonts should be used."
                                },
                                color: {
                                    required: false,
                                    default: "black",
                                    types: ["string"],
                                    description: "The colour for the text. An HTML colour. (e.g \"red\", \"rgb(1, 2, 3)\" etc.)"
                                }
                            },
                            cloneArgs: {
                                x: {
                                    syntax: {
                                        description: "The x position for the clone. Can also be set to \"centered\" to centre it along the x axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width - 50\""
                                    },
                                    mode: "replace"
                                },
                                y: {
                                    syntax: {
                                        description: "The y position for the clone. Can also be set to \"centered\" to centre it along the y axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.height - 50\""
                                    },
                                    mode: "replace"
                                },
                                left: {
                                    mode: "replace"
                                },
                                right: {
                                    mode: "replace"
                                },
                                top: {
                                    mode: "replace"
                                },
                                bottom: {
                                    mode: "replace"
                                },

                                alpha: {
                                    syntax: {
                                        description: "The alpha of the clone. 1 is fully visible, 0.5 is partially and 0's invisible."
                                    },
                                    mode: "replace"
                                },
                                text: {
                                    syntax: {
                                        description: "The text that this clone should display."
                                    },
                                    mode: "replace"
                                },
                                font: {
                                    mode: "replace"
                                },
                                wordWrapWidth: {
                                    mode: "replace"
                                },
                                size: {
                                    mode: "replace"
                                },
                                bitmap: {
                                    mode: "replace"
                                },
                                color: {
                                    mode: "replace"
                                }
                            },
                            listeners: {
                                fns: {
                                    xy: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                        if (typeof value == "number") {
                                            if (isNaN(value)) {
                                                return "Huh, looks like you've done something wrong in a calculation somewhere in your program. Sprite " + JSON.stringify(triggerSprite.id) + "'s " + property + " is NaN. This is usually caused by having a non number somewhere in a calcuation.";
                                            }
                                            else {
                                                plugin.vars.sprite.updateAnchors(triggerSprite, property == "x", property == "y");
                                                triggerSprite.internal.renderUpdate = true;
                                                return;
                                            }
                                        }
                                        if (typeof value == "string") {
                                            if (value == "centered") {
                                                if (initialTrigger) {
                                                    if (
                                                        (property == "x" && (sprite.hasOwnProperty("left") || sprite.hasOwnProperty("right")))
                                                        || (property == "y" && (sprite.hasOwnProperty("top") || sprite.hasOwnProperty("bottom")))
                                                    ) {
                                                        return;
                                                    }
                                                }
                                                sprite[property] = game[property == "x"? "width" : "height"] / 2;
                                                plugin.vars.sprite.updateAnchors(triggerSprite, property == "x", property == "y");
                                                triggerSprite.internal.renderUpdate = true;
                                                return;
                                            }
                                        }

                                        // It's invalid if it wasn't any of those valid values
                                        console.error("Oops, this can only be a number or the string \"centered\". In the sprite " + JSON.stringify(triggerSprite.id) + "." + property + ". You tried to set it to " + JSON.stringify(value) + ".");
                                        Bagel.internal.oops(game);
                                    },
                                    rerender: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                        if (! initialTrigger) {
                                            triggerSprite.internal.needsRerender = true;
                                            plugin.vars.font.prerender(triggerSprite, plugin, true); // Half prerender
                                            plugin.vars.sprite.updateAnchors(triggerSprite, true, true);
                                        }
                                    }
                                },
                                property: {
                                    x: {
                                        set: "xy"
                                    },
                                    y: {
                                        set: "xy"
                                    },

                                    left: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.x != "centered") { // Only takes priority when the x is the default value
                                                    return;
                                                }
                                            }
                                            triggerSprite.x = value + (triggerSprite.width / 2);
                                        }
                                    },
                                    right: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.x != "centered") { // Only takes priority when the x is the default value
                                                    return;
                                                }
                                            }
                                            triggerSprite.x = value - (triggerSprite.width / 2);
                                        }
                                    },
                                    top: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.y != "centered") { // Only takes priority when the y is the default value
                                                    return;
                                                }
                                            }
                                            triggerSprite.y = value + (triggerSprite.height / 2);
                                        }
                                    },
                                    bottom: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (initialTrigger) {
                                                if (sprite.y != "centered") { // Only takes priority when the y is the default value
                                                    return;
                                                }
                                            }
                                            triggerSprite.y = value - (triggerSprite.height / 2);
                                        }
                                    },

                                    alpha: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step) => {
                                            if (value > 1) {
                                                sprite.alpha = 1;
                                            }
                                            else if (value < 0) {
                                                sprite.alpha = 0;
                                            }
                                            triggerSprite.internal.renderUpdate = true;
                                        }
                                    },
                                    text: {
                                        set: "rerender"
                                    },
                                    font: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (sprite.bitmap) {
                                                if (! game.get.asset.font(value, true)) {
                                                    return "Huh, the font " + JSON.stringify(value) + " doesn't seem to exist.";
                                                }
                                            }
                                            if (! initialTrigger) {
                                                triggerSprite.internal.needsRerender = true;
                                                plugin.vars.font.prerender(triggerSprite, plugin, true); // Half prerender
                                                plugin.vars.sprite.updateAnchors(triggerSprite, true, true);
                                            }
                                        }
                                    },
                                    wordWrapWidth: {
                                        set: "rerender"
                                    },
                                    size: {
                                        set: "rerender"
                                    },
                                    bitmap: {
                                        set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                            if (! initialTrigger) {
                                                if (value) {
                                                    sprite.font = ".Internal.defaultFont";
                                                }
                                                else {
                                                    sprite.font = "Arial";
                                                }
                                                triggerSprite.internal.needsRerender = true;
                                                plugin.vars.font.prerender(triggerSprite, plugin, true); // Half prerender
                                                plugin.vars.sprite.updateAnchors(triggerSprite, true, true);
                                            }
                                        }
                                    },
                                    color: {
                                        set: "rerender"
                                    }
                                },
                                events: {
                                    delete: sprite => {
                                        Bagel.internal.render.texture.delete(sprite.internal.canvasID, sprite.game);
                                    }
                                },
                                trigger: true
                            },
                            description: "A text sprite. Allows you to easily display text onscreen.",
                            init: (sprite, game, plugin) => {
                                let internal = sprite.internal;
                                internal.last = {};
                                internal.needsRerender = true;
                                sprite.last = {
                                    collision: null
                                };
                                sprite.internal.canvasID = ".Internal.text." + sprite.id;

                                internal.canvas = document.createElement("canvas");
                                internal.canvas.width = 1;
                                internal.canvas.height = 1;

                                Bagel.internal.render.texture.new(sprite.internal.canvasID, sprite.internal.canvas, game);

                                internal.ctx = internal.canvas.getContext("2d");
                                plugin.vars.font.prerender(sprite, plugin, true); // Half prerender
                            },
                            render: {
                                onVisible: (sprite, newBitmap, game, plugin) => {
                                    let internal = sprite.internal;
                                    internal.renderUpdate = false;
                                    if (sprite.bitmap) {
                                        if (sprite.game.get.asset.font(sprite.font) === true) {
                                            return;
                                        }
                                    }

                                    let scaleX = game.internal.renderer.scaleX;
                                    let scaleY = game.internal.renderer.scaleY;
                                    if (internal.needsRerender || ((! sprite.bitmap) && (internal.last.scaleX != scaleX || internal.last.scaleY != scaleY))) {
                                        internal.needsRerender = false;
                                        plugin.vars.font.prerender(sprite, plugin);
                                    }
                                    return newBitmap({
                                        x: sprite.x,
                                        y: sprite.y,
                                        width: sprite.width,
                                        height: sprite.height,
                                        image: sprite.internal.canvasID,
                                        rotation: 90,
                                        alpha: sprite.alpha
                                    }, game, false);
                                },
                                onInvisible: (sprite, deleteBitmap) => deleteBitmap(sprite.internal.Bagel.renderID, sprite.game),
                                whileVisible: (sprite, updateBitmap, newBitmap, deleteBitmap, game, plugin) => {
                                    let mainCanvas = sprite.game.internal.renderer.canvas;
                                    let scaleX = game.internal.renderer.scaleX;
                                    let scaleY = game.internal.renderer.scaleY;

                                    let internal = sprite.internal;
                                    if (internal.needsRerender || ((! sprite.bitmap) && (internal.last.scaleX != scaleX || internal.last.scaleY != scaleY))) {
                                        internal.needsRerender = false;
                                        plugin.vars.font.prerender(sprite, plugin);
                                    }
                                    if (internal.renderUpdate) {
                                        internal.renderUpdate = false;
                                        return updateBitmap(internal.Bagel.renderID, {
                                            x: sprite.x,
                                            y: sprite.y,
                                            width: sprite.width,
                                            height: sprite.height,
                                            image: internal.canvasID,
                                            rotation: 90,
                                            alpha: sprite.alpha
                                        }, game, false);
                                    }
                                }
                            }
                        }
                    }
                },

                methods: {
                    bagel: {
                        maths: {
                            category: {
                                capAngle: {
                                    fn: {
                                        normal: true,
                                        fn: deg => {
                                            if (Math.sign(deg) == 1) {
                                                return ((deg + 180) % 360) - 180;
                                            }
                                            return ((deg - 180) % 360) + 180;
                                        }
                                    }
                                },
                                radToDeg: {
                                    fn: {
                                        normal: true,
                                        fn: rad => (rad * 180) / Math.PI
                                    }
                                },
                                degToRad: {
                                    fn: {
                                        normal: true,
                                        fn: deg => deg * (Math.PI / 180)
                                    }
                                },
                                get: {
                                    category: {
                                        direction: {
                                            fn: {
                                                normal: true,
                                                fn: (x1, y1, x2, y2) => Bagel.maths.radToDeg(Math.atan2(y2 - y1, x2 - x1)) + 90 // gist.github.com/conorbuck/2606166
                                            }
                                        },
                                        distance: {
                                            fn: {
                                                normal: true,
                                                fn: (x1, y1, x2, y2) => Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2)) // a^2 + b^2 = c^2
                                            }
                                        }
                                    }
                                },
                                hex: {
                                    fn: {
                                        normal: true,
                                        fn: num => {
                                            num = num.toString(16);
                                            if (num.length == 1) {
                                                return "0" + num;
                                            }
                                            return num;
                                        }
                                    }
                                }
                            }
                        },
                        download: {
                            fn: {
                                obArg: false,
                                args: {
                                    data: {
                                        required: true,
                                        types: ["string"],
                                        description: "The data for the file. Or the data URL if isUrl is set to true"
                                    },
                                    fileName: {
                                        required: true,
                                        types: ["string"],
                                        description: "The file name for the file to be downloaded."
                                    },
                                    isURL: {
                                        required: false,
                                        default: false,
                                        types: ["boolean"],
                                        description: "If the data is a URL or not. This may be useful if you want to download a canvas using .toDataURL()."
                                    },
                                    mime: {
                                        required: false,
                                        default: "text/plain",
                                        types: ["string"],
                                        description: "The MIME type for the file."
                                    }
                                },
                                fn: args => {
                                    let url;
                                    if (args.isURL) {
                                        url = args.data;
                                    }
                                    else {
                                        let blob = new Blob([args.data], {
                                            type: args.mime
                                        });
                                        url = window.URL.createObjectURL(blob);
                                    }

                                    let downloadElement = document.createElement("a");
                                    downloadElement.download = args.fileName;
                                    downloadElement.href = url;
                                    (downloadElement => {
                                        downloadElement.onclick = () => downloadElement.remove();
                                    })(downloadElement);
                                    downloadElement.style.display = "none";
                                    document.body.appendChild(downloadElement);
                                    downloadElement.click();
                                }
                            }
                        },
                        upload: {
                            fn: {
                                obArg: false,
                                args: {
                                    handler: {
                                        required: true,
                                        types: ["function"],
                                        description: "The handler function. It's given the data URL of the file as its first argument and the second is the file number, starting at 0 (for use with the 2nd argument set to true)"
                                    },
                                    multiple: {
                                        required: false,
                                        default: false,
                                        types: ["boolean"],
                                        description: "If multiple files can be uploaded or not. The handler will be called once per file."
                                    }
                                },
                                fn: args => {
                                    let input = document.createElement("input");
                                    input.type = "file";
                                    input.style.display = "none";
                                    input.multiple = args.multiple;

                                    (args => {
                                        let file = 0;
                                        input.addEventListener("change", _ => {
                                            let reader = new FileReader();
                                            reader.onload = event => {
                                                args.handler(event.target.result, file);
                                                file++;
                                                if (file < input.files.length) {
                                                    reader.readAsDataURL(input.files[file]);
                                                }
                                            };
                                            reader.readAsDataURL(input.files[0]);
                                        }, false);
                                    })(args);
                                    Bagel.internal.inputAction.queue(input => {input.click()}, input);
                                }
                            }
                        },
                        pwa: {
                            category: {
                                init: {
                                    fn: {
                                        obArg: true,
                                        args: {
                                            worker: {
                                                required: false,
                                                types: ["string"],
                                                description: "The URL of the service worker. They can be generated using Bagel.pwa.generate.worker. Its arguments are the game, extra files (e.g js files) and an optional fileName for the worker that will be downloaded by it."
                                            },
                                            icons: {
                                                required: false,
                                                default: false,
                                                types: ["boolean"],
                                                description: "If the icons exist or not. Generate them using Bagel.pwa.generate.icons."
                                            },
                                            manifest: {
                                                required: false,
                                                types: ["string"],
                                                description: "The href of the manifest. Generate one using Bagel.pwa.generate.manifest."
                                            },
                                            debugManifest: {
                                                required: false,
                                                types: ["string"],
                                                description: "The href of your debug manifest. It allows you to test your PWA without putting it on a production server. (don't test things on production! :P)"
                                            },
                                            versions: {
                                                required: false,
                                                types: ["string"],
                                                description: "The href of the version JSON file. Generate versions using Bagel.pwa.generate.version."
                                            },
                                            version: {
                                                required: false,
                                                types: ["string"],
                                                description: "The href of the version file (the one that contains the latest version name). Generate versions using Bagel.pwa.generate.version."
                                            },
                                            versionStorageName: {
                                                required: false,
                                                types: ["string"],
                                                description: "The name for the localStorage that contains the current downloaded version. e.g \"Marble game version\". localStorage is shared on a website so make sure the name is unique to this game. It's explained in Bagel.pwa.generate.version."
                                            },
                                            cacheStorageName: {
                                                required: false,
                                                types: ["string"],
                                                description: "The cache storage name provided by Bagel.pwa.generate.worker."
                                            },
                                            multiTabStorageName: {
                                                required: false,
                                                types: ["string"],
                                                description: "A name unique to this page for detecting multiple instances of the game and preventing them. (don't forget that domains share localStorage)"
                                            },
                                            minified: {
                                                required: false,
                                                default: false,
                                                types: ["boolean"],
                                                description: "If you've minified your main JavaScript file. You should also use the minified version of Bagel.js."
                                            },
                                            debug: {
                                                required: false,
                                                default: true,
                                                types: ["boolean"],
                                                description: "If debug mode should be enabled. This disables the service worker so the page updates properly when reloading. Make sure you disable this before you put this game online though."
                                            },
                                        },
                                        fn: args => {
                                            if (Bagel.internal.pwaInitialized) {
                                                console.error("Erm, you can only run this function once per page. The PWA's already initialised.");
                                            }
                                            if (args.worker) {
                                                if (navigator.serviceWorker) {
                                                    if (args.debug) {
                                                        navigator.serviceWorker.getRegistrations().then(workers => {
                                                            for (let worker of workers) {
                                                                worker.unregister();
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        navigator.serviceWorker.register(args.worker);
                                                    }
                                                }
                                            }
                                            else {
                                                console.warn("The Bagel.js service worker's missing. Generate one using Bagel.pwa.generate.worker.");
                                            }


                                            if (! args.icons) {
                                                console.warn("The Bagel.js icons are missing. Generate the icons using Bagel.pwa.generate.icons.");
                                            }
                                            if (args.manifest) {
                                                let manifest = args.debug? args.debugManifest : args.manifest;
                                                if (args.debugManifest == null) {
                                                    console.warn("No debug manifest specified. One should have been generated by Bagel.pwa.generate.manifest. Once you've got it, link it to your game by setting the \"debugManifest\" argument in this function to its href.");
                                                }

                                                if (args.debugManifest || (! args.debug)) {
                                                    let link = document.createElement("link");
                                                    link.rel = "manifest";
                                                    link.href = manifest;
                                                    document.head.appendChild(link);
                                                }
                                            }
                                            else {
                                                console.warn("The Bagel.js manifest is missing. Generate one using Bagel.pwa.generate.manifest once you've generated the icons using Bagel.pwa.generate.icons.");
                                            }
                                            if (! args.versions) {
                                                console.warn("The Bagel.js version JSON file's missing. Use Bagel.pwa.generate.version.");
                                            }
                                            if (args.version) {
                                                if (navigator.onLine) {
                                                    if (args.versionStorageName && args.versions && args.cacheStorageName) {
                                                        if (typeof caches == "undefined") {
                                                            console.error("Huh, looks like you're trying to run this on an insecure server (the traffic isn't encrypted). Browsers block cache storage for insecure websites for security reasons. If this is your test server, you can try connecting using the url 127.0.0.0:<port of your current url>. If this is your main server, you should be using HTTPS, it's 2020! :P");
                                                            Bagel.internal.oops(game);
                                                        }
                                                        else {
                                                            fetch(args.version).then(res => res.text().then(version => {
                                                                version = version.split("\n").join("");
                                                                let installed = localStorage.getItem(args.versionStorageName);
                                                                if (installed == null) installed = 0;

                                                                Bagel.pwa.version = installed;
                                                                if (installed != version) {
                                                                    fetch(args.versions).then(res => res.json().then(versions => {
                                                                        caches.open(args.cacheStorageName).then(cache => {
                                                                            let oldVersion = installed;
                                                                            while (installed < versions.versions.length) {
                                                                                let changed = versions.versions[installed].changed;
                                                                                for (let i in changed) {
                                                                                    cache.delete(changed[i]);
                                                                                }
                                                                                installed++;
                                                                            }
                                                                            localStorage.setItem(args.versionStorageName, installed);

                                                                            Bagel.pwa.version = installed;

                                                                            let blockReload = false;
                                                                            if (Bagel.events.pwaUpdate) {
                                                                                blockReload = Bagel.events.pwaUpdate(installed, oldVersion, versions);
                                                                            }
                                                                            if (! blockReload) {
                                                                                location.reload(); // Reload so all the new assets can be loaded
                                                                            }
                                                                        });
                                                                    }));
                                                                }
                                                            }));
                                                        }
                                                    }
                                                }
                                                else {
                                                    console.log("You're offline.");
                                                }
                                            }
                                            else {
                                                console.warn("The Bagel.js latest version file's missing. Use Bagel.pwa.generate.version.");
                                            }
                                            if (args.multiTabStorageName) {
                                                if (localStorage.getItem(args.multiTabStorageName) == null) {
                                                    localStorage.setItem(args.multiTabStorageName, "0");
                                                }
                                                ((tick, value) => {
                                                    setTimeout(_ => {
                                                        if (localStorage.getItem(args.multiTabStorageName) == tick) { // It hasn't changed
                                                            let interval = setInterval(_ => {
                                                                value++;
                                                                if (value > 100) value = 0;
                                                                localStorage.setItem(args.multiTabStorageName, value);
                                                            }, 500);
                                                        }
                                                        else { // Another tab changed it
                                                            alert("Erm. Looks like you have two of the same tab open. Please close one. Data loss is possible if you continue.");
                                                        }

                                                    }, 1000);
                                                })(localStorage.getItem(args.multiTabStorageName), 0);
                                            }
                                            else {
                                                console.warn("The Bagel.js multi tab storage name is missing. This is a name unique to this page for detecting multiple instances of the game and preventing them. (don't forget that domains share localStorage)");
                                            }
                                            if (! args.versionStorageName) {
                                                console.warn("The Bagel.js version storage name's missing. This is explained in Bagel.pwa.generate.version.");
                                            }
                                            if (! args.cacheStorageName) {
                                                console.warn("The Bagel.js cache name's missing. This should've been added after running Bagel.pwa.generate.worker.");
                                            }
                                            if (! args.minified) {
                                                console.warn("Your code isn't minified. Look up an online tool to help. Once you're done, set \"minified\" in Bagel.pwa.init to true. Also, make sure to run lighthouse or an equivalent so you can follow the best practices :)");
                                            }
                                            if (args.debug) {
                                                console.warn("PWA debug mode is enabled, make sure you disable it before releasing by setting \"debug\" in Bagel.pwa.init to false.");
                                            }

                                            Bagel.internal.pwaInitialized = true;
                                        }
                                    }
                                },
                                generate: {
                                    category: {
                                        worker: {
                                            fn: {
                                                obArg: false,
                                                args: {
                                                    game: {
                                                        required: true,
                                                        types: ["object"],
                                                        description: "The game object."
                                                    },
                                                    icons: {
                                                        required: true,
                                                        types: ["string"],
                                                        description: "The href of the folder containing the icons. Generate them with Bagel.pwa.generate.icons."
                                                    },
                                                    extraFiles: {
                                                        required: true,
                                                        types: ["array"],
                                                        description: "Any extra files that aren't assets but are needed. e.g main.js, bagel.js etc. The index.html file is automatically included"
                                                    },
                                                    storageID: {
                                                        required: false,
                                                        types: ["string"],
                                                        description: "The id for the cache storage the worker uses. Defaults to \"Bagel.js\" followed by a space and then the name of the game specified."
                                                    },
                                                    manifest: {
                                                        required: false,
                                                        default: "manifest.json",
                                                        types: ["string"],
                                                        description: "The href of your manifest or what will be the href when the website is properly online."
                                                    },
                                                    worker: {
                                                        required: false,
                                                        default: "worker.js",
                                                        types: ["string"],
                                                        description: "The file name for the worker JavaScript file. Determines the name when it's downloaded but also the href of the file so it can be cached."
                                                    }
                                                },
                                                fn: (args, game) => {
                                                    let toCache = args.extraFiles;
                                                    let assetJSONs = game.internal.combinedPlugins.types.assets;
                                                    for (let assetType in game.game.assets) {
                                                        let assets = game.game.assets[assetType];
                                                        for (let i in assets) {
                                                            for (let c in assetJSONs[assetType].hrefArgs) {
                                                                let src = assets[i][assetJSONs[assetType].hrefArgs[c]];
                                                                if (src != null) {
                                                                    let protocol = src.split(":")[0];
                                                                    if (protocol != "data" && protocol != "blob") { // Data url, don't cache
                                                                        toCache.push(src);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    for (let plugin in game.game.plugins) {
                                                        let src = game.game.plugins[plugin].src;
                                                        let protocol = src.split(":")[0];
                                                        if (protocol != "data" && protocol != "blob") { // Data url, don't cache
                                                            toCache.push(src);
                                                        }
                                                    }

                                                    if (args.icons[args.icons.length - 1] != "/") {
                                                        args.icons += "/";
                                                    }
                                                    let resolutions = [
                                                        128,
                                                        144,
                                                        152,
                                                        192,
                                                        256,
                                                        512
                                                    ];
                                                    for (let i in resolutions) {
                                                        toCache.push(args.icons + resolutions[i] + "x" + resolutions[i] + ".png");
                                                    }
                                                    if (! toCache.includes(args.manifest)) {
                                                        toCache.push(args.manifest);
                                                    }
                                                    if (! toCache.includes(args.worker)) {
                                                        toCache.push(args.worker);
                                                    }

                                                    let template = 'let index=location.href.split("/");index.pop();const toCache=[index=index.join("/")+"/",...<CACHE>];self.addEventListener("install",e=>{self.skipWaiting()});const useCache=e=>cache?e():caches.open(<NAME>).then(s=>(cache=s,e()));let cache;self.addEventListener("fetch",e=>{e.respondWith(useCache(s=>cache.match(e.request).then(s=>{if(s)return s;{let s=fetch(e.request);return s.then(s=>{let t=e.request.url,n=t.replace(index,"");(t==index||toCache.includes(n))&&cache.put(e.request,s.clone())}),s.catch(s=>{console.warn("A Bagel.js service worker failed to fetch "+e.request.url+". Request:"),console.log({...e.request})}),s}})))});';

                                                    let worker = template.replace("<CACHE>", JSON.stringify(toCache));
                                                    if (args.storageID == null) {
                                                        args.storageID = "Bagel.js " + args.game.id;
                                                    }
                                                    worker = worker.replace("<NAME>", JSON.stringify(args.storageID));
                                                    Bagel.download(worker, args.worker, false, "application/javascript");

                                                    console.log("Your service worker has been generated. Make sure to place this in the root directory of your project, also make sure that this page is in the root directory. You should also make sure that the array provided for the second argument contains the SRCs (not URLs!) of your JavaScript files (including the Bagel.js file).\nA new worker will need to be generated for each version (unless there's no new files) (versions can be generated using Bagel.pwa.generate.version)");
                                                    console.log("Make sure you enable the worker by setting the \"worker\" argument to " + JSON.stringify(args.fileName) + " and by setting \"cacheStorageName\" to " + JSON.stringify(args.storageID) + " in Bagel.pwa.init. You should also generate a version using Bagel.pwa.generate.version if you haven't already.");

                                                    console.log("\nAlso make sure to save the code you used so you can generate the next worker more easilly.");
                                                }
                                            }
                                        },
                                        icons: {
                                            fn: {
                                                obArg: false,
                                                args: {
                                                    src: {
                                                        required: true,
                                                        types: ["string"],
                                                        description: "The src of the 512x512 resolution icon. (it can be any resolution if it's pixel art)"
                                                    },
                                                    pixelArt: {
                                                        required: true,
                                                        default: true,
                                                        types: ["boolean"],
                                                        description: "If the icon is pixel art or not. If it is, anti-aliasing will be disabled and there'll be no warning for having a low resolution icon."
                                                    }
                                                },
                                                fn: args => {
                                                    let img = new Image();
                                                    (img => {
                                                        img.onload = _ => {
                                                            if (img.width != img.height) {
                                                                console.warn("Huh, the image width doesn't match image height.");
                                                            }
                                                            if (! args.pixelArt) {
                                                                if (img.width < 512 || img.height < 512) {
                                                                    console.warn("Hmm, the image resolution is less than 512x512 and it's not pixel art. It may appear blurry.");
                                                                }
                                                            }

                                                            let canvas = document.createElement("canvas");
                                                            let ctx = canvas.getContext("2d");

                                                            let resolutions = [
                                                                128,
                                                                144,
                                                                152,
                                                                192,
                                                                256,
                                                                512
                                                            ];
                                                            for (let i in resolutions) {
                                                                let resolution = resolutions[i];
                                                                canvas.width = resolution;
                                                                canvas.height = resolution;
                                                                ctx.imageSmoothingEnabled = ! args.pixelArt;

                                                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                                                Bagel.download(canvas.toDataURL("image/png"), resolution + "x" + resolution + ".png", true);
                                                            }
                                                            console.log("128, 144, 152, 192, 256 and 512 pixel resolutions have been generated. You may need to enable automatic downloads. These should be in a folder in your project directory (or subfolder). You can add them to your PWA by generating a manifest. You should also make sure to set the \"icons\" argument in Bagel.pwa.init to true.");
                                                        };
                                                    })(img);
                                                    img.src = args.src;
                                                    console.log("Loading image...");
                                                }
                                            }
                                        },
                                        manifest: {
                                            fn: {
                                                obArg: true,
                                                args: {
                                                    icons: {
                                                        required: true,
                                                        types: ["string"],
                                                        description: "The src of the folder containing the icons. Ending it in a slash is optional. Generate these using Bagel.pwa.generate.icons, give it the src of your highest resolution image followed by if it's pixel art or not."
                                                    },
                                                    name: {
                                                        required: true,
                                                        types: ["string"],
                                                        description: "The name of your PWA. Usually the name shown in an app list."
                                                    },
                                                    shortName: {
                                                        required: true,
                                                        types: ["string"],
                                                        description: "A shorter name."
                                                    },
                                                    startURL: {
                                                        required: true,
                                                        types: ["string"],
                                                        description: "The URL for the PWA to start at when it's opened."
                                                    },

                                                    backgroundColor: {
                                                        required: false,
                                                        types: ["string"],
                                                        description: "The background colour for the PWA. Is an HTML colour. Defaults to the page's background colour."
                                                    },
                                                    themeColor: {
                                                        required: false,
                                                        types: ["string"],
                                                        description: "The theme colour for the app. See https://developer.mozilla.org/en-US/docs/Web/Manifest/theme_color"
                                                    },
                                                    categories: {
                                                        required: false,
                                                        types: ["array"],
                                                        description: "Any categories your PWA fits into. e.g games."
                                                    },
                                                    description: {
                                                        required: false,
                                                        types: ["string"],
                                                        description: "A brief description of what this PWA is or does."
                                                    },
                                                    dir: {
                                                        required: false,
                                                        types: ["string"],
                                                        description: "The direction of the text. Probably not needed as the Bagel.js pwa creator only works for games and not websites with games in them. Either \"auto\", \"ltr\" or \"rtl\"."
                                                    },
                                                    display: {
                                                        required: false,
                                                        default: "fullscreen",
                                                        types: ["string"],
                                                        description: "The display mode for the PWA. Can be \"fullscreen\", \"standalone\", \"minimal-ui\" or \"browser\"."
                                                    },
                                                    iarcRatingId: {
                                                        required: false,
                                                        types: ["string"],
                                                        description: "An id for if your website's been age rated or not."
                                                    },
                                                    lang: {
                                                        required: false,
                                                        types: ["string"],
                                                        description: "The language of your PWA. e.g \"en-UK\"."
                                                    },
                                                    orientation: {
                                                        required: false,
                                                        default: "any",
                                                        types: ["string"],
                                                        description: "The default orientation for the PWA. Most of the time, you probably want to set this to \"landscape\" or leave it so it's \"any\"."
                                                    },
                                                    preferRelatedApplications: {
                                                        required: false,
                                                        types: ["boolean"],
                                                        description: "Tells the browser to encourage users to install a similar app, e.g your native app instead. You probably won't want to use this."
                                                    },
                                                    relatedApplications: {
                                                        required: false,
                                                        types: ["array"],
                                                        description: "See https://developer.mozilla.org/en-US/docs/Web/Manifest/related_applications"
                                                    },
                                                    screenshots: {
                                                        required: false,
                                                        types: ["array"],
                                                        description: "Intended to be used by PWA stores. See https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots"
                                                    },
                                                    scope: {
                                                        required: false,
                                                        types: ["string"],
                                                        description: "The different URLs that the manifest applies to. Defaults to your argument for the start URL, which is probably what you want most of the time."
                                                    }
                                                },
                                                fn: args => {
                                                    let map = {
                                                        icons: "icons",
                                                        name: "name",
                                                        shortName: "short_name",
                                                        backgroundColor: "background_color",
                                                        themeColor: "theme_color",
                                                        categories: "categories",
                                                        description: "description",
                                                        dir: "dir",
                                                        display: "display",
                                                        iarcRatingId: "iarc_rating_id",
                                                        lang: "lang",
                                                        orientation: "orientation",
                                                        preferRelatedApplications: "prefer_related_applications",
                                                        relatedApplications: "related_applications",
                                                        scope: "scope",
                                                        screenshots: "screenshots",
                                                        startURL: "start_url"
                                                    };
                                                    let newArgs = {};
                                                    for (let i in args) {
                                                        if (args[i] == null) {
                                                            if (i == "backgroundColor") {
                                                                if (document.body) {
                                                                    newArgs[map[i]] = document.body.bgColor;
                                                                }
                                                            }
                                                            else if (i == "scope") {
                                                                newArgs[map[i]] = args.startURL;
                                                            }
                                                        }
                                                        else {
                                                            newArgs[map[i]] = args[i];
                                                        }
                                                    }
                                                    args = newArgs;

                                                    if (args.icons[args.icons.length - 1] != "/") {
                                                        args.icons += "/"; // Needs to end in a slash
                                                    }
                                                    let resolutions = [
                                                        128,
                                                        144,
                                                        152,
                                                        192,
                                                        256,
                                                        512
                                                    ];
                                                    let icons = [];
                                                    for (let i in resolutions) {
                                                        let resolution = resolutions[i];
                                                        let size = resolution + "x" + resolution;
                                                        icons.push({
                                                            src: args.icons + size + ".png",
                                                            sizes: size,
                                                            type: "image/png"
                                                        });
                                                    }
                                                    args.icons = icons;

                                                    // Some of the urls won't work on a test server, so it needs a separate manifest
                                                    let debugManifest = Bagel.internal.deepClone(args);
                                                    debugManifest.start_url = location.href;
                                                    debugManifest.scope = location.href;

                                                    Bagel.download(JSON.stringify(args), "manifest.json", false, "application/json");
                                                    Bagel.download(JSON.stringify(debugManifest), "debugManifest.json", false, "application/json");

                                                    console.log("Manifests generated. Put them in the root directory of your project and set the \"manifest\" argument in Bagel.init.pwa to normal manifest src. You should also set the \"debugManifest\" argument to the other manifest's src if you want to be able to test your PWA.");
                                                    console.log("(You might need to enable automatic downloads to get both the files)");
                                                    console.log("Tip: you should also save the code you just ran so you can update your manifest more easily.");


                                                    console.log("\nYou should also add these elements to your HTML \"head\" tag if you haven't already...");
                                                    let icon = icons[icons.length - 1].src;
                                                    let link = document.createElement("link");
                                                    link.rel = "icon";
                                                    link.type = "image/png";
                                                    link.href = icon;
                                                    let p = document.createElement("p");
                                                    p.appendChild(link);
                                                    console.log(p.innerHTML);

                                                    // Apple doesn't seem to like the idea of PWAs so we have to use an old solution for icons that's existed since the first Safari (I think?) (argh)
                                                    link = document.createElement("link");
                                                    link.rel = "apple-touch-icon";
                                                    link.sizes = "512x512"; // This resolution is way overkill but it gets downscaled anyway
                                                    link.type = "image/png";
                                                    link.href = icon;
                                                    p = document.createElement("p");
                                                    p.appendChild(link);
                                                    console.log(p.innerHTML);
                                                }
                                            }
                                        },
                                        version: {
                                            fn: {
                                                obArg: false,
                                                args: {
                                                    name: {
                                                        required: true,
                                                        types: ["string"],
                                                        description: "The name of this version. e.g 1.0"
                                                    },
                                                    changed: {
                                                        required: true,
                                                        types: ["array"],
                                                        description: "The srcs of files that have changed. This should include removed files but not new files. A rename should be treated as a removed file and then a new file. If you regenerated your worker file or manifest, it should also be included. If this is your first version, this should be empty."
                                                    },
                                                    versions: {
                                                        required: false,
                                                        default: {
                                                            syntax: 1,
                                                            versions: []
                                                        },
                                                        types: ["object"],
                                                        description: "The current version JSON."
                                                    },
                                                    fileName: {
                                                        required: false,
                                                        default: "versions.json",
                                                        types: ["string"],
                                                        description: "The file name for the versions JSON file."
                                                    }
                                                },
                                                fn: args => {
                                                    let versionSpecified = args.versions.versions.length != 0;
                                                    args.versions.versions.push({
                                                        name: args.name,
                                                        changed: args.changed
                                                    });
                                                    Bagel.download(JSON.stringify(args.versions), args.fileName, false, "application/json");
                                                    if ((! versionSpecified) && parseFloat(args.name) != 1) {
                                                        console.warn("No previous version JSON was specified and this doesn't appear to be the first version.\nIf this isn't the first version, rerun this with the 3rd argument set to your current version JSON (not as a string).");
                                                    }
                                                    console.log("New version file generated. If there was no warning or you think it's incorrect, you should now " + (versionSpecified? "replace your existing versions.json file" : "move this file into your root directory") + ".");
                                                    if (versionSpecified) {
                                                        console.log("Don't forget to update your version file with\n" + JSON.stringify(args.versions.versions.length) + " :)");
                                                    }
                                                    else {
                                                        console.log("You also need a file to specifiy what the latest version is. Create a plain text file called \"version.txt\" in your root directory and put " + JSON.stringify(args.versions.versions.length) + " in it. New lines will be ignored.");
                                                        console.log("Finally, link these two into your PWA by setting the \"versions\" and \"version\" arguments in Bagel.pwa.init to their corresponding file srcs, \"versionStorageName\" should also be set to something unique to the game (it's where the installed version is saved). If you've followed all the other steps properly, your PWA should now be working. (make sure you're running on an HTTPS server or localhost)");
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                help: {
                                    fn: {
                                        normal: true,
                                        fn: _ => {
                                            console.log("Full tutorial here: https://github.com/hedgehog125/Bagel.js/wiki/PWA-Tutorial :)");
                                        }
                                    }
                                }
                            }
                        },
                        font: {
                            category: {
                                create: {
                                    fn: {
                                        fn: args => {
                                            const loaded = img => {
                                                let canvas = document.createElement("canvas");
                                                canvas.width = img.width;
                                                canvas.height = img.height;
                                                let ctx = canvas.getContext("2d");
                                                ctx.drawImage(img, 0, 0);

                                                let data = ctx.getImageData(0, 0, canvas.width, canvas.height);

                                                let characterHeights = [];
                                                let lastY = 0;
                                                let characterCount = 0;
                                                let i = 0;
                                                while (i < data.data.length) {
                                                    let red = data.data[i] == 255 && data.data[i + 3] == 255;
                                                    let lastRow = i + (data.width * 4) >= data.data.length;
                                                    if (red || lastRow) {
                                                        let y = Math.floor((i / 4) / data.width);
                                                        characterHeights.push((y - lastY) + lastRow);
                                                        lastY = y + 1;
                                                        characterCount++;
                                                    }
                                                    i += data.width * 4;
                                                }

                                                let characterWidths = [];
                                                let pixels = "";
                                                let newCharacter;
                                                let width = 0;
                                                let height = 0;
                                                let characterID = 0;
                                                i = 0;
                                                lastY = 0;
                                                while (i < data.data.length) {
                                                    let x = (i / 4) % data.width;
                                                    y = Math.floor((i / 4) / data.width);

                                                    if (y == lastY) {
                                                        width++;
                                                    }
                                                    else {
                                                        if (x == width) {
                                                            i = (y + 1) * (data.width * 4);
                                                            continue;
                                                        }
                                                    }


                                                    if (data.data[i + 3] == 0) { // Transparent
                                                        pixels += "0";
                                                    }
                                                    else {
                                                        if (data.data[i] == 255) { // Red
                                                            if (x == 0) {
                                                                characterWidths.push(width);
                                                                width = 0;
                                                                lastY = y + 1;
                                                                i += data.width * 4; // Skip over the separator row
                                                            }
                                                            else {
                                                                i = (Math.floor((i / 4) / data.width) + 1) * (data.width * 4);
                                                                width--;
                                                            }
                                                            continue;
                                                        }
                                                        else {
                                                            pixels += "1";
                                                        }
                                                    }

                                                    i += 4;
                                                }
                                                characterWidths.push(width);

                                                let result = JSON.stringify({
                                                    widths: characterWidths,
                                                    heights: characterHeights,
                                                    pixels: pixels
                                                });
                                                if (args.download) {
                                                    Bagel.download(result, "font.bagelFont");
                                                }
                                                return result;
                                            }
                                            if (args.img === undefined) {
                                                Bagel.upload(src => {
                                                    let img = new Image();
                                                    img.onload = event => {
                                                        loaded(event.target);
                                                    }
                                                    img.src = src;
                                                });
                                                console.log("Click on the game to open the file picker.");
                                            }
                                            else {
                                                return loaded(args.img);
                                            }
                                        },
                                        args: {
                                            img: {
                                                required: false,
                                                types: ["object"],
                                                description: "The image of the new font. Either a HTML image object or blank to upload one."
                                            },
                                            download: {
                                                required: false,
                                                default: true,
                                                types: ["boolean"],
                                                description: "If the resulting font file should be downloaded or only returned as a string."
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    game: {
                        playSound: {
                            fn: {
                                obArg: false,
                                args: {
                                    id: {
                                        required: true,
                                        types: ["string"],
                                        description: "The id of the sound to play."
                                    },
                                    volume: {
                                        required: false,
                                        default: 1,
                                        types: ["number"],
                                        description: "The volume to play the sound at."
                                    },
                                    loop: {
                                        required: false,
                                        default: false,
                                        types: ["boolean"],
                                        description: "If the audio should loop or not."
                                    },
                                    startTime: {
                                        required: false,
                                        default: 0,
                                        types: ["number"],
                                        description: "The starting time for the audio in seconds."
                                    },
                                    restart: {
                                        required: false,
                                        default: false,
                                        types: ["boolean"],
                                        description: "If the sound should restart or not if it's already playing. If false and it's already playing, nothing will happen and the sound will continue."
                                    }
                                },
                                fn: (game, args, plugin) => {
                                    let snd = game.get.asset.snd(args.id);

                                    if (snd.paused || args.restart) {
                                        snd.currentTime = args.startTime;
                                        snd.loop = args.loop;
                                        snd.volume = Math.max(Math.min(args.volume, 1), 0);
                                        if (plugin.vars.audio.autoPlay) { // Wait for an unmute instead of treating every input as one
                                            let promise = snd.play();
                                            if (promise != null) {
                                                (plugin => {
                                                    promise.then(_ => { // Autoplay worked
                                                        plugin.vars.audio.autoPlay = true;
                                                    }).catch(_ => { // Nope. Prompt the user
                                                        let current = Bagel.internal.current;
                                                        Bagel.internal.saveCurrent();
                                                        current.plugin = plugin;

                                                        plugin.vars.audio.autoPlay = false;
                                                        plugin.vars.audio.createUnmute(plugin, game);
                                                        if (args.loop || snd.duration >= 5) { // It's probably important instead of just a sound effect. Queue it
                                                            plugin.vars.audio.queue.push(args.id);
                                                        }
                                                        Bagel.internal.loadCurrent();
                                                    });
                                                })(plugin);
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        stopSound: {
                            fn: {
                                obArg: false,
                                args: {
                                    id: {
                                        required: true,
                                        types: ["string"],
                                        description: "The id of the sound to stop."
                                    }
                                },
                                fn: (game, args, plugin) => {
                                    Bagel.get.asset.snd(args.id, game).stop();
                                }
                            }
                        },
                        debug: {
                            category: {
                                textures: {
                                    category: {
                                        showCombined: {
                                            fn: {
                                                obArg: false,
                                                args: {
                                                    index: {
                                                        required: true,
                                                        types: ["number"],
                                                        check: (value, ob, argID, game, prev, args) => {
                                                            if (game.internal.renderer.type != "webgl") return;
                                                            let textureMaps = game.internal.renderer.textureMaps;
                                                            let combinedTexture = textureMaps[value];

                                                            if (combinedTexture == null) {
                                                                return "Huh, that combined texture doesn't seem to exist. Make sure the index is between 0 and " + (textureMaps.length - 1) + ". Also make sure that that combined texture has been activated if you want to see anything.";
                                                            }
                                                        },
                                                        description: "The index number of the combined texture or single texture to display."
                                                    },
                                                    mini: {
                                                        required: false,
                                                        default: true,
                                                        types: ["boolean"],
                                                        description: "If the texture map should be small and visible alongside the game or fill the screen."
                                                    }
                                                },
                                                fn: (game, args, plugin) => {
                                                    let renderer = game.internal.renderer;
                                                    if (renderer.type != "webgl") {
                                                        console.error("Oh no! This function only works on games that are using the \"webgl\" renderer. Textures aren't combined in the other renderers.");
                                                        Bagel.internal.oops(game);
                                                    }

                                                    let combinedTexture = renderer.textureMaps[args.index];
                                                    if (! combinedTexture.active) {
                                                        console.warn("This combined texture isn't activated. But its contents will be displayed once it is.");
                                                    }

                                                    let width = game.width / (args.mini? 2 : 1);
                                                    let height = game.height / (args.mini? 2 : 1);
                                                    if (width > height) {
                                                        width = height;
                                                    }
                                                    else {
                                                        height = width;
                                                    }

                                                    return game.add.sprite({
                                                        id: ".Internal.debug.textureMap." + args.index,
                                                        ...(args.mini? {
                                                            left: 0,
                                                            top: 0
                                                        } : {}),
                                                        scripts: {
                                                            main: [
                                                                {
                                                                    code: me => {
                                                                        me.layer.bringToFront();
                                                                    },
                                                                    stateToRun: game.state
                                                                }
                                                            ]
                                                        },
                                                        img: ".Internal.textureMap." + args.index,
                                                        width: width,
                                                        height: height
                                                    });
                                                }
                                            }
                                        },
                                        hideCombined: {
                                            fn: {
                                                obArg: false,
                                                args: {
                                                    index: {
                                                        required: true,
                                                        types: ["number"],
                                                        description: "The index number of the combined texture or single texture to hide."
                                                    }
                                                },
                                                fn: (game, args, plugin) => {
                                                    if (game.internal.renderer.type != "webgl") {
                                                        console.error("Huh, this function only works on games that are using the \"webgl\" renderer. Textures aren't combined in the other renderers.");
                                                        Bagel.internal.oops(game);
                                                    }

                                                    let combinedTexture = game.internal.renderer.textureMaps[args.index];

                                                    let sprite = game.get.sprite(".Internal.debug.textureMap." + args.index, true);
                                                    if (! sprite) {
                                                        console.error("Huh, that texture map doesn't seem to be being displayed at the moment.");
                                                        Bagel.internal.oops(game);
                                                    }
                                                    sprite.delete();
                                                }
                                            }
                                        },
                                        listDownscaled: {
                                            fn: {
                                                obArg: false,
                                                args: {},
                                                fn: (game, args, plugin) => {
                                                    if (game.internal.renderer.type != "webgl") {
                                                        console.error("Hmm, this function only works on games that are using the \"webgl\" renderer. Textures don't ever need to be downscaled in the other renderers.");
                                                        Bagel.internal.oops(game);
                                                    }

                                                    let renderer = game.internal.renderer;
                                                    if (Object.keys(renderer.downscaled).length == 0) {
                                                        console.log("No textures have had to be downscaled yet.");
                                                        if (game.config.display.renderer == "canvas") {
                                                            console.log("However, since you're using the \"canvas\" renderer at the moment, textures don't ever need to be downscaled.");
                                                        }
                                                    }
                                                    else {
                                                        console.log("These textures were downscaled this many times (including the initial texture if it was over the limit):");
                                                        for (let i in renderer.downscaled) {
                                                            console.log(i + ": " + renderer.downscaled[i]);
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        listAnimatedIntoCombined: {
                                            fn: {
                                                obArg: false,
                                                args: {},
                                                fn: (game, args, plugin) => {
                                                    if (game.internal.renderer.type != "webgl") {
                                                        console.error("Oh no! This function only works on games that are using the \"webgl\" renderer. Textures don't ever need to be downscaled in the other renderers.");
                                                        Bagel.internal.oops(game);
                                                    }

                                                    let renderer = game.internal.renderer;
                                                    if (Object.keys(renderer.animatedIntoCombined).length == 0) {
                                                        console.log("No animated textures have had to use a combined texture yet.");
                                                        if (game.config.display.renderer == "canvas") {
                                                            console.log("However, since you're using the \"canvas\" renderer at the moment, the texture modes don't matter.");
                                                        }
                                                    }
                                                    else {
                                                        console.log("These animated textures became combined textures:");
                                                        for (let i in renderer.animatedIntoCombined) {
                                                            console.log(i);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    sprite: {
                        move: {
                            fn: {
                                appliesTo: [
                                    "sprite",
                                    "canvas"
                                ],
                                obArg: false,
                                args: {
                                    amount: {
                                        required: true,
                                        types: ["number"],
                                        description: "The number of in game pixels (independent of the rendered canvas width and height) to move the sprite.",
                                    },
                                    angle: {
                                        required: false,
                                        types: ["number"],
                                        description: "The angle in degrees for the sprite to move in. 0° -> Straight up. -180/180° -> Straight down. 90° -> Right (default of sprites). Defaults to the value of sprite.angle."
                                    }
                                },
                                fn: (me, args, game) => {
                                    let cached = me.internal.cache;
                                    if (args.angle == null) {
                                        me.x += cached.sin * args.amount;
                                        me.y -= cached.cos * args.amount;
                                    }
                                    else {
                                        let rad = Bagel.maths.degToRad(args.angle);
                                        me.x += Math.sin(rad) * args.amount;
                                        me.y -= Math.cos(rad) * args.amount;
                                    }
                                }
                            }
                        },
                        layer: {
                            category: {
                                bringToFront: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "text"
                                        ],
                                        obArg: false,
                                        args: {},
                                        fn: (sprite, args, game) => {
                                            if (sprite.internal.Bagel.renderID != null) {
                                                Bagel.internal.render.bitmapSprite.bringToFront(sprite.internal.Bagel.renderID, game);
                                            }
                                        }
                                    }
                                },
                                bringForwards: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "text"
                                        ],
                                        obArg: false,
                                        args: {},
                                        fn: (sprite, args, game) => {
                                            if (sprite.internal.Bagel.renderID != null) {
                                                Bagel.internal.render.bitmapSprite.bringForwards(sprite.internal.Bagel.renderID, game);
                                            }
                                        }
                                    }
                                },
                                sendToBack: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "text"
                                        ],
                                        obArg: false,
                                        args: {},
                                        fn: (sprite, args, game) => {
                                            if (sprite.internal.Bagel.renderID != null) {
                                                Bagel.internal.render.bitmapSprite.sendToBack(sprite.internal.Bagel.renderID, game);
                                            }
                                        }
                                    }
                                },
                                sendBackwards: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "text"
                                        ],
                                        obArg: false,
                                        args: {},
                                        fn: (sprite, args, game) => {
                                            if (sprite.internal.Bagel.renderID != null) {
                                                Bagel.internal.render.bitmapSprite.sendBackwards(sprite.internal.Bagel.renderID, game);
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        touching: {
                            category: {
                                mouse: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "text"
                                        ],
                                        obArg: true,
                                        args: {
                                            box: {
                                                required: false,
                                                types: ["object"],
                                                subcheck: {
                                                    x: {
                                                        required: true,
                                                        types: ["number"],
                                                        description: "The x position of the middle of the bounding box."
                                                    },
                                                    y: {
                                                        required: true,
                                                        types: ["number"],
                                                        description: "The y position of the middle of the bounding box."
                                                    },
                                                    width: {
                                                        required: true,
                                                        types: ["number"],
                                                        description: "The width of the bounding box."
                                                    },
                                                    height: {
                                                        required: true,
                                                        types: ["number"],
                                                        description: "The height of the bounding box."
                                                    }
                                                },
                                                description: "The bounding box to be used. If unspecified, the sprite's width, height, x and y coordinates will be used to make one."
                                            },
                                            mouseSize: {
                                                required: false,
                                                default: 0,
                                                types: ["number"],
                                                description: "The size of the bounding box for the mouse. Defaults to one pixel."
                                            },
                                            mode: {
                                                required: false,
                                                default: "touching",
                                                check: value => {
                                                    if (! ["touching", "overlap"].includes(value)) {
                                                        return "Huh, looks like you used an invalid option for the \"mode\" argument. It can only be \"touching\" or \"overlap\" and you put " + JSON.stringify(value) + ".";
                                                    }
                                                },
                                                description: "The touching mode. Defaults to \"touching\" but can also be \"overlap\"."
                                            }
                                        },
                                        fn: (me, args, game) => {
                                            if (args.box == null) {
                                                // Make a bounding box
                                                args.box = {
                                                    x: me.x - Math.abs(me.width / 2),
                                                    y: me.y - Math.abs(me.height / 2),
                                                    width: Math.abs(me.width),
                                                    height: Math.abs(me.height)
                                                };
                                            }
                                            else {
                                                args.box.x -= (me.width / 2);
                                                args.box.y -= (me.height / 2);
                                            }
                                            if (args.mode == "touching") { // Expand it slightly
                                                args.box.width += 2;
                                                args.box.height += 2;
                                                args.box.x--;
                                                args.box.y--;
                                            }
                                            let halfInputSize = args.mouseSize / 2;

                                            let inputs;
                                            if (Bagel.device.is.touchscreen) {
                                                inputs = game.input.touch.touches;
                                            }
                                            else {
                                                inputs = [{
                                                    x: game.input.mouse.x,
                                                    y: game.input.mouse.y
                                                }];
                                            }

                                            let rect = args.box;
                                            for (let i in inputs) {
                                                let input = inputs[i];
                                                if (input.x - halfInputSize < rect.x + rect.width) {
                                                    if (input.x + halfInputSize > rect.x) {
                                                        if (input.y - halfInputSize < rect.y + rect.height) {
                                                            if (input.y + halfInputSize > rect.y) {
                                                                me.last.collision = {
                                                                    x: input.x,
                                                                    y: input.y,
                                                                    type: "mouse"
                                                                };
                                                                return true;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            return false;
                                        }
                                    }
                                },
                                mouseCircles: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "text"
                                        ],
                                        obArg: true,
                                        args: {
                                            radius: {
                                                required: false,
                                                types: ["number"],
                                                description: "The radius of the bounding box. If unspecified, the sprite's width and height will be used to make one."
                                            },
                                            mouseRadius: {
                                                required: false,
                                                default: 1,
                                                types: ["number"],
                                                description: "The radius of the bounding box for the mouse. Defaults to one pixel."
                                            },
                                            mode: {
                                                required: false,
                                                default: "overlap",
                                                check: value => {
                                                    if (! ["touching", "overlap"].includes(value)) {
                                                        return "Huh, looks like you used an invalid option for the \"mode\" argument. It can only be \"touching\" or \"overlap\" and you put " + JSON.stringify(value) + ".";
                                                    }
                                                },
                                                description: "The touching mode. Defaults to \"overlap\" but can also be \"touching\"."
                                            }
                                        },
                                        fn: (me, args, game) => {
                                            let box = {
                                                x: me.x,
                                                y: me.y
                                            };
                                            if (args.radius == null) {
                                                // Make a bounding box
                                                box.radius = Math.max(Math.abs(me.width), Math.abs(me.height)) / 2;
                                            }
                                            else {
                                                box.radius = args.radius;
                                            }
                                            if (args.mode == "touching") { // Expand it slightly
                                                box.radius++;
                                            }

                                            let inputs;
                                            if (Bagel.device.is.touchscreen) {
                                                inputs = game.input.touch.touches;
                                            }
                                            else {
                                                inputs = [{
                                                    x: game.input.mouse.x,
                                                    y: game.input.mouse.y
                                                }];
                                            }

                                            let minDistance = args.mouseRadius + box.radius;
                                            for (let i in inputs) {
                                                let input = inputs[i];
                                                if (Math.sqrt(Math.pow(Math.abs(box.x - input.x), 2) + Math.pow(Math.abs(box.y - input.y), 2)) <= minDistance) {
                                                    me.last.collision = {
                                                        x: input.x,
                                                        y: input.y,
                                                        type: "mouse"
                                                    };
                                                    return true;
                                                }
                                            }
                                            return false;
                                        }
                                    }
                                },
                                sprite: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "text"
                                        ],
                                        obArg: false,
                                        args: {
                                            sprite: {
                                                required: true,
                                                types: ["string"],
                                                description: "The id of the sprite to check against for a collision."
                                            },
                                            options: {
                                                required: false,
                                                default: {},
                                                subcheck: {
                                                    box: {
                                                        required: false,
                                                        types: ["object"],
                                                        subcheck: {
                                                            x: {
                                                                required: true,
                                                                types: ["number"],
                                                                description: "The x position of the middle of the bounding box."
                                                            },
                                                            y: {
                                                                required: true,
                                                                types: ["number"],
                                                                description: "The y position of the middle of the bounding box."
                                                            },
                                                            width: {
                                                                required: true,
                                                                types: ["number"],
                                                                description: "The width of the bounding box."
                                                            },
                                                            height: {
                                                                required: true,
                                                                types: ["number"],
                                                                description: "The height of the bounding box."
                                                            }
                                                        },
                                                        description: "The bounding box to be used. If unspecified, the sprite's width, height, x and y coordinates will be used to make one."
                                                    },
                                                    mode: {
                                                        required: false,
                                                        default: "overlap",
                                                        types: ["string"],
                                                        check: value => {
                                                            if (! ["touching", "overlap"].includes(value)) {
                                                                return "Huh, looks like you used an invalid option for the \"mode\" argument. It can only be \"touching\" or \"overlap\" and you put " + JSON.stringify(value) + ".";
                                                            }
                                                        },
                                                        description: "The touching mode. Defaults to \"overlap\" but can also be \"touching\"."
                                                    },
                                                    include: {
                                                        required: false,
                                                        default: {},
                                                        types: ["object"],
                                                        subcheck: {
                                                            clones: {
                                                                required: false,
                                                                default: true,
                                                                types: ["boolean"],
                                                                description: "If this collision check includes clones or not."
                                                            },
                                                            invisibles: {
                                                                required: false,
                                                                default: false,
                                                                types: ["boolean"],
                                                                description: "If this collision check includes invisible sprites or not."
                                                            }
                                                        },
                                                        description: "A few options for whether or not some sprites should be included in the checks."
                                                    }
                                                },
                                                types: ["object"],
                                                description: "A few other options for this function."
                                            },
                                            check: {
                                                required: false,
                                                types: ["function"],
                                                description: "A function that does an additional check before a collision is reported. It's given the sprite that's being checked against, the current sprite and the game. (in that order)"
                                            }
                                        },
                                        fn: (me, args, game) => {
                                            if (args.options.box == null) {
                                                // Make a bounding box
                                                args.options.box = {
                                                    x: me.x - Math.abs(me.width / 2),
                                                    y: me.y - Math.abs(me.height / 2),
                                                    width: Math.abs(me.width),
                                                    height: Math.abs(me.height)
                                                };
                                            }
                                            else {
                                                args.options.box.x -= (me.width / 2);
                                                args.options.box.y -= (me.height / 2);
                                            }
                                            let box = args.options.box;
                                            if (args.options.mode == "touching") { // Expand it slightly
                                                box.width += 2;
                                                box.height += 2;
                                                box.x--;
                                                box.y--;
                                            }

                                            let sprites = [args.sprite];
                                            let parent = Bagel.get.sprite(args.sprite, game);
                                            if (args.options.include.clones) {
                                                sprites.push(...parent.cloneIDs);
                                                let index = sprites.indexOf(me.id);
                                                if (index != -1) {
                                                    sprites.splice(index, 1);
                                                }
                                            }

                                            let passed = args.check == null;
                                            for (let i in sprites) {
                                                let sprite = game.get.sprite(sprites[i]);
                                                if (! args.options.include.invisibles) {
                                                    if (! sprite.visible) continue;
                                                }
                                                let leftX = sprite.x - Math.abs(sprite.width / 2);
                                                let topY = sprite.y - Math.abs(sprite.height / 2);
                                                if (box.x < leftX + Math.abs(sprite.width)) {
                                                    if (box.x + box.width > leftX) {
                                                        if (box.y < topY + Math.abs(sprite.height)) {
                                                            if (box.y + box.height > topY) {
                                                                if (args.check) {
                                                                    passed = args.check(sprite, me, game);
                                                                }
                                                                if (passed) {
                                                                    me.last.collision = {
                                                                        sprite: sprite,
                                                                        type: "sprite"
                                                                    };
                                                                    return true;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            return false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                listeners: {
                    prepState: (state, game) => {
                        let scripts = game.internal.scripts.index.sprites.init[state];
                        if (scripts == null) return;
                        for (let i in scripts) {
                            let sprite = scripts[i].sprite;
                            if (sprite.type == "sprite") {
                                if (sprite.img) {
                                    Bagel.get.asset.img(sprite.img, game, true); // Requesting it will trigger loading. The check argument is used because it could be a texture rather than an image asset
                                }
                            }
                            if (sprite.type == "text") {
                                if (sprite.bitmap) {
                                    game.get.asset.font(sprite.font);
                                }
                            }
                            if (sprite.request) {
                                if (sprite.request[state]) {
                                    for (let type in sprite.request[state]) {
                                        let singular = game.internal.combinedPlugins.types.assets[type];
                                        if (singular == null) {
                                            console.error("Oops, the (plural) asset type " + JSON.stringify(type) + " doesn't exist in this game.");
                                            console.log("These are the only types:");
                                            console.log(Object.keys(game.internal.combinedPlugins.types.assets).join("\n"));
                                            Bagel.internal.oops(game);
                                        }

                                        singular = singular.get;
                                        for (let i in sprite.request[state][type]) {
                                            Bagel.get.asset[singular](sprite.request[state][type][i], game, true); // Requesting it will trigger loading
                                        }
                                    }
                                }
                            }
                        }

                        // Pause all the audio
                        let snds = game.internal.assets.assets.snds;
                        if (snds) {
                            for (i in snds) {
                                snds[i].pause();
                            }
                        }
                    }
                }
            },
            vars: {
                audio: {
                    autoPlay: true, // We probably don't have it but assume we do for now
                    queue: [],
                    queueInputAction: (plugin, game) => {
                        ((plugin, game) => {
                            Bagel.internal.inputAction.queue(_ => {
                                setTimeout(_ => plugin.vars.audio.unmuteInputAction(plugin, game), 15);
                            });
                        })(plugin, game);
                    },
                    unmuteInputAction: (plugin, game) => {
                        let sprite = Bagel.get.sprite(".Internal.unmute", game, true);
                        if (sprite) {
                            let vars = sprite.vars;
                            if (vars.buttonClicked) {
                                let queue = plugin.vars.audio.queue;
                                if (queue.length == 0) {
                                    let snd = Bagel.get.asset.snd(".Internal.unmuteButtonClickUp", game); // Can be any sound, this is just to test for autoplay
                                    ((snd, vars, sprite, plugin) => {
                                        snd.play().catch(_ => {
                                            snd.pause();
                                            plugin.vars.audio.autoPlay = false;
                                        }).then(_ => {
                                            snd.pause();
                                            plugin.vars.audio.queue = [];
                                            plugin.vars.audio.autoPlay = true;
                                            sprite.img = ".Internal.unmuteButton"; // Change to the unmuted image
                                        }); // Play it
                                    })(snd, vars, sprite, plugin);
                                }
                                else {
                                    for (let i in queue) {
                                        let snd = Bagel.get.asset.snd(queue[i], game);
                                        ((snd, vars, sprite, plugin) => {
                                            snd.play().catch(_ => {
                                                snd.pause();
                                                plugin.vars.audio.autoPlay = false;
                                            }).then(_ => {
                                                plugin.vars.audio.queue = [];
                                                plugin.vars.audio.autoPlay = true;
                                                sprite.img = ".Internal.unmuteButton"; // Change to the unmuted image
                                            }); // Play it
                                        })(snd, vars, sprite, plugin);
                                    }
                                }
                                vars.buttonClicked = false;
                            }
                            plugin.vars.audio.queueInputAction(plugin, game);
                        }
                    },
                    createUnmute: (plugin, game) => {
                        if (! Bagel.get.sprite(".Internal.unmute", game, true)) { // Check if the button exists
                            plugin.vars.audio.queueInputAction(plugin, game);

                            // Create one instead
                            let where = "plugin Internal's function \"game.playSound\"";
                            game.add.asset.img({
                                id: ".Internal.unmuteButtonMuted",
                                src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUEAYAAADdGcFOAAAABmJLR0QA/wAAAAAzJ3zzAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5AUECgYpH/xRLwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAFGSURBVEhLpVbbtcMwCCs9d4brjbJzvVGmcD9clQBRIY4+mtgRWBZ+VB5LGCNjnEMkY1DMIdnA6PfPKtbjw4wg9HyusXeMMSrDiYhotI/gzpIPOugMPaauCcowBedCXUcM0NKPcfTVDiCyKjwT+vQBnqDCZqLzhDkQZ0uNimjPtm/7tof8cfHCEesM3q/wbTvje55zMD8GwKh66B1jmEKjk3/nRLY2FFaols4PdBdkDdaBXa7bpeZYFbcFAt7RX9wroAJtqXJPwPeO3oUTGNPaXZZD1zDa+vsLbM0/8dkSPe364l91dO5ebZMS83RrQvF2vJkmmHO99dabCD0Hs2PmqlAF4mx+7xyQXnU1oexrBPKxAx/OffmPEtjmyR1kE/SOvf57603P1W+8D2TA1TNnmLEjWAm9Y3rgf54xpAbyryOFF8SAzG9tVk73YdUDkgAAAABJRU5ErkJggg=="
                            }, where); // Load its image
                            game.add.asset.img({
                                id: ".Internal.unmuteButton",
                                src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUEAYAAADdGcFOAAAABmJLR0QA/wAAAAAzJ3zzAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5AUECgoeC/S7LAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAElSURBVEhLrZbREYQgDETNFaEdac3akTaR+2D2lODOBs/3w4gbWEJAbXiEu1LcY6YUkWRAa2je533e9YTbtE3bxBak44XgHJgZWsd1XMfY27Icy7EczDA3Sl5wY1lDCjMzM230Uz/mjWGC0g7duLu7x8i2FILBvLEYp2ALikbL/M346HAvAgSebdTVLdffx2fHv2Qweyp7yZZAMdpmstlibGm9JXpLs7peGoP/ks1YltcNvg01WNeEzkmsobf4GWSfpPqUaXr1gNXwB6/RgU9SpDdDvXqAa45w3kPIBGtrPdfdx/H7L17UoQbPFatro0zQnyEYi+OzzKX/Zp4aiihj5SxcEjWkYIdHG2Y7oYwBOQFAbZSBlLqFbSEzBtIGI+SvQ6IMRb66bmr2BeoT1QAAAABJRU5ErkJggg=="
                            }, where); // Load its image
                            game.get.asset.img(".Internal.unmuteButton"); // Trigger loading early

                            game.add.asset.snd({
                                id: ".Internal.unmuteButtonClick",
                                src: "data:audio/mpeg;base64,//OAxAAAAAAAAAAAAFhpbmcAAAAPAAAAAwAABBIAYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ////////////////////////////////////////////AAAAUExBTUUzLjk5cgRuAAAAAAAAAAA1CCQCzSEAAeAAAAQSSYAuqwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/zoMQAEnACyvdAAACoh3exu8jLeoIAgcKAgCAYLggCAIHCgIAhggGIPv5cEFg+D+sH/Lg4CHDHKHP/E4PghrBwMcEAQygY//BB3//+UBAEAx/KAhlAQcmYqIp0mTVUZDWGgyrJEUQYImG/BhWy0KoEQVVjZUyyAxi+zMxAcDuX+WiWnPTQwFZ4BkIgoSlO0HWRLRa6sZiyXtxgTnQ+IAlwFSpHstGDFzlpJ1J2pzS2mZiuluTRlbS2DUE23jTFgFMVrERfV4GUv7edHTZbTQ3CYA37KYccp4lAmlpzMpkEOspbRYs7LIi8j8MQbxBMzxd8NvvB7KbTgw4yl1W5P67sEQS7sYhl3Zx/ZbS7xUzi6X+TZJFYkkYszmT+NETCdJdz7uFIpTWyjsNSdyauojEpdBNNLm408Oz/87DE4loUgqsfmMAkgxuzs47j+VGWS1u8Uf913bjdZa8ehyAaaIu7EXJhhwZC4VK+0ifZr0F/j++Y/vHW6WVZwzAUWZ7FrTIbUonIxGL0OUt+9G5e5cXmm3gp+aBnEQfaROjKqF/Zl/ZQ+smaVSuk8zSmJNFZVG2Gv9BMO/dpccfkF6/er5y/LC67MYfWchq4/0fVrKAIu7lfHLva4zAQE2q//1VFBQEBKMzKuGAhVCgJqs+qAnVAVL/6vxmKMx///9VTqr/V9VXjMUZvgYCAQNP9YKrBX8S8ShsSgrEVZ0RBwRPg1Bp5U7rBUeGpUNiU78RBwRPUIoilTusFR4KqTEFNRTMuOTkuM6qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/zYMTZGtmybx/DGACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg=="
                            }, where);
                            game.add.asset.snd({
                                id: ".Internal.unmuteButtonClickUp",
                                src: "data:audio/mpeg;base64,//OAxAAAAAAAAAAAAFhpbmcAAAAPAAAABAAABMkATk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnfn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn/////////////////////////////////AAAAUExBTUUzLjk5cgRuAAAAAAAAAAA1CCQDLCEAAeAAAATJpqKjmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/zoMQAFogGux9BAAC6qruoVWtAv0iG8oCDgQcUBA4Jz8pLg+D+IAQd5cHwfB/rP/BAEDkoGPxACYPg+D5+GPUCAIA+/8HwQBAEAQBMH/h/8EAQBB3UCAPg+H/wQDH8HwfD8uD4Pg+qushml2hmlAYBrCAMEjTYbZgXKSJMQKAAkRyGgr9CoNCahLjLRnVAAhorQiAL13knoq8qAdYdH1rCt6FqmTC2dsHT1HCMoc2jWLUjdBRNoyJv4RMO0+0ZrvFNRFbrNnkWi/kVZar+lnZySwWwG4+ixJ1YkCQ+8pbp5BEMtK0x06WUrt+hjNymv+3B3YjhSwzfl+pU8dytnvDLdWPVbMpuUdPNWprdLVi9irfi0sqU17Ofj8Oyrct1AT9y2td13+c+7WpqbfJqlpatarGeX5Xf7rD/86DE0Up0bqMfmsAAw5zWN6btVKDKzU7yzzKbyps6amyrU1/uWWOOP8paa13k1DVLjTV7tumz7llnhjZyws6t1pfMyHcons7H42c6avS27mprVaNVbUzS/vdL3u/5l3+5fv7N/qaMNZRoSaM02g0LO2aTFcDsQUEAsfvVoGoStQqLLLRgFURCVLcDdYiz5huShkdWIiu/qVSyzERIxDHQ0pUtZNFTUECvRA6UymyVysMPMABBJfQHFAUZwC8TIEEyk3udBhrpMhGCRxJYZOULpBco1Sk7HGyX0/l6VsgUOZnGH2U2MI0A8GLUeKwWfCoQ8E0F/6BprcYalVlOdmj4tNyf6VXuLTLIuC/LorRbMhlMYw1BN2yzJs8dd2zGcZmTN3lUWlUzOQ3H4CpuPEw6G8qsZxtNxgFx//OwxNNQVC56/5jICGCqtSrclTdpucj0tjkRoKGIwTcd2njO6CtVptyqNXJuK0t2kpst61lv+a139Y6nN092prC19Ncls5QzfIlc3CL8BS+tasZXvm3RityJRaIxGw+0pj0Na7jvWWst/v//////UpprXcqYjJN1BQCkqkxBTUUzLjk5LjOqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/8xDE8QAAA/wBwAAAqqqqqqqqqqqqqqqqqg=="
                            }, where);
                            game.add.asset.snd({
                                id: ".Internal.unmuteButtonMouseTouch",
                                src: "data:audio/mpeg;base64,//OAxAAAAAAAAAAAAFhpbmcAAAAPAAAABAAABP0ASkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlfn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn/////////////////////////////////AAAAUExBTUUzLjk5cgRuAAAAAAAAAAA1CCQDKiEAAeAAAAT9uAw0pwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/zoMQAEjkqnedDMACyMBL0ufxEQvkRC3REREKgYACCEe7JpkEIy7Jp3Ed7Jp3vezyad7+9nkyd7BMmH8uf8Tg+8uD4f/l///Ln/5d//h///rB9//g+z7q7iFlKYTSjQDSknrKLQgSoGlObS2JMhgJeYvuY7AQqCdmwWOKDMmn7BoHzfVVVDBTsLMmppKqLp0vOKCTvSCZkpdHXbYjEnpVuWSqo6TdY6z5ur2PA3FrEqV1EYgu8tyumPPoyarCXtXFGr8QhiZqr8pX8uxX4koFKn9eB8HDaw7rWJFKXioqVfzRW6vxFrMeu5RKAaDjxU8JmvtRDCV2s7eEsvZyCV49gGxGsaOrQvzT1XFsZczpYai2PYeyq3GyRSXSh3n8sSyN237rWKSKdhqLdhtiVC9kzIIlEpq69DRb/86DE406karb/mMAFHbtWq4NWxKsdSq9Wpq3JuxT27ff5X7T3+U+X2/yntXm4vk5WpFjMzsGWX6qVJdG5dlTRyHoL7Wz/Gl7rKm3KvrV8cfpr8Zw5vm+/vt/G9V5re6lXCtV5KptKs5xLtdN7LRLNNperiCirq5ChNOZN0QkNyLgShrjSgaOXwEQpl1LzMZFtXeJAWG2ugwCMCNzUA833wAgJFXiAwSlUnkYugAJmMGF1gGAPCykUA0eGnu4YEOjRSYWOGAildqzYmsuUy5iUvmJQAQcyg7MCIzJAUw00r8huy/cNv9U28b9Oy0iBBCHGPhRiiWYIThCaZeuGOoyQ7WYu15yXHdWd9Z6msOrSf+Mpywm2TF6mlNJAaDCEAQJmBCbMc6sImYkzqn5TydmE5FtTFmXQHCpN//PAxNRcDG6O/5nYDVKDH5bfR9WU0pr5ggqBA8oDTAQqCi/xcpSpqVz8LlBLOfbs5VZXujdmZpdX5qLSKjpb0upn9qw66lmtflMqp05X1a6/rouqyKIwwBQqKvq+Evp6ksmbcY7m78VoYzhVr5T7cG3l0W5dptdpH/ll+zVtWfx5LUJyri9r6yHdWgjThQG12U2M5TSRrGgXNn3///3/P////99pfGdgs1VMQU1FVUxBTUUzLjk5LjNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MQxPIAAAP8AcAAAFVVVVVVVVVVVVVVVVU="
                            }, where);

                            let size = Math.min(game.width, game.height) / 10;
                            game.add.sprite({
                                id: ".Internal.unmute", // We can use this as we're that plugin
                                type: "sprite",
                                img: ".Internal.unmuteButtonMuted", // It just won't show until the asset's loaded
                                visible: false,
                                scripts: {
                                    steps: {
                                        appearAnimation: me => {
                                            if (me.vars.delay < 30) {
                                                me.vars.delay++;
                                            }
                                            else {
                                                me.visible = true;
                                                if (me.width != me.vars.size) {
                                                    me.width *= 1.4;

                                                    if (me.width >= me.vars.size) {
                                                        me.width = me.vars.size;
                                                        me.vars.appearAnimation = false;
                                                    }
                                                    me.height = me.width;
                                                }
                                            }
                                        },
                                        deleteAnimation: me => {
                                            me.width /= 1.4;
                                            me.height = me.width;
                                            if (me.width < 1) {
                                                me.delete(); // Bye
                                            }
                                        },
                                        expandAnimation: me => {
                                            me.width *= 1.025;
                                            if (me.width > me.vars.expandedSize) {
                                                me.width = me.vars.expandedSize;
                                            }
                                            me.height = me.width;
                                        },
                                        shrinkAnimation: me => {
                                            if (me.width != me.vars.size) {
                                                me.width /= 1.025;
                                                if (me.width < me.vars.size) {
                                                    me.width = me.vars.size;
                                                }
                                                me.height = me.width;
                                            }
                                            if (me.vars.plugin.vars.audio.autoPlay) { // Unmuted
                                                me.vars.delete = true;
                                            }
                                        },
                                        play: me => {
                                            me.vars.buttonClicked = true;
                                        },
                                        pause: me => {
                                            let vars = me.vars.plugin.vars;
                                            for (let id in game.internal.assets.assets.snds) {
                                                let snd = game.internal.assets.assets.snds[id];
                                                if (! snd.paused) {
                                                    snd.pause();
                                                    if (snd.loop || snd.duration >= 5) { // It's probably important instead of just a sound effect. Queue it
                                                        vars.audio.queue.push(id);
                                                    }
                                                    else {
                                                        snd.currentTime = 0;
                                                    }
                                                }
                                            }
                                            vars.audio.autoPlay = false;
                                            me.img = ".Internal.unmuteButtonMuted"; // Change to the unmuted image
                                        }
                                    },
                                    all: [
                                        (me, game, step) => {
                                            me.layer.bringToFront();
                                            if (me.vars.appearAnimation) {
                                                step("appearAnimation");
                                            }
                                            else {
                                                if (! game.input.mouse.down) {
                                                    if (me.vars.clicked) {
                                                        game.playSound(".Internal.unmuteButtonClickUp");
                                                    }
                                                    me.vars.clicked = false;
                                                }

                                                let vars = me.vars.plugin.vars;
                                                if (me.vars.delete) {
                                                    step("deleteAnimation");
                                                }
                                                else {
                                                    if (me.touching.mouseCircles()) {
                                                        if (! me.vars.touching) {
                                                            game.playSound(".Internal.unmuteButtonMouseTouch");
                                                            me.vars.touching = true;
                                                        }
                                                        if (me.width != me.vars.expandedSize) {
                                                            step("expandAnimation");
                                                        }
                                                        if (game.input.mouse.down && (! me.vars.clicked)) {
                                                            game.playSound(".Internal.unmuteButtonClick");
                                                            if (vars.audio.autoPlay) {
                                                                step("pause");
                                                            }
                                                            else {
                                                                step("play");
                                                            }
                                                            me.vars.clicked = true;
                                                        }
                                                    }
                                                    else {
                                                        me.vars.touching = false;
                                                        step("shrinkAnimation");
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                                vars: {
                                    plugin: plugin,
                                    size: size,
                                    expandedSize: size * 1.1,
                                    delay: 0,
                                    clicked: false,
                                    delete: false,
                                    touching: false,
                                    appearAnimation: true,
                                    buttonClicked: false
                                },
                                x: size,
                                y: game.height - size,
                                width: 1,
                                height: 1,
                            }, "plugin Internal, function \"game.playSound\" (via Game.add.sprite)");
                        }
                    }
                },
                sprite: {
                    updateAnchors: (sprite, x, y) => {
                        let properties = sprite.internal.Bagel.properties;
                        if (x && properties.x != "centered") {
                            x = properties.x;
                            let half = Math.abs((properties.hasOwnProperty("width")? properties.width : sprite.width) / 2);
                            if (isNaN(half)) {
                                properties.left = x;
                                properties.right = x;
                            }
                            else {
                                properties.left = x - half;
                                properties.right = x + half;
                            }
                        }
                        if (y && properties.y != "centered") {
                            y = properties.y;
                            let half = Math.abs((properties.hasOwnProperty("height")? properties.height : sprite.height) / 2);
                            if (isNaN(half)) {
                                properties.top = y;
                                properties.bottom = y;
                            }
                            else {
                                properties.top = y - half;
                                properties.bottom = y + half;
                            }
                        }
                    },
                    resetCrop: (sprite, img) => {
                        let crop = sprite.internal.Bagel.properties.crop;
                        crop.x = 0;
                        crop.y = 0;
                        crop.width = img.width;
                        crop.height = img.height;

                        sprite.internal.renderUpdate = true;
                        sprite.internal.crop = false;
                    }
                },
                font: {
                    characterSets: {
                        "66": "abcdefghijklmnopqrstuvwxyz0123456789?!£$%^&*()+-_=:;'\".,/\\><~|[]{}"
                    },
                    top: {
                        "'": 1,
                        "\"": 1,
                        "^": 1,
                        "*": 1
                    },
                    bottom: {
                        ".": 1,
                        ",": 1,
                        "_": 1
                    },
                    prerender: (sprite, plugin, half) => {
                        let game = sprite.game;
                        let renderer = game.internal.renderer;
                        let scaleX = renderer.scaleX;
                        let scaleY = renderer.scaleY;

                        let internal = sprite.internal;
                        let clearCache = half || internal.lines == null;
                        let indexes = clearCache? null : internal.indexes;
                        let canvas = internal.canvas;
                        let ctx = internal.ctx;

                        let output = sprite.bitmap?
                            plugin.vars.font.prerenderBitmap(clearCache? sprite.text.split("\n") : internal.lines, sprite, scaleX, scaleY, plugin, canvas, ctx, half, indexes)
                            : plugin.vars.font.prerenderNonBitmap(sprite.text.split("\n"), sprite, scaleX, scaleY, canvas, ctx, half, clearCache? null : internal.lines);
                        if (output) {
                            if (sprite.bitmap) {
                                internal.indexes = output[0];
                                internal.lines = output[1];
                            }
                            else {
                                internal.lines = output;
                            }
                        }

                        if (canvas.width == 0) { // No text, having a texture this small would cause an error
                            canvas = game.internal.renderer.blankTexture;
                        }
                        Bagel.internal.render.texture.update(internal.canvasID, canvas, game);
                        plugin.vars.sprite.updateAnchors(sprite, true, true);
                        internal.renderUpdate = true;
                    },
                    prerenderBitmap: (lines, sprite, scaleX, scaleY, plugin, canvas, ctx, half, indexes) => {
                        let asset = sprite.game.get.asset.font(sprite.font);
                        let characterSet = plugin.vars.font.characterSets[asset.widths.length];

                        let maxWidth = 0;
                        let wordWrapWidth = sprite.wordWrapWidth;
                        let min = Math.max(asset.widths) * 2.5;
                        if (wordWrapWidth != null && wordWrapWidth < min) {
                            wordWrapWidth = min;
                        }
                        let scale = (sprite.size / ((asset.avgWidth + asset.avgHeight) / 2)) / 2;
                        wordWrapWidth /= scale * 2;

                        let canvasWidth, canvasHeight;
                        if (indexes) {
                            canvasWidth = sprite.width / scale;
                            canvasHeight = sprite.height / scale;
                        }
                        else {
                            indexes = [];
                            let i = 0;
                            let totalWidth;
                            while (i < lines.length) {
                                indexes.push([]);
                                totalWidth = 0;
                                let text = lines[i].toLowerCase();
                                let wordFitted = false;
                                let wordWidth = 0;
                                let wordLength = 0;
                                for (let c in text) {
                                    let character = text[c];

                                    let index = characterSet.indexOf(character);
                                    let charWidth = character == " "? asset.avgWidth : (asset.widths[index] + Math.ceil(asset.avgWidth / 4));
                                    if (wordWrapWidth != null && totalWidth + charWidth > wordWrapWidth) {
                                        if (wordFitted) {
                                            totalWidth -= wordWidth;
                                            let newLine = text.slice(c - wordLength);
                                            if (newLine[0] == " ") {
                                                newLine.split("").splice(0, 1).join("");
                                            }
                                            lines.splice(i + 1, 0, newLine);
                                            lines[i] = lines[i].split("").splice(0, c - wordLength).join("");
                                        }
                                        else {
                                            let thisLine = "";
                                            totalWidth -= wordWidth;
                                            let dashIndex = characterSet.indexOf("-");
                                            totalWidth += asset.widths[dashIndex] + Math.ceil(asset.avgWidth / 4);
                                            c -= wordLength;
                                            let a = c;
                                            while (c < text.length) {
                                                let charWidth = asset.widths[indexes[i][c]] + Math.ceil(asset.avgWidth / 4);
                                                if (totalWidth + charWidth > wordWrapWidth) {
                                                    break;
                                                }
                                                thisLine += text[c];
                                                totalWidth += charWidth;
                                                c++;
                                            }
                                            thisLine += "-";
                                            indexes[i].splice(c);
                                            indexes[i].push(dashIndex);
                                            lines[i] = thisLine;
                                            lines.push(text.slice(c));
                                        }
                                        break;
                                    }

                                    if (character == " ") {
                                        totalWidth += charWidth;
                                        indexes[i].push(-1);
                                        wordFitted = true;
                                        wordWidth = asset.avgWidth;
                                        wordLength = 0;
                                        if (totalWidth > maxWidth) maxWidth = totalWidth;
                                    }
                                    else {
                                        totalWidth += charWidth;
                                        wordWidth += charWidth;
                                        if (index == -1) {
                                            console.error(
                                                "Oh no! The text sprite "
                                                + JSON.stringify(sprite.id)
                                                + " tried to use the character "
                                                + JSON.stringify(character)
                                                + ". The "
                                                + (sprite.font == ".Internal.defaultFont"? "default font" : JSON.stringify(sprite.font))
                                                + " only supports these characters:\n" + characterSet
                                            );
                                            Bagel.internal.oops(sprite.game);
                                        }
                                        indexes[i].push(index);
                                        wordLength++;
                                    }
                                }

                                if (totalWidth > maxWidth) maxWidth = totalWidth;
                                i++;
                            }

                            canvasWidth = maxWidth * 2;
                            canvasHeight = asset.maxHeight * lines.length * 2;
                        }

                        sprite.width = canvasWidth * scale;
                        sprite.height = canvasHeight * scale;
                        if (half) return [indexes, lines];

                        canvas.width = canvasWidth;
                        canvas.height = canvasHeight;
                        ctx.fillStyle = sprite.color;

                        let y = 0;
                        for (let i in lines) {
                            let x = 0;
                            let text = lines[i];
                            for (let b in text) {
                                let character = text[b];
                                if (character == " ") {
                                    x += asset.avgWidth * 2;
                                }
                                else {
                                    let index = indexes[i][b];
                                    let c = asset.starts[index];
                                    let width = asset.widths[index];
                                    let height = asset.heights[index];
                                    let a = 0;
                                    let len = width * height;

                                    let startY = (asset.maxHeight / 2) - (height / 2);
                                    if (plugin.vars.font.top[character]) {
                                        startY = 0;
                                    }
                                    if (plugin.vars.font.bottom[character]) {
                                        startY = asset.maxHeight - height;
                                    }
                                    startY += y;

                                    while (a < len) {
                                        if (asset.pixels[c] == "1") {
                                            ctx.fillRect(
                                                ((a % width) * 2) + x,
                                                Math.floor((Math.floor(a / width) + startY) * 2),
                                                2, 2
                                            );
                                        }
                                        a++;
                                        c++;
                                    }

                                    x += (asset.widths[index] + Math.ceil(asset.avgWidth / 4)) * 2;
                                }
                            }
                            y += asset.maxHeight;
                        }
                    },
                    prerenderNonBitmap: (lines, sprite, scaleX, scaleY, canvas, ctx, half, wrappedLines) => {
                        let last = sprite.internal.last;
                        ctx.font = sprite.size + "px " + sprite.font;
                        let size = (ctx.measureText("M").width * 1.5) * scaleY;
                        let wordWrapWidth = sprite.wordWrapWidth;
                        let min = ctx.measureText("M").width * 2;
                        if (wordWrapWidth != null && wordWrapWidth < min) {
                            wordWrapWidth = min;
                        }

                        if (wrappedLines) {
                            lines = wrappedLines;
                            canvas.width = sprite.width * scaleX; // It's not affected by scaling
                            canvas.height = sprite.height * scaleY;
                        }
                        else {
                            let width = 0;
                            let i = 0;
                            while (i < lines.length) {
                                let words = lines[i].split(" ");
                                let space = ctx.measureText(" ").width;
                                let currentWidth = 0;
                                let wordFitted = false;
                                for (let c in words) {
                                    let wordWidth = ctx.measureText(words[c]).width;
                                    currentWidth += wordWidth;
                                    if (wordWrapWidth != null && currentWidth > wordWrapWidth) { // Wrap it
                                        currentWidth -= wordWidth;
                                        if (wordFitted) {
                                            lines.splice(i + 1, 0, words.slice(c).join(" "));
                                            words.splice(c, words.length - c);
                                            lines[i] = words.join(" ");
                                        }
                                        else { // Need to break up the word, otherwise the line would be blank
                                            let thisLine = "";
                                            currentWidth += ctx.measureText("-").width;
                                            let a;
                                            for (a in words[c]) {
                                                let charWidth = ctx.measureText(words[c][a]).width;
                                                if (currentWidth + charWidth > wordWrapWidth) {
                                                    break;
                                                }
                                                thisLine += words[c][a];
                                                currentWidth += charWidth;
                                            }
                                            thisLine += "-";
                                            lines.splice(i + 1, 0, words.slice(c).join(" ").slice(a));
                                            words.splice(c, words.length - c);
                                            lines[i] = words.join(" ") + thisLine;
                                        }
                                        break;
                                    }
                                    wordFitted = true;
                                    if (c != words.length - 1) {
                                        currentWidth += space;
                                    }
                                }
                                if (currentWidth > width) width = currentWidth;
                                i++;
                            }
                            sprite.width = Math.round(width);
                            sprite.height = Math.round((Math.ceil(size) * lines.length) / scaleY);
                            last.scaleX = scaleX;
                            last.scaleY = scaleY;
                            if (half) return lines;

                            canvas.width = width * scaleX; // It's not affected by scaling
                            canvas.height = sprite.height * scaleY;
                        }


                        ctx.font = sprite.size + "px " + sprite.font;
                        ctx.fillStyle = sprite.color;

                        ctx.textBaseline = "middle";
                        ctx.scale(scaleX, scaleY);
                        let offset = Math.ceil(size) / 2;
                        for (let i in lines) {
                            ctx.fillText(lines[i], 0, (offset + (Math.ceil(size) * i)) / scaleY);
                        }
                        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the scaling
                    },
                }
            }
        },
        loadPlugin: (plugin, game, args, index) => {
            let subFunctions = Bagel.internal.subFunctions.loadPlugin;
            plugin = Bagel.internal.deepClone(plugin); // Create a copy of the plugin
            let current = Bagel.internal.current;
            Bagel.internal.saveCurrent();
            current.plugin = plugin;

            plugin.args = args;
            if (plugin.plugin) {
                if (plugin.plugin.scripts) {
                    if (plugin.plugin.scripts.preload) plugin.plugin.scripts.preload(plugin, game, Bagel.step.plugin.scripts);
                }
            }
            plugin = subFunctions.check(game, plugin, index);
            plugin.args = Bagel.internal.deepClone(args);

            // Combine all the plugins into one plugin
            let merge = subFunctions.merge;
            merge.types.assets(game, plugin);
            merge.types.sprites(game, plugin);

            merge.methods(game, plugin);
            if (plugin.plugin.scripts.init) plugin.plugin.scripts.init(plugin, game, Bagel.step.plugin.scripts);
            merge.listeners(game, plugin);
            game.internal.plugins[plugin.info.id] = plugin;
            Bagel.internal.loadCurrent();
        },
        loadAsset: (asset, game, type, where, i, forceLoad, dontLoad) => {
            let current = Bagel.internal.current;

            Bagel.internal.saveCurrent();
            current.asset = asset;
            current.assetType = type;
            current.i = i;
            current.where = where;
            current.game = game;

            let assetLoader = game.internal.combinedPlugins.types.assets[type];
            if (assetLoader == null) {
                console.warn("The asset type " + JSON.stringify(type) + " doesn't appear to exist for this game. You might want to check that the plugin that adds it's been loaded. In the game " + JSON.stringify(game.id) + ".game.assets." + type + " item " + i + ".");
                return;
            }
            let loadNow = game.config.loading.mode != "dynamic" || forceLoad || assetLoader.forcePreload && (! dontLoad);
            let plugin = assetLoader.internal.plugin;
            current.plugin = plugin;

            let assets = game.internal.assets;

            if (assets.assets[type] == null) assets.assets[type] = {};

            asset = Bagel.check({
                ob: asset,
                where: where,
                syntax: assetLoader.internal.args
            }, Bagel.internal.checks.disableArgCheck);
            let error;
            if (assetLoader.check) {
                error = assetLoader.check(asset, game, Bagel.internal.check, plugin, i);
            }

            if (error) {
                Bagel.internal.loadCurrent();

                console.error(error);
                console.log("In plugin " + JSON.stringify(plugin.info.id) + ".");
                Bagel.internal.oops(game);
            }

            let ready = ((assetJSON, game, type) => asset => {
                let assets = game.internal.assets;
                let combinedPlugins = game.internal.combinedPlugins;
                let plural = combinedPlugins.types.internal.pluralAssetTypes[combinedPlugins.types.assets[type].get];

                assets.loadingIDs[plural][assetJSON.id] = false; // Not loading anymore
                assets.assets[plural][assetJSON.id] = asset;
                assets.loaded++;
                assets.loading--;
                if (assets.toLoad[plural]) {
                    if (assets.toLoad[plural][assetJSON.id]) {
                        delete assets.toLoad[plural][assetJSON.id]; // Doesn't need loading anymore
                    }
                }
                if (assets.loading == 0) {
                    if (game.config.loading.skip) {
                        game.loaded = true;
                        Bagel.internal.subFunctions.init.onload(game);
                    }
                }
            })(asset, game, type); // This is called by the init function once the asset has loaded
            let set;
            if (assetLoader.set) {
                set = ((assetJSON, game, ready, handler, type, i, where) => asset => {
                    Bagel.internal.saveCurrent();
                    let current = Bagel.internal.current;
                    current.plugin = handler.internal.plugin;
                    current.pluginProxy = true;
                    current.game = game;
                    current.asset = assetJSON;
                    current.assetType = type;
                    current.i = i;
                    current.where = where;

                    let output = assetLoader.set(asset, assetJSON, ready, game, handler.internal.plugin);
                    if (output) {
                        console.error(output);
                        Bagel.internal.oops(game);
                    }
                    Bagel.internal.loadCurrent();
                })(asset, game, ready, assetLoader, type, i, where);
            }

            if (loadNow) {
                let combinedPlugins = game.internal.combinedPlugins;
                let plural = combinedPlugins.types.internal.pluralAssetTypes[combinedPlugins.types.assets[type].get];

                assets.loading++;
                if (assets.loadingIDs[plural] == null) assets.loadingIDs[plural] = {};
                assetLoader.init(asset, set? set : ready, game, assetLoader.internal.plugin, i);
                assets.loadingIDs[plural][asset.id] = true; // It's currently loading
            }
            else {
                let toLoad = game.internal.assets.toLoad;
                if (toLoad[type] == null) toLoad[type] = {};
                toLoad[type][asset.id] = {
                    ready: ready,
                    set: set,
                    asset: asset,
                    assetLoader: assetLoader,
                    i: i,
                    where: where,
                    game: game
                }; // Queue it to be loaded
            }

            Bagel.internal.loadCurrent();
        },
        createSprite: (sprite, game, parent, where, noCheck, idIndex) => {
            let subFunctions = Bagel.internal.subFunctions.createSprite;
            let combined = game.internal.combinedPlugins;
            if (parent) {
                if (sprite.type) {
                    if (sprite.type != parent.type) {
                        console.error("Oops, clones have to have the same type as the parent. You can fix this by removing the \"type\" argument for this clone. If it needs to be that type, you should make a different parent for creating clones of that type.");
                        Bagel.internal.oops(game);
                    }
                }
                sprite.type = parent.type; // Their types must be the same
            }
            else {
                sprite.type = sprite.type == null? combined.defaults.sprites.type : sprite.type; // If the sprite type isn't specified, default to default agreed by the plugins
            }
            let handler = combined.types.sprites[sprite.type];
            if (handler == null) {
                let spriteTypes = Object.keys(combined.types.sprites);
                if (! spriteTypes.includes(sprite.type)) {
                    if (sprite.id) {
                        console.error("Oops, you used an invalid sprite type. You tried to use " + JSON.stringify(sprite.type) + " for the sprite " + JSON.stringify(sprite.id) + ". It can only be one of these:\n" + spriteTypes.reduce((total, value) => total + "  • " + JSON.stringify(value) + " -> " + combined.types.sprites[value].description + "\n", ""));
                    }
                    else {
                        if (idIndex) {
                            console.error("Oops, you used an invalid sprite type. You tried to use " + JSON.stringify(sprite.type) + " for sprite " + idIndex + ". It can only be one of these:\n" + spriteTypes.reduce((total, value) => total + "  • " + JSON.stringify(value) + " -> " + combined.types.sprites[value].description + "\n", ""));
                        }
                        else {
                            console.error("Oops, you used an invalid sprite type. You tried to use " + JSON.stringify(sprite.type) + ". It can only be one of these:\n" + spriteTypes.reduce((total, value) => total + "  • " + JSON.stringify(value) + " -> " + combined.types.sprites[value].description + "\n", ""));
                        }
                    }
                    Bagel.internal.oops(game);
                }
            }

            let current = Bagel.internal.current;
            let currentPluginID = current.plugin? current.plugin.info.id : null;
            Bagel.internal.saveCurrent();
            current.sprite = sprite;
            current.game = game;
            current.plugin = handler.internal.plugin;

            if (! noCheck) {
                current.pluginProxy = true;
                sprite = subFunctions.check(sprite, game, parent, where, currentPluginID);
                Bagel.internal.current.pluginProxy = false; // It might have been set to a new object
            }
            sprite.internal = {
                Bagel: {
                    scripts: {
                        init: [],
                        main: [],
                        all: []
                    },
                    rerunListeners: [],
                    rerunIndex: {},
                    rendererNotInitialized: true,
                    onVisibleTriggered: false,
                    onVisibleTriggeredBefore: false,
                    onInvisibleTriggered: false,
                    renderID: null,
                    actingPlugin: Bagel.internal.getActingPluginId(true)
                },
                dontClone: true
            };

            sprite.cloneIDs = [];
            sprite.cloneCount = 0;
            sprite.isClone = (!! parent);
            sprite.idIndex = idIndex;
            let register = subFunctions.register;

            current = Bagel.internal.current; // It might have been set to a new object
            subFunctions.extraChecks(sprite, game, where, idIndex);
            current.pluginProxy = true;
            register.scripts("init", sprite, game, parent);
            register.scripts("main", sprite, game, parent);
            register.scripts("all", sprite, game, parent);
            register.methods(sprite, game);
            current.pluginProxy = false;
            register.listeners(sprite, game, parent);

            game.internal.idIndex[sprite.id] = idIndex;

            sprite.debug = {
                renderTime: 0,
                scriptTime: 0
            };
            sprite.game = game;
            (me => {
                sprite.clone = clone => {
                    let parent = me;
                    let game = parent.game;
                    clone = clone? clone : {};

                    let spriteID;
                    if (clone.id == null) {
                        spriteID = Bagel.internal.findCloneID(parent, game);
                        clone.id = spriteID;
                    }
                    else {
                        spriteID = clone.id;
                    }

                    parent.cloneIDs.push(spriteID);
                    parent.cloneCount++;

                    let spriteIndex = Bagel.internal.findSpriteIndex(game);
                    clone = Bagel.internal.createSprite(clone, game, parent, "the function \"sprite.clone\"", false, spriteIndex);

                    game.game.sprites[spriteIndex] = clone;

                    Bagel.internal.current.sprite = clone;
                    for (let i in clone.scripts.init) {
                        clone.scripts.init[i](clone, game, Bagel.step.sprite);
                    }
                    for (let i in clone.scripts.main) {
                        clone.scripts.main[i](clone, game, Bagel.step.sprite);
                    }
                    Bagel.internal.current.sprite = parent;

                    return clone;
                };
                sprite.delete = _ => {
                    if (sprite.internal.actingPlugin && Bagel.internal.getActingPluginId() != sprite.internal.actingPlugin) {
                        console.error("Sorry, you can't delete sprites created as parts of plugins as it would likely cause issues.");
                        Bagel.internal.oops(me.game);
                    }
                    let game = me.game;
                    let remove = Bagel.internal.subFunctions.delete;

                    let current = Bagel.internal.current;
                    Bagel.internal.saveCurrent();
                    current.game = game;
                    current.sprite = sprite;

                    remove.event(me, game, current); // Calls the delete event
                    current.plugin = null;
                    remove.bitmapSprite(me, game);
                    remove.scripts("init", me, game);
                    remove.scripts("main", me, game);
                    remove.scripts("all", me, game);
                    remove.misc(me, game);

                    Bagel.internal.loadCurrent();
                };
                sprite.deleteClones = _ => {
                    let cloneIDs = [...sprite.cloneIDs];
                    for (let i in cloneIDs) {
                        if (cloneIDs[i]) {
                            let clone = game.get.sprite(cloneIDs[i], true);
                            if (clone) {
                                clone.delete();
                            }
                        }
                    }
                };
            })(sprite);

            subFunctions.init(sprite, game, subFunctions);

            Bagel.internal.loadCurrent();
            return sprite;
        },
        tick: _ => {
            Bagel.internal.current.mainLoop = true;
            let subFunctions = Bagel.internal.subFunctions.tick;

            let totalStart = new Date();
            if (document.readyState == "complete") {
                Bagel.internal.frameStartTime = performance.now();
                let start;
                if (window.requestIdleCallback) {
                    requestIdleCallback(subFunctions.calculateRenderTime);
                }
                else {
                    setTimeout(subFunctions.calculateRenderTime, 0);
                }
                for (let i in Bagel.internal.games) {
                    start = performance.now();
                    let game = Bagel.internal.games[i];
                    Bagel.internal.current.game = game;

                    if (! game.config.isLoadingScreen) {
                        subFunctions.scaleCanvas(game);
                    }

                    let internal = game.internal;
                    let renderer = internal.renderer;
                    if (! internal.pluginsDone) {
                        if (internal.pluginsLoading == 0) {
                            Bagel.internal.subFunctions.init.onPluginsReady(game);
                            internal.pluginsDone = true;
                        }
                    }

                    if (internal.pluginsDone && ((! game.config.isLoadingScreen) || game.internal.mainGame.internal.pluginsDone)) {
                        if (internal.assets.initialized) {
                            if (game.state != internal.lastPrepState) {
                                if (internal.assets.loading == 0) {
                                    Bagel.internal.triggerPluginListener("prepState", game, game.state);
                                    if (internal.assets.loading == 0) {
                                        internal.lastPrepState = game.state;
                                    }
                                    else { // Something needs to load
                                        game.loaded = false;
                                        Bagel.internal.subFunctions.init.loadingScreen(game);
                                    }
                                }
                            }


                            if (game.loaded) {
                                if (subFunctions.loaded(game, start)) { // Loading screen triggered
                                    Bagel.internal.subFunctions.init.loadingScreen(game); // Init it
                                    subFunctions.loading(game);
                                }
                                if (renderer.type != "canvas") {
                                    game.scriptTime = performance.now() - start;
                                }
                            }
                            else {
                                Bagel.internal.subFunctions.init.loadingScreen(game);
                                subFunctions.loading(game);
                                game.scriptTime = performance.now() - start;
                            }

                            let configRenderer = game.config.display.renderer;
                            if (configRenderer != "auto" && renderer.type != configRenderer) {
                                if (renderer.type == "webgl") {
                                    renderer.gl.getExtension("WEBGL_lose_context").loseContext();
                                    let slots = renderer.textureMaps;
                                    for (let i in slots) {
                                        if (slots[i].gl) {
                                            slots[i].gl.getExtension("WEBGL_lose_context").loseContext();
                                        }
                                    }
                                }
                                renderer.type = configRenderer;
                                console.error("Renderers currently can't be switched for active games.");
                            }
                        }
                        else {
                            if ((! internal.loadingScreen) || internal.loadingScreen.loaded) {
                                Bagel.internal.subFunctions.init.assets(game);
                            }
                        }
                    }

                    let now = performance.now();
                    game.internal.FPSFrames++;
                    if (now - game.internal.lastFPSUpdate >= 1000) {
                        game.currentFPS = game.internal.FPSFrames;
                        game.internal.FPSFrames = 0;
                        game.internal.lastFPSUpdate = now;
                    }

                    let mo = game.input.touchScrollMomentum;
                    game.input.scrollDelta.x = mo.x;
                    game.input.scrollDelta.y = mo.y;
                    let multiplier = game.config.input.touch.scroll.momentum;
                    mo.x *= multiplier;
                    mo.y *= multiplier;

                    game.input.scrollDelta.z = 0;
                }
            }
            Bagel.internal.resetCurrent(); // Just in case something messes it up, although it might make debugging harder :/
            let total = new Date() - totalStart;
            subFunctions.tick();
        },

        subFunctions: {
            init: {
                check: game => {
                    if (game == null) {
                        console.log("Hmm, looks like you forgot the first argument for this function: the game JSON. It should be an object.");
                        Bagel.internal.oops();
                    }
                    if (typeof game != "object") {
                        console.error("Oh no! Your game JSON seems to be the wrong type. It must be an object but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(game)) + ".");
                        Bagel.internal.oops();
                    }
                    if (game.id == null) {
                        console.error("Oh no! You forgot to specifiy an id for the game.");
                        Bagel.internal.oops();
                    }

                    game.internal = {
                        renderer: {
                            // WebGL
                            bitmapIndexes: [],
                            bitmapCount: 0,
                            queue: {
                                bitmap: {
                                    new: [],
                                    delete: {},
                                    layer: []
                                },
                                textures: {
                                    new: {},
                                    delete: {},
                                    update: {},
                                    resizedTextureMaps: {}
                                }
                            },
                            queueLengths: {
                                add: 0,
                                delete: 0
                            },
                            locations: {
                                vertices: 0,
                                texCoords: 1,
                                images: null
                            },
                            buffers: {},
                            vertices: new Float32Array(),
                            textureCoordinates: new Float32Array(),
                            bitmapSpriteData: [],

                            colorCanvas: null,
                            colorCtx: null,
                            lastBackgroundColor: null,

                            tmpFrameBuffer: null,
                            tmpFrameBufferTextureID: null,
                            usingTmpFrameBuffer: false,

                            verticesUpdated: false,

                            textureMapResolutions: [256, 512, 1024, 2048, 4096, 8192],
                            textures: {},
                            textureMaps: [],
                            bitmapsUsingTextures: {},
                            maxTextureMaps: null,
                            tintedTextures: {}, // Key is the texture id, then the next key is the tint
                            tintedTextureCounts: {},

                            loadingScreenTextures: {},
                            loadingScreenBitmaps: {},

                            scaledBitmaps: [],
                            layers: [],

                            width: game.width,
                            height: game.height,
                            scaleX: 1,
                            scaleY: 1,
                            renderWidth: null,
                            renderHeight: null,

                            lastRender: new Date(),
                            canvas: document.createElement("canvas"),
                            ratio: game.width / game.height,
                            initialized: false
                        },
                        ids: [],
                        idIndex: {},
                        FPSFrames: 0,
                        lastFPSUpdate: performance.now(),
                        scripts: {
                            index: {
                                init: {},
                                main: {},
                                all: [],
                                sprites: {
                                    init: {},
                                    main: {},
                                    all: []
                                }
                            }
                        },
                        assets: {
                            loading: 0,
                            loaded: 0,
                            assets: {},
                            toLoad: {},
                            loadingIDs: {},
                            ranTasks: false,
                            initialized: false,
                            assetsLoading: 0
                        },
                        combinedPlugins: {
                            types: {
                                internal: {
                                    pluralAssetTypes: {} // Maps the singular to the plural
                                }
                            },
                            methods: {
                                bagel: {},
                                game: {},
                                sprite: {}
                            },
                            defaults: {
                                sprites: {
                                    type: "sprite"
                                }
                            },
                            listeners: {}
                        }, // The plugins are combined as they're loaded
                        input: {
                            pendingTouchScrollMomentum: {
                                x: 0,
                                y: 0
                            },
                            processTouches: (e, game) => {
                                let renderer = game.internal.renderer;
                                let rect = renderer.canvas.getBoundingClientRect();
                                let mouse = game.input.mouse;
                                let input = game.input;

                                let xMove, yMove;
                                let firstTouch = [...e.touches].find(value => value.identifier == 0);
                                let mainTouch = e.touches[e.touches.length - 1];
                                let touch = firstTouch? firstTouch : mainTouch;
                                if (touch) { // Make sure there's a touch point
                                    let x = ((touch.clientX - rect.left) / renderer.styleWidth) * game.width;
                                    let y = ((touch.clientY  - rect.top) / renderer.styleHeight) * game.height;
                                    if (firstTouch) {
                                        xMove = x - mouse.x;
                                        yMove = y - mouse.y;
                                    }
                                    else {
                                        input.touch.dragging = false;
                                    }
                                    mouse.x = x;
                                    mouse.y = y;
                                    input.mouse.down = true;
                                    input.touch.down = true;
                                }
                                else {
                                    input.touch.dragging = false;
                                    input.mouse.down = false;
                                    input.touch.down = false;
                                }

                                let old = input.touch.touches;
                                input.touch.touches = [];
                                let i = 0;
                                while (i < e.touches.length) {
                                    let touch = e.touches[i];
                                    let touchCoords = {
                                        x: ((touch.clientX - rect.left) / renderer.styleWidth) * game.width,
                                        y: ((touch.clientY  - rect.top) / renderer.styleHeight) * game.height
                                    };

                                    let oldTouch = old.find(value => value.id == touch.identifier);
                                    if (oldTouch) {
                                        oldTouch = oldTouch.origin;
                                    }
                                    else {
                                        oldTouch = touchCoords;
                                    }

                                    input.touch.touches.push({
                                        x: touchCoords.x,
                                        y: touchCoords.y,
                                        id: touch.identifier,
                                        origin: oldTouch
                                    });
                                    i++;
                                }
                                return [xMove, yMove];
                            }
                        },
                        lastState: (! game.state),
                        lastPrepState: (! game.state),
                        plugins: {},
                        pluginsLoading: 0,
                        pluginsDone: false,
                        dontClone: true
                    };

                    game = Bagel.check({
                        ob: game,
                        where: "Game",
                        syntax: Bagel.internal.checks.game
                    }, Bagel.internal.checks.disableArgCheck);

                    return game;
                },
                listeners: (game, canvas, previousGames) => {
                    (game => {
                        game.input = {
                            touch: {
                                down: false,
                                dragging: false,
                                touches: []
                            },
                            mouse: {
                                down: false,
                                dragging: false,
                                x: game.width / 2, // The centre of the game
                                y: game.height / 2
                            },
                            keys: {
                                keys: {},
                                keyCodes: {}
                            },
                            scrollDelta: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            touchScrollMomentum: {
                                x: 0,
                                y: 0
                            }
                        };
                        game.input.keys.isDown = keyName => {
                            if (game.input.keys.keys[keyName]) {
                                return true;
                            }
                            return false;
                        };
                        game.input.keys.isCodeDown = keyCode => {
                            if (game.input.keys.keyCodes[keyCode]) {
                                return true;
                            }
                            return false;
                        };
                        if (document.readyState == "complete") {
                            Bagel.internal.subFunctions.init.documentReady(game);
                        }
                        else {
                            document.addEventListener("readystatechange", _ => {
                                if (document.readyState == "complete") { // Wait for the document to load
                                    Bagel.internal.subFunctions.init.documentReady(game);
                                }
                            });
                        }

                        canvas.addEventListener("wheel", e => {
                            let sensitivity = game.config.input.mouse.scrollSensitivity;
                            game.input.scrollDelta.x += e.deltaX * sensitivity;
                            game.input.scrollDelta.y += e.deltaY * sensitivity;
                            game.input.scrollDelta.z += e.deltaZ * sensitivity;

                            e.preventDefault();
                        }, true); // Scroll wheel but not actual scrolling
                        canvas.addEventListener("mousemove", e => {
                            let renderer = game.internal.renderer;
                            let rect = renderer.canvas.getBoundingClientRect();
                            let mouse = game.input.mouse;

                            mouse.x = ((e.clientX - rect.left) / renderer.styleWidth) * game.width;
                            mouse.y = ((e.clientY  - rect.top) / renderer.styleHeight) * game.height;
                        }, false);
                        canvas.addEventListener("mousedown", e => {
                            Bagel.device.is.touchscreen = false;
                            let mouse = game.input.mouse;
                            switch (e.which) {
                                case 1:
                                    mouse.down = true;
                                    break;
                                case 2:
                                    mouse.middleDown = true;
                                    break;
                                case 3:
                                    mouse.rightDown = true;
                            }
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);
                        canvas.addEventListener("mouseup", e => {
                            let mouse = game.input.mouse;
                            switch (e.which) {
                                case 1:
                                    mouse.down = false;
                                    break;
                                case 2:
                                    mouse.middleDown = false;
                                    break;
                                case 3:
                                    mouse.rightDown = false;
                            }
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);

                        canvas.addEventListener("touchstart", e => {
                            Bagel.device.is.touchscreen = true;
                            game.internal.input.processTouches(e, game);

                            if (e.cancelable) {
                                e.preventDefault();
                            }
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);
                        canvas.addEventListener("touchmove", e => {
                            let input = game.input;
                            Bagel.device.is.touchscreen = true;
                            let output = game.internal.input.processTouches(e, game);
                            let [xMove, yMove] = output;
                            let firstTouch = input.touch.touches.find(value => value.id == 0);

                            let mo = game.internal.input.pendingTouchScrollMomentum;
                            mo.x = 0;
                            mo.y = 0;
                            if (firstTouch) {
                                let deadzone = game.config.input.touch.scroll.deadzone;
                                if (Math.abs(firstTouch.x - firstTouch.origin.x) > deadzone) {
                                    input.scrollDelta.x -= xMove;
                                    mo.x = -(xMove / 1.5);
                                    input.touch.dragging = true;
                                }
                                if (Math.abs(firstTouch.y - firstTouch.origin.y) > deadzone) {
                                    input.scrollDelta.y -= yMove;
                                    mo.y = -(yMove / 1.5);
                                    input.touch.dragging = true;
                                }
                            }

                            if (e.cancelable) {
                                e.preventDefault();
                            }
                        }, false);
                        canvas.addEventListener("touchend", e => {
                            let input = game.input;
                            Bagel.device.is.touchscreen = true;
                            game.internal.input.processTouches(e, game);

                            let mo = game.internal.input.pendingTouchScrollMomentum;
                            input.touchScrollMomentum.x = mo.x;
                            input.touchScrollMomentum.y = mo.y;

                            if (e.cancelable) {
                                e.preventDefault();
                            }
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);
                        canvas.addEventListener("contextmenu", e => e.preventDefault());
                        if (! previousGames) { // Only need to do this once
                            document.addEventListener("keydown", e => {
                                for (let i in Bagel.internal.games) {
                                    let game = Bagel.internal.games[i];
                                    game.input.keys.keys[e.key] = true;
                                    game.input.keys.keyCodes[e.keyCode] = true;
                                }
                            }, false);
                            document.addEventListener("keyup", e => {
                                for (let i in Bagel.internal.games) {
                                    let game = Bagel.internal.games[i];
                                    game.input.keys.keys[e.key] = false;
                                    game.input.keys.keyCodes[e.keyCode] = false;
                                }
                            }, false);
                        }
                    })(game);
                },
                basicRendererInit: game => { // Doesn't initialise everything, mostly chooses the renderer to use
                    let config = game.config;

                    if (! config.isLoadingScreen) {
                        let renderer = game.internal.renderer;

                        let blankTexture = document.createElement("canvas");
                        blankTexture.width = 1;
                        blankTexture.height = 1;
                        renderer.blankTexture = blankTexture;

                        let subFunctions = Bagel.internal.subFunctions.init;
                        let gl;

                        let settings = {
                            antialias: false,
                            powerPreference: "high-performance",
                            depth: false,
                            preserveDrawingBuffer: true,
                            failIfMajorPerformanceCaveat: true
                        };
                        let canvas = renderer.canvas;


                        if (config.display.renderer == "auto") {
                            // This is just to test
                            gl = canvas.getContext("webgl", settings);

                            let deviceWebGL = Bagel.device.webgl;
                            if (gl) {
                                config.display.renderer = "webgl";

                                subFunctions.findRendererLimits(game, renderer, gl);

                                let limits = config.display.webgl.minimumLimits;
                                if (deviceWebGL.textureSizeLimit < limits.textureSize || deviceWebGL.textureCountLimit < limits.textureCount) {
                                    config.display.renderer = "canvas";
                                    gl.getExtension("WEBGL_lose_context").loseContext();
                                    gl = null;
                                }
                            }
                            else {
                                config.display.renderer = "canvas";
                                subFunctions.findRendererLimits(game, renderer);
                            }
                        }
                        else {
                            subFunctions.findRendererLimits(game, renderer, gl);
                        }

                        renderer.type = config.display.renderer;
                        if (renderer.type == "webgl") {
                            if (! gl) {
                                gl = renderer.canvas.getContext("webgl", settings);
                            }
                            renderer.gl = gl;
                            if (gl) {
                                subFunctions.findRendererLimits(game, renderer, gl);
                                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);


                                let deviceWebGL = Bagel.device.webgl;
                                if (deviceWebGL.supported == null) {
                                    if (gl) {
                                        deviceWebGL.supported = true;
                                        Bagel.device.is.webGLSupported = true;
                                        deviceWebGL.textureCountLimit = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
                                        deviceWebGL.textureSizeLimit = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                                    }
                                    else {
                                        deviceWebGL.supported = false;
                                        Bagel.device.is.webGLSupported = false;
                                    }
                                }
                                let limits = game.config.display.webgl.minimumLimits;
                                if (deviceWebGL.textureSizeLimit < limits.textureSize || deviceWebGL.textureCountLimit < limits.textureCount) {
                                    subFunctions.errorScreen(game, 0);
                                }
                                renderer.colorCanvas = document.createElement("canvas");
                                renderer.colorCanvas.width = 1;
                                renderer.colorCanvas.height = 1;
                                renderer.colorCtx = renderer.colorCanvas.getContext("2d");
                            }
                            else {
                                subFunctions.errorScreen(game, 0);
                                renderer.type = "canvas";
                            }
                        }
                        Bagel.internal.subFunctions.tick.scaleCanvas(game);
                    }
                },
                misc: game => {
                    game.loaded = false;
                    game.paused = false;
                    game.error = false;
                    game.currentFPS = 60;
                    game.maxPossibleFPS = 60;
                    game.frameTime = 0;
                    game.scriptTime = 0;
                    game.renderTime = 0;

                    let renderer = game.internal.renderer;
                    renderer.canvas.id = "Bagel.js " + game.id;
                    renderer.canvas.width = game.width;
                    renderer.canvas.height = game.height;


                    if (game.config.display.mode == "fill") {
                        renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);"; // From Phaser (https://phaser.io)
                    }
                    else {
                        renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);"; // CSS from Phaser (https://phaser.io)
                    }

                    (game => {
                        game.add = {
                            sprite: (sprite, where="the function Game.add.sprite") => {
                                where += " -> the first argument";
                                let spriteIndex = Bagel.internal.findSpriteIndex(game);
                                sprite = Bagel.internal.createSprite(sprite, game, false, where, false, spriteIndex);
                                game.game.sprites[spriteIndex] = sprite;

                                if (game.state == game.internal.lastState) {
                                    // The init scripts need running because the sprite was after the state changed
                                    let current = Bagel.internal.current;
                                    Bagel.internal.saveCurrent();

                                    current.sprite = sprite;
                                    current.game = game;
                                    for (let i in sprite.scripts.init) {
                                        let script = sprite.scripts.init[i];
                                        if (script.stateToRun == game.state) {
                                            if (typeof script.code == "function") {
                                                script.code(sprite, game, Bagel.step.sprite);
                                            }
                                        }
                                    }
                                    Bagel.internal.loadCurrent();
                                }
                                let current = Bagel.internal.current;
                                Bagel.internal.saveCurrent();

                                current.sprite = sprite;
                                current.game = game;
                                for (let i in sprite.scripts.main) {
                                    let script = sprite.scripts.main[i];
                                    if (script.stateToRun == game.internal.lastState) {
                                        if (typeof script.code == "function") {
                                            script.code(sprite, game, Bagel.step.sprite);
                                        }
                                    }
                                }
                                Bagel.internal.loadCurrent();
                                return sprite;
                            },
                            asset: {}
                        };
                        game.get = {
                            asset: {},
                            sprite: (id, check) => Bagel.get.sprite(id, game, check)
                        };
                        game.set = {
                            asset: {}
                        };
                        game.delete = _ => {
                            if (game.config.display.dom) {
                                if (game.config.display.htmlElementID == null && game.config.display.mode == "fill") {
                                    game.internal.renderer.canvas.parentElement.remove();
                                }
                                else {
                                    game.internal.renderer.canvas.remove();
                                }
                            }

                            let renderer = game.internal.renderer;
                            if (game.config.isLoadingScreen) {
                                let bitmaps = renderer.loadingScreenBitmaps;

                                for (let id in bitmaps) {
                                    if (bitmaps[id]) {
                                        Bagel.internal.render.bitmapSprite.delete(id, game);
                                    }
                                }
                                let textures = renderer.loadingScreenTextures;
                                for (let id in textures) {
                                    if (textures[id]) {
                                        Bagel.internal.render.texture.delete(id, game, true, true);
                                    }
                                }
                            }

                            if (renderer.type == "webgl") {
                                if (! game.config.isLoadingScreen) {
                                    game.internal.renderer.gl.getExtension("WEBGL_lose_context").loseContext();
                                    let slots = game.internal.renderer.textureMaps;
                                    for (let i in slots) {
                                        if (slots[i].gl) {
                                            slots[i].gl.getExtension("WEBGL_lose_context").loseContext();
                                        }
                                    }
                                }
                            }

                            delete Bagel.internal.games[game.id];
                        };
                    })(game);
                },
                bundledAssets: game => {
                    Bagel.internal.saveCurrent();
                    Bagel.internal.current.plugin = game.internal.plugins.Internal;

                    game.set.asset.font(".Internal.defaultFont", {"widths":[4,4,4,4,4,4,4,4,3,4,4,4,5,4,5,3,5,4,4,3,4,3,5,5,3,4,3,3,3,3,3,3,3,3,3,3,3,1,5,5,5,3,5,3,2,2,3,3,4,3,1,2,1,3,2,2,5,5,3,3,4,1,2,2,2,2],"heights":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,7,5,2,6,3,5,5,3,1,1,3,5,5,2,2,2,2,5,5,5,5,2,5,5,5,5,5],"pixels":"011010011111100110011110100111101001111001111000100010000111111010011001100111101111100011101000111111111000111010001000111010001011100111111001100111111001100111101001001011101110001000110010110100110101100101010011000100010001000111110001110111010110001100011001110110111001100101110100011000110001011101111011111001000111010001100011001001101111010011110100110010111100001100001111011101001001001010011001100110010110101101101101010100011000110001101011101110001010100010001010100011011011010100101111000100100100111101010110110101011001001001011111100101010011111000101000111010110111100100111110011100111111110011110111111100101001001011110111110111111110111100100111100101100001011101011100100111100010001111000100011111010001110001011111000100100010001000100010001000101010100100010100110010101100100110110101010101101010011001010110010111010111111111100011110001100000011011101101111101100000100010001000100010000100000100000100000100000110001000101010000101010001000101011010111111110101011110101011111100110111101100111"});

                    Bagel.internal.loadCurrent();
                },
                scripts: (game, type) => {
                    let scripts = game.game.scripts[type];
                    let index = game.internal.scripts.index[type];

                    for (let i in scripts) {
                        let script = scripts[i];
                        if (type == "all") { // Has no state
                            index.push({
                                script: i
                            });
                        }
                        else {
                            let state = script.stateToRun;
                            if (index[state] == null) index[state] = [];
                            index[state].push({
                                script: i
                            });
                        }
                    }
                },
                initScripts: game => {
                    let init = Bagel.internal.subFunctions.init.scripts;
                    init(game, "init");
                    init(game, "main");
                    init(game, "all");
                },
                plugins: game => {
                    for (let i in game.game.plugins) {
                        let plugin = game.game.plugins[i];
                        game.internal.pluginsLoading++;
                        ((game, src, args, index) => {
                            fetch(src).then(res => {
                                if (res.ok) {
                                    res.text().then(plugin => {
                                        game.internal.pluginsLoading--;
                                        plugin = (new Function("game", "return " + plugin))(game); // Not entirely sure if this is good practice or not but it allows the functions to be parsed unlike JSON.parse
                                        if (typeof plugin != "object") {
                                            console.error("Erm, the plugin with the src " + JSON.stringify(src) + " isn't an object, it's " + Bagel.internal.an(Bagel.internal.getTypeOf(plugin))) + ". If you made the plugin, you should check you've written it correctly. If you didn't, make sure the src is for the right file.";
                                            Bagel.internal.oops(game);
                                        }
                                        Bagel.internal.loadPlugin(plugin, game, args, index);
                                    });
                                }
                                else {
                                    console.error("Huh, the network request for a plugin failed. This could be because the server can't be accessed or the src is incorrect. Check out the HTTP error above for more info.");
                                    Bagel.internal.oops(game);
                                }
                            });
                        })(game, plugin.src, plugin.args? Bagel.internal.deepClone(plugin.args) : {}, i);
                    }
                },
                assets: (game, dontLoad) => {
                    game.internal.assets.initialized = true;
                    let allAssets = game.game.assets;
                    for (let type in allAssets) {
                        let assets = allAssets[type];

                        for (let i in assets) {
                            let asset = assets[i];
                            Bagel.internal.loadAsset(asset, game, type, "Game.game.assets." + type + " item " + i, i, false, dontLoad);
                        }
                    }
                    if (game.internal.assets.loading == 0) {
                        (game => {
                            game.loaded = true;
                            Bagel.internal.subFunctions.init.deleteLoadingScreen(game);
                            setTimeout(_ => {
                                if (game.loaded) {
                                    Bagel.internal.subFunctions.init.onload(game);
                                }
                            }, 0);
                        })(game);
                    }
                },
                preloadTasks: game => {
                    let assets = game.internal.assets;
                    assets.assetsLoading = assets.loading; // Keep track of which are actually assets
                    let tasks = game.game.scripts.preload;
                    assets.loading += tasks.tasks.length; // They aren't assets but it makes it easier to group them
                    if (tasks.misc) {
                        assets.loading++;
                    }
                },
                methods: game => {
                    let methods = game.internal.combinedPlugins.methods.game;

                    for (let methodName in methods) {
                        let method = methods[methodName];

                        Bagel.internal.subFunctions.init.subMethods(game, method, methodName, game);
                    }
                },
                subMethods: (game, method, methodName, position) => {
                    let isCategory = true;
                    if (method.internal) {
                        if (method.internal.isNotCategory) {
                            isCategory = false;
                        }
                    }

                    if (isCategory) {
                        if (! position[methodName]) position[methodName] = {};
                        for (let i in method) {
                            Bagel.internal.subFunctions.init.subMethods(game, method[i], i, position[methodName]);
                        }
                    }
                    else {
                        let merge = true;
                        if (position.hasOwnProperty(methodName)) {
                            if (! method.fn.overwrite) {
                                merge = false;
                                console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(method.internal.plugin.info.id) + " tried to overwrite the " + JSON.stringify(methodName) + " property in the game " + JSON.stringify(game.id) + " without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older type definition, add this to the function JSON: \"overwrite: true\".");
                            }
                        }

                        if (merge) {
                            ((method, game, methodName, position) => {
                                if (method.fn.normal) {
                                    position[methodName] = method.fn.fn;
                                }
                                else {
                                    if (method.fn.obArg) {
                                        position[methodName] = args => {
                                            if (args == null) {
                                                console.error("Oops, this function takes one argument: an object. You didn't give any arguments.");
                                                Bagel.internal.oops(game);
                                            }
                                            if (Bagel.internal.getTypeOf(args) != "object") {
                                                console.error("Huh, looks like you used " + Bagel.internal.an(Bagel.internal.getTypeOf(args)) + " instead of an object.");
                                                Bagel.internal.oops(game);
                                            }

                                            Bagel.internal.saveCurrent();
                                            current.game = game;
                                            current.plugin = method.internal.plugin;

                                            args = Bagel.check({
                                                ob: args,
                                                syntax: method.fn.args,
                                                where: "game " + JSON.stringify(game.id) + "'s " + JSON.stringify(methodName) + " method"
                                            }, Bagel.internal.checks.disableArgCheck);
                                            let output = method.fn.fn(game, args, current.plugin); // Passed the argument checks

                                            Bagel.internal.loadCurrent();
                                            return output;
                                        };
                                    }
                                    else {
                                        position[methodName] = (...args) => {
                                            let keys = Object.keys(method.fn.args);
                                            let newArgs = {};

                                            // Convert the array to an object using the keys
                                            for (let i in args) {
                                                if (keys[i] == null) {
                                                    keys[i] = "Your " + Bagel.internal.th(parseInt(i)) + " argument";
                                                }
                                                newArgs[keys[i]] = args[i];
                                            }

                                            let current = Bagel.internal.current;
                                            Bagel.internal.saveCurrent();
                                            current.game = game;
                                            current.plugin = method.internal.plugin;

                                            newArgs = Bagel.check({
                                                ob: newArgs,
                                                syntax: method.fn.args,
                                                where: "game " + JSON.stringify(game.id) + "'s " + JSON.stringify(methodName) + " method"
                                            }, Bagel.internal.checks.disableArgCheck, false, "Btw, the arguments go in this order: " + keys.join(", ") + ".");
                                            let output = method.fn.fn(game, newArgs, method.internal.plugin); // Passed the argument checks

                                            Bagel.internal.loadCurrent();
                                            return output;
                                        };
                                    }
                                }
                            })(method, game, methodName, position);
                        }
                    }
                },
                initSprites: game => {
                    for (let i in game.game.sprites) {
                        Bagel.internal.createSprite(game.game.sprites[i], game, false, "Game.game.sprites item " + i, false, parseInt(i));
                    }
                },
                loadingScreen: game => {
                    if (! game.config.loading.skip) {
                        if (game.internal.loadingScreen) return;
                        Bagel.internal.saveCurrent();
                        Bagel.internal.current.plugin = game.internal.plugins.Internal;

                        let loadingScreen = Bagel.internal.deepClone(game.config.loading.animation);
                        let resolution = "full";
                        if (loadingScreen.config) {
                            if (loadingScreen.config.display) {
                                if (loadingScreen.config.display.resolution != null) {
                                    resolution = loadingScreen.config.display.resolution;
                                }
                            }
                        }

                        loadingScreen.id = ".Internal.loadingScreen." + game.id;
                        loadingScreen.width = game.width;
                        loadingScreen.height = game.height;

                        let backgroundColor;
                        if (game.config.display.backgroundColor == "transparent") {
                            backgroundColor = document.body.bgColor;
                        }
                        else {
                            backgroundColor = game.config.display.backgroundColor;
                        }

                        loadingScreen.config = {
                            loading: {
                                skip: true,
                                mode: "preload"
                            },
                            display: {
                                backgroundColor: backgroundColor,
                                dom: false,
                                renderer: game.internal.renderer.type
                            },
                            disableBagelJSMessage: true, // Otherwise there would be 2 per game
                            isLoadingScreen: true
                        };
                        game.internal.resolutionModeWas = game.config.display.resolution;
                        game.config.display.resolution = resolution;

                        if (loadingScreen.vars == null) {
                            loadingScreen.vars = {};
                        }
                        loadingScreen.vars.loading = {
                            progress: 0,
                            loaded: 0,
                            loading: game.internal.assets.loading,
                            done: false,
                            game: game
                        };

                        loadingScreen = Bagel.init(loadingScreen);
                        game.internal.loadingScreen = loadingScreen;
                        loadingScreen.internal.mainGame = game;
                        loadingScreen.internal.renderer = game.internal.renderer;

                        if (game.internal.pluginsDone) {
                            Bagel.internal.subFunctions.init.rendererInit(game);
                        }

                        Bagel.internal.loadCurrent();
                    }
                },
                deleteLoadingScreen: game => {
                    if (game.internal.loadingScreen) {
                        game.internal.loadingScreen.delete();
                        delete game.internal.loadingScreen;

                        game.config.display.resolution = game.internal.resolutionModeWas;
                    }
                },
                errorScreen: (game, code) => {
                    for (let sprite of game.game.sprites) {
                        if (sprite) sprite.delete();
                    }
                    let renderer = game.internal.renderer;
                    for (let id in renderer.bitmapSpriteData) {
                        if (renderer.bitmapSpriteData[id]) {
                            Bagel.internal.render.bitmapSprite.delete(id, game);
                        }
                    }
                    for (let id in renderer.textures) {
                        if (id[0] != ".") {
                            Bagel.internal.render.texture.delete(id, game);
                        }
                    }

                    game.config.loading.animation = Bagel.internal.errorGameObject; // So a message can be displayed to the user
                    game.internal.assets.loading++; // So the loading screen triggers
                    game.loaded = false;
                    game.config.loading.skip = false;
                    game.internal.errorCode = code;
                },
                documentReady: game => {
                    if (game.config.display.dom) {
                        if (game.config.display.htmlElementID) {
                            document.getElementById(game.config.display.htmlElementID).appendChild(game.internal.renderer.canvas);
                        }
                        else {
                            if (document.body == null) {
                                document.body = document.createElement("body");
                            }
                            if (game.config.display.mode == "fill") {
                                let p = document.createElement("p");
                                p.style = "position: absolute;top:0;bottom:0;left:0;right:0;margin:auto;";
                                p.appendChild(game.internal.renderer.canvas);
                                document.body.appendChild(p);
                            }
                            else {
                                document.body.appendChild(game.internal.renderer.canvas);
                            }
                        }
                    }
                    Bagel.internal.subFunctions.init.plugins(game);
                },
                onload: game => {
                    if (! game.internal.pluginsDone) {
                        (game => {
                            setTimeout(_ => {
                                Bagel.internal.subFunctions.init.onload(game);
                            }, 0);
                        })(game);
                        return;
                    }

                    let sprites = game.game.sprites;
                    for (let i in sprites) {
                        if (sprites[i] != null) {
                            Bagel.internal.subFunctions.createSprite.triggerListeners(sprites[i], game);
                        }
                    }
                },
                rendererInit: game => {
                    let renderer = game.internal.renderer;
                    if (game.config.isLoadingScreen) {
                        Bagel.internal.render.texture.new(".Internal.missing", renderer.missingTexture, game);
                        return;
                    }
                    if (game.internal.renderer.initialized) return;

                    let rendererType = game.internal.renderer.type;
                    let renderers = Bagel.internal.subFunctions.tick.render;
                    if (renderers[rendererType].init) {
                        renderers[rendererType].init(game);
                    }

                    let missingTexture = document.createElement("canvas");
                    missingTexture.width = 2;
                    missingTexture.height = 2;
                    let ctx = missingTexture.getContext("2d");

                    ctx.fillRect(0, 0, 2, 2);
                    ctx.fillStyle = "#f0f";
                    ctx.fillRect(1, 0, 1, 1);
                    ctx.fillRect(0, 1, 1, 1);

                    Bagel.internal.render.texture.new(".Internal.missing", missingTexture, game);
                    renderer.missingTexture = missingTexture;

                    renderer.initialized = true;
                },
                findRendererLimits: (game, renderer, gl) => {
                    let deviceWebGL = Bagel.device.webgl;
                    let supported = false;
                    if (gl) {
                        supported = true;
                        deviceWebGL.textureCountLimit = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
                        deviceWebGL.textureSizeLimit = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                        deviceWebGL.viewportSizeLimit = Math.min(...gl.getParameter(gl.MAX_VIEWPORT_DIMS));
                    }
                    if (gl != null) {
                        deviceWebGL.supported = supported;
                        Bagel.device.is.webGLSupported = supported;
                    }
                },
                onPluginsReady: game => {
                    let subFunctions = Bagel.internal.subFunctions.init;
                    subFunctions.methods(game);
                    if ((! game.internal.loadingScreen) || game.internal.loadingScreen.loaded) { // Make sure the loading screen has priority
                        subFunctions.assets(game);
                    }
                    subFunctions.rendererInit(game);
                    subFunctions.preloadTasks(game);
                    subFunctions.initScripts(game);
                    subFunctions.initSprites(game);
                }
            },
            loadPlugin: {
                check: (game, plugin, index) => {
                    let current = Bagel.internal.current;
                    Bagel.internal.saveCurrent();
                    current.plugin = plugin;
                    current.game = game;

                    plugin = Bagel.check({
                        ob: plugin,
                        syntax: Bagel.internal.checks.plugin,
                        where: (plugin.info && plugin.info.id)? ("plugin " + plugin.info.id) : "Game.game.plugins item " + index
                    }, Bagel.internal.checks.disableArgCheck);
                    plugin.internal = {
                        dontClone: true
                    };

                    Bagel.internal.loadCurrent();
                    return plugin;
                },
                merge: {
                    types: {
                        assets: (game, plugin) => {
                            let types = plugin.plugin.types.assets;
                            let combined = game.internal.combinedPlugins;

                            for (let newType in types) {
                                let typeJSON = types[newType];

                                if (combined.types.assets == null) {
                                    combined.types.assets = {};
                                }

                                let merge = false;
                                if (combined.types.assets[newType] != null) {
                                    if (typeJSON.overwrite) {
                                        merge = true;
                                    }
                                    else {
                                        console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.info.id) + " tried to overwrite the " + JSON.stringify(newType) + " asset type without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older type definition, add this to the new type JSON: \"overwrite: true\".");
                                    }
                                }
                                else {
                                    merge = true;
                                }
                                if (merge) {
                                    combined.types.assets[newType] = typeJSON;
                                    combined.types.assets[newType].internal = {
                                        plugin: plugin,
                                        args: {
                                            ...Bagel.internal.checks.assets,
                                            ...typeJSON.args
                                        }
                                    };
                                    combined.types.internal.pluralAssetTypes[typeJSON.get] = newType;

                                    ((newType, boundGame, typeJSON, plugin) => {
                                        Bagel.get.asset[typeJSON.get] = (id, game, check) => {
                                            let current = Bagel.internal.current;
                                            let plural = boundGame.internal.combinedPlugins.types.internal.pluralAssetTypes[typeJSON.get];
                                            game = game == null? current.game : game;
                                            if (game == null) {
                                                console.error("Oops. Looks like you're trying to run this function outside of a script. Try moving it and trying again. Alternatively, you can pass the game object in as the second argument to this function to fix this issue.");
                                                Bagel.internal.oops();
                                            }
                                            if (id == null) {
                                                console.error("Huh, looks like you forgot the \"id\" argument (the first argument). That's the id for the asset you want to get.");
                                                Bagel.internal.oops(game);
                                            }

                                            Bagel.internal.saveCurrent();

                                            current.assetType = newType;
                                            current.assetTypeName = typeJSON.get;
                                            current.game = game;
                                            current.plugin = plugin;

                                            let assets = game.internal.assets;
                                            let loadedAssets = assets.assets[newType];
                                            let doesntExist = true;
                                            if (loadedAssets) {
                                                if (loadedAssets[id]) {
                                                    doesntExist = false;
                                                }
                                            }
                                            if (doesntExist) { // Invalid id
                                                let exists = assets.toLoad[plural];
                                                if (exists) exists = exists[id];
                                                if (! exists) {
                                                    if (assets.loadingIDs[plural]) {
                                                        if (assets.loadingIDs[plural][id]) {
                                                            Bagel.internal.loadCurrent();
                                                            return true; // It's already loading
                                                        }
                                                    }
                                                }

                                                if (exists) {
                                                    let info = exists;
                                                    current.i = info.i;
                                                    current.where = info.where;

                                                    info.assetLoader.init({...info.asset}, info.set? info.set : info.ready, info.game, info.assetLoader.internal.plugin, info.i);
                                                    info.game.internal.assets.loading++;

                                                    if (assets.loadingIDs[plural] == null) assets.loadingIDs[plural] = {};
                                                    assets.loadingIDs[plural][info.asset.id] = true; // It's currently loading

                                                    if (assets.toLoad[plural]) {
                                                        if (assets.toLoad[plural][id]) {
                                                            delete assets.toLoad[plural][id]; // It's loading so it should be removed from the list of assets to load
                                                        }
                                                    }

                                                    Bagel.internal.loadCurrent();
                                                    return true; // It's loading
                                                }
                                                else {
                                                    Bagel.internal.loadCurrent();
                                                    if (check) return false;
                                                    console.error("Oops. That " + typeJSON.get + " doesn't exist. You tried to get " + Bagel.internal.an(typeJSON.get) + " asset with the id " + JSON.stringify(id) + ".");
                                                    Bagel.internal.oops(boundGame);
                                                }
                                            }
                                            let asset = loadedAssets[id];
                                            Bagel.internal.loadCurrent();
                                            return asset;
                                        };
                                        if (typeJSON.set) { // Receives setting requests
                                            Bagel.set.asset[typeJSON.get] = (id, value, game) => {
                                                let current = Bagel.internal.current;
                                                let plural = boundGame.internal.combinedPlugins.types.internal.pluralAssetTypes[typeJSON.get];
                                                game = game == null? current.game : game;
                                                if (game == null) {
                                                    console.error("Oops. Looks like you're trying to run this function outside of a script. Try moving it and trying again. Alternatively, you can pass the game object in as the third argument to this function to fix this issue.");
                                                    Bagel.internal.oops();
                                                }
                                                if (id == null) {
                                                    console.error("Huh, looks like you forgot the \"id\" argument (the first argument). That's the id for the asset you want to set.");
                                                    Bagel.internal.oops(game);
                                                }

                                                Bagel.internal.saveCurrent();

                                                current.assetType = newType;
                                                current.assetTypeName = typeJSON.get;
                                                current.game = game;
                                                current.plugin = plugin;
                                                current.asset = typeJSON;
                                                current.pluginProxy = true;

                                                let prefix = id.split(".")[1];
                                                let actingPluginID = Bagel.internal.getActingPluginId();

                                                if (id[0] == ".") { // Reserved
                                                    if (actingPluginID == null) {
                                                        console.error("This is awkward... IDs starting with a dot are only for plugins. You tried to set " + Bagel.internal.an(typeJSON.get) + " using the id "
                                                        + JSON.stringify(id)
                                                        + ". If it's important that it has this name, you could write a plugin instead, just make sure its id is set to "
                                                        + JSON.stringify(prefix)
                                                        + " ;)");
                                                        Bagel.internal.oops();
                                                    }
                                                    else {
                                                        if (prefix != actingPluginID) { // Plugins are allowed to use ids starting with a dot and then their id (if it starts with a dot)
                                                            console.error("Erm... the only reserved prefix you can use in this plugin is " + JSON.stringify("." + actingPluginID) + " and you tried to use the id " + JSON.stringify(value)
                                                            + "In Game.id.\nYou can fix this by changing the prefix, removing it or changing the plugin id in \"Plugin.info.id\".");
                                                            Bagel.internal.oops();
                                                        }
                                                    }
                                                }

                                                let ready = ((id, game, plural, type) => asset => {
                                                    let assets = game.internal.assets;
                                                    let combinedPlugins = game.internal.combinedPlugins;

                                                    if (assets.assets[type] == null) assets.assets[type] = {};
                                                    assets.assets[plural][id] = asset;
                                                })(id, game, plural, newType); // This is called by the init function once the asset has loaded

                                                let output = typeJSON.set(value, {
                                                    id: id,
                                                    src: null
                                                }, ready, game, plugin);
                                                if (output) {
                                                    console.error(output);
                                                    Bagel.internal.oops(game);
                                                }

                                                Bagel.internal.loadCurrent();

                                            };
                                        }

                                        boundGame.get.asset[typeJSON.get] = (id, check) => Bagel.get.asset[typeJSON.get](id, boundGame, check); // An alias
                                        if (typeJSON.set) {
                                            boundGame.set.asset[typeJSON.get] = (id, value) => Bagel.set.asset[typeJSON.get](id, value, boundGame);
                                        }
                                        boundGame.add.asset[typeJSON.get] = (asset, where) => {
                                            if (asset == null) {
                                                console.error("Oops, looks like you forgot the \"asset\" argument (the first argument). That's the arguments for the asset as an object.");
                                                Bagel.internal.oops(game);
                                            }
                                            if (typeof asset != "object") {
                                                console.error("Huh, looks like you used the wrong type for the \"asset\" argument (the first argument). That's the arguments for the asset as an object. You tried to use " + JSON.stringify(asset) + ".");
                                                Bagel.internal.oops(game);
                                            }
                                            if (! where) where = "the function Game.add.asset." + typeJSON.get;
                                            let plural = game.internal.combinedPlugins.types.internal.pluralAssetTypes[typeJSON.get];
                                            Bagel.internal.loadAsset(asset, boundGame, plural, where, true);
                                        };
                                    })(newType, game, typeJSON, plugin);
                                }
                            }
                        },
                        sprites: (game, plugin) => {
                            let types = plugin.plugin.types.sprites;
                            let combined = game.internal.combinedPlugins;

                            for (let newType in types) {
                                let typeJSON = types[newType];

                                if (combined.types.sprites == null) {
                                    combined.types.sprites = {};
                                }

                                let merge = false;
                                if (combined.types.sprites[newType] != null) {
                                    if (typeJSON.overwrite) {
                                        merge = true;
                                    }
                                    else {
                                        console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.info.id) + " tried to overwrite the " + JSON.stringify(newType) + " sprite type without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older type definition, add this to the new type JSON: \"overwrite: true\".");
                                    }
                                }
                                else {
                                    merge = true;
                                }
                                if (merge) {
                                    let syntax = {...Bagel.internal.checks.sprite.clones.syntax}; // Add in the default checks
                                    if (typeJSON.cloneArgs) {
                                        for (let i in typeJSON.cloneArgs) {
                                            syntax[i] = typeJSON.cloneArgs[i].syntax;
                                        }
                                        typeJSON.cloneArgs = {
                                            ...typeJSON.cloneArgs,
                                            ...Bagel.internal.checks.sprite.clones.args
                                        };
                                    }
                                    typeJSON.args = {
                                        ...typeJSON.args,
                                        ...Bagel.internal.checks.sprite.sprite
                                    };
                                    (typeJSON => {
                                        typeJSON.listeners.property = {
                                            ...typeJSON.listeners.property,
                                            ...{
                                                visible: {
                                                    set: (sprite, value, property, game, plugin, triggerSprite, step, initialTrigger) => {
                                                        let bitmapFunctions = Bagel.internal.render.bitmapSprite;

                                                        if (value) {
                                                            if (typeJSON.render.onVisible) {
                                                                if (triggerSprite.internal.Bagel.rendererNotInitialized) {
                                                                    return ".rerun";
                                                                }
                                                                else {
                                                                    if (! triggerSprite.internal.Bagel.onVisibleTriggered) {
                                                                        Bagel.internal.processSpriteRenderOutput(
                                                                            triggerSprite,
                                                                            typeJSON.render.onVisible(triggerSprite, bitmapFunctions.new, game, plugin)
                                                                        );

                                                                        triggerSprite.internal.Bagel.onVisibleTriggered = true;
                                                                        triggerSprite.internal.Bagel.onVisibleTriggeredBefore = true;
                                                                        triggerSprite.internal.Bagel.onInvisibleTriggered = false;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        else if (! initialTrigger) {
                                                            if (typeJSON.render.onInvisible) {
                                                                if (triggerSprite.internal.Bagel.onVisibleTriggeredBefore) {
                                                                    if (! triggerSprite.internal.Bagel.onInvisibleTriggered) {
                                                                        Bagel.internal.processSpriteRenderOutput(
                                                                            triggerSprite,
                                                                            typeJSON.render.onInvisible(triggerSprite, bitmapFunctions.delete, game, plugin)
                                                                        );
                                                                        triggerSprite.internal.Bagel.onVisibleTriggered = false; // Can be triggered again
                                                                        triggerSprite.internal.Bagel.onInvisibleTriggered = true;
                                                                    }
                                                                }
                                                                else {
                                                                    return ".rerun";
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        };
                                    })(typeJSON);

                                    typeJSON.internal = {
                                        plugin: plugin,
                                        cloneSyntax: syntax
                                    };
                                    combined.types.sprites[newType] = typeJSON;
                                }
                            }
                        }
                    },
                    method: (game, plugin, type, spriteType, position, method, methodName, bagelPosition, positionName) => {
                        let merge = false;
                        if (position[methodName] == null) {
                            merge = true;
                        }
                        else {
                            if (method.overwrite) {
                                merge = true;
                            }
                            else {
                                if (spriteType) {
                                    console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.info.id) + " tried to overwrite the " + JSON.stringify(methodName) + " method for the " + spriteType + " type without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older method, add this to the method JSON: \"overwrite: true\".");
                                }
                                else {
                                    console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.info.id) + " tried to overwrite the " + JSON.stringify(methodName) + " " + type + " method without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older method, add this to the method JSON: \"overwrite: true\".");
                                }
                            }
                        }

                        if (merge) {
                            method.internal = {
                                plugin: plugin,
                                isNotCategory: true
                            };
                            if (type == "bagel") { // Just create the function now
                                if (method.fn.normal) {
                                    bagelPosition[methodName] = method.fn.fn; // No bindings needed
                                }
                                else {
                                    ((position, methodName, plugin, method, positionName) => {
                                        if (method.fn.obArg) {
                                            bagelPosition[methodName] = args => {
                                                if (args == null) args = {};
                                                if (Bagel.internal.getTypeOf(args) != "object") {
                                                    console.error("Huh, looks like you used " + Bagel.internal.an(Bagel.internal.getTypeOf(args)) + " instead of an object.");
                                                    Bagel.internal.oops();
                                                }

                                                args = Bagel.check({
                                                    ob: args,
                                                    syntax: method.fn.args,
                                                    where: "the Bagel.js method " + JSON.stringify(positionName + "." + methodName)
                                                }, Bagel.internal.checks.disableArgCheck);
                                                // Passed the argument checks

                                                let current = Bagel.internal.current;
                                                Bagel.internal.saveCurrent();
                                                current.plugin = method.internal.plugin;

                                                let output = method.fn.fn(args, current.plugin);

                                                Bagel.internal.loadCurrent();
                                                return output;
                                            };
                                        }
                                        else {
                                            bagelPosition[methodName] = (...args) => {
                                                let keys = Object.keys(method.fn.args);
                                                let newArgs = {};

                                                // Convert the array to an object using the keys
                                                for (let i in args) {
                                                    if (keys[i] == null) {
                                                        keys[i] = "Your " + Bagel.internal.th(parseInt(i)) + " argument";
                                                    }
                                                    newArgs[keys[i]] = args[i];
                                                }

                                                newArgs = Bagel.check({
                                                    ob: newArgs,
                                                    syntax: method.fn.args,
                                                    where: "the Bagel.js method " + JSON.stringify(positionName + "." + methodName)
                                                }, Bagel.internal.checks.disableArgCheck, false, "Btw, the arguments go in this order: " + keys.join(", ") + ".");
                                                // Passed the argument checks

                                                let current = Bagel.internal.current;
                                                Bagel.internal.saveCurrent();
                                                current.plugin = method.internal.plugin;
                                                let output = method.fn.fn(newArgs, current.plugin);

                                                Bagel.internal.loadCurrent();
                                                return output;
                                            };
                                        }
                                    })(position, methodName, plugin, method, positionName);
                                }
                            }
                            else {
                                position[methodName] = method;
                            }
                        }
                    },
                    subMethods: (game, plugin, type, method, methodName, position, oldPosition, combinedPosition, bagelPosition, positionName) => {
                        let subFunctions = Bagel.internal.subFunctions.loadPlugin.merge;
                        if (method.category) {
                            let oldPosition = position;
                            if (type == "bagel") {
                                if (! bagelPosition[methodName]) bagelPosition[methodName] = {};
                                bagelPosition = bagelPosition[methodName];
                                if (positionName != "") {
                                    positionName += ".";
                                }
                                positionName += methodName;
                            }
                            else if (type != "sprite") {
                                if (! position[methodName]) position[methodName] = {};
                                position = position[methodName];
                                if (positionName != "") {
                                    positionName += ".";
                                }
                                positionName += methodName;
                            }
                            combinedPosition.push(methodName);
                            for (let i in method.category) {
                                subFunctions.subMethods(game, plugin, type, method.category[i], i, position, oldPosition, combinedPosition, bagelPosition, positionName);
                            }
                        }
                        else {
                            if (type == "sprite") {
                                for (let i in method.fn.appliesTo) {
                                    let tmp = position;
                                    let spriteType = method.fn.appliesTo[i];
                                    if (position[spriteType] == null) position[spriteType] = {};
                                    position = position[spriteType];

                                    for (let c in combinedPosition) {
                                        let category = combinedPosition[c];
                                        if (position[category] == null) position[category] = {};
                                        position = position[category];
                                    }
                                    subFunctions.method(game, plugin, type, spriteType, position, method, methodName, bagelPosition);
                                    position = tmp;
                                }
                                if (method.apply) {
                                    if (oldPosition[method.apply.from] == null) {
                                        console.error("Oops, Bagel.js can't copy that method from the sprite type " + JSON.stringify(method.apply.from) + " because it doesn't seem to exist. Check the plugin that adds it has been loaded first. Also check the names and categories. In plugin " + plugin.info.id + ".");
                                        Bagel.internal.oops(game);
                                    }
                                    let methodToCopy = oldPosition[method.apply.from][methodName];
                                    for (i in method.apply.to) {
                                        let tmp = position;
                                        let spriteType = method.apply.to[i];
                                        if (position[spriteType] == null) position[spriteType] = {};
                                        position = position[spriteType];

                                        for (let c in combinedPosition) {
                                            let category = combinedPosition[c];
                                            if (position[category] == null) position[category] = {};
                                            position = position[category];
                                        }
                                        subFunctions.method(game, plugin, type, spriteType, position, methodToCopy, methodName, bagelPosition);
                                        position = tmp;
                                    }
                                }
                            }
                            else {
                                subFunctions.method(game, plugin, type, null, position, method, methodName, bagelPosition, positionName);
                            }
                        }
                    },
                    methods: (game, plugin) => {
                        let combined = game.internal.combinedPlugins;

                        let types = ["bagel", "game", "sprite"];
                        for (let i in types) {
                            let type = types[i];
                            let methods = plugin.plugin.methods[type];

                            for (let methodName in methods) {
                                let method = methods[methodName];

                                let position = combined.methods[type];
                                Bagel.internal.subFunctions.loadPlugin.merge.subMethods(game, plugin, type, method, methodName, position, position, [], Bagel, "");
                            }
                        }
                    },
                    listeners: (game, plugin) => {
                        let combined = game.internal.combinedPlugins.listeners;
                        let listeners = plugin.plugin.listeners;
                        for (let type in listeners) {
                            let listener = listeners[type];
                            if (listener) {
                                if (combined[type] == null) combined[type] = [];
                                combined[type].push({
                                    fn: listener,
                                    plugin: plugin
                                });
                            }
                        }
                    }
                }
            },
            createSprite: {
                check: (sprite, game, parent, where, currentPluginID) => {
                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];

                    if (parent) { // Clone
                        if (handler.cloneArgs == null) {
                            console.error("Oops, the sprite type " + JSON.stringify(parent.type) + " doesn't support clones.");
                            Bagel.internal.oops(game);
                        }

                        sprite = Bagel.check({
                            ob: sprite,
                            where: where,
                            syntax: handler.internal.cloneSyntax
                        }, {
                            args: true,
                            missing: true // Missing arguments don't matter, they're dealt with in a minute
                        }); // Check any existing properties supplied by the clone function

                        let clone = Bagel.internal.deepClone;
                        // Assign the parent's properties to the clone
                        for (let i in handler.cloneArgs) {
                            let argJSON = handler.cloneArgs[i];

                            if (argJSON.mode == "replace") {
                                if (! sprite.hasOwnProperty(i)) {
                                    if (parent.clones.hasOwnProperty(i)) {
                                        sprite[i] = clone(parent.clones[i]);
                                    }
                                    else if (parent.hasOwnProperty(i)) {
                                        sprite[i] = clone(parent[i]);
                                    }
                                }
                            }
                            else if (argJSON.mode == "merge") {
                                if (! (parent.hasOwnProperty(i) || parent.clones.hasOwnProperty(i) || sprite.hasOwnProperty(i))) {
                                    if (argJSON.syntax.hasOwnProperty("default")) {
                                        sprite[i] = argJSON.syntax.default; // No values specified. Default to the default
                                    }
                                    continue;
                                }

                                sprite[i] = Object.assign(clone(parent[i]), clone(parent.clones[i]), clone(sprite[i]));
                            }
                            else if (argJSON.mode == "ignore") { // Ignore the parent's properties
                                if (! sprite.hasOwnProperty(i)) {
                                    if (parent.clones.hasOwnProperty(i)) {
                                        sprite[i] = clone(parent.clones[i]);
                                    }
                                    else if (argJSON.syntax.hasOwnProperty("default")) {
                                        sprite[i] = argJSON.syntax.default;
                                    }
                                }
                            }
                        }

                        if (parent) {
                            sprite.cloneID = parent.cloneIDs.length - 1;
                            sprite.parent = parent;
                        }

                        if (handler.check) {
                            let error = handler.check(sprite, game, Bagel.check, where);
                            if (error) {
                                console.error(error);
                                Bagel.internal.oops(game);
                            }
                        }
                        return sprite;
                    }
                    let current = Bagel.internal.current;
                    Bagel.internal.saveCurrent();
                    current.sprite = sprite;
                    current.game = game;

                    sprite = Bagel.check({
                        ob: sprite,
                        where: where,
                        syntax: parent? handler.internal.cloneSyntax : handler.args
                    }, Bagel.internal.checks.disableArgCheck);

                    Bagel.internal.loadCurrent();
                    return sprite;
                },
                extraChecks: (sprite, game, where, idIndex) => {
                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];
                    if (handler.check == null) {
                        return;
                    }
                    let current = Bagel.internal.current;

                    let error = handler.check(sprite, game, Bagel.check, current.plugin, idIndex, where);
                    if (error) {
                        console.error(error);
                        console.log("In " + where);
                        Bagel.internal.oops(game);
                    }
                },
                init: (sprite, game, subFunctions) => {
                    let current = Bagel.internal.current;
                    Bagel.internal.saveCurrent();
                    current.sprite = sprite;
                    current.game = game;
                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];
                    let plugin = handler.internal.plugin;
                    current.plugin = plugin;

                    if (handler.init) {
                        handler.init(sprite, game, current.plugin);
                    }
                    if (game.loaded && game.internal.pluginsDone) {
                        subFunctions.triggerListeners(sprite, game);
                        Bagel.internal.processSprite(sprite);
                    }
                    Bagel.internal.loadCurrent();
                },
                triggerListeners: (sprite, game) => {
                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];
                    let plugin = handler.internal.plugin;
                    if (game.error) return;

                    let noReruns = true;
                    if (handler.listeners.trigger) { // Trigger all the listeners to initialise them
                        for (let property in handler.listeners.property) {
                            if (sprite.internal.Bagel.properties.hasOwnProperty(property)) {
                                let output = Bagel.internal.triggerSpriteListener("set", property, sprite, game, true);

                                if (property != "visible" && output) {
                                    noReruns = false;
                                }
                            }
                        }
                    }
                    else {
                        Bagel.internal.triggerSpriteListener("set", "visible", sprite, game, true);
                    }

                    if (sprite.internal.Bagel.rendererNotInitialized) {
                        if (noReruns) { // Otherwise will be run after the rerun
                            sprite.internal.Bagel.rendererNotInitialized = false;
                            Bagel.internal.subFunctions.createSprite.initRender(sprite, game);
                        }
                    }
                },
                register: {
                    scripts: (type, sprite, game, parent) => {
                        let scripts = sprite.scripts[type];
                        let index = game.internal.scripts.index.sprites[type];
                        let state;

                        for (let i in scripts) {
                            if (parent) { // Clone
                                state = game.state;
                            }
                            else {
                                if (type == "all") {
                                    state = null;
                                }
                                else {
                                    state = scripts[i].stateToRun;
                                }
                            }

                            if (type == "all") {
                                index.push({
                                    script: i,
                                    sprite: sprite,
                                    isClone: sprite.isClone
                                });
                                sprite.internal.Bagel.scripts[type].push({
                                    id: index.length - 1
                                });
                            }
                            else {
                                if (index[state] == null) index[state] = [];

                                index[state].push({
                                    script: i,
                                    sprite: sprite,
                                    isClone: sprite.isClone
                                });
                                sprite.internal.Bagel.scripts[type].push({
                                    id: index[state].length - 1,
                                    state: state
                                });
                            }
                        }
                    },
                    subMethods: (method, methodName, sprite, position, game) => {
                        let isCategory = true;
                        if (method.internal) {
                            if (method.internal.isNotCategory) {
                                isCategory = false;
                            }
                        }

                        if (isCategory) {
                            if (! position[methodName]) position[methodName] = {};
                            for (let c in method) {
                                Bagel.internal.subFunctions.createSprite.register.subMethods(method[c], c, sprite, position[methodName], game);
                            }
                        }
                        else {
                            ((method, sprite, game, position, methodName) => {
                                let fn = method.fn;
                                if (fn.normal) {
                                    position[methodName] = fn.fn;
                                }
                                else {
                                    if (fn.obArg) {
                                        position[methodName] = args => {
                                            if (args == null) args = {};
                                            if (Bagel.internal.getTypeOf(args) != "object") {
                                                console.error("Huh, looks like you used " + Bagel.internal.an(Bagel.internal.getTypeOf(args)) + " instead of an object.");
                                                Bagel.internal.oops(game);
                                            }

                                            args = Bagel.check({
                                                ob: args,
                                                syntax: fn.args,
                                                where: "the sprite " + JSON.stringify(sprite.id) + "'s " + JSON.stringify(methodName) + " method"
                                            }, Bagel.internal.checks.disableArgCheck);
                                            // Passed the argument checks

                                            let current = Bagel.internal.current;
                                            Bagel.internal.saveCurrent();
                                            current.sprite = sprite;
                                            current.game = game;
                                            current.plugin = method.internal.plugin;

                                            let output = fn.fn(sprite, args, game, current.plugin);

                                            Bagel.internal.loadCurrent();
                                            return output;
                                        };
                                    }
                                    else {
                                        position[methodName] = (...args) => {
                                            let keys = Object.keys(fn.args);
                                            let newArgs = {};

                                            // Convert the array to an object using the keys
                                            for (let i in args) {
                                                if (keys[i] == null) {
                                                    keys[i] = "Your " + Bagel.internal.th(parseInt(i)) + " argument";
                                                }
                                                newArgs[keys[i]] = args[i];
                                            }

                                            newArgs = Bagel.check({
                                                ob: newArgs,
                                                syntax: fn.args,
                                                where: "the sprite " + JSON.stringify(sprite.id) + "'s " + JSON.stringify(methodName) + " method"
                                            }, Bagel.internal.checks.disableArgCheck, false, "Btw, the arguments go in this order: " + keys.join(", ") + ".");
                                            // Passed the argument checks

                                            let current = Bagel.internal.current;
                                            Bagel.internal.saveCurrent();
                                            current.sprite = sprite;
                                            current.game = game;
                                            current.plugin = method.internal.plugin;
                                            let output = fn.fn(sprite, newArgs, game, current.plugin);

                                            Bagel.internal.loadCurrent();
                                            return output;
                                        };
                                    }
                                }
                            })(method, sprite, game, position, methodName);
                        }
                    },
                    methods: (sprite, game) => {
                        let handler = game.internal.combinedPlugins.methods.sprite[sprite.type];
                        if (handler == null) return;
                        for (let i in handler) {
                            Bagel.internal.subFunctions.createSprite.register.subMethods(handler[i], i, sprite, sprite, game);
                        }
                    },
                    listeners: (sprite, game, parent) => {
                        let spriteHandler = game.internal.combinedPlugins.types.sprites[sprite.type];
                        let listeners = spriteHandler.listeners;

                        sprite.internal.Bagel.properties = {};

                        for (let property in listeners.property) {
                            let handlers = listeners.property[property];

                            if (["object", "array"].includes(Bagel.internal.getTypeOf(sprite[property])) && handlers.subListen) {
                                sprite.internal.Bagel.properties[property] = Bagel.internal.deepClone(sprite[property]);
                                Object.defineProperty(sprite, property, {
                                    writable: false
                                });

                                for (let i in sprite[property]) {
                                    ((sprite, property, i, game, plugin, handlers, properties) => {
                                        let get = _ => {
                                            Bagel.internal.triggerSpriteListener("get", property, sprite, game, false, i);
                                            return properties[property][i];
                                        };
                                        let set = value => {
                                            if (properties[property][i] != value) { // Don't trigger it if it hasn't actually changed
                                                let original = properties[property][i];
                                                properties[property][i] = value;
                                                Bagel.internal.triggerSpriteListener("set", property, sprite, game, false, i, original);
                                            }
                                        };
                                        if (handlers.get || handlers.set) {
                                            if (handlers.get && handlers.set) {
                                                Object.defineProperty(sprite[property], i, {
                                                    get: get,
                                                    set: set
                                                });
                                            }
                                            else {
                                                if (handlers.get) {
                                                    Object.defineProperty(sprite[property], i, {
                                                        get: get,
                                                        set: value => {properties[property][i] = value}
                                                    });
                                                }
                                                else {
                                                    Object.defineProperty(sprite[property], i, {
                                                        get: _ => properties[property][i],
                                                        set: set
                                                    });
                                                }
                                            }
                                        }
                                    })(sprite, property, i, game, spriteHandler.internal.plugin, handlers, sprite.internal.Bagel.properties);
                                }
                            }
                            else {
                                if (sprite.hasOwnProperty(property)) {
                                    sprite.internal.Bagel.properties[property] = sprite[property];
                                }
                                ((sprite, property, game, plugin, handlers, properties) => {
                                    let get = _ => {
                                        Bagel.internal.triggerSpriteListener("get", property, sprite, game, false);
                                        return properties[property];
                                    };
                                    let set = value => {
                                        if (properties[property] != value) { // Don't trigger it if it hasn't actually changed
                                            let original = properties[property];
                                            properties[property] = value;
                                            Bagel.internal.triggerSpriteListener("set", property, sprite, game, false, null, original);
                                        }
                                    };
                                    if (handlers.get || handlers.set) {
                                        if (handlers.get && handlers.set) {
                                            Object.defineProperty(sprite, property, {
                                                get: get,
                                                set: set
                                            });
                                        }
                                        else {
                                            if (handlers.get) {
                                                Object.defineProperty(sprite, property, {
                                                    get: get,
                                                    set: value => {properties[property] = value}
                                                });
                                            }
                                            else {
                                                Object.defineProperty(sprite, property, {
                                                    get: _ => properties[property],
                                                    set: set
                                                });
                                            }
                                        }
                                    }
                                })(sprite, property, game, spriteHandler.internal.plugin, handlers, sprite.internal.Bagel.properties);
                            }
                        }
                    }
                },
                initRender: (sprite, game) => { // Triggered as part of the triggerListeners function
                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];
                    let plugin = handler.internal.plugin;

                    let current = Bagel.internal.current;
                    Bagel.internal.saveCurrent();
                    current.sprite = sprite;
                    current.game = game;
                    current.plugin = plugin;


                    if (handler.render.init) {
                        Bagel.internal.processSpriteRenderOutput(
                            sprite,
                            handler.render.init(sprite, Bagel.internal.render.bitmapSprite.new, game, plugin)
                        );
                    }
                    Bagel.internal.loadCurrent();
                }
            },
            tick: {
                scripts: (type, sprites, game, state) => {
                    if (Bagel.internal.games[game.id] == null) return;
                    let scripts;
                    if (sprites) {
                        if (type == "all") {
                            scripts = game.internal.scripts.index.sprites[type];
                        }
                        else {
                            scripts = game.internal.scripts.index.sprites[type][state];
                        }
                    }
                    else {
                        if (type == "all") {
                            scripts = game.internal.scripts.index[type];
                        }
                        else {
                            scripts = game.internal.scripts.index[type][state];
                        }
                    }
                    if (scripts == null) { // No scripts
                        return;
                    }

                    let alreadyReset = {};
                    for (let i in scripts) {
                        let scriptInfo = scripts[i];
                        if (scriptInfo == null) continue;

                        if (sprites) {
                            let sprite = scriptInfo.sprite;
                            Bagel.internal.current.sprite = sprite;
                            if (game.internal.idIndex[sprite.id] == null) { // Deleted
                                continue;
                            }

                            if (type == "init" && sprite.scripts.init[scriptInfo.script].affectVisible) { // The sprite's active
                                // Don't trigger it twice
                                if (sprite.internal.Bagel.rerunIndex.visible) {
                                    sprite.internal.Bagel.properties.visible = true;
                                }
                                else {
                                    sprite.visible = true;
                                }
                            }


                            let code;
                            if (type == "all" || sprite.isClone) {
                                code = sprite.scripts[type][scriptInfo.script];
                            }
                            else {
                                code = sprite.scripts[type][scriptInfo.script].code;
                            }
                            if (typeof code == "function") {
                                if (! alreadyReset[sprite.id]) {
                                    alreadyReset[sprite.id] = true;
                                    sprite.debug.scriptTime = 0;
                                }
                                let start = performance.now();
                                code(sprite, game, Bagel.step.sprite);
                                sprite.debug.scriptTime += (performance.now() - start);
                            }
                        }
                        else {
                            let code;
                            if (type == "all") {
                                code = game.game.scripts[type][scriptInfo.script];
                            }
                            else {
                                code = game.game.scripts[type][scriptInfo.script].code;
                            }
                            code(game, Bagel.step.sprite);
                        }
                    }
                },
                pluginScripts: game => {
                    for (let i in game.internal.plugins) {
                        let plugin = game.internal.plugins[i];
                        Bagel.internal.saveCurrent();
                        Bagel.internal.current.plugin = plugin;

                        if (plugin.plugin.scripts.main) plugin.plugin.scripts.main(plugin, game, Bagel.step.plugin.scripts);
                        Bagel.internal.loadCurrent();
                    }
                },
                hideSprites: game => {
                    let sprites = game.game.sprites;
                    let i = 0;
                    while (i < sprites.length) {
                        let sprite = sprites[i];
                        if (sprite == null) {
                            i++;
                            continue;
                        }
                        if (sprite.isClone) {
                            sprite.delete();
                        }
                        else {
                            if (sprite.scripts.all.length == 0) { // Don't hide it if it has "all" scripts
                                sprite.visible = false;
                            }
                        }
                        i++;
                    }
                },
                render: {
                    canvas: {
                        init: game => {
                            let renderer = game.internal.renderer;
                            renderer.maxTextureMaps = Infinity; // Canvas renderers don't have limits
                            renderer.maxTextureSize = Infinity;
                            renderer.maxViewportSize = Infinity;

                            renderer.ctx = renderer.canvas.getContext("2d");
                        },
                        tick: game => {
                            let renderer = game.internal.renderer;
                            let canvas = renderer.canvas;
                            let ctx = renderer.ctx;

                            let scaleX = game.internal.renderer.scaleX;
                            let scaleY = game.internal.renderer.scaleY;

                            let handlers = game.internal.combinedPlugins.types.sprites;

                            let subFunctions = Bagel.internal.subFunctions.tick.render.canvas;
                            subFunctions.queues.bitmapLayers(game);

                            // Clear the canvas
                            let clearStyle = game.config.display.backgroundColor;
                            if (clearStyle == "transparent") {
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                            }
                            else {
                                ctx.fillStyle = clearStyle;
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                            }

                            let textures = renderer.textures;
                            let newLayers = [];
                            for (let i in renderer.layers) {
                                let data = renderer.scaledBitmaps[renderer.layers[i]];
                                if (data) {
                                    let flipX = Math.sign(data.width);
                                    let flipY = Math.sign(data.height);
                                    ctx.scale(flipX, flipY);
                                    ctx.globalAlpha = data.alpha;
                                    ctx.imageSmoothingEnabled = textures[data.image].antialias;
                                    ctx.imageSmoothingQuality = "high";

                                    let halfWidth = data.width / 2;
                                    let halfHeight = data.height / 2;
                                    let img = subFunctions.getTint(data, game, renderer);
                                    if (data.rotation == 90) { // Don't rotate if we don't need to
                                        let x = data.x * flipX;
                                        let y = data.y * flipY;
                                        let width = data.width;
                                        let height = data.height;

                                        if (data.crop) {
                                            ctx.drawImage(img, data.crop.x, data.crop.y, data.crop.width, data.crop.height, x, y, width, height);
                                        }
                                        else {
                                            ctx.drawImage(img, x, y, width, height);
                                        }
                                    }
                                    else {
                                        let angle = Bagel.maths.degToRad(data.rotation - 90);

                                        ctx.scale(flipX, flipY);
                                        ctx.translate((data.x + halfWidth) * flipX, (data.y + halfHeight) * flipY);
                                        ctx.rotate(angle * Math.min(flipX, flipY));
                                        if (data.crop) {
                                            ctx.drawImage(img, data.crop.x, data.crop.y, data.crop.width, data.crop.height, -halfWidth, -halfHeight, data.width, data.height);
                                        }
                                        else {
                                            ctx.drawImage(img, -halfWidth, -halfHeight, data.width, data.height);
                                        }
                                    }
                                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                                    newLayers.push(renderer.layers[i]);
                                }
                            }
                            renderer.layers = newLayers;
                            ctx.globalAlpha = 1;
                        },
                        queues: {
                            bitmapLayers: game => {
                                let renderer = game.internal.renderer;

                                if (renderer.bitmapSpriteData.length == 0 || renderer.bitmapSpriteData.length == 1) { // Nothing to change
                                    renderer.queue.bitmap.layer = [];
                                    return;
                                }
                                let queue = renderer.queue.bitmap.layer;
                                let bitmapIndexes = renderer.bitmapIndexes;
                                let layers = renderer.layers;
                                if (queue.length != 0) {
                                    for (let i in queue) {
                                        if (queue[i] == null) {
                                            continue;
                                        }
                                        let id = queue[i][0];
                                        let mode = queue[i][1];
                                        let originalIndex, c, newLayers;

                                        switch (mode) { // The type of layer operation
                                            case 0: // Bring to front
                                                originalIndex = bitmapIndexes[id];
                                                if (originalIndex == renderer.bitmapCount - 1) { // Already at the front
                                                    break;
                                                }

                                                layers.splice(originalIndex, 1);
                                                layers.push(id);


                                                c = 0;
                                                while (c < bitmapIndexes.length) {
                                                    if (bitmapIndexes[c] > originalIndex) {
                                                        bitmapIndexes[c]--;
                                                    }
                                                    c++;
                                                }
                                                bitmapIndexes[id] = renderer.bitmapCount - 1; // The bitmap that was sent to the front

                                                break;
                                            case 1: // Bring forwards
                                                originalIndex = bitmapIndexes[id];
                                                if (originalIndex == renderer.bitmapCount - 1) { // Already at the front
                                                    break;
                                                }

                                                layers.splice(originalIndex, 1);
                                                layers.splice(originalIndex + 1, 0, id);

                                                bitmapIndexes[layers[originalIndex + 1]]--; // Swap the indexes
                                                bitmapIndexes[id]++;

                                                break;
                                            case 2: // Send to back
                                                originalIndex = bitmapIndexes[id];
                                                if (originalIndex == 0) { // Already at the back
                                                    break;
                                                }

                                                layers.splice(originalIndex, 1);
                                                layers.splice(0, 0, id);

                                                c = 0;
                                                while (c < bitmapIndexes.length) {
                                                    if (bitmapIndexes[c] != null) {
                                                        if (bitmapIndexes[c] < originalIndex) {
                                                            bitmapIndexes[c]++;
                                                        }
                                                    }
                                                    c++;
                                                }
                                                bitmapIndexes[id] = 0; // The bitmap that was sent to the back

                                                break;
                                            case 3: // Send backwards
                                                originalIndex = bitmapIndexes[id];
                                                if (originalIndex == 0) { // Already at the back
                                                    break;
                                                }

                                                layers.splice(originalIndex, 1);
                                                layers.splice(originalIndex - 1, 0, id); // Insert the bitmap back in

                                                bitmapIndexes[layers[originalIndex - 1]]++; // Swap the indexes
                                                bitmapIndexes[id]--;
                                        }
                                    }
                                }
                                renderer.queue.bitmap.layer = [];
                                renderer.layers = layers;
                            }
                        },
                        scaleData: (data, renderer) => {
                            data = {...data};
                            let scaleX = renderer.scaleX;
                            let scaleY = renderer.scaleY;
                            let canvas = renderer.canvas;

                            if (data.rotation == 90) {
                                data.x -= Math.abs(data.width) / 2;
                                data.y -= Math.abs(data.height) / 2;
                            }
                            else {
                                data.x -= data.width / 2;
                                data.y -= data.height / 2;
                            }
                            data.width = (Math.ceil((data.width + data.x) * scaleX)) - (data.x * scaleX);
                            data.height = (Math.ceil((data.height + data.y) * scaleY)) - (data.y * scaleY);
                            data.x = Math.round(data.x * scaleX);
                            data.y = Math.round(data.y * scaleY);
                            return data;
                        },
                        getTint: (data, game, renderer) => {
                            if (data.tint) return renderer.tintedTextures[data.image][data.tint][0];
                            else return renderer.textures[data.image].texture;
                        }
                    },
                    webgl: {
                        compileShader: (type, code, gl, game) => {
                            let shader = gl.createShader(type);
                            gl.shaderSource(shader, code);
                            gl.compileShader(shader);

                            /* Only needed for testing
                            if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { // Did it compile?
                                console.error("Huh. That wasn't supposed to happen. A Bagel.js shader failed to compile.");
                                console.log("Error:\n" + gl.getShaderInfoLog(shader));
                                Bagel.internal.oops(game);
                            }
                            */

                            return shader;
                        },
                        queues: {
                            bitmap: game => {
                                let renderer = game.internal.renderer;
                                let gl = renderer.gl;
                                let bitmapQueue = renderer.queue.bitmap;

                                if (renderer.queueLengths.add != 0 || renderer.queueLengths.delete != 0) {
                                    let toAdd = renderer.queueLengths.add - renderer.queueLengths.delete;
                                    let newVertices = new Float32Array(renderer.vertices.length + (toAdd * 12));
                                    let newTextureCoords = new Float32Array(renderer.textureCoordinates.length + (toAdd * 24));
                                    let bitmapIndexes = renderer.bitmapIndexes;

                                    let startI = 0;
                                    let startC = 0;
                                    let i = 0;
                                    let c = 0;
                                    let removed = 0;
                                    while (i < renderer.vertices.length) {
                                        let id = i / 12;
                                        if (bitmapQueue.delete[id]) {
                                            newVertices.set(renderer.vertices.slice(startI, i), startC);
                                            newTextureCoords.set(renderer.textureCoordinates.slice(startI * 2, i * 2), startC * 2);

                                            removed++;
                                            i += 12;
                                            startC = c;
                                            startI = i;
                                            continue;
                                        }
                                        if (removed != 0) {
                                            bitmapIndexes[bitmapIndexes.indexOf(id)] -= removed;
                                        }

                                        c += 12;
                                        i += 12;
                                    }
                                    newVertices.set(renderer.vertices.slice(startI, i), startC);
                                    newTextureCoords.set(renderer.textureCoordinates.slice(startI * 2, i * 2), startC * 2);

                                    let oldVerticesEnd = c;
                                    previousCount = c / 12;
                                    i = oldVerticesEnd;
                                    c = 0;
                                    let b = 0;
                                    while (c < bitmapQueue.new.length) {
                                        let data = bitmapQueue.new[c];
                                        if (data) {
                                            renderer.bitmapIndexes[data[1]] = previousCount + b;
                                            data = data[0];

                                            Bagel.internal.subFunctions.tick.render.webgl.generateVertices(i, data, newVertices, newTextureCoords, renderer);

                                            i += 12;
                                            b++;
                                        }
                                        c++;
                                    }


                                    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffers.images);
                                    gl.bufferData(gl.ARRAY_BUFFER, newTextureCoords, gl.STATIC_DRAW);

                                    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffers.vertices);
                                    gl.bufferData(gl.ARRAY_BUFFER, newVertices, gl.DYNAMIC_DRAW);
                                    renderer.verticesUpdated = false; // If anything was waiting to be sent to the GPU then it will have been sent by this request

                                    renderer.vertices = newVertices;
                                    renderer.textureCoordinates = newTextureCoords;

                                    bitmapQueue.new = [];
                                    bitmapQueue.delete = {};
                                    renderer.queueLengths.add = 0;
                                    renderer.queueLengths.delete = 0;
                                }
                            },
                            bitmapLayers: game => {
                                let renderer = game.internal.renderer;
                                let gl = renderer.gl;
                                let queue = renderer.queue.bitmap.layer;


                                if (renderer.vertices.length == 0 || renderer.vertices.length == 12) { // Nothing to change
                                    renderer.queue.bitmap.layer = [];
                                    return;
                                }


                                if (queue.length != 0) {
                                    let vertices = Array.from(renderer.vertices);
                                    let texCoords = Array.from(renderer.textureCoordinates);
                                    let bitmapIndexes = renderer.bitmapIndexes;

                                    for (let i in queue) {
                                        let queued = queue[i];
                                        if (queued == null) {
                                            continue;
                                        }
                                        let id = queued[0];
                                        let mode = queued[1];
                                        let originalIndex, thisBitmapVertices, thisBitmapTextureCoords, c;

                                        switch (mode) { // The type of layer operation
                                            case 0: // Bring to front
                                                originalIndex = bitmapIndexes[id];
                                                if (originalIndex * 12 == vertices.length - 12) { // Already at the front
                                                    break;
                                                }

                                                thisBitmapVertices = vertices.slice(originalIndex * 12, (originalIndex * 12) + 12);
                                                thisBitmapTextureCoords = texCoords.slice(originalIndex * 24, (originalIndex * 24) + 24);


                                                vertices.splice(originalIndex * 12, 12); // Remove the bitmap
                                                texCoords.splice(originalIndex * 24, 24);


                                                vertices.push(...thisBitmapVertices); // Add the bitmap back
                                                texCoords.push(...thisBitmapTextureCoords);


                                                c = 0;
                                                while (c < bitmapIndexes.length) {
                                                    if (bitmapIndexes[c] > originalIndex) {
                                                        bitmapIndexes[c]--;
                                                    }
                                                    c++;
                                                }
                                                bitmapIndexes[id] = (vertices.length / 12) - 1; // The bitmap that was sent to the front

                                                break;
                                            case 1: // Bring forwards
                                                originalIndex = bitmapIndexes[id];
                                                if (originalIndex * 12 == vertices.length - 12) { // Already at the front
                                                    break;
                                                }

                                                thisBitmapVertices = vertices.slice(originalIndex * 12, (originalIndex * 12) + 12);
                                                thisBitmapTextureCoords = texCoords.slice(originalIndex * 24, (originalIndex * 24) + 24);


                                                vertices.splice(originalIndex * 12, 12); // Remove the bitmap
                                                texCoords.splice(originalIndex * 24, 24);

                                                vertices.splice((originalIndex * 12) + 12, 0, ...thisBitmapVertices); // Insert the bitmap back in
                                                texCoords.splice((originalIndex * 24) + 24, 0, ...thisBitmapTextureCoords);

                                                bitmapIndexes[bitmapIndexes.indexOf(originalIndex + 1)]--; // Swap the indexes
                                                bitmapIndexes[id]++;

                                                break;
                                            case 2: // Send to back
                                                originalIndex = bitmapIndexes[id];
                                                if (originalIndex == 0) { // Already at the back
                                                    break;
                                                }

                                                thisBitmapVertices = vertices.slice(originalIndex * 12, (originalIndex * 12) + 12);
                                                thisBitmapTextureCoords = texCoords.slice(originalIndex * 24, (originalIndex * 24) + 24);


                                                vertices.splice(originalIndex * 12, 12); // Remove the bitmap
                                                texCoords.splice(originalIndex * 24, 24);

                                                vertices.splice(0, 0, ...thisBitmapVertices); // Add it back in at the start
                                                texCoords.splice(0, 0, ...thisBitmapTextureCoords);


                                                c = 0;
                                                while (c < bitmapIndexes.length) {
                                                    if (bitmapIndexes[c] < originalIndex) {
                                                        bitmapIndexes[c]++;
                                                    }
                                                    c++;
                                                }
                                                bitmapIndexes[id] = 0; // The bitmap that was sent to the back

                                                break;
                                            case 3: // Send backwards
                                                originalIndex = bitmapIndexes[id];
                                                if (originalIndex == 0) { // Already at the back
                                                    break;
                                                }

                                                thisBitmapVertices = vertices.slice(originalIndex * 12, (originalIndex * 12) + 12);
                                                thisBitmapTextureCoords = texCoords.slice(originalIndex * 24, (originalIndex * 24) + 24);


                                                vertices.splice(originalIndex * 12, 12); // Remove the bitmap
                                                texCoords.splice(originalIndex * 24, 24);

                                                vertices.splice((originalIndex * 12) - 12, 0, ...thisBitmapVertices); // Insert the bitmap back in
                                                texCoords.splice((originalIndex * 24) - 24, 0, ...thisBitmapTextureCoords);

                                                bitmapIndexes[bitmapIndexes.indexOf(originalIndex - 1)]++; // Swap the indexes
                                                bitmapIndexes[id]--;
                                        }
                                    }

                                    vertices = new Float32Array(vertices);
                                    texCoords = new Float32Array(texCoords);
                                    renderer.vertices = vertices;
                                    renderer.textureCoordinates = texCoords;


                                    renderer.queue.bitmap.layer = [];

                                    renderer.verticesUpdated = true;
                                }
                            },
                            textures: game => {
                                let renderer = game.internal.renderer;
                                let gl = renderer.gl;
                                let queues = renderer.queue.textures;
                                let subFunctions = Bagel.internal.subFunctions.tick.render.webgl;

                                let bitmapsRegenerated = {};

                                let actions = {}; // Batch up the actions for each texture map
                                if (Object.keys(queues.update).length != 0) {
                                    for (let id in queues.update) {
                                        let queuedTexture = queues.update[id];
                                        let position = queuedTexture.position;

                                        if (actions[position.textureID] == null) actions[position.textureID] = [];

                                        actions[position.textureID].push([queuedTexture.texture, position.x, position.y]);
                                    }
                                    renderer.queue.textures.update = {};
                                }
                                if (Object.keys(queues.delete).length != 0) {
                                    for (let id in queues.delete) {
                                        let position = queues.delete[id].position;


                                    }
                                    renderer.queue.textures.delete = {};
                                }
                                if (Object.keys(queues.new).length != 0) {
                                    for (let id in queues.new) {
                                        let queuedTexture = queues.new[id];
                                        subFunctions.queues.allocateTextureInMap(queuedTexture, game, renderer);


                                        let position = queuedTexture.position;
                                        let chosenMap = position.textureID;
                                        if (actions[chosenMap] == null) actions[chosenMap] = [];

                                        actions[chosenMap].push([queuedTexture.texture, position.x, position.y]);

                                        // Update the texture coordinates of any sprites using this texture
                                        let bitmapsUsing = renderer.bitmapsUsingTextures[id];
                                        if (bitmapsUsing.length != 0) {
                                            for (let i in bitmapsUsing) {
                                                let id = bitmapsUsing[i];
                                                let index = renderer.bitmapIndexes[id];
                                                if (index === true) continue; // Still pending, don't need to regenerate

                                                bitmapsRegenerated[i] = true;

                                                subFunctions.generateVertices(index * 12, renderer.bitmapSpriteData[id], renderer.vertices, renderer.textureCoordinates, renderer, false); // Only regenerates texture coords, not vertices
                                            }
                                            renderer.verticesUpdated = true;
                                        }
                                    }
                                    renderer.queue.textures.new = {};
                                }

                                for (let textureMapID in actions) {
                                    textureMapID = parseInt(textureMapID);
                                    gl.activeTexture(gl.TEXTURE0 + textureMapID);
                                    for (let i in actions[textureMapID]) {
                                        let action = actions[textureMapID][i];

                                        gl.texSubImage2D(gl.TEXTURE_2D, 0, action[1], action[2], gl.RGBA, gl.UNSIGNED_BYTE, action[0]);
                                    }
                                }

                                if (Object.keys(queues.resizedTextureMaps).length != 0) { // Any sprites using a texture from a resized texture map will need its texture coordinates regenerated
                                    for (let id in renderer.textures) {
                                        let texture = renderer.textures[id];
                                        if (! queues.resizedTextureMaps[texture.position.textureID]) continue; // Unaffected

                                        let bitmapsUsing = renderer.bitmapsUsingTextures[id];
                                        for (let i in bitmapsUsing) {
                                            let id = bitmapsUsing[i];
                                            let index = renderer.bitmapIndexes[id];
                                            if (index === true) continue;
                                            if (bitmapsRegenerated[id]) continue;

                                            subFunctions.generateVertices(index * 12, renderer.bitmapSpriteData[id], renderer.vertices, renderer.textureCoordinates, renderer, false); // Only regenerates texture coords, not vertices
                                        }
                                    }
                                    renderer.verticesUpdated = true;
                                    queues.resizedTextureMaps = {};
                                }
                            },
                            allocateTextureInMap: (texture, game, renderer) => {
                                let subFunctions = Bagel.internal.subFunctions.tick.render.webgl;

                                let width = texture.width;
                                let height = texture.height;

                                let index = 0;
                                while (index < renderer.maxTextureMaps - 1) {
                                    let textureMap = renderer.textureMaps[index];
                                    subFunctions.activateTextureMap(index, game, renderer, textureMap.width, false);

                                    let lines = textureMap.lines;

                                    let foundPosition = false;
                                    let i = 0;
                                    let a = 0;
                                    let drawX = 0;
                                    let drawY = 0;
                                    for (i in lines) {
                                        for (a in lines[i]) {
                                            let line = lines[i][a];

                                            if (width <= line[1]) {
                                                let c = 0;
                                                let d = i;
                                                let y = parseInt(i);

                                                drawX = line[0];
                                                drawY = y;

                                                let valid = false;
                                                while (c < height) { // Check the rows to see if there's space
                                                    if (lines[d].length == 0) { // Make sure a row hasn't been skipped
                                                        valid = false;
                                                        break;
                                                    }
                                                    y++;
                                                    d++;
                                                    valid = false;
                                                    for (let b in lines[d]) {
                                                        let newLine = lines[d][b];
                                                        if (newLine[0] <= line[0]) { // Make sure the line starts at the same x position or before
                                                            valid = true;
                                                            break;
                                                        }
                                                    }
                                                    if (! valid) {
                                                        break;
                                                    }
                                                    c++;
                                                }
                                                if (valid) {
                                                    foundPosition = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (foundPosition) {
                                            break;
                                        }
                                    }

                                    if (foundPosition) {
                                        // Update the lines
                                        let newLines = [];
                                        let done = false;
                                        i = parseInt(i);
                                        let unchanged = lines.slice(0, i);
                                        while (i < lines.length) { // i is deliberately not reset
                                            newLines.push([]);
                                            for (a in lines[i]) { // a is reset
                                                let line = lines[i][a];
                                                if (a == 0) { // Exit if this row is lower than the bottom of the image
                                                    if (i >= drawY + height) {
                                                        newLines.pop();
                                                        done = true;
                                                        break;
                                                    }
                                                }

                                                if (drawX >= line[0] + line[1]
                                                    || drawX + width <= line[0]
                                                ) { // Ignore lines where it doesn't overlap with the image bounding box
                                                    newLines[newLines.length - 1].push(line);
                                                    continue;
                                                }

                                                let needsSorting = false;
                                                if (line[0] < drawX) { // There's a part of the line to the left of the image
                                                    let lineWidth = drawX - line[0];
                                                    newLines[newLines.length - 1].push([line[0], lineWidth]);
                                                    needsSorting = true;
                                                }
                                                if (line[0] + line[1] > drawX + width) { // Part to the right
                                                    let lineWidth = (line[0] + line[1]) - (drawX + width);
                                                    newLines[newLines.length - 1].push([drawX + width, lineWidth]);
                                                    needsSorting = true;
                                                }

                                                if (needsSorting) {
                                                    newLines[newLines.length - 1].sort((first, second) => first[0] - second[0]);
                                                }
                                            }
                                            if (done) {
                                                break;
                                            }
                                            i++;
                                        }
                                        let afterLines = lines.slice(i, lines.length);
                                        textureMap.lines = [
                                            ...unchanged,
                                            ...newLines,
                                            ...afterLines
                                        ];


                                        textureMap.textureCount++;
                                        texture.position = {
                                            textureID: index,
                                            singleTexture: false,
                                            x: drawX,
                                            y: drawY,
                                            clip: subFunctions.clipTextureCoords(drawX, drawY, width, height, textureMap.width)
                                        };
                                        texture.pending = false;
                                        return;
                                    }
                                    else {
                                        if (! subFunctions.activateTextureMap(index, game, renderer, textureMap.width + 1, false)) { // Try to expand the texture map
                                            index++; // Otherwise try the next one
                                        }
                                    }
                                }

                                if (index == renderer.maxTextureMaps) {
                                    if (! game.error) {
                                        console.error("Huh, that wasn't supposed to happen. Bagel.js ran out of textures. Try and reduce the number your'e using (tip: canvas sprites have a separate texture for every clone by default) or use lower resolution textures. If you can't do either, you can try using the \"canvas\" renderer instead.\nYou can see the texture utilisation using \"Game.debug.textures.showCombined(<combined texture index>)\".");
                                        Bagel.internal.oops(game);
                                    }
                                    return;
                                }
                            }
                        },

                        generateVertices: (i, data, vertices, textureCoords, renderer, skipVertices) => {
                            if (! skipVertices) {
                                let halfWidth = Math.abs(data.width / 2);
                                let halfHeight = Math.abs(data.height / 2);
                                let left = data.x - halfWidth;
                                let top = data.y - halfHeight;
                                let right = data.x + halfWidth;
                                let bottom = data.y + halfHeight;
                                vertices.set([
                                    left,
                                    top,

                                    right,
                                    top,

                                    left,
                                    bottom,

                                    left,
                                    bottom,

                                    right,
                                    top,

                                    right,
                                    bottom
                                ], i);


                                let subFunctions = Bagel.internal.subFunctions.tick.render.webgl;
                                subFunctions.rotateVertices(vertices, i, data.rotation, data.x, data.y);
                                subFunctions.clipVertices(vertices, i, renderer);
                            }

                            let texture = renderer.textures[data.image];
                            let clip = texture.position.clip;
                            let textureID = texture.position.textureID;
                            let alpha = data.alpha;
                            let xZero = clip.xZero;
                            let xOne = clip.xOne;
                            if (Math.sign(data.width) == -1) {
                                xZero = clip.xOne;
                                xOne = clip.xZero;
                            }
                            let yZero = clip.yZero;
                            let yOne = clip.yOne;
                            if (Math.sign(data.height) == -1) {
                                yZero = clip.yOne;
                                yOne = clip.yZero;
                            }
                            textureCoords.set([
                                xZero,
                                yZero,
                                textureID,
                                alpha,

                                xOne,
                                yZero,
                                textureID,
                                alpha,

                                xZero,
                                yOne,
                                textureID,
                                alpha,

                                xZero,
                                yOne,
                                textureID,
                                alpha,

                                xOne,
                                yZero,
                                textureID,
                                alpha,

                                xOne,
                                yOne,
                                textureID,
                                alpha
                            ], i * 2);
                        },
                        rotateVertices: (vertices, i, angle, cx, cy) => {
                            let rad = Bagel.maths.degToRad(angle - 90);
                            let sin = -Math.sin(rad);
                            let cos = Math.cos(rad);

                            let c = 0;
                            while (c < 6) {
                                let x = vertices[i];
                                let y = vertices[i + 1];

                                // Somewhat adapted from https://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
                                vertices[i] = (cos * (x - cx)) + (sin * (y - cy)) + cx;
                                vertices[i + 1] = (cos * (y - cy)) - (sin * (x - cx)) + cy;

                                c++;
                                i += 2;
                            }
                            return vertices;
                        },
                        clipVertices: (vertices, i, renderer) => {
                            let scaleX = renderer.scaleX;
                            let scaleY = renderer.scaleY;
                            let canvas = renderer.canvas;

                            let c = 0;
                            while (c < 6) {
                                let x = vertices[i];
                                let y = vertices[i + 1];

                                if (c == 1 || c == 4 || c == 5) {
                                    vertices[i] = ((Math.ceil(x * scaleX) / canvas.width) * 2) - 1;
                                }
                                else {
                                    vertices[i] = ((Math.floor(x * scaleX) / canvas.width) * 2) - 1;
                                }
                                if (c == 2 || c == 3 || c == 5) {
                                    vertices[i + 1] = -(((Math.ceil(y * scaleY) / canvas.height) * 2) - 1);
                                }
                                else {
                                    vertices[i + 1] = -(((Math.floor(y * scaleY) / canvas.height) * 2) - 1);
                                }

                                c++;
                                i += 2;
                            }
                            renderer.verticesUpdated = true;
                        },
                        clipTextureCoords: (x, y, width, height, resolution) => ({
                            xZero: (x + 0.5) / resolution,
                            yZero: (y + 0.5) / resolution,
                            xOne: (x + width - 0.5) / resolution,
                            yOne: (y + height - 0.5) / resolution
                        }),

                        renderToTextureMap: (id, game, renderer) => {
                            let gl = renderer.gl;
                            let textureMap = renderer.textureMaps[id];

                            let frameBuffer = renderer.tmpFrameBuffer;
                            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
                            gl.viewport(0, 0, textureMap.width, textureMap.height);
                            if (renderer.tmpFrameBufferTextureID != id) {
                                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureMap.texture, 0);
                                renderer.tmpFrameBufferTextureID = id;
                            }
                            renderer.usingTmpFrameBuffer = true;
                        },
                        renderToCanvas: (game, renderer) => {
                            if (renderer.usingTmpFrameBuffer) {
                                let gl = renderer.gl;
                                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

                                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                                gl.enable(gl.BLEND);
                                renderer.usingTmpFrameBuffer = false;
                            }
                        },

                        activateTextureMap: (id, game, renderer, min=0, antialias) => {
                            let gl = renderer.gl;
                            let resolutions = renderer.textureMapResolutions;

                            let resolution = resolutions[0];
                            let i = 0;
                            while (resolution < min) {
                                resolution = resolutions[i];
                                if (resolution == null || resolution > renderer.maxTextureSize) return false; // Too big
                                i++;
                            }

                            let textureMap = renderer.textureMaps[id];
                            let previousResolution = textureMap.active? textureMap.width : 0;
                            if (resolution == previousResolution) return true;

                            let copyNeeded = textureMap.textureCount != 0;

                            let tmpTextureID = renderer.textureMaps.length - 1;
                            let tmpTexture = renderer.textureMaps[tmpTextureID];

                            textureMap.active = true;
                            textureMap.width = resolution;
                            textureMap.height = resolution;

                            let lines = textureMap.lines;
                            let oldLines = JSON.stringify(lines);
                            let cancelShrink = false;
                            i = 0;
                            while (i < previousResolution) {
                                let last = lines[i] == null? null : lines[i][lines[i].length - 1];
                                if (resolution < previousResolution) {
                                    if (last == null || last[1] < previousResolution - resolution) {
                                        cancelShrink = true;
                                        break;
                                    }
                                }
                                if (last) { // There's a line already
                                    if (last[0] + last[1] == previousResolution) {
                                        last[1] += resolution - previousResolution;
                                    }
                                    else {
                                        let width = resolution - previousResolution;
                                        lines[i].push([resolution - width, width]);
                                    }

                                    last = lines[i][lines[i].length - 1];
                                    if (last[1] <= 0) lines[i].pop();
                                }
                                else { // Won't be reached if it's being shrunk
                                    lines[i] = [[previousResolution, resolution - previousResolution]];
                                }
                                i++;
                            }

                            if (! cancelShrink) {
                                if (resolution > previousResolution) {
                                    while (lines.length != resolution) {
                                        let line = [0, resolution];

                                        lines.push([line]);
                                    }
                                }
                                else {
                                    let i = resolution;
                                    while (lines.length != resolution) {
                                        if (lines[i].length != 1 || lines[i][0] != 0 || lines[i][1] != previousResolution) {
                                            cancelShrink = true;
                                            break;
                                        }

                                        i++;
                                    }
                                    if (! cancelShrink) {
                                        lines.slice(resolution);
                                    }
                                }
                            }

                            if (cancelShrink) {
                                textureMap.lines = JSON.parse(oldLines);
                                return true;
                            }

                            let subFunctions = Bagel.internal.subFunctions.tick.render.webgl;
                            if (copyNeeded) {
                                // Make a temporary copy of this texture map
                                subFunctions.renderToTextureMap(id, game, renderer);
                                gl.activeTexture(gl.TEXTURE0 + tmpTextureID);
                                if (previousResolution > tmpTexture.width) {
                                    gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, previousResolution, previousResolution, 0);
                                }
                                else { // Reuse the texture
                                    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, previousResolution, previousResolution);
                                    tmpTexture.width = previousResolution;
                                    tmpTexture.height = previousResolution;
                                }
                            }

                            gl.activeTexture(gl.TEXTURE0 + id);
                            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution, resolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                            if (copyNeeded) { // Copy it back
                                subFunctions.renderToTextureMap(tmpTextureID, game, renderer);
                                gl.activeTexture(gl.TEXTURE0 + id);
                                gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, previousResolution, previousResolution);
                            }

                            let textureMapTexture = renderer.textures[".Internal.textureMap." + id];
                            textureMapTexture.antialias = antialias;
                            textureMapTexture.width = resolution;
                            textureMapTexture.height = resolution;
                            textureMapTexture.position.clip = subFunctions.clipTextureCoords(0, 0, resolution, resolution, resolution);


                            // Re-clip any previously existing textures
                            if (textureMap.textureCount != 0) {
                                for (let textureID in renderer.textures) {
                                    let texture = renderer.textures[textureID];
                                    let pos = texture.position;

                                    if (pos.textureID == id) {
                                        texture.position.clip = subFunctions.clipTextureCoords(pos.x, pos.y, texture.width, texture.height, resolution);
                                    }
                                }
                            }

                            // Queue regenerating the texture coordinates for the bitmapSprites using these textures
                            renderer.queue.textures.resizedTextureMaps[id] = true;

                            return true;
                        },

                        init: game => {
                            let renderer = game.internal.renderer;
                            let gl = renderer.gl;

                            let subFunctions = Bagel.internal.subFunctions.tick.render.webgl;
                            let compileShader = subFunctions.compileShader;
                            let vertex = compileShader(gl.VERTEX_SHADER, `
                                attribute vec2 a_vertices;
                                attribute vec4 a_texCoords;

                                varying vec4 v_texcoord;

                                void main () {
                                    v_texcoord = a_texCoords;
                                    gl_Position = vec4(
                                        a_vertices,
                                        0,
                                        1
                                    );
                                }
                            `, gl, game);

                            let textureCount = Bagel.device.webgl.textureCountLimit;
                            renderer.maxTextureMaps = textureCount;
                            renderer.maxTextureSize = Bagel.device.webgl.textureSizeLimit;
                            renderer.maxViewportSize = Bagel.device.webgl.viewportSizeLimit;

                            let textureCode = "";
                            let c = 1;
                            while (c < textureCount) { // WebGL texture accessing has to be determined at compilation so the code for all the uses has to be preprogrammed in
                                textureCode += `
                                else if (textureID == <c>) {
                                    pixel = texture2D(u_images[<c>], v_texcoord.xy);
                                }`.replaceAll("<c>", c);
                                c++;
                            }

                            let fragment = compileShader(gl.FRAGMENT_SHADER, `
                                precision mediump float;
                                uniform sampler2D u_images[<textureCount>];
                                varying vec4 v_texcoord;

                                // From https://gamedev.stackexchange.com/questions/34278/can-you-dynamically-set-which-texture-to-use-in-shader

                                vec4 pixel = vec4(0.0, 0.0, 0.0, 0.0);
                                vec4 getPixel() {
                                    int textureID = int(v_texcoord.z);
                                    if (textureID == 0) {
                                        pixel = texture2D(u_images[0], v_texcoord.xy);
                                    }[...]
                                    return pixel;
                                }

                                void main() {
                                    pixel = getPixel();
                                    pixel.rgb *= pixel.a * v_texcoord.a;
                                    pixel.a *= v_texcoord.a;

                                    gl_FragColor = pixel;
                                }
                            `.replace("[...]", textureCode).replace("<textureCount>", textureCount), gl, game);

                            let program = gl.createProgram();
                            gl.attachShader(program, vertex);
                            gl.attachShader(program, fragment);

                            gl.bindAttribLocation(program, renderer.locations.vertices, "a_vertices");
                            gl.bindAttribLocation(program, renderer.locations.texCoords, "a_texCoords");

                            gl.linkProgram(program);
                            /*
                            if (! gl.getProgramParameter(program, gl.LINK_STATUS)) { // Error
                                console.error("Err... a Bagel.js shader program failed to link. That wasn't supposed to happen.");
                                console.log(gl.getProgramInfoLog(program));
                                gl.deleteProgram(program); // Delete the program
                                Bagel.internal.oops(game);
                            }
                            */
                            gl.useProgram(program);

                            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                            gl.enable(gl.BLEND);

                            // https://stackoverflow.com/questions/19592850/how-to-bind-an-array-of-textures-to-a-webgl-shader-uniform
                            renderer.locations.images = gl.getUniformLocation(program, "u_images");
                            gl.uniform1iv(renderer.locations.images, [...Array(textureCount).keys()]);

                            let verticesLocation = renderer.locations.vertices;
                            gl.enableVertexAttribArray(verticesLocation); // Enable it
                            renderer.buffers.vertices = gl.createBuffer();
                            gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffers.vertices);
                            gl.vertexAttribPointer(verticesLocation, 2, gl.FLOAT, false, 0, 0);
                            gl.bufferData(gl.ARRAY_BUFFER, renderer.vertices, gl.DYNAMIC_DRAW);

                            let textureLocation = renderer.locations.texCoords;
                            gl.enableVertexAttribArray(textureLocation); // Enable it
                            renderer.buffers.images = gl.createBuffer();
                            gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffers.images);
                            gl.vertexAttribPointer(textureLocation, 4, gl.FLOAT, false, 0, 0);
                            gl.bufferData(gl.ARRAY_BUFFER, renderer.textureCoordinates, gl.STATIC_DRAW);

                            let blankTexture = renderer.blankTexture;

                            let i = 0;
                            while (i < textureCount) { // Fill the webgl textures with blank textures
                                let glTexture = gl.createTexture();
                                gl.activeTexture(gl.TEXTURE0 + i);
                                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

                                if (i == textureCount - 1) { // The temporary texture
                                    renderer.textureMaps.push({
                                        active: true,
                                        width: 1,
                                        height: 1,
                                        texture: glTexture
                                    });
                                }
                                else {
                                    renderer.textureMaps.push({
                                        active: false,
                                        width: null,
                                        height: null,
                                        textureCount: 0,
                                        lines: [],
                                        texture: glTexture
                                    });

                                    let id = ".Internal.textureMap." + i;
                                    renderer.textures[id] = {
                                        pending: false,
                                        position: {
                                            textureID: i,
                                            x: 0,
                                            y: 0,
                                            clip: subFunctions.clipTextureCoords(0, 0, 1, 1, 1)
                                        },
                                        texture: null,

                                        antialias: false,
                                        width: 1,
                                        height: 1
                                    };
                                    renderer.bitmapsUsingTextures[id] = [];
                                }

                                i++;
                            }

                            // Get a texture map ready ahead of time
                            subFunctions.activateTextureMap(0, game, renderer, 0, game.config.display.antialias.textures);

                            renderer.tmpFrameBuffer = gl.createFramebuffer();

                            renderer.webGLInitialized = true;
                        },
                        tick: game => {
                            let renderer = game.internal.renderer;
                            let gl = renderer.gl;
                            let subFunctions = Bagel.internal.subFunctions.tick.render.webgl;
                            let queues = subFunctions.queues;
                            queues.textures(game, renderer);
                            queues.bitmap(game);
                            queues.bitmapLayers(game);


                            let backgroundColor = game.config.display.backgroundColor;
                            if (backgroundColor != renderer.lastBackgroundColor) {
                                renderer.colorCtx.fillStyle = backgroundColor;
                                renderer.colorCtx.fillRect(0, 0, 1, 1);
                                let pixel = renderer.colorCtx.getImageData(0, 0, 1, 1).data;
                                renderer.backgroundColor = [...pixel].map(value => value / 255);

                                renderer.lastBackgroundColor = backgroundColor;
                            }

                            subFunctions.renderToCanvas(game, renderer);

                            gl.clearColor(...renderer.backgroundColor);
                            gl.clear(gl.COLOR_BUFFER_BIT);

                            if (renderer.vertices.length != 0) {
                                if (renderer.verticesUpdated) {
                                    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffers.images);
                                    gl.bufferData(gl.ARRAY_BUFFER, renderer.textureCoordinates, gl.STATIC_DRAW);
                                    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffers.vertices);
                                    gl.bufferData(gl.ARRAY_BUFFER, renderer.vertices, gl.DYNAMIC_DRAW);

                                    renderer.verticesUpdated = false;
                                }

                                gl.drawArrays(gl.TRIANGLES, 0, renderer.vertices.length / 2);
                            }
                        }
                    }
                },
                spriteRenderTick: game => {
                    for (let i in game.game.sprites) {
                        let sprite = game.game.sprites[i];
                        if (sprite == null) continue;

                        if (! sprite.internal.Bagel.rendererNotInitialized) {
                            let handler = game.internal.combinedPlugins.types.sprites[sprite.type];

                            let bitmapFunctions = Bagel.internal.render.bitmapSprite;
                            if (handler.render.tick) {
                                Bagel.internal.processSpriteRenderOutput(
                                    sprite,
                                    handler.render.tick(sprite, bitmapFunctions.update, bitmapFunctions.new, bitmapFunctions.delete, game, handler.internal.plugin)
                                );
                            }

                            if (sprite.internal.Bagel.properties.visible && sprite.internal.Bagel.onVisibleTriggered) { // Saves some resources by avoiding the getter
                                if (handler.render.whileVisible) {
                                    Bagel.internal.processSpriteRenderOutput(
                                        sprite,
                                        handler.render.whileVisible(sprite, bitmapFunctions.update, bitmapFunctions.new, bitmapFunctions.delete, game, handler.internal.plugin)
                                    );
                                }
                            }
                        }
                    }
                },
                processSprites: game => {
                    if (Bagel.internal.games[game.id] == null) { // From a deleted game
                        sprite.internal.Bagel.rerunListeners = [];
                        return;
                    }

                    for (let i in game.game.sprites) {
                        let sprite = game.game.sprites[i];
                        if (sprite == null) continue;
                        Bagel.internal.processSprite(sprite);
                    }
                },
                loaded: (game, start) => { // Loaded logic
                    let subFunctions = Bagel.internal.subFunctions.tick;

                    let renderer = game.internal.renderer;

                    if (! game.paused) {
                        subFunctions.pluginScripts(game);
                        subFunctions.processSprites(game);
                        let state = game.state;
                        if (state != game.internal.lastState) {
                            Bagel.internal.triggerPluginListener("state", game, state);
                            if (game.internal.assets.loading == 0) {
                                subFunctions.hideSprites(game);

                                subFunctions.scripts("init", true, game, state);
                                subFunctions.scripts("init", false, game, state);
                                game.internal.lastState = state;
                            }
                            else { // Something needs to load
                                game.loaded = false;
                                return true;
                            }
                        }

                        subFunctions.scripts("main", true, game, state);
                        subFunctions.scripts("main", false, game, state);
                        subFunctions.scripts("all", true, game, state);
                        subFunctions.scripts("all", false, game, state);


                        if (Bagel.internal.games[game.id] == null) return;

                        subFunctions.spriteRenderTick(game);
                        let renderStart;
                        if (renderer.type == "canvas") {
                            renderStart = performance.now();
                            game.scriptTime = renderStart - start;
                        }
                        else {
                            game.internal.scriptEndTime = performance.now();
                        }
                        subFunctions.render[game.internal.renderer.type].tick(game);
                        if (renderer.type == "canvas") {
                            game.renderTime = performance.now() - renderStart;
                            game.frameTime = game.scriptTime + game.renderTime;
                        }
                    }
                },
                loading: game => {
                    if (! game.config.loading.skip) {
                        let renderer = game.internal.renderer;
                        let canvas = renderer.canvas;
                        let ctx = renderer.ctx;
                        let loadingScreen = game.internal.loadingScreen;
                        let assets = game.internal.assets;
                        let loading = loadingScreen.vars.loading;

                        if (assets.loading + assets.loaded == 0) {
                            loading.progress = 100; // Avoid dividing by 0
                        }
                        else {
                            loading.progress = (assets.loaded / (assets.loading + assets.loaded)) * 100;
                        }
                        loading.loaded = assets.loaded;
                        loading.loading = assets.loading;
                        if (assets.loading != 0) {
                            let tasks = game.game.scripts.preload;
                            if (assets.loading <= assets.assetsLoading) { // The assets are done loading but the tasks need running
                                if (assets.ranTasks) {
                                    if (tasks.misc && assets.loading == 1) { // Only the misc function left
                                        tasks.misc(game);
                                        assets.loaded++;
                                        assets.loading--;
                                    }
                                }
                                else {
                                    let ready = (assets => _ => {
                                        assets.loaded++;
                                        assets.loading--;
                                    })(assets);
                                    for (let i in tasks.tasks) {
                                        tasks.tasks[i](game, ready);
                                    }
                                    assets.ranTasks = true;
                                }
                            }
                        }

                        if (loadingScreen.vars.loading.done) {
                            game.loaded = true;
                            Bagel.internal.subFunctions.init.deleteLoadingScreen(game);
                            Bagel.internal.subFunctions.init.onload(game);
                        }
                    }
                },
                tick: _ => {
                    Bagel.internal.requestAnimationFrame.call(window, Bagel.internal.tick);
                },
                scaleCanvas: game => {
                    let width = window.innerWidth;
                    let height = window.innerHeight;
                    let renderer = game.internal.renderer;
                    let ratio = renderer.ratio;
                    let wHeight = width / ratio;
                    if (height > wHeight) {
                        height = wHeight;
                    }
                    else {
                        if (height != wHeight) {
                            width = height * ratio;
                        }
                    }
                    let renderWidth, renderHeight;
                    let res = game.config.display.resolution;
                    if (res == "full") {
                        renderWidth = width * window.devicePixelRatio;
                        renderHeight = height * window.devicePixelRatio;
                    }
                    else {
                        if (res == "fixed") {
                            renderWidth = game.width;
                            renderHeight = game.height;
                        }
                        else {
                            renderWidth = res[0];
                            renderHeight = res[1];
                        }
                    }

                    renderWidth = Math.ceil(renderWidth); // The canvas width has to be a whole number
                    renderHeight = Math.ceil(renderHeight);
                    width = Math.round(width);
                    height = Math.round(height);

                    let max = renderer.maxViewportSize;
                    if (renderWidth > max || renderHeight > max) { // Cap it
                        if (renderWidth > renderHeight) {
                            renderWidth = max;
                            renderHeight = Math.ceil(renderWidth / ratio);
                        }
                        else {
                            renderHeight = max;
                            renderWidth = Math.ceil(renderHeight * ratio);
                        }
                    }

                    let canvas = renderer.canvas;
                    if (canvas.width != renderWidth || canvas.height != renderHeight) {
                        if (renderer.waitingWidth == renderWidth && renderer.waitingHeight == renderHeight) {
                            canvas.width = renderWidth;
                            canvas.height = renderHeight;
                            renderer.scaleX = canvas.width / game.width;
                            renderer.scaleY = canvas.height / game.height;

                            let gl = renderer.gl;
                            if (gl) {
                                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                            }
                            for (let id in renderer.bitmapIndexes) { // Regenerate the texture coordinates
                                let data = renderer.bitmapSpriteData[id];
                                if (data) {
                                    Bagel.internal.render.bitmapSprite.update(id, data, game, false, true);
                                }
                            }
                        }
                    }
                    canvas.style.width = width + "px";
                    canvas.style.height = height + "px";
                    renderer.styleWidth = width; // These will be numbers which saves resources when doing calculations with them (no parsing needed)
                    renderer.styleHeight = height;

                    let x = (window.innerWidth - width) / 2; // From Phaser (https://phaser.io)
                    canvas.style.marginLeft = Math.floor(x) + "px";
                    canvas.style.marginRight = -Math.ceil(x) + "px";
                    let y = (window.innerHeight - height) / 2;
                    canvas.style.marginTop = Math.floor(y) + "px";
                    canvas.style.marginBottom = -Math.ceil(y) + "px";

                    if (! game.config.display.antialias.canvas) {
                        Bagel.internal.tryStyles(canvas, "image-rendering", [
                            "pixelated",
                            "optimize-contrast",
                            "-moz-crisp-edges",
                            "-o-crisp-edges",
                            "-webkit-optimize-contrast",
                            "optimizeSpeed"
                        ]);
                    }

                    renderer.waitingWidth = renderWidth;
                    renderer.waitingHeight = renderHeight;
                },
                calculateRenderTime: _ => {
                    let fps = 1000 / (performance.now() - Bagel.internal.frameStartTime);
                    for (let i in Bagel.internal.games) {
                        let game = Bagel.internal.games[i];
                        if (game) {
                            let renderTime = performance.now() - game.internal.scriptEndTime;
                            if (game.internal.renderer.type != "canvas") {
                                game.renderTime = renderTime;
                                game.frameTime = game.scriptTime + renderTime;
                            }
                            game.maxPossibleFPS = fps;
                        }
                    }
                }
            },
            delete: {
                event: (sprite, game, current) => {
                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];
                    current.plugin = handler.internal.plugin;
                    handler = handler.listeners.events.delete;
                    if (handler) {
                        handler(sprite, game, current.plugin);
                    }
                },
                bitmapSprite: (me, game) => {
                    if (me.internal.Bagel.renderID != null) {
                        Bagel.internal.render.bitmapSprite.delete(me.internal.Bagel.renderID, game);
                    }
                },
                scripts: (type, me, game) => {
                    let scripts = me.internal.Bagel.scripts[type];
                    if (Object.keys(scripts).length == 0) return; // No scripts to remove
                    let scriptIndex = game.internal.scripts.index.sprites[type];
                    for (let i in scripts) {
                        let script = scripts[i];
                        if (type == "all") {
                            scriptIndex[script.id] = null; // Mark them as null so we know which ones to remove in a minute
                        }
                        else {
                            scriptIndex[script.state][script.id] = null; // Mark them as null so we know which ones to remove in a minute
                        }
                    }

                    // Remove the nulls
                    let newScripts = [];
                    for (i in scriptIndex) {
                        let removed = 0;
                        if (type != "all") newScripts = [];
                        let loop = type == "all"? "a" : scriptIndex[i];
                        for (let c in loop) {
                            let script;
                            if (type == "all") {
                                script = scriptIndex[i];
                            }
                            else {
                                script = loop[c];
                            }
                            if (script == null) { // This will be removed
                                removed++;
                            }
                            else {
                                if (removed != 0) {
                                    if (type == "all") {
                                        script.sprite.internal.Bagel.scripts[script.script].id -= removed; // The id will have changed for anything after a deleted script
                                    }
                                    else {
                                        script.sprite.internal.Bagel.scripts[type][script.script].id -= removed; // The id will have changed for anything after a deleted script
                                    }
                                }
                                newScripts.push(script); // If it's not null, it can stay
                            }
                        }
                        if (type != "all") scriptIndex[i] = newScripts;
                    }
                    if (type == "all") game.internal.scripts.index.sprites[type] = newScripts;
                },
                misc: (me, game) => {
                    game.game.sprites[me.idIndex] = null;
                    game.internal.idIndex[me.id] = null;
                    if (me.isClone) {
                        me.parent.cloneCount--;
                        let index = me.parent.cloneIDs.indexOf(me.id);
                        me.parent.cloneIDs.splice(index, 1);
                    }
                    me.deleteClones();
                }
            }
        },
        checks: {
            game: {
                id: {
                    required: true,
                    check: value => {
                        if (Bagel.internal.games[value] != null) {
                            // This id is being used already
                            return "Oh no! You used an id for your game that is already being used. Try and think of something else.\nYou used " + JSON.stringify(value) + " in \"Game.id\".";
                        }

                        let actingPluginID = Bagel.internal.getActingPluginId();
                        let prefix = value.split(".")[1];

                        if (value[0] == ".") { // Reserved
                            if (actingPluginID == null) {
                                console.error("This is awkward... IDs starting with a dot are only for plugins. You tried to use the id "
                                + JSON.stringify(value)
                                + ". In Game.id.\nIf it's important that it has this name, you could write a plugin instead, just make sure its id is set to "
                                + JSON.stringify(prefix)
                                + " ;)");
                                Bagel.internal.oops();
                            }
                            else {
                                if (prefix != actingPluginID) { // Plugins are allowed to use ids starting with a dot and then their id (if it starts with a dot)
                                    console.error("Erm... the only reserved prefix you can use in this plugin is " + JSON.stringify("." + actingPluginID) + " and you tried to use the id " + JSON.stringify(value)
                                    + "In Game.id.\nYou can fix this by changing the prefix, removing it or changing the plugin id in \"Plugin.info.id\".");
                                    Bagel.internal.oops();
                                }
                            }
                        }
                    },
                    types: ["string"],
                    description: "An id for the game canvas so it can be referenced later in the program."
                },
                width: {
                    required: true,
                    types: ["number"],
                    description: "The virtual width for the game. Independent from the rendered width."
                },
                height: {
                    required: true,
                    types: ["number"],
                    description: "The virtual height for the game. Independent from the rendered height."
                },
                game: {
                    required: false,
                    default: {},
                    subcheck: {
                        assets: {
                            required: false,
                            default: {},
                            types: ["object"],
                            description: "The assets you want to load for your game, organised by type. e.g imgs: [<asset1>,<asset2>]"
                        },
                        sprites: {
                            required: false,
                            default: [],
                            types: ["array"],
                            description: "The array that contains the all the sprite JSON."
                        },
                        scripts: {
                            required: false,
                            default: {},
                            subcheck: {
                                init: {
                                    required: false,
                                    default: [],
                                    arrayLike: true,
                                    subcheck: {
                                        code: {
                                            required: true,
                                            types: ["function"],
                                            description: "The code to be run when the \"stateToRun\" property matches the game state."
                                        },
                                        stateToRun: {
                                            required: true,
                                            types: ["string"],
                                            description: "The state when this script will be run."
                                        },
                                        affectVisible: {
                                            required: false,
                                            default: true,
                                            types: ["boolean"],
                                            description: "If the script should make the sprite visible or not when it runs."
                                        }
                                    },
                                    types: ["array"],
                                    description: "Init scripts. They run on a state change."
                                },
                                main: {
                                    required: false,
                                    default: [],
                                    arrayLike: true,
                                    subcheck: {
                                        code: {
                                            required: true,
                                            types: ["function"],
                                            description: "The code to be run when the \"stateToRun\" property matches the game state."
                                        },
                                        stateToRun: {
                                            required: true,
                                            types: ["string"],
                                            description: "The state when this script will be run."
                                        }
                                    },
                                    types: ["array"],
                                    description: "Main scripts. They run every frame where the states match."
                                },
                                all: {
                                    required: false,
                                    default: [],
                                    check: value => {
                                        if (typeof value != "function") {
                                            return "Huh. This should be a function but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                        }
                                    },
                                    checkEach: true,
                                    types: ["array"],
                                    description: "\"All\" scripts. They run every frame regardless of game state."
                                },
                                preload: {
                                    required: false,
                                    default: {},
                                    subcheck: {
                                        tasks: {
                                            required: false,
                                            default: [],
                                            types: ["array"],
                                            check: value => {
                                                if (typeof value != "function") {
                                                    return "Oops, this is supposed to be a function but you tried to use " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                                }
                                            },
                                            checkEach: true,
                                            description: "Tasks that need to be completed before the game loads (but after the assets have loaded). The arguments provided are the game object followed by a ready function. This function must be called once the task is completed (otherwise the game won't load)."
                                        },
                                        misc: {
                                            required: false,
                                            types: ["function"],
                                            description: "A function for performing miscellaneous preload tasks that can be completed asynchronously. The function is called with the game object as its first argument."
                                        }
                                    },
                                    types: ["object"],
                                    description: "Code that needs to be run before the game can load. \"tasks\" and \"misc\"."
                                }
                            },
                            types: ["object"],
                            description: "The object that contains all the game scripts (\"init\" and \"main\") that aren't for a sprite."
                        },
                        plugins: {
                            required: false,
                            default: [],
                            arrayLike: true,
                            subcheck: {
                                src: {
                                    required: true,
                                    types: ["string"],
                                    description: "The src of the plugin file. Should be a json or js file."
                                },
                                options: {
                                    required: false,
                                    types: ["object"],
                                    description: "May not apply to all plugins but includes options for how they behave."
                                }
                            },
                            types: ["array"],
                            description: "The plugins to load for this game. Plugins enhance Bagel.js' abilities or make certain things easier."
                        }
                    },
                    types: ["object"],
                    description: "Where most of the properties are."
                },
                state: {
                    required: true,
                    types: ["string"],
                    description: "The game's initial state. Game states control which sprites are active."
                },
                config: {
                    required: false,
                    default: {},
                    subcheck: {
                        display: {
                            required: false,
                            default: {},
                            types: ["object"],
                            subcheck: {
                                mode: {
                                    required: false,
                                    default: "fill",
                                    check: value => {
                                        if (! ["fill", "static"].includes(value)) {
                                            return "Oops! You used an invalid option. You used " + JSON.stringify(value) + ", it can only be either \"fill\" or \"static\".";
                                        }
                                    },
                                    types: ["string"],
                                    description: "The display mode. e.g static (always the same size) or fill (fills the whole window)."
                                },
                                resolution: {
                                    required: false,
                                    default: "full",
                                    types: [
                                        "string",
                                        "array"
                                    ],
                                    check: value => {
                                        if (typeof value == "string") {
                                            if (! ["full", "fixed"].includes(value)) {
                                                return "Oops, this can only be \"full\", \"fixed\" or a custom resolution using an array.";
                                            }
                                        }
                                        else if (Array.isArray(value)) {
                                            if (value.length != 2) {
                                                return "Huh, the array can only have two items: the width and height to render at.";
                                            }
                                            if (typeof value[0] != "number") {
                                                return "Hmm, looks like the first item of the custom resolution isn't a number, it's " + Bagel.internal.an(Bagel.internal.getTypeOf(value[0])) + ".";
                                            }
                                            if (typeof value[1] != "number") {
                                                return "Oops, looks like the second item of the custom resolution isn't a number, it's " + Bagel.internal.an(Bagel.internal.getTypeOf(value[1])) + ".";
                                            }
                                        }
                                        else {
                                            return "Erm, this can only be a number or an array.";
                                        }
                                    },
                                    description: "The resolution for the game to be rendered at. Either \"full\", \"fixed\" or a custom resolution using an array containing the width and height (in that order). Full renders the game at the full resolution which makes it good for vector graphics. Fixed is good for pixel art because it means that resources aren't wasted rendering extra pixels as it renders at the game's width and height. And custom's good if you want to do something more advanced."
                                },
                                antialias: {
                                    required: false,
                                    default: {},
                                    subcheck: {
                                        textures: {
                                            required: false,
                                            default: false,
                                            types: ["boolean"],
                                            description: "If textures should be antialiased by default."
                                        },
                                        canvas: {
                                            required: false,
                                            default: false,
                                            types: ["boolean"],
                                            description: "If the canvas should be antialiased or not. You might want to enable this if you've set the resolution to something lower and need it to be upscaled better. Not recommended for pixel art."
                                        }
                                    },
                                    types: ["object"],
                                    description: "Some options about how antialiasing is handled."
                                },
                                renderer: {
                                    required: false,
                                    default: "canvas",
                                    check: value => {
                                        if (! ["auto", "canvas", "webgl"].includes(value)) {
                                            return "Oops. You used an invalid option. You used " + JSON.stringify(value) + ", it can only be either \"auto\", \"canvas\" or \"webgl\".";
                                        }
                                    },
                                    types: ["string"],
                                    description: "The renderer for this game. Either \"auto\", \"canvas\" or \"webgl\". \"auto\" will use WebGL if it's supported by the browser, otherwise it'll use the basic 2d canvas renderer (slower)."
                                },
                                dom: {
                                    required: false,
                                    default: true,
                                    types: ["boolean"],
                                    description: "If the canvas should be part of the DOM or not."
                                },
                                htmlElementID: {
                                    required: false,
                                    check: value => {
                                        if (document.getElementById(value) == null && value != null) { // Make sure the element exists
                                            return "Oops, you specified the element to add the game canvas to but it doesn't seem to exist.\nYou tried to use " + JSON.stringify(value) + ". You might want to check that the HTML that creates the element is before your JavaScript.";
                                        }
                                    },
                                    types: ["string"],
                                    description: "An element to append the canvas to. If unspecified, it will be added to the document or body."
                                },
                                backgroundColor: {
                                    required: false,
                                    default: "white",
                                    types: ["string"],
                                    description: "The HTML colour for the canvas background. Can also be \"transparent\"."
                                },
                                webgl: {
                                    required: false,
                                    default: {},
                                    types: ["object"],
                                    subcheck: {
                                        minimumLimits: {
                                            required: false,
                                            default: {},
                                            types: ["object"],
                                            subcheck: {
                                                textureCount: {
                                                    required: false,
                                                    default: 8,
                                                    types: ["number"],
                                                    check: value => {
                                                        if (value < 8) {
                                                            return "Oh no. It has to be 8 or more as all WebGL compatible GPUs support at least that.";
                                                        }
                                                    },
                                                    description: "The minimum number of WebGL textures the GPU needs to support in order for the WebGL rendererer to be used. Static textures are combined into larger textures to reduce texture usage, however, this may be a limiting factor when using multiple large canvases."
                                                },
                                                textureSize: {
                                                    required: false,
                                                    default: 4096,
                                                    types: ["number"],
                                                    check: value => {
                                                        if (value < 4096) {
                                                            return "Huh, it has to be 4096 or more as all WebGL compatible GPUs support at least that.";
                                                        }
                                                    },
                                                    description: "The minimum number limit for the both the width and height of each WebGL texture. Keep in mind that textures about this size take up a lot of VRAM so it will likely become a limiting factor if textures are created at the maximum size. Combined textures will continue to use a 4096x4096 resolution if this value is changed."
                                                }
                                            },
                                            description: "The minimum limits for the GPU. If the \"auto\" renderer mode is being used, the canvas renderer will be used instead if there requirements aren't met. If the \"webgl\" renderer mode is being used, an error will be displayed to the user and the game won't run.\nYou might want to use a tool like https://webglreport.com/ to find out the specs of different devices if you need to change some of these."
                                        }
                                    },
                                    description: "A few options for the WebGL renderer."
                                }
                            },
                            description: "Contains a few options for how the game is displayed."
                        },
                        input: {
                            required: false,
                            default: {},
                            subcheck: {
                                touch: {
                                    required: false,
                                    default: {},
                                    subcheck: {
                                        scroll: {
                                            required: false,
                                            default: {},
                                            subcheck: {
                                                momentum: {
                                                    required: false,
                                                    default: 0.94,
                                                    check: value => {
                                                        if (value >= 1 || value < 0) {
                                                            return "Oh no! This has to be between 0 (inclusive) and 1 (exclusive).";
                                                        }
                                                    },
                                                    types: ["number"],
                                                    description: "What the scroll velocity should be multiplied by each frame to reduce it. Only used for touch scrolling."
                                                },
                                                deadzone: {
                                                    required: false,
                                                    default: 5,
                                                    types: ["number"],
                                                    description: "The minimum number of in game pixels a touch point must move from its original point to be registered as a scroll input and/or drag."
                                                }
                                            },
                                            types: ["object"],
                                            description: "Some options related to scrolling for touch devices."
                                        }
                                    },
                                    types: ["object"],
                                    description: "Some options for input on touch devices."
                                },
                                mouse: {
                                    required: false,
                                    default: {},
                                    subcheck: {
                                        scrollSensitivity: {
                                            required: false,
                                            default: 0.5,
                                            types: ["number"],
                                            description: "The sensitivity for scrolling with the scroll wheel."
                                        }
                                    },
                                    types: ["object"],
                                    description: ""
                                }
                            },
                            types: ["object"],
                            description: "Contains some options for how input is handled."
                        },
                        loading: {
                            required: false,
                            default: {},
                            subcheck: {
                                mode: {
                                    required: false,
                                    default: "dynamic",
                                    check: value => {
                                        if (! ["preload", "dynamic"].includes(value)) {
                                            return "Oh no! This only accepts \"preload\" and \"dynamic\" but you used " + JSON.stringify(value) + ".";
                                        }
                                    },
                                    types: ["string"],
                                    description: "How assets should be loaded. Either \"preload\" or \"dynamic\". Preload loads all the assets before the game runs and dynamic only loads the assets when they're requested internally or by using the get function. A loading screen will show for those assets if they were requested on the first frame after a state change. Assets requested any other time won't trigger a loading screen."
                                },
                                skip: {
                                    required: false,
                                    default: true,
                                    types: ["boolean"],
                                    description: "If the loading screen should be skipped or not. If true, nothing will show until the game's loaded. This can annoy the user as it delays the page load but if it's short enough it saves time because they don't have to wait for the loading animation to finish."
                                },
                                animation: {
                                    required: false,
                                    default: {
                                        game: {
                                            assets: {
                                                imgs: [
                                                    {
                                                        id: "Bagel",
                                                        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAxCAYAAABznEEcAAAHBklEQVRoQ8Wa+28UVRTHz126s2C3u1BA0wpUQBBa3NKWl/6qoj/6iNGoMRo1RsVo1D9B8YFvFDWoEKOJifEHf/cVH7yKvAQi0iIsNa3RUlNI27CzHXPue2bvzNyZ3Uh/abePmfnc8z3nfM/ZEmjwh/vVeo8QgAwBAPwCP+OH9prcslt8tyF3r/tiE1+ukw/NnpmwZ48BYVCMjmzcVddzpP7j81+s9eThEvbgePppQRCI3JQOJjHE2Odr6MkTQthDC9XYgLQvBxj+3SctPSLia3JjMhhriL8/6/PYSSu5JAJBgJmtABfHokFcF8BpoqDkBjsYK4i/Pu1jpw9CMslBZixerxKdg3iuC8TJ8sioHJHRsQSJhRj+pNdz3So4TpMsNmki0oQQlXMAubkAF88BjJysqVomadlEJBJiaGevv/IIKQUi4rouOE42NEec9mUAuVYWCQQZPhlaftOAhEKUd/RwCQUqTwhIVLLPbL+aRQDvVhmD6eGTvj4yXXEhQ/NAVAr8PcwNv9TCcsQI8cdHPTyJ/SVTltCEILOuWicB3OEB2UdEBE0NUUYkAGMCqYEY3L7aX0IDtR9BkuRIM42CklJlZCBVQ4xK9hqIAYTQan+V6l0kdXJp5TvW8lwYg6mRgbobIk30QB/xQZz4oNvLaFLx6dwQEfy5jEpI+S1QCHYqk+V+2dndCisGYRYlrvzqID6I397v5tWI9wEtIioflD+yyZFim5ATS+rJkcGGWxQJcXwbA1AnQ4AmXpZLSdiMkIjITg4AVbcqrzNRAZiTz0KhbSn8e/YEl6bZa+H9cnqV0t3vlcvZww2fYF1R81oS4ti2kqc7UGbokkUEpYV/N1lR0Vry8CFy+mNeLIBAS449i5BSrGkUfmvJdaxJaiDC/VKII++UVEnVrHQSECwAExUGfc2jh2P7D8JYgSzeoAwjhQDlvbiNpzc7vLUUOhPYgGAE8PQ7HzsSa2PEFHR2Z48XCyJMo2iCp/f4GyJKauNu/CnAobev9YSmTeFFjeveSa9aqOPJCoFVT9gDxIFkqU3hHR7NIvoscTyy/vPUuJlDHHwLIZTNNoGYIoJwky5AadOv1hEIzqPBiMzE7l4ZYw+dmwvTZ/bGjrpk/5urvAzPg2q1CllejWxA8PdRRt1PpodAj4aymt2xQnV2ftrumX00xyKrFh5+/xurWD74EpqAqVOL8itKKAL0PnU0dRREVBBk4bIV/PRbYarcn6izk32vMwgTSNjcjN+nUqoA9D1dP8SZHau9FofAnI4VMIHeymbU1XKE7H1NQSQBEfmwpgEQ2EfyOYAc2pCYmd0kLbLn1S5ZmUwREXmi50i1ihUJYN0zx+qWkpBUEhCRJ9hnaOfetaXLsACozZGgtBoJcupDFglWxtkWhRlE9jpM1mJBR37e0kWtd+3cHA2CDW6qArD+2fqjgTOMgki+DiI/vYJyYoUBpSMMH5PRjJqqJU6FQrgAGxoAMbC928s7RDVUy70WmwybgPz4cqfKiYQRaQQIzjA0CtkmqQb5cNqCToyyRmlhYiUFKV7eIbU7VD4F1z+XXlI4w0gppdhrObfuY97ph5cwGtp2LyQixfkdkHGKfFYgQNxx+npo8GAqkOPvlby8oxJayDrJXit3G4f4/sVObbuhZgj9YsX5i4BwADpnuOP8NYGx8gGYdEkikKPvlrxmn4ziR13T7nfW7Rziu80sEqZxkz18QS2QRclzx+H8P2VZAtGmIAheIyrZD29lZrNZRIDbHZtRF8ttVZZeppzL7uAQKCkTSGHeQshwAHHyGXz40bKxaiEIXhirlui82BDRZIrX+RzOj0JC9e218nf203SQHffbzSvleKqfSqGtS/UQlBAhcGEUI+DvI3pnF2MqXgc7e7OjFtDBmV1WIi0itnutliAEEgVBMBJSSu44XBg9G1jt23V2Ze+Tzez68iGY7LPv2i8D4PM+37yw0rd/LbZ1sodGgHNDIat9BWKaR+ipyo1J8uVDGMicu0MgMBoChEYhW4BMdRxItmgNkmZClG/WWKyDMCJz7/nFd/g1LvTr51k0CvMWUAh6gypKaYh+jRac2pGad43ipSVcsj7qqt0Wf/ssAKKGMyXF+ffGQGA0dJALo3/6XWTERpwuFDTphDlQdMCYJ0n3Wni9K+7zA/iqU3CAFyCsiyZZJKeLiDCgDE5tIvV7t91/wDi/RA41lwJE5FRwxl/wgBkgMhIiMpcSRERk0YMHIw/barwMA9FLathg5c8TJkt5yhYr08UPRQNYReL/iogp2Zc+csjqkK1+SU/6YEM0GTd9QhTrHZuqJUpw1ELa9B8tiSHERcK8VvhMEF+1Oh8P36ZH/TtOaghx0TAbz3JhBp3bhXcK22uVNiVfRutQdUMET8hm1G3Ewk2/73+GkYKJ4ZsYiQAAAABJRU5ErkJggg=="
                                                    }
                                                ]
                                            },
                                            sprites: [
                                                {
                                                    id: "Bagel",
                                                    type: "canvas",
                                                    fullRes: false,
                                                    updateRes: false,
                                                    visible: false,
                                                    mode: "animated",
                                                    width: 1,
                                                    height: 1,
                                                    scripts: {
                                                        init: [
                                                            {
                                                                code: (me, game) => {
                                                                    me.vars.img = Bagel.get.asset.img("Bagel");

                                                                    me.width = Math.max(game.width, game.height) / 5;
                                                                    me.height = me.width;
                                                                    me.canvas.width = me.vars.img.width;
                                                                    me.canvas.height = me.canvas.width;

                                                                    //document.body.appendChild(me.canvas);
                                                                },
                                                                stateToRun: "loading"
                                                            }
                                                        ],
                                                        main: [
                                                            {
                                                                code: (me, game) => {
                                                                    if (! me.visible) {
                                                                        game.vars.delay++;
                                                                        if (game.vars.delay == 10) {
                                                                            game.vars.loading.done = true;
                                                                        }
                                                                    }
                                                                },
                                                                stateToRun: "loading"
                                                            }
                                                        ]
                                                    },
                                                    render: (me, game, ctx, canvas) => {
                                                        let img = me.vars.img;
                                                        let midPoint = canvas.width / 2;

                                                        ctx.imageSmoothingEnabled = false;
                                                        ctx.fillStyle = game.config.display.backgroundColor;

                                                        if (game.vars.stage == 0) {
                                                            ctx.clearRect(0, 0, canvas.width, canvas.height);

                                                            if (game.vars.angle != -90) {
                                                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                                            }
                                                            let maxAngle = ((game.vars.loading.progress / 100) * 360) - 90;
                                                            if (maxAngle > game.vars.angle) {
                                                                game.vars.velocity += 5; // 5
                                                                game.vars.angle += game.vars.velocity;
                                                                game.vars.velocity *= 0.9;
                                                                if (maxAngle <= game.vars.angle) {
                                                                    game.vars.velocity = 0;
                                                                    game.vars.angle = maxAngle;
                                                                }
                                                            }
                                                            if (game.vars.loading.progress == 100 && game.vars.velocity == 0) {
                                                                game.vars.stage++;
                                                                return;
                                                            }

                                                            ctx.beginPath();
                                                            ctx.moveTo(midPoint, midPoint);
                                                            ctx.arc(midPoint, midPoint, midPoint * 2, Bagel.maths.degToRad(-90), Bagel.maths.degToRad(game.vars.angle), true);
                                                            ctx.lineTo(midPoint, midPoint);
                                                            ctx.fill();

                                                            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the scaling
                                                        }
                                                        else {
                                                            game.vars.velocity += 1;
                                                            me.width -= game.vars.velocity;
                                                            me.height -= game.vars.velocity;
                                                            game.vars.velocity *= 0.9;

                                                            if (me.width <= 1) {
                                                                me.visible = false;
                                                            }
                                                            return true;
                                                        }
                                                    }
                                                },
                                                {
                                                    id: "Text",
                                                    type: "text",
                                                    text: "Loading...",
                                                    bitmap: true,
                                                    scripts: {
                                                        init: [
                                                            {
                                                                code: (me, game, step) => {
                                                                    let canvas = document.createElement("canvas"); // This is used for converting colours
                                                                    canvas.width = 1;
                                                                    canvas.height = 1;
                                                                    me.vars.ctx = canvas.getContext("2d");

                                                                    me.vars.halfBagelHeight = Bagel.get.sprite("Bagel").height / 2;

                                                                    step("calculateSize");
                                                                    step("calculateColor");
                                                                },
                                                                stateToRun: "loading"
                                                            }
                                                        ],
                                                        main: [
                                                            {
                                                                code: (me, game, step) => {
                                                                    step("calculateColor");
                                                                    step("calculateSize");
                                                                },
                                                                stateToRun: "loading"
                                                            }
                                                        ],
                                                        steps: {
                                                            calculateSize: (me, game) => {
                                                                let ratio = me.height / me.width;
                                                                me.width = Math.min(game.width, game.height) / 2;
                                                                me.height = me.width * ratio;


                                                                me.y = (game.height / 2) + me.vars.halfBagelHeight;
                                                                me.y += me.height;
                                                            },
                                                            calculateColor: (me, game) => {
                                                                // A slightly hackish way of converting colours to hex
                                                                let ctx = me.vars.ctx;
                                                                let backgroundColor = game.vars.loading.game.config.display.backgroundColor;
                                                                if (backgroundColor == "transparent") {
                                                                    backgroundColor = document.body.bgColor;
                                                                }

                                                                if (backgroundColor != me.vars.was) {
                                                                    ctx.fillStyle = backgroundColor;
                                                                    backgroundColor = ctx.fillStyle; // Makes it a hex colour

                                                                    let rgb = backgroundColor;
                                                                    let brightness = (parseInt(rgb[1] + rgb[2], 16) + parseInt(rgb[3] + rgb[4], 16) + parseInt(rgb[5] + rgb[6], 16)) / 3;
                                                                    if (brightness <= 127) {
                                                                        me.color = "White";
                                                                    }
                                                                    else {
                                                                        me.color = "Black";
                                                                    }
                                                                    me.vars.was = backgroundColor;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        state: "loading",
                                        vars: {
                                            angle: -90,
                                            velocity: 0,
                                            stage: 0,
                                            delay: 0
                                        },
                                        config: {
                                            display: {
                                                resolution: "full"
                                            }
                                        }
                                    },
                                    types: ["object"],
                                    description: "The loading screen animation. Defaults to a Bagel.js themed one.\nIt's a game object and works exactly the same as a game except its loading screen is disabled, Game.vars.loading is automatically created and the id, width, height and config given for the game is ignored. Game.vars.loading contains the following:\n  progress -> The percentage of the assets loaded\n  loaded -> The number of assets loaded\n  loading -> The number currently loading\n  done -> Starts as false, set this to true when you're done (loaded should be 0 when you do this)"
                                }
                            },
                            types: ["object"],
                            description: "A few options for how Bagel.js should handle loading assets."
                        },
                        disableBagelJSMessage: {
                            required: false,
                            default: false,
                            types: ["boolean"],
                            description: "Disables the console message when the game is initialised. As crediting is required to use Bagel.js, please put a link to the GitHub page somewhere else in your program. e.g in the credits."
                        },
                        isLoadingScreen: {
                            required: false,
                            default: false,
                            types: ["boolean"],
                            description: "If this game is a loading screen or not. Used internally."
                        }
                    },
                    types: ["object"],
                    description: "A bunch of other options for the game."
                },
                internal: {
                    required: false,
                    default: {},
                    types: ["object"],
                    description: "Very hush hush. (Contains stuff that Bagel.js needs to make the game work)"
                },
                vars: {
                    required: false,
                    default: {},
                    types: ["object"],
                    description: "Can be used to store variables for the game."
                }
            },
            sprite: {
                sprite: {
                    id: {
                        required: true,
                        check: (id, sprite, name, game) => {
                            let actingPluginID = Bagel.internal.getActingPluginId();

                            let prefix = id.split(".")[1];
                            if (id[0] == ".") { // Reserved
                                if (actingPluginID == null) {
                                    return ("This is awkward... ids starting with a dot are only for plugins. You tried to use the id "
                                    + JSON.stringify(id)
                                    + ".\nIf it's important that it has this name, you could write a plugin instead, just make sure its id (Plugin.info.id) is set to "
                                    + JSON.stringify(prefix)
                                    + " ;)");
                                }
                                else {
                                    if (prefix != actingPluginID) { // Plugins are allowed to use ids starting with a dot and then their id
                                        return ("Erm... the only reserved prefix you can use in this plugin is " + JSON.stringify("." + actingPluginID) + " and you tried to use the id "
                                        + JSON.stringify(id)
                                        + ".\nYou can fix this by changing the prefix (the bit after a full stop starting but before the next full stop), removing it or changing the plugin id in \"Plugin.info.id\".");
                                    }
                                }
                            }

                            if (game.internal.idIndex[sprite.id]) {
                                return "Oops, you've used this id before. You might want to check what sprite has this id or if you're adding this sprite to the right game.";
                            }
                        },
                        types: ["string"],
                        description: "The id for the sprite to be targeted by."
                    },
                    type: {
                        required: true,
                        types: ["string"],
                        description: "The type of sprite."
                    },
                    visible: {
                        required: false,
                        default: true,
                        types: ["boolean"],
                        description: "Mostly pointless setting here as the sprite will be made invisible unless it has an init script or it's a clone, and made visible if it has an init script and isn't a clone.\nIf the sprite is visible or not."
                    },
                    clones: {
                        required: false,
                        default: {},
                        check: (value, ob, index, game, prev) => {
                            let syntax = game.internal.combinedPlugins.types.sprites[ob.type].internal.cloneSyntax;
                            Bagel.check({
                                ob: value,
                                where: "the sprite " + JSON.stringify(ob.id) + "'s \"clone\" argument",
                                syntax: syntax
                            }, {
                                args: true,
                                missing: true
                            });
                        },
                        types: ["object"],
                        description: "The default data for a clone of this sprite.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                    },
                    scripts: {
                        required: false,
                        default: {},
                        subcheck: {
                            init: {
                                required: false,
                                default: [],
                                subcheck: {
                                    code: {
                                        required: true,
                                        types: [
                                            "function",
                                            "undefined"
                                        ],
                                        description: "The code to be run when the \"stateToRun\" property matches the game state."
                                    },
                                    stateToRun: {
                                        required: true,
                                        types: ["string"],
                                        description: "The state when this script will be run."
                                    },
                                    affectVisible: {
                                        required: false,
                                        default: true,
                                        types: ["boolean"],
                                        description: "If the script should make the sprite visible or not when it runs."
                                    }
                                },
                                arrayLike: true,
                                types: ["array"],
                                description: "Contains init scripts. They run when the game state first changes to the script's state."
                            },
                            main: {
                                required: false,
                                default: [],
                                arrayLike: true,
                                subcheck: {
                                    code: {
                                        required: true,
                                        types: [
                                            "function",
                                            "undefined"
                                        ],
                                        description: "The code to be run when the \"stateToRun\" property matches the game state."
                                    },
                                    stateToRun: {
                                        required: true,
                                        types: ["string"],
                                        description: "The state when this script will be run."
                                    }
                                },
                                types: ["array"],
                                description: "Contains main scripts. They run for every frame where the script's state and the game's state match."
                            },
                            all: {
                                required: false,
                                default: [],
                                check: value => {
                                    if (typeof value != "function") {
                                        return "Huh. This should be a function but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                    }
                                },
                                checkEach: true,
                                types: ["array"],
                                description: "Contains \"all\" scripts. They run on every frame and aren't affected by the game state."
                            },
                            steps: {
                                required: false,
                                default: {},
                                types: ["object"],
                                description: "Contains steps: mini scripts that can be called from scripts. The key is the id and the value is the function."
                            }
                        },
                        types: ["object"],
                        description: "The sprite's scripts."
                    },
                    vars: {
                        required: false,
                        default: {},
                        types: ["object"],
                        description: "An object you can use to store data for the sprite."
                    },
                    request: {
                        required: false,
                        default: {},
                        types: ["object"],
                        description: "Contains assets the sprite needs before it becomes active. Used as part of dynamic loading. The keys are the game states and the values are an object with the keys being the asset type (plural) and the value being an array of the assets of that type that need to be loaded."
                    }
                },
                clones: {
                    syntax: {
                        id: {
                            types: ["string"],
                            description: "The id for the clone to be targeted by. Defaults to the parent's id followed by a hashtag and then the lowest number starting from 0 that hasn't already been used."
                        },
                        type: {
                            types: ["string"],
                            description: "The type of clone."
                        },
                        visible: {
                            types: ["boolean"],
                            description: "If the clone is visible or not."
                        },
                        clones: {
                            types: ["object"],
                            description: "The default data for a clone of this clone.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                        },
                        scripts: {
                            subcheck: {
                                init: {
                                    required: false,
                                    default: [],
                                    types: ["array"],
                                    check: (item) => {
                                        if (typeof item != "function") {
                                            return "Oops. Looks like you used the wrong type, you used " + Bagel.internal.an(Bagel.internal.getTypeOf(item)) + " instead of a function.";
                                        }
                                    },
                                    checkEach: true,
                                    description: "An array of functions to run when this clone is initialised."
                                },
                                main: {
                                    required: false,
                                    default: [],
                                    types: ["array"],
                                    description: "An array of functions to run on every frame for this clone."
                                },
                                steps: {
                                    required: false,
                                    default: {},
                                    types: ["object"],
                                    description: "Contains steps: mini scripts that can be called from scripts. The key is the id and the value is the function."
                                }
                            },
                            types: ["object"],
                            description: "The clones's scripts."
                        },
                        vars: {
                            types: ["object"],
                            description: "An object you can use to store data for the clone."
                        }
                    },
                    args: {
                        id: {
                            syntax: {
                                description: "The id for the clone to be targeted by. Defaults to the parent's id followed by a hashtag and then the lowest number starting from 0 that hasn't already been used."
                            },
                            mode: "replace"
                        },
                        type: {
                            syntax: {
                                required: true,
                                types: ["string"],
                                description: "The type of clone."
                            },
                            mode: "replace"
                        },
                        visible: {
                            syntax: {
                                description: "If the clone is visible or not."
                            },
                            mode: "replace"
                        },
                        clones: {
                            syntax: {
                                required: false,
                                default: {},
                                types: ["object"],
                                description: "The default data for a clone of this clone.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                            },
                            mode: "ignore"
                        },
                        scripts: {
                            syntax: {
                                subcheck: {
                                    init: {
                                        required: false,
                                        default: [],
                                        types: ["array"],
                                        check: (item) => {
                                            if (typeof item != "function") {
                                                return "Oops. Looks like you used the wrong type, you used " + Bagel.internal.an(Bagel.internal.getTypeOf(item)) + " instead of a function.";
                                            }
                                        },
                                        checkEach: true,
                                        description: "An array of functions to run when this clone is initialised."
                                    },
                                    main: {
                                        required: false,
                                        default: [],
                                        types: ["array"],
                                        description: "An array of functions to run on every frame for this clone."
                                    }
                                },
                                description: "The clones's scripts.",
                                default: {}
                            },
                            mode: "ignore"
                        },
                        vars: {
                            syntax: {
                                description: "An object you can use to store data for the clone."
                            },
                            mode: "merge"
                        }
                    }
                }
            },
            plugin: {
                info: {
                    required: true,
                    types: ["object"],
                    subcheck: {
                        id: {
                            required: true,
                            check: value => {
                                if (Bagel.internal.current.game.internal.plugins[value]) {
                                    return "Oops, you used an id for a plugin that's already been used. You tried to use the id " + JSON.stringify(value) + " in the game " + JSON.stringify(Bagel.internal.current.game.id) + ". This plugin might've already been loaded or maybe the plugins are too similar? If you're making this plugin, you could try changing Plugin.info.id.";
                                }
                            },
                            types: ["string"],
                            description: "The unique id for the plugin."
                        },
                        description: {
                            required: true,
                            types: ["string"],
                            description: "A brief description of what the plugin is and what it does."
                        }
                    },
                    description: "Contains some information about the plugin."
                },
                plugin: {
                    required: false,
                    default: {},
                    subcheck: {
                        types: {
                            required: false,
                            default: {},
                            subcheck: {
                                assets: {
                                    required: false,
                                    default: {},
                                    arrayLike: true,
                                    subcheck: {
                                        args: {
                                            required: true,
                                            types: ["object"],
                                            description: [
                                                "The required and optional arguments for the asset type. Is an object where the key is the argument name. e.g {",
                                                "    foo: {",
                                                "        required: false,",
                                                "        default: 1,",
                                                "        types: [",
                                                "            \"number\"",
                                                "        ],",
                                                "        description: \"The first argument for this asset type.",
                                                "    }",
                                                "}"
                                            ].join("\n")
                                        },
                                        description: {
                                            required: true,
                                            types: ["string"],
                                            description: "The description of this asset type, make this short and clear to help people when they use the wrong syntax."
                                        },
                                        check: {
                                            required: false,
                                            types: ["function"],
                                            description: [
                                                "Your check function for this asset type. ",
                                                "A good check function will avoid a standard JavaScript error when the user inputs something wrong (e.g a can't read property X of null error).",
                                                "\nFortunately, Bagel.js helps you out in a few ways:\n",
                                                "  You can use the check function provided (while the check function is being run) to easily check an object to make sure it has the desired properties as well as setting defaults. (works in the same way as the \"args\" argument.)\n",
                                                "  You should also make use of the \"args\" argument as you can easily choose which data types you want to allow for each arguments as well as setting defaults and required arguments.\n",
                                                "  \"standardChecks\" has, well... some standard checks. If you want to make sure an id isn't used twice use \"standardChecks.id(<whichever argument is used for the id (defaults to \"id\")>)\". ",
                                                "  You might also want to use the \"isInternal\" check with the arguments working the same as the previous but also having a second argument for the isInternal argument. This might be useful if you want to reserve some IDs for plugins as it'll block any IDs starting with a dot and without the asset having \"isInternal\" set to true.\n",
                                                "  You probably want to use it like this:\n",
                                                "    let error = standardChecks.id();\nif (error) return error;",
                                                "  And if you find any problems with the user input, just use the return statement in the check function (e.g return \"Error\";) and Bagel.js will stop what it's doing, throw the error you specified and pause the game.\n",
                                                "Some tips on making custom errors though:\n",
                                                "  Always specifiy where the error is! Bagel.js will say which game it's in but, you know more than it about the error. You should specify which type they were making, the index of the problematic error and ideally how to fix it.\n",
                                                "  Also, try to include information about the inputs the user provided. For example, if they used a duplicate ID, say what that id was in the error itself.\n",
                                                "  Lastly, be nice to the programmer. Treat them like a user. It's helpful to know that you can just put in something you know's wrong and get a helpful mini-tutorial.\n",
                                                "\nOne more thing: the arguments for the function is structured like this:\n",
                                                "(asset, game, check, standardChecks, plugin, index) => {\n};\n",
                                                "Where standardChecks contains functions and check is a function that checks objects.",
                                                "\n\nGood luck! :P"
                                            ].join("")
                                        },
                                        init: {
                                            required: true,
                                            types: ["function"],
                                            description: [
                                                "Where you make the asset object. When it's ready, simply use the \"ready\" function to tell Bagel.js that the asset's loaded.",
                                                "Here's an example:",
                                                "(asset, ready, game, plugin, index, setFunction) => {",
                                                "    let img = new Image();",
                                                "    img.onload = _ => {",
                                                "        ready(img);",
                                                "    };",
                                                "   img.src = \"foo\";",
                                                "};"
                                            ].join("\n")
                                        },
                                        get: {
                                            required: true,
                                            types: ["string"],
                                            description: "The name of the function. Usually the singular version of the asset type."
                                        },

                                        forcePreload: {
                                            required: false,
                                            default: false,
                                            types: ["boolean"],
                                            description: "If this asset must be preloaded even when the loading mode is set to \"dynamic\". Be careful about how you use this because it can increase loading times."
                                        },
                                        set: {
                                            required: false,
                                            types: ["function"],
                                            description: "Runs instead of the init function when the asset is set. Called with asset, ready, game and plugin. Setting this will replace the ready function in the init function with a function that will call this. Call it with the resource that init fetched and process it in set."
                                        },
                                        hrefArgs: {
                                            required: false,
                                            default: ["src"],
                                            check: value => {
                                                if (! value.includes("src")) {
                                                    value.push("src");
                                                }
                                            },
                                            checkEach: false,
                                            types: ["array"],
                                            description: "The arguments for this asset type that are hrefs. These will be cached by Bagel.js service workers."
                                        }
                                    },
                                    types: ["object"],
                                    description: "Contains the new asset types, the key is the name of type. (should be plural)"
                                },
                                sprites: {
                                    required: false,
                                    default: {},
                                    arrayLike: true,
                                    subcheck: {
                                        description: {
                                            required: true,
                                            types: ["string"],
                                            description: "A short explaination of what this sprite type does."
                                        },
                                        args: {
                                            required: true,
                                            types: ["object"],
                                            arrayLike: true,
                                            subcheck: {
                                                description: {
                                                    required: true,
                                                    types: ["string"],
                                                    description: "A brief description of what this property does."
                                                },
                                                types: {
                                                    required: true,
                                                    types: ["array"],
                                                    description: "The different data types this property accepts. e.g string, array, object etc."
                                                },
                                                required: {
                                                    required: true,
                                                    types: ["boolean"],
                                                    description: "If the argument is required or not. Most of the time, it should be optional."
                                                },
                                                checkEach: {
                                                    required: false,
                                                    types: ["boolean"],
                                                    description: "If the check function should be run on each value of the array/object or just on the array/object itself."
                                                },
                                                check: {
                                                    required: false,
                                                    types: ["function"],
                                                    description: "The check function."
                                                },
                                                subcheck: {
                                                    required: false,
                                                    types: ["object"],
                                                    description: "The subcheck. Same as a \"syntax\" argument but there's no checks on what you put in here."
                                                },
                                                arrayLike: {
                                                    required: false,
                                                    default: false,
                                                    types: ["boolean"],
                                                    description: "If each item should be checked or not. Works for both objects and arrays."
                                                },
                                                default: {
                                                    required: false,
                                                    types: "any",
                                                    description: "The default value (only applies if required is false)"
                                                },
                                                ignoreUseless: {
                                                    required: false,
                                                    types: ["boolean"],
                                                    description: "If useless arguments should be ignored or reported. Useful for when doing a general check and then a specific check depending on a value of an argument."
                                                }
                                            },
                                            check: (value, ob, i, name, game, prev) => {
                                                if (prev.ob.cloneArgs) {
                                                    if (prev.ob.cloneArgs[i] == null) {
                                                        return "Oops, there's no matching cloneArg variant for the " + JSON.stringify(i) + " argument. Make sure \"cloneArgs\" exists for this sprite type. Clone arguments are a variant of the arguments for clones, each argument is an object with two items: \"syntax\" and \"mode\". The syntax is in the same format as the syntax in the normal args but anything unspecified defaults to the normal variant and mode is how the value's calculated. Check the syntax for cloneArgs for more info.";
                                                    }
                                                }
                                            },
                                            checkEach: true,
                                            description: "Same as the \"syntax\" argument for the check function. These checks are only run on original sprites, not clones."
                                        },
                                        cloneArgs: {
                                            required: true,
                                            types: ["object", "undefined"],
                                            arrayLike: true,
                                            subcheck: {
                                                syntax: {
                                                    required: false,
                                                    default: {},
                                                    subcheck: {
                                                        description: {
                                                            required: false,
                                                            check: (item, ob, index, game, prev) => {
                                                                if (item == null) {
                                                                    ob[index] = prev.prev.ob.args[prev.prevName].description;
                                                                }
                                                            },
                                                            types: ["string"],
                                                            description: "A brief description of what this property does. You might want to change this to mention clones instead of sprites."
                                                        },
                                                        types: {
                                                            required: false,
                                                            check: (item, ob, index, game, prev) => {
                                                                if (item == null) {
                                                                    ob[index] = prev.prev.ob.args[prev.prevName].types;
                                                                }
                                                            },
                                                            types: ["array"],
                                                            description: "The different data types this property accepts. e.g string, array, object etc."
                                                        },
                                                        required: {
                                                            required: false,
                                                            check: (value, ob, index, game, prev) => {
                                                                if (value == null) {
                                                                    ob[index] = prev.prev.ob.args[prev.prevName].required;
                                                                }
                                                            },
                                                            types: ["boolean"],
                                                            description: "If the argument is required or not. Most of the time, it should be optional."
                                                        },
                                                        check: {
                                                            required: false,
                                                            check: (item, ob, index, game, prev) => {
                                                                if (item == null) {
                                                                    ob[index] = prev.prev.ob.args[prev.prevName].check;
                                                                }
                                                            },
                                                            types: [
                                                                "function",
                                                                "undefined"
                                                            ],
                                                            description: "The check function."
                                                        },
                                                        subcheck: {
                                                            required: false,
                                                            check: (item, ob, index, game, prev) => {
                                                                if (item == null) {
                                                                    ob[index] = prev.prev.ob.args[prev.prevName].subcheck;
                                                                }
                                                            },
                                                            types: [
                                                                "object",
                                                                "undefined"
                                                            ],
                                                            description: "The subcheck. Same as a \"syntax\" argument."
                                                        },
                                                        default: {
                                                            required: false,
                                                            check: (item, ob, index, game, prev) => {
                                                                if (item == null) {
                                                                    ob[index] = prev.prev.ob.args[prev.prevName].default;
                                                                }
                                                            },
                                                            types: "any",
                                                            description: "The default value for when \"ignore\" mode is used and no value is found for a property."
                                                        }
                                                    },
                                                    types: ["object"],
                                                    description: "The syntax for clones of this sprite type. Any unspecified arguments will default to the values specified in the \"args\" argument for normal sprites."
                                                },
                                                mode: {
                                                    required: false,
                                                    default: "replace",
                                                    check: (value) => {
                                                        if (! [
                                                            "replace",
                                                            "merge",
                                                            "ignore"
                                                        ].includes(value)) {
                                                            return "Huh, looks like you used an invalid option for this. It can only be \"replace\", \"merge\" or \"ignore\".";
                                                        }
                                                    },
                                                    types: ["string"],
                                                    description: [
                                                        "The adoption method for this property. Either:",
                                                        "  • \"replace\" -> The value is given based on the order of preference (from high to low): the \"clone\" function inputs, the \"clones\" attribute in the parent and the parent sprite's properties.",
                                                        "  • \"merge\" -> Only for objects and arrays. They are merged together, in the event of a conflict, the order of preference applies.",
                                                        "  • \"ignore\" -> Ignores the parent's properties. However, properties will still be taken from the parent's \"clones\" argument and the \"clone\" function using the order of preference. The property will be set to the default from either the parent or the clone's arguments if no value is assigned."
                                                    ].join("\n")
                                                }
                                            },
                                            description: "Same as the \"syntax\" argument for the check function. These checks are only run on clones, not original sprites. Unspecified properties will mean that the property doesn't exist for clones."
                                        },
                                        listeners: {
                                            required: false,
                                            default: {},
                                            subcheck: {
                                                steps: {
                                                    required: false,
                                                    default: {},
                                                    check: value => {
                                                        if (typeof value != "function") {
                                                            return "Oops, steps can only be functions. You used " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                                        }
                                                    },
                                                    checkEach: true,
                                                    types: ["object"],
                                                    description: "Short functions that do a task. Can be called from any of the other functions using \"Bagel.step.plugin.spriteListener(<step id>)\"."
                                                },
                                                fns: {
                                                    required: false,
                                                    default: {},
                                                    check: value => {
                                                        if (typeof value != "function") {
                                                            return "Oops, functions can only be, well... functions. You used " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                                        }
                                                    },
                                                    checkEach: true,
                                                    types: ["object"],
                                                    description: "Functions that can replace the functions in listeners. The key is the id for it. The id can be used in place of this function in listeners."
                                                },
                                                property: {
                                                    required: false,
                                                    default: {},
                                                    subcheck: {
                                                        set: {
                                                            required: false,
                                                            default: null,
                                                            check: (fn, listeners, property, game, prev) => {
                                                                if (typeof fn == "string") {
                                                                    if (! prev.ob.fns.hasOwnProperty(fn)) {
                                                                        return "Huh, looks like you used an invalid id for a function. You used " + JSON.stringify(fn) + ".";
                                                                    }
                                                                    listeners[property] = prev.ob.fns[fn];
                                                                }
                                                            },
                                                            types: [
                                                                "function",
                                                                "string"
                                                            ],
                                                            description: "A function that's run after the property is changed. Can also be the name of a function defined in SpriteJSON.listeners.fns. The arguments given are these: sprite, value, property, game, plugin, triggerSprite, step, initialTrigger and the value it was before it was set."
                                                        },
                                                        get: {
                                                            required: false,
                                                            default: null,
                                                            check: (fn, listeners, property, game, prev) => {
                                                                if (typeof fn == "string") {
                                                                    if (! prev.ob.fns.hasOwnProperty(fn)) {
                                                                        return "Hmm, looks like you used an invalid id for a function. You used " + JSON.stringify(fn) + ".";
                                                                    }
                                                                    listeners[property] = prev.ob.fns[fn];
                                                                }
                                                            },
                                                            types: [
                                                                "function",
                                                                "string"
                                                            ],
                                                            description: "A function that's run before the value is sent back to the code that requested it. Can also be the name of a function defined in SpriteJSON.listeners.fns. The arguments given are these: sprite, value, property, game, plugin, triggerSprite and step. (initialTrigger doesn't apply to get listeners so initialTrigger isn't a provided argument)"
                                                        },
                                                        subListen: {
                                                            required: false,
                                                            default: false,
                                                            types: ["boolean"],
                                                            description: "For objects and arrays. If changes to the individual items should be listened for. If set to true, the arguments provided to listeners becomes:\nThe object property, value, subProperty that was set in this object, game, plugin, sprite, triggerSprite, the step function, initialTrigger, original value before it was set and the property name (in the sprite object)."
                                                        }
                                                    },
                                                    arrayLike: true,
                                                    types: ["object"],
                                                    description: "Contains the \"set\" and \"get\" listener functions."
                                                },
                                                events: {
                                                    required: false,
                                                    default: {},
                                                    subcheck: {
                                                        delete: {
                                                            required: false,
                                                            types: [
                                                                "function",
                                                                "string"
                                                            ],
                                                            check: (fn, listeners, property, game, prev) => {
                                                                if (typeof fn == "string") {
                                                                    if (! prev.ob.fns.hasOwnProperty(fn)) {
                                                                        return "Hmm, looks like you used an invalid id for a function. You used " + JSON.stringify(fn) + ".";
                                                                    }
                                                                    listeners[property] = prev.ob.fns[fn];
                                                                }
                                                            },
                                                            description: "Runs just before the sprite is deleted (so the sprite methods all still work)."
                                                        }
                                                    },
                                                    types: ["object"],
                                                    description: "Lets you set a few functions to run on certain events for this type of sprite. Can also be the id of a function in \"fns\". The functions are called with the sprite object followed by the game object."
                                                },
                                                trigger: {
                                                    required: false,
                                                    default: false,
                                                    types: ["boolean"],
                                                    description: "If the listeners should be triggered during sprite initialisation. This can be useful in some situations."
                                                }
                                            },
                                            types: ["object"],
                                            description: "Functions that can run when certain conditions are met."
                                        },
                                        check: {
                                            required: false,
                                            default: null,
                                            types: ["function"],
                                            description: "A function that does extra checks. Use return <error message> in the function to create an error. These are the arguments given: sprite, game, check and where."
                                        },
                                        init: {
                                            required: false,
                                            default: null,
                                            types: ["function"],
                                            description: "Initialises the sprite. Is a function. Can be used to define attributes. These are the arguments given: sprite, game and plugin."
                                        },
                                        tick: {
                                            required: false,
                                            default: null,
                                            types: ["function"],
                                            description: "Runs every frame the sprite exists, before the sprites scripts are run or it's rendered (use render.whileVisible or render.tick for rendering related processing though). Called with the sprite object, the game object and the plugin object."
                                        },
                                        render: {
                                            required: false,
                                            default: {},
                                            subcheck: {
                                                init: {
                                                    required: false,
                                                    types: ["function"],
                                                    description: "(Most of the time you'll want to use \"onVisible\" instead) A function that runs when the sprite is first created. The function is called with the sprite, the new bitmapSprite function and the game object."
                                                },
                                                tick: {
                                                    required: false,
                                                    types: ["function"],
                                                    description: "(Most of the time you'll want to use \"whileVisible\" instead) A function that runs every frame. Use the update function provided to update a bitmap sprite.\nCalled with the sprite, the update function, the new bitmap function, the delete function and the game object."
                                                },

                                                onVisible: {
                                                    required: false,
                                                    types: ["function"],
                                                    description: "A function that runs every time the sprite is made visible. Most of the time you'll want to use this to set up the rendering for the sprite. You can do this by calling \"Bagel.internal.render.bitmapSprite.new\" (also provided as the second argument). You should then store the value returned by returning it. This will store it in sprite.internal.Bagel.renderID. You also need to update the values using listeners on sprite properties. You can do this using \"Bagel.internal.render.bitmapSprite.update\".\nThe on visible function is called with the sprite, the new bitmapSprite function and the game object."
                                                },
                                                onInvisible: {
                                                    required: false,
                                                    types: ["function"],
                                                    description: "A function that runs every time the sprite is made visible. Most of the time you'll want to use this to delete the rendering for the sprite (you can return true to set sprite.internal.Bagel.renderID to null).\nThe on invisible function is called with the sprite, the delete bitmapSprite function and the game object."
                                                },
                                                whileVisible: {
                                                    required: false,
                                                    types: ["function"],
                                                    description: "A function that runs every frame the sprite is visible. Most of the time you'll want to use this to update the bitmap sprite properties if they've changed.\nThe function is called with the sprite, the update bitmapSprite function, the new function, the delete function and the game object."
                                                }
                                            },
                                            types: ["object"],
                                            description: "Contains some render related events. Most of the time you'll want to use \"onVisible\", \"onInvisible\" and \"whileVisible\" as described in their descriptions."
                                        }
                                    },
                                    types: ["object"],
                                    description: "Contains the new sprite types, the key is the name of type (should be singular)."
                                }
                            },
                            types: ["object"],
                            description: "Creates new types. (assets and sprites)"
                        },
                        methods: {
                            required: false,
                            default: {},
                            subcheck: {
                                bagel: {
                                    required: false,
                                    default: {},
                                    arrayLike: true,
                                    subcheck: {
                                        fn: {
                                            required: false,
                                            subcheck: {
                                                args: {
                                                    required: false,
                                                    check: (value, ob) => {
                                                        if (! ob.normal) {
                                                            if (value == null) {
                                                                return "Oops, looks like you missed this argument.";
                                                            }
                                                        }
                                                    },
                                                    types: ["object"],
                                                    description: "The syntax for the arguments. These is always an object, even if you set \"obArg\" to false."
                                                },
                                                fn: {
                                                    required: true,
                                                    types: ["function"],
                                                    description: "The method itself. The arguments are the arguments (an object) and the plugin."
                                                },
                                                obArg: {
                                                    required: false,
                                                    check: (value, ob) => {
                                                        if (! ob.normal) {
                                                            if (value == null) {
                                                                return "Oops, looks like you missed this argument.";
                                                            }
                                                        }
                                                    },
                                                    types: ["boolean"],
                                                    description: "If the arguments should be inputted as an object or should use a normal function input. You probably only want to use the 2nd one if there aren't many arguments."
                                                },
                                                normal: {
                                                    required: false,
                                                    default: false,
                                                    types: ["boolean"],
                                                    description: "If the method should just be a normal function. This can increase performance but obArg and args won't work anymore. You will also have to rely on Bagel.internal.current for finding out the current game, sprite, etc."
                                                }
                                            },
                                            types: ["object"],
                                            description: "The method itself."
                                        },
                                        category: {
                                            required: false,
                                            types: ["object"],
                                            description: "Contains categories where the key is the name of the category and their contents have the same syntax as here. Note: These aren't checked."
                                        }
                                    },
                                    types: ["object"],
                                    description: "Contains framework functions. (Bagel.<function>...) The key is the name and the value is the function."
                                },
                                game: {
                                    required: false,
                                    default: {},
                                    arrayLike: true,
                                    subcheck: {
                                        fn: {
                                            required: false,
                                            subcheck: {
                                                args: {
                                                    required: false,
                                                    check: (value, ob) => {
                                                        if (! ob.normal) {
                                                            if (value == null) {
                                                                return "Oops, looks like you missed this argument.";
                                                            }
                                                        }
                                                    },
                                                    types: ["object"],
                                                    description: "The syntax for the arguments. These is always an object, even if you set \"obArg\" to false."
                                                },
                                                fn: {
                                                    required: true,
                                                    types: ["function"],
                                                    description: "The method itself. The arguments are the arguments (an object) and the plugin."
                                                },
                                                obArg: {
                                                    required: false,
                                                    check: (value, ob) => {
                                                        if (! ob.normal) {
                                                            if (value == null) {
                                                                return "Oops, looks like you missed this argument.";
                                                            }
                                                        }
                                                    },
                                                    types: ["boolean"],
                                                    description: "If the arguments should be inputted as an object or should use a normal function input. You probably only want to use the 2nd one if there aren't many arguments."
                                                },
                                                normal: {
                                                    required: false,
                                                    default: false,
                                                    types: ["boolean"],
                                                    description: "If the method should just be a normal function. This can increase performance but obArg and args won't work anymore. You will also have to rely on Bagel.internal.current for finding out the current game, sprite, etc."
                                                }
                                            },
                                            types: ["object"],
                                            description: "The method itself."
                                        },
                                        category: {
                                            required: false,
                                            types: ["object"],
                                            description: "Contains categories where the key is the name of the category and their contents have the same syntax as here. Note: These aren't checked."
                                        }
                                    },
                                    types: ["object"],
                                    description: "Contains game functions. (Game.<function>...) The key is the name and the value is the function."
                                },
                                sprite: {
                                    required: false,
                                    default: {},
                                    arrayLike: true,
                                    subcheck: {
                                        fn: {
                                            required: false,
                                            subcheck: {
                                                appliesTo: {
                                                    required: true,
                                                    types: ["array"],
                                                    description: "The sprite types that this method is added to."
                                                },
                                                args: {
                                                    required: false,
                                                    check: (value, ob) => {
                                                        if (! ob.normal) {
                                                            if (value == null) {
                                                                return "Oops, looks like you missed this argument.";
                                                            }
                                                        }
                                                    },
                                                    types: ["object"],
                                                    description: "The syntax for the arguments. These is always an object, even if you set \"obArg\" to false."
                                                },
                                                fn: {
                                                    required: true,
                                                    types: ["function"],
                                                    description: "The method itself. The arguments are the arguments (an object) and the plugin."
                                                },
                                                obArg: {
                                                    required: false,
                                                    check: (value, ob) => {
                                                        if (! ob.normal) {
                                                            if (value == null) {
                                                                return "Oops, looks like you missed this argument.";
                                                            }
                                                        }
                                                    },
                                                    types: ["boolean"],
                                                    description: "If the arguments should be inputted as an object or should use a normal function input. You probably only want to use the 2nd one if there aren't many arguments."
                                                },
                                                normal: {
                                                    required: false,
                                                    default: false,
                                                    types: ["boolean"],
                                                    description: "If the method should just be a normal function. This can increase performance but obArg and args won't work anymore. You will also have to rely on Bagel.internal.current for finding out the current game, sprite, etc."
                                                }
                                            },
                                            types: ["object"],
                                            description: "The method itself."
                                        },
                                        category: {
                                            required: false,
                                            types: ["object"],
                                            description: "Contains categories where the key is the name of the category and their contents have the same syntax as here. Note: These aren't checked."
                                        },
                                        apply: {
                                            required: false,
                                            subcheck: {
                                                to: {
                                                    required: false,
                                                    default: [],
                                                    check: value => {
                                                        if (typeof value != "string") {
                                                            return "Erm, these can only be a string and you used " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                                        }
                                                    },
                                                    checkEach: true,
                                                    types: ["array"],
                                                    description: "Which sprite types to apply it to."
                                                },
                                                from: {
                                                    required: false,
                                                    check: (value, ob, name, game, prev) => {
                                                        if (prev.ob.to) {
                                                            if (value == null) {
                                                                return "Oh, looks like you forgot this argument.";
                                                            }
                                                        }
                                                    },
                                                    types: ["string"],
                                                    description: "A sprite type that has the existing method that you want to apply to a new sprite type."
                                                }
                                            },
                                            types: ["object"],
                                            description: "Allows a pre existing method from another plugin to also be applied to a sprite type created by this plugin. It's an array of the sprite types."
                                        }
                                    },
                                    types: ["object"],
                                    description: "Contains sprite functions. (me.<function>...) The key is the name and the value is the function."
                                }
                            },
                            types: ["object"],
                            description: "Contains the 3 different method types: \"bagel\", \"game\" and \"sprite\"."
                        },
                        scripts: {
                            required: false,
                            default: {},
                            subcheck: {
                                preload: {
                                    required: false,
                                    types: ["function"],
                                    description: "The preload function. It runs before the plugin is checked or initialised making it useful for changing some values before loading."
                                },
                                init: {
                                    required: false,
                                    types: ["function"],
                                    description: "The init function. It runs once the plugin's been checked and mostly initialised. This function finishes it by doing stuff specific to this plugin."
                                },
                                main: {
                                    required: false,
                                    types: ["function"],
                                    description: "The \"main\" function. Runs on every frame before any other scripts run."
                                },
                                steps: {
                                    required: false,
                                    default: {},
                                    check: fn => {
                                        if (typeof fn != "function") {
                                            return "Huh, looks like you used the wrong type, it should be a function and you used " + Bagel.internal.an(Bagel.internal.getTypeOf(fn) + ".");
                                        }
                                    },
                                    checkEach: true,
                                    types: ["object"],
                                    description: "Mini functions. They can help make your code clearer by spitting functions into the individual steps. Can use them with \"Bagel.step.plugin.scripts\" or the step function provided as an argument to the function."
                                }
                            },
                            types: ["object"],
                            description: "Contains the plugin's scripts. \"preload\", \"init\" and \"main\". Steps can also be used. The arguments provided are the plugin, the game and then the step function."
                        },
                        listeners: {
                            required: false,
                            default: {},
                            subcheck: {
                                prepState: {
                                    required: false,
                                    types: ["function"],
                                    description: "Runs on the first frame of a new game state. Regardless of if the game's loaded or not. Any loading triggered here will be part of a loading screen."
                                },
                                state: {
                                    required: false,
                                    types: ["function"],
                                    description: "The game state listener function. Triggers on the first frame with the new state from the start. Runs before init scripts and the loading screen. Only runs once the game's loaded but can also trigger a loading screen by requesting or adding an asset."
                                }
                            },
                            types: ["object"],
                            description: "Contains listener functions for different things."
                        }
                    },
                    types: ["object"],
                    description: "Contains most of the plugin stuff. e.g the new types it adds, methods and defaults."
                },
                vars: {
                    required: false,
                    default: {},
                    types: ["object"],
                    description: "An object you can use to store data for the sprite."
                },
                args: {
                    required: false,
                    types: ["object"],
                    description: "The arguments provided when the plugin was loaded. You shouldn't change any of these values in the plugin, that's what the \"vars\" property is for."
                }
            },
            assets: {
                id: {
                    required: true,
                    types: ["string"],
                    description: "The id to target the asset by."
                },
                src: {
                    required: true,
                    types: ["string"],
                    description: "The src of the asset. e.g \"assets/imgs/bagel.png\""
                }
            },
            disableArgCheck: {args: true},
            bitmapSprite: {
                x: {
                    required: true,
                    types: ["number"],
                    description: "The x position of the centre of the bitmap."
                },
                y: {
                    required: true,
                    types: ["number"],
                    description: "The y position of the centre of the bitmap."
                },
                width: {
                    required: true,
                    types: ["number"],
                    description: "The width of the bitmap. Negative widths flip the image horizontally."
                },
                height: {
                    required: true,
                    types: ["number"],
                    description: "The height of the bitmap. Negative heights flip the image vertically."
                },
                image: {
                    required: true,
                    types: ["string"],
                    description: "The id of the texture to use. This isn't exclusive to the \"img\" asset type (other plugins can also create new textures) but you'll usually use textures defined that way. In the case of the \"img\" asset type, when loaded, a new texture will be created with the id specified in the image."
                },
                rotation: {
                    required: false,
                    default: 90,
                    types: ["number"],
                    description: "The rotation of the bitmap in degrees."
                },
                alpha: {
                    required: false,
                    default: 1,
                    check: (value, box) => {
                        if (value > 1) {
                            box.alpha = 1;
                        }
                        else if (value < 0) {
                            box.alpha = 0;
                        }
                    },
                    types: ["number"],
                    description: "The alpha for the bitmap sprite. 1 is fully visible, 0 is completely transparent."
                },
                crop: {
                    required: false,
                    subcheck: {
                        x: {
                            required: true,
                            types: ["number"],
                            description: "The x coordinate to start using the image data. Anything before it won't be used."
                        },
                        y: {
                            required: true,
                            types: ["number"],
                            description: "The y coordinate to start using the image data. Anything before it won't be used."
                        },
                        width: {
                            required: true,
                            types: ["number"],
                            description: "The number of horizontal pixels to use from the image. (from the x coordinate). Anything after isn't used."
                        },
                        height: {
                            required: true,
                            types: ["number"],
                            description: "The number of vertical pixels to use from the image. (from the y coordinate). Anything after isn't used."
                        }
                    },
                    check: (value, ob, property, game) => {
                        if (value == null) return;

                        let img = Bagel.internal.render.texture.get(ob.image, game);
                        if (value.width + value.x > img.width) value.width = img.width - value.x;
                        if (value.height + value.y > img.height) value.height = img.height - value.y;

                        if (value.x == 0 && value.y == 0 && value.width == img.width && value.height == img.height) { // No cropping
                            delete ob.crop;
                        }
                    },
                    types: ["object"],
                    description: "How the texture the bitmapSprite uses should be cropped. Won't affect the original texture and is affected by rotation. Source pixels are used instead of game or canvas pixels."
                },
                tint: {
                    required: false,
                    types: ["string"],
                    description: "The HTML colour the sprite should be tinted with. If the opacity is 255, all opaque pixels will be fully replaced with the colour and if it's 0, none will be effected."
                }
            }
        },

        th: num => (num + 1) + ((num > 8 && num < 20)? "th" : ["st", "nd", "rd", "th", "th", "th", "th", "th", "th"][parseInt(num.toString()[num.toString().length - 1])]),
        an: str => ["a", "e", "i", "o", "u"].includes(str[0].toLowerCase())? "an " + str : "a " + str,
        list: (items, type, determiners) => {
            let output = "";
            for (let i in items) {
                let item = items[i];
                output += Bagel.internal.an(item);
                if (i == items.length - 2) {
                    output += " " + type + " ";
                }
                else if (i != items.length - 1) {
                    output += ", ";
                }
            }
            return output;
        },
        getTypeOf: entity => {
            if (Array.isArray(entity)) return "array";
            if (typeof entity == "number" && isNaN(entity)) return "NaN";
            if (entity == null) return "undefined";
            return typeof entity;
        },
        deepClone: (entity, isSub) => {
            if (typeof entity != "object" || entity == null || (isSub && entity.internal && entity.internal.dontClone)) { // Includes arrays
                return entity;
            }
            let newEntity;
            if (Array.isArray(entity)) {
                newEntity = [];
            }
            else {
                newEntity = {};
            }

            let keys = Object.keys(entity);

            let i = 0;
            while (i < keys.length) {
                if (entity[keys[i]] != null && typeof entity[keys[i]] == "object") {
                    newEntity[keys[i]] = Bagel.internal.deepClone(entity[keys[i]], true);
                }
                else {
                    newEntity[keys[i]] = entity[keys[i]];
                }
                i++;
            }
            return newEntity;
        },

        compressNumbers: (numbers, mins, maxes) => {
            let dimensions = numbers[0].length;

            if (! mins) {
                mins = new Array(dimensions).fill(Infinity);
                maxes = new Array(dimensions).fill(-Infinity);
                for (let i in numbers) {
                    for (let c in numbers[i]) {
                        if (numbers[i][c] > maxes[c]) {
                            maxes[c] = numbers[i][c];
                        }
                        if (numbers[i][c] < mins[c]) {
                            mins[c] = numbers[i][c];
                        }
                    }
                }
            }

            let totalRange = 1;
            let i = 0;
            while (i < dimensions) {
                if (mins[i] == maxes[i]) {
                    if (mins[i] == 0) {
                        maxes[i]++;
                    }
                    else {
                        mins[i]--;
                    }
                }
                totalRange *= (maxes[i] - mins[i]) + 1;
                i++;
            }

            let tmp = totalRange;
            let bytes = 1;
            let counter = 0;
            while (true) {
                counter++;
                if (counter == numbers.length) {
                    break;
                }
                if (tmp == Math.pow(128, bytes)) {
                    break;
                }
                tmp *= totalRange;
                if (tmp > Math.pow(128, bytes)) {
                    if (bytes == 4) {
                        break;
                    }
                    bytes++;
                }
            }


            characters = "";
            i = 0;
            let c, a, b, value, total;
            while (i < numbers.length) {
                c = 0;
                while (c < counter) {
                    if (c % (counter / bytes) == 0) {
                        value = 0;
                        total = 1;
                    }
                    a = 0;
                    while (a < dimensions) {
                        value += (numbers[i][a] - mins[a]) * total;
                        total *= (maxes[a] - mins[a]) + 1;
                        a++;
                    }
                    i++;
                    c++;
                    if (c != 0 && c % (counter / bytes) == 0 || i == numbers.length) {
                        b = 0;
                        while (b < bytes) {
                            tmp = Math.pow(128, (bytes - b) - 1);
                            characters += String.fromCharCode(Math.floor(value / tmp));
                            value %= tmp;
                            b++;
                        }
                        if (i == numbers.length) {
                            break;
                        }
                    }
                }
            }
            return [characters, mins, maxes, numbers.length];
        },
        decompressNumbers: (characters, mins, maxes, length) => {
            let dimensions = mins.length;

            let totalRange = 1;
            let i = 0;
            while (i < dimensions) {
                totalRange *= (maxes[i] - mins[i]) + 1;
                i++;
            }

            let tmp = totalRange;
            let bytes = 1;
            let counter = 0;
            while (true) {
                counter++;
                if (counter == length) {
                    break;
                }
                if (tmp == Math.pow(128, bytes)) {
                    break;
                }
                tmp *= totalRange;
                if (tmp > Math.pow(128, bytes)) {
                    if (bytes == 4) {
                        break;
                    }
                    bytes++;
                }
            }

            let divisions = [1];
            let total = 1;
            i = 0;
            while (i < dimensions * counter) {
                total *= (maxes[i % maxes.length] - mins[i % mins.length]) + 1;
                divisions.push(total);
                i++;
            }
            divisions.pop();
            divisions.reverse();

            let numbers = [];
            let c, a, dimension;
            i = 0;
            while (i < characters.length) {
                total = 0;
                c = 0;
                while (c < bytes) {
                    total += characters.charCodeAt(i) * Math.pow(128, (bytes - c) - 1);
                    c++;
                    i++;
                }
                a = 0;
                while (a < divisions.length) {
                    dimension = (dimensions - (a % dimensions)) - 1;
                    if (dimension == dimensions - 1) {
                        numbers.push([]);
                    }
                    numbers[numbers.length - 1].push(Math.floor(total / divisions[a]) + mins[dimension]);
                    total %= divisions[a];
                    a++;
                }
            }
            numbers.reverse();
            numbers.splice(length, numbers.length - length);
            return numbers;
        },

        findCloneID: (sprite, game) => {
            let i = 0;
            while (true) {
                let id = sprite.id + "#" + i;
                if (game.internal.idIndex[id] == null) {
                    return id;
                }
                i++;
            }
        },
        findSpriteIndex: game => {
            for (let i in game.game.sprites) {
                if (game.game.sprites[i] == null) {
                    return parseInt(i);
                }
            }
            return game.game.sprites.length;
        },

        oops: game => { // When something goes wrong
            if (game == null) {
                throw "Critical Bagel.js error, please look at the error above for more info. ^-^";
            }
            game.paused = true;
            game.error = true;
            throw "Critical Bagel.js error in the game " + JSON.stringify(game.id) + ", look at the error for some help. ^-^";
        },

        current: {
            sprite: null,
            game: null,
            asset: null,
            assetType: null,
            assetTypeName: null,
            i: null,
            where: null,
            plugin: null,
            pluginProxy: false,
            mainLoop: false
        },
        saveCurrent: _ => {
            let internal = Bagel.internal;
            let current = internal.current;
            internal.currentStack.push({...current});
        },
        loadCurrent: _ => {
            let internal = Bagel.internal;
            internal.current = internal.currentStack.pop(); // Load the last state
        },
        resetCurrent: _ => {
            Bagel.internal.current = {
                sprite: null,
                game: null,
                asset: null,
                assetType: null,
                assetTypeName: null,
                i: null,
                where: null,
                plugin: null,
                pluginProxy: false,
                mainLoop: false
            };
            Bagel.internal.currentStack = [];
        },
        currentStack: [],
        getActingPluginId: setProxy => {
            let current, was;
            if (setProxy) {
                current = Bagel.internal.current;
                was = current.pluginProxy;
                current.pluginProxy = true;
            }

            let output = Bagel.internal.getActingPluginIdHelper();
            if (setProxy) {
                current.pluginProxy = was;
            }
            return output;
        },
        getActingPluginIdHelper: _ => {
            let currentStack = Bagel.internal.currentStack;

            let current = Bagel.internal.current;
            if (current.plugin == null) return null;
            let i = 1;
            while (current.pluginProxy) {
                current = currentStack[currentStack.length - i];
                if (current == null || current.plugin == null) return null;
                i++;
            }
            return current.plugin.info.id;
        },

        render: {
            bitmapSprite: {
                new: (data, game, check=true) => {
                    if (Bagel.internal.getTypeOf(game) != "object") {
                        if (game) {
                            console.error("Huh, looks like you didn't specify the game properly (it's the 2nd argument). It's supposed to be an object but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(game)) + ".");
                        }
                        else {
                            console.error("Hmm, looks like you forgot to specify the game object. (2nd argument)")
                        }
                        Bagel.internal.oops(Bagel.internal.current.game);
                    }

                    if (check) {
                        data = Bagel.check({
                            ob: data,
                            where: "the function Bagel.internal.render.new",
                            syntax: Bagel.internal.checks.bitmapSprite,
                            game: game
                        });
                    }

                    data.alpha = Math.max(Math.min(data.alpha, 1), 0);

                    let renderer = game.internal.renderer;
                    if (game.config.isLoadingScreen) {
                        data.image = ".Internal.loadingScreen." + data.image;
                    }

                    if (game.internal.renderer.textures[data.image] == null) {
                        console.error("Oh no! Bagel.js couldn't find the texture " + JSON.stringify(data.image) + " for your bitmap sprite. Make sure your \"image\" argument (part of the data argument) is correct.");
                        Bagel.internal.oops(game);
                    }


                    let id = renderer.bitmapIndexes.indexOf(null);
                    if (id == -1) {
                        id = renderer.bitmapIndexes.length;
                    }
                    renderer.bitmapSpriteData[id] = data;
                    renderer.bitmapsUsingTextures[data.image].push(id);
                    renderer.bitmapCount++;
                    if (renderer.type == "webgl") {
                        renderer.bitmapIndexes[id] = true;

                        renderer.queue.bitmap.new.push([data, id]); // Queue it to be added rather than just adding it as adding multiple at a time is more efficient
                        renderer.queueLengths.add++;

                        if (game.config.isLoadingScreen) {
                            renderer.loadingScreenBitmaps[id] = true;
                        }
                        return id;
                    }
                    else {
                        renderer.bitmapIndexes[id] = renderer.layers.length;
                        renderer.layers.push(id);
                        renderer.scaledBitmaps[id] = Bagel.internal.subFunctions.tick.render.canvas.scaleData(data, renderer);

                        if (data.tint) {
                            Bagel.internal.render.bitmapSprite.internal.canvasTint(renderer, data.image, data.tint);
                        }

                        return id;
                    }
                },
                delete: (id, game) => {
                    if (Bagel.internal.getTypeOf(game) != "object") {
                        if (game) {
                            console.error("Hmm, looks like you didn't specify the game properly (it's the 2nd argument). It's supposed to be an object but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(game)) + ".");
                        }
                        else {
                            console.error(":/ looks like you forgot to specify the game object. (2nd argument)");
                        }
                        Bagel.internal.oops(Bagel.internal.current.game);
                    }
                    if (id == null) {
                        return false;
                    }
                    id = parseInt(id); // In case it's a string

                    let renderer = game.internal.renderer;
                    if (game.config.isLoadingScreen) {
                        renderer.loadingScreenBitmaps[id] = false;
                    }

                    if (renderer.bitmapSpriteData[id] == null) {
                        console.error("Huh, Bagel.js couldn't find the bitmap sprite with the id " + JSON.stringify(id) + ". You might have already deleted it.");
                        Bagel.internal.oops(game);
                    }
                    else {
                        if (renderer.type == "webgl") {
                            if (typeof renderer.bitmapIndexes[id] == "boolean") { // Hasn't been processed yet
                                let queue = renderer.queue.bitmap.new;
                                queue[queue.findIndex(value => value && value[1] == id)] = null;
                                renderer.queueLengths.add--;
                            }
                            else {
                                renderer.queue.bitmap.delete[renderer.bitmapIndexes[id]] = true;
                                renderer.queueLengths.delete++;
                            }
                        }
                        else {
                            let data = renderer.scaledBitmaps[id];
                            renderer.scaledBitmaps[id] = null;
                            renderer.layers.splice(renderer.bitmapIndexes[id], 1);
                            let index = renderer.bitmapIndexes[id];
                            for (let i in renderer.bitmapIndexes) {
                                if (renderer.bitmapIndexes[i] > index) {
                                    renderer.bitmapIndexes[i]--;
                                }
                            }

                            if (data.tint) { // Had a tint
                                Bagel.internal.render.bitmapSprite.internal.reduceCanvasTint(renderer, data.image, data.tint);
                            }
                        }
                        renderer.bitmapIndexes[id] = null;
                        renderer.bitmapCount--;

                        // It's not using its texture anymore
                        let img = renderer.bitmapSpriteData[id].image;
                        let usingTextures = renderer.bitmapsUsingTextures[img];
                        let index = usingTextures.indexOf(id);
                        if (index != -1) {
                            renderer.bitmapsUsingTextures[img] = usingTextures.filter((item, currentIndex) => currentIndex != index);
                        }

                        // Cancel the queued layer operations
                        renderer.queue.bitmap.layer = renderer.queue.bitmap.layer.filter(value => value[0] != id);

                        renderer.bitmapSpriteData[id] = null;
                    }
                    return true;
                },
                update: (id, data, game, check=true, actualTextureID) => {
                    if (id == null) {
                        return Bagel.internal.render.bitmapSprite.new(data, game, check);
                    }

                    if (Bagel.internal.getTypeOf(game) != "object") {
                        if (game) {
                            console.error("Hmm, looks like you didn't specify the game properly (it's the 2nd argument). It's supposed to be an object but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(game)) + ".");
                        }
                        else {
                            console.error(":/ looks like you forgot to specify the game object. (2nd argument)");
                        }
                        Bagel.internal.oops(Bagel.internal.current.game);
                    }

                    if (check) {
                        data = Bagel.check({
                            ob: data,
                            where: "the function Bagel.internal.render.update",
                            syntax: Bagel.internal.checks.bitmapSprite,
                            game: game
                        });
                    }


                    let renderer = game.internal.renderer;
                    if (game.config.isLoadingScreen) {
                        renderer.loadingScreenBitmaps[id] = true;
                        if (! actualTextureID) {
                            data.image = ".Internal.loadingScreen." + data.image;
                        }
                    }

                    if (game.internal.renderer.textures[data.image] == null) {
                        console.error("Oh no! Bagel.js couldn't find the texture " + JSON.stringify(data.image) + " for your bitmap sprite. Make sure your \"image\" argument (part of the data argument) is correct.");
                        Bagel.internal.oops(game);
                    }

                    if (renderer.bitmapSpriteData[id] == null) {
                        console.error("Hmm, Bagel.js couldn't find the bitmap sprite with the id " + JSON.stringify(id) + ".");
                        Bagel.internal.oops(game);
                    }
                    else {
                        if (renderer.bitmapSpriteData[id].image != data.image) { // The image has changed
                            let usingTextures = renderer.bitmapsUsingTextures[renderer.bitmapSpriteData[id].image];
                            let index = usingTextures.indexOf(id);
                            usingTextures.splice(index, 1); // Remove the old
                            renderer.bitmapsUsingTextures[data.image].push(id); // Add the new
                        }
                        renderer.bitmapSpriteData[id] = data;

                        if (renderer.type == "webgl") {
                            if (renderer.bitmapIndexes[id] === true) { // Still pending to be added
                                let oldData = renderer.queue.bitmap.new.find(item => item != null && item[1] == id);
                                oldData[0] = data;
                            }
                            else {
                                // Not really any faster to queue it, so just update it now
                                let i = renderer.bitmapIndexes[id] * 12;
                                Bagel.internal.subFunctions.tick.render.webgl.generateVertices(i, data, renderer.vertices, renderer.textureCoordinates, renderer);

                                renderer.verticesUpdated = true;
                            }
                        }
                        else {
                            let old = renderer.scaledBitmaps[id];
                            if (data.tint != old.tint || (data.tint && data.image != data.image)) { // Tint has changed
                                if (old.tint) { // Had a tint before
                                    Bagel.internal.render.bitmapSprite.internal.reduceCanvasTint(renderer, old.image, old.tint);
                                }
                                if (box.tint) {
                                    Bagel.internal.render.bitmapSprite.internal.canvasTint(renderer, data.image, data.tint);
                                }
                            }
                            renderer.scaledBitmaps[id] = Bagel.internal.subFunctions.tick.render.canvas.scaleData(data, renderer);
                        }
                    }
                },
                bringToFront: (id, game) => {
                    Bagel.internal.render.bitmapSprite.internal.queueRenderOrder(0, id, game);
                },
                bringForwards: (id, game) => {
                    Bagel.internal.render.bitmapSprite.internal.queueRenderOrder(1, id, game);
                },
                sendToBack: (id, game) => {
                    Bagel.internal.render.bitmapSprite.internal.queueRenderOrder(2, id, game);
                },
                sendBackwards: (id, game) => {
                    Bagel.internal.render.bitmapSprite.internal.queueRenderOrder(3, id, game);
                },
                internal: {
                    queueRenderOrder: (type, id, game) => {
                        if (Bagel.internal.getTypeOf(game) != "object") {
                            if (game) {
                                console.error("Huh, looks like you didn't specify the game properly (it's the 2nd argument). It's supposed to be an object but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(game)) + ".");
                            }
                            else {
                                console.error("Hmm, looks like you forgot to specify the game object. (2nd argument)");
                            }
                            Bagel.internal.oops(Bagel.internal.current.game);
                        }

                        let renderer = game.internal.renderer;

                        if (renderer.bitmapSpriteData[id] == null) {
                            console.error("Err, Bagel.js couldn't find the bitmap sprite with the id " + JSON.stringify(id) + ". You might have deleted it.");
                            Bagel.internal.oops(game);
                        }
                        else {
                            let queue = renderer.queue.bitmap.layer;
                            queue.push([id, type]);
                        }
                    },
                    reduceCanvasTint: (renderer, id, tint) => {
                        renderer.tintedTextureCounts[id][tint]--;
                        if (renderer.tintedTextureCounts[id][tint] == 0) {
                            delete renderer.tintedTextures[id][tint];
                        }
                    },
                    canvasTint: (renderer, id, tint, reapplying) => {
                        if (! reapplying) {
                            let counts = renderer.tintedTextureCounts[id];
                            if (counts[tint] == null) {
                                counts[tint] = 1;
                            }
                            else {
                                counts[tint]++;
                            }
                        }

                        let base = Bagel.internal.render.texture.get(id, game).texture;
                        let canvas, ctx;
                        if (renderer.tintedTextures[id][tint]) {
                            if (! reapplying) return; // The tint already exists
                            canvas = renderer.tintedTextures[id][tint][0];
                            ctx = renderer.tintedTextures[id][tint][1];

                            canvas.width = base.width;
                            canvas.height = base.height;
                            ctx.imageSmoothingEnabled = false;
                            ctx.globalCompositeOperation = "source-over";
                        }
                        else {
                            canvas = document.createElement("canvas");
                            canvas.width = base.width;
                            canvas.height = base.height;
                            ctx = canvas.getContext("2d");
                            ctx.imageSmoothingEnabled = false;
                        }
                        ctx.fillStyle = tint;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = "destination-atop";
                        ctx.drawImage(base, 0, 0);

                        renderer.tintedTextures[id][tint] = [canvas, ctx];
                    }
                }
            },
            texture: {
                new: (id, texture, game, overwrite, antialias, singleTexture=false, actualID) => {
                    if (Bagel.internal.getTypeOf(game) != "object") {
                        if (game) {
                            console.error("Hmm, looks like you didn't specify the game properly (it's the 3rd argument). It's supposed to be an object but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(game)) + ".");
                        }
                        else {
                            console.error("Oops, looks like you forgot to specify the game object. (3rd argument)");
                        }
                        Bagel.internal.oops(Bagel.internal.current.game);
                    }
                    if (Bagel.internal.getTypeOf(texture) != "object") {
                        console.error("Oh no! You tried to use " + Bagel.internal.an(Bagel.internal.getTypeOf(texture)) + " for the texture argument (the 2nd). It's supposed to be a canvas, image, svg or video.");
                        Bagel.internal.oops(game);
                    }
                    if (typeof id != "string") {
                        console.error("Huh, looks like you tried to use " + Bagel.internal.an(Bagel.internal.getTypeOf(id)) + " for the id argument (the first). It should be a string.");
                        Bagel.internal.oops(game);
                    }
                    if (typeof texture.width != "number" || texture.width <= 0) {
                        console.error("Hmm, the texture.width property is invalid. It needs be a number greater than 0. Value: " + texture.width + ".");
                        Bagel.internal.oops(game);
                    }
                    if (typeof texture.height != "number" || texture.height <= 0) {
                        console.error("Huh, the texture.height property is invalid. It needs be a number greater than 0. Value: " + texture.height + ".");
                        Bagel.internal.oops(game);
                    }

                    if (! Bagel.internal.games[game.id]) { // Game deleted
                        return;
                    }

                    if (antialias == null) antialias = game.config.display.antialias.textures;

                    let renderer = game.internal.renderer;
                    if (game.config.isLoadingScreen) {
                        if (! actualID) {
                            id = ".Internal.loadingScreen." + id;
                        }
                        renderer.loadingScreenTextures[id] = true;
                    }

                    let textures = renderer.textures;
                    if ((! overwrite) && textures[id]) {
                        console.error("Hmm, you tried to overwrite a texture without setting the \"overwrite\" argument (the 4th) to true. If this was deliberate, try setting it to true. Otherwise you can use the \"check\" function which returns true if a texture with that id already exists.");
                        Bagel.internal.oops(game);
                    }
                    let functions = Bagel.internal.render.texture.internal;

                    let existingTexture = textures[id];
                    if (! existingTexture) {
                        renderer.bitmapsUsingTextures[id] = [];
                    }
                    if (renderer.type == "webgl") {
                        let existsOrQueued = existingTexture != null;
                        let needsRemake = existsOrQueued?
                        existingTexture.width != texture.width
                        || existingTexture.height != texture.height
                        || existingTexture.antialias != antialias
                        || existingTexture.position.singleTexture != singleTexture
                        : false;

                        if (existsOrQueued) {
                            existingTexture.texture = texture;
                            existingTexture.width = texture.width;
                            existingTexture.height = texture.height;
                            existingTexture.antialias = antialias;
                            existingTexture.position.singleTexture = singleTexture;

                            if (! existingTexture.pending) {
                                if (needsRemake) {
                                    renderer.queue.textures.delete[id] = textures[id];
                                    renderer.queue.textures.new[id] = existingTexture;

                                    delete renderer.queue.textures.update[id];
                                }
                                else {
                                    renderer.queue.textures.update[id] = existingTexture;
                                }
                            }
                        }
                        else {
                            textures[id] = {
                                pending: true,
                                position: {
                                    clip: {},
                                    singleTexture: singleTexture
                                },
                                texture: texture,
                                antialias: antialias,
                                width: texture.width,
                                height: texture.height
                            };
                            renderer.queue.textures.new[id] = textures[id];
                        }
                    }
                    else {
                        if (textures[id]) {
                            for (let tint in renderer.tintedTextures[id]) {
                                Bagel.internal.render.bitmapSprite.internal.canvasTint(renderer, id, tint, true);
                            }
                        }
                        else {
                            renderer.tintedTextures[id] = {};
                            renderer.tintedTextureCounts[id] = 0;
                        }
                        textures[id] = {
                            texture: texture,
                            antialias: antialias,
                            width: texture.width,
                            height: texture.height
                        };
                    }
                },
                update: (id, texture, game) => Bagel.internal.render.texture.new(id, texture, game, true),
                delete: (id, game, replaceSpriteTextures=true, actualID) => {
                    if (Bagel.internal.getTypeOf(game) != "object") {
                        if (game) {
                            console.error("Oops, looks like you didn't specify the game properly (it's the 2nd argument). It's supposed to be an object but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(game)) + ".");
                        }
                        else {
                            console.error("Hmm, looks like you forgot to specify the game object. (2nd argument)");
                        }
                        Bagel.internal.oops(Bagel.internal.current.game);
                    }
                    if (typeof id != "string") {
                        console.error("Oops, looks like you tried to use " + Bagel.internal.an(Bagel.internal.getTypeOf(id)) + " for the id argument (the first). It should be a string.");
                        Bagel.internal.oops(game);
                    }
                    if (! Bagel.internal.games[game.id]) { // Game deleted
                        return;
                    }

                    let renderer = game.internal.renderer;
                    if (game.config.isLoadingScreen) {
                        if (! actualID) {
                            id = ".Internal.loadingScreen." + id;
                        }
                        delete renderer.loadingScreenTextures[id];
                    }


                    let texture = renderer.textures[id];
                    if (texture) {
                        if (renderer.type == "webgl") {
                            delete renderer.queue.textures.new[id];
                            delete renderer.queue.textures.update[id];

                            if (! texture.pending) { // It hasn't been properly made yet otherwise so doesn't need deleting
                                 renderer.queue.textures.delete[id] = true;
                            }
                        }
                        else {
                            delete renderer.tintedTextures[id];
                            delete renderer.tintedTextureCounts[id];
                        }

                        if (replaceSpriteTextures) {
                            for (let i in renderer.bitmapsUsingTextures[id]) { // Update the texture of sprites using this texture to a missing texture
                                let bitmapID = renderer.bitmapsUsingTextures[id][i];
                                if (bitmapID != null) {
                                    Bagel.internal.render.bitmapSprite.update(bitmapID, {
                                        ...renderer.bitmapSpriteData[bitmapID],
                                        image: ".Internal.missing"
                                    }, game, false, true);
                                }
                            }
                        }

                        delete renderer.textures[id];
                        delete renderer.bitmapsUsingTextures[id];
                    }
                    else {
                        console.error("Huh, looks like that texture doesn't exist. You tried to delete a texture with the id " + JSON.stringify(id) + ".");
                        Bagel.internal.oops(game);
                    }
                },
                get: (id, game) => {
                    if (Bagel.internal.getTypeOf(game) != "object") {
                        if (game) {
                            console.error("Hmm, looks like you didn't specify the game properly (it's the 2nd argument). It's supposed to be an object but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(game)) + ".");
                        }
                        else {
                            console.error("Huh, looks like you forgot to specify the game object. (2nd argument)");
                        }
                        Bagel.internal.oops(Bagel.internal.current.game);
                    }
                    if (typeof id != "string") {
                        console.error(":/ looks like you tried to use " + Bagel.internal.an(Bagel.internal.getTypeOf(id)) + " for the id argument (the first). It should be a string.");
                        Bagel.internal.oops(game);
                    }

                    if (game.config.isLoadingScreen) {
                        id = ".Internal.loadingScreen." + id;
                    }

                    let renderer = game.internal.renderer;
                    let texture = renderer.textures[id];

                    return texture? texture : false;
                },
                internal: {
                    regenerateBitmapCoords: (id, renderer, game) => {
                        let newUsingTextures = [];
                        for (let i in renderer.bitmapsUsingTextures[id]) { // Regenerate the texture coordinates
                            let bitmapID = renderer.bitmapsUsingTextures[id][i];
                            if (bitmapID != null) {
                                Bagel.internal.render.bitmapSprite.update(bitmapID, renderer.bitmapSpriteData[bitmapID], game, false, true);
                                newUsingTextures.push(bitmapID);
                            }
                        }
                        renderer.bitmapsUsingTextures[id] = newUsingTextures;
                    }
                }
            }
        },

        tryStyles: (element, property, values) => {
            for (let i in values) {
                if (CSS.supports(property, values[i])) {
                    element.style[property] = values[i];
                    return;
                }
            }
        },

        inputAction: {
            queued: [],
            queue: (code, data) => {
                Bagel.internal.inputAction.queued.push([code, data]);
            },
            input: _ => {
                let queued = Bagel.internal.inputAction.queued;
                for (let i in queued) {
                    queued[i][0](queued[i][1]);
                }
                Bagel.internal.inputAction.queued = [];
            }
        },
        triggerPluginListener: (type, game, value) => {
            let listeners = game.internal.combinedPlugins.listeners[type];

            if (listeners) {
                let current = Bagel.internal.current;
                Bagel.internal.saveCurrent();
                current.game = game;
                for (let i in listeners) {
                    let listener = listeners[i];
                    current.plugin = listener.plugin;
                    listener.fn(value, game, listener.plugin);
                }
                Bagel.internal.loadCurrent();
            }
        },
        triggerSpriteListener: (type, property, sprite, game, initialTrigger, subProperty, original) => {
            let handler = game.internal.combinedPlugins.types.sprites[sprite.type];
            if (handler.listeners.property[property] == null) { // No listener
                return;
            }
            if (handler.listeners.property[property][type] == null) { // No listener of that type
                return;
            }

            let plugin = handler.internal.plugin;

            let current = Bagel.internal.current;
            Bagel.internal.saveCurrent();
            current.sprite = sprite;
            current.game = game;
            current.plugin = plugin;

            let listener = handler.listeners.property[property];
            let properties = sprite.internal.Bagel.properties;
            let errors = [];
            if (["object", "array"].includes(Bagel.internal.getTypeOf(sprite[property])) && listener.subListen) {
                if (subProperty) {
                    errors.push([
                        listener[type](properties[property], properties[property][subProperty], subProperty, game, plugin, properties, sprite, Bagel.step.plugin.spriteListener, initialTrigger, original, property)
                    , subProperty]);
                }
                else {
                    for (let i in properties[property]) {
                        errors.push([
                            listener[type](properties[property], properties[property][i], i, game, plugin, properties, sprite, Bagel.step.plugin.spriteListener, initialTrigger, original, property)
                        , i]);
                    }
                }
            }
            else {
                errors.push([
                    listener[type](properties, properties[property], property, game, plugin, sprite, Bagel.step.plugin.spriteListener, initialTrigger, original)
                ]);
            }

            let rerun = false;
            for (let i in errors) {
                let error = errors[i];
                if (error[0]) {
                    if (error[0] == ".rerun") { // Not actually an error, just means it needs to be run again the next frame
                        sprite.internal.Bagel.rerunListeners.push([type, property, initialTrigger, error[1]]);
                        sprite.internal.Bagel.rerunIndex[property] = true;
                        rerun = true;
                    }
                    else {
                        console.error(error[0]);
                        if (error[1]) {
                            if (isNaN(error[1])) {
                                console.log("In the sprite " + JSON.stringify(sprite.id) + "." + property + "." + error[1] + ".");
                            }
                            else {
                                console.log("In the sprite " + JSON.stringify(sprite.id) + "." + property + " item " + error[1] + ".");
                            }
                        }
                        else {
                            console.log("In the sprite " + JSON.stringify(sprite.id) + "." + property + ".");
                        }
                        Bagel.internal.oops(game);
                    }
                }
            }
            Bagel.internal.loadCurrent();
            return rerun;
        },
        processSprite: sprite => {
            let game = sprite.game;
            let rerun = [...sprite.internal.Bagel.rerunListeners]; // The clone is so running the listeners doesn't affect which listeners are triggered
            sprite.internal.Bagel.rerunListeners = [];
            sprite.internal.Bagel.rerunIndex = {};

            let noReruns = true;
            for (let c in rerun) {
                let output = Bagel.internal.triggerSpriteListener(rerun[c][0], rerun[c][1], sprite, game, rerun[c][2], rerun[c][3]);
                if (rerun[c][1] != "visible" && output) {
                    noReruns = false;
                }
            }
            if (sprite.internal.Bagel.rendererNotInitialized) {
                if (noReruns) {
                    sprite.internal.Bagel.rendererNotInitialized = false;
                    Bagel.internal.subFunctions.createSprite.initRender(sprite, game);
                }
            }

            // Run the tick function
            let handler = game.internal.combinedPlugins.types.sprites[sprite.type];
            if (handler.tick) {
                let plugin = handler.internal.plugin;
                Bagel.internal.saveCurrent();
                let current = Bagel.internal.current;
                current.sprite = sprite;
                current.plugin = plugin;
                current.game = game;
                handler.tick(sprite, game, plugin);

                Bagel.internal.loadCurrent();
            }
        },

        processSpriteRenderOutput: (sprite, output) => {
            if (output != null && output !== false) {
                if (output === true) output = null;
                sprite.internal.Bagel.renderID = output;
            }
        },

        errorGameObject: {
            game: {
                assets: {
                    imgs: [
                        {
                            id: "Bagel",
                            src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAxCAYAAABznEEcAAAABmJLR0QAzAABAADUZNSSAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QQGFQwlp+ojXQAAB3BJREFUaN7FWklsHEUUfb+7up0Be4IdI+KQmCXEiBBimyUEJE4BxI0ThEPEJiHEJiE4cIAjICEBQqyKAgKxCQk4cEDiEOCAFMgCOAECgYQkhJCwxJYdZ3F3dX8O1V1dvU6PPZCRxp7qqe6uV//995ceQodf8qMrmQiwCAARgoBhCwKiMQigG76kTt5zzhc7/uEqvWi1RlL/DSD6LuY4foNA12+iUwLi6PtXsF4TEeYKBATQdbMD0/ZJE+9dzvHCLZMldYAsGgIO/VwJBATQte2BqT3573cuY8tYbNtAFg0B8/oAb6IaiJSAKxSYNfXAWHUm/fn2ZcwAQgaYGcyI3qyOIRkzx/MARjIXbq+a6PYCA0MAA+z50cnRGwwIocf86dXcERCH3ryUPU9Gi5o9EDCAmSPJRAAkBPSFTSDGuA6QSnP9/salaeWJqYT4mBpLKXHmujF93rEPrkhRy120DOjqA4hAw8/refzx6pbOrv2kglqllvjt9VGOdzHk9C5nLSKESJ2btUiy25lNjYahJ/MWyVCtyiKFIPa+NsqcoUMrINm1mXPh9KkDM+OpeV60UMsRxknRBRyhPhhgyoDkTLRnw0haQjNKYxEgZQDXFYXUyqrW6Ysu0FSCPw7/8O5Zx5EyaoksCDb+hCAEvoTrCoAYYEIIQAgbzKwvHjJggY09UedaBMCJVMkbx8nDu6NFq2sBQAjjXDIXYKzTmN+STrvWDzNnlMYWAlXU8jxZqVr6Yk5v6lzP8/XclN/EAlUkvzGtNqZpJbIOGYJhZXYlBCVoDYtY2iootMgZa7cC2KquveVeNBYuxYnDe5Q1HQFGuUW0/NawiD6y8+VhJsMHLCJIKeE6Aq18JCu/gQyw8LYx/PXWCI77QG+3g/k3b8XEu6ORLxVHdiklulxR7CNnD6n/h3blci0r8QWTCkDIDCFEilqh8X0ZtTxfYtpj7NkwgukZ4Nw7x2hi2sf+10dwdAZqTkSlbEAUQuSpNTCkxm6kcAMXJtQyLbHjxZVclO/EFqFMflRkkUBKHPfV5wvv3k5V8YcI6OkCXNdpnTSetzq5uTeuPse5V5TGi8QXIrNkeFfHR3w/wAkfWH7P9pYJ2+Ad3xIAHHhjlHvgw3WdwnuHAKyBZYZfMHBwV4ZqnDh2LJdlQDwts3kgvi9xwiesuG9HW+nzktu/pTIgYmAZ0LVA3e/kOHD4F8N7ORfeLNTIQG1hIzQitekDxzy0DcAEovwk8RFncFUqWQz/+Dknv6nIDkBse24Fx2mDlBKOI2pTqygdavcVb1Rj4VIV2TkKkESQezeDCJjxI9UqCIj8yVVsxbGBGbBtW1skSb/zqqVVaIYx/MB3c6qPB+9Q1lC7Pw4w4+S+LfD2ba5WLWNs6cUhHW3t6MQiIHYU4OZqBVPeJ/b/BDBwfN+WUlqXARHmQkJiWEwpByqjFqeles6UCsGYPrQ7ctnyexdRy0rnO3mL+L7M7YrvSxzzGJc/+H1H+kfn3jlG0zPAjOe3rBBjasVpPABY+cQtDUT5Sfpiti3QcIAtz17cEWP8+uoIn+YkC2TEPlmumMIobUWcgVoZ/W1FrbCTPmFsYByDhCP0uIxacdJomVWa50t9Md8PctRK50od9ImMcNRtPnieorpllpumxGoalQARwsY8AXz1zNwotWv9MDecWPFMeU8DKUoaRVTrWNc8spPK6uYyZ+/pH0R3/znoGzhfyV4nqGTcW+hCLAGijuUtIm7cTLm0owpId/8gegYuAYsmWDQRMrB46Sg2PT07a+x8ZSWf5rAurGbT19K5U6tOBjPQs2AwWnh0zJvUQBqC2wby/UsrIxqJ2qVuERAjizVScaQbAPP7l4DcJkIipQIglUMxY+rgDhARbCHQgMSmpy9mi4DVD/9QGj+2v3AJEwENJ6FNnVI317gwvtM3+/zJ5bluX7N/CSy3qcpJOQVy58OSUzh65DdYSLdo4sKIiHBSJnXMqod+oG3PrdCPAbq7CAQkLZ8WpW5VO6j7pq3F5alJral/DiSmFU2wN6m/L4rsthBateY50AGxIdTnhqNUT6X2SJQoc++6vd/C5tlnT17E5q40IyoRESw5hekjBzK7gkKLmOVmEKj0vp1St45Fzli7jUpbNmZLhkWPguxPYnL8d3WxisheVI+YKtJuOyjrn1ZBVZdrnq159EeK9bd7wWK1AF+pUHff4pZxxAyWoc5x7Fw9kq0QW3VRstTqvWUbVTaU09GZEdpNsD+JqX8OJOlIjYBYlrhlgahUpxyImQjGQGo9n9j4+EVMBDT7F2P6yMHaPA1kYDTbyh9/xX4yGx85a93XVPshSwykfQls7exlfa0gCCJwxUAGbv2G2nrIcu1jkX+08YxirtSKfSosqPHLANR6enoqLJKlVtxwm/WDxyqL+L5saZGkRsk4a4VFTNVqBaCt59j/tUWKnH3pXWO11td2of/pExGYqtZ+kFapuqoVv6sa0h39bUc2RemERZbfu/3/+W1H9lWU/Sa7b2vZrAKy8v4dp+ZXNmWvL55azq0s0ql+Vfz6F6w5R2hT4HCQAAAAAElFTkSuQmCC"
                        }
                    ]
                },
                sprites: [
                    {
                        id: "Bagel",
                        img: "Bagel",
                        vars: {
                            vel: 0,
                            rotVel: 0,
                            waitTick: 0,
                            finished: false
                        },
                        scripts: {
                            init: [
                                {
                                    code: (me, game) => {
                                        me.width = Math.min(game.width, game.height) / 3;
                                        me.height = me.width;
                                        me.y += me.height / 2;

                                        me.angle = -90;
                                    },
                                    stateToRun: "game"
                                }
                            ],
                            main: [
                                {
                                    code: me => {
                                        if (! me.vars.finished) {
                                            if (me.vars.waitTick == 60) {
                                                let target = (me.game.height / 2) - (me.height / 2) - (me.height * 0.025);
                                                if (me.y > target) {
                                                    me.vars.vel -= me.height / 300;
                                                    me.vars.rotVel -= me.height / 390;
                                                }

                                                me.y += me.vars.vel;
                                                me.angle += me.vars.rotVel;
                                                me.vars.vel *= 0.9;
                                                me.vars.rotVel *= 0.95;
                                                if (me.y < target) {
                                                    me.y = target;
                                                    me.angle = 90;
                                                    me.vars.vel = 0;
                                                    me.vars.rotVel = 0;
                                                    me.vars.finished = true;
                                                }
                                            }
                                            else {
                                                me.vars.waitTick++;
                                            }
                                        }
                                    },
                                    stateToRun: "game"
                                }
                            ]
                        }
                    },
                    {
                        id: "DiscSlot",
                        type: "canvas",
                        vars: {
                            shrinkTick: 0,
                            shrinkVel: 0,
                            delete: false,
                            waitTick: 0
                        },
                        scripts: {
                            init: [
                                {
                                    code: (me, game) => {
                                        let canvas = me.canvas;
                                        let ctx = me.ctx;

                                        let bagelWidth = game.get.sprite("Bagel").width;
                                        let lineWidth = bagelWidth * 0.05;

                                        me.width = bagelWidth * 1.05;
                                        me.height = me.width;
                                        ctx.scale(me.scaleX, me.scaleY);
                                        me.y += (me.height / 2) - (lineWidth / 2);


                                        ctx.fillStyle = game.config.display.backgroundColor;
                                        ctx.fillRect(0, 0, me.width, me.height);

                                        ctx.strokeStyle = "#6B6B6B";
                                        ctx.lineCap = "round";
                                        ctx.lineWidth = lineWidth;
                                        ctx.beginPath();
                                        ctx.moveTo(ctx.lineWidth / 2, ctx.lineWidth / 2);
                                        ctx.lineTo(me.width - (ctx.lineWidth / 2), ctx.lineWidth / 2);
                                        ctx.stroke();

                                        ctx.setTransform(1, 0, 0, 1, 0, 0);


                                        me.updated = true;
                                        me.updateRes = false;
                                    },
                                    stateToRun: "game"
                                }
                            ]
                        },
                        render: (me, game, ctx, canvas) => {
                            if (me.vars.delete) {
                                me.delete();
                                game.get.sprite("Text").vars.ready = true;
                                return;
                            }
                            if (game.get.sprite("Bagel").vars.finished) {
                                if (me.vars.waitTick == 30) {
                                    ctx.scale(me.scaleX, me.scaleY);

                                    ctx.fillStyle = game.config.display.backgroundColor;
                                    ctx.fillRect(0, 0, me.width, me.height);

                                    me.vars.shrinkVel += me.width / 300;
                                    me.vars.shrinkTick += me.vars.shrinkVel;
                                    me.vars.shrinkVel *= 0.95;

                                    if (me.vars.shrinkTick + (ctx.lineWidth / 2) >= me.width / 2) {
                                        me.vars.shrinkTick = (me.width / 2) - (ctx.lineWidth / 2);
                                        let was = me.ctx.lineWidth;
                                        me.ctx.lineWidth *= 0.9;
                                        me.y += (was - me.ctx.lineWidth) / 2;

                                        if (me.ctx.lineWidth < 1) {
                                            me.vars.delete = true; // Wait until the next frame
                                        }
                                    }

                                    ctx.beginPath();
                                    ctx.moveTo((ctx.lineWidth / 2) + me.vars.shrinkTick, ctx.lineWidth / 2);
                                    ctx.lineTo(me.width - (ctx.lineWidth / 2) - me.vars.shrinkTick, ctx.lineWidth / 2);
                                    ctx.stroke();

                                    ctx.setTransform(1, 0, 0, 1, 0, 0);

                                    return true;
                                }
                                else {
                                    me.vars.waitTick++;
                                }
                            }
                        },
                        fullRes: true,
                        width: 1,
                        height: 1,
                        mode: "static"
                    },
                    {
                        id: "Text",
                        type: "text",
                        vars: {
                            ready: false, // Set by the disc slot sprite
                            alphaVel: 0
                        },
                        text: "",
                        scripts: {
                            init: [
                                {
                                    code: (me, game) => {
                                        me.y = game.height / 1.5;

                                        let code = game.vars.loading.game.internal.errorCode;
                                        me.size = Math.min(game.width, game.height) / 20;
                                        if (code == 0) {
                                            me.text = "Looks like this device doesn't meet this game's minimum requirements.";
                                            me.visible = false;
                                        }
                                    },
                                    stateToRun: "game"
                                }
                            ],
                            main: [
                                {
                                    code: me => {
                                        if (me.visible) {
                                            if (me.alpha != 1) {
                                                me.vars.alphaVel += 0.005;
                                            }
                                            me.alpha += me.vars.alphaVel;
                                            if (me.alpha > 1) {
                                                me.alpha = 1;
                                            }
                                            me.y -= me.vars.alphaVel * 40;
                                            me.vars.alphaVel *= 0.9;
                                        }
                                        else {
                                            if (me.vars.ready) {
                                                me.visible = true;
                                                me.alpha = 0;
                                            }
                                        }
                                    },
                                    stateToRun: "game"
                                }
                            ]
                        }
                    }
                ]
            },
            config: {
                display: {
                    resolution: "full"
                }
            },
            state: "game"
        },

        requestAnimationFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
        debug: {
            add: message => {
                Bagel.internal.debug.queue.push(message);
            },
            warn: message => Bagel.internal.debug.add(["warning", message]),
            log: message => Bagel.internal.debug.add(["log", message]),
            send: _ => {
                let queue = Bagel.internal.debug.queue;
                if (queue.length == 0) {
                    return;
                }
                let log = Bagel.internal.debug.logList;
                let stringQueue = JSON.stringify(queue);

                if (log.includes(stringQueue)) {
                    Bagel.internal.debug.queue = [];
                    return false;
                }
                else {
                    log.push(stringQueue);
                    for (let i in queue) {
                        let item = queue[i];
                        if (item[0] == "warning") {
                            console.warn(item[1]);
                        }
                        else {
                            console.log(item[1]);
                        }
                    }
                }
                Bagel.internal.debug.queue = [];
                return true;
            },
            queue: [],
            logList: []
        },
        games: {},
    },

    check: (args, disableChecks={}, logObject, errorMessage) => {
        if (! (args.prev || disableChecks.args)) {
            args = Bagel.check({
                ob: args,
                where: args.where? args.where : "the check function. (Bagel.check)",
                syntax: {
                    ob: {
                        required: true,
                        types: [
                            "object",
                            "array"
                        ],
                        description: "The object or array of objects to check."
                    },
                    where: {
                        required: true,
                        types: ["string"],
                        description: "A description of what it's checking."
                    },
                    syntax: {
                        required: true,
                        types: ["object"],
                        description: [
                            "The syntax for the object. e.g {",
                            "    // \"foo\" is the argument name",
                            "    foo: {",
                            "        required: true, // If the \"foo\" argument is required or not.",
                            "        //default: \"foo\", // If it's not required, it needs a default",
                            "        types: [\"string\"], // The different data types to accept. e.g array, object, string, number etc.",
                            "        description: \"foo\" // A clear and to the point explaination of what this argument does",
                            "    }",
                            "}"
                        ].join("\n")
                    },
                    game: {
                        required: false,
                        skipCloning: true,
                        default: Bagel.internal.current.game,
                        types: ["object"],
                        description: "The game object. Optional if this is being run in a script."
                    }
                }
            }, Bagel.internal.checks.disableArgCheck, true);
        }
        if (disableChecks.missing && disableChecks.types && disableChecks.useless) return args.ob; // No checks to do
        if (! args.hasOwnProperty("game")) {
            args.game = Bagel.internal.current.game;
        }

        let output = Bagel.internal.debug;
        let arrayString = ["array", "string"];

        let useless = [];
        let missing = [];
        let wrongTypes = [];

        let extraChecks = [];

        let combined;
        if (disableChecks.missing) {
            combined = args.ob;
        }
        else {
            combined = {...args.ob, ...args.syntax};
        }
        let checked = {}; // Don't go over the same thing twice
        for (let argID in combined) {
            if (checked[argID]) {
                continue;
            }
            checked[argID] = true;
            let syntax = args.syntax[argID];
            let arg = args.ob[argID];

            if (syntax == null) {
                if (! disableChecks.useless) {
                    useless.push(argID);
                }
                continue;
            }
            if (syntax == "ignore") {
                continue;
            }

            let defaulted = false;
            if (! args.ob.hasOwnProperty(argID)) {
                if (syntax.required) {
                    missing.push(argID);
                }
                else {
                    if (syntax.hasOwnProperty("default")) {
                        if (syntax.skipCloning) {
                            args.ob[argID] = syntax.default;
                        }
                        else {
                            args.ob[argID] = Bagel.internal.deepClone(syntax.default);
                        }

                        arg = args.ob[argID];
                    }
                    defaulted = true;
                }
            }
            if (! disableChecks.types) {
                if (! defaulted) {
                    if (missing.length == 0) {
                        if (syntax.types == null) {
                            console.error("The syntax for " + args.where + "." + argID + " is missing the \"types\" argument.");
                            console.log("In " + args.where + ".");
                            console.log("Syntax:");
                            console.log(syntax);
                            Bagel.internal.oops(args.game);
                        }
                        if (! arrayString.includes(Bagel.internal.getTypeOf(syntax.types))) {
                            console.error("The syntax for " + args.where + "." + argID + " has the wrong data type for the \"types\" argument. You used " + Bagel.internal.an(Bagel.internal.getTypeOf(syntax.types)) + ".");
                            console.log("In " + args.where + ".");
                            console.log("Syntax:");
                            console.log(syntax);
                            Bagel.internal.oops(args.game);
                        }
                        if ((! syntax.types.includes(Bagel.internal.getTypeOf(arg))) && syntax.types != "any") {
                            wrongTypes.push(argID);
                        }
                    }
                }
            }

            if (syntax.subcheck || syntax.check) {
                extraChecks.push(argID);
            }
        }

        let otherErrors = missing.length != 0 || wrongTypes.length != 0;

        if (useless.length > 0) {
            if (useless.length == 1) {
                output.warn(
                    "Oops, looks like you used an unsupported argument"
                    + (otherErrors? "" : (" in " + args.where))
                    + ": "
                    + JSON.stringify(useless[0])
                    + ". You can leave this alone if you want, but it doesn't need to be there."
                );
            }
            else {
                output.warn(
                    "Hmm, looks like you used some unsupported arguments"
                    + (otherErrors? "" : (" in " + args.where))
                    + ":\n  • "
                    + useless.map((index, item) => JSON.stringify(index)).join("\n  • ")
                    + "\n\nYou can leave these if you want, but they don't need to be there."
                );
            }
            if (errorMessage) {
                output.log(errorMessage);
            }
        }
        if (missing.length > 0) {
            if (missing.length == 1) {
                console.error(
                    "Hmm, looks like you forgot the "
                    + JSON.stringify(missing[0])
                    + " argument."
                );
            }
            else {
                console.error(
                    "Whelp, looks like you forgot some arguments:\n"
                    + missing.map(name =>
                        "  • "
                        + JSON.stringify(name)
                        + " -> "
                        + args.syntax[name].description
                    ).join("\n")
                );
            }
            if (errorMessage) {
                console.log(errorMessage);
            }
        }
        if (wrongTypes.length > 0) {
            if (wrongTypes.length == 1) {
                console.error(
                    ":/ looks like you used the wrong type for the "
                    + JSON.stringify(wrongTypes[0])
                    + " argument. You used "
                    + Bagel.internal.an(Bagel.internal.getTypeOf(args.ob[wrongTypes[0]]))
                    + " instead of "
                    + Bagel.internal.list(args.syntax[wrongTypes[0]].types, "or", true)
                    + "."
                );
            }
            else {
                console.error(
                    "Hmm, looks like you got some types wrong:\n"
                    + wrongTypes.map((name, item) =>
                        "  • "
                        + JSON.stringify(name)
                        + " -> Should be "
                        + Bagel.internal.list(args.syntax[name].types, "or", true)
                        + ". You used " + Bagel.internal.an(Bagel.internal.getTypeOf(args.ob[wrongTypes[item]])) + "."
                    ).join("\n")
                );
            }
            if (errorMessage) {
                console.log(errorMessage);
            }
        }

        if (useless.length + wrongTypes.length != 0) {
            output.warn(
                "FYI, these are the arguments:\n"
                + Object.keys(args.syntax).filter(name => args.syntax[name] != "ignore").map(name =>
                    "  • "
                    + (args.syntax[name].required? "" : "(optional) ")
                    + JSON.stringify(name)
                    + " -> "
                    + args.syntax[name].description
                    + "\n  Can " + (args.syntax[name].types.length == 1? "only " : "") + "use " + Bagel.internal.list(args.syntax[name].types, "or", true)
                    + "."
                ).join("\n\n")
            );
        }

        if (otherErrors) {
            output.log("In " + args.where + ".");
            if (output.send()) {
                console.log("Object:");
                console.log(args.ob);
                if (errorMessage) {
                    console.log(errorMessage);
                }
            }

            Bagel.internal.oops(args.game);
        }
        output.send();

        if (extraChecks.length > 0) {
            for (let i in extraChecks) {
                let argID = extraChecks[i];

                let syntax = args.syntax[argID];
                if (syntax.subcheck && typeof args.ob[argID] == "object") {
                    let isArray = Array.isArray(args.ob[argID]);
                    if (isArray || syntax.arrayLike) {
                        for (let i in args.ob[argID]) {
                            Bagel.check({
                                ob: args.ob[argID][i],
                                where: isArray? (args.where + "." + argID + " item " + i) : args.where + "." + argID + "." + i,
                                syntax: syntax.subcheck,
                                prev: args,
                                prevName: i,
                                game: args.game
                            }, {
                                ...Bagel.internal.checks.disableArgCheck,
                                useless: syntax.ignoreUseless
                            });
                        }
                    }
                    else {
                        Bagel.check({
                            ob: args.ob[argID],
                            where: args.where + "." + argID,
                            syntax: syntax.subcheck,
                            prev: args,
                            prevName: argID,
                            game: args.game
                        }, {
                            ...Bagel.internal.checks.disableArgCheck,
                            useless: syntax.ignoreUseless
                        });
                    }
                }
                if (syntax.check) {
                    if (syntax.checkEach) {
                        let prev = args;
                        for (let c in args.ob[argID]) {
                            let error = syntax.check(args.ob[argID][c], args.ob[argID], c, argID, args.game, prev, args);
                            if (error) {
                                console.error(error);
                                if (isNaN(c)) {
                                    console.log("In " + args.where + "." + argID + "." + c + ".");
                                }
                                else {
                                    console.log("In " + args.where + "." + argID + " item " + c + ".");
                                }
                                console.log("Value:");
                                console.log(args.ob[argID][c]);
                                Bagel.internal.oops(args.game);
                            }
                        }
                    }
                    else {
                        let error = syntax.check(args.ob[argID], args.ob, argID, args.game, args.prev, args);
                        if (error) {
                            console.error(error);
                            console.log("In " + args.where + "." + argID + ".");
                            console.log("Value:");
                            console.log(args.ob[argID]);
                            Bagel.internal.oops(args.game);
                        }
                    }
                }
            }
        }

        return args.ob;
    },

    get: {
        asset: {},
        sprite: (id, game, check) => {
            if (game == null) {
                game = Bagel.internal.current.game;
            }
            if (game == null) {
                console.error("Oops. Looks like you're trying to run this function outside of a script. Try moving it and trying again. Alternatively, you can pass the game object in as the second argument to this function to fix this issue.");
                Bagel.internal.oops();
            }
            if (id == null) {
                console.error("Oops, you forgot the first argument: the id. It's the id for the sprite you want to get").
                Bagel.internal.oops(game);
            }
            if (typeof id != "string") {
                console.error("Oops, the id for Bagel.get.sprite can only be a string but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(id)) + ".");
                Bagel.internal.oops(game);
            }
            if (game.internal.idIndex[id] == null) {
                if (check) return false;
                console.error("Hmm, Bagel.js couldn't get the sprite " + JSON.stringify(id) + " because it doesn't seem to exist. You might want to check its id and the game this is running in or on.");
                Bagel.internal.oops(game);
            }
            return game.game.sprites[game.internal.idIndex[id]];
        },
        game: id => {
            if (id == null) {
                console.error("Oops, you forgot the first argument: the id. It's the id for the game you want to get.").
                Bagel.internal.oops(Bagel.internal.current.game);
            }
            if (Bagel.internal.games[id] == null) {
                if (check) return false;
                console.error(":/ Bagel.js couldn't get the game " + JSON.stringify(id) + " because it doesn't seem to exist.");
                Bagel.internal.oops(Bagel.internal.current.game);
            }
            return Bagel.internal.games[id];
        }
    },
    set: {
        asset: {}
    },
    step: {
        sprite: (id, sprite, game) => {
            let current = Bagel.internal.current;
            game = game || current.game;
            sprite = sprite || current.sprite;
            if (sprite == null) {
                console.error("Oops, this must be run in a sprite script.");
                Bagel.internal.oops(game);
            }
            if (game == null) {
                console.error("Huh, this isn't being run inside a game and you didn't specifiy a game. You can fix this either by moving it inside a script or providing the game object as the last argument.");
                Bagel.internal.oops();
            }
            let step = sprite.scripts.steps[id];
            if (step == null) {
                console.error("Huh, the step " + JSON.stringify(id) + " doesn't exist in the sprite " + JSON.stringify(sprite.id) + ".");
                Bagel.internal.oops(game);
            }

            return step(sprite, game, Bagel.step.sprite);
        },
        plugin: {
            scripts: id => {
                let current = Bagel.internal.current;
                let game = current.game;
                let plugin = current.plugin;
                if (plugin == null) {
                    console.error("Oops, this must be run inside a plugin.");
                    Bagel.internal.oops(game);
                }
                let step = plugin.plugin.scripts.steps[id];
                if (step == null) {
                    console.error("Huh, the step " + JSON.stringify(id) + " doesn't exist in plugin " + plugin.info.id + ".");
                    Bagel.internal.oops(game);
                }

                return step(plugin, game, Bagel.step.plugin.scripts);
            },
            spriteListener: id => {
                let current = Bagel.internal.current;
                let sprite = current.sprite;
                let game = current.game;
                let plugin = current.plugin;
                if (plugin == null) {
                    console.error("Oops, this must be run inside a plugin.");
                    Bagel.internal.oops(game);
                }
                let step = plugin.plugin.types.sprites[sprite.type].listeners.steps[id];
                if (step == null) {
                    console.error("Huh, the step " + JSON.stringify(id) + " doesn't exist in plugin " + plugin.info.id + ".plugin.types.sprites." + sprite.type + ".listeners.steps. Make sure the id is correct, also remember it's case sensitive.");
                    Bagel.internal.oops(game);
                }

                return step(plugin, game, Bagel.step.plugin.spriteListener);
            }
        }
    },
    config: {
        flags: {
            warnOfUselessParameters: true
        }
    },
    device: {
        browser: (_ => {
            if (window.chrome) {
                return "Chrome";
            }
            if (navigator.userAgent.includes("Firefox")) {
                return "Firefox";
            }
            if (navigator.userAgent.includes("Safari")) {
                return "Safari";
            }
        })(),
        is: {
            touchscreen: document.ontouchstart === null,
            webGLSupported: null,
            webPSupported: (_ => {
                let canvas = document.createElement("canvas");
                canvas.width = 1;
                canvas.height = 1;
                let ctx = canvas.getContext("2d");
                if (canvas.toDataURL("image/webp").includes("webp")) {
                    return true;
                }
                let agent = navigator.userAgent;
                if (agent.includes("Firefox")) { // Firefox supports decoding but not encoding after version 64
                    let version = parseFloat(agent.slice(agent.indexOf("Firefox") + 8));
                    return version >= 65;
                }
                return false;
            })(),
            oggSupported: new Audio().canPlayType("audio/ogg;codecs=opus") != ""
        },
        webgl: {}
    },
    events: {
        pwaUpdate: null
    },
    version: "1.6a"
};
Bagel.internal.requestAnimationFrame.call(window, Bagel.internal.tick);
