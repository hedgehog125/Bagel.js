/*

TODO:
Sounds and autoPlaySounds error
Do sounds work?

PERFORMANCE
Prescale images on canvases?
Disable alpha?
Clear the canvas more efficiently?
Automatic clone recycling?

"null" for sprite.img, does it crash?
Tidy up unused properties and code. Don't forget renderers
Value argument in getters
Layers doesn't have anything in
Sounds
Review internal stuff, what's used, what's not needed and what needs rewriting
Does obArg in sprite methods work? (Needs testing)
Plugins should be able to make existing methods apply to their sprites
Completely rewrite "tick" function
Update "step" function
Delete clones on state change
Deep clone plugin before loading? What about the built-in plugin?
Avoid constantly declaring anonymous functions, declare them and then access them to save resources.
Do all the functions show their arguments?
Review cloneArgs[x].syntax, does it have all the check function arguments?
Steps in other places. Especially listeners
Should no handler mean it uses defaultFind?
loadPlugin checks should use subcheck <== Done?
Does subcheck make sure it's an object?
Nested checking (make sure it's used everywhere)
How will developers know from the errors that the type name is supposed to be plural?
When is the sprite description used?
Finish the TODO descriptions

*/

Bagel = {
    init: (game) => {
        let internal = Bagel.internal; // A shortcut
        let subFunctions = Bagel.internal.subFunctions.init;

        internal.current.game = game;
        game = subFunctions.check(game);

        Bagel.internal.loadPlugin(Bagel.internal.plugin, game, {}); // Load the built in plugin

        subFunctions.misc(game);
        subFunctions.inputs(game, game.internal.renderer.canvas.addEventListener);
        subFunctions.scripts(game);
        subFunctions.plugins(game);
        subFunctions.assets(game);

        /*
        var i = 0;
        for (i in game.game.assets.imgs) {
            if (Bagel.internal.getTypeOf(game.game.assets.imgs[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define an asset.\nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(game.game.assets.imgs[i])) + " in ''GameJSON.game.assets.imgs' item '" + i + "'.");
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
                console.error("Oh no! You used an ID for an asset that is already being used. Try and think of something else.\nYou used " + JSON.stringify(game.game.assets.imgs[i].id) + " in 'GameJSON.game.assets.imgs item " + i + "'.");
                console.error("Bagel.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            if (game.game.assets.imgs[i].id.includes("Internal.")) {
                console.error("Oops! Looks like you tried to use the reserved asset starter. These just allow Bagel.js to load some of its own assets for things like GUI sprites.\nYou used " + JSON.stringify(game.game.assets.imgs[i].id) + " in 'GameJSON.game.assets.imgs item " + i + "'.");
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
                console.error("Oh no! You need to use the type 'object' to define an asset.\nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(game.game.assets.snds[i])) + " in ''GameJSON.game.assets.snds' item '" + i + "'.");
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
                console.error("Oh no! You used an ID for an asset that is already being used. Try and think of something else.\nYou used " + JSON.stringify(game.game.assets.snds[i].id) + " in 'GameJSON.game.assets.snds item " + i + "'.");
                console.error("Bagel.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            if (game.game.assets.snds[i].id.includes("Internal.")) {
                console.error("Oops! Looks like you tried to use the reserved asset starter. These just allow Bagel.js to load some of its own assets for things like GUI sprites.\nYou used " + JSON.stringify(game.game.assets.snds[i].id) + " in 'GameJSON.game.assets.snds item " + i + "'.");
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
        for (let i in game.game.sprites) { // TODO: Temporary
            let sprite = Bagel.internal.createSprite(game.game.sprites[i], game, false, "GameJSON.game.sprites item " + i, false, parseInt(i));
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

            subFunctions.check(game, plugin);

            // Combine all the plugins into one plugin
            let merge = subFunctions.merge;
            merge.types.assets(game, plugin);
            merge.types.sprites(game, plugin); // .width

            merge.methods.bagel(plugin);
            merge.methods.game(game, plugin);
            merge.methods.sprite(game, plugin);
        },
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
                            description: "Sounds can be played by anything. They're played using Game.playSound(<id>)",
                            check: (asset, game, check, standardChecks, plugin, index) => {
                                let error = standardChecks.id();
                                if (error) return error;
                                error = standardChecks.isInternal();
                                if (error) return error;
                            },
                            init: (asset, ready, game, plugin, index) => {
                                let snd = new Audio();
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
                                            sprite.internal.JSON[property] = value(me, game); // Avoid the setter
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
                                    }
                                }
                            },
                            description: "A basic type of sprite. Has the appearance of the image specified.",
                            check: (asset, game, check, standardChecks, plugin, index) => {

                            },
                            init: (args, game, plugin, index) => {

                            },
                            render: { // How do I render this type?
                                ctx: (sprite, ctx, canvas, game, plugin, scaleX, scaleY) => {
                                    sprite.angle = ((sprite.angle + 180) % 360) - 180; // Make sure it's in range
                                    ctx.globalAlpha = sprite.alpha;

                                    let flipX = sprite.width >= 0? 1 : -1;
                                    let flipY = sprite.height >= 0? 1 : -1;
                                    scaleX = scaleX * flipX;
                                    scaleY = scaleY * flipY;
                                    ctx.scale(scaleX, scaleY);

                                    let halfWidth = sprite.width / 2;
                                    let halfHeight = sprite.height / 2;
                                    if (sprite.angle == 90 && false) { // Don't rotate if we don't need to. TODO: test
                                        ctx.globalAlpha = sprite.alpha;
                                        ctx.drawImage(game.internal.assets.assets.imgs[sprite.img].img, sprite.x - halfWidth, sprite.y - halfHeight, sprite.width, sprite.height);
                                    }
                                    else { // TODO: fix
                                        let img = game.internal.assets.assets.imgs[sprite.img].img;
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
                    bagel: {},
                    game: {},
                    sprite: {
                        move: {
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
                                if (args.angle == null) {
                                    args.angle = me.angle;
                                }
                                let rad = Bagel.maths.degToRad(me.angle + 90);
                                me.x += Math.cos(rad) * args.amount;
                                me.y += Math.sin(rad) * args.amount;
                            }
                        }
                    }
                },
                scripts: {
                    init: [],
                    main: [],
                    steps: {}
                }
            }
        },

        subFunctions: {
            init: {
                check: (game) => {
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
                            types: {},
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
                                        types: ["object"],
                                        description: "The object that contains all the game scripts that aren't for a sprite."
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
                                                return "Oops! You used an invalid value in GameJSON.config.display.mode. You used " + ob.mode + ", it can only be either \"fill\" or \"static\".";
                                            }
                                        },
                                        checkEach: false,

                                        subcheck: {
                                            mode: {
                                                required: false,
                                                default: "fill",
                                                types: ["string"],
                                                description: "The display mode. e.g static (always the same size) or fill (fills the whole window)."
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
                    });

                    /*
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
                    */

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
                misc: (game) => {
                    game.loaded = false;
                    game.paused = false;
                    game.currentFPS = Bagel.config.fps;
                    game.currentRenderFPS = Bagel.config.fps;

                    game.internal.renderer.ctx = game.internal.renderer.canvas.getContext("2d");
                    game.internal.renderer.canvas.id = "Bagel.js " + game.id;

                    game.internal.renderer.ctx.imageSmoothingEnabled = false;
                    game.internal.renderer.canvas.width = game.width;
                    game.internal.renderer.canvas.height = game.height;
                    if (game.config.display.mode == "fill") {
                        game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); position: absolute; top:0; bottom: 0; left: 0; right: 0; margin: auto;"; // CSS from Phaser (https://phaser.io)
                        Bagel.internal.scaleCanvas(game);
                    }
                    else {
                        game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);" ;// CSS from Phaser (https://phaser.io)
                    }
                },
                checkScripts: (game, type) => {
                    let scripts = game.game.scripts[type];
                    let index = game.internal.scripts.index[type];

                    for (let i in scripts) {
                        let script = scripts[i];
                        if (Bagel.internal.getTypeOf(script) != "object") {
                            console.error("Oh no! You need to use the type \"object\" to define a script.\nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(script)) + " in GameJSON.game.scripts." + type + " item " + i + ".");
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
                    Bagel.internal.subFunctions.init.checkScripts(game, "init");
                    Bagel.internal.subFunctions.init.checkScripts(game, "main");
                },
                plugins: (game) => {
                    for (let i in game.game.plugins) {
                        let plugin = game.game.plugins[i];
                        Bagel.internal.loadPlugin(plugin, game);
                    }
                },
                assets: (game) => {
                    let allAssets = game.game.assets;
                    for (let type in allAssets) {
                        let assets = allAssets[type];

                        for (let i in assets) {
                            let asset = assets[i];
                            let error = Bagel.internal.loadAsset(asset, game, type, i);
                            if (error) return "error";
                        }
                    }
                }
            },
            loadPlugin: {
                check: (game, plugin) => {
                    Bagel.check({
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
                                                                default: null,
                                                                types: [
                                                                    "function",
                                                                    "undefined"
                                                                ],
                                                                description: "The handler function for the \"get\" method. Defaults to null. Most of the time you'll probably want to use this: \"(id, defaultFind, game, plugin, type) => defaultFind(id)\".\nThe function should return the asset specified by the arguments."
                                                            }
                                                        },
                                                        types: ["object"],
                                                        description: [
                                                            "Contains the name of the function and the function that gets the asset. e.g {",
                                                            "    name: \"img\",",
                                                            "    handler: (id, defaultFind, game, plugin, type) => defaultFind(id)",
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
                                                        description: "A function that does extra checks. Use return <error message> in the function to create an error." // TODO: arguments
                                                    },
                                                    init: {
                                                        required: false,
                                                        default: null,
                                                        types: ["function"],
                                                        description: "Initialises the sprite. Is a function. Can be used to define miscellaneous attributes."
                                                    },
                                                    render: {
                                                        required: false,
                                                        default: {},
                                                        subcheck: {
                                                            ctx: {
                                                                required: false,
                                                                default: null,
                                                                types: [
                                                                    "function",
                                                                    "undefined"
                                                                ],
                                                                description: "The ctx render function. Runs every frame."
                                                            },
                                                            webgl: {
                                                                required: false,
                                                                default: null,
                                                                types: [
                                                                    "function",
                                                                    "undefined"
                                                                ],
                                                                description: "The webgl render function. Runs every frame."
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
                                            bagel: { // TODO: check
                                                required: false,
                                                default: {},
                                                types: ["object"],
                                                description: "Contains framework functions. (Bagel.<function>...) The key is the name and the value is the function."
                                            },
                                            game: { // TODO: check
                                                required: false,
                                                default: {},
                                                types: ["object"],
                                                description: "Contains game functions. (Game.<function>...) The key is the name and the value is the function."
                                            },
                                            sprite: { // TODO: check
                                                required: false,
                                                default: {},
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
                            }
                        },
                        where: "plugin " + plugin.info.id
                    });
                },
                /*
                check: {
                    types: {
                        assets: (game, plugin) => {
                            for (let type in plugin.plugin.types.assets) {
                                let typeJSON = plugin.plugin.types.assets[type];
                                typeJSON = Bagel.check({
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
                                typeJSON.get = Bagel.check({
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
                            for (let type in plugin.plugin.types.sprites) {
                                let typeJSON = plugin.plugin.types.sprites[type];
                                typeJSON = Bagel.check({
                                    ob: typeJSON,
                                    where: "plugin " + plugin.info.id + ".plugin.types.sprites." + type,
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
                                            required: true,
                                            types: ["string"],
                                            description: "TODO"
                                        },
                                        check: {
                                            required: false,
                                            default: null,
                                            types: ["function"],
                                            description: "TODO"
                                        },
                                        init: {
                                            required: true,
                                            types: ["function"],
                                            description: "TODO"
                                        },
                                        internal: {
                                            required: false,
                                            default: null,
                                            types: ["function"],
                                            description: "TODO"
                                        },
                                        render: {
                                            required: false,
                                            default: {
                                                ctx: null,
                                                webgl: null
                                            },
                                            types: ["object"],
                                            description: "TODO"
                                        }
                                    },
                                    game: game
                                });
                            }
                        }
                    },
                    methods: (game, plugin) => {

                    },
                    spriteMethods: (game, plugin) => {
                        for (let i in plugin.plugin.spriteMethods) {

                        }
                    }
                },
                */
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

                                    let defaultFind = Bagel.internal.defaultFind;
                                    // Define the getter function. The function wrapping is so some data can be saved to the function that isn't shared between all of the functions
                                    ((newType, typeJSON) => {
                                        Bagel.get.asset[typeJSON.get.name] = (id) => {
                                            let current = Bagel.internal.current;
                                            let assetTypeWas = current.assetType;
                                            let assetTypeNameWas = current.assetTypeName;

                                            current.assetType = newType;
                                            current.assetTypeName = typeJSON.get.name;

                                            let output = typeJSON.get.handler(
                                                id,
                                                defaultFind,
                                                current.game,
                                                plugin,
                                                newType
                                            );

                                            current.assetType = assetTypeWas;
                                            current.assetTypeName = assetTypeNameWas;
                                            return output;
                                        };
                                    })(newType, typeJSON);
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
                    methods: {
                        bagel: (plugin) => {

                        },
                        game: (game, plugin) => {

                        },
                        sprite: (game, plugin) => {
                            let combined = game.internal.combinedPlugins;
                            let methods = plugin.plugin.methods.sprite;

                            for (let methodName in methods) {
                                let method = methods[methodName];
                                for (let i in method.appliesTo) {
                                    let spriteType = method.appliesTo[i];
                                    let merge = false;

                                    let combinedMethods = combined.methods.sprite;
                                    if (combinedMethods[spriteType] == null) {
                                        combinedMethods[spriteType] = {};
                                    }

                                    if (combinedMethods[spriteType][methodName] == null) {
                                        merge = true;
                                    }
                                    else {
                                        if (method.overwrite) {
                                            merge = true;
                                        }
                                        else {
                                            console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.id) + " tried to overwrite the " + JSON.stringify(methodName) + " method for the " + spriteType + " type without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older type definition, add this to the new type JSON: \"overwrite: true\".");
                                        }
                                    }
                                    if (merge) {
                                        // TODO: What locals are needed?
                                        combinedMethods[spriteType][methodName] = method;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            createSprite: {
                check: (sprite, game, parent, where) => {
                    let handler = game.internal.combinedPlugins.types.sprites[sprite.type];

                    if (parent) { // Clone
                        let clone = Bagel.internal.deepClone;

                        // Assign the parent's properties to the clone
                        for (let i in handler.cloneArgs) {
                            let argJSON = handler.cloneArgs[i];

                            if (argJSON.mode == "replace") {
                                if (! sprite.hasOwnProperty(i)) {
                                    if (! parent.clones.hasOwnProperty(i)) {
                                        sprite[i] = clone(parent[i]);
                                    }
                                    else {
                                        sprite[i] = clone(parent.clones[i]);
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
                    }
                    // TODO: run the other checks
                    const typeSyntax = {
                        type: {
                            required: true,
                            types: ["string"],
                            description: "The type of sprite."
                        }
                    };
                    let banana = Bagel.check({
                        ob: sprite,
                        where: where,
                        syntax: {
                            ...(parent? handler.internal.cloneSyntax : handler.args),
                            ...typeSyntax
                        }
                    });
                    return banana;
                },
                register: {
                    scripts: (type, sprite, game, parent) => {
                        let scripts = sprite.scripts[type];
                        let scriptIndex = game.internal.scripts.index.sprites[type];
                        let state;

                        for (let i in scripts) {
                            if (parent) { // Clone
                                state = game.state;
                            }
                            else {
                                state = scripts[i].stateToRun;
                            }

                            scriptIndex[state] = scriptIndex[state]? scriptIndex[state] : [];

                            scriptIndex[state].push({
                                script: i,
                                sprite: sprite,
                                isClone: (! parent)
                            });

                            sprite.internal.scripts[type].push({
                                id: scriptIndex[state].length - 1,
                                state: state
                            });
                        }
                    },
                    values: (sprite, game, parent) => {
                        let handler = game.internal.combinedPlugins.values;

                        // TODO: How should this work?

                        //for (let i in )
                    },
                    methods: (sprite, game, parent) => {
                        let handler = game.internal.combinedPlugins.methods.sprite[sprite.type];
                        if (handler == null) return;

                        for (let methodName in handler) {
                            let method = handler[methodName];
                            // TODO: Can functions overwrite values?

                            if (method.obArg) {
                                ((method, sprite, game) => {
                                    sprite[methodName] = (args) => {
                                        if (args == null) {
                                            console.error("Oops, this function takes one argument: an object. You didn't give any arguments.");
                                            Bagel.internal.oops(game);
                                        }
                                        if (Bagel.internal.getTypeOf(args) != "object") {
                                            console.error("Huh, looks like you used " + Bagel.internal.an(Bagel.internal.getTypeOf(args)) + " instead of an object.");
                                            Bagel.internal.oops(game);
                                        }

                                        Bagel.check({
                                            ob: args,
                                            syntax: method.args,
                                            where: "the sprite " + sprite.id + "'s " + JSON.stringify(methodName) + " method"
                                        });
                                        method.fn(sprite, newArgs, game); // Passed the argument checks
                                    };
                                })(method, sprite, game);
                            }
                            else {
                                ((method, sprite, game) => {
                                    sprite[methodName] = (...args) => {
                                        let keys = Object.keys(method.args);
                                        let newArgs = {};

                                        // Convert the array to an object using the keys
                                        for (let i in args) {
                                            if (keys[i] == null) {
                                                keys[i] = "Your " + Bagel.internal.th(parseInt(i)) + " argument";
                                            }
                                            newArgs[keys[i]] = args[i];
                                        }

                                        Bagel.check({
                                            ob: newArgs,
                                            syntax: method.args,
                                            where: "the sprite " + sprite.id + "'s " + JSON.stringify(methodName) + " method"
                                        });
                                        return method.fn(sprite, newArgs, game); // Passed the argument checks
                                    };
                                })(method, sprite, game);
                            }
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
                                            handlers.get(sprite.internal.properties, property, game, plugin, sprite);
                                        }
                                        return sprite.internal.properties[property];
                                    },
                                    set: (value) => {
                                        sprite.internal.properties[property] = value;
                                        if (handlers.set != null) {
                                            handlers.set(sprite.internal.properties, value, property, game, plugin, sprite);
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
                },
                render: game => {
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
                },
                tick: () => {
                    Bagel.internal.requestAnimationFrame.call(window, Bagel.internal.tick);
                }
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
                    me.parent.cloneCount--;
                    me.parent.cloneIDs[me.parent.cloneIDs.indexOf(me.id)] = null;
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
                    let asset = Bagel.internal.current.asset;
                    let type = Bagel.internal.current.assetType;
                    id = id == null? "id" : id;
                    isInternal = isInternal == null? "isInternal" : isInternal;


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
            if (id == null) {
                console.error("Huh, looks like you forgot the \"id\" argument for the \"defaultFind\" function.");
                Bagel.internal.oops(Bagel.internal.current.game);
            }
            let current = Bagel.internal.current;
            let assets = current.game.internal.assets.assets[current.assetType];

            if (assets[id] == null) { // Invalid id
                console.error("Oops. That asset doesn't exist. You tried to get the asset with the id " + JSON.stringify(id) + ".");
                Bagel.internal.oops(Bagel.internal.current.game);
            }

            return assets[id][current.assetTypeName];
        },

        loadAsset: (asset, game, type, i) => {
            let current = Bagel.internal.current;
            current.asset = asset;
            current.assetType = type;

            let assetLoader = game.internal.combinedPlugins.types.assets[type];
            let plugin = assetLoader.internal.plugin;

            if (game.internal.assets.assets[type] == null) {
                game.internal.assets.assets[type] = {};
            }

            Bagel.check({
                ob: asset,
                where: "GameJSON.game.assets." + type + " item " + i,
                syntax: assetLoader.args
            }); // TODO
            let error = assetLoader.check(asset, game, Bagel.internal.check, Bagel.internal.standardChecks.asset, plugin, i);
            if (error) {
                current.asset = null;
                current.assetType = null;

                console.error(error);
                console.log("In plugin " + JSON.stringify(plugin.info.id) + ".");
                Bagel.internal.oops(game);
            }

            let loaded = (asset) => {
                let assets = game.internal.assets;
                assets.assets[type][game.game.assets[type][i].id] = asset;
                assets.loaded++;
                assets.loading--;
                if (assets.loading == 0) {
                    game.loaded = true;
                }
            }
            let assetOb = assetLoader.init(asset, loaded, game, assetLoader.internal.plugin, i);

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

        th: (num) => (num + 1) + ["st", "nd", "rd", "th", "th", "th", "th", "th", "th"][parseInt(num.toString()[num.toString().length - 1])], // TODO: 10s not working
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
            assetTypeName: null
        },
        findCloneID: function(sprite, game) {
            for (let i in sprite.cloneIDs) {
                if (sprite.cloneIDs[i] == null) {
                    return i;
                }
            }
            return sprite.cloneIDs.length;
        },
        findSpriteID: function(game) {
            for (let i in game.game.sprites) {
                if (game.game.sprites[i] == null) {
                    return parseInt(i);
                }
            }
            return game.game.sprites.length;
        },
        checkClones: function(spriteData, data, game, parent) {
            console.log("A")
            if (data.type == null) {
                let type = parent.type;
            }
            else {
                let type = data.type;
            }
            if (type == "sprite") {
                let sprite = Bagel.internal.checkOb(spriteData, {}, {
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
                        description: "The default data for a clone of this clone.\nAll arguments are optional as the child clone will adopt the arguments from the clone function and the parent clone (in that priority)"
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
                    let sprite = Bagel.internal.checkOb(spriteData, {}, {
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
                            description: "The default data for a clone of this canvas sprite.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
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
                            description: "The type of the sprite (the built in types are: sprite, canvas and renderer)."
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
                        let sprite = Bagel.internal.checkOb(spriteData, {}, {
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
                                description: "The default data for a clone of this renderer.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
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
                        console.error("Oh no! Looks like you used an invalid type for a clone.\nYou used " + JSON.stringify(type) + " in \"GameJSON.game.sprites\" item \"type\". While cloning the sprite " + JSON.stringify(parent.id) + ".");
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

            for (let c in sprite.scripts.init) {
                if (Bagel.internal.getTypeOf(sprite.scripts.init[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of init scripts.\nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(sprite.scripts.init[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    //console.log(sprite.scripts.init[c])
                    console.error("Bagel.js hit a critical error, look at the error above for more information.")
                    debugger
                    // TODO: Clearer error
                }
            }
            for (c in sprite.scripts.main) {
                if (Bagel.internal.getTypeOf(sprite.scripts.main[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of main scripts.\nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(sprite.scripts.main[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    //console.log(sprite.scripts.main[c])
                    console.error("Bagel.js hit a critical error, look at the error above for more information.")
                    debugger
                    // TODO: Clearer error
                }
            }
        },
        createSprite: (sprite, game, parent, where, noCheck, idIndex) => {
            let subFunctions = Bagel.internal.subFunctions.createSprite;

            // TODO: current.game is changed somewhere in here

            if (! noCheck) {
                sprite.type = sprite.type == null? game.internal.combinedPlugins.defaults.sprites.type : sprite.type; // If the sprite type isn't specified, default to default agreed by the plugins
                sprite = subFunctions.check(sprite, game, parent, where); // TODO: it's changed here
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
            register.values(sprite, game, parent);
            register.methods(sprite, game, parent);
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
                    let game = me.game;
                    let remove = Bagel.internal.subFunctions.delete;

                    remove.layers(me, game);
                    remove.scripts("init", me, game);
                    remove.scripts("main", me, game);
                    remove.misc(me, game);
                };
            })(sprite);

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
                    if (game.internal.scripts.index.sprites.init[game.state] == null) {
                        game.internal.scripts.index.sprites.init[game.state] = [];
                    }

                    var scriptID = game.internal.scripts.index.sprites.init[game.state].length;
                    game.internal.scripts.index.sprites.init[game.state].push({
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
                    if (game.internal.scripts.index.sprites.main[game.state] == null) {
                        game.internal.scripts.index.sprites.main[game.state] = [];
                    }

                    var scriptID = game.internal.scripts.index.sprites.main[game.state].length;
                    game.internal.scripts.index.sprites.main[game.state].push({
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
                            description: "The default data for a clone of this sprite.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
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
                                description: "The default data for a clone of this canvas sprite.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
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
                                    description: "The default data for a clone of this renderer.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
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
                                console.error("Oops, you used an invalid option. It can only be either \"high\" or \"low\".\nYou used " + JSON.stringify(sprite.order) + " in 'GameJSON.game.sprites item' " + data.idIndex + " -> order.");
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
                            console.error("Oh no! You used an invalid type for a sprite.\nYou used " + JSON.stringify(sprite.type) + " in 'GameJSON.game.sprites item' " + data.idIndex + ".");
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
                    console.error("Oh no! You used an ID for a sprite that is already being used. Try and think of something else.\nYou used " + JSON.stringify(sprite.id) + " in 'GameJSON.game.sprites item' " + data.idIndex + ".")
                    Bagel.internal.oops(game);
                }
                if (! data.isInternal) {
                    if (sprite.id.includes("Internal.")) {
                        console.error("Oops! Looks like you tried to use the reserved asset starter. These just allow Bagel.js to load some of its own assets for things like GUI sprites.\nYou used " + JSON.stringify(sprite.id) + " in 'GameJSON.game.sprites item " + data.idIndex + "'.")
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
                            for (i in parentsprite.internal.internal.cloneIDs) {
                                if (parentsprite.internal.internal.cloneIDs[i] == null) {
                                    continue;
                                }
                                var clone = game.game.sprites[parentsprite.internal.internal.cloneIDs[i]];
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
                        console.error("Oh no! You need to use the type 'object' to define a script.\nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(game.game.sprites[data.i].scripts.init[c])) + " in ''GameJSON.game.game.sprites' item " + c + " -> scripts.init.");
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

                    if (game.internal.scripts.index.sprites.init[scripts[c].stateToRun] == null) {
                        game.internal.scripts.index.sprites.init[scripts[c].stateToRun] = [];
                    }

                    var scriptID = game.internal.scripts.index.sprites.init[scripts[c].stateToRun].length;
                    game.internal.scripts.index.sprites.init[scripts[c].stateToRun].push({
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
                        console.error("Oh no! You need to use the type 'object' to define a script.\nYou used type " + JSON.stringify(Bagel.internal.getTypeOf(game.game.sprites[data.i].scripts.main[c])) + " in ''GameJSON.game.game.sprites' item " + c + " -> scripts.main.");
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
                    if (game.internal.scripts.index.sprites.main[scripts[c].stateToRun] == null) {
                        game.internal.scripts.index.sprites.main[scripts[c].stateToRun] = [];
                    }

                    var scriptID = game.internal.scripts.index.sprites.main[scripts[c].stateToRun].length;
                    game.internal.scripts.index.sprites.main[scripts[c].stateToRun].push({
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
                    message.push("Oops, looks like you missed this one out from " + JSON.stringify(where) + ": ^-^\n\n");
                }
                else {
                    message.push("Hmm, looks like you missed these in " + JSON.stringify(where) + ": ^-^\n\n");
                }

                var i = 0;
                for (i in missing) {
                    message.push(" " + missing[i] + " -> " + required[missing[i]].description + "\n");
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
                            message.push(" " + c + " -> " + required[c].description + "\n You used the type " + JSON.stringify(Bagel.internal.getTypeOf(ob[c])) + ", it has to be one of these types:\n");
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
                            message.push(" • " + c + " -> " + optional[c].description + "\n You used the type " + JSON.stringify(Bagel.internal.getTypeOf(ob[c])) + ", it has to be one of these types:\n");
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
                    message.push("\n\nTip: You can disable these sorts of warnings by changing the \"warnOfUselessParameters\" flag.\nUse: \"Bagel.config.flags.warnOfUselessParameters = false\" :).");
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
        tick: () => {
            let subFunctions = Bagel.internal.subFunctions.tick;

            let totalStart = new Date();
            for (let i in Bagel.internal.games) {
                let game = Bagel.internal.games[i];
                Bagel.internal.current.game = game;

                Bagel.internal.scaleCanvas(game);
                if (game.internal.assets.loading == 0) { // game.loading?
                    if (game.state != game.internal.lastState) {
                        // TODO: delete clones
                        subFunctions.scripts("init", true, game);
                        subFunctions.scripts("init", false, game);
                        game.internal.lastState = game.state;
                    }

                    subFunctions.scripts("main", true, game);
                    subFunctions.scripts("main", false, game);
                    subFunctions.render(game);
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
            setTimeout(subFunctions.tick, (1000 / Bagel.config.fps) - total);
        },
        scripts: (game) => {
            if (game.internal.lastState != game.state) {
                for (let i in game.game.sprites) {
                    let sprite = game.game.sprites[i];
                    sprite.visible = false;
                }

                // TODO: Delete clones

                Bagel.internal.current.sprite = null;
                for (i in game.internal.scripts.index.init[game.state]) {
                    let script = game.game.scripts.init[game.internal.scripts.index.init[game.state][i]];
                    script.code(game);
                }
                for (i in game.internal.scripts.index.sprites.init[game.state]) {
                    let sprite = game.internal.scripts.index.sprites.init[game.state][i].sprite;
                    Bagel.internal.current.sprite = game.game.sprites[game.internal.idIndex[sprite.id]]; // What if it's null?
                    let script = sprite.scripts.init[game.internal.scripts.index.sprites.init[game.state][i].script];

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
            let i = 0;
            for (i in game.internal.scripts.index.main[game.state]) {
                let script = game.game.scripts.main[game.internal.scripts.index.main[game.state][i]];
                script.code(game);
            }
            if (game.internal.scripts.index.sprites.main[game.state] != null) {
                let i = 0;
                while (i < game.internal.scripts.index.sprites.main[game.state].length) {
                    let start = new Date();

                    let sprite = game.internal.scripts.index.sprites.main[game.state][i].sprite;
                    Bagel.internal.current.sprite = game.game.sprites[game.internal.idIndex[sprite.id]]; // What if it's null?

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

                    let idWas = sprite.id;
                    if (game.internal.scripts.index.sprites.main[game.state][i].isClone) {
                        Bagel.internal.current.sprite = sprite;
                        sprite.scripts.main[game.internal.scripts.index.sprites.main[game.state][i].script](game, sprite, Bagel.step);
                    }
                    else {
                        let script = sprite.scripts.main[game.internal.scripts.index.sprites.main[game.state][i].script];
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
            if (canvas.width != width || canvas.height != height || true) {
                canvas.width = width;
                canvas.height = height;

                canvas.style.removeProperty("width");
                canvas.style.setProperty("width", (width / window.devicePixelRatio) + "px", "important");
                canvas.style.removeProperty("height");
                canvas.style.setProperty("height", (height / window.devicePixelRatio) + "px", "important");

                renderer.ctx.imageSmoothingEnabled = false; // It's reset when the canvas is resized
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
                canvas: (game, canvas, ctx, renderer) => {
                    let newWidth = window.innerWidth;
                    let newHeight = window.innerHeight;
                    let ratio = game.width / game.height;
                    if (newWidth > newHeight * ratio) {
                        let newWidth = newHeight * ratio;
                    }
                    else {
                        let newHeight = newWidth / ratio;
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

                    let renderRenderers = (order) => {
                        Bagel.internal.current.game = game;
                        for (let i in game.internal.renderer.renderers[order]) {
                            let start = new Date();

                            let customRenderer = game.internal.renderer.renderers[order][i];
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


                    for (let i in game.internal.renderer.layers) {
                        let start = new Date();

                        let sprite = game.game.sprites[game.internal.renderer.layers[i]];
                        if (sprite == null) {
                            continue;
                        }

                        if (sprite.type == "canvas" && sprite.customRes) {
                            let x = sprite.x - (sprite.width / 2);
                            let y = sprite.y - (sprite.height / 2);

                            let scaled = {
                                x: Bagel.internal.render.scale.x(x, renderer, canvas),
                                y: Bagel.internal.render.scale.y(y, renderer, canvas),
                                width: sprite.canvas.width,
                                height: sprite.canvas.height
                            };
                        }
                        else {
                            if (sprite.type == "canvas") {
                                let x = sprite.x - ((sprite.width / sprite.res) / 2);
                                let y = sprite.y - ((sprite.height / sprite.res) / 2);
                            }
                            else {
                                let x = sprite.x - (sprite.width / 2);
                                let y = sprite.y - (sprite.height / 2);
                            }


                            let scaled = {
                                x: Bagel.internal.render.scale.x(x, renderer, canvas),
                                y: Bagel.internal.render.scale.y(y, renderer, canvas),
                                width: Bagel.internal.render.scale.width(sprite.width, renderer, canvas),
                                height: Bagel.internal.render.scale.height(sprite.height, renderer, canvas)
                            };
                        }
                        if (sprite.visible) {
                            let flip = [];
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

                            let checkIsNum = (property, suffixWord, sprite) => {
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
        deepClone: (entity) => {
            if (typeof entity != "object") { // Includes arrays
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
        }
    },
    // == Methods ==

    check: (args, disableChecks, where, logObject) => {
        // TODO: is where needed?
        if (! (disableChecks || args.prev)) { // TODO: allow subcheck, check etc. arguments
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
            }, true, null, true);
        }
        if (! args.hasOwnProperty("game")) {
            args.game = Bagel.internal.current.game;
        }

        let output = Bagel.internal.debug;

        let useless = [];
        let missing = [];
        let wrongTypes = [];

        let extraChecks = [];

        for (let argID in {...args.ob, ...args.syntax}) {
            let syntax = args.syntax[argID];
            let arg = args.ob[argID];

            if (syntax == null) {
                useless.push(argID);
                continue;
            }
            if (syntax == "ignore") {
                continue;
            }

            let defaulted = false;
            if (syntax.required) {
                if (! args.ob.hasOwnProperty(argID)) {
                    missing.push(argID);
                }
            }
            else {
                if (! args.ob.hasOwnProperty(argID)) {
                    args.ob[argID] = syntax.default;
                    arg = args.ob[argID];
                    defaulted = true;
                }
            }
            if ((! defaulted) && missing.length == 0) {
                if (syntax.types == null) {
                    console.error("The syntax for " + args.where + "." + argID + " is missing the \"types\" argument.");
                    console.log("In " + args.where + ".");
                    console.log("Object:");
                    console.log(args.ob);
                    Bagel.internal.oops(args.game);
                }
                if (! ["array", "string"].includes(Bagel.internal.getTypeOf(syntax.types))) {
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
                if (syntax.subcheck) {
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
                                Bagel.internal.oops(args.game);
                            }
                        }
                    }
                    else {
                        let error = syntax.check(args.ob[argID], args.ob, argID, args.game, args.prev);
                        if (error) {
                            console.error(error);
                            console.log("In " + args.where + "." + argID + ".");
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
        sprite: (id, game) => {
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
                // TODO: Review error
                console.error("Ah, a problem occured while getting a sprite. There's no sprite with the ID " + JSON.stringify(id) + ".");
                Bagel.internal.oops(game);
                return;
            }
            return game.game.sprites[game.internal.idIndex[id]];
        }
    },
    /*
    playSound: (id) => {
            // TODO: Test for game
            // TODO: Test for ID
            // TODO: game.methods.playSound

            let game = Bagel.internal.current.game;


            if (Bagel.internal.autoPlay) {
                game.internal.assets.assets.snds[id].snd.play();
            }
            else {
                game.internal.soundsToPlay.push(id);
            }
        },
    */
    maths: {
            radToDeg: (rad) => (rad * 180) / Math.PI,
            degToRad: (deg) => deg * (Math.PI / 180),
            getDirection: (x1, y1, x2, y2) => Bagel.maths.radToDeg(Math.atan2(y2 - y1, x2 - x1)) - 90, // gist.github.com/conorbuck/2606166
            getDistance: (x1, y1, x2, y2) => Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2)) // a2 + b2 = c2
        },
    step: (id) => {
            // TODO: Error if it's outside of a game or sprite

            let game = Bagel.internal.current.game;
            let me = Bagel.internal.current.sprite;

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
