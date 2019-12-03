// TODO:
// == Important ==
// Optimise rendering circles. Maybe render at a high resolution once and then scale down?

// .debug.avg.renderTime and scriptTime

// Fix layering issue (remove tmplayers)
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

// == Credits ==
// Images:
// Back icon -> https://www.flaticon.com/authors/itim2101
// Cross icon -> https://www.flaticon.com/authors/srip
// Sounds:
// Button click and hover sounds: https://scratch.mit.edu/projects/42854414/
// Woosh: https://freesound.org/people/qubodup/sounds/60013/

debug = console.log; // TODO. Only for development. Use instead of console.log

BeginningJS = {
    init: function(gameJSON) {
        if (typeof gameJSON != "object") {
            console.error("Oh no! Your game JSON appears to be the wrong type. It must be the type \"object\", you used " + JSON.stringify(gameJSON) + ".");
            BeginningJS.internal.oops(gameJSON, true, true);
        }
        if (gameJSON.ID == null) {
            console.error("Oh no! You forgot to specifiy an ID for the game.");
            BeginningJS.internal.oops(gameJSON, true, true);
        }
        if (document.getElementById(gameJSON.htmlElementID) == null && gameJSON.htmlElementID != null) { // Make sure the element exists
            console.error("Oops, you specified the element to add the game canvas to but it doesn't seem to exist. \nThis is specified in \"GameJSON.htmlElementID\" and is set to " + JSON.stringify(gameJSON.htmlElementID) + ". You might want to check that the HTML that creates the element is before your JavaScript.");
            BeginningJS.internal.oops(gameJSON, false, true);
        }


        var game = BeginningJS.internal.checkOb(gameJSON, {
            ID: {
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
        BeginningJS.internal.current.game = game;

        game.config = BeginningJS.internal.checkOb(game.config, {}, {
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
        game.config.display = BeginningJS.internal.checkOb(game.config.display, {}, {
            fillScreen: {
                default: false,
                types: [
                    "boolean"
                ],
                description: "Determines if the game will be upscaled to fit the screen."
            }
        }, "GameJSON.config", "GameJSON.config.display", game, false, true);
        game.game = BeginningJS.internal.checkOb(game.game, {}, {
            assets: {
                default: {
                    imgs: [],
                    snds: []
                },
                types: ["object"],
                description: "The object that contains all the assets to be loaded for the game."
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
        game.game.assets = BeginningJS.internal.checkOb(game.game.assets, {
            imgs: {
                types: ["array"],
                description: "The array that contains all the images to be loaded for the game."
            },
            snds: {
                types: ["array"],
                description: "The array that contains all the images to be loaded for the game."
            }
        }, {
            defaults: {
                default: [],
                types: ["array"],
                description: "Structured in the same way as GameJSON.assets.imgs/snds but you have to use specific names. To get these names, add an asset how you would normally."
            }
        }, "GameJSON.game.assets", "GameJSON.game.assets", game, false, true);
        game.game.scripts = BeginningJS.internal.checkOb(game.game.scripts, {}, {
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
        game.state = game.config.state;
        game.loaded = false;
        game.paused = false;


        if (BeginningJS.internal.games.hasOwnProperty(game.ID)) {
            console.error("Oh no! You used an ID for your game that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.ID) + " in \"GameJSON.htmlElementID\".");
            BeginningJS.internal.oops(game, false, true);
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
                }
            },
            ids: [],
            IDIndex: {},
            FPSFrames: 0,
            lastFPSUpdate: new Date(),
            loadedDelay: 0,
            soundsToPlay: [],
        };
        /*
        game.internal.renderer.layers = new Proxy(game.internal.renderer.tmplayers, {
            get: (ob, property) => {
                console.groupCollapsed("Got " + property);
                console.trace();
                console.groupEnd();
                return game.internal.renderer.tmplayers[property];
            },
            set: (ob, property, value) => {
                console.groupCollapsed("Set " + property + " to " + value);
                console.trace();
                console.groupEnd();
                game.internal.renderer.tmplayers[property] = value;
                return true;
            }
        });
        */

        game.internal.collision = {
            "tick": function(game) {
                // Was originally used for QTrees. Currently not used for anything.
            }
        };
        game.input = {
            "touches": [],
            "mouse": {
                "down": false,
                "x": 0,
                "y": 0
            },
            "keys": {
                "isDown": function(keyCode) {
                    if (this.internal.game.input.keys.keys[keyCode]) {
                        return true;
                    }
                    return false;
                },
                "keys": {},
                "internal": {
                    "game": game
                }
            },
            "lookup": {
                "left": 37,
                "right": 39,
                "up": 38,
                "down": 40,
                "space": 32,
                "w": 87,
                "a": 65,
                "s": 83,
                "d": 68
            },
            "joysticks": {}
        };

        game.currentFPS = BeginningJS.config.fps;
        game.currentRenderFPS = BeginningJS.config.fps;
        game.methods = {
            "gui": {
                "create": {
                    "background": {
                        "modern": function(configInput) {
                            var config = configInput;

                            var game = this.internal.game;

                            if (config == null) {
                                console.error("Oops, looks like you've forgotten the input in the function Game.methods.gui.create.text.modern. It should be type \"object\". ");
                                BeginningJS.internal.oops(game);
                            }
                            if (BeginningJS.internal.getTypeOf(config) != "object") {
                                console.error("Oops, looks like you've put the wrong input type in for this function. It should be \"object\". You used " + JSON.stringify(BeginningJS.internal.getTypeOf(config)) + "in the function Game.methods.gui.create.text.modern.");
                                BeginningJS.internal.oops(game);
                            }

                            config = BeginningJS.internal.checkOb(config, {
                                type: {
                                    types: ["string"],
                                    description: "The type of background to be created. ('rounded')"
                                }
                            }, {
                                fill: {
                                    types: ["string"],
                                    description: "The fill colour of the background. (HTML colour e.g hex, rgb(), etc)"
                                },
                                submenu: {
                                    types: ["string"],
                                    description: "The submenu name that the background will show in."
                                },
                                animation: {
                                    types: ["object"],
                                    description: "A bunch of options for animating the background."
                                }
                            }, "the function Game.methods.gui.create.background.modern", "function Game.methods.gui.create.background.modern arguments", game);

                            game.methods.gui.internal.createIndex(config);


                            BeginningJS.internal.load.snd({
                                "id": "Internal.GUI.background.modern.woosh",
                                "src": "../assets/snds/woosh.mp3" // TODO data url
                            }, game);

                            if (config.type == "rounded") {
                                config = BeginningJS.internal.checkOb(config, {
                                    type: {
                                        types: ["string"],
                                        description: "The type of button to be created. ('cross', 'custom')"
                                    },
                                    fill: {
                                        types: ["string"],
                                        description: "The fill colour of the background. (HTML colour e.g hex, rgb(), etc)"
                                    },
                                    submenu: {
                                        types: ["string"],
                                        description: "The submenu name that the background will show in."
                                    }
                                }, {
                                    animation: {
                                        types: ["object"],
                                        description: "A bunch of options for animating the background.",
                                        default: {
                                            animate: false,
                                            type: "slowing glide"
                                        }
                                    }
                                }, "the function Game.methods.gui.create.background.modern", "function Game.methods.gui.create.background.modern argumets", game);
                                config.animation = BeginningJS.internal.checkOb(config.animation, {
                                    animate: {
                                        types: ["boolean"],
                                        description: "Whether or not animation of the background should be enabled."
                                    },
                                    type: {
                                        types: ["string"],
                                        description: "The type of animation to be used ('slowing glide')."
                                    }
                                }, {
                                    speed: {
                                        types: ["number"],
                                        description: "The speed of the animation.",
                                        default: 2
                                    }
                                }, "the function Game.methods.gui.create.background.modern", "function Game.methods.gui.create.background.modern argument \"animation\"");

                                var i = 0;
                                while (game.internal.IDIndex["Internal.GUI.modern.background#" + i] != null) {
                                    i++;
                                }
                                var backgroundID = "Internal.GUI.modern.background#" + i;

                                var sprite = {
                                    "type": "canvas",
                                    "customRes": true,
                                    "x": game.width / 2,
                                    "y": game.height / 2,
                                    "visible": false,
                                    "vars": {
                                        "config": config,
                                        "leaveAnimation": false
                                    },
                                    "scripts": {
                                        "init": [
                                            {
                                                "code": function(gameRef, me) {
                                                    me.vars.render = function() {
                                                        if (me.vars.config.animation.animate) {
                                                            if (me.vars.leaveAnimation) {
                                                                if (me.vars.config.animation.type.toLowerCase() == "slowing glide") {
                                                                    me.y += ((gameRef.height + me.height) - me.y) / (10 / me.vars.config.animation.speed)
                                                                    if (me.y - (me.height / 2) > gameRef.height) {
                                                                        me.vars.leaveAnimation = false
                                                                        me.visible = false
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                me.y += ((gameRef.height / 2) - me.y) / (10 / me.vars.config.animation.speed)
                                                            }
                                                        }

                                                        var ctx = me.ctx
                                                        var canvas = me.canvas
                                                        canvas.width = me.scaled.width
                                                        canvas.height = me.scaled.height
                                                        ctx.clearRect(0, 0, canvas.width, canvas.height)

                                                        var radius = me.scale.x(50)

                                                        ctx.lineWidth = radius
                                                        ctx.lineCap = "round"
                                                        ctx.fillStyle = me.vars.config.fill
                                                        ctx.strokeStyle = me.vars.config.fill


                                                        ctx.beginPath()
                                                        ctx.moveTo(radius / 2, radius / 2)
                                                        ctx.lineTo(canvas.width - (radius / 2), radius / 2)
                                                        ctx.stroke()
                                                        ctx.beginPath()
                                                        ctx.moveTo(canvas.width - (radius / 2), radius / 2)
                                                        ctx.lineTo(canvas.width - (radius / 2), canvas.height - (radius / 2))
                                                        ctx.stroke()
                                                        ctx.beginPath()
                                                        ctx.moveTo(canvas.width - (radius / 2), canvas.height - (radius / 2))
                                                        ctx.lineTo(radius / 2, canvas.height - (radius / 2))
                                                        ctx.stroke()
                                                        ctx.beginPath()
                                                        ctx.moveTo(radius / 2, canvas.height - (radius / 2))
                                                        ctx.lineTo(radius / 2, radius / 2)
                                                        ctx.stroke()
                                                        ctx.fillRect(radius - 1, radius - 1, (canvas.width - (radius * 2)) + 2, (canvas.height - (radius * 2)) + 2)

                                                        me.bringForwards()
                                                    }
                                                    me.vars.render()
                                                },
                                                "stateToRun": game.state
                                            }
                                        ],
                                        "main": [
                                            {
                                                "code": function(gameRef, me) {
                                                    var indexSprite = BeginningJS.methods.get.sprite("Internal.GUI.menu.index")
                                                    if (me.vars.config.submenu == indexSprite.vars.submenu) {
                                                        if (! me.visible) {
                                                            me.visible = true

                                                            if (me.vars.config.animation.animate) {
                                                                me.y = gameRef.height + (me.height / 2)
                                                                BeginningJS.methods.playSound("Internal.GUI.background.modern.woosh")
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        if (me.visible && (! me.vars.leaveAnimation)) {
                                                            if (me.vars.config.animation.animate) {
                                                                me.vars.leaveAnimation = true
                                                            }
                                                            else {
                                                                me.visible = false
                                                            }
                                                        }
                                                    }
                                                    if (me.visible) {
                                                        me.vars.render()
                                                    }
                                                },
                                                "stateToRun": game.state
                                            }
                                        ]
                                    },
                                    "clones": {},
                                    "width": game.width * 0.9,
                                    "height": game.height * 0.9,
                                    "id": backgroundID
                                };
                                game.game.sprites.push(sprite);
                                BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.elements.push(sprite);

                                BeginningJS.internal.createSprite({
                                    isClone: false,
                                    idIndex: game.game.sprites.length - 1,
                                    runScripts: true,
                                    isInternal: true
                                }, sprite, game, game.game.sprites.length - 1);
                            }
                        },
                        "internal": {
                            "game": game
                        }
                    },
                    "text": {
                        "modern":  function(configInput) {
                            var config = configInput;

                            var game = this.internal.game;

                            if (config == null) {
                                console.error("Oops, looks like you've forgotten the input in the function Game.methods.gui.create.text.modern. It should be type \"object\". ");
                                BeginningJS.oops(game);
                            }
                            if (BeginningJS.internal.getTypeOf(config) != "object") {
                                console.error("Oops, looks like you've put the wrong input type in for this function. It should be \"object\". You used " + JSON.stringify(BeginningJS.internal.getTypeOf(config)) + "in the function Game.methods.gui.create.text.modern.");
                                BeginningJS.oops(game);
                            }

                            config = BeginningJS.internal.checkOb(config, {
                                centred: {
                                    types: ["boolean"],
                                    description: "Specifies whether or not the text should be centred."
                                },
                                fill: {
                                    types: ["string"],
                                    description: "The fill colour of the text. (HTML colour e.g hex, rgb(), etc)"
                                },
                                submenu: {
                                    types: ["string"],
                                    description: "The submenu name that the text will show in."
                                },
                                x: {
                                    types: ["number"],
                                    description: "The (sometimes relative) x position of the text."
                                },
                                y: {
                                    types: ["number"],
                                    description: "The (sometimes relative) y position of the text."
                                },
                                text: {
                                    types: ["string"],
                                    description: "The text of the text element."
                                }
                            }, {
                                font: {
                                    types: ["string"],
                                    description: "The font of the text (e.g 'Helevetica').",
                                    default: "Helevetica"
                                },
                                size: {
                                    types: ["number"],
                                    description: "The size of the characters (e.g '20' pixels).",
                                    default: 20
                                },
                                animation: {
                                    types: ["object"],
                                    description: "A bunch of options for animating the text.",
                                    default: {
                                        animate: false,
                                        type: "slowing glide"
                                    }
                                }
                            }, "the function Game.methods.gui.create.text.modern", "function Game.methods.gui.create.text.modern arguments", game);
                            config.animation = BeginningJS.internal.checkOb(config.animation, {
                                animate: {
                                    types: ["boolean"],
                                    description: "Whether or not animation of the button should be enabled."
                                },
                                type: {
                                    types: ["string"],
                                    description: "The type of animation to be used ('slowing glide')."
                                }
                            }, {
                                speed: {
                                    types: ["number"],
                                    description: "The speed of the animation.",
                                    default: 1
                                }
                            }, "the function Game.methods.gui.create.text.modern", "function Game.methods.gui.create.text.modern argument \"animation\"");

                            game.methods.gui.internal.createIndex(config);

                            var i = 0;
                            while (game.internal.IDIndex["Internal.GUI.modern.text#" + i] != null) {
                                i++;
                            }
                            var textID = "Internal.GUI.modern.text#" + i;

                            var sprite = {
                                "type": "canvas",
                                "customRes": true,
                                "x": config.x,
                                "y": config.y,
                                "visible": BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.submenu == config.submenu,
                                "vars": {
                                    "config": config,
                                    "leaveAnimation": false,
                                    "lastSubmenu": BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.submenu
                                },
                                "scripts": {
                                    "init": [
                                        {
                                            "code": function(gameRef, me) {
                                                var canvas = me.canvas
                                                var ctx = me.ctx

                                                ctx.font = (me.vars.config.size + 1) + "px " + me.vars.config.font
                                                if (me.vars.config.centred) {
                                                    ctx.textAlign = "center"
                                                }
                                                ctx.textBaseline = "middle"

                                                me.width = ctx.measureText(me.vars.config.text).width
                                                me.height = ctx.measureText("M").width
                                            },
                                            "stateToRun": game.state
                                        },
                                        {
                                            "code": function(gameRef, me) {
                                                me.vars.render = function() {
                                                    if (me.vars.config.animation.animate) {
                                                        if (me.vars.leaveAnimation) {
                                                            if (me.vars.config.animation.type.toLowerCase() == "slowing glide") {
                                                                me.y += ((gameRef.height + me.height) - me.y) / (10 / me.vars.config.animation.speed)
                                                                if (me.y - (me.height / 2) > gameRef.height) {
                                                                    me.vars.leaveAnimation = false
                                                                    me.visible = false
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            me.y += (me.vars.config.y - me.y) / (10 / me.vars.config.animation.speed)
                                                        }
                                                    }

                                                    var canvas = me.canvas
                                                    var ctx = me.ctx

                                                    canvas.width = me.scaled.width
                                                    canvas.height = me.scaled.height

                                                    ctx.font = me.scale.x(me.vars.config.size + 1) + "px " + me.vars.config.font
                                                    if (me.vars.config.centred) {
                                                        ctx.textAlign = "center"
                                                    }
                                                    ctx.textBaseline = "middle"

                                                    ctx.clearRect(0, 0, canvas.width, canvas.height)

                                                    ctx.fillText(me.vars.config.text, canvas.width / 2, canvas.height / 2)
                                                }
                                            },
                                            "stateToRun": game.state
                                        }
                                    ],
                                    "main": [
                                        {
                                            "code": function(gameRef, me) {
                                                var indexSprite = BeginningJS.methods.get.sprite("Internal.GUI.menu.index")

                                                if (me.vars.config.submenu == indexSprite.vars.submenu) {
                                                    if (! me.visible) {
                                                        // Wait for the other elements to finish their animations
                                                        var elements = indexSprite.vars.elements
                                                        var cancel = false
                                                        var i = 0
                                                        for (i in elements) {
                                                            var element = elements[i]
                                                            if (element.vars.config.submenu == me.vars.lastSubmenu) {
                                                                if (element.visible) {
                                                                    //console.log(me.id, element.id, me.vars.lastSubmenu)
                                                                    var cancel = true
                                                                }
                                                            }
                                                        }
                                                        if (! cancel) {
                                                            me.visible = true
                                                            me.vars.lastSubmenu = indexSprite.vars.submenu
                                                            if (me.vars.config.animation.animate) {
                                                                me.y = gameRef.height + (me.height / 2)
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    if (me.visible && (! me.vars.leaveAnimation)) {
                                                        me.vars.lastSubmenu = indexSprite.vars.submenu
                                                        if (me.vars.config.animation.animate) {
                                                            me.vars.leaveAnimation = true
                                                        }
                                                        else {
                                                            me.visible = false
                                                        }
                                                    }
                                                }
                                                if (me.visible) {
                                                    me.vars.render()

                                                    if (! BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.switching) {
                                                        me.bringToFront()
                                                    }
                                                }
                                            },
                                            "stateToRun": game.state
                                        }
                                    ]
                                },
                                "clones": {},
                                "width": 1,
                                "height": 1,
                                "id": textID
                            };
                            game.game.sprites.push(sprite);
                            BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.elements.push(sprite);

                            BeginningJS.internal.createSprite({
                                isClone: false,
                                idIndex: game.game.sprites.length - 1,
                                runScripts: true,
                                isInternal: true
                            }, sprite, game);
                        },
                        "internal": {
                            "game": game
                        }
                    },
                    "button": {
                        "modern": function(configInput) {
                            var config = configInput;

                            var game = this.internal.game;

                            if (config == null) {
                                console.error("Oops, looks like you've forgotten the input in the function Game.methods.gui.create.text.modern. It should be type \"object\". ");
                                BeginningJS.internal.oops(game);
                            }
                            if (BeginningJS.internal.getTypeOf(config) != "object") {
                                console.error("Oops, looks like you've put the wrong input type in for this function. It should be \"object\". You used " + JSON.stringify(BeginningJS.internal.getTypeOf(config)) + "in the function Game.methods.gui.create.text.modern.");
                                BeginningJS.internal.oops(game);
                            }

                            // TODO: Defaults
                            config = BeginningJS.internal.checkOb(config, {
                                type: {
                                    types: ["string"],
                                    description: "The type of button to be created. ('cross', 'img', 'text')"
                                }
                            }, {
                                text: {
                                    types: ["string"],
                                    description: "The text for the button."
                                },
                                img: {
                                    types: ["string"],
                                    description: "The text for the button."
                                },
                                x: {
                                    types: ["number"],
                                    description: "The x position for the button."
                                },
                                y: {
                                    types: ["number"],
                                    description: "The y position for the button."
                                },
                                diameter: {
                                    types: ["number"],
                                    description: "The diameter of the button."
                                },
                                fill: {
                                    types: ["string"],
                                    description: "The fill colour of the button. (HTML colour e.g hex, rgb(), etc)"
                                },
                                outline: {
                                    types: ["string"],
                                    description: "The outline colour of the button. (HTML colour e.g hex, rgb(), etc)"
                                },
                                onclick: {
                                    types: [
                                        "string",
                                        "function"
                                    ],
                                    description: "The submenu name to switch to or a function to run when the button is clicked."
                                },
                                submenu: {
                                    types: ["string"],
                                    description: "The submenu name that the button will show in."
                                },
                                animation: {
                                    types: ["object"],
                                    description: "A bunch of options for animating the button."
                                },
                                resolution: {
                                    default: Math.max(game.width, game.height),
                                    types: ["number"],
                                    description: "The resolution of the button in pixels. The width and height."
                                }
                            }, "the function Game.methods.gui.create.button.modern", "function Game.methods.gui.create.button.modern arguments", game);

                            game.methods.gui.internal.createIndex(config);

                            if (config.type == "cross") {
                                config = BeginningJS.internal.checkOb(config, {
                                    type: {
                                        types: ["string"],
                                        description: "The type of button to be created. (\"cross\", \"img\", \"text\".)"
                                    },
                                    x: {
                                        types: ["number"],
                                        description: "The x position for the button."
                                    },
                                    y: {
                                        types: ["number"],
                                        description: "The y position for the button."
                                    },
                                    diameter: {
                                        types: ["number"],
                                        description: "The diameter of the button."
                                    },
                                    fill: {
                                        types: ["string"],
                                        description: "The fill colour of the button. (HTML colour e.g hex, rgb(), etc)"
                                    },
                                    onclick: {
                                        types: [
                                            "string",
                                            "function"
                                        ],
                                        description: "The submenu name to switch to or a function to run when the button is clicked."
                                    },
                                    submenu: {
                                        types: ["string"],
                                        description: "The submenu name that the button will show in."
                                    }
                                }, {
                                    animation: {
                                        types: ["object"],
                                        description: "A bunch of options for animating the button.",
                                        default: {
                                            animate: false,
                                            type: "slowing glide"
                                        }
                                    }
                                }, "the function Game.methods.gui.create.button.modern", "function Game.methods.gui.create.button.modern arguments", game);
                                config.animation = BeginningJS.internal.checkOb(config.animation, {
                                    animate: {
                                        types: ["boolean"],
                                        description: "Whether or not animation of the button should be enabled."
                                    },
                                    type: {
                                        types: ["string"],
                                        description: "The type of animation to be used ('slowing glide')."
                                    }
                                }, {
                                    speed: {
                                        types: ["number"],
                                        description: "The speed of the animation.",
                                        default: 1
                                    }
                                }, "the function Game.methods.gui.create.button.modern", "function Game.methods.gui.create.button.modern argument \"animation\"", game);
                                /*
                                if (config.animation.animate) {

                                }
                                */

                                var i = 0
                                while (game.internal.IDIndex["Internal.GUI.modern.button#" + i] != null) {
                                    i++
                                }
                                var buttonID = "Internal.GUI.modern.button#" + i

                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.button.modern.clickDown",
                                    "src": "../assets/snds/clickDown.mp3" // TODO data url
                                }, game)
                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.button.modern.clickUp",
                                    "src": "../assets/snds/clickUp.mp3" // TODO data url
                                }, game)
                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.button.modern.mouseTouch",
                                    "src": "../assets/snds/mouseTouch.mp3" // TODO data url
                                }, game)
                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.background.modern.woosh",
                                    "src": "../assets/snds/woosh.mp3" // TODO data url
                                }, game)

                                var sprite = {
                                    "type": "canvas",
                                    "customRes": true,
                                    "x": config.x,
                                    "y": config.y,
                                    "visible": false,
                                    "vars": {
                                        "config": config,
                                        "mouseTime": 0,
                                        default: {
                                            "diameter": config.diameter
                                        },
                                        "click": false,
                                        "clicked": false,
                                        "clickTime": 0,
                                        "clickedQueued": false,
                                        "leaveAnimation": false
                                    },
                                    "scripts": {
                                        "init": [
                                            {
                                                "code": function(gameRef, me) {
                                                    me.vars.canvas = document.createElement("canvas") // Make a separate canvas
                                                    me.vars.ctx = me.vars.canvas.getContext("2d")
                                                    me.ctx.imageSmoothingEnabled = false

                                                    me.vars.render = function() {
                                                        if (me.vars.config.animation.animate) {
                                                            if (me.vars.leaveAnimation) {
                                                                if (me.vars.config.animation.type.toLowerCase() == "slowing glide") {
                                                                    me.y += ((gameRef.height + me.height) - me.y) / (10 / me.vars.config.animation.speed)
                                                                    if (me.y - (me.height / 2) > gameRef.height) {
                                                                        me.vars.leaveAnimation = false
                                                                        me.visible = false
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                me.y += (me.vars.config.y - me.y) / (10 / me.vars.config.animation.speed)
                                                            }
                                                        }

                                                        me.canvas.width = me.scaled.width
                                                        me.canvas.height = me.scaled.height

                                                        var ctx = me.vars.ctx
                                                        var canvas = me.vars.canvas
                                                        canvas.width = me.canvas.width
                                                        canvas.height = me.canvas.height

                                                        ctx.strokeStyle = me.vars.config.outline
                                                        ctx.fillStyle = me.vars.config.fill
                                                        ctx.lineWidth = me.scale.x(me.width / 5)


                                                        ctx.beginPath()
                                                        ctx.arc(canvas.width / 2, canvas.height / 2, (canvas.width / 2) - (ctx.lineWidth / 2), 0, 2 * Math.PI)
                                                        ctx.stroke()
                                                        ctx.fill()


                                                        ctx.lineWidth = me.scale.x(me.width / 10)
                                                        ctx.lineCap = "round"

                                                        var size = 3

                                                        ctx.beginPath()
                                                        var x = me.scale.x(me.width / size)
                                                        var y = x
                                                        ctx.moveTo(x, y)
                                                        var x = me.scale.x(me.width - (me.width / size))
                                                        var y = x
                                                        ctx.lineTo(x, y)
                                                        ctx.stroke()

                                                        ctx.beginPath()
                                                        var x = me.scale.x(me.width - (me.width / size))
                                                        var y = me.scale.x(me.width / size)
                                                        ctx.moveTo(x, y)
                                                        var x = me.scale.x(me.width / size)
                                                        var y = me.scale.x(me.width - (me.width / size))
                                                        ctx.lineTo(x, y)
                                                        ctx.stroke()

                                                        me.bringToFront()
                                                        me.ctx.drawImage(canvas, 0, 0) // Draw the other canvas to my canvas
                                                    }
                                                    me.vars.inputs = function() {
                                                        if (me.touching.mouse.AABB()) {
                                                            if (Math.abs(me.vars.mouseTime) < 0.02) {
                                                                if (me.vars.mouseTime == 0) {
                                                                    BeginningJS.methods.playSound("Internal.GUI.button.modern.mouseTouch")
                                                                }
                                                                me.vars.mouseTime = 0.1
                                                            }
                                                            if (me.vars.mouseTime < 0) {
                                                                me.vars.mouseTime *= 0.9
                                                            }
                                                            else {
                                                                me.vars.mouseTime *= 1.1
                                                            }
                                                            if (me.vars.mouseTime > 0.2) {
                                                                me.vars.mouseTime = 0.2
                                                            }
                                                        }
                                                        else {
                                                            me.vars.mouseTime *= 0.8
                                                            if (me.vars.mouseTime < 0.01) {
                                                                me.vars.mouseTime = 0
                                                            }
                                                        }
                                                        if (me.touching.mouse.AABB()) {
                                                            if (gameRef.input.mouse.down) {
                                                                if (! me.vars.click) {
                                                                    me.vars.clicked = true
                                                                    me.vars.clickTime = 0
                                                                }
                                                            }
                                                        }
                                                        if (me.vars.clicked) {
                                                            if (me.vars.clickTime == 0) {
                                                                me.vars.clickTime = 0.025
                                                                BeginningJS.methods.playSound("Internal.GUI.button.modern.clickDown")
                                                            }
                                                            if (! me.vars.clickedQueued) {
                                                                if ((! gameRef.input.mouse.down) || (! me.touching.mouse.AABB())) {
                                                                    BeginningJS.methods.playSound("Internal.GUI.button.modern.clickUp")
                                                                    me.vars.clickedQueued = true

                                                                    BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.switching = true
                                                                    BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.submenu = me.vars.config.onclick
                                                                }
                                                            }

                                                            me.vars.clickTime *= 1.1
                                                            if (me.vars.clickTime > 0.1) {
                                                                me.vars.clickTime = 0.1
                                                                if (me.vars.clickedQueued) {
                                                                    me.vars.clicked = false
                                                                    me.vars.clickTime = 0
                                                                    me.vars.clickedQueued = false
                                                                    me.vars.mouseTime = -0.2
                                                                }
                                                            }
                                                        }
                                                        me.vars.click = gameRef.input.mouse.down
                                                    }
                                                    me.vars.effects = function() {
                                                        if (me.vars.clicked) {
                                                            var ctx = me.ctx
                                                            var canvas = me.canvas

                                                            ctx.fillStyle = "rgba(" + [50, 50, 50, 0.2] + ")"

                                                            ctx.beginPath()
                                                            var radius = (me.vars.clickTime * (me.width / 2)) * (1 / 0.1)
                                                            var max = ((me.width / 2) - (me.width / 5)) * (1 / 0.1)

                                                            if (radius > max) {
                                                                radius = me.scale.x(max)
                                                            }
                                                            else {
                                                                radius = me.scale.x(radius)
                                                            }
                                                            ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI)
                                                            ctx.fill()
                                                        }
                                                        else {
                                                            if (me.vars.mouseTime != 0) {
                                                                var ctx = me.ctx
                                                                var canvas = me.canvas

                                                                ctx.fillStyle = "rgba(" + [50, 50, 50, 0.05] + ")"

                                                                ctx.beginPath()
                                                                var radius = (Math.abs(me.vars.mouseTime) * (me.width / 2)) * (1 / 0.2)
                                                                var max = ((me.width / 2) - (me.width / 5)) * (1 / 0.2)

                                                                if (radius > max) {
                                                                    radius = me.scale.x(max)
                                                                }
                                                                else {
                                                                    radius = me.scale.x(radius)
                                                                }
                                                                ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI)
                                                                ctx.fill()
                                                            }
                                                        }
                                                    }
                                                    me.vars.render()
                                                },
                                                "stateToRun": game.state
                                            }
                                        ],
                                        "main": [
                                            {
                                                "code": function(gameRef, me) {
                                                    if (me.visible) {
                                                        if (me.vars.clicked) {
                                                            me.width = me.vars.default.diameter / (((me.vars.clickTime + me.vars.mouseTime) / 2) + 1)
                                                            me.height = me.vars.default.diameter / (((me.vars.clickTime + me.vars.mouseTime) / 2) + 1)
                                                        }
                                                        else {
                                                            me.width = me.vars.default.diameter * ((me.vars.mouseTime / 2) + 1)
                                                            me.height = me.vars.default.diameter * ((me.vars.mouseTime / 2) + 1)
                                                        }
                                                    }
                                                },
                                                "stateToRun": game.state
                                            },
                                            {
                                                "code": function(gameRef, me) {
                                                    if (me.visible) {
                                                        me.vars.render()
                                                        me.vars.inputs()
                                                        me.vars.effects()
                                                    }
                                                },
                                                "stateToRun": game.state
                                            },
                                            {
                                                "code": function(gameRef, me) {
                                                    var indexSprite = BeginningJS.methods.get.sprite("Internal.GUI.menu.index")
                                                    if (me.vars.config.submenu == indexSprite.vars.submenu) {
                                                        if (! me.visible) {
                                                            me.visible = true

                                                            if (me.vars.config.animation.animate) {
                                                                me.y = gameRef.height + (me.height / 2)
                                                                BeginningJS.methods.playSound("Internal.GUI.background.modern.woosh")
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        if (me.visible && (! me.vars.leaveAnimation)) {
                                                            if (me.vars.config.animation.animate) {
                                                                me.vars.leaveAnimation = true
                                                            }
                                                            else {
                                                                me.visible = false
                                                            }
                                                        }
                                                    }

                                                },
                                                "stateToRun": game.state
                                            }
                                        ]
                                    },
                                    "width": config.diameter,
                                    "height": config.diameter,
                                    "id": buttonID
                                }
                                game.game.sprites.push(sprite)
                                BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.elements.push(sprite)

                                BeginningJS.internal.createSprite({
                                    isClone: false,
                                    idIndex: game.game.sprites.length - 1,
                                    runScripts: true,
                                    isInternal: true
                                }, sprite, game);
                            }
                            if (config.type == "img") {
                                config = BeginningJS.internal.checkOb(config, {
                                    type: {
                                        types: ["string"],
                                        description: "The type of button to be created. ('img', 'text')"
                                    },
                                    img: {
                                        types: ["string"],
                                        description: "The image for the button."
                                    },
                                    x: {
                                        types: ["number"],
                                        description: "The x position for the button."
                                    },
                                    y: {
                                        types: ["number"],
                                        description: "The y position for the button."
                                    },
                                    diameter: {
                                        types: ["number"],
                                        description: "The diameter of the button."
                                    },
                                    fill: {
                                        types: ["string"],
                                        description: "The fill colour of the button. (HTML colour e.g hex, rgb(), etc)"
                                    },
                                    onclick: {
                                        types: [
                                            "string",
                                            "function"
                                        ],
                                        description: "The submenu name to switch to or a function to run when the button is clicked."
                                    },
                                    submenu: {
                                        types: ["string"],
                                        description: "The submenu name that the button will show in."
                                    },
                                }, {
                                    outline: {
                                        types: ["string"],
                                        default: config.fill,
                                        description: "The outline colour of the button. (HTML colour e.g hex, rgb(), etc)"
                                    },
                                    animation: {
                                        types: ["object"],
                                        description: "A bunch of options for animating the button.",
                                        default: {
                                            animate: false,
                                            type: "slowing glide"
                                        }
                                    }
                                }, "the function Game.methods.gui.create.button.modern", "function Game.methods.gui.create.button.modern arguments", game);
                                config.animation = BeginningJS.internal.checkOb(config.animation, {
                                    animate: {
                                        types: ["boolean"],
                                        description: "Whether or not animation of the button should be enabled."
                                    },
                                    type: {
                                        types: ["string"],
                                        description: "The type of animation to be used ('slowing glide')."
                                    }
                                }, {
                                    speed: {
                                        types: ["number"],
                                        description: "The speed of the animation.",
                                        default: 1
                                    }
                                }, "the function Game.methods.gui.create.button.modern", "function Game.methods.gui.create.button.modern argument \"animation\"", game);

                                // Find an ID
                                var i = 0;
                                while (game.internal.IDIndex["Internal.GUI.modern.button#" + i] != null) {
                                    i++;
                                }
                                var buttonID = "Internal.GUI.modern.button#" + i;
                                // TODO: Might not need an ID?

                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.button.modern.clickDown",
                                    "src": "../assets/snds/clickDown.mp3" // TODO data url
                                }, game);
                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.button.modern.clickUp",
                                    "src": "../assets/snds/clickUp.mp3" // TODO data url
                                }, game);
                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.button.modern.mouseTouch",
                                    "src": "../assets/snds/mouseTouch.mp3" // TODO data url
                                }, game);
                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.background.modern.woosh",
                                    "src": "../assets/snds/woosh.mp3" // TODO data url
                                }, game);

                                // TODO: Load these during init

                                var sprite = {
                                    "id": buttonID,
                                    "type": "renderer",
                                    "order": "high",
                                    "vars": {
                                        config: config,
                                        mouseTime: 0,
                                        default: {
                                            "diameter": config.diameter
                                        },
                                        click: false,
                                        clicked: false,
                                        clickTime: 0,
                                        clickedQueued: false,
                                        renderNext: false,
                                        recoiling: false,
                                        visible: true
                                    },
                                    "scripts": {
                                        "init": [
                                            {
                                                "code": (gameRef, me) => {
                                                    // Prerender the circle
                                                    var x;
                                                    var y;
                                                    var cxy;

                                                    var canvas = document.createElement("canvas");
                                                    var ctx = canvas.getContext("2d");

                                                    canvas.width = me.vars.config.resolution * 2;
                                                    canvas.height = canvas.width;

                                                    var convertXY = (x, y) => { // The input has 0,0 as the centre
                                                        return {
                                                            x: x + (canvas.width / 2),
                                                            y: y + (canvas.height / 2),
                                                        };
                                                    };

                                                    x = -(canvas.width / 2);
                                                    while (x < canvas.width / 2) {
                                                        y = Math.sqrt(Math.pow(canvas.width / 2, 2) - (x * x));
                                                        cxy = convertXY(x, y);

                                                        ctx.fillRect(cxy.x, cxy.y, 1, (canvas.height - cxy.y) - cxy.y);
                                                        x++;
                                                    }

                                                    me.vars.canvas = canvas;
                                                    me.vars.ctx = ctx;

                                                    me.vars.render = () => {
                                                        if (me.vars.config.animation.animate) {
                                                            if (me.vars.leaveAnimation) {
                                                                if (me.vars.config.animation.type.toLowerCase() == "slowing glide") {
                                                                    me.y += ((gameRef.height + me.height) - me.y) / (10 / me.vars.config.animation.speed);
                                                                    if (me.y - (me.height / 2) > gameRef.height) {
                                                                        me.vars.leaveAnimation = false;
                                                                        me.visible = false;
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                me.y += (me.vars.config.y - me.y) / (10 / me.vars.config.animation.speed);
                                                            }
                                                        }

                                                        var canvas = me.canvas;
                                                        var ctx = me.ctx;

                                                        // TODO: How big is the canvas? How is it centred? <============

                                                        ctx.imageSmoothingEnabled = false;
                                                        ctx.drawImage(me.vars.canvas, me.scale.x(me.vars.config.x - (me.vars.canvas.width / 2)), me.scale.y(me.vars.config.y - (me.vars.canvas.height / 2)), (me.scale.x(me.vars.width) / 2) - (ctx.lineWidth / 2), (me.scale.x(me.vars.width) / 2) - (ctx.lineWidth / 2));
                                                        ctx.imageSmoothingEnabled = true;

                                                        var img = BeginningJS.methods.get.image(config.img, gameRef) ;// TODO: What if the ID is invalid?
                                                        var width = me.scale.x(me.vars.config.diameter) / 2;
                                                        var height = width;

                                                        ctx.imageSmoothingEnabled = false;
                                                        ctx.drawImage(img, me.scale.x(me.vars.config.x) - (width / 2), me.scale.y(me.vars.config.y) - (height / 2), width, height);
                                                        ctx.imageSmoothingEnabled = true;

                                                        if (BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.switching) {
                                                            me.sendToBack();
                                                        }
                                                        else {
                                                            me.bringToFront();
                                                        }
                                                    }
                                                    me.vars.inputs = function() {
                                                        if (me.touching.mouse.AABB({
                                                            x: me.vars.config.x - (me.vars.config.diameter / 2),
                                                            y: me.vars.config.y - (me.vars.config.diameter / 2),
                                                            width: me.vars.config.diameter,
                                                            height: me.vars.config.diameter
                                                        })) {
                                                            if (Math.abs(me.vars.mouseTime) < 0.02) {
                                                                if (me.vars.mouseTime == 0) {
                                                                    BeginningJS.methods.playSound("Internal.GUI.button.modern.mouseTouch");
                                                                }
                                                                me.vars.mouseTime = 0.1;
                                                            }
                                                            if (me.vars.mouseTime < 0) {
                                                                me.vars.mouseTime *= 0.9;
                                                            }
                                                            else {
                                                                me.vars.mouseTime *= 1.1;
                                                            }
                                                            if (me.vars.mouseTime > 0.2) {
                                                                me.vars.mouseTime = 0.2;
                                                            }
                                                        }
                                                        else {
                                                            if (me.vars.recoiling) {
                                                                me.vars.mouseTime *= 0.92;
                                                            }
                                                            else {
                                                                me.vars.mouseTime *= 0.8;
                                                            }
                                                            if (me.vars.mouseTime < 0.01) {
                                                                me.vars.mouseTime = 0;
                                                                me.vars.recoiling = false;
                                                            }
                                                        }
                                                        if (me.touching.mouse.AABB({
                                                            x: me.vars.config.x - (me.vars.config.diameter / 2),
                                                            y: me.vars.config.y - (me.vars.config.diameter / 2),
                                                            width: me.vars.config.diameter,
                                                            height: me.vars.config.diameter
                                                        })) {
                                                            if (gameRef.input.mouse.down) {
                                                                if (! me.vars.click) {
                                                                    me.vars.clicked = true;
                                                                    me.vars.clickTime = 0;
                                                                }
                                                            }
                                                        }
                                                        if (me.vars.clicked) {
                                                            if (me.vars.clickTime == 0) {
                                                                me.vars.clickTime = 0.025;
                                                                BeginningJS.methods.playSound("Internal.GUI.button.modern.clickDown");
                                                            }
                                                            if (! me.vars.clickedQueued) {
                                                                if ((! gameRef.input.mouse.down) || (! me.touching.mouse.AABB())) {
                                                                    BeginningJS.methods.playSound("Internal.GUI.button.modern.clickUp");
                                                                    me.vars.clickedQueued = true;

                                                                    if (! BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.switching) {
                                                                        if (typeof me.vars.config.onclick == "function") {
                                                                            me.vars.config.onclick(game, me);
                                                                        }
                                                                        else {
                                                                            if (BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.popup) {
                                                                                BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.sliding = true;
                                                                            }
                                                                            else {
                                                                                BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.switching = true;
                                                                                me.clone({
                                                                                    "vars": {
                                                                                        "button": me
                                                                                    }
                                                                                });
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                            me.vars.clickTime *= 1.1;
                                                            if (me.vars.clickTime > 0.1) {
                                                                me.vars.clickTime = 0.1
                                                                if (me.vars.clickedQueued) {
                                                                    me.vars.clicked = false;
                                                                    me.vars.clickTime = 0;
                                                                    me.vars.clickedQueued = false;
                                                                    me.vars.mouseTime = -0.2;
                                                                }
                                                            }
                                                        }
                                                        me.vars.click = gameRef.input.mouse.down;
                                                    }
                                                    me.vars.effects = function() {
                                                        if (me.vars.clicked) {
                                                            var ctx = me.ctx;
                                                            var canvas = me.canvas;

                                                            ctx.fillStyle = "rgba(" + [50, 50, 50, 0.2] + ")";

                                                            ctx.beginPath()
                                                            var radius = (me.vars.clickTime * (me.width / 2)) * (1 / 0.1);
                                                            var max = ((me.width / 2) - (me.width / 5)) * (1 / 0.1);

                                                            if (radius > max) {
                                                                radius = me.scale.x(max);
                                                            }
                                                            else {
                                                                radius = me.scale.x(radius);
                                                            }
                                                            ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
                                                            ctx.fill();
                                                        }
                                                        else {
                                                            if (me.vars.mouseTime != 0) {
                                                                var ctx = me.ctx;
                                                                var canvas = me.canvas;

                                                                ctx.fillStyle = "rgba(" + [50, 50, 50, 0.05] + ")";

                                                                ctx.beginPath();
                                                                var radius = (Math.abs(me.vars.mouseTime) * (me.width / 2)) * (1 / 0.2);
                                                                var max = ((me.width / 2) - (me.width / 5)) * (1 / 0.2);

                                                                if (radius > max) {
                                                                    radius = me.scale.x(max);
                                                                }
                                                                else {
                                                                    radius = me.scale.x(radius);
                                                                }
                                                                ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
                                                                ctx.fill();
                                                            }
                                                        }
                                                    }
                                                },
                                                "stateToRun": game.state
                                            }
                                        ],
                                        "main": [
                                            {
                                                "code": function(gameRef, me) {
                                                    if (me.vars.visible) {
                                                        if (me.vars.clicked) {
                                                            me.vars.width = me.vars.default.diameter / (((me.vars.clickTime + me.vars.mouseTime) / 2) + 1);
                                                            me.vars.height = me.vars.default.diameter / (((me.vars.clickTime + me.vars.mouseTime) / 2) + 1);
                                                        }
                                                        else {
                                                            me.vars.width = me.vars.default.diameter * ((me.vars.mouseTime / 2) + 1);
                                                            me.vars.height = me.vars.default.diameter * ((me.vars.mouseTime / 2) + 1);
                                                        }
                                                    }
                                                },
                                                "stateToRun": game.state
                                            },
                                            {
                                                "code": function(gameRef, me) {
                                                    var indexSprite = BeginningJS.methods.get.sprite("Internal.GUI.menu.index");
                                                    if (me.vars.config.submenu == indexSprite.vars.submenu) {
                                                        if (! me.vars.visible) {
                                                            me.vars.visible = true;

                                                            if (me.vars.config.animation.animate) {
                                                                me.y = gameRef.height + (me.height / 2);
                                                                BeginningJS.methods.playSound("Internal.GUI.background.modern.woosh");
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        if (me.vars.visible && (! me.vars.leaveAnimation)) {
                                                            if (me.vars.config.animation.animate) {
                                                                me.vars.leaveAnimation = true;
                                                            }
                                                            else {
                                                                me.vars.visible = false;
                                                            }
                                                        }
                                                    }

                                                },
                                                "stateToRun": game.state
                                            }
                                        ]
                                    },
                                    "render": (gameRef, me) => {
                                        if (me.vars.visible) {
                                            me.vars.render();
                                            me.vars.inputs();
                                            me.vars.effects();
                                        }
                                    },
                                    "clones": {
                                        "vars": {
                                            "finished": false,
                                            "closingAnimation": false,
                                            "velWas": 0,
                                            "waiting": false
                                        },
                                        "scripts": {
                                            "init": [
                                                function(gameRef, me) {
                                                    BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.popup = true;

                                                    me.vars.width = me.vars.button.vars.config.diameter;
                                                    me.vars.height = me.vars.button.vars.config.diameter;

                                                    me.vars.x = me.vars.button.vars.config.x;
                                                    me.vars.y = me.vars.button.vars.config.y;

                                                    me.vars.vel = 5;

                                                    me.vars.render = function() {
                                                        var canvas = me.canvas;
                                                        var ctx = me.ctx;

                                                        var size = me.scale.x(me.vars.width);

                                                        ctx.fillStyle = me.vars.button.vars.config.fill;

                                                        if (me.vars.finished) {
                                                            ctx.fillRect(0, 0, me.scale.x(gameRef.width), me.scale.y(gameRef.height));
                                                        }
                                                        else {
                                                            ctx.beginPath();
                                                            ctx.arc(me.scale.x(me.vars.x), me.scale.y(me.vars.y), size / 2, 0, 2 * Math.PI);
                                                            ctx.fill();
                                                        }
                                                    }
                                                }
                                            ],
                                            "main": []
                                        },
                                        "render": function(gameRef, me) {
                                            if (me.vars.closingAnimation) {
                                                me.vars.vel *= 1.1;
                                            }
                                            else {
                                                me.vars.vel *= 1.5;
                                            }

                                            // TODO: Animation slightly broken (look at in slow-mo by disabling line above ^)

                                            me.vars.width += Math.round(me.vars.vel);
                                            me.vars.height += Math.round(me.vars.vel);
                                            me.vars.width = Math.max(me.vars.width, 1);
                                            me.vars.height = Math.max(me.vars.height, 1);
                                            if (me.vars.waiting) {
                                                if (me.vars.width < me.vars.button.vars.config.diameter) {
                                                    me.vars.waiting = false;
                                                    BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.switching = false;
                                                    BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.popup = false;
                                                    me.vars.button.vars.mouseTime = 0.2;
                                                    me.vars.button.vars.recoiling = true;

                                                    me.delete();
                                                    return;
                                                }
                                            }
                                            if (me.vars.width < me.vars.button.vars.config.diameter) {
                                                me.vars.waiting = true;
                                            }

                                            me.vars.widthWas = me.vars.width;
                                            me.vars.heightWas = me.vars.height;
                                            if (me.vars.finished) {
                                                if (me.vars.button.vars.config.onclick != BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.submenu) {
                                                    // Wait for the other elements to finish their animations
                                                    var elements = BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.elements;
                                                    var cancel = false;
                                                    var i = 0;
                                                    for (i in elements) {
                                                        var element = elements[i];
                                                        if (element.vars.config.submenu == me.vars.button.vars.config.onclick) {
                                                            if (element.visible) {
                                                                var cancel = true;
                                                            }
                                                        }
                                                    }
                                                    if (! cancel) { // If they're done we start ours
                                                        BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.switching = true;
                                                        me.vars.finished = false;
                                                        me.vars.vel = -10;
                                                        me.vars.closingAnimation = true;

                                                        me.vars.x = me.vars.button.vars.config.x;
                                                        me.vars.y = me.vars.button.vars.config.y;
                                                        me.vars.width = Math.sqrt(Math.pow(game.width + Math.abs(me.vars.x - (game.width / 2)), 2) + Math.pow(game.height + Math.abs(me.y - (game.height / 2)), 2));
                                                        me.vars.height = me.vars.width;

                                                        me.vars.renderNext = true;

                                                        me.rendererPriority.switchToHigh();
                                                    }
                                                }
                                            }
                                            else {
                                                if (! me.vars.closingAnimation) {
                                                    var finished = false;
                                                    //if (Math.sqrt(Math.pow(me.vars.width, 2) + Math.pow(me.vars.height, 2)) > Math.sqrt(Math.pow(game.width + Math.abs(me.vars.x - (game.width / 2)), 2) + Math.pow(game.height + Math.abs(me.vars.y - (game.height / 2)), 2))) {
                                                    if (me.vars.width > gameRef.width + me.vars.x && me.vars.height > gameRef.height + me.vars.y) {
                                                        finished = true;
                                                    }

                                                    if (me.vars.waiting) {
                                                        me.vars.waiting = false;


                                                        BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.switching = false;
                                                        me.vars.finished = true;

                                                        me.vars.velWas = me.vars.vel;
                                                        me.vars.vel = 0;

                                                        me.vars.xWas = me.vars.x;
                                                        me.vars.yWas = me.vars.y;
                                                        me.vars.x = gameRef.width / 2;
                                                        me.vars.y = gameRef.height / 2;
                                                        me.vars.width = gameRef.width;
                                                        me.vars.height = gameRef.height;
                                                        // TODO: which of these are still needed?

                                                        me.rendererPriority.switchToLow();

                                                        BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.submenu = me.vars.button.vars.config.onclick;
                                                    }
                                                    else {
                                                        if (finished) {
                                                            me.vars.waiting = true;
                                                        }
                                                    }
                                                }
                                            }
                                            me.vars.render();
                                        },
                                        "order": "high"
                                        // TODO: What if the parent isn't the same type and no render function is specified?
                                    }
                                };
                                game.game.sprites.push(sprite);
                                BeginningJS.methods.get.sprite("Internal.GUI.menu.index").vars.elements.push(sprite);

                                BeginningJS.internal.createSprite({
                                    isClone: false,
                                    idIndex: game.game.sprites.length - 1,
                                    runScripts: true,
                                    isInternal: true
                                }, sprite, game);
                            }
                            if (config.type == "text") {
                                // TODO

                                /*
                                config = BeginningJS.internal.checkOb(config, {
                                    "type": {
                                        types: ["string"],
                                        description: "The type of button to be created. ('cross', 'custom')"
                                    },
                                    "text": {
                                        types: ["string"],
                                        description: "The text for the button."
                                    },
                                    "x": {
                                        types: ["number"],
                                        description: "The x position for the button."
                                    },
                                    "y": {
                                        types: ["number"],
                                        description: "The y position for the button."
                                    },
                                    "diameter": {
                                        types: ["number"],
                                        description: "The diameter of the button."
                                    },
                                    "fill": {
                                        types: ["string"],
                                        description: "The fill colour of the button. (HTML colour e.g hex, rgb(), etc)"
                                    },
                                    "onclick": {
                                        types: [
                                            "string",
                                            "function"
                                        ],
                                        description: "The submenu name to switch to or a function to run when the button is clicked."
                                    },
                                    "submenu": {
                                        types: ["string"],
                                        description: "The submenu name that the button will show in."
                                    },
                                }, {
                                    "outline": {
                                        types: ["string"],
                                        default: null,
                                        description: "The outline colour of the button. (HTML colour e.g hex, rgb(), etc)"
                                    }
                                }, "function Game.methods.gui.create.button.modern")
                                if (config.outline == null) {
                                    config.outline = config.fill
                                }

                                var i = 0
                                while (game.internal.IDIndex["Internal.GUI.modern.button#" + i] != null) {
                                    i++
                                }
                                var buttonID = "Internal.GUI.modern.button#" + i

                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.button.modern.clickDown",
                                    "src": "../assets/snds/clickDown.mp3" // TODO data url
                                }, game)
                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.button.modern.clickUp",
                                    "src": "../assets/snds/clickUp.mp3" // TODO data url
                                }, game)
                                BeginningJS.internal.load.snd({
                                    "id": "Internal.GUI.button.modern.mouseTouch",
                                    "src": "../assets/snds/mouseTouch.mp3" // TODO data url
                                }, game)

                                var sprite = {
                                    "type": "canvas",
                                    "customRes": true,
                                    "x": config.x,
                                    "y": config.y,
                                    "vars": {
                                        "config": config,
                                        "mouseTime": 0,
                                        default: {
                                            "diameter": config.diameter
                                        },
                                        "click": false,
                                        "clicked": false,
                                        "clickTime": 0,
                                        "clickedQueued": false
                                    },
                                    "scripts": {
                                        "init": [
                                            {
                                                "code": function(gameRef, me) {
                                                    me.vars.canvas = document.createElement("canvas") // Make a separate canvas
                                                    me.vars.ctx = me.vars.canvas.getContext("2d")

                                                    me.vars.render = function() {
                                                        me.canvas.width = me.scaled.width
                                                        me.canvas.height = me.scaled.height

                                                        var ctx = me.vars.ctx
                                                        var canvas = me.vars.canvas
                                                        canvas.width = me.canvas.width
                                                        canvas.height = me.canvas.height

                                                        ctx.strokeStyle = me.vars.config.outline
                                                        ctx.fillStyle = me.vars.config.fill
                                                        ctx.lineWidth = me.scale.x(me.width / 5)

                                                        ctx.beginPath()
                                                        ctx.arc(canvas.width / 2, canvas.height / 2, (canvas.width / 2) - (ctx.lineWidth / 2), 0, 2 * Math.PI)
                                                        ctx.stroke()
                                                        ctx.fill()

                                                        me.ctx.drawImage(canvas, 0, 0) // Draw the other canvas to my canvas
                                                    }
                                                    me.vars.inputs = function() {
                                                        if (me.touching.mouse.AABB()) {
                                                            if (Math.abs(me.vars.mouseTime) < 0.02) {
                                                                if (me.vars.mouseTime == 0) {
                                                                    BeginningJS.methods.playSound("Internal.GUI.button.modern.mouseTouch")
                                                                }
                                                                me.vars.mouseTime = 0.1
                                                            }
                                                            if (me.vars.mouseTime < 0) {
                                                                me.vars.mouseTime *= 0.9
                                                            }
                                                            else {
                                                                me.vars.mouseTime *= 1.1
                                                            }
                                                            if (me.vars.mouseTime > 0.2) {
                                                                me.vars.mouseTime = 0.2
                                                            }
                                                        }
                                                        else {
                                                            me.vars.mouseTime *= 0.8
                                                            if (me.vars.mouseTime < 0.01) {
                                                                me.vars.mouseTime = 0
                                                            }
                                                        }
                                                        if (me.touching.mouse.AABB()) {
                                                            if (gameRef.input.mouse.down) {
                                                                if (! me.vars.click) {
                                                                    me.vars.clicked = true
                                                                    me.vars.clickTime = 0
                                                                }
                                                            }
                                                        }
                                                        if (me.vars.clicked) {
                                                            if (me.vars.clickTime == 0) {
                                                                me.vars.clickTime = 0.025
                                                                BeginningJS.methods.playSound("Internal.GUI.button.modern.clickDown")
                                                            }
                                                            if (! me.vars.clickedQueued) {
                                                                if ((! gameRef.input.mouse.down) || (! me.touching.mouse.AABB())) {
                                                                    BeginningJS.methods.playSound("Internal.GUI.button.modern.clickUp")
                                                                    me.vars.clickedQueued = true

                                                                    me.clone({
                                                                        "vars": {
                                                                            "button": me
                                                                        }
                                                                    })
                                                                }
                                                            }

                                                            me.vars.clickTime *= 1.1
                                                            if (me.vars.clickTime > 0.1) {
                                                                me.vars.clickTime = 0.1
                                                                if (me.vars.clickedQueued) {
                                                                    me.vars.clicked = false
                                                                    me.vars.clickTime = 0
                                                                    me.vars.clickedQueued = false
                                                                    me.vars.mouseTime = -0.2
                                                                }
                                                            }
                                                        }
                                                        me.vars.click = gameRef.input.mouse.down
                                                    }
                                                    me.vars.effects = function() {
                                                        if (me.vars.clicked) {
                                                            var ctx = me.ctx
                                                            var canvas = me.canvas

                                                            ctx.fillStyle = "rgba(" + [50, 50, 50, 0.2] + ")"

                                                            ctx.beginPath()
                                                            var radius = (me.vars.clickTime * (me.width / 2)) * (1 / 0.1)
                                                            var max = ((me.width / 2) - (me.width / 5)) * (1 / 0.1)

                                                            if (radius > max) {
                                                                radius = me.scale.x(max)
                                                            }
                                                            else {
                                                                radius = me.scale.x(radius)
                                                            }
                                                            ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI)
                                                            ctx.fill()
                                                        }
                                                        else {
                                                            if (me.vars.mouseTime != 0) {
                                                                var ctx = me.ctx
                                                                var canvas = me.canvas

                                                                ctx.fillStyle = "rgba(" + [50, 50, 50, 0.05] + ")"

                                                                ctx.beginPath()
                                                                var radius = (Math.abs(me.vars.mouseTime) * (me.width / 2)) * (1 / 0.2)
                                                                var max = ((me.width / 2) - (me.width / 5)) * (1 / 0.2)

                                                                if (radius > max) {
                                                                    radius = me.scale.x(max)
                                                                }
                                                                else {
                                                                    radius = me.scale.x(radius)
                                                                }
                                                                ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI)
                                                                ctx.fill()
                                                            }
                                                        }
                                                    }
                                                    me.vars.render()
                                                },
                                                "stateToRun": game.state
                                            }
                                        ],
                                        "main": [
                                            {
                                                "code": function(gameRef, me) {
                                                    if (me.vars.clicked) {
                                                        me.width = me.vars.default.diameter / (((me.vars.clickTime + me.vars.mouseTime) / 2) + 1)
                                                        me.height = me.vars.default.diameter / (((me.vars.clickTime + me.vars.mouseTime) / 2) + 1)
                                                    }
                                                    else {
                                                        me.width = me.vars.default.diameter * ((me.vars.mouseTime / 2) + 1)
                                                        me.height = me.vars.default.diameter * ((me.vars.mouseTime / 2) + 1)
                                                    }
                                                },
                                                "stateToRun": game.state
                                            },
                                            {
                                                "code": function(gameRef, me) {
                                                    me.vars.render()
                                                    me.vars.inputs()
                                                    me.vars.effects()
                                                },
                                                "stateToRun": game.state
                                            }
                                        ]
                                    },
                                    "clones": {
                                        "scripts": {
                                            "init": [
                                                function(gameRef, me) {
                                                    me.width = me.vars.button.vars.config.diameter
                                                    me.height = me.vars.button.vars.config.diameter
                                                },
                                                function(gameRef, me) {
                                                    me.vars.vel = 5

                                                    me.vars.render = function() {
                                                        me.canvas.width = me.scaled.width
                                                        me.canvas.height = me.scaled.height

                                                        var ctx = me.ctx
                                                        var canvas = me.canvas

                                                        ctx.clearRect(0, 0, canvas.width, canvas.height)
                                                        ctx.fillStyle = me.vars.button.vars.config.fill

                                                        ctx.beginPath()
                                                        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI)
                                                        ctx.fill()
                                                    }
                                                    me.vars.render()
                                                }
                                            ],
                                            "main": [
                                                function(gameRef, me) {
                                                    me.vars.vel *= 2

                                                    me.width += me.vars.vel
                                                    me.height += me.vars.vel

                                                    var finished = true
                                                    if (! (me.x - (me.width / 2) < 0)) {
                                                        finished = false
                                                    }
                                                    if (! (me.y + (me.width / 2) > gameRef.internal.renderer.canvas.width)) {
                                                        finished = false
                                                    }
                                                    if (! (me.y - (me.height / 2) < 0)) {
                                                        finished = false
                                                    }
                                                    if (! (me.y + (me.height / 2) > gameRef.internal.renderer.canvas.height)) {
                                                        finished = false
                                                    }

                                                    if (finished) {
                                                        me.vars.vel = 0
                                                    }
                                                },
                                                function(gameRef, me) {
                                                    me.vars.render()
                                                }
                                            ]
                                        }
                                    },
                                    "width": config.diameter,
                                    "height": config.diameter,
                                    "id": buttonID
                                }
                                game.game.sprites.push(sprite)

                                BeginningJS.internal.createSprite({
                                    "isClone": false,
                                    "i": game.game.sprites.length - 1,
                                    "runScripts": true,
                                    "isInternal": true
                                }, sprite, game, game.game.sprites.length - 1)

                                */
                            }

                            // TODO: What if it's an invalid type?
                        },
                        "internal": {
                            "game": game
                        }
                    },
                    "controls": {
                        "joystick": function(optionsInput) {
                            var game = this.internal.game;

                            var options = optionsInput;
                            if (optionsInput == null) {
                                console.error("Oops, looks like you've forgotten the input in the function Game.methods.gui.create.text.modern. It should be type \"object\". ");
                                BeginningJS.internal.oops(game);
                            }

                            options = BeginningJS.internal.checkOb(options, {
                                id: {
                                    types: ["string"],
                                    description: "The ID for the joystick."
                                }
                            }, {
                                circle: {
                                    default: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiB2aWV3Qm94PSIwIDAgMTA1IDEwNSIgd2lkdGg9IjEwNSIgaGVpZ2h0PSIxMDUiPjxkZWZzPjxwYXRoIGQ9Ik0xMDIuNSA1Mi41QzEwMi41IDgwLjEgODAuMSAxMDIuNSA1Mi41IDEwMi41QzI0LjkgMTAyLjUgMi41IDgwLjEgMi41IDUyLjVDMi41IDI0LjkgMjQuOSAyLjUgNTIuNSAyLjVDODAuMSAyLjUgMTAyLjUgMjQuOSAxMDIuNSA1Mi41WiIgaWQ9ImkyQlNLa2dveHIiPjwvcGF0aD48L2RlZnM+PGc+PGc+PGc+PGc+PHVzZSB4bGluazpocmVmPSIjaTJCU0trZ294ciIgb3BhY2l0eT0iMSIgZmlsbC1vcGFjaXR5PSIwIiBzdHJva2U9IiMwMGZmZWEiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLW9wYWNpdHk9IjEiPjwvdXNlPjwvZz48L2c+PC9nPjwvZz48L3N2Zz4=",
                                    types: ["string"],
                                    description: "The src for the circle."
                                },
                                joystick: {
                                    default: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiB2aWV3Qm94PSIwIDAgMTEgMTEiIHdpZHRoPSIxMSIgaGVpZ2h0PSIxMSI+PGRlZnM+PHBhdGggZD0iTTEwLjUgNS41QzEwLjUgOC4yNiA4LjI2IDEwLjUgNS41IDEwLjVDMi43NCAxMC41IDAuNSA4LjI2IDAuNSA1LjVDMC41IDIuNzQgMi43NCAwLjUgNS41IDAuNUM4LjI2IDAuNSAxMC41IDIuNzQgMTAuNSA1LjVaIiBpZD0iYzk5YkIwWm5rIj48L3BhdGg+PC9kZWZzPjxnPjxnPjxnPjx1c2UgeGxpbms6aHJlZj0iI2M5OWJCMFpuayIgb3BhY2l0eT0iMSIgZmlsbD0iIzAwMDZmZiIgZmlsbC1vcGFjaXR5PSIxIj48L3VzZT48Zz48dXNlIHhsaW5rOmhyZWY9IiNjOTliQjBabmsiIG9wYWNpdHk9IjEiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlPSIjMDBmMGZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIxIj48L3VzZT48L2c+PC9nPjwvZz48L2c+PC9zdmc+",
                                    types: ["string"],
                                    description: "The src for the joystick."
                                },
                                x: {
                                    default: game.width - 150,
                                    types: ["number"],
                                    description: "The x position of the circle."
                                },
                                y: {
                                    default: game.height - 150,
                                    types: ["number"],
                                    description: "The y position of the circle."
                                },
                                width: {
                                    default: 150,
                                    types: ["number"],
                                    description: "The width of the circle."
                                },
                                height: {
                                    default: 150,
                                    types: ["number"],
                                    description: "The height of the circle."
                                }
                            }, "function Game.methods.gui.create.controls.joystick", "the function Game.methods.gui.create.controls.joystick arguments");

                            if (game.internal.IDIndex[options.id] != null) {
                                console.error("Oops, looks like you've tried to use an ID for a joystick that has already been used. Try and think of something else.");
                                BeginningJS.internal.oops(game);
                            }

                            game.input.joysticks[options.id] = [];


                            // Circle

                            var i = 0
                            while (game.internal.IDIndex["Internal.GUI.joystickCircle#" + i] != null) {
                                i++;
                            }
                            var circleID = "Internal.GUI.joystickCircle#" + i;
                            var i = 0;
                            while (game.internal.IDIndex["Internal.GUI.joystick#" + i] != null) {
                                i++;
                            }
                            var joystickID = "Internal.GUI.joystick#" + i;


                            var sprite = {
                                "x": options.x,
                                "y": options.y,
                                "img": "Internal.GUI.joystickCircle",
                                "vars": {
                                    "joystickID": joystickID,
                                    "ready": false,
                                    "id": options.id
                                },
                                "scripts": {
                                    "init": [
                                        {
                                            "code": function(gameRef, me) {},
                                            "stateToRun": game.state
                                        }
                                    ],
                                    "main": [
                                        {
                                            "code": function(gameRef, me) {
                                                if (gameRef.internal.assets.imgs["Internal.GUI.joystick"].internal.loaded) {
                                                    if (! me.vars.ready) {
                                                        me.visible = true
                                                        me.vars.ready = true
                                                    }
                                                }

                                                if (me.vars.ready) {
                                                    me.bringToFront()
                                                    if (BeginningJS.device.is.touchscreen) {
                                                        me.visible = true
                                                    }
                                                    else {
                                                        me.visible = false
                                                    }
                                                }
                                            },
                                            "stateToRun": game.state
                                        }
                                    ]
                                },
                                "width": options.width,
                                "height": options.height,
                                "id": circleID,
                                "visible": false
                            };
                            game.game.sprites.push(sprite);
                            if (game.internal.assets.imgs["Internal.GUI.joystickCircle"] == null) {
                                // TODO: Use an existing asset?

                                var img = new Image();
                                img.onload = function() {
                                    var game = BeginningJS.internal.games[this.id];
                                    this.removeAttribute("id");

                                    game.internal.assets.imgs["Internal.GUI.joystickCircle"].internal.loaded = true;
                                };
                                img.id = game.ID;
                                img.src = options.circle;
                                game.internal.assets.imgs["Internal.GUI.joystickCircle"] = {
                                    "img": img,
                                    "internal": {
                                        "loaded": false
                                    }
                                };
                            }


                            BeginningJS.internal.createSprite({
                                isClone: false,
                                idIndex: game.game.sprites.length - 1,
                                runScripts: true,
                                isInternal: true
                            }, sprite, game, game.game.sprites.length - 1);



                            // Joystick


                            var sprite = {
                                "x": options.x,
                                "y": options.y,
                                "img": "Internal.GUI.joystick",
                                "vars": {
                                    "circleID": circleID,
                                    "ready": false,
                                    "dragging": false,
                                    "id": options.id
                                },
                                "scripts": {
                                    "init": [
                                        {
                                            "code": function(gameRef, me) {

                                            },
                                            "stateToRun": game.state
                                        }
                                    ],
                                    "main": [
                                        {
                                            "code": function(gameRef, me) {
                                                if (gameRef.internal.assets.imgs["Internal.GUI.joystick"].internal.loaded) {
                                                    if (! me.vars.ready) {
                                                        me.vars.circle = BeginningJS.methods.get.sprite(me.vars.circleID)

                                                        me.visible = true
                                                        me.vars.ready = true
                                                    }
                                                }

                                                if (me.vars.ready) {
                                                    me.bringToFront()

                                                    if (gameRef.input.mouse.down) {
                                                        if (me.touching.mouse.AABB()) {
                                                            me.vars.dragging = true
                                                        }
                                                    }
                                                    else {
                                                        me.vars.dragging = false
                                                        me.x = me.vars.circle.x
                                                        me.y = me.vars.circle.y

                                                        gameRef.input.joysticks[me.vars.id] = []
                                                    }
                                                    if (BeginningJS.device.is.touchscreen) {
                                                        me.visible = true
                                                    }
                                                    else {
                                                        me.visible = false
                                                        return
                                                    }
                                                    if (me.vars.dragging) {
                                                        if (me.touching.mouse.AABB()) {
                                                            me.x = me.last.collision.x
                                                            me.y = me.last.collision.y
                                                        }
                                                        else {
                                                            me.x = gameRef.input.mouse.x
                                                            me.y = gameRef.input.mouse.y
                                                        }
                                                        //me.x = Math.max(Math.min(me.x, me.vars.circle.x + (me.vars.circle.width / 2)), me.vars.circle.x - (me.vars.circle.width / 2))
                                                        //me.y = Math.max(Math.min(me.y, me.vars.circle.y + (me.vars.circle.height / 2)), me.vars.circle.y - (me.vars.circle.height / 2))

                                                        var prefix = ""

                                                        var distance = Math.abs(me.x - me.vars.circle.x) + Math.abs(me.y - me.vars.circle.y)
                                                        if (distance > me.vars.circle.width / 2) {
                                                            var direction = BeginningJS.methods.maths.getDirection(me.vars.circle.x, me.vars.circle.y, me.x, me.y) // TODO

                                                            me.x = me.vars.circle.x
                                                            me.y = me.vars.circle.y

                                                            me.move(me.vars.circle.width / 2, direction)
                                                        }
                                                        else {
                                                            prefix += "~"
                                                        }

                                                        var offsetX = me.x - me.vars.circle.x
                                                        var offsetY = me.y - me.vars.circle.y

                                                        var inputs = []
                                                        if (offsetX < -(me.width / 2)) {
                                                            inputs.push(prefix + "left")
                                                        }
                                                        if (offsetX > me.width / 2) {
                                                            inputs.push(prefix + "right")
                                                        }
                                                        if (offsetY < -(me.height / 2)) {
                                                            inputs.push(prefix + "up")
                                                        }
                                                        if (offsetY > me.height / 2) {
                                                            inputs.push(prefix + "down")
                                                        }
                                                        gameRef.input.joysticks[me.vars.id] = inputs
                                                    }
                                                }
                                            },
                                            "stateToRun": game.state
                                        }
                                    ]
                                },
                                "width": options.width / 2,
                                "height": options.height / 2,
                                "id": joystickID,
                                "visible": false
                            };
                            game.game.sprites.push(sprite);
                            if (game.internal.assets.imgs["Internal.GUI.joystick"] == null) { // TODO: reserve
                                var img = new Image();
                                img.onload = function() {
                                    var game = BeginningJS.internal.games[this.id];
                                    this.removeAttribute("id");

                                    game.internal.assets.imgs["Internal.GUI.joystick"].internal.loaded = true;
                                }
                                img.id = game.ID;
                                img.src = options.joystick;
                                game.internal.assets.imgs["Internal.GUI.joystick"] = {
                                    "img": img,
                                    "internal": {
                                        "sprite": sprite,
                                        "loaded": false
                                    }
                                };
                            }

                            BeginningJS.internal.createSprite({
                                isClone: false,
                                idIndex: game.game.sprites.length - 1,
                                runScripts: true,
                                isInternal: true
                            }, sprite, game, game.game.sprites.length - 1);
                        },
                        "internal": {
                            "game": game
                        }
                    }
                },
                "internal": {
                    "game": game,
                    "createIndex": function(config) {
                        var game = this.game;

                        if (game.internal.IDIndex["Internal.GUI.menu.index"] == null) {
                            var sprite = {
                                type: "renderer",
                                vars: {
                                    submenu: config.submenu,
                                    elements: [],
                                    switching: false,
                                    popup: false
                                },
                                scripts: {
                                    init: [
                                        {
                                            code: function() {

                                            },
                                            stateToRun: game.state
                                        }
                                    ],
                                    main: [
                                        {
                                            code: function() {

                                            },
                                            stateToRun: game.state
                                        }
                                    ],
                                    steps: {}
                                },
                                id: "Internal.GUI.menu.index",
                                render: () => {
                                    // Nothing to render
                                }
                            };
                            game.game.sprites.push(sprite);

                            BeginningJS.internal.createSprite({
                                isClone: false,
                                idIndex: game.game.sprites.length - 1,
                                runScripts: true,
                                isInternal: true
                            }, sprite, game, game.game.sprites.length - 1);
                        }
                    }
                }
            }
        };


        var game = game;
        game.internal.renderer.canvas = document.createElement("canvas");
        game.internal.renderer.canvas.addEventListener("mousemove", function(context) {
            var game = context.target.game;

            var rect = game.internal.renderer.canvas.getBoundingClientRect();

            game.input.mouse.x = Math.round(((context.clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width);
            game.input.mouse.y = Math.round(((context.clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height);
        }, false);
        game.internal.renderer.canvas.addEventListener("mousedown", function(context) {
            var game = context.target.game;

            BeginningJS.device.is.touchscreen = false;

            BeginningJS.internal.autoplaySounds();

            game.input.mouse.down = true;
        }, false);
        game.internal.renderer.canvas.addEventListener("mouseup", function(context) {
            var game = context.target.game;

            BeginningJS.internal.autoplaySounds();

            game.input.mouse.down = false;
        }, false);
        game.internal.renderer.canvas.addEventListener("touchstart", function(context) {
            var game = context.target.game;

            BeginningJS.device.is.touchscreen = true;

            var rect = game.internal.renderer.canvas.getBoundingClientRect();

            if (context.touches == null) {
                game.input.mouse.x = Math.round(((context.clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width);
                game.input.mouse.y = Math.round(((context.clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height);
                game.input.touches = [
                    {
                        "x": game.input.mouse.x,
                        "y": game.input.mouse.y
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
                        "x": Math.round(((context.touches[i].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width),
                        "y": Math.round(((context.touches[i].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)
                    });
                }
            }
            BeginningJS.internal.autoplaySounds();

            game.input.mouse.down = true;
            context.preventDefault();
        }, false);
        game.internal.renderer.canvas.addEventListener("touchmove", function(context) {
            var game = context.target.game;

            BeginningJS.device.is.touchscreen = true;

            var rect = game.internal.renderer.canvas.getBoundingClientRect();

            if (context.touches == null) {
                game.input.mouse.x = Math.round(((context.clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width);
                game.input.mouse.y = Math.round(((context.clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height);
                game.input.touches = [
                    {
                        "x": game.input.mouse.x,
                        "y": game.input.mouse.y
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
                        "x": Math.round(((context.touches[i].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width),
                        "y": Math.round(((context.touches[i].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)
                    });
                }
            }
            BeginningJS.internal.autoplaySounds();

            game.input.mouse.down = true;
            context.preventDefault();
        }, false);
        game.internal.renderer.canvas.addEventListener("touchend", function(context) {
            var game = context.target.game;

            BeginningJS.device.is.touchscreen = true;

            game.input.touches = [];
            BeginningJS.internal.autoplaySounds();

            game.input.mouse.down = false;
            context.preventDefault();
        }, false);
        document.addEventListener("keydown", function(context) {
            var i = 0;
            for (i in BeginningJS.internal.games) {
                var game = BeginningJS.internal.games[i];
                game.input.keys.keys[context.keyCode] = true;
            }
        }, false);
        document.addEventListener("keyup", function(context) {
            var i = 0;
            for (i in BeginningJS.internal.games) {
                var game = BeginningJS.internal.games[i];
                game.input.keys.keys[context.keyCode] = false;
            }
        }, false);

        game.internal.renderer.canvas.game = game;

        if (game.config.display.fillScreen) {
            game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); position: absolute; top:0; bottom: 0; left: 0; right: 0; margin: auto;"; // CSS from Phaser (https://phaser.io)
        }
        else {
            game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);" ;// CSS from Phaser (https://phaser.io)
        }
        game.internal.renderer.ctx = game.internal.renderer.canvas.getContext("2d");
        game.internal.renderer.canvas.width = game.width;
        game.internal.renderer.canvas.height = game.height;



        document.addEventListener("readystatechange", function() {
            if (document.readyState == "complete") {
                var i = 0;
                for (i in BeginningJS.internal.games) {
                    var game = BeginningJS.internal.games[i];
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

        game.internal.renderer.ctx.imageSmoothingEnabled = false;


        game.internal.scripts = {
            "index": {
                "init": {},
                "main": {},
                "spritesInit": {},
                "spritesMain": {}
            }
        };

        // Check stuff

        // Assets
        game.internal.assets = {
            "loading": 0,
            "loaded": 0,
            "imgs": {},
            "snds": {}
        };
        var i = 0;
        for (i in game.game.assets.imgs) {
            if (BeginningJS.internal.getTypeOf(game.game.assets.imgs[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define an asset. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.assets.imgs[i])) + " in ''GameJSON.game.assets.imgs' item '" + i + "'.");
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            game.game.assets.imgs[i] = BeginningJS.internal.checkOb(game.game.assets.imgs[i], {
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
            if (game.internal.assets.imgs.hasOwnProperty(game.game.assets.imgs[i].id)) {
                console.error("Oh no! You used an ID for an asset that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.game.assets.imgs[i].id) + " in 'GameJSON.game.assets.imgs item " + i + "'.");
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            if (game.game.assets.imgs[i].id.includes("Internal.")) {
                console.error("Oops! Looks like you tried to use the reserved asset starter. These just allow Beginning.js to load some of its own assets for things like GUI sprites. \nYou used " + JSON.stringify(game.game.assets.imgs[i].id) + " in 'GameJSON.game.assets.imgs item " + i + "'.");
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }

            BeginningJS.internal.load.img(game.game.assets.imgs[i], game);
        }

        if (document.readyState == "complete") {
            BeginningJS.internal.loadImages();
        }

        var i = 0;
        for (i in game.game.assets.snds) {
            if (BeginningJS.internal.getTypeOf(game.game.assets.snds[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define an asset. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.assets.snds[i])) + " in ''GameJSON.game.assets.snds' item '" + i + "'.");
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            game.game.assets.snds[i] = BeginningJS.internal.checkOb(game.game.assets.snds[i], {
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
            if (game.internal.assets.snds.hasOwnProperty(game.game.assets.snds[i].id)) {
                console.error("Oh no! You used an ID for an asset that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.game.assets.snds[i].id) + " in 'GameJSON.game.assets.snds item " + i + "'.");
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }
            if (game.game.assets.snds[i].id.includes("Internal.")) {
                console.error("Oops! Looks like you tried to use the reserved asset starter. These just allow Beginning.js to load some of its own assets for things like GUI sprites. \nYou used " + JSON.stringify(game.game.assets.snds[i].id) + " in 'GameJSON.game.assets.snds item " + i + "'.");
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.");
                error = true;
            }

            BeginningJS.internal.load.snd(game.game.assets.snds[i], game);
        }
        BeginningJS.internal.testAutoPlay = function() {
            try {
                var promise = BeginningJS.internal.autoPlaySound.play();
            }
            catch (error) {
                BeginningJS.internal.autoPlay = false;
            }

            promise.catch(function(error) {
                BeginningJS.internal.autoPlay = false;
                BeginningJS.internal.autoPlaySound.pause();
            })
            BeginningJS.internal.autoPlay = true;
        }


        BeginningJS.internal.autoPlay = false;
        BeginningJS.internal.autoPlaySound = new Audio();
        BeginningJS.internal.autoPlaySound.oncanplay = BeginningJS.internal.testAutoPlay;
        BeginningJS.internal.autoPlaySound.src = "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABQTEFNRTMuOTlyBLkAAAAAAAAAADUgJAa/QQAB4AAAAnE5mRCNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAAB/gAAACAAAD/AAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDEKYPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==";


        // Scripts
        var i = 0;
        for (i in game.game.scripts.init) {
            if (BeginningJS.internal.getTypeOf(game.game.scripts.init[i]) != "object") {
                console.error("Oh no! You need to use the type \"object\" to define a script. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.scripts.init[i])) + " in GameJSON.game.scripts.init item " + i + ".");
            }
            game.game.scripts.init[i] = BeginningJS.internal.checkOb(game.game.scripts.init[i], {
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
            }, {}, "GameJSON.game.scripts.init item " + i + ".", "ScriptJSON", game, true);
            if (game.internal.scripts.index.init[game.game.scripts.init[i].stateToRun] == null) {
                game.internal.scripts.index.init[game.game.scripts.init[i].stateToRun] = [];
            }
            game.internal.scripts.index.init[game.game.scripts.init[i].stateToRun][game.internal.scripts.index.init[game.game.scripts.init[i].stateToRun].length] = i;
        }
        var i = 0;
        for (i in game.game.scripts.main) {
            if (BeginningJS.internal.getTypeOf(game.game.scripts.main[i]) != "object") {
                console.error("Oh no! You need to use the type \"object\" to define a script. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.scripts.main[i])) + " in GameJSON.game.scripts.main item " + i + ".");
                BeginningJS.internal.oops(game, false, true);
            }
            game.game.scripts.main[i] = BeginningJS.internal.checkOb(game.game.scripts.main[i], {
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
            }, {}, "GameJSON.game.scripts.main item " + i + ".", "ScriptJSON", game, true);
            if (game.internal.scripts.index.main[game.game.scripts.main[i].stateToRun] == null) {
                game.internal.scripts.index.main[game.game.scripts.main[i].stateToRun] = [];
            }
            game.internal.scripts.index.main[game.game.scripts.main[i].stateToRun][game.internal.scripts.index.main[game.game.scripts.main[i].stateToRun].length] = i;
        }

        // Sprites
        var i = 0;
        for (i in game.game.sprites) {
            var sprite = BeginningJS.internal.createSprite({
                isClone: false,
                idIndex: parseInt(i)
            }, game.game.sprites[i], game, i);
        }

        if (typeof game.game.scripts.preload == "function") {
            game.game.scripts.preload(game);
        }

        BeginningJS.internal.games[game.ID] = game;

        BeginningJS.internal.current.game = null;

        return game;
    },
    internal: {
        an: (str) => ["a", "e", "i", "o", "u"].includes(str[0].toLowerCase())? "an " + str : "a " + str,
        oops: (game, noID, dontPause) => { // When something goes wrong
            if (noID) {
                throw "Critical Beginning.js error, please look at the error above for more info.";
            }
            if (! dontPause) {
                game.paused = true;
            }
            throw "Critical Beginning.js error in the game " + JSON.stringify(game.ID) + ", look at the error for some help. ^-^";
        },
        current: {
            "sprite": null,
            "game": null
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
                var sprite = BeginningJS.internal.checkOb(spriteData, {}, {
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
                    var sprite = BeginningJS.internal.checkOb(spriteData, {}, {
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
                            description: "Determines whether Beginning.js should allow the canvas resolution to be changed."
                        }
                    }, "the function \"sprite.clone\" cloning the sprite " + JSON.stringify(data.spriteToClone) + ".", "function cloneSprite arguments (merged with the parentSprite's arguments)", game);
                }
                else {
                    if (type == "renderer") {
                        var sprite = BeginningJS.internal.checkOb(spriteData, {}, {
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
                        BeginningJS.internal.oops(game);
                    }
                }
            }
            sprite.scripts = BeginningJS.internal.checkOb(sprite.scripts, {}, {
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
                if (BeginningJS.internal.getTypeOf(sprite.scripts.init[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of init scripts. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(sprite.scripts.init[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    //console.log(sprite.scripts.init[c])
                    console.error("Beginning.js hit a critical error, look at the error above for more information.")
                    debugger
                    // TODO: Clearer error
                }
            }
            var c = 0;
            for (c in sprite.scripts.main) {
                if (BeginningJS.internal.getTypeOf(sprite.scripts.main[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of main scripts. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(sprite.scripts.main[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    //console.log(sprite.scripts.main[c])
                    console.error("Beginning.js hit a critical error, look at the error above for more information.")
                    debugger
                    // TODO: Clearer error
                }
            }
        },
        createSprite: function(data, spriteData, game) {
            if (data.isClone) {
                var parent = BeginningJS.methods.get.sprite(data.cloneOf);
                BeginningJS.internal.checkClones(spriteData, data, game, parent);
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
                    scriptIDs: scriptIDs
                };
                sprite.game = game;
                sprite.idIndex = data.idIndex;

                if (sprite.type == "canvas") {
                    sprite.canvas = document.createElement("canvas");
                    sprite.canvas.width = sprite.width;
                    sprite.canvas.height = sprite.height;
                    sprite.ctx = sprite.canvas.getContext("2d");

                    sprite.scaled = {};
                    sprite.scaled.width = BeginningJS.internal.render.scale.x(sprite.width, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                    sprite.scaled.height = BeginningJS.internal.render.scale.y(sprite.height, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;

                    sprite.scale = {};
                    sprite.scale.internal = {
                        "game": game,
                        "sprite": sprite
                    };
                    sprite.scale.x = function(x) {
                        return BeginningJS.internal.render.scale.x(x, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas) * this.internal.sprite.res;
                    }
                    sprite.scale.y = function(y) {
                        return BeginningJS.internal.render.scale.y(y, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas) * this.internal.sprite.res;
                    }
                }
                else {
                    if (sprite.type == "renderer") {
                        sprite.canvas = game.internal.renderer.canvas;
                        sprite.ctx = game.internal.renderer.ctx;

                        sprite.scale = {};
                        sprite.scale.internal = {
                            "game": game,
                            "sprite": sprite
                        };
                        sprite.scale.x = function(x) {
                            return BeginningJS.internal.render.scale.x(x, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas);
                        }
                        sprite.scale.y = function(y) {
                            return BeginningJS.internal.render.scale.y(y, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas);
                        }

                        game.internal.renderer.renderers[sprite.order].push({
                            "code": sprite.render,
                            "game": game,
                            "sprite": sprite
                        });
                        sprite.internal.rendererID = game.internal.renderer.renderers[sprite.order].length - 1;
                    }
                }

                //BeginningJS.internal.spriteTick(sprite, game); // TODO
            }
            else {
                if (spriteData.type == null) {
                    spriteData.type = "sprite"
                }
                if (spriteData.type == "sprite") {
                    var sprite = BeginningJS.internal.checkOb(spriteData, {
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
                        var sprite = BeginningJS.internal.checkOb(spriteData, {
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
                                    "init": [],
                                    "main": []
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
                                description: "Determines whether Beginning.js should allow the canvas resolution to be changed."
                            }
                        }, "GameJSON.game.sprites item " + data.idIndex + ".", "SpriteJSON", game);

                        sprite.canvas = document.createElement("canvas");
                        sprite.canvas.width = sprite.width;
                        sprite.canvas.height = sprite.height;
                        sprite.ctx = sprite.canvas.getContext("2d");

                        sprite.scaled = {};
                        sprite.scaled.width = BeginningJS.internal.render.scale.x(sprite.width, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                        sprite.scaled.height = BeginningJS.internal.render.scale.y(sprite.height, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;

                        sprite.scale = {};
                        sprite.scale.internal = {
                            "game": game,
                            "sprite": sprite
                        };
                        sprite.scale.x = function(x) {
                            return BeginningJS.internal.render.scale.x(x, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas) * this.internal.sprite.res;
                        }
                        sprite.scale.y = function(y) {
                            return BeginningJS.internal.render.scale.y(y, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas) * this.internal.sprite.res;
                        }
                    }
                    else {
                        if (spriteData.type == "renderer") {
                            var sprite = BeginningJS.internal.checkOb(spriteData, {
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
                                        "init": [],
                                        "main": []
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
                                "game": game,
                                "sprite": sprite
                            };
                            sprite.scale.x = function(x) {
                                return BeginningJS.internal.render.scale.x(x, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas);
                            }
                            sprite.scale.y = function(y) {
                                return BeginningJS.internal.render.scale.y(y, this.internal.game.internal.renderer, this.internal.game.internal.renderer.canvas);
                            }

                            // TODO: What if it's not one of the options?

                            if (! ["high", "low"].includes(sprite.order)) {
                                console.error("Oops, you used an invalid option. It can only be either \"high\" or \"low\". \nYou used " + JSON.stringify(sprite.order) + " in 'GameJSON.game.sprites item' " + data.idIndex + " -> order.");
                                console.log("Sprite JSON:");
                                console.log(sprite);
                                BeginningJS.internal.oops(game);
                            }

                            game.internal.renderer.renderers[sprite.order].push({
                                "code": sprite.render,
                                "game": game,
                                "sprite": sprite
                            });
                        }
                        else {
                            console.error("Oh no! You used an invalid type for a sprite. \nYou used " + JSON.stringify(sprite.type) + " in 'GameJSON.game.sprites item' " + data.idIndex + ".");
                            BeginningJS.internal.oops(game);
                        }
                    }
                }

                sprite.scripts = BeginningJS.internal.checkOb(sprite.scripts, {}, {
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
                    "cloneCount": 0,
                    "cloneIDs": [],
                    "collision": {}
                };

                if (spriteData.type == "renderer") {
                    sprite.internal.rendererID = game.internal.renderer.renderers[sprite.order].length - 1;
                }
                sprite.game = game;
                sprite.idIndex = parseInt(data.idIndex);

                if (game.internal.IDIndex[sprite.id] != null) {
                    // TODO: Better error message
                    console.error("Oh no! You used an ID for a sprite that is already being used. Try and think of something else. \nYou used " + JSON.stringify(sprite.id) + " in 'GameJSON.game.sprites item' " + data.idIndex + ".")
                    BeginningJS.internal.oops(game);
                }
                if (! data.isInternal) {
                    if (sprite.id.includes("Internal.")) {
                        console.error("Oops! Looks like you tried to use the reserved asset starter. These just allow Beginning.js to load some of its own assets for things like GUI sprites. \nYou used " + JSON.stringify(sprite.id) + " in 'GameJSON.game.sprites item " + data.idIndex + "'.")
                        BeginningJS.internal.oops(game);
                    }
                }
                game.internal.IDIndex[sprite.id] = data.idIndex;
            }
            sprite.layer = game.internal.renderer.layers.length;
            game.internal.renderer.layers.push(data.idIndex);

            // Sprite methods

            sprite.bringToFront = function() { // TODO: What about for renderers?
                var spriteWas = BeginningJS.internal.current.sprite;
                var gameWas = BeginningJS.internal.current.game;

                var sprite = this;
                BeginningJS.internal.current.sprite = sprite;
                var game = sprite.game;
                BeginningJS.internal.current.game = game;



                var copyID = game.internal.renderer.layers.indexOf(sprite.idIndex);
                var copy = game.internal.renderer.layers[copyID];

                // TODO: What if there're no sprites?

                if (game.internal.renderer.layers[game.internal.renderer.layers.length - 1] == sprite.idIndex) {
                    BeginningJS.internal.current.sprite = spriteWas;
                    BeginningJS.internal.current.game = gameWas;
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

                BeginningJS.internal.current.sprite = spriteWas;
                BeginningJS.internal.current.game = gameWas;
            }
            sprite.bringForwards = function() {
                var spriteWas = BeginningJS.internal.current.sprite;
                var gameWas = BeginningJS.internal.current.game;

                var sprite = this;
                BeginningJS.internal.current.sprite = sprite;
                var game = sprite.game;
                BeginningJS.internal.current.game = game;



                var copyID = game.internal.renderer.layers.indexOf(sprite.idIndex);
                var copy = game.internal.renderer.layers[copyID];

                // TODO: What if there're no sprites?

                if (game.internal.renderer.layers[game.internal.renderer.layers.length - 1] == sprite.idIndex) {
                    BeginningJS.internal.current.sprite = spriteWas;
                    BeginningJS.internal.current.game = gameWas;
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

                BeginningJS.internal.current.sprite = spriteWas;
                BeginningJS.internal.current.game = gameWas;
            }
            sprite.sendToBack = function() {
                var spriteWas = BeginningJS.internal.current.sprite;
                var gameWas = BeginningJS.internal.current.game;

                var sprite = this;
                BeginningJS.internal.current.sprite = sprite;
                var game = sprite.game;
                BeginningJS.internal.current.game = game;



                var copyID = game.internal.renderer.layers.indexOf(sprite.idIndex);
                var copy = game.internal.renderer.layers[copyID];

                // TODO: What if there're no sprites?

                if (game.internal.renderer.layers[0] == sprite.idIndex) {
                    BeginningJS.internal.current.sprite = spriteWas;
                    BeginningJS.internal.current.game = gameWas;
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

                BeginningJS.internal.current.sprite = spriteWas;
                BeginningJS.internal.current.game = gameWas;
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
                            var rect = BeginningJS.internal.collision.methods.spriteRect(me, 2, 1);
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
                                if (BeginningJS.internal.collision.methods.AABB(
                                    rect,
                                    BeginningJS.internal.collision.methods.spriteRect(parentSprite, 2, 1))
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

                                if (BeginningJS.internal.collision.methods.AABB(
                                    rect,
                                    BeginningJS.internal.collision.methods.spriteRect(clone, 2, 1))
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
                            var rect = BeginningJS.internal.collision.methods.spriteRect(me, 2, 1);
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
                        if (BeginningJS.device.is.touchscreen && game.input.touches.length > 0) {
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

                var rad = BeginningJS.methods.maths.degToRad(me.angle - 90);

                me.x += Math.cos(rad) * distance;
                me.y += Math.sin(rad) * distance;
            };
            sprite.clone = function(inputCloneData) {
                var spriteWas = BeginningJS.internal.current.sprite;
                var gameWas = BeginningJS.internal.current.game;


                var sprite = this;
                var game = sprite.game;
                BeginningJS.internal.current.sprite = sprite;
                BeginningJS.internal.current.game = game;

                if (inputCloneData == null) {
                    var cloneData = {};
                }
                else {
                    var cloneData = inputCloneData;
                }

                var id = BeginningJS.internal.findCloneID(sprite, game);
                var cloneSpriteID = BeginningJS.internal.findSpriteID(game);
                sprite.internal.cloneIDs[id] = sprite.id;
                sprite.internal.cloneCount++;
                
                var newSpriteData = {};
                newSpriteData = {...BeginningJS.internal.deepClone(sprite.clones), ...cloneData}; // Merge the .clones atrribute argument with the input to the function

                var newSprite = BeginningJS.internal.createSprite({
                    isClone: true,
                    cloneOf: sprite.id,
                    idIndex: cloneSpriteID
                }, newSpriteData, game);
                newSprite.id = sprite.id + "#" + id;
                newSprite.cloneID = id;
                game.game.sprites[cloneSpriteID] = newSprite;
                game.internal.IDIndex[sprite.id + "#" + id] = cloneSpriteID;

                BeginningJS.internal.current.sprite = newSprite;

                var i = 0;
                for (i in newSprite.scripts.init) {
                    newSprite.scripts.init[i](BeginningJS.internal.current.game, newSprite, BeginningJS.methods.step);
                }

                BeginningJS.internal.current.sprite = spriteWas;
                BeginningJS.internal.current.game = gameWas;

                return newSprite;
            };
            sprite.switch = function(imgID) {
                var me = this;
                var game = me.game;
                // What if it's not run as a sprite? TODO

                if (game.internal.assets.imgs[imgID] == null) {
                    console.error("Oops. You tried to switch the image of the sprite with the ID " + me.id + " to an image with the ID of " + imgID + ".");
                    console.error("Beginning.js hit a critical error, have a look at the error abovr for more info.");
                    debugger;
                }

                me.img = imgID;
                var asset = game.internal.assets.imgs[imgID];
                me.width = asset.img.width;
                me.height = asset.img.height;
            };
            sprite.setScale = function(x, y) {
                var me = this;

                // Reset to the default dimensions
                var img = BeginningJS.methods.get.image(me.img, me.game);
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


                // TODO \/\/\/\/\/\/
                /*
                var newIdIndex = {};
                var newSprites = [];
                var i = 0;
                for (i in game.game.sprites) {
                    if (game.game.sprites[i] != null) {
                        newSprites.push(game.game.sprites[i]);
                        if (i > idWas) {
                            game.game.sprites[i].idIndex--;
                        }
                        var spriteID = game.game.sprites[i].id;
                        newIdIndex[spriteID] = game.internal.IDIndex[spriteID];
                    }
                }
                game.internal.IDIndex = newIdIndex;
                game.game.sprites = newSprites;
                */

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
                    if (BeginningJS.internal.getTypeOf(scripts[c]) != "object") {
                        // TODO: Better error
                        console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.sprites[data.i].scripts.init[c])) + " in ''GameJSON.game.game.sprites' item " + c + " -> scripts.init.");
                        console.error("Beginning.js hit a critical error, look at the error above for more information.");
                        debugger;
                    }
                    scripts[c] = BeginningJS.internal.checkOb(scripts[c], {
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
                    if (BeginningJS.internal.getTypeOf(scripts[c]) != "object") {
                        console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.sprites[data.i].scripts.main[c])) + " in ''GameJSON.game.game.sprites' item " + c + " -> scripts.main.");
                        console.error("data.Beginning.js hit a critical error, look at the error above for more information.");
                        debugger;
                    }
                    scripts[c] = BeginningJS.internal.checkOb(scripts[c], {
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
                    var spriteWas = BeginningJS.internal.current.sprite;
                    var gameWas = BeginningJS.internal.current.game;

                    BeginningJS.internal.current.sprite = sprite;
                    BeginningJS.internal.current.game = game;

                    var i = 0;
                    for (i in sprite.scripts.init) {
                        var script = sprite.scripts.init[i];
                        script.code(BeginningJS.internal.current.game, BeginningJS.internal.current.sprite);
                    }

                    BeginningJS.internal.current.sprite = spriteWas;
                    BeginningJS.internal.current.game = gameWas;
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

            return sprite;
        },
        getTypeOf: function(entity) {
            if (Array.isArray(entity)) {
                return "array"
            }
            if (entity == null) {
                return "undefined"
            }
            return typeof entity
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
                            if (! required[i].types.includes(BeginningJS.internal.getTypeOf(ob[i]))) {
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
                        if (! optional[i].types.includes(BeginningJS.internal.getTypeOf(ob[i]))) {
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
                            message.push(" • " + c + " -> " + required[c].description + "\n You've the type " + JSON.stringify(BeginningJS.internal.getTypeOf(ob[c])) + ", but it can only be " + BeginningJS.internal.an(required[c].types[0]) + ".\n");
                        }
                        else {
                            message.push(" " + c + " -> " + required[c].description + " \n You used the type " + JSON.stringify(BeginningJS.internal.getTypeOf(ob[c])) + ", it has to be one of these types:\n");
                            var a = 0;
                            for (a in required[c].types) {
                                message.push(" - " + BeginningJS.internal.an(required[c].types[a]) + "\n");
                            }
                        }
                    }
                    else {
                        if (optional[c].types.length == 1) {
                            message.push(" • " + c + " -> " + optional[c].description + "\n You used the type " + JSON.stringify(BeginningJS.internal.getTypeOf(ob[c])) + ", but it can only be " + BeginningJS.internal.an(optional[c].types[0]) + ".\n");
                        }
                        else {
                            message.push(" • " + c + " -> " + optional[c].description + " \n You used the type " + JSON.stringify(BeginningJS.internal.getTypeOf(ob[c])) + ", it has to be one of these types: \n");
                            var a = 0;
                            for (a in optional[c].types) {
                                message.push(" • " + BeginningJS.internal.an(optional[c].types[a]) + "\n");
                            }
                        }
                    }
                }

                console.error(message.join(""));
            }
            if (BeginningJS.config.flags.warnOfUselessParameters) { // Check the flag
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
                    message.push("\n\nTip: You can disable these sorts of warnings by changing the \"warnOfUselessParameters\" flag. \nUse: \"BeginningJS.config.flags.warnOfUselessParameters = false\" :).");
                    console.warn(message.join(""));
                }
            }

            if (missing.length > 0 || wrongTypes.length > 0) { // Was there an error?
                console.log(obType + ":");
                console.log(ob);
                BeginningJS.internal.oops(game, noID, dontPause);
            }
            return newOb;
        },
        requestAnimationFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
        tick: function() {
            var i = 0;
            for (i in BeginningJS.internal.games) {
                if (new Date() - BeginningJS.internal.games[i].internal.lastFPSUpdate > 1000) {
                    BeginningJS.internal.games[i].currentFPS = BeginningJS.internal.games[i].internal.FPSFrames;
                    BeginningJS.internal.games[i].internal.FPSFrames = 0;
                    BeginningJS.internal.games[i].internal.lastFPSUpdate = new Date();
                }
                var start = new Date();
                var ctx = BeginningJS.internal.games[i].internal.renderer.ctx;
                var canvas = BeginningJS.internal.games[i].internal.renderer.canvas;
                var game = BeginningJS.internal.games[i];
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


                if (BeginningJS.internal.games[i].loaded) {
                    var game = BeginningJS.internal.games[i];
                    BeginningJS.internal.current.game = game;


                    BeginningJS.internal.processSprites(game);
                    BeginningJS.internal.scripts(game);
                    game.internal.collision.tick(game);
                    BeginningJS.internal.render.renderFrame[game.internal.renderer.type].call(window, game, game.internal.renderer.canvas, game.internal.renderer.ctx, game.internal.renderer);
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


                    if (BeginningJS.internal.games[i].internal.assets.loading == 0) {
                        BeginningJS.internal.games[i].internal.loadedDelay++;
                        if (BeginningJS.internal.games[i].internal.loadedDelay > BeginningJS.config.fps / 2) {
                            BeginningJS.internal.games[i].loaded = true;
                            var c = 0;
                            for (c in BeginningJS.internal.games[i].game.sprites) {
                                var sprite = BeginningJS.internal.games[i].game.sprites[c];

                                var customDimentions = true;

                                // TODO: What if it doesn't exist?

                                if (sprite.width == "auto") {
                                    sprite.width = BeginningJS.internal.games[i].internal.assets.imgs[sprite.img].img.width;
                                    customDimentions = false;
                                }
                                if (sprite.height == "auto") {
                                    sprite.height = BeginningJS.internal.games[i].internal.assets.imgs[sprite.img].img.height;
                                    customDimentions = false;
                                }
                                if (! customDimentions) {
                                    sprite.width = BeginningJS.internal.games[i].internal.assets.imgs[sprite.img].img.width * sprite.scale;
                                    sprite.height = BeginningJS.internal.games[i].internal.assets.imgs[sprite.img].img.height * sprite.scale;
                                }
                            }
                        }
                    }
                }

                BeginningJS.internal.games[i].internal.FPSFrames++;
                BeginningJS.internal.games[i].currentRenderFPS = 1000 / (new Date() - start);
                var frameTime = new Date() - start;
                BeginningJS.internal.games[i].internal.renderer.lastRender = new Date();
            }


            setTimeout(function() {
                BeginningJS.internal.requestAnimationFrame.call(window, BeginningJS.internal.tick);
            }, (1000 / BeginningJS.config.fps) - frameTime);
        },
        scripts: function(game) {
            if (game.internal.lastState != game.state) {
                var i = 0;
                for (i in game.game.sprites) {
                    var sprite = game.game.sprites[i];
                    sprite.visible = false;
                }

                // TODO: Delete clones

                BeginningJS.internal.current.sprite = null;
                var i = 0;
                for (i in game.internal.scripts.index.init[game.state]) {
                    var script = game.game.scripts.init[game.internal.scripts.index.init[game.state][i]];
                    script.code(game);
                }
                var i = 0;
                for (i in game.internal.scripts.index.spritesInit[game.state]) {
                    var sprite = game.internal.scripts.index.spritesInit[game.state][i].sprite;
                    BeginningJS.internal.current.sprite = game.game.sprites[game.internal.IDIndex[sprite.id]]; // What if it's null?
                    var script = sprite.scripts.init[game.internal.scripts.index.spritesInit[game.state][i].script];

                    if (sprite.type == "canvas") {
                        sprite.scaled.width = BeginningJS.internal.render.scale.x(sprite.width, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                        sprite.scaled.height = BeginningJS.internal.render.scale.y(sprite.height, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                    }

                    sprite.visible = true;
                    script.code(game, sprite, BeginningJS.methods.step);
                }
                game.internal.lastState = game.state;
            }

            BeginningJS.internal.current.sprite = null;
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
                    BeginningJS.internal.current.sprite = game.game.sprites[game.internal.IDIndex[sprite.id]]; // What if it's null?

                    if (sprite.type == "canvas") {
                        if (sprite.customRes) {
                            sprite.scaled.width = BeginningJS.internal.render.scale.x(sprite.width, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
                            sprite.scaled.height = BeginningJS.internal.render.scale.y(sprite.height, game.internal.renderer, game.internal.renderer.canvas) * sprite.res;
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
                        BeginningJS.internal.current.sprite = sprite;
                        sprite.scripts.main[game.internal.scripts.index.spritesMain[game.state][i].script](game, sprite, BeginningJS.methods.step);
                    }
                    else {
                        var script = sprite.scripts.main[game.internal.scripts.index.spritesMain[game.state][i].script];
                        script.code(game, sprite, BeginningJS.methods.step);
                    }

                    if (sprite.id == idWas) { // Detect if it's been deleted
                        sprite.debug.scriptTime = (new Date() - start) / 1000;
                        i++;
                    }
                }

            }

            BeginningJS.internal.current.sprite = null;
            BeginningJS.internal.current.game = null;

        },
        processSprites: function(game) {
            if (false) { // Disabled for now as there's no sprite processing
                var i = 0;
                for (i in game.game.sprites) {
                    var sprite = game.game.sprites[i];
                    BeginningJS.internal.spriteTick(sprite, game);
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
                    var newWidth = window.innerWidth
                    var newHeight = window.innerHeight
                    var ratio = game.width / game.height
                    if (newWidth > newHeight * ratio) {
                        var newWidth = newHeight * ratio
                    }
                    else {
                        var newHeight = newWidth / ratio
                    }

                    if (game.config.display.fillScreen) {
                        if (game.internal.lastWidth != newWidth || game.internal.lastHeight != newHeight) {
                            game.internal.lastWidth = newWidth
                            game.internal.lastHeight = newHeight
                            game.internal.renderer.canvas.width = newWidth * window.devicePixelRatio
                            game.internal.renderer.canvas.height = newHeight * window.devicePixelRatio

                            canvas.style.removeProperty("width")
                            canvas.style.setProperty("width", newWidth + "px", "important")
                            canvas.style.removeProperty("height")
                            canvas.style.setProperty("height", newHeight + "px", "important")

                            game.internal.renderer.ctx.imageSmoothingEnabled = false
                        }
                    }
                    //ctx.clearRect(0, 0, canvas.width, canvas.height)
                    ctx.fillStyle = "white"
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

                    var renderRenderers = (order) => {
                        BeginningJS.internal.current.game = game;
                        var i = 0;
                        for (i in game.internal.renderer.renderers[order]) {
                            var start = new Date();

                            var customRenderer = game.internal.renderer.renderers[order][i];
                            if (customRenderer == null) {
                                continue;
                            }
                            BeginningJS.internal.current.sprite = customRenderer.sprite;

                            ctx.save();
                            customRenderer.code.call(customRenderer.sprite, game, customRenderer.sprite);
                            ctx.restore();

                            customRenderer.sprite.debug.renderTime = (new Date() - start) / 1000;
                        }
                        BeginningJS.internal.current.sprite = null;
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
                                "x": BeginningJS.internal.render.scale.x(x, renderer, canvas),
                                "y": BeginningJS.internal.render.scale.y(y, renderer, canvas),
                                "width": sprite.canvas.width,
                                "height": sprite.canvas.height
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
                                "x": BeginningJS.internal.render.scale.x(x, renderer, canvas),
                                "y": BeginningJS.internal.render.scale.y(y, renderer, canvas),
                                "width": BeginningJS.internal.render.scale.width(sprite.width, renderer, canvas),
                                "height": BeginningJS.internal.render.scale.height(sprite.height, renderer, canvas)
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
                                if (typeof sprite[property] == "number") {
                                    sprite.internal[property + "WasNull"] = false;
                                }
                                else {
                                    if (! sprite.internal[property + "WasNull"]) { // Don't spam the console
                                        if (isNaN(sprite[property])) {
                                            console.warn("Sprite '" + sprite.id + "'s " + property + " " + suffixWord + " is NaN. You probably used a non-number variable when calculating a new " + property + " " + suffixWord + ".\n Beginning.js has disabled the rendering for this sprite until it's a number.");
                                            sprite.internal[property + "WasNull"] = true;
                                        }
                                        else {
                                            console.warn("Sprite '" + sprite.id + "'s " + property + " " + suffixWord + " is " + sprite[property] + ". It should be a number.\n Beginning.js has disabled the rendering for this sprite until it's a number.");
                                            sprite.internal[property + "WasNull"] = true;
                                        }
                                    }
                                }
                            }
                            if (sprite.type != "renderer") {
                                checkIsNum("x", "position", sprite);
                                checkIsNum("y", "position", sprite);
                                checkIsNum("width", "", sprite);
                                checkIsNum("height", "", sprite);
                            }
                            // TODO: Check image

                            ctx.globalAlpha = 1;
                            if (sprite.type == "sprite") {
                                sprite.angle = ((sprite.angle + 180) % 360) - 180; // Make sure it's in range
                                if (sprite.angle == 90) { // Don't rotate if we don't need to
                                    ctx.globalAlpha = sprite.alpha;
                                    ctx.drawImage(game.internal.assets.imgs[sprite.img].img, scaled.x * flip[0], scaled.y * flip[1], scaled.width * flip[0], scaled.height * flip[1]);
                                }
                                else {
                                    ctx.save();

                                    ctx.translate((scaled.x + (scaled.width / 2)) * flip[0], (scaled.y + (scaled.height / 2) * flip[1]));
                                    ctx.rotate(BeginningJS.methods.maths.degToRad(sprite.angle - 90));
                                    ctx.globalAlpha = sprite.alpha;
                                    ctx.drawImage(game.internal.assets.imgs[sprite.img].img, -((scaled.width / 2) * flip[0]), -((scaled.height / 2) * flip[1]), scaled.width * flip[0], scaled.height * flip[1]);

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


                    BeginningJS.internal.current.game = null;
                }
            }
        },
        games: {},
        collision: {
            "methods": {
                "spriteRect": function(sprite, expand, centre) {
                    // Return the rectangle that this sprite occupies
                    return {
                        "x": Math.round(sprite.x - ((sprite.width / 2) * centre)),
                        "y": Math.round(sprite.y - ((sprite.height / 2) * centre)),
                        "width": Math.round(sprite.width),
                        "height": Math.round(sprite.height)
                    }
                },
                "AABB": function(rect1, rect2) {
                    if (rect1.x < rect2.x + rect2.width) {
                        if (rect1.x + rect1.width > rect2.x) {
                            if (rect1.y < rect2.y + rect2.height) {
                                if (rect1.y + rect1.height > rect2.y) {
                                    return true
                                }
                            }
                        }
                    }
                    return false
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
        autoplaySounds: function() {
            if (! BeginningJS.internal.autoPlay) {
                BeginningJS.internal.testAutoPlay() // Might be able to play some queued sounds
                if (BeginningJS.internal.autoPlay) {
                    var i = 0
                    for (i in BeginningJS.internal.games) {
                        var game = BeginningJS.internal.games[i]
                        var c = 0
                        for (c in game.internal.soundsToPlay) {
                            game.internal.assets.snds[game.internal.soundsToPlay[c]].snd.play()
                        }
                        game.internal.soundsToPlay = []
                    }
                }
                setTimeout(BeginningJS.internal.testAutoPlay, 0)
            }
        },
        loadImages: function() {
            var i = 0
            for (i in BeginningJS.internal.games) {
                var game = BeginningJS.internal.games[i]

                var keys = Object.keys(game.internal.assets.imgs)
                var c = 0
                while (c < keys.length) {
                    var img = game.internal.assets.imgs[keys[c]].img

                    img.src = game.game.assets.imgs[c].src
                    c++
                }
            }
        },
        onPageReady: function() {
            BeginningJS.internal.loadImages()
        },
        onDocReadyStateChange: document.addEventListener("readystatechange", function() {
            if (document.readyState == "complete") {
                BeginningJS.internal.onPageReady()
            }
        }),
        load: {
            "snd": function(sndJSON, game, allowInternal) {
                if (game.internal.assets.snds[sndJSON.id] != null) {
                    return
                }
                var snd = new Audio()
                snd.onerror = function() {
                    console.warn("Unable to load asset(s) using " + JSON.stringify(this.src) + " as the src. This may be due to it being a online asset and your computer being offline or because the asset doesn't exist. \nBeginning.js will continue to retry.")
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
                game.internal.assets.snds[sndJSON.id] = {
                    "snd": snd
                }
            },
            "img": function(imgJSON, game) {
                if (game.internal.assets.imgs[imgJSON.id] != null) {
                    return
                }
                var img = new Image()
                img.onload = function() {
                    game.internal.assets.loading--
                    game.internal.assets.loaded++
                }
                img.onerror = function() {
                    console.warn("Unable to load asset(s) using " + JSON.stringify(this.src) + " as the src. This may be due to it being a online asset and your computer being offline or because the asset doesn't exist. \nBeginning.js will continue to retry.")
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
                game.internal.assets.imgs[imgJSON.id] = {
                    "img": img
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
                    newEntity[keys[i]] = BeginningJS.internal.deepClone(entity[keys[i]]);
                }
                else {
                    newEntity[keys[i]] = entity[keys[i]];
                }
                i++;
            }
            return newEntity;
        }
    },
    methods: {
        get: {
            image: function(id, gameInput) {
                var game = BeginningJS.internal.current.game
                if (gameInput != null) {
                    game = gameInput
                }
                if (game == null) {
                    console.error("Oops. You seem to be running this function outside of a script. Try moving it and trying again. Alternatively, you can pass the game object in as the second parameter to this function to fix this issue.")
                    console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
                    debugger
                }
                if (game.internal.assets.imgs[id] == null) {
                    console.error("Oops, a problem occured while getting a image. There's no image with the ID " + JSON.stringify(id) + ".")
                }
                return game.internal.assets.imgs[id].img
            },
            audio: function(id, gameInput) {
                var game = BeginningJS.internal.current.game
                if (gameInput != null) {
                    game = gameInput
                }
                if (game == null) {
                    console.error("Oops. You seem to be running this function outside of a script. Try moving it and trying again. Alternatively, you can pass the game object in as the second parameter to this function to fix this issue.")
                    console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
                    debugger
                }
                if (game.internal.assets.snds[id] == null) {
                    console.error("Ah, a problem occured while getting a sprite. There's no sprite with the ID " + JSON.stringify(id) + ".")
                }
                return game.internal.assets.snds[id].snd
            },
            sprite: function(id, gameInput) {
                var game = BeginningJS.internal.current.game;
                if (gameInput != null) {
                    game = gameInput;
                }
                if (game == null) {
                    console.error("Oops. You seem to be running this function outside of a script. Try moving it and trying again. Alternatively, you can pass the game object in as the second parameter to this function to fix this issue.");
                    BeginningJS.internal.oops(game);
                }
                if (game.internal.IDIndex[id] == null) {
                    console.error("Ah, a problem occured while getting a sprite. There's no sprite with the ID " + JSON.stringify(id) + ".");
                    BeginningJS.internal.oops(game);
                }
                return game.game.sprites[game.internal.IDIndex[id]];
            }
        },
        playSound: function(id) {
            // TODO: Test for game
            // TODO: Test for ID
            // TODO: game.methods.playSound

            var game = BeginningJS.internal.current.game


            if (BeginningJS.internal.autoPlay) {
                game.internal.assets.snds[id].snd.play()
            }
            else {
                game.internal.soundsToPlay.push(id)
            }
        },
        maths: {
            radToDeg: (rad) => (rad * 180) / Math.PI,
            degToRad: (deg) => deg * (Math.PI / 180),
            getDirection: (x1, y1, x2, y2) => BeginningJS.methods.maths.radToDeg(Math.atan2(y2 - y1, x2 - x1)) + 90, // gist.github.com/conorbuck/2606166
            getDistance: (x1, y1, x2, y2) => Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2)) // a2 + b2 = c2
        },
        step: (id) => {
            // TODO: Error if it's outside of a game or sprite

            var game = BeginningJS.internal.current.game;
            var me = BeginningJS.internal.current.sprite;

            return me.scripts.steps[id](game, me, BeginningJS.methods.step);
        }
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
BeginningJS.internal.requestAnimationFrame.call(window, BeginningJS.internal.tick);
