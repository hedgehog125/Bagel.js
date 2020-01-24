// TODO:
// == Important ==
// How will developers know from the errors that the type name is supposed to be plural?
// Init each type so assets.assets[type] is [] instead of null

// What happens to Bagel.methods when there's no game? Does the built-in plugin load?
// .debug.avg.renderTime and scriptTime

// Check step functions. In .init.
// External scripts?
// If assets are already loaded in another game, should they be transfered to the game that's loading them?
// Touching starts autoplay?
// Change the joystick to use the load methods
// How should it work if height > width
// How do IDs work if there're multiple games, for assets.
// Widths and heights are innaccurate?
// Or is it something to do with changing the width and height and/or scale?
// High res canvases on the canvas?
// Something to do with when it's split?
// Or when they change squares? <===
// Rectangle internal sprite data doesn't match rectangle index
// Scripts are running before start?
// Tidy and remove unused ids
// High def on non-fillscreen canvases
// Is it high-def?
// AABB
// AABB on clones of clones?
// Clones of clones?
// Test clone data input
// Delete clones on state change
// Check cloning and errors
// Say where it is in warn of useless
// Methods
// Loading screen
// Functions as inputs for everything?
// Sounds
// Rotated sprites
// Errors for missing textures
// == TODO Later on ==
// Sprite id character blacklist
// Reset width and height when changing image
// How will sprites be structured when text and other types are added?
// Non-DOM canvases
// What types can you use for 'stateToRun'?
// 60 FPS requestAnimationFrame check
// Check ID error works
// Add function to change the selected game. Scripts will automatically use the selected game but you can target another by using the function. This changes when another script is run.
// Check the errors
// Package on Atom to allow error checking before it's run?
// Smart canvas rendering

debug = console.log; // TODO. Only for development. Use instead of console.log
Bagel = {
    init: (game) => {
        let internal = Bagel.internal; // A shortcut
        let subFunctions = Bagel.internal.subFunctions.init;

        game = subFunctions.check(game);
        internal.current.game = game;

        Bagel.internal.loadPlugin(Bagel.internal.plugin, game, {}); // Load the built in plugin

        // TODO: Is this needed? Don't errors stop all of this
        subFunctions.misc(game);
        subFunctions.inputs(game, game.internal.renderer.canvas.addEventListener);
        subFunctions.scripts(game);
        subFunctions.plugins(game);
        subFunctions.assets(game);

        /*
        var i = 0;
        for (i in game.game.assets.imgs) {
            if (Bagel.internal.getTypeOf(game.game.assets.imgs[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define an asset. \nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(game.game.assets.imgs[i])) + " in ''GameJSON.game.assets.imgs' item '" + i + "'.");
                console.error("Bagel.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            game.game.assets.imgs[i] = Bagel.internal.checkOb(game.game.assets.imgs[i], {
                src: {
                    types: [
                        "string"
                    ],
                    description: "The src for the asset."
                },
                id: {
                    types: [
                        "string"
                    ],
                    description: "The id to target this asset by."
                }
            }, {}, "GameJSON.game.assets.imgs item " + i + ".", "AssetJSON", game);
            if (game.internal.assets.assets.imgs.hasOwnProperty(game.game.assets.imgs[i].id)) {
                console.error("Oh no! You used an ID for an asset that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.game.assets.imgs[i].id) + " in 'GameJSON.game.assets.imgs item " + i + "'.");
                console.error("Bagel.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            if (game.game.assets.imgs[i].id.includes("Internal.")) {
                console.error("Oops! Looks like you tried to use the reserved asset starter. These just allow Bagel.js to load some of its own assets for things like GUI sprites. \nYou used " + JSON.stringify(game.game.assets.imgs[i].id) + " in 'GameJSON.game.assets.imgs item " + i + "'.");
                console.error("Bagel.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }

            Bagel.internal.load.img(game.game.assets.imgs[i], game);
        }

        if (document.readyState == "complete") {
            Bagel.internal.onPageReady();
        }

        var i = 0;
        for (i in game.game.assets.snds) {
            if (Bagel.internal.getTypeOf(game.game.assets.snds[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define an asset. \nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(game.game.assets.snds[i])) + " in ''GameJSON.game.assets.snds' item '" + i + "'.");
                console.error("Bagel.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            game.game.assets.snds[i] = Bagel.internal.checkOb(game.game.assets.snds[i], {
                src: {
                    types: [
                        "string"
                    ],
                    description: "The src for the asset."
                },
                id: {
                    types: [
                        "string"
                    ],
                    description: "The id to target this asset by."
                }
            }, {}, "GameJSON.game.assets.snds item " + i + ".", "AssetJSON", game);
            if (game.internal.assets.assets.snds.hasOwnProperty(game.game.assets.snds[i].id)) {
                console.error("Oh no! You used an ID for an asset that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.game.assets.snds[i].id) + " in 'GameJSON.game.assets.snds item " + i + "'.");
                console.error("Bagel.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            if (game.game.assets.snds[i].id.includes("Internal.")) {
                console.error("Oops! Looks like you tried to use the reserved asset starter. These just allow Bagel.js to load some of its own assets for things like GUI sprites. \nYou used " + JSON.stringify(game.game.assets.snds[i].id) + " in 'GameJSON.game.assets.snds item " + i + "'.");
                console.error("Bagel.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }

            Bagel.internal.load.snd(game.game.assets.snds[i], game);
        }
        Bagel.internal.testAutoPlay = () => {
            try {
                var promise = Bagel.internal.autoPlaySound.play();
            }
            catch (error) {
                Bagel.internal.autoPlay = false;
            }

            promise.catch((error) => {
                Bagel.internal.autoPlay = false;
                Bagel.internal.autoPlaySound.pause();
            });
            Bagel.internal.autoPlay = true;
        };


        Bagel.internal.autoPlay = false;
        Bagel.internal.autoPlaySound = new Audio();
        Bagel.internal.autoPlaySound.oncanplay = Bagel.internal.testAutoPlay;
        Bagel.internal.autoPlaySound.src = "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABQTEFNRTMuOTlyBLkAAAAAAAAAADUgJAa/QQAB4AAAAnE5mRCNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAAB/gAAACAAAD/AAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDEKYPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==";

        */

        // Sprites
        let i = 0;
        for (i in game.game.sprites) { // TODO: Temporary
            let sprite = Bagel.internal.createSprite(game.game.sprites[i], game, false);
        }

        if (typeof game.game.scripts.preload == "function") {
            game.game.scripts.preload(game);
        }

        Bagel.internal.games[game.id] = game;
        Bagel.internal.current.game = null;
        return game;
    },
    internal: {
        loadPlugin: (plugin, game, args) => {
            let subFunctions = Bagel.internal.subFunctions.loadPlugin;

            let check = subFunctions.check;
            // Check the new types
            check.types.assets(game, plugin);
            check.types.sprites(game, plugin);

            let merge = subFunctions.merge;
            merge.types.assets(game, plugin); // Combine it in with all the other plugins
            merge.types.sprites(game, plugin); // Combine it in with all the other plugins
        },
        plugin: { // The built in plugin
            info: {
                id: "Internal",
                description: "An easy to use plugin that makes it easy to console.log \"Hello world!\".",
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
                                },
                                isInternal: {
                                    required: false,
                                    default: false,
                                    types: ["boolean"],
                                    description: "If the asset is internal or not. Internal assets are allowed to use dot prefixes."
                                }
                            },
                            description: "Images give a sprite (only the sprite type though) its appearance. Just set its \"img\" argument to the id of the image you want to use.",
                            check: (asset, game, check, standardChecks, plugin, index) => {
                                var error = standardChecks.id();
                                if (error) return error;
                                var error = standardChecks.isInternal();
                                if (error) return error;
                            },
                            init: (asset, ready, game, plugin, index) => {
                                var img = new Image();
                                img.onload = () => {
                                    ready({
                                        img: img,
                                        JSON: asset
                                    });
                                }
                                img.src = asset.src;
                            },
                            get: {
                                name: "img",
                                handler: (id, defaultFind, game, plugin, type) => defaultFind(id)
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
                            description: "",
                            check: (asset, game, check, standardChecks, plugin, index) => {
                                var error = standardChecks.id();
                                if (error) return error;
                                var error = standardChecks.isInternal();
                                if (error) return error;
                            },
                            init: (asset, ready, game, plugin, index) => {
                                var snd = new Audio();
                                ready({
                                    snd: snd,
                                    JSON: asset
                                }); // Sounds are ready instantly
                                snd.src = asset.src;
                            },
                            get: {
                                name: "snd",
                                handler: (id, defaultFind) => defaultFind(id)
                            }
                        }
                    },
                    sprites: {
                        sprite: {
                            args: {
                                id: {
                                    required: true,
                                    types: [
                                        "string"
                                    ],
                                    description: "The ID for the sprite to be targeted by."
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
                                    description: "The default data for a clone of this sprite. \nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                                },
                                visible: {
                                    required: false,
                                    default: true,
                                    types: [
                                        "boolean"
                                    ],
                                    description: "Determines if the sprite is visible or not."
                                },
                                vars: {
                                    required: false,
                                    default: {},
                                    types: [
                                        "object"
                                    ],
                                    description: "An object you can use to store data for the sprite."
                                },
                                /*
                                type: {
                                    default: "sprite",
                                    types: [
                                        "string"
                                    ],
                                    description: "The type of the sprite (sprite, canvas, renderer)."
                                },
                                */
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

                            },
                            listeners: {
                                property: {
                                    steps: {
                                        xy: (sprite, property, game, plugin, args) => {
                                            let mode = args.mode;


                                        }
                                    },
                                    x: {
                                        get: (sprite, property, game, plugin, triggerSprite) => {
                                            let value = sprite[property];

                                            if (typeof value == "string") {
                                                if (value == "centred") {
                                                    sprite[property] = game.width / 2;
                                                }
                                            }
                                            if (typeof value == "function") {
                                                sprite.internal.JSON[property] = value(me, game); // Avoid the setter
                                            }
                                        }
                                    },
                                    y: {
                                        get: (sprite, property, game, plugin) => {
                                            let value = sprite[property];

                                            if (typeof value == "string") {
                                                if (value == "centred") {
                                                    sprite[property] = game.height / 2;
                                                }
                                            }
                                            if (typeof value == "function") {
                                                sprite.internal.JSON[property] = value(me, game); // Avoid the setter
                                            }
                                        }
                                    },
                                    width: {
                                        get: (sprite, property, game, plugin) => {
                                            let value = sprite[property];

                                            if (typeof value == "string") {
                                                if (value.includes("x")) {
                                                    let number = value.split("x")[0];
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            description: "A basic type of sprite. Has the appearance of the image specified.",
                            check: (asset, game, check, standardChecks, plugin, index) => {

                            },
                            init: (args, game, plugin, index) => {

                            },
                            internal: (args, game, plugin, index) => { // Set all the internal attributes
                                // Return the internal object
                            },
                            render: { // How do I render this type?
                                ctx: (sprite, ctx, canvas, game, plugin) => {

                                },
                                // webgl: (sprite, ctx, canvas, game, plugin)...
                            }
                        }
                    }
                },
                assets: {},
                sprites: [],

                methods: {

                }, // For game objects
                spriteMethods: {
                    move: {
                        appliesTo: [
                            "sprite",
                            "canvas"
                        ],
                        obArg: false,
                        args: {
                            amount: {
                                required: true,
                                types: [
                                    "number"
                                ],
                                description: "The number of in game pixels (independent of the rendered canvas width and height) to move the sprite (in the direction specified in degrees from the sprite's angle argument. 0° -> Straight up. -180/180° -> Straight down. 90° -> Right (default)).",
                            }
                        },
                        fn: (me, game) => {
                            var rad = Bagel.maths.degToRad(me.angle - 90);
                            me.x += Math.cos(rad) * distance;
                            me.y += Math.sin(rad) * distance;
                            console.log("It worked")
                        }
                     }
                }, // For sprites

                scripts: {
                    init: [
                        {

                        }
                    ],
                    main: [
                        {

                        }
                    ],
                    steps: {

                    }
                }
            }
        },

        subFunctions: {
            init: {
                check: (gameJSON) => {
                    if (typeof gameJSON != "object") {
                        console.error("Oh no! Your game JSON appears to be the wrong type. It must be the type \"object\", you used " + JSON.stringify(gameJSON) + ".");
                        Bagel.internal.oops(gameJSON, true, true);
                    }
                    if (gameJSON.id == null) {
                        console.error("Oh no! You forgot to specifiy an id for the game.");
                        Bagel.internal.oops(gameJSON, true, true);
                    }
                    if (document.getElementById(gameJSON.htmlElementID) == null && gameJSON.htmlElementID != null) { // Make sure the element exists
                        console.error("Oops, you specified the element to add the game canvas to but it doesn't seem to exist. \nThis is specified in \"GameJSON.htmlElementID\" and is set to " + JSON.stringify(gameJSON.htmlElementID) + ". You might want to check that the HTML that creates the element is before your JavaScript.");
                        Bagel.internal.oops(gameJSON, false, true);
                    }


                    var game = Bagel.internal.checkOb(gameJSON, {
                        id: {
                            types: ["string"],
                            description: "An ID for the game canvas so it can be referenced later in the program."
                        },
                        width: {
                            types: ["number"],
                            description: "The virtual width for the game. Independent from the rendered width."
                        },
                        height: {
                            types: ["number"],
                            description: "The virtual height for the game. Independent from the rendered height."
                        },
                        game: {
                            types: ["object"],
                            description: "The JSON for the game."
                        }
                    }, {
                        htmlElementID: {
                            default: null,
                            types: ["string"],
                            description: "The element to append the game canvas to."
                        },
                        config: {
                            default: {
                                state: "game",
                                display: {
                                    fillScreen: true
                                }
                            },
                            types: ["object"],
                            description: "The game configuration settings."
                        },
                        vars: {
                            default: {},
                            types: ["object"],
                            description: "An object that you can use for variables."
                        }
                    }, "GameJSON", "GameJSON", gameJSON, false, true);

                    game.config = Bagel.internal.checkOb(game.config, {}, {
                        state: {
                            default: "game",
                            types: null,
                            description: "The element to append the game canvas to."
                        },
                        display: {
                            default: {
                                fillScreen: false
                            },
                            types: "object",
                            description: "The element to append the game canvas to."
                        }
                    }, "GameJSON.config", "GameJSON.config", game, false, true);
                    game.config.display = Bagel.internal.checkOb(game.config.display, {}, {
                        fillScreen: {
                            default: false,
                            types: [
                                "boolean"
                            ],
                            description: "Determines if the game will be upscaled to fit the screen."
                        }
                    }, "GameJSON.config", "GameJSON.config.display", game, false, true);
                    game.game = Bagel.internal.checkOb(game.game, {}, {
                        assets: {
                            default: {},
                            types: ["object"],
                            description: "The assets you want to load for your game, organised by type. e.g imgs: [<asset1>,<asset2>]"
                        },
                        sprites: {
                            default: [],
                            types: ["array"],
                            description: "The array that contains the all the sprites' JSON."
                        },
                        scripts: {
                            default: {
                                init: [],
                                main: []
                            },
                            types: ["object"],
                            description: "The object that contains all the game scripts that aren't for a particular sprite."
                        },
                    }, "GameJSON.game", "GameJSON.game", game, false, true);
                    game.game.scripts = Bagel.internal.checkOb(game.game.scripts, {}, {
                        preload: {
                            default: [],
                            types: [
                                "function"
                            ],
                            description: "A function to be run before the game loads."
                        },
                        init: {
                            default: [],
                            types: ["array"],
                            description: "The array that contains the init scripts. An init script will be run when the game state changes to (one of the states/the state) assigned to that script."
                        },
                        main: {
                            default: [],
                            types: ["array"],
                            description: "The array that contains the main scripts. A main script will be run 60 times a second while the game state matches (one of the states/the state) assigned to that script."
                        }
                    }, "GameJSON.game.scripts", "GameJSON.game.scripts", game, false, true);

                    if (Bagel.internal.games[game.id] != null) {
                        console.error("Oh no! You used an ID for your game that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.id) + " in \"GameJSON.htmlElementID\".");
                        Bagel.internal.oops(game, false, true);
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
                            canvas: document.createElement("canvas")
                        },
                        ids: [],
                        IDIndex: {},
                        FPSFrames: 0,
                        lastFPSUpdate: new Date(),
                        loadedDelay: 0,
                        soundsToPlay: [],
                        assets: {
                            loading: 0,
                            loaded: 0,
                            assets: {}
                        },
                        combinedPlugins: { // Not all parts of the plugin are combined, only the ones where there mustn't be conflicts
                            types: {},
                            methods: {},
                            spriteMethods: {},
                            defaults: {
                                sprites: {
                                    type: "sprite"
                                }
                            }
                        } // The plugins are combined as they're loaded
                    };
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

                    addEventListener("mousemove", function(context) {
                        var rect = game.internal.renderer.canvas.getBoundingClientRect();

                        game.input.mouse.x = Math.round(((context.clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width);
                        game.input.mouse.y = Math.round(((context.clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height);
                    }, false);
                    addEventListener("mousedown", function(context) {
                        Bagel.device.is.touchscreen = false;

                        Bagel.internal.autoplaySounds();

                        game.input.mouse.down = true;
                    }, false);
                    addEventListener("mouseup", function(context) {
                        Bagel.internal.autoplaySounds();

                        game.input.mouse.down = false;
                    }, false);
                    addEventListener("touchstart", function(context) {
                        Bagel.device.is.touchscreen = true;

                        var rect = game.internal.renderer.canvas.getBoundingClientRect();

                        if (context.touches == null) {
                            game.input.mouse.x = Math.round(((context.clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width);
                            game.input.mouse.y = Math.round(((context.clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height);
                            game.input.touches = [
                                {
                                    x: game.input.mouse.x,
                                    y: game.input.mouse.y
                                }
                            ];
                        }
                        else {
                            game.input.mouse.x = Math.round(((context.touches[0].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width);
                            game.input.mouse.y = Math.round(((context.touches[0].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height);

                            game.input.touches = [];
                            var i = 0;
                            for (i in context.touches) {
                                game.input.touches.push({
                                    x: Math.round(((context.touches[i].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width),
                                    y: Math.round(((context.touches[i].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)
                                });
                            }
                        }
                        Bagel.internal.autoplaySounds();

                        game.input.mouse.down = true;
                        context.preventDefault();
                    }, false);
                    addEventListener("touchmove", function(context) {
                        Bagel.device.is.touchscreen = true;

                        var rect = game.internal.renderer.canvas.getBoundingClientRect();

                        if (context.touches == null) {
                            game.input.mouse.x = Math.round(((context.clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width);
                            game.input.mouse.y = Math.round(((context.clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height);
                            game.input.touches = [
                                {
                                    x: game.input.mouse.x,
                                    y: game.input.mouse.y
                                }
                            ];
                        }
                        else {
                            game.input.mouse.x = Math.round(((context.touches[0].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width);
                            game.input.mouse.y = Math.round(((context.touches[0].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height);

                            game.input.touches = [];
                            var i = 0;
                            for (i in context.touches) {
                                game.input.touches.push({
                                    x: Math.round(((context.touches[i].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width),
                                    y: Math.round(((context.touches[i].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)
                                });
                            }
                        }
                        Bagel.internal.autoplaySounds();

                        game.input.mouse.down = true;
                        context.preventDefault();
                    }, false);
                    addEventListener("touchend", function(context) {
                        Bagel.device.is.touchscreen = true;

                        game.input.touches = [];
                        Bagel.internal.autoplaySounds();

                        game.input.mouse.down = false;
                        context.preventDefault();
                    }, false);
                    document.addEventListener("keydown", function(context) {
                        var i = 0;
                        for (i in Bagel.internal.games) {
                            var game = Bagel.internal.games[i];
                            game.input.keys.keys[context.keyCode] = true;
                        }
                    }, false);
                    document.addEventListener("keyup", function(context) {
                        var i = 0;
                        for (i in Bagel.internal.games) {
                            var game = Bagel.internal.games[i];
                            game.input.keys.keys[context.keyCode] = false;
                        }
                    }, false);

                    document.addEventListener("readystatechange", function() {
                        if (document.readyState == "complete") { // Wait for the document to load
                            var i = 0;
                            for (i in Bagel.internal.games) {
                                var game = Bagel.internal.games[i];
                                if (game.htmlElementID == null) {
                                    try {
                                        document.body.appendChild(game.internal.renderer.canvas);
                                    }
                                    catch (error) {
                                        document.appendChild(game.internal.renderer.canvas);
                                    }
                                }
                                else {
                                    document.getElementById(game.htmlElementID).appendChild(game.internal.renderer.canvas);
                                }
                            }
                        }
                    });
                },
                misc: (game) => {
                    game.state = game.config.state;
                    game.loaded = false;
                    game.paused = false;
                    game.currentFPS = Bagel.config.fps;
                    game.currentRenderFPS = Bagel.config.fps;

                    game.internal.renderer.ctx = game.internal.renderer.canvas.getContext("2d");
                    game.internal.renderer.canvas.id = "Bagel.js " + game.id;

                    game.internal.renderer.ctx.imageSmoothingEnabled = false;
                    game.internal.renderer.canvas.width = game.width;
                    game.internal.renderer.canvas.height = game.height;
                    if (game.config.display.fillScreen) {
                        game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); position: absolute; top:0; bottom: 0; left: 0; right: 0; margin: auto;"; // CSS from Phaser (https://phaser.io)
                    }
                    else {
                        game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);" ;// CSS from Phaser (https://phaser.io)
                    }
                },
                checkScripts: (game, type) => {
                    var scripts = game.game.scripts[type];
                    var index = game.internal.scripts.index[type];

                    var i = 0;
                    for (i in scripts) {
                        var script = scripts[i];
                        if (Bagel.internal.getTypeOf(script) != "object") {
                            console.error("Oh no! You need to use the type \"object\" to define a script. \nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(script)) + " in GameJSON.game.scripts." + type + " item " + i + ".");
                            Bagel.internal.oops(game);
                            return;
                        }
                        scripts[i] = Bagel.internal.checkOb(script, {
                            stateToRun: {
                                types: ["string"],
                                description: "The state when this script will be run."
                            },
                            code: {
                                types: ["function"],
                                description: "The code to be run when the \"stateToRun\" property matches the game state."
                            }
                        }, {}, "GameJSON.game.scripts." + type + " item " + i + ".", "ScriptJSON", game, true);
                        if (index[script.stateToRun] == null) {
                            index[type][script.stateToRun] = [];
                        }
                        index[type][script.stateToRun][index[type][script.stateToRun].length] = i;
                    }
                },
                scripts: (game) => {
                    game.internal.scripts = {
                        index: {
                            init: {},
                            main: {},
                            spritesInit: {},
                            spritesMain: {}
                        }
                    };


                    Bagel.internal.subFunctions.init.checkScripts(game, "init");
                    Bagel.internal.subFunctions.init.checkScripts(game, "main");
                },
                plugins: (game) => {
                    var i = 0;
                    for (i in game.game.plugins) {
                        var plugin = game.game.plugins[i];
                        Bagel.internal.loadPlugin(plugin, game);
                    }
                },
                assets: (game) => {
                    var allAssets = game.game.assets;
                    var type = 0;
                    for (type in allAssets) {
                        var assets = allAssets[type];

                        var i = 0;
                        for (i in assets) {
                            var asset = assets[i];
                            var error = Bagel.internal.loadAsset(asset, game, type, i);
                            if (error) return "error";
                        }
                    }
                }
            },
            loadPlugin: {
                check: {
                    types: {
                        assets: (game, plugin) => {
                            for (let type in plugin.plugin.types.assets) {
                                let typeJSON = plugin.plugin.types.assets[type];
                                typeJSON = Bagel.internal.check({
                                    ob: typeJSON,
                                    where: "plugin " + plugin.info.id + ".plugin.types.assets." + type,
                                    syntax: {
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
                                                "    var error = standardChecks.id();\nif (error) return error;",
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
                                                "    var img = new Image();",
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
                                            required: false,
                                            default: {},
                                            types: ["object"],
                                            description: [
                                                "Contains the name of the function and the function that gets the asset. e.g {",
                                                "    name: \"img\",",
                                                "    handler: (id, defaultFind, game, plugin, type) => defaultFind(id)",
                                                "}"
                                            ].join("\n")
                                        }
                                    },
                                    game: game
                                });
                                typeJSON.get = Bagel.internal.check({
                                    ob: typeJSON.get,
                                    where: "plugin " + plugin.info.id + ".plugin.types.assets." + type + ".get",
                                    syntax: {
                                        name: {
                                            required: false,
                                            default: type,
                                            types: ["string"],
                                            description: "The name of the function. Usually the singular version of the asset type. e.g: the type \"imgs\" would have the name \"img\" so the function would be \"Game.get.asset.img\". Defaults to the name of type."
                                        },
                                        handler: {
                                            required: false,
                                            default: null,
                                            types: [
                                                "function",
                                                "undefined"
                                            ],
                                            description: "The handler function for the \"get\" method. Defaults to null. Most of the time you'll probably want to use this: \"(id, defaultFind, game, plugin, type) => defaultFind(id)\".\nThe function should return the asset specified by the arguments."
                                        }
                                    },
                                    game: game
                                });
                                plugin.plugin.types.assets[type] = typeJSON;
                            }
                        },
                        sprites: (game, plugin) => {
                            for (let type in plugin.plugin.types.assets) {
                                let typeJSON = plugin.plugin.types.assets[type];
                                typeJSON = Bagel.internal.check({
                                    ob: typeJSON,
                                    where: "plugin " + plugin.info.id + ".plugin.types.assets." + type + ".get",
                                    syntax: {
                                        args: Bagel.internal.argsCheck,
                                        cloneArgs: Bagel.internal.argsCheck,
                                        listeners: {
                                            required: false,
                                            default: {
                                                property: {}
                                            },
                                            types: ["object"],
                                            description: [
                                                "The listeners for this sprite, listeners can monitor things like when one of the sprite's properties are changed. e.g {",
                                                "    property: {",
                                                "        x: {",
                                                "            set: (sprite, oldValue, property, newValue, game, plugin, triggerSprite) => {",
                                                "                // The property has been set to the new value by the time this is run, but oldValue contains the previous value",
                                                "                // In some cases, you may have to use triggerSprite to access some properties as it may contain some user defined atrributes not in sprite. However, they will mostly use the \"vars\" property, which is synced. \"internal\" is also synced. Note: when possible, you should use the sprite attribute instead as it won't trigger any listeners.",
                                                "            },",
                                                "            get: (sprite, property, game, plugin) => {",
                                                "                // After this function is done, the value will be returned. If you want a different value to be returned, you need to change it in this function. e.g sprite.x = 10;",
                                                "            }",
                                                "        }",
                                                "    }",
                                                "}"
                                            ].join("\n")
                                        },
                                        description: {

                                        }
                                    }
                                    game: game
                                });
                            }
                        }
                    }
                },
                merge: {
                    types: {
                        assets: (game, plugin) => {
                            let types = plugin.plugin.types.assets;
                            let combined = game.internal.combinedPlugins;

                            for (let newType in types) {
                                let typeJSON = types[newType];

                                if (combined.types[type] == null) {
                                    combined.types[type] = {};
                                }

                                let merge = false;
                                if (combined.types[type][newType] != null) {
                                    if (typeJSON.overwrite) {
                                        merge = true;
                                    }
                                    else {
                                        console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.id) + " tried to overwrite the " + JSON.stringify(newType) + " type without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older type definition, add this to the new type JSON: \"overwrite: true\".");
                                    }
                                }
                                else {
                                    merge = true;
                                }
                                if (merge) {
                                    combined.types[type][newType] = typeJSON;
                                    combined.types[type][newType].internal = {
                                        plugin: plugin
                                    };
                                }

                                if (game.internal.assets[type][newType] == null) {
                                    game.internal.assets[type][newType] = {};
                                }

                                let defaultFind = Bagel.internal.defaultFind;

                                // Define the getter function. The function wrapping is so some data can be saved to the function that isn't shared between all of the functions

                                ((game, newType, typeJSON) => {
                                    Bagel.get.asset[typeJSON.get.name] = (id) => {
                                        Bagel.internal.current.game = game;
                                        Bagel.internal.current.assetType = newType;
                                        Bagel.internal.current.assetTypeName = typeJSON.get.name;

                                        let output = typeJSON.get.handler(
                                            id,
                                            defaultFind,
                                            game,
                                            plugin,
                                            type
                                        );

                                        Bagel.internal.current.game = null;
                                        Bagel.internal.current.assetType = null;
                                        Bagel.internal.current.assetTypeName = null;

                                        return output;
                                    };
                                })(game, newType, typeJSON);
                            }
                        }
                    }
                }
            },
            createSprite: {
                check: (sprite, game) => {
                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];

                    console.log(handler)
                    sprite = Bagel.internal.check(handler);
                },
                checkClone: (sprite, game) => {

                }
            }
        },

        standardChecks: {
            asset: {
                id: (id) => {
                    var game = Bagel.internal.current.game;
                    var asset = Bagel.internal.current.asset;
                    var type = Bagel.internal.current.assetType;
                    var id = id == null? "id" : id;

                    if (game.internal.assets.assets[type][asset[id]] != null) {
                        return "Oh no! You used an ID for an asset that's already being used. Maybe try something else. \nYou used "
                        + JSON.stringify(game.game.assets[type][i][id])
                        + " in GameJSON.game.assets." + type + " item " + index + ".";
                    }
                },
                isInternal: (isInternal, id) => {
                    var asset = Bagel.internal.current.asset;
                    var type = Bagel.internal.current.assetType;
                    var id = id == null? "id" : id;
                    var isInternal = isInternal == null? "isInternal" : isInternal;


                    if (! asset[isInternal]) {
                        if (asset[id][0] == ".") {
                            return "This is awkward... Assets starting with a dot are only for plugin assets. In GameJSON.game.assets." + type + " item "
                            + index
                            + ".\nAlternatively, add the \"isInternal\" argument to the " + type + " and set it to true.";
                        }
                    }
                }
            }
        },
        defaultFind: (id) => {
            let current = Bagel.internal.current;

            // TODO: Invalid asset

            return current.game.internal.assets.assets[current.assetType][id][current.assetTypeName];
        },

        loadAsset: (asset, game, type, i) => {
            var current = Bagel.internal.current;
            current.asset = asset;
            current.assetType = type;

            var assetLoader = game.internal.combinedPlugins.types.assets[type];
            var plugin = assetLoader.internal.plugin;

            if (game.internal.assets.assets[type] == null) {
                game.internal.assets.assets[type] = {};
            }

            Bagel.internal.check({
                ob: asset,
                where: "GameJSON.game.assets." + type + " item " + i,
                syntax: assetLoader.args,
                game: game
            }); // TODO
            var error = assetLoader.check(asset, game, Bagel.internal.check, Bagel.internal.standardChecks.asset, plugin, i);
            if (error) {
                current.asset = null;
                current.assetType = null;

                console.error(error);
                console.log("In plugin " + JSON.stringify(plugin.info.id) + ".");
                Bagel.internal.oops(game);
            }

            var loaded = (asset) => {
                var assets = game.internal.assets;
                assets.assets[type][game.game.assets[type][i].id] = asset;
                assets.loaded++;
                assets.loading--;
            }
            var assetOb = assetLoader.init(asset, loaded, game, assetLoader.internal.plugin, i);

            current.asset = null;
            current.assetType = null;

            game.internal.assets.loading++;
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

        an: (str) => ["a", "e", "i", "o", "u"].includes(str[0].toLowerCase())? "an " + str : "a " + str,
        list: (items, type, determiners) => {
            var output = "";
            var i = 0;
            for (i in items) {
                var item = items[i];
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
        oops: (game, noID, dontPause) => { // When something goes wrong
            if (noID) {
                throw "Critical Bagel.js error, please look at the error above for more info.";
            }
            if (! dontPause) {
                game.paused = true;
            }
            throw "Critical Bagel.js error in the game " + JSON.stringify(game.id) + ", look at the error for some help. ^-^";
        },
        current: {
            sprite: null,
            game: null,
            asset: null,
            assetType: null,
            assetTypeName: null
        },
        findCloneID: function(sprite, game) {
            var i = 0;
            for (i in sprite.internal.cloneIDs) {
                if (sprite.internal.cloneIDs[i] == null) {
                    return i;
                }
            }
            return sprite.internal.cloneIDs.length;
        },
        findSpriteID: function(game) {
            var i = 0;
            for (i in game.game.sprites) {
                if (game.game.sprites[i] == null) {
                    return i;
                }
            }
            return game.game.sprites.length;
        },
        checkClones: function(spriteData, data, game, parent) {
            if (data.type == null) {
                var type = parent.type;
            }
            else {
                var type = data.type;
            }
            if (type == "sprite") {
                var sprite = Bagel.internal.checkOb(spriteData, {}, {
                    x: {
                        default: parent.x,
                        types: [
                            "number"
                        ],
                        description: "The x position for the sprite to start at."
                    },
                    y: {
                        default: parent.y,
                        types: [
                            "number"
                        ],
                        description: "The y position for the sprite to start at."
                    },
                    img: {
                        default: parent.img,
                        types: [
                            "string"
                        ],
                        description: "The image for the sprite to use to start with."
                    },
                    clones: {
                        default: parent.clones,
                        types: [
                            "object"
                        ],
                        description: "The default data for a clone of this clone. \nAll arguments are optional as the child clone will adopt the arguments from the clone function and the parent clone (in that priority)"
                    },
                    width: {
                        default: parent.width,
                        types: [
                            "number"
                        ],
                        description: "The width for the sprite."
                    },
                    height: {
                        default: parent.height,
                        types: [
                            "number"
                        ],
                        description: "The height for the sprite."
                    },
                    visible: {
                        default: parent.visible,
                        types: [
                            "boolean"
                        ],
                        description: "Determines if the sprite is visible or not."
                    },
                    scripts: {
                        default: {
                            init: [],
                            main: [],
                            steps: {}
                        },
                        types: [
                            "object"
                        ],
                        description: "Determines if the sprite is visible or not."
                    },
                    /*
                    "scale": {
                        default: 1,
                        types: [
                            "number"
                        ],
                        description: "The scale for the sprite."
                    },
                    */
                    vars: {
                        default: {},
                        types: [
                            "object"
                        ],
                        description: "An object you can use to store data for the sprite."
                    },
                    alpha: {
                        default: parent.alpha,
                        types: [
                            "number"
                        ],
                        description: "The alpha of the sprite. 1 = Fully visible. 0 = Invisible."
                    },
                    angle: {
                        default: parent.angle,
                        types: [
                            "number"
                        ],
                        description: "The angle of the sprite. In degrees. 0º = up. 180º = down. -90º = left. 90º = right."
                    }
                }, "the function \"sprite.clone\" cloning the sprite " + JSON.stringify(data.spriteToClone) + ".", "function cloneSprite arguments (merged with the parentSprite's arguments)", game);
            }
            else {
                if (type == "canvas") {
                    var sprite = Bagel.internal.checkOb(spriteData, {}, {
                        x: {
                            default: parent.x,
                            types: [
                                "number"
                            ],
                            description: "The x position for the canvas sprite to start at."
                        },
                        y: {
                            default: parent.y,
                            types: [
                                "number"
                            ],
                            description: "The y position for the canvas sprite to start at."
                        },
                        width: {
                            default: parent.width,
                            types: [
                                "number"
                            ],
                            description: "The width for the canvas sprite."
                        },
                        height: {
                            default: parent.height,
                            types: [
                                "number"
                            ],
                            description: "The height for the canvas sprite."
                        },
                        scripts: {
                            default: {
                                init: [],
                                main: [],
                                steps: {}
                            },
                            types: [
                                "object"
                            ],
                            description: "The canvas sprite's scripts."
                        },
                        clones: {
                            default: {},
                            types: [
                                "object"
                            ],
                            description: "The default data for a clone of this canvas sprite. \nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                        },
                        visible: {
                            default: parent.visible,
                            types: [
                                "boolean"
                            ],
                            description: "Determines if the canvas sprite is visible or not."
                        },
                        vars: {
                            default: {},
                            types: [
                                "object"
                            ],
                            description: "An object you can use to store data for the canvas sprite."
                        },
                        type: {
                            default: parent.type,
                            types: [
                                "string"
                            ],
                            description: "The type of the sprite (sprite, canvas, renderer)."
                        },
                        res: {
                            default: parent.res,
                            types: ["number"],
                            description: "The resolution of the canvas."
                        },
                        customRes: {
                            default: parent.customRes,
                            types: ["boolean"],
                            description: "Determines whether Bagel.js should allow the canvas resolution to be changed."
                        }
                    }, "the function \"sprite.clone\" cloning the sprite " + JSON.stringify(data.spriteToClone) + ".", "function cloneSprite arguments (merged with the parentSprite's arguments)", game);
                }
                else {
                    if (type == "renderer") {
                        var sprite = Bagel.internal.checkOb(spriteData, {}, {
                            scripts: {
                                default: {
                                    init: [],
                                    main: [],
                                    steps: {}
                                },
                                types: [
                                    "object"
                                ],
                                description: "The renderer's scripts."
                            },
                            clones: {
                                default: {},
                                types: [
                                    "object"
                                ],
                                description: "The default data for a clone of this renderer. \nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                            },
                            vars: {
                                default: {},
                                types: [
                                    "object"
                                ],
                                description: "An object you can use to store data for the renderer."
                            },
                            type: {
                                default: parent.type,
                                types: [
                                    "string"
                                ],
                                description: "The type of the sprite (sprite, canvas, renderer)."
                            },
                            render: {
                                default: parent.render,
                                types: [
                                    "function"
                                ],
                                description: "A function to run every render to render anything you like."
                            },
                            order: {
                                default: parent.order,
                                types: [
                                    "string"
                                ],
                                description: "When to render. Either \"high\" (renders on top of all sprites) or \"low\" (renders below all other sprites)"
                            }
                        }, "the function \"sprite.clone\" cloning the sprite " + JSON.stringify(data.spriteToClone) + ".", "function cloneSprite arguments (merged with the parentSprite's arguments)", game);
                    }
                    else {
                        console.error("Oh no! Looks like you used an invalid type for a clone. \nYou used " + JSON.stringify(type) + " in \"GameJSON.game.sprites\" item \"type\". While cloning the sprite " + JSON.stringify(parent.id) + ".");
                        console.log("Here's sprite's JSON: ^-^");
                        console.log(parent);
                        Bagel.internal.oops(game);
                    }
                }
            }

            sprite.type = type;
            sprite.scripts = Bagel.internal.checkOb(sprite.scripts, {}, {
                init: {
                    default: [],
                    types: [
                        "array"
                    ],
                    description: "The array of init functions for the clone."
                },
                main: {
                    default: [],
                    types: [
                        "array"
                    ],
                    description: "The array of main functions for the sprite."
                },
                steps: {
                    default: {},
                    types: [
                        "object"
                    ],
                    description: "The object of steps for the sprite. Each step is a function which can be called in a script to help you organise your code. It's provided with the same arguments as a script."
                }
            }, "the function \"sprite.clone\" cloning the sprite " + JSON.stringify(data.spriteToClone) + ".", "function cloneSprite arguments (merged with the parentSprite's arguments) -> scripts.");

            var c = 0;
            for (c in sprite.scripts.init) {
                if (Bagel.internal.getTypeOf(sprite.scripts.init[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of init scripts. \nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(sprite.scripts.init[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    //console.log(sprite.scripts.init[c])
                    console.error("Bagel.js hit a critical error, look at the error above for more information.")
                    debugger
                    // TODO: Clearer error
                }
            }
            var c = 0;
            for (c in sprite.scripts.main) {
                if (Bagel.internal.getTypeOf(sprite.scripts.main[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of main scripts. \nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(sprite.scripts.main[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    //console.log(sprite.scripts.main[c])
                    console.error("Bagel.js hit a critical error, look at the error above for more information.")
                    debugger
                    // TODO: Clearer error
                }
            }
        },
        createSprite: (spriteData, game, isClone) => {
            spriteData.type = spriteData.type == null? game.internal.combinedPlugins.defaults.sprites.type : spriteData.type; // If the sprite type isn't specified, default to default agreed by the plugins
            let subFunctions = Bagel.internal.subFunctions.createSprite;

            let sprite = subFunctions.check(spriteData, game, isClone);
            let register = subFunctions.register;
            register.scripts("init", sprite, game, isClone);
            register.scripts("main", sprite, game, isClone);
            register.values(sprite, game, isClone);
            register.methods(sprite, game, isClone);

            /*
            if (data.isClone) {
                var parent = Bagel.get.sprite(data.cloneOf);
                Bagel.internal.checkClones(spriteData, data, game, parent);
                var sprite = spriteData;

                var scriptIDs = {
                    init: [],
                    main: []
                };

                var c = 0;
                for (c in sprite.scripts.init) {
                    if (game.internal.scripts.index.spritesInit[game.state] == null) {
                        game.internal.scripts.index.spritesInit[game.state] = [];
                    }

                    var scriptID = game.internal.scripts.index.spritesInit[game.state].length;
                    game.internal.scripts.index.spritesInit[game.state].push({
                        "script": c,
                        "sprite": sprite,
                        "isClone": true
                    });

                    scriptIDs.init.push({
                        id: scriptID,
                        state: game.state
                    });
                }

                var c = 0;
                for (c in sprite.scripts.main) {
                    if (game.internal.scripts.index.spritesMain[game.state] == null) {
                        game.internal.scripts.index.spritesMain[game.state] = [];
                    }

                    var scriptID = game.internal.scripts.index.spritesMain[game.state].length;
                    game.internal.scripts.index.spritesMain[game.state].push({
                        "script": c,
                        "sprite": sprite,
                        "isClone": true
                    });
                    scriptIDs.main.push({
                        id: scriptID,
                        state: game.state
                    });
                }

                sprite.cloneOf = data.cloneOf;
                sprite.parent = parent;
                sprite.internal = {
                    cloneCount: 0,
                    cloneIDs: [],
                    collision: {},
                    scriptIDs: scriptIDs,
                    nullErrors: {}
                };
                sprite.game = game;
                sprite.idIndex = data.idIndex;

                if (sprite.type == "canvas") {
                    sprite.canvas = document.createElement("canvas");
                    sprite.canvas.width = sprite.width;
                    sprite.canvas.height = sprite.height;
                    sprite.ctx = sprite.canvas.getContext("2d");

                    sprite.scaled = {};
                    sprite.scaled.width = Bagel.internal.render.scale.x(sprite.width, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                    sprite.scaled.height = Bagel.internal.render.scale.y(sprite.height, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;

                    sprite.scale = {};
                    sprite.scale.internal = {
                        "game": game,
                        "sprite": sprite
                    };
                    sprite.scale.x = function(x) {
                        return Bagel.internal.render.scale.x(x, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas) * this.internal.sprite.res;
                    }
                    sprite.scale.y = function(y) {
                        return Bagel.internal.render.scale.y(y, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas) * this.internal.sprite.res;
                    }
                }
                else {
                    if (sprite.type == "renderer") {
                        sprite.canvas = game.internal.renderer.canvas;
                        sprite.ctx = game.internal.renderer.ctx;

                        sprite.scale = {};
                        sprite.scale.internal = {
                            game: game,
                            sprite: sprite
                        };
                        sprite.scale.x = function(x) {
                            return Bagel.internal.render.scale.x(x, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas);
                        }
                        sprite.scale.y = function(y) {
                            return Bagel.internal.render.scale.y(y, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas);
                        }

                        game.internal.renderer.renderers[sprite.order].push({
                            "code": sprite.render,
                            "game": game,
                            "sprite": sprite
                        });
                        sprite.internal.rendererID = game.internal.renderer.renderers[sprite.order].length - 1;
                    }
                }

                //Bagel.internal.spriteTick(sprite, game); // TODO
            }
            else {
                if (spriteData.type == null) {
                    spriteData.type = "sprite";
                }
                if (spriteData.type == "sprite") {
                    var sprite = Bagel.internal.checkOb(spriteData, {
                        x: {
                            types: [
                                "number"
                            ],
                            description: "The x position for the sprite to start at."
                        },
                        y: {
                            types: [
                                "number"
                            ],
                            description: "The y position for the sprite to start at."
                        },
                        img: {
                            types: [
                                "string"
                            ],
                            description: "The image for the sprite to use to start with."
                        },
                        id: {
                            types: [
                                "string"
                            ],
                            description: "The id for the sprite to be targeted by."
                        }
                    }, {
                        width: {
                            default: "auto",
                            types: [
                                "number"
                            ],
                            description: "The width for the sprite."
                        },
                        height: {
                            default: "auto",
                            types: [
                                "number"
                            ],
                            description: "The height for the sprite."
                        },
                        scale: {
                            default: 1,
                            types: [
                                "number"
                            ],
                            description: "The scale for the sprite."
                        },
                        scripts: {
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
                            description: "The default data for a clone of this sprite. \nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                        },
                        visible: {
                            default: true,
                            types: [
                                "boolean"
                            ],
                            description: "Determines if the sprite is visible or not."
                        },
                        vars: {
                            default: {},
                            types: [
                                "object"
                            ],
                            description: "An object you can use to store data for the sprite."
                        },
                        type: {
                            default: "sprite",
                            types: [
                                "string"
                            ],
                            description: "The type of the sprite (sprite, canvas, renderer)."
                        },
                        alpha: {
                            default: 1,
                            types: [
                                "number"
                            ],
                            description: "The alpha of the sprite. 1 = Fully visible. 0 = Invisible."
                        },
                        angle: {
                            default: 90,
                            types: [
                                "number"
                            ],
                            description: "The angle of the sprite. In degrees. 0º = up. 180º = down. -90º = left. 90º = right."
                        }
                    }, "GameJSON.game.sprites item " + data.idIndex + ".", "SpriteJSON", game);
                }
                else {
                    if (spriteData.type == "canvas") {
                        var sprite = Bagel.internal.checkOb(spriteData, {
                            x: {
                                types: [
                                    "number"
                                ],
                                description: "The x position for the canvas sprite to start at."
                            },
                            y: {
                                types: [
                                    "number"
                                ],
                                description: "The y position for the canvas sprite to start at."
                            },
                            id: {
                                types: [
                                    "string"
                                ],
                                description: "The id for the canvas sprite to be targeted by."
                            },
                            width: {
                                types: [
                                    "number"
                                ],
                                description: "The width for the canvas sprite."
                            },
                            height: {
                                types: [
                                    "number"
                                ],
                                description: "The height for the canvas sprite."
                            }
                        }, {
                            scripts: {
                                default: {
                                    init: [],
                                    main: []
                                },
                                types: [
                                    "object"
                                ],
                                description: "The canvas sprite's scripts."
                            },
                            clones: {
                                default: {},
                                types: [
                                    "object"
                                ],
                                description: "The default data for a clone of this canvas sprite. \nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                            },
                            visible: {
                                default: true,
                                types: [
                                    "boolean"
                                ],
                                description: "Determines if the canvas sprite is visible or not."
                            },
                            vars: {
                                default: {},
                                types: [
                                    "object"
                                ],
                                description: "An object you can use to store data for the canvas sprite."
                            },
                            type: {
                                default: "sprite",
                                types: [
                                    "string"
                                ],
                                description: "The type of the sprite (sprite, canvas, renderer)."
                            },
                            res: {
                                default: 1,
                                types: ["number"],
                                description: "The resolution of the canvas."
                            },
                            customRes: {
                                default: false,
                                types: ["boolean"],
                                description: "Determines whether Bagel.js should allow the canvas resolution to be changed."
                            }
                        }, "GameJSON.game.sprites item " + data.idIndex + ".", "SpriteJSON", game);

                        sprite.canvas = document.createElement("canvas");
                        sprite.canvas.width = sprite.width;
                        sprite.canvas.height = sprite.height;
                        sprite.ctx = sprite.canvas.getContext("2d");

                        sprite.scaled = {};
                        sprite.scaled.width = Bagel.internal.render.scale.x(sprite.width, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                        sprite.scaled.height = Bagel.internal.render.scale.y(sprite.height, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;

                        sprite.scale = {};
                        sprite.scale.internal = {
                            game: game,
                            sprite: sprite
                        };
                        sprite.scale.x = function(x) {
                            return Bagel.internal.render.scale.x(x, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas) * this.internal.sprite.res;
                        }
                        sprite.scale.y = function(y) {
                            return Bagel.internal.render.scale.y(y, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas) * this.internal.sprite.res;
                        }
                    }
                    else {
                        if (spriteData.type == "renderer") {
                            var sprite = Bagel.internal.checkOb(spriteData, {
                                type: {
                                    types: [
                                        "string"
                                    ],
                                    description: "The type of the sprite (sprite, canvas, renderer)."
                                },
                                render: {
                                    types: [
                                        "function"
                                    ],
                                    description: "A function to run every render to render anything you like."
                                },
                                id: {
                                    types: [
                                        "string"
                                    ],
                                    description: "The id for the renderer sprite to be targeted by."
                                }
                            }, {
                                scripts: {
                                    default: {
                                        init: [],
                                        main: []
                                    },
                                    types: [
                                        "object"
                                    ],
                                    description: "The renderer's scripts."
                                },
                                clones: {
                                    default: {},
                                    types: [
                                        "object"
                                    ],
                                    description: "The default data for a clone of this renderer. \nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                                },
                                vars: {
                                    default: {},
                                    types: [
                                        "object"
                                    ],
                                    description: "An object you can use to store data for the renderer."
                                },
                                order: {
                                    default: "high",
                                    types: [
                                        "string"
                                    ],
                                    description: "When to render. Either \"high\" (renders on top of all sprites) or \"low\" (renders below all other sprites)"
                                }
                            }, "GameJSON.game.sprites item " + data.idIndex + ".", "Sprite", "SpriteJSON");

                            sprite.canvas = game.internal.renderer.canvas;
                            sprite.ctx = game.internal.renderer.ctx;

                            sprite.scale = {};
                            sprite.scale.internal = {
                                game: game,
                                sprite: sprite
                            };
                            sprite.scale.x = function(x) {
                                return Bagel.internal.render.scale.x(x, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas);
                            }
                            sprite.scale.y = function(y) {
                                return Bagel.internal.render.scale.y(y, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas);
                            }

                            // TODO: What if it's not one of the options?

                            if (! ["high", "low"].includes(sprite.order)) {
                                console.error("Oops, you used an invalid option. It can only be either \"high\" or \"low\". \nYou used " + JSON.stringify(sprite.order) + " in 'GameJSON.game.sprites item' " + data.idIndex + " -> order.");
                                console.log("Sprite JSON:");
                                console.log(sprite);
                                Bagel.internal.oops(game);
                            }

                            game.internal.renderer.renderers[sprite.order].push({
                                code: sprite.render,
                                game: game,
                                sprite: sprite
                            });
                        }
                        else {
                            console.error("Oh no! You used an invalid type for a sprite. \nYou used " + JSON.stringify(sprite.type) + " in 'GameJSON.game.sprites item' " + data.idIndex + ".");
                            Bagel.internal.oops(game);
                        }
                    }
                }

                sprite.scripts = Bagel.internal.checkOb(sprite.scripts, {}, {
                    init: {
                        default: [],
                        types: [
                            "array"
                        ],
                        description: "The array of init scripts for the sprite."
                    },
                    main: {
                        default: [],
                        types: [
                            "array"
                        ],
                        description: "The array of main scripts for the sprite."
                    },
                    steps: {
                        default: [],
                        types: [
                            "object"
                        ],
                        description: "The object of steps for the sprite. Each step is a function which can be called in a script to help you organise your code. It's provided with the same arguments as a script."
                    }
                }, "GameJSON.game.sprites item " + data.idIndex + ". -> scripts.", "SpriteJSON -> scripts", game);

                sprite.cloneOf = null;
                sprite.cloneID = null;
                sprite.internal = {
                    cloneCount: 0,
                    cloneIDs: [],
                    collision: {},
                    nullErrors: {}
                };

                if (spriteData.type == "renderer") {
                    sprite.internal.rendererID = game.internal.renderer.renderers[sprite.order].length - 1;
                }
                sprite.game = game;
                sprite.idIndex = parseInt(data.idIndex);

                if (game.internal.IDIndex[sprite.id] != null) {
                    // TODO: Better error message
                    console.error("Oh no! You used an ID for a sprite that is already being used. Try and think of something else. \nYou used " + JSON.stringify(sprite.id) + " in 'GameJSON.game.sprites item' " + data.idIndex + ".")
                    Bagel.internal.oops(game);
                }
                if (! data.isInternal) {
                    if (sprite.id.includes("Internal.")) {
                        console.error("Oops! Looks like you tried to use the reserved asset starter. These just allow Bagel.js to load some of its own assets for things like GUI sprites. \nYou used " + JSON.stringify(sprite.id) + " in 'GameJSON.game.sprites item " + data.idIndex + "'.")
                        Bagel.internal.oops(game);
                    }
                }
                game.internal.IDIndex[sprite.id] = data.idIndex;
            }
            sprite.layer = game.internal.renderer.layers.length;
            game.internal.renderer.layers.push(data.idIndex);

            // Sprite methods

            sprite.bringToFront = function() { // TODO: What about for renderers?
                var spriteWas = Bagel.internal.current.sprite;
                var gameWas = Bagel.internal.current.game;

                var sprite = this;
                Bagel.internal.current.sprite = sprite;
                var game = sprite.game;
                Bagel.internal.current.game = game;



                var copyID = game.internal.renderer.layers.indexOf(sprite.idIndex);
                var copy = game.internal.renderer.layers[copyID];

                // TODO: What if there're no sprites?

                if (game.internal.renderer.layers[game.internal.renderer.layers.length - 1] == sprite.idIndex) {
                    Bagel.internal.current.sprite = spriteWas;
                    Bagel.internal.current.game = gameWas;
                    return;
                }

                var tmp = game.internal.renderer.layers[game.internal.renderer.layers.length - 1];
                game.internal.renderer.layers[game.internal.renderer.layers.length - 1] = sprite.idIndex;
                game.internal.renderer.layers[game.internal.renderer.layers.indexOf(sprite.idIndex)] = null;

                var done = false;
                var i = game.internal.renderer.layers.length - 2;
                while (i >= 0 && (! done)) {
                    if (game.internal.renderer.layers[i] == null) {
                        done = true;
                    }
                    var tmp2 = game.internal.renderer.layers[i];
                    game.internal.renderer.layers[i] = tmp;
                    tmp = tmp2;
                    i--;
                }

                Bagel.internal.current.sprite = spriteWas;
                Bagel.internal.current.game = gameWas;
            }
            sprite.bringForwards = function() {
                var spriteWas = Bagel.internal.current.sprite;
                var gameWas = Bagel.internal.current.game;

                var sprite = this;
                Bagel.internal.current.sprite = sprite;
                var game = sprite.game;
                Bagel.internal.current.game = game;



                var copyID = game.internal.renderer.layers.indexOf(sprite.idIndex);
                var copy = game.internal.renderer.layers[copyID];

                // TODO: What if there're no sprites?

                if (game.internal.renderer.layers[game.internal.renderer.layers.length - 1] == sprite.idIndex) {
                    Bagel.internal.current.sprite = spriteWas;
                    Bagel.internal.current.game = gameWas;
                    return;
                }

                var tmp = game.internal.renderer.layers[game.internal.renderer.layers.length - 1];
                game.internal.renderer.layers[game.internal.renderer.layers.length - 1] = sprite.idIndex;
                game.internal.renderer.layers[copyID] = null;

                var done = false;
                var i = copyID;
                while (i >= 0 && (! done)) {
                    if (game.internal.renderer.layers[i] == null) {
                        done = true;
                    }
                    var tmp2 = game.internal.renderer.layers[i];
                    game.internal.renderer.layers[i] = tmp;
                    tmp = tmp2;
                    i--;
                }

                Bagel.internal.current.sprite = spriteWas;
                Bagel.internal.current.game = gameWas;
            }
            sprite.sendToBack = function() {
                var spriteWas = Bagel.internal.current.sprite;
                var gameWas = Bagel.internal.current.game;

                var sprite = this;
                Bagel.internal.current.sprite = sprite;
                var game = sprite.game;
                Bagel.internal.current.game = game;



                var copyID = game.internal.renderer.layers.indexOf(sprite.idIndex);
                var copy = game.internal.renderer.layers[copyID];

                // TODO: What if there're no sprites?

                if (game.internal.renderer.layers[0] == sprite.idIndex) {
                    Bagel.internal.current.sprite = spriteWas;
                    Bagel.internal.current.game = gameWas;
                    return
                }

                var tmp = game.internal.renderer.layers[0];
                game.internal.renderer.layers[0] = sprite.idIndex;
                game.internal.renderer.layers[copyID] = null;

                var done = false;
                var i = 1;
                while (i < game.internal.renderer.layers.length && (! done)) {
                    if (game.internal.renderer.layers[i] == null) {
                        done = true;
                    }
                    var tmp2 = game.internal.renderer.layers[i];
                    game.internal.renderer.layers[i] = tmp;
                    tmp = tmp2;
                    i++;
                }

                Bagel.internal.current.sprite = spriteWas;
                Bagel.internal.current.game = gameWas;
            }

            if (sprite.type == "renderer") {
                sprite.rendererPriority = {
                    switchToLow: function() {
                        var sprite = this.internal.sprite;
                        var game = sprite.game;

                        var renderer = game.internal.renderer.renderers[sprite.order][sprite.internal.rendererID];
                        game.internal.renderer.renderers[sprite.order][sprite.internal.rendererID] = null;
                        sprite.internal.rendererID = null;

                        // Find a position for it
                        var i = 0;
                        while (game.internal.renderer.renderers.low[i] != null) {
                            i++;
                        }
                        sprite.internal.rendererID = i;
                        // Create a copy of it in the other
                        game.internal.renderer.renderers.low[i] = renderer;
                        sprite.order = "low"; // Update this
                    },
                    switchToHigh: function() {
                        var game = this.internal.game;
                        var sprite = this.internal.sprite;


                        var renderer = game.internal.renderer.renderers[sprite.order][sprite.internal.rendererID];
                        game.internal.renderer.renderers[sprite.order][sprite.internal.rendererID] = null;
                        sprite.internal.rendererID = null;

                        // Find a position for it
                        var i = 0;
                        while (game.internal.renderer.renderers.high[i] != null) {
                            i++;
                        }
                        sprite.internal.rendererID = i;
                        // Create a copy of it in the other
                        game.internal.renderer.renderers.high[i] = renderer;
                        sprite.order = "high"; // Update this
                    },
                    internal: {
                        sprite: sprite,
                        game: game
                    }
                }
            }

            sprite.last = {
                "collision": null
            };
            sprite.touching = {
                "sprite": {
                    "AABB": function(spriteID, rectInput) {
                        var me = this.internal.sprite;
                        var game = me.game;
                        if (rectInput == null) {
                            var rect = Bagel.internal.collision.methods.spriteRect(me, 2, 1);
                        }
                        else {
                            // TODO: Check rect
                            // TODO: What if it's a renderer?

                            var rect = rectInput;
                        }

                        // Get the parent sprite
                        var parentSprite = game.game.sprites[game.internal.IDIndex[spriteID]];

                        if (parentSprite.internal.cloneCount > 0) {
                            // Check if touching the parent sprite
                            if (parentSprite.visible) {
                                if (Bagel.internal.collision.methods.AABB(
                                    rect,
                                    Bagel.internal.collision.methods.spriteRect(parentSprite, 2, 1))
                                ) {
                                    return true;
                                }
                            }

                            // Check against all of its clones if not
                            var i = 0;
                            for (i in parentSprite.internal.cloneIDs) {
                                if (parentSprite.internal.cloneIDs[i] == null) {
                                    continue;
                                }
                                var clone = game.game.sprites[parentSprite.internal.cloneIDs[i]];
                                if (me.id == spriteID + "#" + i && spriteID == me.cloneOf) {
                                    continue;
                                }
                                if (! clone.visible) {
                                    continue;
                                }

                                if (Bagel.internal.collision.methods.AABB(
                                    rect,
                                    Bagel.internal.collision.methods.spriteRect(clone, 2, 1))
                                ) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    },
                    "internal": {
                        "sprite": sprite
                    }
                },
                "mouse": {
                    "AABB": function(rectInput) {
                        var me = this.internal.sprite;
                        var game = me.game;

                        if (rectInput == null) {
                            var rect = Bagel.internal.collision.methods.spriteRect(me, 2, 1);
                        }
                        else {
                            // TODO: Check rect
                            // TODO: What if it's a renderer?

                            var rect = rectInput;
                        }

                        var mouseX = game.input.mouse.x;
                        var mouseY = game.input.mouse.y;

                        // TODO: What if the sprite doesn't exist?
                        // TODO: What if there's no game?
                        if (Bagel.device.is.touchscreen && game.input.touches.length > 0) {
                            var i = 0;
                            for (i in game.input.touches) {
                                var input = game.input.touches[i];
                                if (input.x <= rect.x + rect.width) {
                                    if (input.x >= rect.x) {
                                        if (input.y <= rect.y + rect.height) {
                                            if (input.y >= rect.y) {
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
                        }
                        else {
                            if (mouseX <= rect.x + rect.width) {
                                if (mouseX >= rect.x) {
                                    if (mouseY <= rect.y + rect.height) {
                                        if (mouseY >= rect.y) {
                                            me.last.collision = {
                                                "x": mouseX,
                                                "y": mouseY,
                                                "type": "mouse"
                                            };
                                            return true;
                                        }
                                    }
                                }
                            }
                        }

                        me.last.collision = null;
                        return false;
                    },
                    "internal": {
                        "sprite": sprite
                    }
                }
            };
            sprite.move = function(distance) { // TODO: add rotation
                var me = this;

                var rad = Bagel.maths.degToRad(me.angle - 90);

                me.x += Math.cos(rad) * distance;
                me.y += Math.sin(rad) * distance;
            };
            sprite.clone = function(inputCloneData) {
                var spriteWas = Bagel.internal.current.sprite;
                var gameWas = Bagel.internal.current.game;


                var sprite = this;
                var game = sprite.game;
                Bagel.internal.current.sprite = sprite;
                Bagel.internal.current.game = game;

                if (inputCloneData == null) {
                    var cloneData = {};
                }
                else {
                    var cloneData = inputCloneData;
                }

                var id = Bagel.internal.findCloneID(sprite, game);
                var cloneSpriteID = Bagel.internal.findSpriteID(game);
                sprite.internal.cloneIDs[id] = sprite.id;
                sprite.internal.cloneCount++;

                var newSpriteData = {};
                newSpriteData = {...Bagel.internal.deepClone(sprite.clones), ...cloneData}; // Merge the .clones atrribute argument with the input to the function

                var newSprite = Bagel.internal.createSprite({
                    isClone: true,
                    cloneOf: sprite.id,
                    idIndex: cloneSpriteID
                }, newSpriteData, game);
                newSprite.id = sprite.id + "#" + id;
                newSprite.cloneID = id;
                game.game.sprites[cloneSpriteID] = newSprite;
                game.internal.IDIndex[sprite.id + "#" + id] = cloneSpriteID;

                Bagel.internal.current.sprite = newSprite;

                var i = 0;
                for (i in newSprite.scripts.init) {
                    newSprite.scripts.init[i](Bagel.internal.current.game, newSprite, Bagel.step);
                }

                Bagel.internal.current.sprite = spriteWas;
                Bagel.internal.current.game = gameWas;

                return newSprite;
            };
            sprite.switch = function(imgID) {
                var me = this;
                var game = me.game;
                // What if it's not run as a sprite? TODO

                if (game.internal.assets.assets.imgs[imgID] == null) {
                    console.error("Oops. You tried to switch the image of the sprite with the ID " + me.id + " to an image with the ID of " + imgID + ".");
                    console.error("Bagel.js hit a critical error, have a look at the error abovr for more info.");
                    debugger;
                }

                me.img = imgID;
                var asset = game.internal.assets.assets.imgs[imgID];
                me.width = asset.img.width;
                me.height = asset.img.height;
            };
            sprite.setScale = function(x, y) {
                var me = this;

                // Reset to the default dimensions
                var img = Bagel.get.asset.img(me.img, me.game);
                // TODO: What if it's null?

                me.width = img.width;
                me.height = img.height;

                if (y == null) {
                    me.width *= x;
                    me.height *= x;
                }
                else {
                    me.width *= x;
                    me.height *= y;
                }

            };
            sprite.delete = function() {
                // TODO: Make it work for sprites not just clones <=====
                // TODO: Reuse these?

                var me = this;
                var game = me.game;

                var index = game.internal.renderer.layers.indexOf(me.idIndex);
                game.internal.renderer.layers[index] = null;
                game.internal.renderer.layers = game.internal.renderer.layers.filter((item) => item != null);

                var idWas = me.idIndex;
                game.game.sprites[me.idIndex] = null;
                game.internal.IDIndex[me.id] = null;

                // Delete the sprite scripts
                var i = 0;
                var allScripts = game.internal.scripts.index.spritesInit;
                var scripts = me.internal.scriptIDs.init;
                for (i in scripts) {
                    allScripts[scripts[i].state][scripts[i].id] = null;
                }

                // Remove the nulls
                var i = 0;
                for (i in allScripts) {
                    var removed = 0;
                    var newInitScripts = [];
                    var c = 0;
                    for (c in allScripts[i]) {
                        if (allScripts[i][c] == null) {
                            removed++;
                        }
                        else {
                            newInitScripts.push(allScripts[i][c]);
                            allScripts[i][c].sprite.internal.scriptIDs.init[allScripts[i][c].script].id -= removed;
                        }
                    }
                    game.internal.scripts.index.spritesInit[i] = newInitScripts;
                }

                var i = 0;
                var allScripts = game.internal.scripts.index.spritesMain;
                var scripts = me.internal.scriptIDs.main;
                for (i in scripts) {
                    allScripts[scripts[i].state][scripts[i].id] = null;
                }
                // Remove the nulls
                var i = 0;
                for (i in allScripts) {
                    var removed = 0;
                    var newMainScripts = [];
                    var c = 0;
                    for (c in allScripts[i]) {
                        if (allScripts[i][c] == null) {
                            removed++;
                        }
                        else {
                            newMainScripts.push(allScripts[i][c]);
                            allScripts[i][c].sprite.internal.scriptIDs.main[allScripts[i][c].script].id -= removed;
                        }
                    }
                    game.internal.scripts.index.spritesMain[i] = newMainScripts;
                }

                // Delete my renderer

                if (me.internal.rendererID != null) {
                    game.internal.renderer.renderers[me.order][me.internal.rendererID] = null;
                    var newRenderers = [];
                    var i = 0;
                    for (i in game.internal.renderer.renderers[me.order]) {
                        var renderer = game.internal.renderer.renderers[me.order][i];
                        if (renderer != null) {
                            newRenderers.push(renderer);
                        }
                    }
                    game.internal.renderer.renderers[me.order] = newRenderers;
                }
            };

            if (! data.isClone) {
                var scriptIDs = {
                    "init": [],
                    "main": []
                };

                var scripts = game.game.sprites[data.idIndex].scripts.init;

                var c = 0;
                for (c in scripts) {
                    if (Bagel.internal.getTypeOf(scripts[c]) != "object") {
                        // TODO: Better error
                        console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(game.game.sprites[data.i].scripts.init[c])) + " in ''GameJSON.game.game.sprites' item " + c + " -> scripts.init.");
                        console.error("Bagel.js hit a critical error, look at the error above for more information.");
                        debugger;
                    }
                    scripts[c] = Bagel.internal.checkOb(scripts[c], {
                        stateToRun: {
                            types: [
                                "string",
                                "object"
                            ],
                            description: "The state(s) when this script will be run."
                        },
                        code: {
                            types: [
                                "function"
                            ],
                            description: "The code to be run when the \"stateToRun\" property matches the game state."
                        }
                    }, {}, "GameJSON.game.scripts.init item " + c + ".", "ScriptJSON", game);

                    if (game.internal.scripts.index.spritesInit[scripts[c].stateToRun] == null) {
                        game.internal.scripts.index.spritesInit[scripts[c].stateToRun] = [];
                    }

                    var scriptID = game.internal.scripts.index.spritesInit[scripts[c].stateToRun].length;
                    game.internal.scripts.index.spritesInit[scripts[c].stateToRun].push({
                        script: c,
                        sprite: game.game.sprites[data.idIndex]
                    });

                    scriptIDs.init.push({
                        id: scriptID,
                        state: scripts[c].stateToRun
                    });
                }

                var scripts = game.game.sprites[data.idIndex].scripts.main;

                var c = 0;
                for (c in scripts) {
                    if (Bagel.internal.getTypeOf(scripts[c]) != "object") {
                        console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(game.game.sprites[data.i].scripts.main[c])) + " in ''GameJSON.game.game.sprites' item " + c + " -> scripts.main.");
                        console.error("data.Bagel.js hit a critical error, look at the error above for more information.");
                        debugger;
                    }
                    scripts[c] = Bagel.internal.checkOb(scripts[c], {
                        stateToRun: {
                            types: [
                                "string",
                                "object"
                            ],
                            description: "The state(s) when this script will be run."
                        },
                        code: {
                            types: [
                                "function"
                            ],
                            description: "The code to be run while the \"stateToRun\" property matches the game state."
                        }
                    }, {}, "GameJSON.game.game.sprites item " + c + ".", "ScriptJSON", game);
                    if (game.internal.scripts.index.spritesMain[scripts[c].stateToRun] == null) {
                        game.internal.scripts.index.spritesMain[scripts[c].stateToRun] = [];
                    }

                    var scriptID = game.internal.scripts.index.spritesMain[scripts[c].stateToRun].length;
                    game.internal.scripts.index.spritesMain[scripts[c].stateToRun].push({
                        script: c,
                        sprite: game.game.sprites[data.idIndex]
                    });

                    scriptIDs.main.push({
                        id: scriptID,
                        state: scripts[c].stateToRun
                    });
                }
                sprite.internal.scriptIDs = scriptIDs;

                if (data.runScripts) {
                    var spriteWas = Bagel.internal.current.sprite;
                    var gameWas = Bagel.internal.current.game;

                    Bagel.internal.current.sprite = sprite;
                    Bagel.internal.current.game = game;

                    var i = 0;
                    for (i in sprite.scripts.init) {
                        var script = sprite.scripts.init[i];
                        script.code(Bagel.internal.current.game, Bagel.internal.current.sprite);
                    }

                    Bagel.internal.current.sprite = spriteWas;
                    Bagel.internal.current.game = gameWas;
                }
            }
            sprite.debug = {
                renderTime: 0,
                scriptTime: 0,
                avg: {
                    renderTime: 0,
                    scriptTime: 0
                }
            };

            */

            return sprite;
        },
        getTypeOf: function(entity) {
            if (Array.isArray(entity)) {
                return "array";
            }
            if (entity == null) {
                return "undefined";
            }
            return typeof entity;
        },
        checkOb: function(ob, required, optional, where, obType, game, noID, dontPause) {
            var missing = [];
            var wrongTypes = [];

            var i = 0;
            for (i in required) {
                if (ob[i] == null) {
                    missing[missing.length] = i;
                }
                else {
                    if (ob.hasOwnProperty(i)) {
                        if (required[i].types != null) {
                            if (! required[i].types.includes(Bagel.internal.getTypeOf(ob[i]))) {
                                wrongTypes[wrongTypes.length] = i;
                            }
                        }
                    }
                }
            }
            var i = 0;
            for (i in optional) {
                if (ob.hasOwnProperty(i)) {
                    if (optional[i].types != null) {
                        if (! optional[i].types.includes(Bagel.internal.getTypeOf(ob[i]))) {
                            wrongTypes[wrongTypes.length] = i
                        }
                    }
                }
            }

            var newOb = ob;

            var i = 0;
            for (i in optional) {
                if (ob[i] == null && optional[i].default != null) {
                    newOb[i] = optional[i].default
                }
            }

            var useless = [];

            var i = 0;
            for (i in ob) {
                if (! (required.hasOwnProperty(i) || optional.hasOwnProperty(i))) {
                    useless[useless.length] = i;
                }
            }

            if (missing.length > 0) {
                var message = [];
                if (missing.length == 1) {
                    message.push("Oops, looks like you missed this one out from " + JSON.stringify(where) + ": ^-^\n \n");
                }
                else {
                    message.push("Hmm, looks like you missed these in " + JSON.stringify(where) + ": ^-^\n \n");
                }

                var i = 0;
                for (i in missing) {
                    message.push(" " + missing[i] + " -> " + required[missing[i]].description + " \n");
                }

                console.error(message.join(""));
            }
            if (wrongTypes.length > 0) {
                var message = [];
                if (wrongTypes.length == 1) {
                    message.push("Oops, looks like you've put an incorrect input type in " + JSON.stringify(where) + ": ^-^\n");
                }
                else {
                    message.push("Oops, looks like you've put some incorrect input types in " + JSON.stringify(where) + ": ^-^\n");
                }

                var i = 0;
                for (i in wrongTypes) {
                    var c = wrongTypes[i];
                    if (required.hasOwnProperty(c)) {
                        if (required[c].types.length == 1) {
                            message.push(" • " + c + " -> " + required[c].description + "\n You've the type " + JSON.stringify(Bagel.internal.getTypeOf(ob[c])) + ", but it can only be " + Bagel.internal.an(required[c].types[0]) + ".\n");
                        }
                        else {
                            message.push(" " + c + " -> " + required[c].description + " \n You used the type " + JSON.stringify(Bagel.internal.getTypeOf(ob[c])) + ", it has to be one of these types:\n");
                            var a = 0;
                            for (a in required[c].types) {
                                message.push(" - " + Bagel.internal.an(required[c].types[a]) + "\n");
                            }
                        }
                    }
                    else {
                        if (optional[c].types.length == 1) {
                            message.push(" • " + c + " -> " + optional[c].description + "\n You used the type " + JSON.stringify(Bagel.internal.getTypeOf(ob[c])) + ", but it can only be " + Bagel.internal.an(optional[c].types[0]) + ".\n");
                        }
                        else {
                            message.push(" • " + c + " -> " + optional[c].description + " \n You used the type " + JSON.stringify(Bagel.internal.getTypeOf(ob[c])) + ", it has to be one of these types: \n");
                            var a = 0;
                            for (a in optional[c].types) {
                                message.push(" • " + Bagel.internal.an(optional[c].types[a]) + "\n");
                            }
                        }
                    }
                }

                console.error(message.join(""));
            }
            if (Bagel.config.flags.warnOfUselessParameters) { // Check the flag
                if (useless.length > 0) {
                    var message = [];
                    if (useless.length == 1) {
                        message.push("You might want to remove this: ^-^\n");
                    }
                    else {
                        message.push("You might want to remove these: ^-^\n");
                    }

                    var i = 0;
                    for (i in useless) {
                        message.push(useless[i] + "\n");
                    }
                    message.push("\nOr you might've made a typo and it could be one of these:\n");
                    var i = 0;
                    for (i in optional) {
                        message.push(" • " + JSON.stringify(i) + " -> " + optional[i].description + "\n");
                    }

                    message.push("\nIn " + where + "\n");
                    message.push("\n\nTip: You can disable these sorts of warnings by changing the \"warnOfUselessParameters\" flag. \nUse: \"Bagel.config.flags.warnOfUselessParameters = false\" :).");
                    console.warn(message.join(""));
                }
            }

            if (missing.length > 0 || wrongTypes.length > 0) { // Was there an error?
                console.log(obType + ":");
                console.log(ob);
                Bagel.internal.oops(game, noID, dontPause);
            }
            return newOb;
        },
        requestAnimationFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
        tick: function() {
            var i = 0;
            for (i in Bagel.internal.games) {
                if (new Date() - Bagel.internal.games[i].internal.lastFPSUpdate > 1000) {
                    Bagel.internal.games[i].currentFPS = Bagel.internal.games[i].internal.FPSFrames;
                    Bagel.internal.games[i].internal.FPSFrames = 0;
                    Bagel.internal.games[i].internal.lastFPSUpdate = new Date();
                }
                var start = new Date();
                var ctx = Bagel.internal.games[i].internal.renderer.ctx;
                var canvas = Bagel.internal.games[i].internal.renderer.canvas;
                var game = Bagel.internal.games[i];
                if (game.paused) {
                    continue;
                }

                var newWidth = window.innerWidth;
                var newHeight = window.innerHeight;
                var ratio = game.width / game.height;
                if (newWidth > newHeight * ratio) {
                    var newWidth = newHeight * ratio;
                }
                else {
                    var newHeight = newWidth / ratio;
                }

                if (game.config.display.fillScreen) {
                    if (game.internal.lastWidth != newWidth || game.internal.lastHeight != newHeight) {
                        game.internal.lastWidth = newWidth * window.devicePixelRatio;
                        game.internal.lastHeight = newHeight * window.devicePixelRatio;
                        game.internal.renderer.canvas.width = newWidth * window.devicePixelRatio;
                        game.internal.renderer.canvas.height = newHeight * window.devicePixelRatio;

                        canvas.style.removeProperty("width");
                        canvas.style.setProperty("width", newWidth + "px", "important");
                        canvas.style.removeProperty("height");
                        canvas.style.setProperty("height", newHeight + "px", "important");

                        game.internal.renderer.ctx.imageSmoothingEnabled = false;
                    }
                }


                if (Bagel.internal.games[i].loaded) {
                    var game = Bagel.internal.games[i];
                    Bagel.internal.current.game = game;


                    Bagel.internal.processSprites(game);
                    Bagel.internal.scripts(game);
                    Bagel.internal.render.renderFrame[game.internal.renderer.type].call(window, game, game.internal.renderer.canvas, game.internal.renderer.ctx, game.internal.renderer);
                }
                else {
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    var percent = (game.internal.assets.loaded / (game.internal.assets.loaded + game.internal.assets.loading)) * 100;
                    ctx.fillStyle = "lime";
                    var height = (percent / 100) * canvas.height;
                    ctx.fillRect(0, canvas.height - height, canvas.width, height);

                    ctx.font = (50 * window.devicePixelRatio) + "px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    var textDimensions = ctx.measureText("Loading...");
                    var width = textDimensions.width;
                    var height = 50 * window.devicePixelRatio;
                    ctx.fillStyle = "black";
                    ctx.fillRect(((canvas.width / 2) - (width / 2)) - (10 * window.devicePixelRatio), ((canvas.height / 2) - (height / 2)) - (5 * window.devicePixelRatio), width + (10 * window.devicePixelRatio), height + (10 * window.devicePixelRatio));

                    ctx.fillStyle = "lime";
                    ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2);
                    //Game.internal.loadingGif.style.top = Game.internal.renderer.canvas.height


                    if (Bagel.internal.games[i].internal.assets.loading == 0) {
                        Bagel.internal.games[i].internal.loadedDelay++;
                        if (Bagel.internal.games[i].internal.loadedDelay > Bagel.config.fps / 2) {
                            Bagel.internal.games[i].loaded = true;
                            var c = 0;
                            for (c in Bagel.internal.games[i].game.sprites) {
                                var sprite = Bagel.internal.games[i].game.sprites[c];

                                var customDimentions = true;

                                // TODO: What if it doesn't exist?

                                if (sprite.width == "auto") {
                                    sprite.width = Bagel.internal.games[i].internal.assets.assets.imgs[sprite.img].img.width;
                                    customDimentions = false;
                                }
                                if (sprite.height == "auto") {
                                    sprite.height = Bagel.internal.games[i].internal.assets.assets.imgs[sprite.img].img.height;
                                    customDimentions = false;
                                }
                                if (! customDimentions) {
                                    sprite.width = Bagel.internal.games[i].internal.assets.assets.imgs[sprite.img].img.width * sprite.scale;
                                    sprite.height = Bagel.internal.games[i].internal.assets.assets.imgs[sprite.img].img.height * sprite.scale;
                                }
                            }
                        }
                    }
                }

                Bagel.internal.games[i].internal.FPSFrames++;
                Bagel.internal.games[i].currentRenderFPS = 1000 / (new Date() - start);
                var frameTime = new Date() - start;
                Bagel.internal.games[i].internal.renderer.lastRender = new Date();
            }


            setTimeout(function() {
                Bagel.internal.requestAnimationFrame.call(window, Bagel.internal.tick);
            }, (1000 / Bagel.config.fps) - frameTime);
        },
        scripts: function(game) {
            if (game.internal.lastState != game.state) {
                var i = 0;
                for (i in game.game.sprites) {
                    var sprite = game.game.sprites[i];
                    sprite.visible = false;
                }

                // TODO: Delete clones

                Bagel.internal.current.sprite = null;
                var i = 0;
                for (i in game.internal.scripts.index.init[game.state]) {
                    var script = game.game.scripts.init[game.internal.scripts.index.init[game.state][i]];
                    script.code(game);
                }
                var i = 0;
                for (i in game.internal.scripts.index.spritesInit[game.state]) {
                    var sprite = game.internal.scripts.index.spritesInit[game.state][i].sprite;
                    Bagel.internal.current.sprite = game.game.sprites[game.internal.IDIndex[sprite.id]]; // What if it's null?
                    var script = sprite.scripts.init[game.internal.scripts.index.spritesInit[game.state][i].script];

                    if (sprite.type == "canvas") {
                        sprite.scaled.width = Bagel.internal.render.scale.x(sprite.width, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                        sprite.scaled.height = Bagel.internal.render.scale.y(sprite.height, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                    }

                    sprite.visible = true;
                    script.code(game, sprite, Bagel.step);
                }
                game.internal.lastState = game.state;
            }

            Bagel.internal.current.sprite = null;
            var i = 0;
            for (i in game.internal.scripts.index.main[game.state]) {
                var script = game.game.scripts.main[game.internal.scripts.index.main[game.state][i]];
                script.code(game);
            }
            if (game.internal.scripts.index.spritesMain[game.state] != null) {
                var i = 0;
                while (i < game.internal.scripts.index.spritesMain[game.state].length) {
                    var start = new Date();

                    var sprite = game.internal.scripts.index.spritesMain[game.state][i].sprite;
                    Bagel.internal.current.sprite = game.game.sprites[game.internal.IDIndex[sprite.id]]; // What if it's null?

                    if (sprite.type == "canvas") {
                        if (sprite.customRes) {
                            sprite.scaled.width = Bagel.internal.render.scale.x(sprite.width, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                            sprite.scaled.height = Bagel.internal.render.scale.y(sprite.height, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                        }
                        else {
                            if (sprite.canvas.width != sprite.width || sprite.canvas.height != sprite.height) {
                                sprite.canvas.width = sprite.width
                                sprite.canvas.height = sprite.height
                            }
                            sprite.scaled.width = sprite.width;
                            sprite.scaled.height = sprite.height;
                        }
                    }

                    var idWas = sprite.id;
                    if (game.internal.scripts.index.spritesMain[game.state][i].isClone) {
                        Bagel.internal.current.sprite = sprite;
                        sprite.scripts.main[game.internal.scripts.index.spritesMain[game.state][i].script](game, sprite, Bagel.step);
                    }
                    else {
                        var script = sprite.scripts.main[game.internal.scripts.index.spritesMain[game.state][i].script];
                        script.code(game, sprite, Bagel.step);
                    }

                    if (sprite.id == idWas) { // Detect if it's been deleted
                        sprite.debug.scriptTime = (new Date() - start) / 1000;
                        i++;
                    }
                }

            }

            Bagel.internal.current.sprite = null;
            Bagel.internal.current.game = null;

        },
        processSprites: function(game) {
            if (false) { // Disabled for now as there's no sprite processing
                var i = 0;
                for (i in game.game.sprites) {
                    var sprite = game.game.sprites[i];
                    Bagel.internal.spriteTick(sprite, game);
                }
            }
        },
        render: {
            vars: {
                canvas: {
                    gameCache: {}
                }
            },
            scale: {
                x: function(x, renderer, canvas) {
                    return (x / renderer.width) * canvas.width
                },
                y: function(y, renderer, canvas) {
                    return (y / renderer.height) * canvas.height
                },
                width: function(width, renderer, canvas) {
                    return (width / renderer.width) * canvas.width
                },
                height: function(height, renderer, canvas) {
                    return (height / renderer.height) * canvas.height
                }
            },
            renderFrame: {
                canvas: function(game, canvas, ctx, renderer) {
                    var newWidth = window.innerWidth;
                    var newHeight = window.innerHeight;
                    var ratio = game.width / game.height;
                    if (newWidth > newHeight * ratio) {
                        var newWidth = newHeight * ratio;
                    }
                    else {
                        var newHeight = newWidth / ratio;
                    }

                    if (game.config.display.fillScreen) {
                        if (game.internal.lastWidth != newWidth || game.internal.lastHeight != newHeight) {
                            game.internal.lastWidth = newWidth;
                            game.internal.lastHeight = newHeight;
                            game.internal.renderer.canvas.width = newWidth * window.devicePixelRatio;
                            game.internal.renderer.canvas.height = newHeight * window.devicePixelRatio;

                            canvas.style.removeProperty("width");
                            canvas.style.setProperty("width", newWidth + "px", "important");
                            canvas.style.removeProperty("height");
                            canvas.style.setProperty("height", newHeight + "px", "important");

                            game.internal.renderer.ctx.imageSmoothingEnabled = false;
                        }
                    }
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    var renderRenderers = (order) => {
                        Bagel.internal.current.game = game;
                        var i = 0;
                        for (i in game.internal.renderer.renderers[order]) {
                            var start = new Date();

                            var customRenderer = game.internal.renderer.renderers[order][i];
                            if (customRenderer == null) {
                                continue;
                            }
                            Bagel.internal.current.sprite = customRenderer.sprite;

                            ctx.save();
                            customRenderer.code.call(customRenderer.sprite, game, customRenderer.sprite);
                            ctx.restore();

                            customRenderer.sprite.debug.renderTime = (new Date() - start) / 1000;
                        }
                        Bagel.internal.current.sprite = null;
                    }
                    renderRenderers("low");


                    var i = 0;
                    for (i in game.internal.renderer.layers) {
                        var start = new Date();

                        var sprite = game.game.sprites[game.internal.renderer.layers[i]];
                        if (sprite == null) {
                            continue;
                        }

                        if (sprite.type == "canvas" && sprite.customRes) {
                            var x = sprite.x - (sprite.width / 2);
                            var y = sprite.y - (sprite.height / 2);

                            var scaled = {
                                x: Bagel.internal.render.scale.x(x, renderer, canvas),
                                y: Bagel.internal.render.scale.y(y, renderer, canvas),
                                width: sprite.canvas.width,
                                height: sprite.canvas.height
                            };
                        }
                        else {
                            if (sprite.type == "canvas") {
                                var x = sprite.x - ((sprite.width / sprite.res) / 2);
                                var y = sprite.y - ((sprite.height / sprite.res) / 2);
                            }
                            else {
                                var x = sprite.x - (sprite.width / 2);
                                var y = sprite.y - (sprite.height / 2);
                            }


                            var scaled = {
                                x: Bagel.internal.render.scale.x(x, renderer, canvas),
                                y: Bagel.internal.render.scale.y(y, renderer, canvas),
                                width: Bagel.internal.render.scale.width(sprite.width, renderer, canvas),
                                height: Bagel.internal.render.scale.height(sprite.height, renderer, canvas)
                            };
                        }
                        if (sprite.visible) {
                            var flip = [];
                            if (scaled.width > 0) {
                                flip.push(1);
                            }
                            else {
                                flip.push(-1);
                            }
                            if (scaled.height > 0) {
                                flip.push(1);
                            }
                            else {
                                flip.push(-1);
                            }
                            ctx.save();
                            ctx.scale(flip[0], flip[1]);

                            var checkIsNum = (property, suffixWord, sprite) => {
                                if (typeof sprite[property] == "number" && (! isNaN(sprite[property]))) {
                                    sprite.internal.nullErrors[property] = false;
                                }
                                else {
                                    if (! sprite.internal.nullErrors[property]) { // Don't spam the console
                                        if (isNaN(sprite[property])) {
                                            console.warn("Sprite " + sprite.id + "'s " + property + " " + suffixWord + " is NaN. You probably used a non-number variable when calculating a new " + property + " " + suffixWord + ".\n Bagel.js has disabled the rendering for this sprite until it's a number.");
                                            sprite.internal.nullErrors[property] = true;
                                        }
                                        else {
                                            console.warn("Sprite " + sprite.id + "'s " + property + " " + suffixWord + " is " + sprite[property] + ". It should be a number.\n Bagel.js has disabled the rendering for this sprite until it's a number.");
                                            sprite.internal.nullErrors[property] = true;
                                        }
                                    }
                                }
                            }
                            if (sprite.type != "renderer") {
                                checkIsNum("x", "position", sprite);
                                checkIsNum("y", "position", sprite);
                                checkIsNum("width", "", sprite);
                                checkIsNum("height", "", sprite);
                                checkIsNum("angle", "", sprite);
                            }
                            // TODO: Check image

                            ctx.globalAlpha = 1;
                            if (sprite.type == "sprite") {
                                sprite.angle = ((sprite.angle + 180) % 360) - 180; // Make sure it's in range
                                if (sprite.angle == 90) { // Don't rotate if we don't need to
                                    ctx.globalAlpha = sprite.alpha;
                                    ctx.drawImage(game.internal.assets.assets.imgs[sprite.img].img, scaled.x * flip[0], scaled.y * flip[1], scaled.width * flip[0], scaled.height * flip[1]);
                                }
                                else {
                                    ctx.save();

                                    ctx.translate((scaled.x + (scaled.width / 2)) * flip[0], (scaled.y + (scaled.height / 2) * flip[1]));
                                    ctx.rotate(Bagel.maths.degToRad(sprite.angle - 90));
                                    ctx.globalAlpha = sprite.alpha;
                                    ctx.drawImage(game.internal.assets.assets.imgs[sprite.img].img, -((scaled.width / 2) * flip[0]), -((scaled.height / 2) * flip[1]), scaled.width * flip[0], scaled.height * flip[1]);

                                    ctx.restore();
                                }
                            }
                            else {
                                if (sprite.type == "canvas") {
                                    ctx.drawImage(sprite.canvas, scaled.x * flip[0], scaled.y * flip[1], (scaled.width) / sprite.res, (scaled.height) / sprite.res);
                                }
                            }
                            ctx.restore();
                        }
                        sprite.debug.renderTime = (new Date() - start) / 1000;
                    }

                    renderRenderers("high");


                    Bagel.internal.current.game = null;
                }
            }
        },
        games: {},
        collision: {
            methods: {
                spriteRect: function(sprite, expand, centre) {
                    // Return the rectangle that this sprite occupies
                    return {
                        x: Math.round(sprite.x - ((sprite.width / 2) * centre)),
                        y: Math.round(sprite.y - ((sprite.height / 2) * centre)),
                        width: Math.round(sprite.width),
                        height: Math.round(sprite.height)
                    };
                },
                AABB: function(rect1, rect2) {
                    if (rect1.x < rect2.x + rect2.width) {
                        if (rect1.x + rect1.width > rect2.x) {
                            if (rect1.y < rect2.y + rect2.height) {
                                if (rect1.y + rect1.height > rect2.y) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }
            }
        },
        hex: function(num) {
            if (num.toString().length == 1) {
                return "0" + num.toString(16)
            }
            return num.toString(16)
        },
        spriteTick: function(sprite, game) {
            // Currently no processing for sprites. Was originally used for QTrees
        },
        onPageReady: function() {

        },
        onDocReadyStateChange: document.addEventListener("readystatechange", function() {
            if (document.readyState == "complete") {
                Bagel.internal.onPageReady()
            }
        }),
        load: {
            snd: function(sndJSON, game, allowInternal) {
                if (game.internal.assets.assets.snds[sndJSON.id] != null) {
                    return
                }
                var snd = new Audio()
                snd.onerror = function() {
                    console.warn("Unable to load asset(s) using " + JSON.stringify(this.src) + " as the src. This may be due to it being a online asset and your computer being offline or because the asset doesn't exist. \nBagel.js will continue to retry.")
                    this.onerror = function() {
                        setTimeout(function(snd) {
                            var tmp = snd.src
                            snd.src = ""
                            snd.src = tmp
                        }, 10000, this)
                    }
                    this.onerror()
                }
                snd.src = sndJSON.src
                //game.internal.assets.loading++
                game.internal.assets.assets.snds[sndJSON.id] = {
                    snd: snd
                }
            },
            img: function(imgJSON, game) {
                if (game.internal.assets.assets.imgs[imgJSON.id] != null) {
                    return
                }
                var img = new Image()
                img.onload = function() {
                    game.internal.assets.loading--
                    game.internal.assets.loaded++
                }
                img.onerror = function() {
                    console.warn("Unable to load asset(s) using " + JSON.stringify(this.src) + " as the src. This may be due to it being a online asset and your computer being offline or because the asset doesn't exist. \nBagel.js will continue to retry.")
                    this.onerror = function() {
                        setTimeout(function(img) {
                            var tmp = img.src
                            img.src = ""
                            img.src = tmp
                        }, 10000, this)
                    }
                    this.onerror()

                }
                game.internal.assets.loading++
                game.internal.assets.assets.imgs[imgJSON.id] = {
                    img: img
                }
            }
        },
        deepClone: (entity) => {
            if (Array.isArray(entity)) {
                var newEntity = []
            }
            else {
                var newEntity = {}
            }
            var keys = Object.keys(entity);

            var i = 0;
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

        check: (args) => {
            // ob, where, syntax
            let syntax;
            let arg;


            let useless = [];
            let missing = [];
            let wrongTypes = [];

            for (let argID in {...args.ob, ...args.syntax}) {
                syntax = args.syntax[argID];
                arg = args.ob[argID];

                if (syntax == null) {
                    useless.push(argID);
                    continue;
                }

                if (syntax.required) {
                    if (arg == null) {
                        missing.push(argID);
                    }
                }
                else {
                    if (arg == null) {
                        args.ob[argID] = syntax.default;
                        arg = args.ob[argID];
                    }
                }
                if (! syntax.types.includes(Bagel.internal.getTypeOf(arg))) {
                    wrongTypes.push(argID);
                }
            }

            var otherErrors = missing.length != 0 || wrongTypes.length != 0;
            if (useless.length > 0) {
                if (useless.length == 1) {
                    console.warn(
                        "Oops, looks like you used an unsupported argument"
                        + (otherErrors? "" : (" in " + args.where))
                        + ": "
                        + JSON.stringify(useless[0])
                        + ". You can leave this alone if you want, but it doesn't need to be there."
                    );
                }
                else {
                    console.warn(
                        "Hmm, looks like you used some unsupported arguments"
                        + (otherErrors? "" : (" in " + args.where))
                        + ":\n  • "
                        + useless.join("\n  • ")
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
                        + missing.map((index, item) =>
                            (
                                "  • "
                                + JSON.stringify(item)
                                + " -> "
                                + args.syntax[item].description
                            ).join("\n") + " argument."
                        )
                    );
                }
            }
            if (wrongTypes.length > 0) {
                if (wrongTypes.length == 1) {
                    console.error(
                        ":/ looks like you used the wrong type for the "
                        + JSON.stringify(wrongTypes[0])
                        + " argument. You used "
                        + Bagel.internal.an(Bagel.internal.getTypeOf(wrongTypes[0]))
                        + " instead of "
                        + Bagel.internal.list(args.syntax[wrongTypes[0]].types, "or", true)
                        + "."
                    );
                    // TODO ^^^ can be multiple valid types
                }
                else {
                    console.error(
                        "Hmm, looks like you got some types wrong:\n"
                        + missing.map((index, item) =>
                            (
                                "  • "
                                + JSON.stringify(item)
                                + " -> Should be "
                                + Bagel.internal.list(args.syntax[item].types, "or", true)
                                + "."
                            ).join("\n") + " argument."
                        )
                    );
                }
            }


            if (otherErrors) {
                console.log("In " + args.where);
                Bagel.internal.oops(args.game);
            }
            return args.ob;
        }
    },
    // == Methods ==
    get: {
        asset: {},
        sprite: function(id, game) {
            if (game == null) {
                var game = Bagel.internal.current.game;
            }
            if (game == null) {
                // TODO: Review error
                console.error("Oops. Looks like you're tryimg to run this function outside of a script. Try moving it and trying again. Alternatively, you can pass the game object in as the second parameter to this function to fix this issue.");
                Bagel.internal.oops(null, true, true);
                return;
            }
            if (game.internal.IDIndex[id] == null) {
                // TODO: Review error
                console.error("Ah, a problem occured while getting a sprite. There's no sprite with the ID " + JSON.stringify(id) + ".");
                Bagel.internal.oops(game);
                return;
            }
            return game.game.sprites[game.internal.IDIndex[id]];
        }
    },
    playSound: function(id) {
            // TODO: Test for game
            // TODO: Test for ID
            // TODO: game.methods.playSound

            var game = Bagel.internal.current.game


            if (Bagel.internal.autoPlay) {
                game.internal.assets.assets.snds[id].snd.play()
            }
            else {
                game.internal.soundsToPlay.push(id)
            }
        },
    maths: {
            radToDeg: (rad) => (rad * 180) / Math.PI,
            degToRad: (deg) => deg * (Math.PI / 180),
            getDirection: (x1, y1, x2, y2) => Bagel.maths.radToDeg(Math.atan2(y2 - y1, x2 - x1)) + 90, // gist.github.com/conorbuck/2606166
            getDistance: (x1, y1, x2, y2) => Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2)) // a2 + b2 = c2
        },
    step: (id) => {
            // TODO: Error if it's outside of a game or sprite

            var game = Bagel.internal.current.game;
            var me = Bagel.internal.current.sprite;

            return me.scripts.steps[id](game, me, Bagel.step);
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
