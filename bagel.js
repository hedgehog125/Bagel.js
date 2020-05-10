/*
TODO:
Remove categories and use objects instead
Does having more than 2 catergories work?
Categories are the wrong way round. sprite.layer isn't defined
Bagel methods <=======================================================
Remove FPS option in syntax for games (GameJSON.config.fps?)
Categories in games and Bagel
Prevent overwriting in sprites, games and Bagel by methods
Reserved ids for sprites and other stuff. Games?
Plugin argument in custom functions
Reserved ids for plugins
Move maths to plugin
.clones checking? Does it already exist?

PERFORMANCE
Prescale images on canvases?
Disable alpha?
Clear the canvas more efficiently?
Optimise .move

Automatic clone recycling
WebGL renderer
More efficient clone checking


Allow loading of other plugins
Tidy up unused properties and code. Don't forget renderers
Review internal stuff, what's used, what's not needed and what needs rewriting
Value argument in getters
Plugins should be able to make existing methods apply to their sprites
Completely rewrite "tick" function. Needs tidying a bit more
Update "step" function
Steps in other places. Especially listeners
Delete clones on state change
Avoid constantly declaring anonymous functions, declare them and then access them to save resources.
Review cloneArgs[x].syntax, does it have all the check function arguments?
When is the sprite description used?
Finish the TODO descriptions
Handling of two plugins with the same ids
id or ID in descriptions?
Does the overwrite argument work?
Plugins should be able to register game, sprite and bagel values
README


CREDITS
Click, click release and mouse touch from: https://scratch.mit.edu/projects/42854414/ under CC BY-SA 2.0

Before clone check improvement: ~12FPS
After:
*/

Bagel = {
    init: (game) => {
        let internal = Bagel.internal; // A shortcut
        let subFunctions = Bagel.internal.subFunctions.init;

        internal.current.game = game;
        game = subFunctions.check(game);

        subFunctions.misc(game);
        Bagel.internal.loadPlugin(Bagel.internal.plugin, game, {}); // Load the built in plugin

        subFunctions.inputs(game, game.internal.renderer.canvas.addEventListener);
        subFunctions.plugins(game);
        subFunctions.assets(game);
        subFunctions.methods(game);
        subFunctions.initScripts(game);

        // Sprites
        for (let i in game.game.sprites) { // TODO: Temporary
            let sprite = Bagel.internal.createSprite(game.game.sprites[i], game, false, "GameJSON.game.sprites item " + i, false, parseInt(i));
        }

        if (game.game.scripts.preload != null) {
            game.game.scripts.preload(game);
        }

        Bagel.internal.games[game.id] = game;
        Bagel.internal.current.game = null;
        return game;
    },
    internal: {
        plugin: { // The built-in plugin
            info: {
                id: "Internal",
                description: "The built-in plugin, adds an image based sprite type, a canvas and a renderer. Also contains some useful methods.",
            },
            plugin: {
                types: {
                    assets: {
                        imgs: {
                            args: {
                                id: {
                                    required: true,
                                    types: ["string"],
                                    description: "The id to target the image by."
                                },
                                src: {
                                    required: true,
                                    types: ["string"],
                                    description: "The src of the image."
                                }
                            },
                            description: "Images give a sprite (only the sprite type though) its appearance. Just set its \"img\" argument to the id of the image you want to use.",
                            check: (asset, game, check, standardChecks, plugin, index) => {
                                let error = standardChecks.id();
                                if (error) return error;
                                error = standardChecks.isInternal();
                                if (error) return error;
                            },
                            init: (asset, ready, game, plugin, index) => {
                                let img = new Image();
                                img.onload = () => {
                                    ready({
                                        img: img,
                                        JSON: asset
                                    });
                                }
                                img.src = asset.src;
                            },
                            get: {
                                name: "img"
                            }
                        },
                        snds: {
                            args: {
                                id: {
                                    required: true,
                                    types: ["string"],
                                    description: "The id to target the sound by."
                                },
                                src: {
                                    required: true,
                                    types: ["string"],
                                    description: "The src of the sound."
                                }
                            },
                            description: "Sounds can be played by anything. They're played using Game.playSound(<id>)",
                            check: (asset, game, check, standardChecks, plugin, index) => {
                                let error = standardChecks.id();
                                if (error) return error;
                                error = standardChecks.isInternal();
                                if (error) return error;
                            },
                            init: (asset, ready, game, plugin, index) => {
                                let snd = new Audio();
                                snd.preload = "metadata";
                                snd.onloadeddata = () => {
                                    ready({
                                        snd: snd,
                                        JSON: asset
                                    }); // Sounds are ready instantly
                                };
                                snd.src = asset.src;
                            },
                            get: {
                                name: "snd"
                            }
                        }
                    },
                    sprites: {
                        sprite: {
                            args: {
                                id: {
                                    required: true,
                                    types: ["string"],
                                    description: "The id for the sprite to be targeted by."
                                },
                                vars: {
                                    required: false,
                                    default: {},
                                    types: ["object"],
                                    description: "An object you can use to store data for the sprite."
                                },

                                x: {
                                    required: false,
                                    default: "centred",
                                    types: [
                                        "number",
                                        "string",
                                        "function"
                                    ],
                                    description: "The X position for the sprite to start at. Can also be set to \"centred\" to centre it along the X axis, or set to a function that returns a position when the game loads. e.g:\n(game, me) => game.width - 50"
                                },
                                y: {
                                    required: false,
                                    default: "centred",
                                    types: [
                                        "number",
                                        "string",
                                        "function"
                                    ],
                                    description: "The Y position for the sprite to start at. Can also be set to \"centred\" to centre it along the Y axis, or set to a function that returns a position when the game loads. e.g:\n(game, me) => game.height - 50"
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
                                    default: "1x",
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The width for the sprite. Defaults to the width of the image. You can also set it to a multiple of the image width by setting it to \"1x\", \"2x\", etc."
                                },
                                height: {
                                    required: false,
                                    default: "1x",
                                    types: [
                                        "number",
                                        "string"
                                    ],
                                    description: "The height for the sprite. Defaults to the height of the image. You can also set it to a multiple of the image height by setting it to \"1x\", \"2x\", etc."
                                },
                                scripts: {
                                    required: false,
                                    default: {
                                        init: [],
                                        main: [],
                                        steps: {}
                                    },
                                    types: [
                                        "object"
                                    ],
                                    description: "The sprite's scripts."
                                },
                                clones: {
                                    default: {},
                                    types: [
                                        "object"
                                    ],
                                    description: "The default data for a clone of this sprite.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                                },
                                visible: {
                                    required: false,
                                    default: true,
                                    types: [
                                        "boolean"
                                    ],
                                    description: "Determines if the sprite is visible or not."
                                },
                                alpha: {
                                    required: false,
                                    default: 1,
                                    types: [
                                        "number"
                                    ],
                                    description: "The alpha of the sprite. 1 = Fully visible. 0 = Invisible."
                                },
                                angle: {
                                    required: false,
                                    default: 90,
                                    types: [
                                        "number"
                                    ],
                                    description: "The angle of the sprite. In degrees. 0º = up. 180º = down. -90º = left. 90º = right."
                                }
                            },
                            cloneArgs: {
                                id: {
                                    syntax: {
                                        description: "The id for the clone to be targeted by. Defaults to the parent's name followed by a hashtag and then the lowest number starting from 0 that hasn't already been used."
                                    },
                                    mode: "replace"
                                },
                                vars: {
                                    syntax: {
                                        description: "An object you can use to store data for the clone."
                                    },
                                    mode: "merge"
                                },

                                x: {
                                    syntax: {
                                        description: "The X position for the clone to start at. Can also be set to \"centred\" to centre it along the X axis, or set to a function that returns a position when the game loads. e.g:\n(me, game) => game.width - 50"
                                    },
                                    mode: "replace"
                                },
                                y: {
                                    syntax: {
                                        description: "The Y position for the clone to start at. Can also be set to \"centred\" to centre it along the Y axis, or set to a function that returns a position when the game loads. e.g:\n(me, game) => game.height - 50"
                                    },
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
                                clones: {
                                    syntax: {
                                        default: {},
                                        types: [
                                            "object"
                                        ],
                                        description: "The default data for a clone of this sprite.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                                    },
                                    mode: "ignore"
                                },
                                visible: {
                                    syntax: {
                                        description: "Determines if the clone is visible or not."
                                    },
                                    mode: "replace"
                                },
                                alpha: {
                                    syntax: {
                                        description: "The alpha of the sprite. 1 = Fully visible. 0 = Invisible."
                                    },
                                    mode: "replace"
                                },
                                angle: {
                                    syntax: {
                                        description: "The angle of the clone. In degrees. 0º = up. 180º = down. -90º = left. 90º = right."
                                    },
                                    mode: "replace"
                                }
                            },
                            listeners: {
                                steps: {},
                                fns: {
                                    xy: (sprite, property, game, plugin, triggerSprite) => {
                                        let value = sprite[property];

                                        if (typeof value == "string") {
                                            if (value == "centred") {
                                                sprite[property] = game[property == "x"? "width" : "height"] / 2;
                                            }
                                        }
                                        if (typeof value == "function") {
                                            sprite[property] = value(sprite, game); // Avoid the setter
                                        }
                                    },
                                    dimensions: (sprite, property, game, plugin, triggerSprite) => {
                                        let value = sprite[property];

                                        if (typeof value == "string") {
                                            if (value.includes("x")) {
                                                let scale = parseFloat(value.split("x")[0]);

                                                sprite[property] = Bagel.get.asset.img(triggerSprite.img)[property] * scale;
                                            }
                                        }
                                    }
                                },
                                property: {
                                    x: {
                                        get: "xy"
                                    },
                                    y: {
                                        get: "xy"
                                    },
                                    width: {
                                        get: "dimensions"
                                    },
                                    height: {
                                        get: "dimensions"
                                    },
                                    scale: {
                                        set: (sprite, value, property, game, plugin, triggerSprite) => {
                                            triggerSprite.width = value + "x";
                                            triggerSprite.height = value + "x";
                                        },
                                        get: (sprite, property, game, plugin) => {
                                            let img = Bagel.get.asset.img(sprite.img);
                                            let scaleX = sprite.width / img.width;
                                            let scaleY = sprite.height / img.height;

                                            sprite.scale = (scaleX + scaleY) / 2; // Use the average of the two
                                        }
                                    },
                                    angle: {
                                        set: (sprite, value, property, game, plugin, triggerSprite) => {
                                            let cache = triggerSprite.internal.cache;
                                            // Update the cached stuff
                                            let rad = Bagel.maths.degToRad(sprite.angle + 90);
                                            cache.cos = Math.cos(rad);
                                            cache.sin = Math.sin(rad);
                                        },
                                        get: sprite => {
                                            sprite.angle = ((sprite.angle + 180) % 360) - 180; // Make sure it's in range
                                        }
                                    }
                                }
                            },
                            description: "A basic type of sprite. Has the appearance of the image specified.",
                            check: (sprite, game, check, index, where) => {

                            },
                            init: (sprite, game, plugin) => {
                                sprite.last = {
                                    collision: null
                                };

                                sprite.internal.cache = {};
                                sprite.angle = sprite.internal.properties.angle; // Trigger the setter
                            },
                            render: { // How do I render this type?
                                ctx: (sprite, ctx, canvas, game, plugin, scaleX, scaleY) => {
                                    if (sprite.img == null) return; // No image for this sprite
                                    let imgs = game.internal.assets.assets.imgs;
                                    if (imgs[sprite.img] == null) return; // No asset or it's still loading and wasn't preloaded
                                    let img = imgs[sprite.img].img;

                                    ctx.globalAlpha = sprite.alpha;

                                    let flipX = sprite.width >= 0? 1 : -1;
                                    let flipY = sprite.height >= 0? 1 : -1;
                                    scaleX = scaleX * flipX;
                                    scaleY = scaleY * flipY;
                                    ctx.scale(scaleX, scaleY);

                                    let halfWidth = sprite.width / 2;
                                    let halfHeight = sprite.height / 2;
                                    if (sprite.angle == 90) { // Don't rotate if we don't need to. TODO: test
                                        ctx.drawImage(img, sprite.x - halfWidth, sprite.y - halfHeight, sprite.width, sprite.height);
                                    }
                                    else {
                                        let angle = Bagel.maths.degToRad(sprite.angle - 90);
                                        let x = sprite.x;
                                        let y = sprite.y;

                                        ctx.translate(x, y);
                                        ctx.rotate(angle);
                                        ctx.drawImage(img, -halfWidth, -halfHeight, sprite.width, sprite.height);

                                        ctx.rotate(-angle);
                                        ctx.translate(-x, -y);
                                    }
                                    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the scaling
                                    ctx.globalAlpha = 1;
                                },
                                // webgl: (sprite, ctx, canvas, game, plugin)...
                            }
                        }
                    }
                },
                assets: {},
                sprites: [],

                methods: {
                    bagel: {
                        maths: {
                            category: {
                                radToDeg: {
                                    fn: {
                                        normal: true,
                                        fn: rad => (rad * 180) / Math.PI
                                    }
                                },
                                degToRad: {
                                    fn: {
                                        category: "maths",
                                        normal: true,
                                        fn: deg => deg * (Math.PI / 180)
                                    }
                                },
                                get: {
                                    category: {
                                        direction: {
                                            fn: {
                                                normal: true,
                                                fn: (x1, y1, x2, y2) => Bagel.maths.radToDeg(Math.atan2(y2 - y1, x2 - x1)) - 90 // gist.github.com/conorbuck/2606166
                                            }
                                        },
                                        distance: {
                                            fn: {
                                                normal: true,
                                                fn: (x1, y1, x2, y2) => Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2)) // a^2 + b^2 = c^2
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
                                        description: "The ID of the sound to play."
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
                                    }
                                },
                                fn: (game, args, plugin) => {
                                    let snd = Bagel.get.asset.snd(args.id, game);

                                    snd.currentTime = args.startTime;
                                    snd.loop = args.loop;
                                    if (plugin.vars.audio.autoPlay) { // Wait for an unmute instead of treating every input as one
                                        let promise = snd.play();
                                        if (promise != null) {
                                            promise.then(() => { // Autoplay worked
                                                plugin.vars.audio.autoPlay = true;
                                            }).catch(() => { // Nope. Prompt the user
                                                plugin.vars.audio.autoPlay = false;
                                                if (args.loop || snd.duration >= 5) { // It's probably important instead of just a sound effect. Queue it
                                                    if (! Bagel.get.sprite(".Internal.unmute", game, true)) { // Check if the button exists
                                                        // Create one instead
                                                        // TODO: how does it handle state changes?
                                                        let where = "plugin Internal's function \"game.playSound\"";
                                                        game.add.asset.img({
                                                            id: ".Internal.unmuteButtonMuted",
                                                            src: "../assets/imgs/muted.png"
                                                        }, where); // Load its image
                                                        game.add.asset.img({
                                                            id: ".Internal.unmuteButton",
                                                            src: "../assets/imgs/unmuted.png"
                                                        }, where); // Load its image

                                                        game.add.asset.snd({
                                                            id: ".Internal.unmuteButtonClick",
                                                            src: "../assets/snds/clickDown.mp3"
                                                        }, where)
                                                        game.add.asset.snd({
                                                            id: ".Internal.unmuteButtonClickUp",
                                                            src: "../assets/snds/clickUp.mp3"
                                                        }, where)
                                                        game.add.asset.snd({
                                                            id: ".Internal.unmuteButtonMouseTouch",
                                                            src: "../assets/snds/mouseTouch.mp3"
                                                        }, where)

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
                                                                        let vars = me.vars.plugin.vars;
                                                                        for (let i in vars.audio.queue) {
                                                                            let snd = Bagel.get.asset.snd(vars.audio.queue[i], game);
                                                                            snd.play().then().catch(); // Play it
                                                                        }
                                                                        vars.audio.autoPlay = true;
                                                                        vars.audio.queue = []; // Clear the queue
                                                                        me.img = ".Internal.unmuteButton"; // Change to the unmuted image
                                                                    },
                                                                    pause: me => {
                                                                        let vars = me.vars.plugin.vars;
                                                                        for (let id in game.internal.assets.assets.snds) {
                                                                            let snd = game.internal.assets.assets.snds[id].snd;
                                                                            if (! snd.paused) {
                                                                                if (snd.loop || snd.duration >= 5) { // It's probably important instead of just a sound effect. Queue it
                                                                                    snd.pause();
                                                                                    vars.audio.queue.push(id);
                                                                                }
                                                                                else {
                                                                                    snd.stop();
                                                                                }
                                                                            }
                                                                        }
                                                                        vars.audio.autoPlay = false;
                                                                        me.img = ".Internal.unmuteButtonMuted"; // Change to the unmuted image
                                                                    }
                                                                },
                                                                main: [
                                                                    {
                                                                        code: (me, game, step) => {
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
                                                                        },
                                                                        stateToRun: game.state // Runs immediately. TODO: how can this keep running on state change?
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
                                                                appearAnimation: true
                                                            },
                                                            x: size,
                                                            y: game.height - size,
                                                            width: 1,
                                                            height: 1,
                                                        }, "plugin Internal, function \"game.playSound\""); // TODO: use the defaults to allow skipping of checking
                                                    }
                                                    plugin.vars.audio.queue.push(args.id);
                                                }
                                            });
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
                                    me.x += cached.cos * args.amount;
                                    me.y += cached.sin * args.amount;
                                }
                            }
                        },

                        layer: {
                            category: {
                                bringToFront: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas"
                                        ],
                                        obArg: false,
                                        args: {},
                                        fn: (sprite, args, game) => {
                                            if (game.game.sprites.length == 1) { // No other sprites, no need to do anything
                                                return;
                                            }
                                            let layers = game.internal.renderer.layers;
                                            let originalIndex = layers.indexOf(sprite.idIndex);

                                            if (layers[layers.length - 1] == sprite.idIndex) {
                                                return;
                                            }

                                            let oldSprite = layers[layers.length - 1];
                                            layers[layers.length - 1] = sprite.idIndex;
                                            layers[originalIndex] = null; // This can now be used by another sprite

                                            let i = layers.length - 2;
                                            while (i >= 0) {
                                                if (layers[i] == null) {
                                                    layers[i] = oldSprite;
                                                    return;
                                                }
                                                let oldSprite2 = layers[i];
                                                layers[i] = oldSprite;
                                                oldSprite = oldSprite2;
                                                i--;
                                            }
                                        }
                                    }
                                },
                                bringForwards: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "renderer"
                                        ],
                                        obArg: false,
                                        args: {},
                                        fn: (sprite, args, game) => {
                                            if (game.game.sprites.length == 1) { // No other sprites, no need to do anything
                                                return;
                                            }
                                            let layers = game.internal.renderer.layers;
                                            let originalIndex = layers.indexOf(sprite.idIndex);

                                            if (layers[layers.length - 1] == sprite.idIndex) { // Already rendered last
                                                return;
                                            }

                                            let oldSprite = layers[originalIndex + 1];
                                            layers[originalIndex + 1] = sprite.idIndex;
                                            layers[originalIndex] = oldSprite; // Swap them
                                        }
                                    }
                                },
                                sendToBack: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "renderer"
                                        ],
                                        obArg: false,
                                        args: {},
                                        fn: (sprite, args, game) => {
                                            if (game.game.sprites.length == 1) { // No other sprites, no need to do anything
                                                return;
                                            }
                                            let layers = game.internal.renderer.layers;
                                            let originalIndex = layers.indexOf(sprite.idIndex);

                                            if (layers[0] == sprite.idIndex) { // Already rendered first
                                                return;
                                            }

                                            let oldSprite = layers[0];
                                            layers[0] = sprite.idIndex;
                                            layers[originalIndex] = null; // This can now be used by another sprite

                                            let i = 1;
                                            while (i < layers.length) {
                                                if (layers[i] == null) {
                                                    layers[i] = oldSprite;
                                                    return;
                                                }
                                                let oldSprite2 = layers[i];
                                                layers[i] = oldSprite;
                                                oldSprite = oldSprite2;
                                                i++;
                                            }
                                        }
                                    }
                                },
                                sendBackwards: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas",
                                            "renderer"
                                        ],
                                        obArg: false,
                                        args: {},
                                        fn: (sprite, args, game) => {
                                            if (game.game.sprites.length == 1) { // No other sprites, no need to do anything
                                                return;
                                            }
                                            let layers = game.internal.renderer.layers;
                                            let originalIndex = layers.indexOf(sprite.idIndex);

                                            if (layers[0] == sprite.idIndex) { // Already rendered first
                                                return;
                                            }

                                            let oldSprite = layers[originalIndex - 1];
                                            layers[originalIndex - 1] = sprite.idIndex;
                                            layers[originalIndex] = oldSprite; // Swap them
                                        }
                                    }
                                }
                            }
                        },

                        touching: {
                            category: {
                                mouse: {
                                    appliesTo: [
                                        "sprite",
                                        "canvas"
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
                                                x: me.x - (me.width / 2),
                                                y: me.y - (me.height / 2),
                                                width: me.width,
                                                height: me.height
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
                                            inputs = game.input.touches;
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
                                },
                                mouseCircles: {
                                    appliesTo: [
                                        "sprite",
                                        "canvas"
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
                                            box.radius = Math.max(me.width, me.height) / 2;
                                        }
                                        else {
                                            box.radius = args.radius;
                                        }
                                        if (args.mode == "touching") { // Expand it slightly
                                            box.radius++;
                                        }

                                        let inputs;
                                        if (Bagel.device.is.touchscreen) {
                                            inputs = game.input.touches;
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
                                },
                                sprite: {
                                    appliesTo: [
                                        "sprite",
                                        "canvas"
                                    ],
                                    obArg: false,
                                    args: {
                                        sprite: {
                                            required: true,
                                            types: ["string"],
                                            description: "The ID of the sprite to check against for a collision."
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
                                                x: me.x - (me.width / 2),
                                                y: me.y - (me.height / 2),
                                                width: me.width,
                                                height: me.height
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
                                        if (args.options.includeClones) {
                                            sprites = [...sprites, ...parent.cloneIDs];
                                        }

                                        let passed = args.check == null;
                                        for (let i in sprites) {
                                            let sprite = sprites[i];
                                            if (! args.options.include.invisibles) {
                                                if (! sprite.visible) continue;
                                            }
                                            if (box.x < sprite.x + sprite.width) {
                                                if (box.x + box.width > sprite.x) {
                                                    if (box.y < sprite.y + sprite.height) {
                                                        if (box.y + box.height > sprite.y) {
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
                },
                scripts: {
                    init: [],
                    main: [],
                    steps: {}
                }
            },
            vars: {
                audio: {
                    autoPlay: true, // We probably don't have it but assume we do for now
                    queue: []
                }
            }
        },
        loadPlugin: (plugin, game, args) => {
            let subFunctions = Bagel.internal.subFunctions.loadPlugin;
            plugin = Bagel.internal.deepClone(plugin); // Create a copy of the plugin
            let current = Bagel.internal.current;
            Bagel.internal.saveCurrent();
            current.plugin = plugin;

            plugin = subFunctions.check(game, plugin);

            // Combine all the plugins into one plugin
            let merge = subFunctions.merge;
            merge.types.assets(game, plugin);
            merge.types.sprites(game, plugin);

            merge.methods(game, plugin);
            Bagel.internal.loadCurrent();
        },
        loadAsset: (asset, game, type, where, i) => {
            let current = Bagel.internal.current;

            Bagel.internal.saveCurrent();
            current.asset = asset;
            current.assetType = type;
            current.i = i;
            current.where = where;
            current.game = game;

            let assetLoader = game.internal.combinedPlugins.types.assets[type];
            let plugin = assetLoader.internal.plugin;
            current.plugin = plugin;

            let assets = game.internal.assets;

            if (assets.assets[type] == null) {
                assets.assets[type] = {};
            }

            Bagel.check({
                ob: asset,
                where: where,
                syntax: assetLoader.args
            }); // TODO
            let error = assetLoader.check(asset, game, Bagel.internal.check, Bagel.internal.standardChecks.asset, plugin, i);

            if (error) {
                Bagel.internal.loadCurrent();

                console.error(error);
                console.log("In plugin " + JSON.stringify(plugin.info.id) + ".");
                Bagel.internal.oops(game);
            }

            let ready = ((assetJSON, game) => (asset) => {
                let assets = game.internal.assets;
                assets.assets[type][assetJSON.id] = asset;
                assets.loaded++;
                assets.loading--;
                if (assets.loading == 0) {
                    game.loaded = true;
                }
            })(asset, game); // This is called by the init function once the asset has loaded
            let assetOb = assetLoader.init(asset, ready, game, assetLoader.internal.plugin, i);

            game.internal.assets.loading++;
            Bagel.internal.loadCurrent();
        },
        createSprite: (sprite, game, parent, where, noCheck, idIndex) => {
            let subFunctions = Bagel.internal.subFunctions.createSprite;
            sprite.type = sprite.type == null? game.internal.combinedPlugins.defaults.sprites.type : sprite.type; // If the sprite type isn't specified, default to default agreed by the plugins
            let handler = game.internal.combinedPlugins.types.sprites[sprite.type];

            let current = Bagel.internal.current;
            Bagel.internal.saveCurrent();
            current.sprite = sprite;
            current.game = game;
            current.plugin = handler.internal.plugin;

            // TODO: current.game is changed somewhere in here

            if (! noCheck) {
                sprite = subFunctions.check(sprite, game, parent, where);
            }
            sprite.internal = {
                scripts: {
                    init: [],
                    main: []
                }
            };

            let register = subFunctions.register;
            register.scripts("init", sprite, game, parent);
            register.scripts("main", sprite, game, parent);
            register.methods(sprite, game);
            register.listeners(sprite, game, parent);

            // TODO: Function for making all the very core stuff
            sprite.cloneIDs = [];
            sprite.cloneCount = 0;
            sprite.isClone = (!! parent);
            sprite.idIndex = idIndex;
            game.internal.idIndex[sprite.id] = idIndex;
            game.internal.renderer.layers.push(idIndex);

            sprite.debug = {
                renderTime: 0,
                scriptTime: 0,
                avg: {
                    renderTime: 0,
                    scriptTime: 0
                }
            };
            sprite.game = game;
            (me => {
                sprite.clone = clone => {
                    let parent = me;
                    let game = parent.game;
                    clone = clone? clone : {};

                    let cloneID = Bagel.internal.findCloneID(parent, game);
                    let spriteID;
                    if (clone.id == null) {
                        spriteID = parent.id + "#" + cloneID;
                        clone.id = spriteID;
                    }
                    else {
                        spriteID = clone.id;
                    }
                    parent.cloneIDs[cloneID] = spriteID;
                    parent.cloneCount++;

                    let spriteIndex = Bagel.internal.findSpriteID(game);
                    clone = Bagel.internal.createSprite(clone, game, parent, "the function \"sprite.clone\"", false, spriteIndex);

                    clone.cloneID = cloneID; // Declare it after creating it so it's not "useless"
                    clone.parent = parent; // Same here
                    game.game.sprites[spriteIndex] = clone;

                    Bagel.internal.current.sprite = clone;
                    for (let i in clone.scripts.init) {
                        clone.scripts.init[i](clone, game, Bagel.step);
                    }
                    Bagel.internal.current.sprite = parent;

                    return clone;
                };
                sprite.delete = () => {
                    // TODO: check if the required properties are present?
                    // TODO: make it work for non-clones
                    let game = me.game;
                    let remove = Bagel.internal.subFunctions.delete;

                    remove.layers(me, game);
                    remove.scripts("init", me, game);
                    remove.scripts("main", me, game);
                    remove.misc(me, game);
                };
            })(sprite);

            subFunctions.extraChecks(sprite, game, where, idIndex);
            subFunctions.init(sprite, game);

            Bagel.internal.loadCurrent();
            return sprite;
        },
        tick: () => {
            let subFunctions = Bagel.internal.subFunctions.tick;

            let totalStart = new Date();
            for (let i in Bagel.internal.games) {
                let game = Bagel.internal.games[i];
                Bagel.internal.current.game = game;

                subFunctions.scaleCanvas(game);
                if (game.loaded) {
                    subFunctions.loaded(game);
                }
                else {
                    // TODO: Loading logic
                }

                game.internal.FPSFrames++;
                let now = new Date();
                if (now - game.internal.lastFPSUpdate >= 1000) {
                    game.currentFPS = game.internal.FPSFrames;
                    game.internal.FPSFrames = 0;
                    game.internal.lastFPSUpdate = now;
                }
            }
            Bagel.internal.current.game = null;
            let total = new Date() - totalStart;
            subFunctions.tick();
        },

        subFunctions: {
            init: {
                check: game => {
                    if (typeof game != "object") {
                        console.error("Oh no! Your game JSON appears to be the wrong type. It must be the type \"object\", you used " + JSON.stringify(Bagel.internal.getTypeOf(game)) + ".");
                        Bagel.internal.oops(game);
                    }
                    if (game.id == null) {
                        console.error("Oh no! You forgot to specifiy an id for the game.");
                        Bagel.internal.oops(game);
                    }
                    if (document.getElementById(game.htmlElementID) == null && game.htmlElementID != null) { // Make sure the element exists
                        console.error("Oops, you specified the element to add the game canvas to but it doesn't seem to exist.\nThis is specified in \"GameJSON.htmlElementID\" and is set to " + JSON.stringify(game.htmlElementID) + ". You might want to check that the HTML that creates the element is before your JavaScript.");
                        Bagel.internal.oops(game);
                    }

                    game.internal = {
                        renderer: {
                            type: "canvas",
                            width: game.width,
                            height: game.height,
                            lastRender: new Date(),
                            layers: [],
                            renderers: {
                                high: [],
                                low: []
                            },
                            canvas: document.createElement("canvas"),
                            ratio: game.width / game.height
                        },
                        ids: [],
                        idIndex: {},
                        FPSFrames: 0,
                        lastFPSUpdate: new Date(),
                        loadedDelay: 0,
                        soundsToPlay: [],
                        scripts: {
                            index: {
                                init: {},
                                main: {},
                                sprites: {
                                    init: {},
                                    main: {}
                                }
                            }
                        },
                        assets: {
                            loading: 0,
                            loaded: 0,
                            assets: {}
                        },
                        combinedPlugins: { // Not all parts of the plugin are combined, only the ones where there mustn't be conflicts TODO: What does this mean?
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
                            }
                        }, // The plugins are combined as they're loaded
                        lastState: (! game.state)
                    };

                    game = Bagel.check({
                        ob: game,
                        where: "GameJSON",
                        syntax: {
                            id: {
                                required: true,
                                types: ["string"],
                                description: "An ID for the game canvas so it can be referenced later in the program."
                            },
                            width: {
                                required: false,
                                default: 800,
                                types: ["number"],
                                description: "The virtual width for the game. Independent from the rendered width."
                            },
                            height: {
                                required: false,
                                default: 450,
                                types: ["number"],
                                description: "The virtual height for the game. Independent from the rendered height."
                            },
                            game: {
                                required: false,
                                default: {},
                                types: ["object"],
                                description: "Where most of the properties are.",
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
                                        default: {
                                            init: [],
                                            main: []
                                        },
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
                                            }
                                        },
                                        types: ["object"],
                                        description: "The object that contains all the game scripts (\"init\" and \"main\") that aren't for a sprite."
                                    }
                                }
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
                                        check: (ob) => {
                                            if (! ["fill", "static"].includes(ob.mode)) {
                                                return "Oops! You used an invalid option in GameJSON.config.display.mode. You used " + ob.mode + ", it can only be either \"fill\" or \"static\".";
                                            }
                                            if (! ["auto", "canvas", "webgl"].includes(ob.renderer)) {
                                                return "Oops. You used an invalid option in GameJSON.config.display.renderer. You used " + ob.renderer + ", it can only be either \"auto\", \"canvas\" or \"webgl\".";
                                            }
                                        },
                                        checkEach: false,
                                        subcheck: {
                                            mode: {
                                                required: false,
                                                default: "fill",
                                                types: ["string"],
                                                description: "The display mode. e.g static (always the same size) or fill (fills the whole window)."
                                            },
                                            renderer: {
                                                required: false,
                                                default: "auto",
                                                types: ["string"],
                                                description: "The renderer for this game. Either \"auto\", \"canvas\" or \"webgl\". \"auto\" will use WebGL if it's supported by the browser, otherwise it'll use the basic 2d renderer (slower)."
                                            }
                                        },
                                        description: "Contains a few options for how the game is displayed."
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
                        }
                    }, {args: true});

                    if (Bagel.internal.games[game.id] != null) {
                        console.error("Oh no! You used an ID for your game that is already being used. Try and think of something else.\nYou used " + JSON.stringify(game.id) + " in \"GameJSON.htmlElementID\".");
                        Bagel.internal.oops(game);
                    }

                    return game;
                },
                inputs: (game, addEventListener) => {
                    game.input = {
                        touches: [],
                        mouse: {
                            down: false,
                            x: 0,
                            y: 0
                        },
                        keys: {
                            isDown: function(keyCode) {
                                if (this.internal.game.input.keys.keys[keyCode]) {
                                    return true;
                                }
                                return false;
                            },
                            keys: {},
                            internal: {
                                game: game
                            }
                        },
                        lookup: {
                            left: 37,
                            right: 39,
                            up: 38,
                            down: 40,
                            space: 32,
                            w: 87,
                            a: 65,
                            s: 83,
                            d: 68
                        }
                    };

                    (game => {
                        addEventListener("mousemove", ctx => {
                            let canvas = game.internal.renderer.canvas;
                            let rect = canvas.getBoundingClientRect();
                            let mouse = game.input.mouse;

                            mouse.x = ((ctx.clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                            mouse.y = ((ctx.clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;
                        }, false);
                        addEventListener("mousedown", ctx => {
                            Bagel.device.is.touchscreen = false;
                            game.input.mouse.down = true;
                        }, false);
                        addEventListener("mouseup", ctx => {
                            game.input.mouse.down = false;
                        }, false);
                        addEventListener("touchstart", ctx => {
                            Bagel.device.is.touchscreen = true;

                            let canvas = game.internal.renderer.canvas;
                            let rect = canvas.getBoundingClientRect();
                            let mouse = game.input.mouse;

                            if (ctx.touches == null) {
                                mouse.x = ((ctx.clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                                mouse.y = ((ctx.clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;
                                game.input.touches = [
                                    {
                                        x: game.input.mouse.x,
                                        y: game.input.mouse.y
                                    }
                                ];
                            }
                            else {
                                mouse.x = ((ctx.touches[0].clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                                mouse.y = ((ctx.touches[0].clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;

                                game.input.touches = [];
                                for (let i in context.touches) {
                                    game.input.touches.push({
                                        x: ((ctx.touches[i].clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width,
                                        y: ((ctx.touches[i].clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height
                                    });
                                }
                            }
                            Bagel.internal.autoplaySounds();

                            mouse.down = true;
                            context.preventDefault();
                        }, false);
                        addEventListener("touchmove", ctx => {
                            Bagel.device.is.touchscreen = true;

                            let canvas = game.internal.renderer.canvas;
                            let rect = canvas.getBoundingClientRect();
                            let mouse = game.input.mouse;

                            if (ctx.touches == null) {
                                mouse.x = ((ctx.clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                                mouse.y = ((ctx.clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;
                                game.input.touches = [
                                    {
                                        x: mouse.x,
                                        y: mouse.y
                                    }
                                ];
                            }
                            else {
                                mouse.x = ((ctx.touches[0].clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                                mouse.y = ((ctx.touches[0].clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;

                                game.input.touches = [];
                                for (let i in context.touches) {
                                    game.input.touches.push({
                                        x: ((ctx.touches[i].clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width,
                                        y: ((ctx.touches[i].clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height
                                    });
                                }
                            }

                            mouse.down = true;
                            context.preventDefault();
                        }, false);
                        addEventListener("touchend", (ctx) => {
                            Bagel.device.is.touchscreen = true;

                            game.input.touches = [];
                            Bagel.internal.autoplaySounds();

                            game.input.mouse.down = false;
                            context.preventDefault();
                        }, false);
                        document.addEventListener("keydown", (ctx) => {
                            for (let i in Bagel.internal.games) {
                                let game = Bagel.internal.games[i];
                                game.input.keys.keys[ctx.keyCode] = true;
                            }
                        }, false);
                        document.addEventListener("keyup", (ctx) => {
                            for (let i in Bagel.internal.games) {
                                let game = Bagel.internal.games[i];
                                game.input.keys.keys[ctx.keyCode] = false;
                            }
                        }, false);

                        document.addEventListener("readystatechange", () => {
                            if (document.readyState == "complete") { // Wait for the document to load
                                for (let i in Bagel.internal.games) {
                                    let game = Bagel.internal.games[i];
                                    if (game.htmlElementID == null) {
                                        if (document.body != null) {
                                            document.body.appendChild(game.internal.renderer.canvas);
                                        }
                                        else {
                                            document.appendChild(game.internal.renderer.canvas);
                                        }
                                    }
                                    else {
                                        document.getElementById(game.htmlElementID).appendChild(game.internal.renderer.canvas);
                                    }
                                }
                            }
                        });
                    })(game);
                },
                misc: game => {
                    game.loaded = false;
                    game.paused = false;
                    game.currentFPS = Bagel.config.fps;
                    game.currentRenderFPS = Bagel.config.fps;

                    let renderer = game.internal.renderer;
                    if (game.config.display.renderer == "auto") {
                        // This is just to test
                        let canvas = document.createElement("canvas");
                        let ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                        if (ctx == null) { // No webgl
                            game.config.display.renderer = "ctx";
                        }
                        else {
                            game.config.display.renderer = "webgl";
                        }
                    }
                    game.config.display.renderer = "ctx"; // TODO: tmp.
                    if (game.config.display.renderer == "webgl") {
                        renderer.ctx = renderer.canvas.getContext("webgl") || renderer.canvas.getContext("experimental-webgl");
                    }
                    else {
                        renderer.ctx = renderer.canvas.getContext("2d");
                    }
                    renderer.canvas.id = "Bagel.js " + game.id;

                    renderer.ctx.imageSmoothingEnabled = false;
                    renderer.canvas.width = game.width;
                    renderer.canvas.height = game.height;
                    if (game.config.display.mode == "fill") {
                        renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); position: absolute; top:0; bottom: 0; left: 0; right: 0; margin: auto;"; // CSS from Phaser (https://phaser.io)
                    }
                    else {
                        renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);" ; // CSS from Phaser (https://phaser.io)
                    }
                    Bagel.internal.subFunctions.tick.scaleCanvas(game);

                    (game => {
                        game.add = {
                            sprite: (sprite, where="the function Game.add.sprite") => {
                                let spriteIndex = Bagel.internal.findSpriteID(game);
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
                                            script.code(sprite, game, Bagel.step);
                                        }
                                    }
                                    Bagel.internal.loadCurrent();
                                }
                            },
                            asset: {}
                        };
                    })(game);
                },
                scripts: (game, type) => {
                    let scripts = game.game.scripts[type];
                    let index = game.internal.scripts.index[type];

                    for (let i in scripts) {
                        let script = scripts[i];
                        let state = script.stateToRun;

                        if (index[state] == null) index[state] = [];
                        index[state].push({
                            script: i
                        });
                    }
                },
                initScripts: game => {
                    let init = Bagel.internal.subFunctions.init.scripts;
                    init(game, "init");
                    init(game, "main");
                },
                plugins: game => {
                    for (let i in game.game.plugins) {
                        let plugin = game.game.plugins[i];
                        Bagel.internal.loadPlugin(plugin, game);
                    }
                },
                assets: game => {
                    let allAssets = game.game.assets;
                    for (let type in allAssets) {
                        let assets = allAssets[type];

                        for (let i in assets) {
                            let asset = assets[i];
                            Bagel.internal.loadAsset(asset, game, type, "GameJSON.game.assets." + type + " item " + i);
                        }
                    }
                },
                methods: game => {
                    console.log("A")
                    let methods = game.internal.combinedPlugins.methods.game;

                    for (let methodName in methods) {
                        let method = methods[methodName];
                        // TODO: categories

                        if (game.hasOwnProperty(methodName)) {
                            if (! method.overwrite) {
                                merge = false;
                                console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(method.internal.plugin.id) + " tried to overwrite the " + JSON.stringify(methodName) + " property in the game " + JSON.stringify(game.id) + " without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older type definition, add this to the function JSON: \"overwrite: true\".");
                                continue;
                            }
                        }

                        ((method, game) => {
                            if (method.obArg) {
                                game[methodName] = args => {
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
                                        syntax: method.args,
                                        where: "game " + game.id + "'s " + JSON.stringify(methodName) + " method"
                                    }, {args: true});
                                    let output = method.fn(game, args, current.plugin); // Passed the argument checks

                                    Bagel.internal.loadCurrent();
                                    return output;
                                };
                            }
                            else {
                                game[methodName] = (...args) => {
                                    let keys = Object.keys(method.args);
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
                                        syntax: method.args,
                                        where: "game " + game.id + "'s " + JSON.stringify(methodName) + " method"
                                    }, {args: true});
                                    let output = method.fn(game, newArgs, method.internal.plugin); // Passed the argument checks

                                    Bagel.internal.loadCurrent();
                                    return output;
                                };
                            }
                        })(method, game);
                    }
                }
            },
            loadPlugin: {
                check: (game, plugin) => {
                    let current = Bagel.internal.current;
                    Bagel.internal.saveCurrent();
                    current.plugin = plugin;
                    current.game = game;

                    plugin = Bagel.check({
                        ob: plugin,
                        syntax: {
                            info: {
                                required: true,
                                types: ["object"],
                                subcheck: {
                                    id: {
                                        required: true,
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
                                                    args: Bagel.internal.argsCheck,
                                                    description: {
                                                        required: true,
                                                        types: ["string"],
                                                        description: "The description of this asset type, make this short and clear to help people when they use the wrong syntax."
                                                    },
                                                    check: {
                                                        required: true,
                                                        types: ["function"],
                                                        description: [
                                                            "Your check function for this asset type. ",
                                                            "A good check function will avoid a standard JavaScript error when the user inputs something wrong (e.g a can't read property X of null error).",
                                                            "\nFortunately, Bagel.js helps you out in a few ways:\n",
                                                            "  You can use the check function provided (while the check function is being run) to easily check an object to make sure it has the desired properties as well as setting defaults. (works in the same way as the \"args\" argument.)\n",
                                                            "  You should also make use of the \"args\" argument as you can easily choose which data types you want to allow for each arguments as well as setting defaults and required arguments.\n",
                                                            "  \"standardChecks\" has, well... some standard checks. If you want to make sure an ID isn't used twice use \"standardChecks.id(<whichever argument is used for the id (defaults to \"id\")>)\". ",
                                                            "  You might also want to use the \"isInternal\" check with the arguments working the same as the previous but also having a second argument for the isInternal argument. This might be useful if you want to reserve some IDs for plugins as it'll block any IDs starting with a dot and without the asset having \"isInternal\" set to true.\n",
                                                            "  You probably want to use it like this:\n",
                                                            "    let error = standardChecks.id();\nif (error) return error;",
                                                            "  And if you find any problems with the user input, just use the return statement in the check function (e.g return \"Error\";) and Bagel.js will stop what it's doing, throw the error you specified and pause the game.\n",
                                                            "Some tips on making custom errors though:\n",
                                                            "  Always specifiy where the error is! Bagel.js will say which game it's in but, you know more than it about the error. You should specify which type they were making, the index of the problematic error and ideally how to fix it.\n",
                                                            "  Also, try to include information about the inputs the user provided. For example, if they used a duplicate ID, say what that ID was in the error itself.\n",
                                                            "  Lastly, be nice to the programmer. Treat them like a user. It's helpful to know that you can just put in something you know's wrong and get a helpful mini-tutorial.\n",
                                                            "\nOne more thing: the arguments for the function is structured like this:",
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
                                                            "(asset, ready, game, plugin, index) => {",
                                                            "    let img = new Image();",
                                                            "    img.onload = () => {",
                                                            "        ready({;",
                                                            "            img: img,",
                                                            "            JSON: asset",
                                                            "        });",
                                                            "    };",
                                                            "};"
                                                        ].join("\n")
                                                    },
                                                    get: {
                                                        required: true,
                                                        subcheck: {
                                                            name: {
                                                                required: true,
                                                                types: ["string"],
                                                                description: "The name of the function. Usually the singular version of the asset type. e.g: the type \"imgs\" would have the name \"img\" so the function would be \"Game.get.asset.img\". Defaults to the name of type."
                                                            },
                                                            handler: {
                                                                required: false,
                                                                default: (id, check, defaultFind, game, plugin, type) => defaultFind(id, check),
                                                                types: [
                                                                    "function",
                                                                    "undefined"
                                                                ],
                                                                description: "The handler function for the \"get\" method. Defaults to using defaultFind.\nThe function should return the asset specified by the arguments. Or an error in the form of a string."
                                                            }
                                                        },
                                                        types: ["object"],
                                                        description: [
                                                            "Contains the name of the function and the function that gets the asset. e.g {",
                                                            "    name: \"img\"",
                                                            "}"
                                                        ].join("\n")
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
                                                    args: { // TODO: Should this be checked?
                                                        required: true,
                                                        types: ["object"],
                                                        description: "Same as the \"syntax\" argument for the check function. These checks are only run on original sprites, not clones."
                                                    },
                                                    cloneArgs: {
                                                        required: true,
                                                        types: ["object"],
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
                                                                        check: (item, ob, index, game, prev) => {
                                                                            if (item == null) {
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
                                                                        types: ["function"],
                                                                        description: "The check function."
                                                                    },
                                                                    subcheck: {
                                                                        required: false,
                                                                        check: (item, ob, index, game, prev) => {
                                                                            if (item == null) {
                                                                                ob[index] = prev.prev.ob.args[prev.prevName].subcheck;
                                                                            }
                                                                        },
                                                                        types: ["object"],
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
                                                        arrayLike: true,
                                                        description: "Same as the \"syntax\" argument for the check function. These checks are only run on clones, not original sprites. Unspecified properties will mean that the property doesn't exist for clones."
                                                    },
                                                    listeners: {
                                                        required: false,
                                                        default: {},
                                                        subcheck: {
                                                            steps: { // TODO: How should these be checked?
                                                                required: false,
                                                                default: {},
                                                                types: ["object"],
                                                                description: "Short functions that do a task. Can be called from any of the other functions using \"Bagel.step(<step id>)\"."
                                                            },
                                                            fns: {
                                                                required: false,
                                                                default: {},
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
                                                                        description: "A function that's run after the property is changed. Can also be the name of a function defined in SpriteJSON.listeners.fns." // TODO: function arguments
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
                                                                        description: "A function that's run before the value is sent back to the code that requested it. Can also be the name of a function defined in SpriteJSON.listeners.fns." // TODO: arguments
                                                                    }
                                                                },
                                                                arrayLike: true,
                                                                types: ["object"],
                                                                description: "Contains the \"set\" and \"get\" listener functions."
                                                            }
                                                        },
                                                        types: ["object"],
                                                        description: "Functions that can run when certain conditions are met."
                                                    },
                                                    check: {
                                                        required: false,
                                                        default: null,
                                                        types: ["function"],
                                                        description: "A function that does extra checks. Use return <error message> in the function to create an error. These are the arguments given: sprite, game, check, index, where"
                                                    },
                                                    init: {
                                                        required: false,
                                                        default: null,
                                                        types: ["function"],
                                                        description: "Initialises the sprite. Is a function. Can be used to define attributes. These are the arguments given: sprite, game and plugin."
                                                    },
                                                    render: {
                                                        required: false,
                                                        default: {},
                                                        subcheck: {
                                                            ctx: {
                                                                required: false,
                                                                default: null,
                                                                types: ["function"],
                                                                description: "The ctx render function. Runs every frame."
                                                            },
                                                            webgl: {
                                                                required: false,
                                                                default: {},
                                                                subcheck: {
                                                                    shaders: {
                                                                        required: false,
                                                                        default: {},
                                                                        subcheck: {
                                                                            vertex: { // TODO: check?
                                                                                required: false,
                                                                                default: [],
                                                                                types: ["array"],
                                                                                description: "An array of vertex shaders to run from first to last."
                                                                            },
                                                                            fragment: { // TODO: check?
                                                                                required: false,
                                                                                default: [],
                                                                                types: ["array"],
                                                                                description: "An array of fragment shaders to run from first to last."
                                                                            }
                                                                        },
                                                                        types: ["object"],
                                                                        description: "Contains the \"vertex\" and \"fragment\" shaders."
                                                                    },
                                                                    render: {
                                                                        required: false,
                                                                        default: {},
                                                                        types: ["function"],
                                                                        description: "Does extra processing before the sprite is renderer." // TODO: arguments
                                                                    }
                                                                },
                                                                types: ["object"],
                                                                description: "The webgl renderer. Runs every frame. Contains \"shaders\" and an optional \"render\" function which allows for extra processing before the vertex and fragment shaders are run."
                                                            }
                                                        },
                                                        types: ["object"],
                                                        description: "The render functions for this sprite type. Ideally should have both a webgl renderer and a fallback ctx renderer."
                                                    }
                                                },
                                                types: ["object"],
                                                description: "Contains the new sprite types, the key is the name of type. (should be singular)"
                                            }
                                        },
                                        types: ["object"],
                                        description: "Creates new types. (assets, sprites)"
                                    },
                                    assets: { // TODO: check
                                        required: false,
                                        default: {},
                                        types: ["object"],
                                        description: "Which assets to load for the plugin."
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
                                                    args: { // TODO: check?
                                                        required: true,
                                                        types: ["object"],
                                                        description: "The syntax for the arguments. These is always an object, even if you set \"obArg\" to false."
                                                    },
                                                    fn: {
                                                        required: true,
                                                        types: ["function"],
                                                        description: "The method itself. The arguments are the arguments (an object) and the plugin."
                                                    },
                                                    obArg: {
                                                        required: true,
                                                        types: ["boolean"],
                                                        description: "If the arguments should be inputted as an object or should use a normal function input. You probably only want to use the 2nd one if there aren't many arguments."
                                                    },
                                                    category: {
                                                        required: false,
                                                        default: "",
                                                        types: ["string"],
                                                        description: "If specified, an object will be created in \"Bagel\" and this method will be in this object. This is good for grouping functions. You can also chain multiple categories by separating them with a dot."
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
                                                    args: { // TODO: check?
                                                        required: true,
                                                        types: ["object"],
                                                        description: "The syntax for the arguments. These is always an object, even if you set \"obArg\" to false."
                                                    },
                                                    fn: {
                                                        required: true,
                                                        types: ["function"],
                                                        description: "The method itself. The arguments are the game, the arguments (an object) and the plugin."
                                                    },
                                                    obArg: {
                                                        required: true,
                                                        types: ["boolean"],
                                                        description: "If the arguments should be inputted as an object or should use a normal function input. You probably only want to use the 2nd one if there aren't many arguments."
                                                    },
                                                    category: {
                                                        required: false,
                                                        default: "",
                                                        types: ["string"],
                                                        description: "If specified, an object will be created in the game and this method will be in this object. This is good for grouping functions. You can also chain multiple categories by separating them with a dot."
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
                                                    appliesTo: {
                                                        required: true,
                                                        types: ["array"],
                                                        description: "The sprite types that this method is added to."
                                                    },
                                                    args: { // TODO: check?
                                                        required: true,
                                                        types: ["object"],
                                                        description: "The syntax for the arguments. These is always an object, even if you set \"obArg\" to false."
                                                    },
                                                    fn: {
                                                        required: true,
                                                        types: ["function"],
                                                        description: "The method itself. The arguments are the sprite, the arguments (an object), the game and the plugin."
                                                    },
                                                    obArg: {
                                                        required: true,
                                                        types: ["boolean"],
                                                        description: "If the arguments should be inputted as an object or should use a normal function input. You probably only want to use the 2nd one if there aren't many arguments."
                                                    },
                                                    category: {
                                                        required: false,
                                                        default: "",
                                                        types: ["string"],
                                                        description: "If specified, an object will be created in the sprites that this method applies to and this method will be in this object. This is good for grouping functions. You can also chain multiple categories by separating them with a dot."
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
                                                default: [],
                                                check: fn => {
                                                    if (typeof fn != "function") {
                                                        return "Hmm. Looks like you used the wrong type, it should be a function and you used " + Bagel.internal.an(Bagel.internal.getTypeOf(fn) + ".");
                                                    }
                                                },
                                                checkEach: true,
                                                types: ["array"],
                                                description: "Preload functions. They run before the plugin is checked or initialised."
                                            },
                                            init: {
                                                required: false,
                                                default: [],
                                                check: fn => {
                                                    if (typeof fn != "function") {
                                                        return ":/ Looks like you used the wrong type, it should be a function and you used " + Bagel.internal.an(Bagel.internal.getTypeOf(fn) + ".");
                                                    }
                                                },
                                                checkEach: true,
                                                types: ["array"],
                                                description: "Init functions. They run once the plugin's been checked and mostly initialised. This function finishes it by doing stuff specific to this plugin."
                                            },
                                            main: {
                                                required: false,
                                                default: [],
                                                check: fn => {
                                                    if (typeof fn != "function") {
                                                        return "Hmm, looks like you used the wrong type, it should be a function and you used " + Bagel.internal.an(Bagel.internal.getTypeOf(fn) + ".");
                                                    }
                                                },
                                                checkEach: true,
                                                types: ["array"],
                                                description: "Main functions. They run on every frame before the rendering."
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
                                                description: "Mini functions. They can help make your code clearer by spitting functions into the individual steps. Can use them with \"Bagel.step\" or the step function provided with the script."
                                            }
                                        },
                                        types: ["object"],
                                        description: "Contains the plugin's scripts. \"preload\", \"init\" and \"main\". Steps can also be used."
                                    },
                                    sprites: { // TODO: check
                                        required: false,
                                        default: [],
                                        subcheck: {}, // TODO
                                        types: ["array"],
                                        description: "Contains the plugin's sprites. Works the same way as Game.game.sprites. These will be created in every game where the plugin's active."
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
                            }
                        },
                        where: "plugin " + plugin.info.id
                    }, {args: true});

                    Bagel.internal.loadCurrent();
                    return plugin;
                },
                merge: {
                    bagelCategoryMethods: (handler, position, prev, i, calls) => {
                        if (Array.isArray(handler)) { // TODO!
                            for (let c in handler) {
                                if (position[c] == null) position[c] = {};
                                Bagel.internal.subFunctions.loadPlugin.merge.bagelCategoryMethods(handler[c], position[c], handler, c, calls + 1);
                            }
                        }
                        else {
                            // TODO: Can functions overwrite values?
                            let merge = false;
                            if (position[i] == null) {
                                merge = true;
                            }
                            else {
                                if (method.overwrite) {
                                    merge = true;
                                }
                                else {
                                    console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.id) + " tried to overwrite the " + JSON.stringify(i) + " bagel method without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older method, add this to the method JSON: \"overwrite: true\".");
                                }
                            }
                            if (merge) {
                                ((method, position, methodName) => {
                                    if (method.obArg) {
                                        position[methodName] = args => {
                                            if (args == null) args = {};
                                            if (Bagel.internal.getTypeOf(args) != "object") {
                                                console.error("Huh, looks like you used " + Bagel.internal.an(Bagel.internal.getTypeOf(args)) + " instead of an object.");
                                                Bagel.internal.oops(game);
                                            }

                                            args = Bagel.check({
                                                ob: args,
                                                syntax: method.args,
                                                where: "the sprite " + sprite.id + "'s " + JSON.stringify(methodName) + " method"
                                            }, {args: true});
                                            // Passed the argument checks

                                            let current = Bagel.internal.current;
                                            Bagel.internal.saveCurrent();
                                            current.plugin = method.internal.plugin;

                                            let output = method.fn(args, current.plugin);

                                            Bagel.internal.loadCurrent();
                                            return output;
                                        };
                                    }
                                    else {
                                        position[methodName] = (...args) => {
                                            let keys = Object.keys(method.args);
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
                                                syntax: method.args,
                                                where: "the sprite " + sprite.id + "'s " + JSON.stringify(methodName) + " method"
                                            }, {args: true});
                                            // Passed the argument checks

                                            let current = Bagel.internal.current;
                                            Bagel.internal.saveCurrent();
                                            current.sprite = sprite;
                                            current.game = game;
                                            current.plugin = method.internal.plugin;
                                            let output = method.fn(newArgs, current.plugin);

                                            Bagel.internal.loadCurrent();
                                            return output;
                                        };
                                    }
                                })(handler, position, i);
                            }
                        }
                    },
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
                                        console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.id) + " tried to overwrite the " + JSON.stringify(newType) + " asset type without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older type definition, add this to the new type JSON: \"overwrite: true\".");
                                    }
                                }
                                else {
                                    merge = true;
                                }
                                if (merge) {
                                    combined.types.assets[newType] = typeJSON;
                                    combined.types.assets[newType].internal = {
                                        plugin: plugin
                                    };
                                    combined.types.internal.pluralAssetTypes[typeJSON.get.name] = newType;

                                    let defaultFind = Bagel.internal.defaultFind;
                                    // Define the getter function. The function wrapping is so some data can be saved to the function that isn't shared between all of the functions
                                    ((newType, typeJSON, boundGame, plugin) => {
                                        Bagel.get.asset[typeJSON.get.name] = (id, game, check) => {
                                            let current = Bagel.internal.current;

                                            Bagel.internal.saveCurrent();

                                            current.assetType = newType;
                                            current.assetTypeName = typeJSON.get.name;
                                            current.game = game == null? current.game : game;
                                            current.plugin = plugin;

                                            let output = typeJSON.get.handler(
                                                id,
                                                check,
                                                defaultFind,
                                                current.game,
                                                plugin,
                                                newType
                                            );

                                            if (typeof output == "string") { // Error
                                                console.error(output);
                                                Bagel.internal.oops(current.game);
                                            }
                                            Bagel.internal.loadCurrent();
                                            return output;
                                        };
                                        boundGame.add.asset[typeJSON.get.name] = (asset, where) => {
                                            let plural = game.internal.combinedPlugins.types.internal.pluralAssetTypes[typeJSON.get.name];
                                            Bagel.internal.loadAsset(asset, boundGame, plural, where);
                                        };
                                    })(newType, typeJSON, game, plugin);
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
                                        console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.id) + " tried to overwrite the " + JSON.stringify(newType) + " sprite type without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older type definition, add this to the new type JSON: \"overwrite: true\".");
                                    }
                                }
                                else {
                                    merge = true;
                                }
                                if (merge) {
                                    let syntax = {};
                                    for (i in typeJSON.cloneArgs) {
                                        syntax[i] = typeJSON.cloneArgs[i].syntax;
                                    }
                                    typeJSON.internal = {
                                        plugin: plugin,
                                        cloneSyntax: syntax
                                    };
                                    combined.types.sprites[newType] = typeJSON;
                                }
                            }
                        }
                    },
                    methods: (game, plugin) => {
                        let combined = game.internal.combinedPlugins;

                        let types = ["game", "sprite"];
                        for (let i in types) {
                            let type = types[i];
                            let methods = plugin.plugin.methods[type];

                            for (let methodName in methods) {
                                let method = methods[methodName];
                                let appliesTo = type == "sprite"? method.appliesTo : [null]; // Only needed for sprites
                                for (let i in appliesTo) {
                                    let spriteType = appliesTo[i];
                                    let merge = false;

                                    let position;
                                    if (spriteType) {
                                        if (combined.methods[type][spriteType] == null) combined.methods[type][spriteType] = {};
                                        position = combined.methods[type][spriteType];
                                    }
                                    else {
                                        position = combined.methods[type];
                                    }
                                    let categories = "";
                                    if (method.category != "") {
                                        categories = method.category.split(".").reverse();
                                        for (i in categories) {
                                            let category = categories[i];
                                            if (position[category] == null) {
                                                position[category] = {};
                                            }
                                            position = position[category];
                                        }
                                    }

                                    if (position[methodName] == null) {
                                        merge = true;
                                    }
                                    else {
                                        if (method.overwrite) {
                                            merge = true;
                                        }
                                        else {
                                            if (spriteType) {
                                                console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.id) + " tried to overwrite the " + JSON.stringify(methodName) + " method for the " + spriteType + " type without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older method, add this to the method JSON: \"overwrite: true\".");
                                            }
                                            else {
                                                console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.id) + " tried to overwrite the " + JSON.stringify(methodName) + " " + type + " method without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older method, add this to the method JSON: \"overwrite: true\".");
                                            }
                                        }
                                    }

                                    if (merge) {
                                        // TODO: What locals are needed?
                                        method.internal = {
                                            plugin: plugin,
                                            categories: categories
                                        };
                                        position[methodName] = method;
                                    }
                                }
                            }
                        }
                        let handler = game.internal.combinedPlugins.methods.bagel;
                        if (handler) {
                            for (let i in handler) {
                                Bagel.internal.subFunctions.loadPlugin.merge.bagelCategoryMethods(handler[i], Bagel, handler, i, 0);
                            }
                        }
                    }
                }
            },
            createSprite: {
                check: (sprite, game, parent, where) => {
                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];


                    if (parent) { // Clone
                        // TODO: is this any faster?
                        sprite.type = parent.type; // Their types must be the same
                        sprite = Bagel.check({
                            ob: sprite,
                            where: where,
                            syntax: handler.internal.cloneSyntax
                        }, {
                            args: true,
                            missing: true, // Missing arguments don't matter, they're dealt with in a minute
                            useless: true // "type" isn't included in the syntax
                        }); // Check any existing properties supplied by the clone function

                        let clone = Bagel.internal.deepClone;
                        // Assign the parent's properties to the clone
                        for (let i in handler.cloneArgs) { // TODO: make sure .clones has already been checked
                            let argJSON = handler.cloneArgs[i];

                            if (argJSON.mode == "replace") {
                                if (! sprite.hasOwnProperty(i)) {
                                    if (parent.clones.hasOwnProperty(i)) {
                                        sprite[i] = clone(parent.clones[i]);
                                    }
                                    else {
                                        sprite[i] = clone(parent[i]);
                                    }
                                }
                            }
                            else if (argJSON.mode == "merge") {
                                if (! (parent.hasOwnProperty(i) || parent.clones.hasOwnProperty(i) || sprite.hasOwnProperty(i))) {
                                    sprite[i] = argJSON.syntax.default; // No values specified. Default to the default
                                    continue;
                                }

                                sprite[i] = Object.assign(clone(parent[i]), clone(parent.clones[i]), clone(sprite[i]));
                            }
                            else if (argJSON.mode == "ignore") { // Ignore the parent's properties
                                if (! sprite.hasOwnProperty(i)) {
                                    if (! parent.clones.hasOwnProperty(i)) {
                                        sprite[i] = argJSON.syntax.default;
                                    }
                                    else {
                                        sprite[i] = clone(parent.clones[i]);
                                    }
                                }
                            }
                        }
                        return sprite;
                    }
                    // TODO: run the other checks
                    let current = Bagel.internal.current;

                    const typeSyntax = {
                        type: {
                            required: true,
                            types: ["string"],
                            description: "The type of sprite."
                        }
                    };
                    sprite = Bagel.check({
                        ob: sprite,
                        where: where,
                        syntax: {
                            ...(parent? handler.internal.cloneSyntax : handler.args),
                            ...typeSyntax
                        }
                    }, {args: true});


                    return sprite;
                },
                extraChecks: (sprite, game, where, idIndex) => {
                    let current = Bagel.internal.current;

                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];
                    let error = handler.check(sprite, game, Bagel.check, current.plugin, idIndex, where);
                    if (error) {
                        console.error(error);
                        console.log("In " + where);
                        Bagel.internal.oops(game);
                    }
                },
                init: (sprite, game) => {
                    let current = Bagel.internal.current;

                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];
                    handler.init(sprite, game, current.plugin);
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
                                state = scripts[i].stateToRun;
                            }

                            if (index[state] == null) index[state] = [];

                            index[state].push({
                                script: i,
                                sprite: sprite,
                                isClone: sprite.isClone
                            });
                            sprite.internal.scripts[type].push({
                                id: index[state].length - 1,
                                state: state
                            });
                        }
                    },
                    methodsCategory: (handler, sprite, position, game, i) => {
                        if (handler.internal) {
                            // TODO: Can functions overwrite values?

                            ((handler, sprite, game, position, methodName) => {
                                if (handler.obArg) {
                                    position[methodName] = args => {
                                        if (args == null) args = {};
                                        if (Bagel.internal.getTypeOf(args) != "object") {
                                            console.error("Huh, looks like you used " + Bagel.internal.an(Bagel.internal.getTypeOf(args)) + " instead of an object.");
                                            Bagel.internal.oops(game);
                                        }

                                        args = Bagel.check({
                                            ob: args,
                                            syntax: handler.args,
                                            where: "the sprite " + sprite.id + "'s " + JSON.stringify(methodName) + " method"
                                        }, {args: true});
                                        // Passed the argument checks

                                        let current = Bagel.internal.current;
                                        Bagel.internal.saveCurrent();
                                        current.sprite = sprite;
                                        current.game = game;
                                        current.plugin = handler.internal.plugin;

                                        let output = handler.fn(sprite, args, game, current.plugin);

                                        Bagel.internal.loadCurrent();
                                        return output;
                                    };
                                }
                                else {
                                    position[methodName] = (...args) => {
                                        let keys = Object.keys(handler.args);
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
                                            syntax: handler.args,
                                            where: "the sprite " + sprite.id + "'s " + JSON.stringify(methodName) + " method"
                                        }, {args: true});
                                        // Passed the argument checks

                                        let current = Bagel.internal.current;
                                        Bagel.internal.saveCurrent();
                                        current.sprite = sprite;
                                        current.game = game;
                                        current.plugin = handler.internal.plugin;
                                        let output = handler.fn(sprite, newArgs, game, current.plugin);

                                        Bagel.internal.loadCurrent();
                                        return output;
                                    };
                                }
                            })(handler, sprite, game, position, i);
                        }
                        else {
                            if (position[i] == null) position[i] = {};
                            for (let c in handler) {
                                Bagel.internal.subFunctions.createSprite.register.methodsCategory(handler[c], sprite, position[i], game, c);
                            }
                        }
                    },
                    methods: (sprite, game) => {
                        let handler = game.internal.combinedPlugins.methods.sprite[sprite.type];
                        if (handler == null) return;
                        for (let i in handler) {
                            Bagel.internal.subFunctions.createSprite.register.methodsCategory(handler[i], sprite, sprite, game, i);
                        }
                    },
                    listeners: (sprite, game, parent) => {
                        let spriteHandler = game.internal.combinedPlugins.types.sprites[sprite.type];
                        let listeners = spriteHandler.listeners;

                        sprite.internal.properties = {};

                        // TODO: What about objects and arrays?

                        for (let property in listeners.property) {
                            let handlers = listeners.property[property];

                            sprite.internal.properties[property] = sprite[property];
                            ((sprite, property, game, plugin, handlers) => {
                                Object.defineProperty(sprite, property, {
                                    get: () => {
                                        if (handlers.get != null) {
                                            let current = Bagel.internal.current;
                                            Bagel.internal.saveCurrent();
                                            current.sprite = sprite;
                                            current.game = game;
                                            current.plugin = plugin;

                                            let error = handlers.get(sprite.internal.properties, property, game, plugin, sprite);

                                            if (error) {
                                                console.error(error);
                                                Bagel.internal.oops(game);
                                            }
                                            Bagel.internal.loadCurrent();
                                        }
                                        return sprite.internal.properties[property];
                                    },
                                    set: (value) => {
                                        sprite.internal.properties[property] = value;
                                        if (handlers.set != null) {
                                            let current = Bagel.internal.current;
                                            Bagel.internal.saveCurrent();
                                            current.sprite = sprite;
                                            current.game = game;
                                            current.plugin = plugin;

                                            let error = handlers.set(sprite.internal.properties, value, property, game, plugin, sprite);

                                            if (error) {
                                                console.error(error);
                                                Bagel.internal.oops(game);
                                            }
                                            Bagel.internal.loadCurrent();
                                        }
                                    }
                                });
                            })(sprite, property, game, spriteHandler.internal.plugin, handlers);
                        }
                    }
                }
            },
            tick: {
                scripts: (type, sprites, game) => { // TODO: does this work with non-sprite scripts?
                    let scripts;
                    if (sprites) {
                        scripts = game.internal.scripts.index.sprites[type][game.state];
                    }
                    else {
                        scripts = game.internal.scripts.index[type][game.state];
                    }
                    if (scripts == null) { // No scripts
                        return;
                    }
                    for (let i in scripts) {
                        let scriptInfo = scripts[i];
                        if (scriptInfo == null) continue;

                        if (sprites) {
                            let sprite = scriptInfo.sprite;
                            Bagel.internal.current.sprite = sprite;
                            let script = sprite.scripts[type][scriptInfo.script];

                            if (sprite.isClone) {
                                script(sprite, game, Bagel.step);
                            }
                            else {
                                script.code(sprite, game, Bagel.step);
                            }
                        }
                        else {
                            let code = game.game.scripts[type][scriptInfo.script].code;
                            code(game, Bagel.step);
                        }
                    }
                },
                render: {
                    ctx: game => {
                        let renderer = game.internal.renderer;
                        let canvas = renderer.canvas;
                        let ctx = renderer.ctx;

                        let scaleX = canvas.width / game.width;
                        let scaleY = canvas.height / game.height;

                        let layers = renderer.layers;
                        let handlers = game.internal.combinedPlugins.types.sprites;

                        ctx.fillStyle = "white";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        for (let spriteIndex in layers) {
                            let sprite = game.game.sprites[layers[spriteIndex]];
                            let handler = handlers[sprite.type];

                            if (sprite.visible) {
                                if (handler.render != null) {
                                    handler.render.ctx(
                                        sprite,
                                        ctx,
                                        canvas,
                                        game,
                                        handler.internal.plugin,
                                        scaleX,
                                        scaleY
                                    );
                                }
                            }
                        }
                    },
                    webgl: game => {
                        // TODO
                    }
                },
                loaded: game => { // Loaded logic
                    let subFunctions = Bagel.internal.subFunctions.tick;

                    if (! game.paused) {
                        if (game.state != game.internal.lastState) {
                            // TODO: delete clones
                            subFunctions.scripts("init", true, game);
                            subFunctions.scripts("init", false, game);
                            game.internal.lastState = game.state;
                        }

                        subFunctions.scripts("main", true, game);
                        subFunctions.scripts("main", false, game);
                        subFunctions.render[game.config.display.renderer](game);
                        // TODO: prevent changing in runtime?
                    }
                },
                tick: () => {
                    Bagel.internal.requestAnimationFrame.call(window, Bagel.internal.tick);
                },
                scaleCanvas: (game) => {
                    let width = window.innerWidth;
                    let height = window.innerHeight;
                    let ratio = game.internal.renderer.ratio;
                    let wHeight = width / ratio;
                    if (height > wHeight) {
                        height = wHeight;
                    }
                    else {
                        if (height != wHeight) { // TODO: test
                            width = height * ratio;
                        }
                    }
                    width *= window.devicePixelRatio;
                    height *= window.devicePixelRatio;


                    let renderer = game.internal.renderer;
                    let canvas = renderer.canvas;
                    if (canvas.width != width || canvas.height != height) {
                        canvas.width = width;
                        canvas.height = height;

                        canvas.style.removeProperty("width");
                        canvas.style.setProperty("width", (width / window.devicePixelRatio) + "px", "important");
                        canvas.style.removeProperty("height");
                        canvas.style.setProperty("height", (height / window.devicePixelRatio) + "px", "important");

                        renderer.ctx.imageSmoothingEnabled = false; // It's reset when the canvas is resized
                    }
                },
            },
            delete: {
                layers: (me, game) => {
                    let renderer = game.internal.renderer;
                    let layerIndex = renderer.layers.indexOf(me.idIndex);
                    renderer.layers = renderer.layers.filter((item, index) => index != layerIndex);
                },
                scripts: (type, me, game) => {
                    let scriptIndex = game.internal.scripts.index.sprites[type];
                    let scripts = me.internal.scripts[type];
                    for (let i in scripts) {
                        let script = scripts[i];
                        scriptIndex[script.state][script.id] = null; // Mark them as null so we know which ones to remove in a minute
                    }

                    // Remove the nulls
                    for (i in scriptIndex) {
                        let removed = 0;
                        let newScripts = [];
                        for (let c in scriptIndex[i]) {
                            let script = scriptIndex[i][c];
                            if (script == null) { // This will be removed
                                removed++;
                            }
                            else {
                                script.sprite.internal.scripts[type][script.script].id -= removed; // The id will have changed for anything after a deleted script
                                newScripts.push(script); // If it's not null, it can stay
                            }
                        }
                        scriptIndex[i] = newScripts;
                    }
                },
                misc: (me, game) => {
                    game.game.sprites[me.idIndex] = null;
                    game.internal.idIndex[me.id] = null;
                    if (me.isClone) {
                        me.parent.cloneCount--;
                        me.parent.cloneIDs[me.parent.cloneIDs.indexOf(me.id)] = null;
                    }
                }
            }
        },

        standardChecks: {
            asset: {
                id: (id) => {
                    let game = Bagel.internal.current.game;
                    let asset = Bagel.internal.current.asset;
                    let type = Bagel.internal.current.assetType;
                    id = id == null? "id" : id;

                    if (game.internal.assets.assets[type][asset[id]] != null) {
                        return "Oh no! You used an ID for an asset that's already being used. Maybe try something else.\nYou used "
                        + JSON.stringify(game.game.assets[type][i][id])
                        + " in GameJSON.game.assets." + type + " item " + index + ".";
                    }
                },
                isInternal: (isInternal, id) => {
                    let current = Bagel.internal.current;
                    let asset = current.asset;
                    let type = current.assetType;
                    let where = current.where;
                    let pluginID = current.plugin == null? null : current.plugin.info.id;
                    id = id == null? "id" : id;
                    isInternal = isInternal == null? "isInternal" : isInternal;

                    if (asset[id][0] == ".") { // Reserved
                        if (pluginID == null) {
                            return "This is awkward... IDs starting with a dot are only for plugins. In "
                            + where
                            + ".\nIf it's important that it has this name, you could write a plugin instead ;)";
                        }
                        else {
                            if (asset[id].split(".")[1] != pluginID) { // Plugins are allowed to use ids starting with a dot and then their id
                                return "Erm... the only reserved prefix you can use in this plugin is " + JSON.stringify("." + pluginID) + " and you tried to use the ID " + JSON.stringify(asset[id]) + ". In "
                                + where
                                + ".\nYou can fix this by changing the prefix, removing it or changing the plugin ID in \"Plugin.info.id\".";
                            }
                        }
                    }
                }
            }
        },
        argsCheck: {
            required: true,
            types: ["object"],
            description: [
                "The required and optional arguments for the sprite. Is an object where the key is the argument name. e.g {",
                "    x: {",
                "        required: false,",
                "        default: \"centred\",",
                "        types: [",
                "            \"number\",",
                "            \"string\",",
                "            \"function\",",
                "        ],",
                "        description: \"The X position for the sprite to start at. Can also be set to \"centred\" to centre it along the X axis, or set to a function that returns a position when the game loads. e.g:\n(game, me) => game.width - 50\"",
                "    }",
                "}"
            ].join("\n")
        },
        defaultFind: (id, check) => {
            if (id == null) {
                return "Huh, looks like you forgot the \"id\" argument for the \"defaultFind\" function.";
            }
            let current = Bagel.internal.current;
            let assets = current.game.internal.assets.assets[current.assetType];

            if (assets[id] == null) { // Invalid id
                if (check) return false;
                return "Oops. That asset doesn't exist. You tried to get the asset with the id " + JSON.stringify(id) + ".";
            }
            return assets[id][current.assetTypeName];
        },

        th: (num) => (num + 1) + ((num > 8 && num < 20)? "th" : ["st", "nd", "rd", "th", "th", "th", "th", "th", "th"][parseInt(num.toString()[num.toString().length - 1])]),
        an: (str) => ["a", "e", "i", "o", "u"].includes(str[0].toLowerCase())? "an " + str : "a " + str,
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
        getTypeOf: (entity) => {
            if (Array.isArray(entity)) {
                return "array";
            }
            if (entity == null) {
                return "undefined";
            }
            return typeof entity;
        },
        deepClone: (entity) => {
            if (typeof entity != "object" || entity == null) { // Includes arrays
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
                if (typeof entity[keys[i]] == "object") {
                    newEntity[keys[i]] = Bagel.internal.deepClone(entity[keys[i]]);
                }
                else {
                    newEntity[keys[i]] = entity[keys[i]];
                }
                i++;
            }
            return newEntity;
        },

        findCloneID: (sprite, game) => {
            for (let i in sprite.cloneIDs) {
                if (sprite.cloneIDs[i] == null) {
                    return i;
                }
            }
            return sprite.cloneIDs.length;
        },
        findSpriteID: game => {
            for (let i in game.game.sprites) {
                if (game.game.sprites[i] == null) {
                    return parseInt(i);
                }
            }
            return game.game.sprites.length;
        },

        hex: (num) => {
            if (num.toString().length == 1) {
                return "0" + num.toString(16);
            }
            return num.toString(16);
        }, // TODO: move to plugin

        oops: (game) => { // When something goes wrong
            if (game == null) {
                throw "Critical Bagel.js error, please look at the error above for more info. ^-^";
            }
            game.paused = true;
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
            plugin: null
        },
        saveCurrent: () => {
            let internal = Bagel.internal;
            internal.currentStack.push({...internal.current}); // Add current values to the stack
        },
        loadCurrent: () => {
            let internal = Bagel.internal;
            internal.current = internal.currentStack.pop(); // Load the last state
        },
        currentStack: [],

        requestAnimationFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
        debug: {
            add: message => {
                Bagel.internal.debug.queue.push(message);
            },
            warn: message => Bagel.internal.debug.add(["warning", message]),
            log: message => Bagel.internal.debug.add(["log", message]),
            send: () => {
                let queue = Bagel.internal.debug.queue;
                if (queue.length == 0) {
                    return;
                }
                let log = Bagel.internal.debug.logList;
                let stringQueue = JSON.stringify(queue);

                if (! log.includes(stringQueue)) {
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
            },
            queue: [],
            logList: []
        },
        games: {},
    },
    // == Methods ==

    check: (args, disableChecks, where, logObject) => {
        // TODO: is where needed?
        if (! disableChecks) disableChecks = {};
        if (! (args.prev || disableChecks.args)) { // TODO: allow subcheck, check etc. arguments?
            args = Bagel.check({
                ob: args,
                where: where? where : "the check function. (Bagel.check)",
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
                        default: Bagel.internal.current.game,
                        types: ["object"],
                        description: "The game object. Optional if this is being run in a script."
                    }
                }
            }, {
                args: true
            }, null, true);
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
        for (let argID in combined) {
            let syntax = args.syntax[argID];
            let arg = args.ob[argID];

            if (syntax == null) {
                if (! disableChecks.useless) {
                    useless.push(argID);
                }
                continue;
            }
            if (syntax == "ignore") { // TODO: is this used? Is it needed?
                continue;
            }

            let defaulted = false;
            if (! args.ob.hasOwnProperty(argID)) {
                if (syntax.required) {
                    missing.push(argID);
                }
                else {
                    args.ob[argID] = syntax.default;
                    arg = args.ob[argID];
                    defaulted = true;
                }
            }
            if (! disableChecks.types) {
                if ((! defaulted) && missing.length == 0) {
                    if (syntax.types == null) {
                        console.error("The syntax for " + args.where + "." + argID + " is missing the \"types\" argument.");
                        console.log("In " + args.where + ".");
                        console.log("Object:");
                        console.log(args.ob);
                        Bagel.internal.oops(args.game);
                    }
                    if (! arrayString.includes(Bagel.internal.getTypeOf(syntax.types))) {
                        console.error("The syntax for " + args.where + "." + argID + " has the wrong data type for the \"types\" argument. You used " + Bagel.internal.an(Bagel.internal.getTypeOf(syntax.types)) + ".");
                        console.log("In " + args.where + ".");
                        console.log("Object:");
                        console.log(args.ob);
                        Bagel.internal.oops(args.game);
                    }
                    if ((! syntax.types.includes(Bagel.internal.getTypeOf(arg))) && syntax.types != "any") {
                        wrongTypes.push(argID);
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
        }

        if (useless.length + wrongTypes.length != 0) {
            output.warn(
                "FYI, these are the arguments:\n"
                + Object.keys(args.syntax).map(name =>
                    "  • "
                    + (args.syntax[name].required? "" : "(optional) ")
                    + JSON.stringify(name)
                    + " -> "
                    + args.syntax[name].description
                    + "\n  Can use " + Bagel.internal.list(args.syntax[name].types, "or", true)
                    + "."
                ).join("\n\n")
            );
        }

        if (otherErrors) {
            output.log("In " + args.where + ".");
            output.log("Object:");
            output.log(args.ob);

            output.send();
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
                                prevName: i
                            });
                        }
                    }
                    else {
                        Bagel.check({
                            ob: args.ob[argID],
                            where: args.where + "." + argID,
                            syntax: args.syntax[argID].subcheck,
                            prev: args,
                            prevName: argID
                        });
                    }
                }
                if (syntax.check) {
                    if (syntax.checkEach) {
                        for (let c in args.ob[argID]) {
                            let error = syntax.check(args.ob[argID][c], args.ob[argID], c, argID, args.game, args.prev);
                            if (error) {
                                console.error(error);
                                if (isNaN(c)) {
                                    console.log("In " + args.where + "." + argID + "." + c + ".");
                                }
                                else {
                                    console.log("In " + args.where + "." + argID + " item " + c + ".");
                                }
                                console.log("Object:");
                                console.log(args.ob[argID][c]);
                                Bagel.internal.oops(args.game);
                            }
                        }
                    }
                    else {
                        let error = syntax.check(args.ob[argID], args.ob, argID, args.game, args.prev);
                        if (error) {
                            console.error(error);
                            console.log("In " + args.where + "." + argID + ".");
                            console.log("Object:");
                            console.log(args.ob[argID]);
                            Bagel.internal.oops(args.game);
                        }
                    }
                }
            }
        }

        //delete args;
        return args.ob;
    },

    get: {
        asset: {},
        sprite: (id, game, check) => {
            if (game == null) {
                game = Bagel.internal.current.game;
            }
            if (game == null) {
                // TODO: Review error
                console.error("Oops. Looks like you're trying to run this function outside of a script. Try moving it and trying again. Alternatively, you can pass the game object in as the second parameter to this function to fix this issue.");
                Bagel.internal.oops(null);
                return;
            }
            if (game.internal.idIndex[id] == null) {
                if (check) return false;
                // TODO: Review error
                console.error("Ah, a problem occured while getting a sprite. There's no sprite with the ID " + JSON.stringify(id) + ".");
                Bagel.internal.oops(game);
                return;
            }
            return game.game.sprites[game.internal.idIndex[id]];
        }
    },
    step: id => {
            // TODO: Error if it's outside of a game or sprite. Error if no script

            let game = Bagel.internal.current.game;
            let me = Bagel.internal.current.sprite;

            return me.scripts.steps[id](me, game, Bagel.step);
        },
    config: {
        flags: {
            warnOfUselessParameters: true
        },
        fps: 60
    },
    device: {
        is: {
            touchscreen: document.ontouchstart === null
        }
    }
};
Bagel.internal.requestAnimationFrame.call(window, Bagel.internal.tick);
