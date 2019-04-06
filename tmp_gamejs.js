// TODO:
// == Important ==
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
// Smart canvas rendering
// New name
GameJS = {
    "init": function(gameJSON) {
        if (typeof gameJSON != "object") {
            console.error("Oh no! Your game JSON appears to be the wrong type. It must be the type 'object', you used " + JSON.stringify(gameJSON) + ".")
            console.error("Game.js hit a critical error, look at the error above for more information.")
        }
        var error = false
        if (document.getElementById(gameJSON.htmlElementID) == null && gameJSON.htmlElementID != null) { // Make sure the element exists
            console.error("Oops, you specified the element to add the game canvas to but it doesn't seem to exist. \nThis is specified in 'GameJSON.htmlElementID' and is set to " + JSON.stringify(gameJSON.htmlElementID) + ". You might want to check that the HTML that creates the element is before your JavaScript.")
            console.error("Game.js hit a critical error, look at the error above for more information.")
            error = true
        }

        var game = GameJS.internal.checkOb(gameJSON, {
            "ID": {
                "types": ["string"],
                "description": "An ID for the game canvas so it can be referenced later in the program."
            },
            "width": {
                "types": ["number"],
                "description": "The virtual width for the game. Independent from the rendered width."
            },
            "height": {
                "types": ["number"],
                "description": "The virtual height for the game. Independent from the rendered height."
            },
            "game": {
                "types": ["object"],
                "description": "The JSON for the game."
            }
        }, {
            "htmlElementID": {
                "default": null,
                "types": ["string"],
                "description": "The element to append the game canvas to."
            },
            "config": {
                "default": {
                    "state": {
                        "default": "game",
                        "types": null,
                        "description": "The element to append the game canvas to."
                    },
                    "display": {
                        "default": {
                            "fillScreen": false
                        },
                        "types": "object",
                        "description": "The element to append the game canvas to."
                    }
                },
                "types": ["object"],
                "description": "The game configuration settings."
            }
        }, "GameJSON")
        game.config = GameJS.internal.checkOb(game.config, {}, {
            "state": {
                "default": "game",
                "types": null,
                "description": "The element to append the game canvas to."
            },
            "display": {
                "default": {
                    "fillScreen": false
                },
                "types": "object",
                "description": "The element to append the game canvas to."
            }
        }, "GameJSON.config")
        game.config.display = GameJS.internal.checkOb(game.config.display, {}, {
            "fillScreen": {
                "default": false,
                "types": [
                    "boolean"
                ],
                "description": "Determines if the game will be upscaled to fit the screen."
            }
        }, "GameJSON.config")
        game.game = GameJS.internal.checkOb(game.game, {}, {
            "assets": {
                "default": {
                    "imgs": [],
                    "snds": []
                },
                "types": ["object"],
                "description": "The object that contains all the assets to be loaded for the game."
            },
            "sprites": {
                "default": [],
                "types": ["array"],
                "description": "The array that contains the all the sprites' JSON."
            },
            "scripts": {
                "default": {
                    "preload": null,
                    "init": [

                    ],
                    "main": [

                    ]
                },
                "types": ["object"],
                "description": "The object that contains all the game scripts that aren't for a particular sprite."
            },
        }, "GameJSON.game")
        game.game.assets = GameJS.internal.checkOb(game.game.assets, {
            "imgs": {
                "types": ["array"],
                "description": "The array that contains all the images to be loaded for the game."
            },
            "snds": {
                "types": ["array"],
                "description": "The array that contains all the images to be loaded for the game."
            }
        }, {}, "GameJSON.game.assets")
        game.game.scripts = GameJS.internal.checkOb(game.game.scripts, {}, {
            "preload": {
                "default": [],
                "types": [
                    "function",
                    "undefined"
                ],
                "description": "A function to be run before the game loads."
            },
            "init": {
                "default": [],
                "types": ["array"],
                "description": "The array that contains the init scripts. An init script will be run when the game state changes to (one of the states/the state) assigned to that script."
            },
            "main": {
                "default": [],
                "types": ["array"],
                "description": "The array that contains the main scripts. A main script will be run 60 times a second while the game state matches (one of the states/the state) assigned to that script."
            }
        }, "GameJSON.game.scripts")
        game.state = game.config.state
        game.loaded = false


        if (GameJS.internal.games.hasOwnProperty(game.ID)) {
            console.error("Oh no! You used an ID for your game that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.ID) + " in 'GameJSON.htmlElementID'.")
            console.error("Game.js hit a critical error, look at the error above for more information.")
            error = true
        }

        if (game.vars == null) {
            game.vars = {}
        }

        var qTreeCanvas = document.createElement("canvas")
        qTreeCanvas.width = game.width
        qTreeCanvas.height = game.height
        var qTreeCtx = qTreeCanvas.getContext("2d")

        /*
        qTreeCtx.fillStyle = "rgb(0, 0, 0)"
        qTreeCtx.fillRect(0, 0, qTreeCanvas.width / 2, qTreeCanvas.height / 2)
        qTreeCtx.fillStyle = "rgb(0, 0, 1)"
        qTreeCtx.fillRect(qTreeCanvas.width / 2, 0, qTreeCanvas.width / 2, qTreeCanvas.height / 2)
        qTreeCtx.fillStyle = "rgb(0, 0, 2)"
        qTreeCtx.fillRect(0, qTreeCanvas.height / 2, qTreeCanvas.width / 2, qTreeCanvas.height / 2)
        qTreeCtx.fillStyle = "rgb(0, 0, 3)"
        qTreeCtx.fillRect(qTreeCanvas.width / 2, qTreeCanvas.height / 2, qTreeCanvas.width / 2, qTreeCanvas.height / 2)
        */


        game.internal = {
            "renderer": {
                "type": "canvas",
                "width": game.width,
                "height": game.height,
                "lastRender": new Date()
            },
            "ids": [],
            "idIndex": {},
            "FPSFrames": 0,
            "loadedDelay": 0
        }
        game.internal.collision = {
            "qtree": {
                "index": {
                    "canvas": qTreeCanvas,
                    "ctx": qTreeCtx,
                    "rectangles": [],
                    "rgb": [0, 0, 0]
                },
                "methods": {
                    "addRect": function(game, x, y, width, height) {
                        var rgb = game.internal.collision.qtree.index.rgb
                        rgb[2]++
                        if (rgb[2] > 255) {
                            rgb[2] = 0
                            rgb[1]++
                        }
                        if (rgb[1] > 255) {
                            rgb[1] = 0
                            rgb[0]++
                        }
                        if (rgb[1] > 255) {
                            rgb[1] = 0
                            console.error("Out of qtree IDs. How did this happen?")
                        }
                        game.internal.collision.qtree.index.rgb = rgb

                        var ctx = game.internal.collision.qtree.index.ctx
                        ctx.fillStyle = "rgb(" + rgb.join(",") + ")"
                        ctx.fillRect(x, y, width, height)
                        game.internal.collision.qtree.index.rectangles[(rgb[0] * (256 * 256)) + (rgb[1] * 256) + rgb[2]] = {
                            "x": x,
                            "y": y,
                            "width": width,
                            "height": height
                        }
                    },
                    "clear": function() {
                        game.internal.collision.qtree.rectangles = {}
                    }
                }
            }
        }

        game.internal.collision.qtree.methods.addRect(game, 0, 0, qTreeCanvas.width / 2, qTreeCanvas.height / 2, [0, 0, 0])
        game.internal.collision.qtree.methods.addRect(game, qTreeCanvas.width / 2, 0, qTreeCanvas.width / 2, qTreeCanvas.height / 2, [0, 0, 1])
        game.internal.collision.qtree.methods.addRect(game, 0, qTreeCanvas.height / 2, qTreeCanvas.width / 2, qTreeCanvas.height / 2, [0, 0, 2])
        game.internal.collision.qtree.methods.addRect(game, qTreeCanvas.width / 2, qTreeCanvas.height / 2, qTreeCanvas.width / 2, qTreeCanvas.height / 2, [0, 0, 3])

        game.currentFPS = 60
        game.currentRenderFPS = 60
        /*
        game.internal.loadingGif = document.createElement("img")
        var tmp = [
            "data:image/gif;base64,R0lGODlhAwADAPAAAAAAAAD/ACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgAAACwAAAAAAwADAAACA4QfVgAh+QQJCgAAACwAAAAAAwADAAACA4RzVgAh+QQJCgAAACwAAAAAAwADAAACBAxgeAUAIfkECQoAAAAsAAAAAAMAAwAAAgRMcKBQACH5BAkKAAAALAAAAAADAAMAAAIDjIFZACH5BAkKAAAALAAAAAADAAMAAAIERAKWUAAh+QQJCgAAACwAAAAAAwADAAACBARieAUAIfkECQoAAAAsAAAAAAMAAwAAAgSEHRBRACH5BAkKAAAALAAAAAADAAMAAAIEhA8RBQAh+QQJCgAAACwAAAAAAwADAAACBIQPAQUAIf8LSW1hZ2VNYWdpY2sOZ2FtbWE9MC40NTQ1NDUAIfkECQoAAAAsAAAAAAMAAwAAAgOEfwUAIf8LSW1hZ2VNYWdpY2sOZ2FtbWE9MC40NTQ1NDUAIfkECQoAAAAsAAAAAAMAAwAAAgOEfwUAIf8LSW1hZ2VNYWdpY2sOZ2FtbWE9MC40NTQ1NDUAIfkECQoAAAAsAAAAAAMAAwAAAgOEfwUAIf8LSW1hZ2VNYWdpY2sOZ2FtbWE9MC40NTQ1NDUAIfkECQoAAAAsAAAAAAMAAwAAAgOEfwUAIf8LSW1hZ2VNYWdpY2sOZ2FtbWE9MC40NTQ1NDUAIfkECQoAAAAsAAAAAAMAAwAAAgOEfwUAIf8LSW1hZ2VNYWdpY2sOZ2FtbWE9MC40NTQ1NDUAIfkECQoAAAAsAAAAAAMAAwAAAgOEfwUAOw=="
        ]
        // So it can be collaped while editing ^
        game.internal.loadingGif.src = tmp[0]
        game.internal.loadingGif.width = 100
        game.internal.loadingGif.height = 100
        game.internal.loadingGif.style = "image-rendering: -moz-crisp-edges;image-rendering: -moz-crisp-edges;image-rendering: -o-crisp-edges;image-rendering: -webkit-optimize-contrast;-ms-interpolation-mode: nearest-neighbor;image-rendering: pixelated;position:relative;border:10px solid black;background-color:black;left:90%;horizontal-anchor:center;vertical-anchor:bottom;"
        */

        if (error) {
            debugger
        }


        var game = game
        game.internal.renderer.canvas = document.createElement("canvas")
        if (game.config.display.fillScreen) {
            game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); position: absolute; top:0; bottom: 0; left: 0; right: 0; margin: auto;" // CSS from phaser (https://phaser.io)
        }
        else {
            game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);" // CSS from phaser (https://phaser.io)
        }
        game.internal.renderer.ctx = game.internal.renderer.canvas.getContext("2d")
        game.internal.renderer.canvas.width = game.width
        game.internal.renderer.canvas.height = game.height


        if (game.htmlElementID == null) {
            document.appendChild(game.internal.renderer.canvas)
        }
        else {
            document.getElementById(game.htmlElementID).appendChild(game.internal.renderer.canvas)
        }
        //game.internal.renderer.canvas.parentElement.append(game.internal.loadingGif)

        game.internal.renderer.ctx.imageSmoothingEnabled = false


        game.internal.scripts = {
            "index": {
                "init": {},
                "main": {},
                "spritesInit": {},
                "spritesMain": {}
            }
        }

        // Check stuff

        // Assets
        game.internal.assets = {
            "loading": 0,
            "loaded": 0,
            "imgs": {},
            "snds": {}
        }
        var i = 0
        for (i in game.game.assets.imgs) {
            if (GameJS.internal.getTypeOf(game.game.assets.imgs[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define an asset. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(game.game.assets.imgs[i])) + " in ''GameJSON.game.assets.imgs' item '" + i + "'.")
                console.error("Game.js hit a critical error, look at the error above for more information.")
                error = true
            }
            game.game.assets.imgs[i] = GameJS.internal.checkOb(game.game.assets.imgs[i], {
                "src": {
                    "types": [
                        "string"
                    ],
                    "description": "The src for the asset."
                },
                "id": {
                    "types": [
                        "string"
                    ],
                    "description": "The id to target this asset by."
                }
            }, {}, "GameJSON.game.assets.imgs item " + i + ".")
            if (game.internal.assets.imgs.hasOwnProperty(game.game.assets.imgs[i].id)) {
                console.error("Oh no! You used an ID for an asset that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.game.assets.imgs[i].id) + " in 'GameJSON.game.assets.imgs item " + i  + "'.")
                console.error("Game.js hit a critical error, look at the error above for more information.")
                error = true
            }
            var img = new Image()
            img.onload = function() {
                game.internal.assets.loading--
                game.internal.assets.loaded++
            }
            img.onerror = function() {
                console.warn("Unable to load asset(s) using " + JSON.stringify(this.src) + " as the src. This may be due to it being a online asset and your computer being offline or because the asset doesn't exist. \nGame.js will continue to retry.")
                this.onerror = function() {
                    setTimeout(function(img) {
                        var tmp = img.src
                        img.src = ""
                        img.src = tmp
                    }, 10000, this)
                }
                this.onerror()

            }
            img.src = game.game.assets.imgs[i].src
            game.internal.assets.loading++
            game.internal.assets.imgs[game.game.assets.imgs[i].id] = {
                "img": img
            }
        }

        // Scripts
        var i = 0
        for (i in game.game.scripts.init) {
            if (GameJS.internal.getTypeOf(game.game.scripts.init[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(game.game.scripts.init[i])) + " in ''GameJSON.game.scripts.init' item " + i + ".")
                console.error("Game.js hit a critical error, look at the error above for more information.")
                error = true
            }
            game.game.scripts.init[i] = GameJS.internal.checkOb(game.game.scripts.init[i], {
                "stateToRun": {
                    "types": [
                        "string",
                        "object"
                    ],
                    "description": "The state(s) when this script will be run."
                },
                "code": {
                    "types": [
                        "function"
                    ],
                    "description": "The code to be run when the 'stateToRun' property matches the game state."
                }
            }, {}, "GameJSON.game.scripts.init item " + i + ".")
            if (game.internal.scripts.index.init[game.game.scripts.init[i].stateToRun] == null) {
                game.internal.scripts.index.init[game.game.scripts.init[i].stateToRun] = []
            }
            game.internal.scripts.index.init[game.game.scripts.init[i].stateToRun][game.internal.scripts.index.init[game.game.scripts.init[i].stateToRun].length] = i
        }
        var i = 0
        for (i in game.game.scripts.main) {
            if (GameJS.internal.getTypeOf(game.game.scripts.main[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(game.game.scripts.main[i])) + " in ''GameJSON.game.scripts.main' item " + i + ".")
                console.error("Game.js hit a critical error, look at the error above for more information.")
                error = true
            }
            game.game.scripts.main[i] = GameJS.internal.checkOb(game.game.scripts.main[i], {
                "stateToRun": {
                    "types": [
                        "string",
                        "object"
                    ],
                    "description": "The state(s) when this script will be run."
                },
                "code": {
                    "types": [
                        "function"
                    ],
                    "description": "The code to be run while the 'stateToRun' property matches the game state."
                }
            }, {}, "GameJSON.game.scripts.main item " + i + ".")
            if (game.internal.scripts.index.main[game.game.scripts.main[i].stateToRun] == null) {
                game.internal.scripts.index.main[game.game.scripts.main[i].stateToRun] = []
            }
            game.internal.scripts.index.main[game.game.scripts.main[i].stateToRun][game.internal.scripts.index.main[game.game.scripts.main[i].stateToRun].length] = i
        }

        // Sprites
        var i = 0
        for (i in game.game.sprites) {
            var sprite = GameJS.internal.createSprite({
                "isClone": false,
                "i": i,
                "game": game,
            }, game.game.sprites[i])

            /*
            if (GameJS.internal.getTypeOf(game.game.sprites[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define a sprite. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(game.game.sprites[i])) + " in ''GameJSON.game.sprites' item '" + i + "'.")
                console.error("Game.js hit a critical error, look at the error above for more information.")
                error = true
            }
            game.game.sprites[i] = GameJS.internal.checkOb(game.game.sprites[i], {
                "x": {
                    "types": [
                        "number"
                    ],
                    "description": "The x position for the sprite to start at."
                },
                "y": {
                    "types": [
                        "number"
                    ],
                    "description": "The y position for the sprite to start at."
                },
                "img": {
                    "types": [
                        "string"
                    ],
                    "description": "The image for the sprite to use to start with."
                },
                "id": {
                    "types": [
                        "string"
                    ],
                    "description": "The id for the sprite to be targeted by."
                }
            }, {
                "width": {
                    "default": "auto",
                    "types": [
                        "number"
                    ],
                    "description": "The width for the sprite."
                },
                "height": {
                    "default": "auto",
                    "types": [
                        "number"
                    ],
                    "description": "The height for the sprite."
                },
                "scale": {
                    "default": 1,
                    "types": [
                        "number"
                    ],
                    "description": "The scale for the sprite."
                },
                "scripts": {
                    "default": {
                        "init": [],
                        "main": []
                    },
                    "types": [
                        "object"
                    ],
                    "description": "The sprite's scripts."
                },
            }, "GameJSON.game.sprites item " + i + ".")
            game.game.sprites[i].scripts = GameJS.internal.checkOb(game.game.sprites[i].scripts, {}, {
                "init": {
                    "default": [],
                    "types": [
                        "array"
                    ],
                    "description": "The array of init scripts for the sprite."
                },
                "main": {
                    "default": [],
                    "types": [
                        "array"
                    ],
                    "description": "The array of main scripts for the sprite."
                }
            }, "GameJSON.game.sprites item " + i + ". -> scripts.")

            game.game.sprites[i].internal = {
                "cloneCount": 0,
                "cloneIDs": []
            }


            if (ids.includes(game.game.sprites[i].id)) {
                console.error("Oh no! You used an ID for a sprite that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.game.sprites[i].id) + " in 'GameJSON.game.sprites item " + i  + "'.")
                console.error("Game.js hit a critical error, look at the error above for more information.")
                error = true
            }
            ids[ids.length] = game.game.sprites[i].id

            var c = 0
            for (c in game.game.sprites[i].scripts.init) {
                if (GameJS.internal.getTypeOf(game.game.sprites[i].scripts.init[c]) != "object") {
                    console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(game.game.sprites[i].scripts.init[c])) + " in ''GameJSON.game.sprites' item " + c + " -> scripts.init.")
                    console.error("Game.js hit a critical error, look at the error above for more information.")
                    error = true
                }
                game.game.sprites[i].scripts.init[c] = GameJS.internal.checkOb(game.game.sprites[i].scripts.init[c], {
                    "stateToRun": {
                        "types": [
                            "string",
                            "object"
                        ],
                        "description": "The state(s) when this script will be run."
                    },
                    "code": {
                        "types": [
                            "function"
                        ],
                        "description": "The code to be run when the 'stateToRun' property matches the game state."
                    }
                }, {}, "GameJSON.game.scripts.init item " + c + ".")
                if (game.internal.scripts.index.spritesInit[game.game.sprites[i].scripts.init[c].stateToRun] == null) {
                    game.internal.scripts.index.spritesInit[game.game.sprites[i].scripts.init[c].stateToRun] = []
                }
                game.internal.scripts.index.spritesInit[game.game.sprites[i].scripts.init[c].stateToRun][game.internal.scripts.index.spritesInit[game.game.sprites[i].scripts.init[c].stateToRun].length] = {
                    "script": c,
                    "sprite": game.game.sprites[i]
                }
            }
            var c = 0
            for (c in game.game.sprites[i].scripts.main) {
                if (GameJS.internal.getTypeOf(game.game.sprites[i].scripts.main[c]) != "object") {
                    console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(game.game.sprites[i].scripts.main[c])) + " in ''GameJSON.game.sprites' item " + c + " -> scripts.main.")
                    console.error("Game.js hit a critical error, look at the error above for more information.")
                    error = true
                }
                game.game.sprites[i].scripts.main[c] = GameJS.internal.checkOb(game.game.sprites[i].scripts.main[c], {
                    "stateToRun": {
                        "types": [
                            "string",
                            "object"
                        ],
                        "description": "The state(s) when this script will be run."
                    },
                    "code": {
                        "types": [
                            "function"
                        ],
                        "description": "The code to be run while the 'stateToRun' property matches the game state."
                    }
                }, {}, "GameJSON.game.sprites item " + c + " -> scripts.main.")
                if (game.internal.scripts.index.spritesMain[game.game.sprites[i].scripts.main[c].stateToRun] == null) {
                    game.internal.scripts.index.spritesMain[game.game.sprites[i].scripts.main[c].stateToRun] = []
                }
                game.internal.scripts.index.spritesMain[game.game.sprites[i].scripts.main[c].stateToRun][game.internal.scripts.index.spritesMain[game.game.sprites[i].scripts.main[c].stateToRun].length] = {
                    "script": c,
                    "sprite": game.game.sprites[i]
                }
            }
            */
        }

        if (error) {
            debugger
        }
        else {
            if (game.game.scripts.preload == "function") {
                game.game.scripts.preload(game)
            }
        }

        GameJS.internal.games[game.ID] = game

        return game
    },
    "internal": {
        "current": {
            "sprite": null,
            "game": null
        },
        "findCloneID": function(sprite, game) {
            var i = 0
            for (i in sprite.internal.cloneIDs) {
                if (sprite.internal.cloneIDs[i] == null) {
                    return i
                }
            }
            return sprite.internal.cloneIDs.length
        },
        "findSpriteID": function(game) {
            var i = 0
            for (i in game.game.sprites) {
                if (game.game.sprites[i] == null) {
                    return i
                }
            }
            return game.game.sprites.length
        },
        "checkClones": function(startSprite, data) {
            var sprite = GameJS.internal.checkOb(startSprite.clones, {}, {
                "x": {
                    "default": startSprite.x,
                    "types": [
                        "number"
                    ],
                    "description": "The x position for the sprite to start at."
                },
                "y": {
                    "default": startSprite.y,
                    "types": [
                        "number"
                    ],
                    "description": "The y position for the sprite to start at."
                },
                "img": {
                    "default": startSprite.img,
                    "types": [
                        "string"
                    ],
                    "description": "The image for the sprite to use to start with."
                },
                "clones": {
                    "default": {},
                    "types": [
                        "object"
                    ],
                    "description": "The default data for a clone of this clone. \nAll arguments are optional as the child clone will adopt the arguments from the clone function and the parent clone (in that priority)"
                },
                "width": {
                    "default": startSprite.width,
                    "types": [
                        "number"
                    ],
                    "description": "The width for the sprite."
                },
                "height": {
                    "default": startSprite.height,
                    "types": [
                        "number"
                    ],
                    "description": "The height for the sprite."
                },
                "visible": {
                    "default": startSprite.visible,
                    "types": [
                        "boolean"
                    ],
                    "description": "Determines if the sprite is visible or not."
                },
                /*
                "scale": {
                    "default": 1,
                    "types": [
                        "number"
                    ],
                    "description": "The scale for the sprite."
                },
                */
                "scripts": {
                    "default": {
                        "init": [],
                        "main": []
                    },
                    "types": [
                        "object"
                    ],
                    "description": "The sprite's scripts."
                },
            }, "function cloneSprite cloning the sprite " + JSON.stringify(data.spriteToClone) + ".")
            sprite.scripts = GameJS.internal.checkOb(sprite.scripts, {}, {
                "init": {
                    "default": [],
                    "types": [
                        "array"
                    ],
                    "description": "The array of init functions for the clone."
                },
                "main": {
                    "default": [],
                    "types": [
                        "array"
                    ],
                    "description": "The array of main functions for the sprite."
                }
            }, "function cloneSprite cloning the sprite " + JSON.stringify(data.spriteToClone) + ".")

            var c = 0
            for (c in sprite.scripts.init) {
                if (GameJS.internal.getTypeOf(sprite.scripts.init[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of init scripts. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(sprite.scripts.init[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    console.log(sprite.scripts.init[c])
                    console.error("Game.js hit a critical error, look at the error above for more information.")
                    debugger
                }
            }
            var c = 0
            for (c in sprite.scripts.main) {
                if (GameJS.internal.getTypeOf(sprite.scripts.main[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of main scripts. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(sprite.scripts.main[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    console.log(sprite.scripts.main[c])
                    console.error("Game.js hit a critical error, look at the error above for more information.")
                    debugger
                }
            }
        },
        "createSprite": function(data, spriteData, game) {
            if (data.isClone) {
                GameJS.internal.checkClones(spriteData, data)
                var sprite = spriteData

                var c = 0
                for (c in sprite.scripts.init) {
                    if (game.internal.scripts.index.spritesInit[game.state] == null) {
                        game.internal.scripts.index.spritesInit[game.state] = []
                    }
                    game.internal.scripts.index.spritesInit[game.state][game.internal.scripts.index.spritesInit[game.state].length] = {
                        "script": c,
                        "sprite": sprite,
                        "isClone": true
                    }
                }
                var c = 0
                for (c in sprite.scripts.main) {
                    if (game.internal.scripts.index.spritesMain[game.state] == null) {
                        game.internal.scripts.index.spritesMain[game.state] = []
                    }
                    game.internal.scripts.index.spritesMain[game.state][game.internal.scripts.index.spritesMain[game.state].length] = {
                        "script": c,
                        "sprite": sprite,
                        "isClone": true
                    }
                }

                sprite.cloneOf = data.cloneOf
                sprite.internal = {
                    "cloneCount": 0,
                    "cloneIDs": []
                }
            }
            else {
                var sprite = GameJS.internal.checkOb(spriteData, {
                    "x": {
                        "types": [
                            "number"
                        ],
                        "description": "The x position for the sprite to start at."
                    },
                    "y": {
                        "types": [
                            "number"
                        ],
                        "description": "The y position for the sprite to start at."
                    },
                    "img": {
                        "types": [
                            "string"
                        ],
                        "description": "The image for the sprite to use to start with."
                    },
                    "id": {
                        "types": [
                            "string"
                        ],
                        "description": "The id for the sprite to be targeted by."
                    }
                }, {
                    "width": {
                        "default": "auto",
                        "types": [
                            "number"
                        ],
                        "description": "The width for the sprite."
                    },
                    "height": {
                        "default": "auto",
                        "types": [
                            "number"
                        ],
                        "description": "The height for the sprite."
                    },
                    "scale": {
                        "default": 1,
                        "types": [
                            "number"
                        ],
                        "description": "The scale for the sprite."
                    },
                    "scripts": {
                        "default": {
                            "init": [],
                            "main": []
                        },
                        "types": [
                            "object"
                        ],
                        "description": "The sprite's scripts."
                    },
                    "clones": {
                        "default": {},
                        "types": [
                            "object"
                        ],
                        "description": "The default data for a clone of this sprite. \nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                    },
                    "visible": {
                        "default": true,
                        "types": [
                            "boolean"
                        ],
                        "description": "Determines if the sprite is visible or not."
                    }
                }, "GameJSON.game.sprites item " + data.i + ".")
                sprite.scripts = GameJS.internal.checkOb(sprite.scripts, {}, {
                    "init": {
                        "default": [],
                        "types": [
                            "array"
                        ],
                        "description": "The array of init scripts for the sprite."
                    },
                    "main": {
                        "default": [],
                        "types": [
                            "array"
                        ],
                        "description": "The array of main scripts for the sprite."
                    }
                }, "GameJSON.game.sprites item " + data.i + ". -> scripts.")

                sprite.cloneOf = null
                sprite.internal = {
                    "cloneCount": 0,
                    "cloneIDs": []
                }
                if (data.game.internal.ids.includes(sprite.id)) {
                    console.error("Oh no! You used an ID for a sprite that is already being used. Try and think of something else. \nYou used " + JSON.stringify(sprite.id) + " in 'GameJSON.game.sprites item' " + data.i  + ".")
                    console.error("Game.js hit a critical error, look at the error above for more information.")
                    debugger
                }
                data.game.internal.ids[data.game.internal.ids.length] = sprite.id
                data.game.internal.idIndex[sprite.id] = data.game.internal.ids.length - 1


                var c = 0
                for (c in data.game.game.sprites[data.i].scripts.init) {
                    if (GameJS.internal.getTypeOf(data.game.game.sprites[data.i].scripts.init[c]) != "object") {
                        console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(data.game.game.sprites[data.i].scripts.init[c])) + " in ''GameJSON.data.game.game.sprites' item " + c + " -> scripts.init.")
                        console.error("data.game.js hit a critical error, look at the error above for more information.")
                        debugger
                    }
                    data.game.game.sprites[data.i].scripts.init[c] = GameJS.internal.checkOb(data.game.game.sprites[data.i].scripts.init[c], {
                        "stateToRun": {
                            "types": [
                                "string",
                                "object"
                            ],
                            "description": "The state(s) when this script will be run."
                        },
                        "code": {
                            "types": [
                                "function"
                            ],
                            "description": "The code to be run when the 'stateToRun' property matches the game state."
                        }
                    }, {}, "GameJSON.data.game.scripts.init item " + c + ".")
                    if (data.game.internal.scripts.index.spritesInit[data.game.game.sprites[data.i].scripts.init[c].stateToRun] == null) {
                        data.game.internal.scripts.index.spritesInit[data.game.game.sprites[data.i].scripts.init[c].stateToRun] = []
                    }
                    data.game.internal.scripts.index.spritesInit[data.game.game.sprites[data.i].scripts.init[c].stateToRun][data.game.internal.scripts.index.spritesInit[data.game.game.sprites[data.i].scripts.init[c].stateToRun].length] = {
                        "script": c,
                        "sprite": data.game.game.sprites[data.i]
                    }
                }
                var c = 0
                for (c in data.game.game.sprites[data.i].scripts.main) {
                    if (GameJS.internal.getTypeOf(data.game.game.sprites[data.i].scripts.main[c]) != "object") {
                        console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(GameJS.internal.getTypeOf(data.game.game.sprites[data.i].scripts.main[c])) + " in ''GameJSON.data.game.game.sprites' item " + c + " -> scripts.main.")
                        console.error("data.game.js hit a critical error, look at the error above for more information.")
                        debugger
                    }
                    data.game.game.sprites[data.i].scripts.main[c] = GameJS.internal.checkOb(data.game.game.sprites[data.i].scripts.main[c], {
                        "stateToRun": {
                            "types": [
                                "string",
                                "object"
                            ],
                            "description": "The state(s) when this script will be run."
                        },
                        "code": {
                            "types": [
                                "function"
                            ],
                            "description": "The code to be run while the 'stateToRun' property matches the game state."
                        }
                    }, {}, "GameJSON.data.game.game.sprites item " + c + " -> scripts.main.")
                    if (data.game.internal.scripts.index.spritesMain[data.game.game.sprites[data.i].scripts.main[c].stateToRun] == null) {
                        data.game.internal.scripts.index.spritesMain[data.game.game.sprites[data.i].scripts.main[c].stateToRun] = []
                    }
                    data.game.internal.scripts.index.spritesMain[data.game.game.sprites[data.i].scripts.main[c].stateToRun][data.game.internal.scripts.index.spritesMain[data.game.game.sprites[data.i].scripts.main[c].stateToRun].length] = {
                        "script": c,
                        "sprite": data.game.game.sprites[data.i]
                    }
                }
            }
            return sprite
        },
        "getTypeOf": function(entity) {
            if (Array.isArray(entity)) {
                return "array"
            }
            if (entity == null) {
                return "undefined"
            }
            return typeof entity
        },
        "checkOb": function(ob, required, optional, where) {
            var missing = []
            var wrongTypes = []

            var i = 0
            for (i in required) {
                if (ob[i] == null) {
                    missing[missing.length] = i
                }
                else {
                    if (ob.hasOwnProperty(i)) {
                        if (required[i].types != null) {
                            if (! required[i].types.includes(GameJS.internal.getTypeOf(ob[i]))) {
                                wrongTypes[wrongTypes.length] = i
                            }
                        }
                    }
                }
            }
            var i = 0
            for (i in optional) {
                if (ob.hasOwnProperty(i)) {
                    if (optional[i].types != null) {
                        if (! optional[i].types.includes(GameJS.internal.getTypeOf(ob[i]))) {
                            wrongTypes[wrongTypes.length] = i
                        }
                    }
                }
            }

            var newOb = ob

            var i = 0
            for (i in optional) {
                if (ob[i] == null) {
                    newOb[i] = optional[i].default
                }
            }

            var useless = []

            var i = 0
            for (i in ob) {
                if (! (required.hasOwnProperty(i) || optional.hasOwnProperty(i))) {
                    useless[useless.length] = i
                }
            }

            if (missing.length > 0) {
                var message = []
                if (missing.length == 1) {
                    message[message.length] = "Oops, looks like you missed this out from " + JSON.stringify(where) + ": \n \n"
                }
                else {
                    message[message.length] = "Oops, looks like you missed these out from " + JSON.stringify(where) + ": \n \n"
                }

                var i = 0
                for (i in missing) {
                    message[message.length] = " " + missing[i] + " -> " + required[missing[i]].description + " \n"
                }

                console.error(message.join(""))
            }
            if (wrongTypes.length > 0) {
                var message = []
                if (wrongTypes.length == 1) {
                    message[message.length] = "Oops, looks like you've put an incorrect input type in " + JSON.stringify(where) + ": \n \n"
                }
                else {
                    message[message.length] = "Oops, looks like you've put some incorrect input types in " + JSON.stringify(where) + ": \n \n"
                }

                var i = 0
                for (i in wrongTypes) {
                    var c = wrongTypes[i]
                    if (required.hasOwnProperty(c)) {
                        if (required[c].types.length == 1) {
                            message[message.length] = " " + c + " -> " + required[c].description + " \n You used the type " + JSON.stringify(GameJS.internal.getTypeOf(ob[c])) + ", it can only be " + JSON.stringify(required[c].types[0]) + ". \n"
                        }
                        else {
                            message[message.length] = " " + c + " -> " + required[c].description + " \n You used the type " + JSON.stringify(GameJS.internal.getTypeOf(ob[c])) + ", it has to be one of these types: \n"
                            var a = 0
                            for (a in required[c].types) {
                                message[message.length] = "  " + JSON.stringify(required[c].types[a]) + " \n"
                            }
                        }
                    }
                    else {
                        if (optional[c].types.length == 1) {
                            message[message.length] = " " + c + " -> " + optional[c].description + " \n You used the type " + JSON.stringify(GameJS.internal.getTypeOf(ob[c])) + ", it can only be type " + JSON.stringify(optional[c].types[0]) + ". \n"
                        }
                        else {
                            message[message.length] = " " + c + " -> " + optional[c].description + " \n You used the type " + JSON.stringify(GameJS.internal.getTypeOf(ob[c])) + ", it has to be one of these types: \n"
                            var a = 0
                            for (a in optional[c].types) {
                                message[message.length] = "  " + JSON.stringify(optional[c].types[a]) + " \n"
                            }
                        }
                    }
                }

                console.error(message.join(""))
            }
            if (GameJS.config.flags.warnOfUselessParameters) { // Check the flag
                if (useless.length > 0) {
                    var message = []
                    if (useless.length == 1) {
                        message[message.length] = "You might want to remove this: \n"
                    }
                    else {
                        message[message.length] = "You might want to remove these: \n \n"
                    }

                    var i = 0
                    for (i in useless) {
                        message[message.length] = useless[i] + " \n"
                    }
                    message[message.length] = "Or you may have made a typo and it could be one of these... \n \n"
                    var i = 0
                    for (i in optional) {
                        message[message.length] = " " + i + " -> " + optional[i].description + " \n"
                    }

                    message[message.length] = "Alternatively, you can disable these warnings by editing the 'warnOfUselessParameters' flag. \nUse this code: 'GameJS.config.flags.warnOfUselessParameters = false'"
                    console.warn(message.join(""))
                }
            }

            if (missing.length > 0 || wrongTypes.length > 0) { // Was there an error?
                console.error("Game.js hit a critical error, look at the error above for more information.")
                debugger
            }
            return newOb
        },
        "requestAnimationFrame": window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
        "tick": function() {
            var i = 0
            for (i in GameJS.internal.games) {
                var start = new Date()
                var ctx = GameJS.internal.games[i].internal.renderer.ctx
                var canvas = GameJS.internal.games[i].internal.renderer.canvas
                var game = GameJS.internal.games[i]

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
                        game.internal.lastWidth = newWidth * window.devicePixelRatio
                        game.internal.lastHeight = newHeight * window.devicePixelRatio
                        game.internal.renderer.canvas.width = newWidth * window.devicePixelRatio
                        game.internal.renderer.canvas.height = newHeight * window.devicePixelRatio

                        canvas.style.removeProperty("width")
                        canvas.style.setProperty("width", newWidth + "px", "important")
                        canvas.style.removeProperty("height")
                        canvas.style.setProperty("height", newHeight + "px", "important")

                        game.internal.renderer.ctx.imageSmoothingEnabled = false
                    }
                }


                if (GameJS.internal.games[i].loaded) {
                    GameJS.internal.current.game = GameJS.internal.games[i]
                    GameJS.internal.scripts(GameJS.internal.games[i])
                    GameJS.internal.render.renderFrame[GameJS.internal.games[i].internal.renderer.type](GameJS.internal.games[i], GameJS.internal.games[i].internal.renderer.canvas, GameJS.internal.games[i].internal.renderer.ctx, GameJS.internal.games[i].internal.renderer)
                }
                else {
                    ctx.fillStyle = "black"
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

                    var percent = (game.internal.assets.loaded / (game.internal.assets.loaded + game.internal.assets.loading)) * 100
                    ctx.fillStyle = "lime"
                    var height = (percent / 100) * canvas.height
                    ctx.fillRect(0, canvas.height - height, canvas.width, height)

                    ctx.font = (50 * window.devicePixelRatio) + "px Arial"
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    var textDimensions = ctx.measureText("Loading...")
                    var width = textDimensions.width
                    var height = 50 * window.devicePixelRatio
                    ctx.fillStyle = "black"
                    ctx.fillRect(((canvas.width / 2) - (width / 2)) - (10 * window.devicePixelRatio), ((canvas.height / 2) - (height / 2)) - (5 * window.devicePixelRatio), width + (10 * window.devicePixelRatio), height + (10 * window.devicePixelRatio))

                    ctx.fillStyle = "lime"
                    ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2)
                    //Game.internal.loadingGif.style.top = Game.internal.renderer.canvas.height


                    if (GameJS.internal.games[i].internal.assets.loading == 0) {
                        GameJS.internal.games[i].internal.loadedDelay++
                        if (GameJS.internal.games[i].internal.loadedDelay > 100) {
                            GameJS.internal.games[i].loaded = true
                            var c = 0
                            for (c in GameJS.internal.games[i].game.sprites) {
                                var sprite = GameJS.internal.games[i].game.sprites[c]

                                var customDimentions = true
                                if (sprite.width == "auto") {
                                    sprite.width = GameJS.internal.games[i].internal.assets.imgs[sprite.img].img.width
                                    customDimentions = false
                                }
                                if (sprite.height == "auto") {
                                    sprite.height = GameJS.internal.games[i].internal.assets.imgs[sprite.img].img.height
                                    customDimentions = false
                                }
                                if (! customDimentions) {
                                    sprite.width = GameJS.internal.games[i].internal.assets.imgs[sprite.img].img.width * sprite.scale
                                    sprite.height = GameJS.internal.games[i].internal.assets.imgs[sprite.img].img.height * sprite.scale
                                }
                            }
                        }
                    }
                }
                GameJS.internal.games[i].internal.FPSFrames++
                GameJS.internal.games[i].currentRenderFPS = 1000 / (new Date() - start)
                GameJS.internal.games[i].internal.renderer.lastRender = new Date()
            }
            GameJS.internal.requestAnimationFrame.call(window, GameJS.internal.tick)
        },
        "scripts": function(game) {
            GameJS.internal.current.game = game
            if (game.internal.lastState != game.state) {
                GameJS.internal.current.sprite = null
                var i = 0
                for (i in game.internal.scripts.index.init[game.state]) {
                    var script = game.game.scripts.init[game.internal.scripts.index.init[game.state][i]]
                    script.code(game)
                }
                var i = 0
                for (i in game.internal.scripts.index.spritesInit[game.state]) {
                    var sprite = game.internal.scripts.index.spritesInit[game.state][i].sprite
                    GameJS.internal.current.sprite = game.game.sprites[game.internal.ids.indexOf(sprite.id)] // What if it's null?
                    var script = sprite.scripts.init[game.internal.scripts.index.spritesInit[game.state][i].script]
                    script.code(game, sprite)
                }
                game.internal.lastState = game.state
            }

            GameJS.internal.current.sprite = null
            var i = 0
            for (i in game.internal.scripts.index.main[game.state]) {
                var script = game.game.scripts.main[game.internal.scripts.index.main[game.state][i]]
                script.code(game)
            }
            var i = 0
            for (i in game.internal.scripts.index.spritesMain[game.state]) {
                var sprite = game.internal.scripts.index.spritesMain[game.state][i].sprite
                GameJS.internal.current.sprite = game.game.sprites[game.internal.idIndex[sprite.id]] // What if it's null?
                if (game.internal.scripts.index.spritesMain[game.state][i].isClone) {
                    GameJS.internal.current.sprite = sprite
                    sprite.scripts.main[game.internal.scripts.index.spritesMain[game.state][i].script](game, sprite)
                }
                else {
                    var script = sprite.scripts.main[game.internal.scripts.index.spritesMain[game.state][i].script]
                    script.code(game, sprite)
                }
            }
            GameJS.internal.current.sprite = null
            GameJS.internal.current.game = null

        },
        "render": {
            "vars": {
                "canvas": {
                    "gameCache": {}
                }
            },
            "scale": {
                "x": function(x, renderer, canvas) {
                    return (x / renderer.width) * canvas.width
                },
                "y": function(y, renderer, canvas) {
                    return (y / renderer.height) * canvas.height
                },
                "width": function(width, renderer, canvas) {
                    return (width / renderer.width) * canvas.width
                },
                "height": function(height, renderer, canvas) {
                    return (height / renderer.height) * canvas.height
                }
            },
            "renderFrame": {
                "canvas": function(game, canvas, ctx, renderer) {
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
                    var i = 0
                    for (i in game.game.sprites) {
                        var sprite = game.game.sprites[i]
                        var x = sprite.x - (sprite.width / 2)
                        var y = sprite.y - (sprite.height / 2)
                        if (sprite.visible) {
                            ctx.drawImage(game.internal.assets.imgs[sprite.img].img, GameJS.internal.render.scale.x(x, renderer, canvas), GameJS.internal.render.scale.y(y, renderer, canvas), GameJS.internal.render.scale.width(sprite.width, renderer, canvas), GameJS.internal.render.scale.height(sprite.height, renderer, canvas))
                        }
                    }
                }
            }
        },
        "games": {},
        "collision": {
            "methods": {
                "AABB": function(rect1, rect2) {
                    if (rect1.x <= rect2.x + rect2.width) {
                        if (rect1.x + rect1.width >= rect2.x) {
                            if (rect1.y <= rect2.y + rect2.height) {
                                if (rect1.y + rect1.height >= rect2.y) {
                                    return true
                                }
                            }
                        }
                    }
                    return false
                }
            }
        },
        "hex": function(num) {
            if (num.toString().length == 1) {
                return "0" + num.toString(16)
            }
            return num.toString(16)
        },
        "spriteTick": function(sprite, game) {

        }
    },
    "methods": {
        "cloneSprite": function(spriteID, inputCloneData) {
            if (spriteID == null) {
                // What if GameJS.internal.current.sprite is null?
                var sprite = GameJS.internal.current.sprite
            }
            else {
                if (GameJS.internal.current.game.internal.idIndex[spriteID] == null) {
                    console.error("Oops. You are trying to clone a sprite that doesn't exist. You tried to clone " + JSON.stringify(spriteID) + ".")
                    debugger
                }
                var sprite = GameJS.internal.current.game.game.sprites[GameJS.internal.current.game.internal.idIndex[spriteID]]
            }
            if (inputCloneData == null) {
                var cloneData = {}
            }
            else {
                var cloneData = inputCloneData
            }

            var id = GameJS.internal.findCloneID(sprite, GameJS.internal.current.game)
            var cloneSpriteID = GameJS.internal.findSpriteID(GameJS.internal.current.game)
            sprite.internal.cloneIDs[id] = cloneSpriteID
            sprite.internal.cloneCount++

            var newSpriteData = Object.assign({}, sprite)
            var i = 0
            for (i in sprite.clones) {
                newSpriteData[i] = sprite.clones[i]
            }
            var i = 0
            for (i in cloneData) {
                newSpriteData[i] = cloneData[i]
            }

            var newSprite = GameJS.internal.createSprite({
                "isClone": true,
                "cloneOf": sprite.id
            }, newSpriteData, GameJS.internal.current.game)
            newSprite.id = sprite.id + "#" + id
            GameJS.internal.current.game.game.sprites[cloneSpriteID] = newSprite
            Game.internal.idIndex[spriteID + "#" + id] = cloneSpriteID


            var i = 0
            for (i in newSprite.scripts.init) {
                newSprite.scripts.init[i](GameJS.internal.current.game, newSprite)
            }
        },
        "AABBTouching": function(spriteID) {
            if (GameJS.internal.current.game.internal.idIndex[spriteID] == null) {
                console.error("Oops. You are trying to perform AABB collision detection against a sprite that doesn't exist. The sprite was " + JSON.stringify(spriteID) + ".")
                debugger
            }
            if (GameJS.internal.current.sprite == null) {
                console.error("Oops. You are trying to perform AABB collision detection but you don't seem to be running it as a sprite.")
                debugger
            }
            var me = GameJS.internal.current.sprite
            // TODO: What if the sprite doesn't exist?
            // TODO: What if there's no game?
            // TODO: What if you don't specify the sprite
            var sprite = GameJS.internal.current.game.game.sprites[GameJS.internal.current.game.internal.idIndex[spriteID]]
            if (sprite.internal.cloneCount > 0) {
                if (sprite.visible) {
                    if (GameJS.internal.collision.methods.AABB({
                        "x": me.x - (me.width / 2),
                        "y": me.y - (me.height / 2),
                        "width": me.width,
                        "height": me.height
                    }, {
                        "x": sprite.x - (sprite.width / 2),
                        "y": sprite.y - (sprite.height / 2),
                        "width": sprite.width,
                        "height": sprite.height
                    })) {
                        return true
                    }
                }
                var i = 0
                for (i in sprite.internal.cloneIDs) {
                    if (sprite.internal.cloneIDs[i] == null) {
                        continue
                    }
                    var clone = GameJS.internal.current.game.game.sprites[sprite.internal.cloneIDs[i]]
                    if (me.id == spriteID + "#" + i && spriteID == me.cloneOf) {
                        continue
                    }
                    if (! clone.visible) {
                        continue
                    }

                    if (GameJS.internal.collision.methods.AABB({
                        "x": me.x - (me.width / 2),
                        "y": me.y - (me.height / 2),
                        "width": me.width,
                        "height": me.height
                    }, {
                        "x": clone.x - (clone.width / 2),
                        "y": clone.y - (clone.height / 2),
                        "width": clone.width,
                        "height": clone.height
                    })) {
                        return true
                    }
                }
            }
            return false
        }
    },
    "config": {
        "flags": {
            "warnOfUselessParameters": true
        }
    }
}
GameJS.internal.requestAnimationFrame.call(window, GameJS.internal.tick)
setInterval(function() {
    var i = 0
    for (i in GameJS.internal.games) {
        GameJS.internal.games[i].currentFPS = Math.min(GameJS.internal.games[i].internal.FPSFrames, 60)
        GameJS.internal.games[i].internal.FPSFrames = 0
    }
}, 1000)
