// TODO:
// == Important ==
// How do IDs work if they're multiple games, for assets.
// Widths and heights are innaccurate?
// Or is it something to do with changing the width and height and/or scale?
// High res canvases on the canvas?
// What if collision is tested before the sprite has a qtree id?
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
// Smart canvas rendering
// New name


// == Credits ==
// Images:
// Back icon -> https://www.flaticon.com/authors/itim2101
// Cross icon -> https://www.flaticon.com/authors/srip

BeginningJS = {
    "init": function(gameJSON) {
        if (typeof gameJSON != "object") {
            console.error("Oh no! Your game JSON appears to be the wrong type. It must be the type 'object', you used " + JSON.stringify(gameJSON) + ".")
            console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
            debugger
        }
        var error = false
        if (document.getElementById(gameJSON.htmlElementID) == null && gameJSON.htmlElementID != null) { // Make sure the element exists
            console.error("Oops, you specified the element to add the game canvas to but it doesn't seem to exist. \nThis is specified in 'GameJSON.htmlElementID' and is set to " + JSON.stringify(gameJSON.htmlElementID) + ". You might want to check that the HTML that creates the element is before your JavaScript.")
            console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
            error = true
        }

        var game = BeginningJS.internal.checkOb(gameJSON, {
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
                    "state": "game",
                    "display": {
                        "fillScreen": true
                    }
                },
                "types": ["object"],
                "description": "The game configuration settings."
            },
            "vars": {
                "default": {},
                "types": ["object"],
                "description": "An object that you can use for variables."
            }
        }, "GameJSON")
        BeginningJS.internal.current.game = game

        game.config = BeginningJS.internal.checkOb(game.config, {}, {
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
        game.config.display = BeginningJS.internal.checkOb(game.config.display, {}, {
            "fillScreen": {
                "default": false,
                "types": [
                    "boolean"
                ],
                "description": "Determines if the game will be upscaled to fit the screen."
            }
        }, "GameJSON.config")
        game.game = BeginningJS.internal.checkOb(game.game, {}, {
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
        game.game.assets = BeginningJS.internal.checkOb(game.game.assets, {
            "imgs": {
                "types": ["array"],
                "description": "The array that contains all the images to be loaded for the game."
            },
            "snds": {
                "types": ["array"],
                "description": "The array that contains all the images to be loaded for the game."
            }
        }, {}, "GameJSON.game.assets")
        game.game.scripts = BeginningJS.internal.checkOb(game.game.scripts, {}, {
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


        if (BeginningJS.internal.games.hasOwnProperty(game.ID)) {
            console.error("Oh no! You used an ID for your game that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.ID) + " in 'GameJSON.htmlElementID'.")
            console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
            error = true
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
                "lastRender": new Date(),
                "layers": []
            },
            "ids": [],
            "IDIndex": {},
            "FPSFrames": 0,
            "loadedDelay": 0,
            "soundsToPlay": []
        }
        game.internal.collision = {
            "tick": function(game) {
                /*
                var i = 0
                for (i in game.internal.collision.qtree.rectsToRemove) {
                    var c = game.internal.collision.qtree.rectsToRemove[i]
                    if (c != null) {
                        game.internal.collision.qtree.index.rectangles[c] = null
                    }
                }
                */
                //game.internal.collision.qtree.rectsToRemove = []

                var i = 0
                for (i in game.internal.collision.qtree.rectsToSplit) {
                    //console.log("split")
                    var c = game.internal.collision.qtree.rectsToSplit[i]

                    var rectangle = game.internal.collision.qtree.index.rectangles[c]

                    var xSubPixels = 0
                    var ySubPixels = 0
                    if (rectangle.x != Math.floor(rectangle.x))  {
                        xSubPixels++
                        rectangle.x = Math.floor(rectangle.x)
                    }
                    if (rectangle.y != Math.floor(rectangle.y))  {
                        ySubPixels++
                        rectangle.y = Math.floor(rectangle.y)
                    }

                    if (rectangle.width / 2 != Math.floor(rectangle.width / 2))  {
                        xSubPixels++
                        rectangle.width = Math.floor(rectangle.width / 2)
                    }
                    else {
                        rectangle.width = rectangle.width / 2
                    }
                    if (rectangle.height / 2 != Math.floor(rectangle.height / 2))  {
                        ySubPixels++
                        rectangle.height = Math.floor(rectangle.height / 2)
                    }
                    else {
                        rectangle.height = rectangle.height / 2
                    }


                    var objectCount = rectangle.objects
                    //rectangle.objects = 0
                    game.internal.collision.qtree.methods.addRect(game, rectangle.x + rectangle.width, rectangle.y, rectangle.width + xSubPixels, rectangle.height)
                    game.internal.collision.qtree.methods.addRect(game, rectangle.x, rectangle.y + rectangle.height, rectangle.width, rectangle.height + ySubPixels)
                    game.internal.collision.qtree.methods.addRect(game, rectangle.x + rectangle.width, rectangle.y + rectangle.height, rectangle.width + xSubPixels, rectangle.height + ySubPixels)

                    game.internal.collision.qtree.index.rectangles[c] = rectangle

                    var newObjectData = []

                    // TODO: rename object to sprite


                    var objectsToProcess = []
                    var objects = 0
                    var a = 0
                    while (a < objectCount) {
                        var object = rectangle.objectData[a]
                        if (typeof object != "string") { // TODO, should be null
                            object.internal.collision.qtree.IDs = []
                            object.internal.collision.qtree.dataIDs = []
                            objectsToProcess.push(object)
                            objects++
                        }
                        a++
                    }
                    rectangle.objectData = []
                    rectangle.objects = 0

                    var a = 0
                    while (a < objectsToProcess.length) {
                        var object = objectsToProcess[a]
                        game.internal.collision.qtree.methods.processSprite(object, game)
                        a++
                    }
                }

                game.internal.collision.qtree.rectsToSplit = []
            },
            "qtree": {
                "index": {
                    "canvas": qTreeCanvas,
                    "ctx": qTreeCtx,
                    "rectangles": [],
                    "rgb": [0, 0, 0],
                    "canvasDataCache": null
                },
                "rectsToSplit": [],
                "rectsToRemove": [],
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
                        game.internal.collision.qtree.index.rectangles[((rgb[0] * (256 * 256)) + (rgb[1] * 256)) + rgb[2]] = {
                            "x": x,
                            "y": y,
                            "width": width,
                            "height": height,
                            "objects": 0,
                            "objectData": []
                        }
                        var index = game.internal.collision.qtree.methods.canvasDataCache(game, true)
                        var xy = game.internal.collision.qtree.methods.xy(x, y, game.width, game.height)
                        /*
                        console.log([
                            index[xy * 4],
                            index[(xy * 4) + 1],
                            index[(xy * 4) + 2],
                            index[(xy * 4) + 3]
                        ])
                        */
                    },
                    "findTheRects": function(object, game, centred) {
                        var index = game.internal.collision.qtree.methods.canvasDataCache(game) // tmp TODO: Is it this?
                        var rect = BeginningJS.internal.collision.methods.spriteRect(object, 4, centred)

                        // TODO: Are the rectangles not being stored in the sprite internal stuff? <======================================================

                        var x = rect.x
                        var y = rect.y

                        var xy = game.internal.collision.qtree.methods.xy(x, y, game.width, game.height)
                        var pixel = {
                            "R": index[xy * 4],
                            "G": index[(xy * 4) + 1],
                            "B": index[(xy * 4) + 2],
                            "A": index[(xy * 4) + 3]
                        }
                        var total = ((pixel.R * (256 * 256)) + (pixel.G * 256)) + pixel.B
                        var rectangle = game.internal.collision.qtree.index.rectangles[total]
                        if (rectangle == null) {
                            //console.log(total)
                        }

                        var items = [
                            total
                        ]

                        var currentRectX = rectangle
                        var currentRectY = rectangle

                        var heightRemaining = rect.height
                        var loops = 0
                        while (heightRemaining > 0 && currentRectY.y + currentRectY.height < game.height || loops == 0) {
                            var widthRemaining = rect.width
                            while (widthRemaining > 0 && currentRectX.x + currentRectX.width < game.width) {
                                var xy = game.internal.collision.qtree.methods.xy(currentRectX.x + currentRectX.width, currentRectY.y, game.width, game.height)
                                var pixel = {
                                    "R": index[xy * 4],
                                    "G": index[(xy * 4) + 1],
                                    "B": index[(xy * 4) + 2],
                                    "A": index[(xy * 4) + 3]
                                }
                                var total = ((pixel.R * (256 * 256)) + (pixel.G * 256)) + pixel.B

                                widthRemaining = widthRemaining - currentRectX.width
                                var currentRectX = game.internal.collision.qtree.index.rectangles[total]
                                items.push(total)
                            }

                            var xy = game.internal.collision.qtree.methods.xy(x, currentRectY.y + currentRectY.height, game.width, game.height)
                            var pixel = {
                                    "R": index[xy * 4],
                                    "G": index[(xy * 4) + 1],
                                    "B": index[(xy * 4) + 2],
                                    "A": index[(xy * 4) + 3]
                                }
                            var tmp2 = total
                            var total = ((pixel.R * (256 * 256)) + (pixel.G * 256)) + pixel.B

                            heightRemaining = heightRemaining - currentRectY.height
                            var tmp = currentRectY
                            var currentRectY = game.internal.collision.qtree.index.rectangles[total]
                            if (currentRectY == null) {
                                //console.log(total, pixel, tmp, tmp2)
                            }
                            items[items.length] = total

                            loops++
                        }
                        return items
                    },
                    "processSprite": function(sprite, game) {
                        if (sprite.internal.collision.qtree.IDs != null) {
                            var updatedIDs = game.internal.collision.qtree.methods.findTheRects(sprite, game, 1)


                            if (updatedIDs.toString() == sprite.internal.collision.qtree.IDs.toString()) {
                                return
                            }


                            var i = 0
                            for (i in sprite.internal.collision.qtree.IDs) {
                                //console.log(sprite.internal.collision.qtree.IDs[i])
                                game.internal.collision.qtree.methods.removeObject(sprite.internal.collision.qtree.IDs[i], game, sprite.internal.collision.qtree.dataIDs[i])
                            }
                            //sprite.internal.collision.qtree.IDs = []
                            //sprite.internal.collision.qtree.dataIDs = []
                        }

                        var IDs = game.internal.collision.qtree.methods.addObject(sprite, game, 1)
                        sprite.internal.collision.qtree.IDs = IDs[0]
                        sprite.internal.collision.qtree.dataIDs = IDs[1]
                    },
                    "removeObject": function(id, game, dataIndex) {
                        game.internal.collision.qtree.index.rectangles[id].objects--
                        //console.log(JSON.stringify(game.internal.collision.qtree.index.rectangles[id].objectData[dataIndex]))
                        game.internal.collision.qtree.index.rectangles[id].objectData[dataIndex] = JSON.stringify(game.internal.collision.qtree.index.rectangles[id].objectData[dataIndex]) // TODO should be null
                        // TODO: What if it's now under 10?
                        /*
                        if (game.internal.collision.qtree.index.rectangles[id].objects < 10) { // Just become less than 10
                            if (! game.internal.collision.qtree.rectsToSplit.includes(id)) {
                                game.internal.collision.qtree.rectsToSplit[game.internal.collision.qtree.rectsToSplit.length] = id
                            }
                            var index = game.internal.collision.qtree.rectsToSplit.indexOf(id)
                            if (index != -1) {
                                game.internal.collision.qtree.rectsToSplit[index] = null
                            }
                        }
                        */
                    },
                    "splitRects": function() { // Debug
                        var game = BeginningJS.internal.current.game

                        var i = 0
                        for (i in game.internal.collision.qtree.index.rectangles) {
                            game.internal.collision.qtree.rectsToSplit.push(i)
                        }
                    },
                    "addObject": function(object, game, centred) {
                        var ids = game.internal.collision.qtree.methods.findTheRects(object, game, centred)
                        var dataIDs = []
                        /*
                        if (object.id == "orange#18") {
                            console.log("banana")
                        }

                        console.log(JSON.parse(JSON.stringify([
                            Game.internal.collision.qtree.index.rectangles,
                            object
                        ])))
                        */

                        var i = 0
                        for (i in ids) {
                            var rectangle = game.internal.collision.qtree.index.rectangles[ids[i]]
                            rectangle.objects++
                            rectangle.objectData.push(object)
                            if (rectangle.objects >= 50) {
                                if (rectangle.width >= 2) {
                                    if (rectangle.height >= 2) {
                                        if (! game.internal.collision.qtree.rectsToSplit.includes(ids[i])) {
                                            game.internal.collision.qtree.rectsToSplit.push(ids[i])
                                            //game.internal.collision.qtree.methods.splitRects()
                                        }
                                    }
                                }
                                /*
                                var index = game.internal.collision.qtree.rectsToRemove.indexOf(id)
                                if (index != -1) {
                                    game.internal.collision.qtree.rectsToRemove[index] = null
                                }
                                */
                            }
                            dataIDs[dataIDs.length] = Object.keys(rectangle.objectData).length - 1
                        }
                        return [ids, dataIDs]
                    },
                    "debugDisplay": function(canvas, ctx, game) {
                        canvas.width = game.width
                        canvas.height = game.height
                        ctx.clearRect(0, 0, canvas.width, canvas.height)

                        canvas.style.removeProperty("width")
                        canvas.style.setProperty("width", (canvas.width / 4) + "px", "important")
                        canvas.style.removeProperty("height")
                        canvas.style.setProperty("height", (canvas.height / 4) + "px", "important")

                        ctx.strokeStyle = "green"
                        ctx.lineWidth = 2
                        var i = 0
                        for (i in game.internal.collision.qtree.index.rectangles) {
                            rectangle = game.internal.collision.qtree.index.rectangles[i]
                            ctx.beginPath()
                            ctx.moveTo(rectangle.x, rectangle.y)
                            ctx.lineTo(rectangle.x + rectangle.width, rectangle.y)
                            ctx.lineTo(rectangle.x + rectangle.width, rectangle.y + rectangle.height)
                            ctx.lineTo(rectangle.x, rectangle.y + rectangle.height)
                            ctx.lineTo(rectangle.x, rectangle.y)
                            ctx.stroke()
                        }


                    },
                    "canvasDataCache": function(game, update) {
                        if (game.internal.collision.qtree.index.canvasDataCache == null || update) {
                            var canvas = game.internal.collision.qtree.index.canvas
                            game.internal.collision.qtree.index.canvasDataCache = game.internal.collision.qtree.index.ctx.getImageData(0, 0, canvas.width, canvas.height).data
                        }
                        return game.internal.collision.qtree.index.canvasDataCache
                    },
                    "xy": function(x, y, width, height) {
                        return (Math.min(Math.max(Math.round(y), 0), height - 1) * width) + Math.min(Math.max(Math.round(x), 0), width - 1)
                    }
                }
            }
        }
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
                        return true
                    }
                    return false
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
                "s": 91,
                "d": 68
            },
            "joysticks": {}
        }

        game.internal.collision.qtree.methods.addRect(game, 0, 0, qTreeCanvas.width / 2, qTreeCanvas.height / 2)
        game.internal.collision.qtree.methods.addRect(game, qTreeCanvas.width / 2, 0, qTreeCanvas.width / 2, qTreeCanvas.height / 2)
        game.internal.collision.qtree.methods.addRect(game, 0, qTreeCanvas.height / 2, qTreeCanvas.width / 2, qTreeCanvas.height / 2)
        game.internal.collision.qtree.methods.addRect(game, qTreeCanvas.width / 2, qTreeCanvas.height / 2, qTreeCanvas.width / 2, qTreeCanvas.height / 2)
        //game.internal.collision.qtree.methods.splitRects()

        game.currentFPS = 60
        game.currentRenderFPS = 60
        game.methods = {
            "gui": {
                "create": {
                    "button": {
                        "modern": function(config) {
                            if (config.type == "cross") {
                                BeginningJS.internal.checkOb(config, {
                                    "elementID": {
                                        "types": ["string"],
                                        "description": "Determines the GUI element that the button is attatched to."
                                    },
                                    "ID": {
                                        "types": ["string"],
                                        "description": "Determines the ID for the GUI element."
                                    }
                                })
                            }
                            if (type == "custom") {
                                /*
                                var required = {
                                    "img": {
                                        "types": ["string"]
                                    }
                                }
                                var missing = []
                                var wrongTypes = []

                                var i = 0
                                for (i in required) {
                                    if (config[i] == null) {
                                        missing[missing.length] = i
                                    }
                                    else {
                                        if (! required[i].types.includes(typeof config[i])) {
                                            wrongTypes[wrongTypes.length] = [i, typeof config[i]]
                                        }
                                    }
                                }
                                if (missing.length > 0) {

                                }
                                */
                            }
                        }
                    },
                    "controls": {
                        "joystick": function(optionsInput) {
                            var game = this.internal.game

                            var options = optionsInput
                            if (optionsInput == null) {
                                options = {}
                            }

                            options = BeginningJS.internal.checkOb(options, {
                                "id": {
                                    "types": ["string"],
                                    "description": "The ID for the joystick."
                                }
                            }, {
                                "circle": {
                                    "default": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiB2aWV3Qm94PSIwIDAgMTA1IDEwNSIgd2lkdGg9IjEwNSIgaGVpZ2h0PSIxMDUiPjxkZWZzPjxwYXRoIGQ9Ik0xMDIuNSA1Mi41QzEwMi41IDgwLjEgODAuMSAxMDIuNSA1Mi41IDEwMi41QzI0LjkgMTAyLjUgMi41IDgwLjEgMi41IDUyLjVDMi41IDI0LjkgMjQuOSAyLjUgNTIuNSAyLjVDODAuMSAyLjUgMTAyLjUgMjQuOSAxMDIuNSA1Mi41WiIgaWQ9ImkyQlNLa2dveHIiPjwvcGF0aD48L2RlZnM+PGc+PGc+PGc+PGc+PHVzZSB4bGluazpocmVmPSIjaTJCU0trZ294ciIgb3BhY2l0eT0iMSIgZmlsbC1vcGFjaXR5PSIwIiBzdHJva2U9IiMwMGZmZWEiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLW9wYWNpdHk9IjEiPjwvdXNlPjwvZz48L2c+PC9nPjwvZz48L3N2Zz4=",
                                    "types": ["string"],
                                    "description": "The src for the circle."
                                },
                                "joystick": {
                                    "default": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiB2aWV3Qm94PSIwIDAgMTEgMTEiIHdpZHRoPSIxMSIgaGVpZ2h0PSIxMSI+PGRlZnM+PHBhdGggZD0iTTEwLjUgNS41QzEwLjUgOC4yNiA4LjI2IDEwLjUgNS41IDEwLjVDMi43NCAxMC41IDAuNSA4LjI2IDAuNSA1LjVDMC41IDIuNzQgMi43NCAwLjUgNS41IDAuNUM4LjI2IDAuNSAxMC41IDIuNzQgMTAuNSA1LjVaIiBpZD0iYzk5YkIwWm5rIj48L3BhdGg+PC9kZWZzPjxnPjxnPjxnPjx1c2UgeGxpbms6aHJlZj0iI2M5OWJCMFpuayIgb3BhY2l0eT0iMSIgZmlsbD0iIzAwMDZmZiIgZmlsbC1vcGFjaXR5PSIxIj48L3VzZT48Zz48dXNlIHhsaW5rOmhyZWY9IiNjOTliQjBabmsiIG9wYWNpdHk9IjEiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlPSIjMDBmMGZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIxIj48L3VzZT48L2c+PC9nPjwvZz48L2c+PC9zdmc+",
                                    "types": ["string"],
                                    "description": "The src for the joystick."
                                },
                                "x": {
                                    "default": game.width - 100,
                                    "types": ["number"],
                                    "description": "The x position of the circle."
                                },
                                "y": {
                                    "default": game.height - 100,
                                    "types": ["number"],
                                    "description": "The y position of the circle."
                                },
                                "width": {
                                    "default": 100,
                                    "types": ["number"],
                                    "description": "The width of the circle."
                                },
                                "height": {
                                    "default": 100,
                                    "types": ["number"],
                                    "description": "The height of the circle."
                                }
                            })

                            if (game.internal.IDIndex[options.id] != null) {
                                console.error("Oops, looks like you've tried to use an ID for a joystick that has already been used. Try and think of something else.")
                                console.log("You used " + options.id + ".")
                                debugger
                            }

                            game.input.joysticks[options.id] = []


                            // Circle

                            var i = 0
                            while (game.internal.IDIndex["Internal.GUI.joystickCircle#" + i] != null) {
                                i++
                            }
                            var circleID = "Internal.GUI.joystickCircle#" + i
                            var i = 0
                            while (game.internal.IDIndex["Internal.GUI.joystick#" + i] != null) {
                                i++
                            }
                            var joystickID = "Internal.GUI.joystick#" + i


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
                            }
                            game.game.sprites.push(sprite)
                            if (game.internal.assets.imgs["Internal.GUI.joystickCircle"] == null) { // TODO: reserve
                                var img = new Image()
                                img.onload = function() {
                                    var game = BeginningJS.internal.games[this.id]
                                    this.removeAttribute("id")

                                    game.internal.assets.imgs["Internal.GUI.joystickCircle"].internal.loaded = true
                                }
                                img.id = game.ID
                                img.src = options.circle
                                game.internal.assets.imgs["Internal.GUI.joystickCircle"] = {
                                    "img": img,
                                    "internal": {
                                        "loaded": false
                                    }
                                }
                            }


                            BeginningJS.internal.createSprite({
                                "isClone": false,
                                "i": game.game.sprites.length - 1,
                                "runScripts": true
                            }, sprite, game, game.game.sprites.length - 1) // Reserve these IDs



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

                                                        var distance = Math.abs(me.x - me.vars.circle.x) + Math.abs(me.y - me.vars.circle.y)
                                                        if (distance > me.vars.circle.width / 2) {
                                                            var direction = BeginningJS.methods.maths.getDirection(me.vars.circle.x, me.vars.circle.y, me.x, me.y) // TODO

                                                            me.x = me.vars.circle.x
                                                            me.y = me.vars.circle.y

                                                            me.move(me.vars.circle.width / 2, direction)
                                                        }

                                                        var offsetX = me.x - me.vars.circle.x
                                                        var offsetY = me.y - me.vars.circle.y

                                                        var inputs = []
                                                        if (offsetX < -(me.width / 2)) {
                                                            inputs.push("left")
                                                        }
                                                        if (offsetX > me.width / 2) {
                                                            inputs.push("right")
                                                        }
                                                        if (offsetY < -(me.height / 2)) {
                                                            inputs.push("up")
                                                        }
                                                        if (offsetY > me.height / 2) {
                                                            inputs.push("down")
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
                            }
                            game.game.sprites.push(sprite)
                            if (game.internal.assets.imgs["Internal.GUI.joystick"] == null) { // TODO: reserve
                                var img = new Image()
                                img.onload = function() {
                                    var game = BeginningJS.internal.games[this.id]
                                    this.removeAttribute("id")

                                    game.internal.assets.imgs["Internal.GUI.joystick"].internal.loaded = true
                                }
                                img.id = game.ID
                                img.src = options.joystick
                                game.internal.assets.imgs["Internal.GUI.joystick"] = {
                                    "img": img,
                                    "internal": {
                                        "sprite": sprite,
                                        "loaded": false
                                    }
                                }
                            }

                            BeginningJS.internal.createSprite({
                                "isClone": false,
                                "i": game.game.sprites.length - 1,
                                "runScripts": true
                            }, sprite, game, game.game.sprites.length - 1) // Reserve these IDs
                        },
                        "internal": {
                            "game": game
                        }
                    }
                }
            }
        }

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
        game.internal.renderer.canvas.addEventListener("mousemove", function(context) {
            var game = context.target.game

            var rect = game.internal.renderer.canvas.getBoundingClientRect()

            game.input.mouse.x = Math.round(((context.clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width)
            game.input.mouse.y = Math.round(((context.clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)
        }, false)
        game.internal.renderer.canvas.addEventListener("mousedown", function(context) {
            var game = context.target.game

            BeginningJS.device.is.touchscreen = false

            BeginningJS.internal.autoplaySounds()

            game.input.mouse.down = true
        }, false)
        game.internal.renderer.canvas.addEventListener("mouseup", function(context) {
            var game = context.target.game

            BeginningJS.internal.autoplaySounds()

            game.input.mouse.down = false
        }, false)
        game.internal.renderer.canvas.addEventListener("touchstart", function(context) {
            var game = context.target.game

            BeginningJS.device.is.touchscreen = true

            var rect = game.internal.renderer.canvas.getBoundingClientRect()

            if (context.touches == null) {
                game.input.mouse.x = Math.round(((context.clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width)
                game.input.mouse.y = Math.round(((context.clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)
                game.input.touches = [
                    {
                        "x": game.input.mouse.x,
                        "y": game.input.mouse.y
                    }
                ]
            }
            else {
                game.input.mouse.x = Math.round(((context.touches[0].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width)
                game.input.mouse.y = Math.round(((context.touches[0].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)

                game.input.touches = []
                var i = 0
                for (i in context.touches) {
                    game.input.touches.push({
                        "x": Math.round(((context.touches[i].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width),
                        "y": Math.round(((context.touches[i].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)
                    })
                }
            }
            BeginningJS.internal.autoplaySounds()

            game.input.mouse.down = true
            context.preventDefault()
        }, false)
        game.internal.renderer.canvas.addEventListener("touchmove", function(context) {
            var game = context.target.game

            BeginningJS.device.is.touchscreen = true

            var rect = game.internal.renderer.canvas.getBoundingClientRect()

            if (context.touches == null) {
                game.input.mouse.x = Math.round(((context.clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width)
                game.input.mouse.y = Math.round(((context.clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)
                game.input.touches = [
                    {
                        "x": game.input.mouse.x,
                        "y": game.input.mouse.y
                    }
                ]
            }
            else {
                game.input.mouse.x = Math.round(((context.touches[0].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width)
                game.input.mouse.y = Math.round(((context.touches[0].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)

                game.input.touches = []
                var i = 0
                for (i in context.touches) {
                    game.input.touches.push({
                        "x": Math.round(((context.touches[i].clientX - rect.left) / (game.internal.renderer.canvas.width / window.devicePixelRatio)) * game.width),
                        "y": Math.round(((context.touches[i].clientY  - rect.top) / (game.internal.renderer.canvas.height / window.devicePixelRatio)) * game.height)
                    })
                }
            }
            BeginningJS.internal.autoplaySounds()

            game.input.mouse.down = true
            context.preventDefault()
        }, false)
        game.internal.renderer.canvas.addEventListener("touchend", function(context) {
            var game = context.target.game

            BeginningJS.device.is.touchscreen = true

            game.input.touches = []
            BeginningJS.internal.autoplaySounds()

            game.input.mouse.down = false
            context.preventDefault()
        }, false)
        document.addEventListener("keydown", function(context) {
            var i = 0
            for (i in BeginningJS.internal.games) {
                var game = BeginningJS.internal.games[i]
                game.input.keys.keys[context.keyCode] = true
            }

            BeginningJS.internal.autoplaySounds()
        }, false)
        document.addEventListener("keyup", function(context) {
            var i = 0
            for (i in BeginningJS.internal.games) {
                var game = BeginningJS.internal.games[i]
                game.input.keys.keys[context.keyCode] = false
            }
        }, false)

        game.internal.renderer.canvas.game = game

        if (game.config.display.fillScreen) {
            game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); position: absolute; top:0; bottom: 0; left: 0; right: 0; margin: auto;" // CSS from phaser (https://phaser.io)
        }
        else {
            game.internal.renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);" // CSS from phaser (https://phaser.io)
        }
        game.internal.renderer.ctx = game.internal.renderer.canvas.getContext("2d")
        game.internal.renderer.canvas.width = game.width
        game.internal.renderer.canvas.height = game.height



        document.addEventListener("readystatechange", function() {
            if (document.readyState == "complete") {
                var i = 0
                for (i in BeginningJS.internal.games) {
                    var game = BeginningJS.internal.games[i]
                    if (game.htmlElementID == null) {
                        try {
                            document.body.appendChild(game.internal.renderer.canvas)
                        }
                        catch (error) {
                            document.appendChild(game.internal.renderer.canvas)
                        }
                    }
                    else {
                        document.getElementById(game.htmlElementID).appendChild(game.internal.renderer.canvas)
                    }
                }
            }
        })
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
            if (BeginningJS.internal.getTypeOf(game.game.assets.imgs[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define an asset. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.assets.imgs[i])) + " in ''GameJSON.game.assets.imgs' item '" + i + "'.")
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
                error = true
            }
            game.game.assets.imgs[i] = BeginningJS.internal.checkOb(game.game.assets.imgs[i], {
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
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
                error = true
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
            img.src = game.game.assets.imgs[i].src
            game.internal.assets.loading++
            game.internal.assets.imgs[game.game.assets.imgs[i].id] = {
                "img": img
            }
        }

        var i = 0
        for (i in game.game.assets.snds) {
            if (BeginningJS.internal.getTypeOf(game.game.assets.snds[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define an asset. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.assets.snds[i])) + " in ''GameJSON.game.assets.snds' item '" + i + "'.")
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
                error = true
            }
            game.game.assets.snds[i] = BeginningJS.internal.checkOb(game.game.assets.snds[i], {
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
            }, {}, "GameJSON.game.assets.snds item " + i + ".")
            if (game.internal.assets.snds.hasOwnProperty(game.game.assets.snds[i].id)) {
                console.error("Oh no! You used an ID for an asset that is already being used. Try and think of something else. \nYou used " + JSON.stringify(game.game.assets.snds[i].id) + " in 'GameJSON.game.assets.snds item " + i  + "'.")
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
                error = true
            }
            var snd = new Audio()
            snd.oncanplay = function() {
                //game.internal.assets.loading--
                //game.internal.assets.loaded++
            }
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
            snd.src = game.game.assets.snds[i].src
            //game.internal.assets.loading++
            game.internal.assets.snds[game.game.assets.snds[i].id] = {
                "snd": snd
            }
        }
        BeginningJS.internal.testAutoPlay = function() {
            try {
                var promise = BeginningJS.internal.autoPlaySound.play()
            }
            catch {
                BeginningJS.internal.autoPlay = false
            }

            promise.catch(function(error) {
                BeginningJS.internal.autoPlay = false
                BeginningJS.internal.autoPlaySound.pause()
            })
            BeginningJS.internal.autoPlay = true
        }


        BeginningJS.internal.autoPlay = false
        BeginningJS.internal.autoPlaySound = new Audio()
        BeginningJS.internal.autoPlaySound.oncanplay = BeginningJS.internal.testAutoPlay
        BeginningJS.internal.autoPlaySound.src = "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABQTEFNRTMuOTlyBLkAAAAAAAAAADUgJAa/QQAB4AAAAnE5mRCNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAAB/gAAACAAAD/AAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDEKYPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=="


        // Scripts
        var i = 0
        for (i in game.game.scripts.init) {
            if (BeginningJS.internal.getTypeOf(game.game.scripts.init[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.scripts.init[i])) + " in ''GameJSON.game.scripts.init' item " + i + ".")
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
                error = true
            }
            game.game.scripts.init[i] = BeginningJS.internal.checkOb(game.game.scripts.init[i], {
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
            if (BeginningJS.internal.getTypeOf(game.game.scripts.main[i]) != "object") {
                console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.scripts.main[i])) + " in ''GameJSON.game.scripts.main' item " + i + ".")
                console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
                error = true
            }
            game.game.scripts.main[i] = BeginningJS.internal.checkOb(game.game.scripts.main[i], {
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
            var sprite = BeginningJS.internal.createSprite({
                "isClone": false,
                "i": i
            }, game.game.sprites[i], game, i) // TODO, should be game <=================
        }

        if (error) {
            debugger
        }
        else {
            if (game.game.scripts.preload == "function") {
                game.game.scripts.preload(game)
            }
        }

        BeginningJS.internal.games[game.ID] = game

        BeginningJS.internal.current.game = null

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
            if (data.type == null) {
                var type = startSprite.type
            }
            else {
                var type = data.type
            }
            if (type == "sprite") {
                var sprite = BeginningJS.internal.checkOb(startSprite.clones, {}, {
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
                    "scripts": {
                        "default": {
                            "init": [],
                            "main": []
                        },
                        "types": [
                            "object"
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
                    "vars": {
                        "default": {},
                        "types": [
                            "object"
                        ],
                        "description": "An object you can use to store data for the sprite."
                    },
                    "alpha": {
                        "default": startSprite.alpha,
                        "types": [
                            "number"
                        ],
                        "description": "The alpha of the sprite. 1 = Fully visible. 0 = Invisible."
                    }
                }, "function cloneSprite cloning the sprite " + JSON.stringify(data.spriteToClone) + ".")
            }
            else {
                if (type == "canvas") {
                    var sprite = BeginningJS.internal.checkOb(startSprite.clones, {}, {
                        "x": {
                            "default": startSprite.x,
                            "types": [
                                "number"
                            ],
                            "description": "The x position for the canvas sprite to start at."
                        },
                        "y": {
                            "default": startSprite.y,
                            "types": [
                                "number"
                            ],
                            "description": "The y position for the canvas sprite to start at."
                        },
                        "width": {
                            "default": startSprite.width,
                            "types": [
                                "number"
                            ],
                            "description": "The width for the canvas sprite."
                        },
                        "height": {
                            "default": startSprite.height,
                            "types": [
                                "number"
                            ],
                            "description": "The height for the canvas sprite."
                        },
                        "scripts": {
                            "default": {
                                "init": [],
                                "main": []
                            },
                            "types": [
                                "object"
                            ],
                            "description": "The canvas sprite's scripts."
                        },
                        "clones": {
                            "default": {},
                            "types": [
                                "object"
                            ],
                            "description": "The default data for a clone of this canvas sprite. \nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                        },
                        "visible": {
                            "default": true,
                            "types": [
                                "boolean"
                            ],
                            "description": "Determines if the canvas sprite is visible or not."
                        },
                        "vars": {
                            "default": {},
                            "types": [
                                "object"
                            ],
                            "description": "An object you can use to store data for the canvas sprite."
                        },
                        "type": {
                            "default": startSprite.type,
                            "types": [
                                "string"
                            ],
                            "description": "The type of the sprite (sprite, canvas)."
                        },
                        "ctx": {
                            "default": null,
                            "types": null,
                            "description": "A read-only atribute."
                        },
                        "canvas": {
                            "default": null,
                            "types": null,
                            "description": "A read-only atribute."
                        }
                    }, "GameJSON.game.sprites item " + data.i + ".")
                }
                else {
                    console.log(startSprite)
                    console.error("Oh no! You used an invalid type for a clone. \nYou used " + JSON.stringify(type) + " in 'GameJSON.game.sprites item' " + data.i  + ". While cloning sprite " + JSON.stringify(startSprite.id) + ".")
                    console.error("Beginning.js hit a critical error, look at the error above for more information.")
                    debugger
                }
            }
            sprite.scripts = BeginningJS.internal.checkOb(sprite.scripts, {}, {
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
                if (BeginningJS.internal.getTypeOf(sprite.scripts.init[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of init scripts. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(sprite.scripts.init[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    //console.log(sprite.scripts.init[c])
                    console.error("Beginning.js hit a critical error, look at the error above for more information.")
                    debugger
                }
            }
            var c = 0
            for (c in sprite.scripts.main) {
                if (BeginningJS.internal.getTypeOf(sprite.scripts.main[c]) != "function") {
                    console.error("Oh no! You need to use the type 'function' in a clone's array of main scripts. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(sprite.scripts.main[c])) + " while cloning the sprite " + data.spriteToClone + ".  The value is...")
                    //console.log(sprite.scripts.main[c])
                    console.error("Beginning.js hit a critical error, look at the error above for more information.")
                    debugger
                }
            }
        },
        "createSprite": function(data, spriteData, game, id) {
            if (data.isClone) {
                BeginningJS.internal.checkClones(spriteData, data)
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
                    "cloneIDs": [],
                    "collision": {
                        "qtree": {
                            "IDs": null,
                            "dataIDs": null
                        }
                    }
                }
                sprite.game = game
                sprite.idIndex = data.cloneSpriteID

                if (sprite.type == "canvas") {
                    sprite.canvas = document.createElement("canvas")
                    sprite.canvas.width = sprite.width
                    sprite.canvas.height = sprite.height
                    sprite.ctx = sprite.canvas.getContext("2d")
                }

                BeginningJS.internal.spriteTick(sprite, game) // TODO: Change current sprite
            }
            else {
                if (spriteData.type == null) {
                    spriteData.type = "sprite"
                }
                if (spriteData.type == "sprite") {
                    var sprite = BeginningJS.internal.checkOb(spriteData, {
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
                        },
                        "vars": {
                            "default": {},
                            "types": [
                                "object"
                            ],
                            "description": "An object you can use to store data for the sprite."
                        },
                        "type": {
                            "default": "sprite",
                            "types": [
                                "string"
                            ],
                            "description": "The type of the sprite (sprite, canvas)."
                        },
                        "alpha": {
                            "default": 1,
                            "types": [
                                "number"
                            ],
                            "description": "The alpha of the sprite. 1 = Fully visible. 0 = Invisible."
                        }
                    }, "GameJSON.game.sprites item " + data.i + ".")
                }
                else {
                    if (spriteData.type == "canvas") {
                        var sprite = BeginningJS.internal.checkOb(spriteData, {
                            "x": {
                                "types": [
                                    "number"
                                ],
                                "description": "The x position for the canvas sprite to start at."
                            },
                            "y": {
                                "types": [
                                    "number"
                                ],
                                "description": "The y position for the canvas sprite to start at."
                            },
                            "id": {
                                "types": [
                                    "string"
                                ],
                                "description": "The id for the canvas sprite to be targeted by."
                            },
                            "width": {
                                "types": [
                                    "number"
                                ],
                                "description": "The width for the canvas sprite."
                            },
                            "height": {
                                "types": [
                                    "number"
                                ],
                                "description": "The height for the canvas sprite."
                            }
                        }, {
                            "scripts": {
                                "default": {
                                    "init": [],
                                    "main": []
                                },
                                "types": [
                                    "object"
                                ],
                                "description": "The canvas sprite's scripts."
                            },
                            "clones": {
                                "default": {},
                                "types": [
                                    "object"
                                ],
                                "description": "The default data for a clone of this canvas sprite. \nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                            },
                            "visible": {
                                "default": true,
                                "types": [
                                    "boolean"
                                ],
                                "description": "Determines if the canvas sprite is visible or not."
                            },
                            "vars": {
                                "default": {},
                                "types": [
                                    "object"
                                ],
                                "description": "An object you can use to store data for the canvas sprite."
                            },
                            "type": {
                                "default": "sprite",
                                "types": [
                                    "string"
                                ],
                                "description": "The type of the sprite (sprite, canvas)."
                            }
                        }, "GameJSON.game.sprites item " + data.i + ".")

                        if (sprite.type == "canvas") {
                            sprite.canvas = document.createElement("canvas")
                            sprite.canvas.width = sprite.width
                            sprite.canvas.height = sprite.height
                            sprite.ctx = sprite.canvas.getContext("2d")
                        }
                    }
                    else {
                        console.error("Oh no! You used an invalid type for a sprite. \nYou used " + JSON.stringify(sprite.type) + " in 'GameJSON.game.sprites item' " + data.i  + ".")
                        console.error("Beginning.js hit a critical error, look at the error above for more information.")
                        debugger
                    }
                }

                sprite.scripts = BeginningJS.internal.checkOb(sprite.scripts, {}, {
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
                sprite.cloneID = null
                sprite.internal = {
                    "cloneCount": 0,
                    "cloneIDs": [],
                    "collision": {
                        "qtree": {
                            "IDs": null,
                            "dataIDs": null
                        }
                    }
                }
                sprite.game = game
                sprite.idIndex = parseInt(data.i)

                if (game.internal.IDIndex[sprite.id] != null) {
                    console.error("Oh no! You used an ID for a sprite that is already being used. Try and think of something else. \nYou used " + JSON.stringify(sprite.id) + " in 'GameJSON.game.sprites item' " + data.i  + ".")
                    console.error("Beginning.js hit a critical error, look at the error above for more information.")
                    debugger
                }
                game.internal.IDIndex[sprite.id] = Object.keys(game.internal.IDIndex).length


                var c = 0
                for (c in game.game.sprites[data.i].scripts.init) {
                    if (BeginningJS.internal.getTypeOf(game.game.sprites[data.i].scripts.init[c]) != "object") {
                        console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.sprites[data.i].scripts.init[c])) + " in ''GameJSON.game.game.sprites' item " + c + " -> scripts.init.")
                        console.error("data.Beginning.js hit a critical error, look at the error above for more information.")
                        debugger
                    }
                    game.game.sprites[data.i].scripts.init[c] = BeginningJS.internal.checkOb(game.game.sprites[data.i].scripts.init[c], {
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
                    if (game.internal.scripts.index.spritesInit[game.game.sprites[data.i].scripts.init[c].stateToRun] == null) {
                        game.internal.scripts.index.spritesInit[game.game.sprites[data.i].scripts.init[c].stateToRun] = []
                    }
                    game.internal.scripts.index.spritesInit[game.game.sprites[data.i].scripts.init[c].stateToRun][game.internal.scripts.index.spritesInit[game.game.sprites[data.i].scripts.init[c].stateToRun].length] = {
                        "script": c,
                        "sprite": game.game.sprites[data.i]
                    }
                }
                var c = 0
                for (c in game.game.sprites[data.i].scripts.main) {
                    if (BeginningJS.internal.getTypeOf(game.game.sprites[data.i].scripts.main[c]) != "object") {
                        console.error("Oh no! You need to use the type 'object' to define a script. \nYou used type " + JSON.stringify(BeginningJS.internal.getTypeOf(game.game.sprites[data.i].scripts.main[c])) + " in ''GameJSON.game.game.sprites' item " + c + " -> scripts.main.")
                        console.error("data.Beginning.js hit a critical error, look at the error above for more information.")
                        debugger
                    }
                    game.game.sprites[data.i].scripts.main[c] = BeginningJS.internal.checkOb(game.game.sprites[data.i].scripts.main[c], {
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
                    }, {}, "GameJSON.game.game.sprites item " + c + " -> scripts.main.")
                    if (game.internal.scripts.index.spritesMain[game.game.sprites[data.i].scripts.main[c].stateToRun] == null) {
                        game.internal.scripts.index.spritesMain[game.game.sprites[data.i].scripts.main[c].stateToRun] = []
                    }
                    game.internal.scripts.index.spritesMain[game.game.sprites[data.i].scripts.main[c].stateToRun][game.internal.scripts.index.spritesMain[game.game.sprites[data.i].scripts.main[c].stateToRun].length] = {
                        "script": c,
                        "sprite": game.game.sprites[data.i]
                    }
                }

                if (data.runScripts) {
                    var spriteWas = BeginningJS.internal.current.sprite
                    var gameWas = BeginningJS.internal.current.game

                    BeginningJS.internal.current.sprite = sprite
                    BeginningJS.internal.current.game = game

                    var i = 0
                    for (i in sprite.scripts.init) {
                        var script = sprite.scripts.init[i]
                        script.code(BeginningJS.internal.current.game, BeginningJS.internal.current.sprite)
                    }

                    BeginningJS.internal.current.sprite = spriteWas
                    BeginningJS.internal.current.game = gameWas
                }
            }
            sprite.layer = game.internal.renderer.layers.length
            game.internal.renderer.layers.push(parseInt(id))

            // Sprite methods
            sprite.bringToFront = function() {
                var spriteWas = BeginningJS.internal.current.sprite
                var gameWas = BeginningJS.internal.current.game

                var sprite = this
                BeginningJS.internal.current.sprite = sprite
                var game = sprite.game
                BeginningJS.internal.current.game = game



                var copyID = game.internal.renderer.layers.indexOf(sprite.idIndex)
                var copy = game.internal.renderer.layers[copyID]

                // TODO: What if there're no sprites?

                if (game.internal.renderer.layers[game.internal.renderer.layers.length - 1] == sprite.idIndex) {
                    BeginningJS.internal.current.sprite = spriteWas
                    BeginningJS.internal.current.game = gameWas
                    return
                }

                var tmp = game.internal.renderer.layers[game.internal.renderer.layers.length - 1]
                game.internal.renderer.layers[game.internal.renderer.layers.length - 1] = sprite.idIndex
                game.internal.renderer.layers[game.internal.renderer.layers.indexOf(sprite.idIndex)] = null

                var done = false
                var i = game.internal.renderer.layers.length - 2
                while (i >= 0 && (! done)) {
                    if (game.internal.renderer.layers[i] == null) {
                        done = true
                    }
                    var tmp2 = game.internal.renderer.layers[i]
                    game.internal.renderer.layers[i] = tmp
                    tmp = tmp2
                    i--
                }

                BeginningJS.internal.current.sprite = spriteWas
                BeginningJS.internal.current.game = gameWas
            }
            sprite.sendToBack = function() {
                var spriteWas = BeginningJS.internal.current.sprite
                var gameWas = BeginningJS.internal.current.game

                var sprite = this
                BeginningJS.internal.current.sprite = sprite
                var game = sprite.game
                BeginningJS.internal.current.game = game



                var copyID = game.internal.renderer.layers.indexOf(sprite.idIndex)
                var copy = game.internal.renderer.layers[copyID]

                // TODO: What if there're no sprites?

                if (game.internal.renderer.layers[0] == sprite.idIndex) {
                    BeginningJS.internal.current.sprite = spriteWas
                    BeginningJS.internal.current.game = gameWas
                    return
                }

                var tmp = game.internal.renderer.layers[0]
                game.internal.renderer.layers[0] = sprite.idIndex
                game.internal.renderer.layers[sprite.idIndex] = null

                var done = false
                var i = 1
                while (i < game.internal.renderer.layers.length && (! done)) {
                    if (game.internal.renderer.layers[i] == null) {
                        done = true
                    }
                    game.internal.renderer.layers[i] = tmp
                    var tmp = game.internal.renderer.layers[i]
                    i++
                }

                BeginningJS.internal.current.sprite = spriteWas
                BeginningJS.internal.current.game = gameWas
            }
            sprite.last = {
                "collision": null
            }
            sprite.touching = {
                "sprite": {
                    "AABB": function(spriteID) {
                        var me = this.internal.sprite
                        var game = me.game

                        // Am *I* touching the sprite or set of sprite clones identified
                        // TODO: What if the sprite doesn't exist?
                        // TODO: What if there's no game?
                        // TODO: What if you don't specify the sprite

                        var tmpchecks = 0 // TODO

                        // Get the parent sprite which 'contains' the clones to check
                        var parentsprite = game.game.sprites[game.internal.IDIndex[spriteID]]
                        if (parentsprite.internal.cloneCount > 0) {
                            if (BeginningJS.config.flags.useQTrees) {
                                if (parentsprite.visible) {
                                    if (BeginningJS.internal.collision.methods.AABB(
                                        BeginningJS.internal.collision.methods.spriteRect(me, 2, 1),
                                        BeginningJS.internal.collision.methods.spriteRect(parentsprite, 2, 1))) {
                                            return true
                                    }
                                }

                                if (me.cloneOf == null) {
                                    var id = me.id
                                }
                                else {
                                    var id = me.cloneOf
                                }


                                var sprites = []
                                var i = 0
                                for (i in me.internal.collision.qtree.IDs) {

                                    var rectangle = Game.internal.collision.qtree.index.rectangles[me.internal.collision.qtree.IDs[i]]

                                    var objects = 0
                                    var newObjectData = []


                                    var c = 0
                                    //console.log(rectangle.objects, rectangle.objectData)
                                    while (objects < rectangle.objects && c < Object.keys(rectangle.objectData).length) {
                                        tmpchecks++ // TODO
                                        if (typeof rectangle.objectData[c] != "object") { // TODO should be == null
                                            c++
                                            //console.log("A")
                                            continue
                                        }
                                        /*
                                        if (rectangle.objectData[c].id == "orange#18") {
                                            console.log("hmm")
                                        }
                                        */
                                        newObjectData.push(rectangle.objectData[c])
                                        objects++

                                        var clone = rectangle.objectData[c]

                                        sprites[sprites.length] = clone
                                        if (id == spriteID) {
                                            if (clone.cloneOf != spriteID) {

                                                c++
                                                //console.log("B")
                                                /*
                                                if (me.id == "orange#18") {
                                                    if (clone.id == "orange#19") {
                                                        console.log("A")
                                                    }
                                                }
                                                */
                                                continue
                                            }
                                        }
                                        if (clone.cloneOf == id) {
                                            if (me.cloneID == clone.cloneID) {
                                                c++
                                                //console.log("C")
                                                /*
                                                if (me.id == "orange#18") {
                                                    if (clone.id == "orange#19") {
                                                        console.log("B")
                                                    }
                                                }
                                                */
                                                continue
                                            }
                                        }
                                        if (! clone.visible) {
                                            c++
                                            //console.log("D")
                                            /*
                                            if (me.id == "orange#18") {
                                                if (clone.id == "orange#19") {
                                                    console.log("C")
                                                }
                                            }
                                            */
                                            continue
                                        }
                                        //console.log("banana")

                                        if (BeginningJS.internal.collision.methods.AABB(
                                            BeginningJS.internal.collision.methods.spriteRect(me, 2, 1),
                                            BeginningJS.internal.collision.methods.spriteRect(clone, 2, 1))) {
                                                //console.log(tmpchecks, true) // TODO
                                                return true
                                        }
                                        c++
                                    }
                                    if (c >= Object.keys(rectangle.objectData).length) {
                                        //console.log(objects)
                                        //rectangle.objects = objects // In case it's somehow wrong TODO
                                    }

                                    //rectangle.objectData = newObjectData // If it's false we might as well collect the rubbish... TODO
                                }
                                //console.log(tmpchecks, false) // TODO
                                return false
                            }
                            else {
                                // We're not using QTrees
                                if (parentsprite.visible) {
                                    if (BeginningJS.internal.collision.methods.AABB(
                                        BeginningJS.internal.collision.methods.spriteRect(me, 2, 1),
                                        BeginningJS.internal.collision.methods.spriteRect(parentsprite, 2, 1))) {
                                            return true
                                    }
                                }
                                var i = 0
                                for (i in parentsprite.internal.cloneIDs) {
                                    if (parentsprite.internal.cloneIDs[i] == null) {
                                        continue
                                    }
                                    var clone = game.game.sprites[parentsprite.internal.cloneIDs[i]]
                                    if (me.id == spriteID + "#" + i && spriteID == me.cloneOf) {
                                        continue
                                    }
                                    if (! clone.visible) {
                                        continue
                                    }

                                    tmpchecks++ // TODO

                                    if (BeginningJS.internal.collision.methods.AABB(
                                        BeginningJS.internal.collision.methods.spriteRect(me, 2, 1),
                                        BeginningJS.internal.collision.methods.spriteRect(clone, 2, 1))) {
                                            //console.log(tmpchecks, true) // TODO
                                            return true
                                    }
                                }
                                //console.log(tmpchecks, false) // TODO
                                return false
                            }
                        }
                    },
                    "internal": {
                        "sprite": sprite
                    }
                },
                "mouse": {
                    "AABB": function() {
                        var me = this.internal.sprite
                        var game = me.game

                        var mouseX = game.input.mouse.x
                        var mouseY = game.input.mouse.y

                        var rect = BeginningJS.internal.collision.methods.spriteRect(me, 2, 1)
                        // TODO: What if the sprite doesn't exist?
                        // TODO: What if there's no game?
                        if (BeginningJS.device.is.touchscreen) {
                            var i = 0
                            for (i in game.input.touches) {
                                var input = game.input.touches[i]
                                if (input.x <= rect.x + rect.width) {
                                    if (input.x >= rect.x) {
                                        if (input.y <= rect.y + rect.height) {
                                            if (input.y >= rect.y) {
                                                me.last.collision = {
                                                    "x": input.x,
                                                    "y": input.y,
                                                    "type": "mouse"
                                                }
                                                return true
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
                                            }
                                            return true
                                        }
                                    }
                                }
                            }
                        }

                        me.last.collision = null
                        return false
                    },
                    "internal": {
                        "sprite": sprite
                    }
                }
            }
            sprite.move = function(distance, angle) { // TODO: add rotation
                var me = this

                var rad = BeginningJS.methods.maths.degToRad(angle)

                me.x += Math.sin(rad) * distance
                me.y += Math.cos(rad) * distance
            }
            sprite.clone = function(inputCloneData) {
                var spriteWas = BeginningJS.internal.current.sprite
                var gameWas = BeginningJS.internal.current.game


                var sprite = this
                BeginningJS.internal.current.sprite = sprite
                BeginningJS.internal.current.game = sprite.game

                if (inputCloneData == null) {
                    var cloneData = {}
                }
                else {
                    var cloneData = inputCloneData
                }

                var id = BeginningJS.internal.findCloneID(sprite, BeginningJS.internal.current.game)
                var cloneSpriteID = BeginningJS.internal.findSpriteID(BeginningJS.internal.current.game)
                sprite.internal.cloneIDs[id] = sprite.id
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

                var newSprite = BeginningJS.internal.createSprite({
                    "isClone": true,
                    "cloneOf": sprite.id,
                    "cloneSpriteID": cloneSpriteID
                }, newSpriteData, BeginningJS.internal.current.game, cloneSpriteID)
                newSprite.id = sprite.id + "#" + id
                newSprite.cloneID = id
                BeginningJS.internal.current.game.game.sprites[cloneSpriteID] = newSprite
                BeginningJS.internal.current.game.internal.IDIndex[sprite.id + "#" + id] = cloneSpriteID

                BeginningJS.internal.current.sprite = newSprite

                var i = 0
                for (i in newSprite.scripts.init) {
                    newSprite.scripts.init[i](BeginningJS.internal.current.game, newSprite)
                }

                BeginningJS.internal.current.sprite = spriteWas
                BeginningJS.internal.current.game = gameWas


                return newSprite
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
                            if (! required[i].types.includes(BeginningJS.internal.getTypeOf(ob[i]))) {
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
                        if (! optional[i].types.includes(BeginningJS.internal.getTypeOf(ob[i]))) {
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
                            message[message.length] = " " + c + " -> " + required[c].description + " \n You used the type " + JSON.stringify(BeginningJS.internal.getTypeOf(ob[c])) + ", it can only be " + JSON.stringify(required[c].types[0]) + ". \n"
                        }
                        else {
                            message[message.length] = " " + c + " -> " + required[c].description + " \n You used the type " + JSON.stringify(BeginningJS.internal.getTypeOf(ob[c])) + ", it has to be one of these types: \n"
                            var a = 0
                            for (a in required[c].types) {
                                message[message.length] = "  " + JSON.stringify(required[c].types[a]) + " \n"
                            }
                        }
                    }
                    else {
                        if (optional[c].types.length == 1) {
                            message[message.length] = " " + c + " -> " + optional[c].description + " \n You used the type " + JSON.stringify(BeginningJS.internal.getTypeOf(ob[c])) + ", it can only be type " + JSON.stringify(optional[c].types[0]) + ". \n"
                        }
                        else {
                            message[message.length] = " " + c + " -> " + optional[c].description + " \n You used the type " + JSON.stringify(BeginningJS.internal.getTypeOf(ob[c])) + ", it has to be one of these types: \n"
                            var a = 0
                            for (a in optional[c].types) {
                                message[message.length] = "  " + JSON.stringify(optional[c].types[a]) + " \n"
                            }
                        }
                    }
                }

                console.error(message.join(""))
            }
            if (BeginningJS.config.flags.warnOfUselessParameters) { // Check the flag
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

                    message[message.length] = "Alternatively, you can disable these warnings by editing the 'warnOfUselessParameters' flag. \nUse this code: 'BeginningJS.config.flags.warnOfUselessParameters = false'"
                    console.warn(message.join(""))
                }
            }

            if (missing.length > 0 || wrongTypes.length > 0) { // Was there an error?
                console.error("Beginning.js hit a critical error, look at the error above for more information.")
                debugger
            }
            return newOb
        },
        "requestAnimationFrame": window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
        "tick": function() {
            var i = 0
            for (i in BeginningJS.internal.games) {
                var start = new Date()
                var ctx = BeginningJS.internal.games[i].internal.renderer.ctx
                var canvas = BeginningJS.internal.games[i].internal.renderer.canvas
                var game = BeginningJS.internal.games[i]

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


                if (BeginningJS.internal.games[i].loaded) {
                    var game = BeginningJS.internal.games[i]
                    BeginningJS.internal.current.game = game


                    BeginningJS.internal.processSprites(game)
                    BeginningJS.internal.scripts(game)
                    game.internal.collision.tick(game)
                    BeginningJS.internal.render.renderFrame[game.internal.renderer.type](game, game.internal.renderer.canvas, game.internal.renderer.ctx, game.internal.renderer)
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


                    if (BeginningJS.internal.games[i].internal.assets.loading == 0) {
                        BeginningJS.internal.games[i].internal.loadedDelay++
                        if (BeginningJS.internal.games[i].internal.loadedDelay > 100) {
                            BeginningJS.internal.games[i].loaded = true
                            var c = 0
                            for (c in BeginningJS.internal.games[i].game.sprites) {
                                var sprite = BeginningJS.internal.games[i].game.sprites[c]

                                var customDimentions = true

                                // TODO: What if it doesn't exist?

                                if (sprite.width == "auto") {
                                    sprite.width = BeginningJS.internal.games[i].internal.assets.imgs[sprite.img].img.width
                                    customDimentions = false
                                }
                                if (sprite.height == "auto") {
                                    sprite.height = BeginningJS.internal.games[i].internal.assets.imgs[sprite.img].img.height
                                    customDimentions = false
                                }
                                if (! customDimentions) {
                                    sprite.width = BeginningJS.internal.games[i].internal.assets.imgs[sprite.img].img.width * sprite.scale
                                    sprite.height = BeginningJS.internal.games[i].internal.assets.imgs[sprite.img].img.height * sprite.scale
                                }
                            }
                        }
                    }
                }
                BeginningJS.internal.games[i].internal.FPSFrames++
                BeginningJS.internal.games[i].currentRenderFPS = 1000 / (new Date() - start)
                BeginningJS.internal.games[i].internal.renderer.lastRender = new Date()
            }
            BeginningJS.internal.requestAnimationFrame.call(window, BeginningJS.internal.tick)
        },
        "scripts": function(game) {
            if (game.internal.lastState != game.state) {
                BeginningJS.internal.current.sprite = null
                var i = 0
                for (i in game.internal.scripts.index.init[game.state]) {
                    var script = game.game.scripts.init[game.internal.scripts.index.init[game.state][i]]
                    script.code(game)
                }
                var i = 0
                for (i in game.internal.scripts.index.spritesInit[game.state]) {
                    var sprite = game.internal.scripts.index.spritesInit[game.state][i].sprite
                    BeginningJS.internal.current.sprite = game.game.sprites[game.internal.IDIndex[sprite.id]] // What if it's null?
                    var script = sprite.scripts.init[game.internal.scripts.index.spritesInit[game.state][i].script]
                    script.code(game, sprite)
                }
                game.internal.lastState = game.state
            }

            BeginningJS.internal.current.sprite = null
            var i = 0
            for (i in game.internal.scripts.index.main[game.state]) {
                var script = game.game.scripts.main[game.internal.scripts.index.main[game.state][i]]
                script.code(game)
            }
            var i = 0
            for (i in game.internal.scripts.index.spritesMain[game.state]) {
                var sprite = game.internal.scripts.index.spritesMain[game.state][i].sprite
                BeginningJS.internal.current.sprite = game.game.sprites[game.internal.IDIndex[sprite.id]] // What if it's null?
                if (game.internal.scripts.index.spritesMain[game.state][i].isClone) {
                    BeginningJS.internal.current.sprite = sprite
                    sprite.scripts.main[game.internal.scripts.index.spritesMain[game.state][i].script](game, sprite)
                }
                else {
                    var script = sprite.scripts.main[game.internal.scripts.index.spritesMain[game.state][i].script]
                    script.code(game, sprite)
                }
            }
            BeginningJS.internal.current.sprite = null
            BeginningJS.internal.current.game = null

        },
        "processSprites": function(game) { // TODO: Only do sprites where collision is enabled
            if (BeginningJS.config.flags.useQTrees) {
                var i = 0
                for (i in game.game.sprites) { // TODO: Which sprites can use collision detection?
                    var sprite = game.game.sprites[i]
                    game.internal.collision.qtree.methods.processSprite(sprite, game) // TODO: What if a sprite doesn't need it?
                }
            }
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
                    for (i in game.internal.renderer.layers) {
                        var sprite = game.game.sprites[game.internal.renderer.layers[i]]
                        var x = sprite.x - (sprite.width / 2)
                        var y = sprite.y - (sprite.height / 2)

                        var scaled = {
                            "x": BeginningJS.internal.render.scale.x(x, renderer, canvas),
                            "y": BeginningJS.internal.render.scale.y(y, renderer, canvas),
                            "width": BeginningJS.internal.render.scale.width(sprite.width, renderer, canvas),
                            "height": BeginningJS.internal.render.scale.height(sprite.height, renderer, canvas)
                        }
                        if (sprite.visible) {
                            var flip = []
                            //var flipDimentions = []
                            if (scaled.width > 0) {
                                flip.push(1)
                                //flipDimentions.push(0)
                            }
                            else {
                                flip.push(-1)
                                //flipDimentions.push(scaled.width)
                            }
                            if (scaled.height > 0) {
                                flip.push(1)
                                //flipDimentions.push(0)
                            }
                            else {
                                flip.push(-1)
                                //flipDimentions.push(scaled.height)
                            }
                            ctx.save()
                            ctx.scale(flip[0], flip[1])


                            ctx.globalAlpha = 1
                            if (sprite.type == "sprite") {
                                ctx.globalAlpha = sprite.alpha

                                ctx.drawImage(game.internal.assets.imgs[sprite.img].img, scaled.x * flip[0], scaled.y * flip[1], scaled.width * flip[0], scaled.height * flip[1])
                            }
                            else {
                                if (sprite.type == "canvas") {
                                    if (sprite.canvas.width != sprite.width || sprite.canvas.height != sprite.height) {
                                        sprite.canvas.width = sprite.width
                                        sprite.canvas.height = sprite.height
                                    }
                                    ctx.drawImage(sprite.canvas, scaled.x * flip[0], scaled.y * flip[1], scaled.width, scaled.height)
                                }
                            }
                            ctx.restore()
                        }
                    }
                }
            }
        },
        "games": {},
        "collision": {
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
        "hex": function(num) {
            if (num.toString().length == 1) {
                return "0" + num.toString(16)
            }
            return num.toString(16)
        },
        "spriteTick": function(sprite, game) {
            // TMP
            game.internal.collision.qtree.methods.processSprite(sprite, game)
        },
        "autoplaySounds": function() {
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
        }
    },
    "methods": {
        "get": {
            "image": function(id, gameInput) {
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
            "audio": function(id, gameInput) {
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
            "sprite": function(id, gameInput) {
                var game = BeginningJS.internal.current.game
                if (gameInput != null) {
                    game = gameInput
                }
                if (game == null) {
                    console.error("Oops. You seem to be running this function outside of a script. Try moving it and trying again. Alternatively, you can pass the game object in as the second parameter to this function to fix this issue.")
                    console.error("Beginning.js hit a critical error, have a look at the error above for more info.")
                    debugger
                }
                if (game.internal.IDIndex[id] == null) {
                    console.error("Ah, a problem occured while getting a sprite. There's no sprite with the ID " + JSON.stringify(id) + ".")
                }
                return game.game.sprites[game.internal.IDIndex[id]]
            }
        },
        "playSound": function(id) {
            // TODO: Test for game
            // TODO: Test for ID

            var game = BeginningJS.internal.current.game


            if (BeginningJS.internal.autoPlay) {
                game.internal.assets.snds[id].snd.play()
            }
            else {
                game.internal.soundsToPlay.push(id)
            }
        },
        "maths": {
            "radToDeg": function(rad) {
                return (rad * 180) / Math.PI
            },
            "degToRad": function(deg) {
                return deg * (Math.PI / 180)
            },
            "getDirection": function(x1, y1, x2, y2) {
                // gist.github.com/conorbuck/2606166

                return BeginningJS.methods.maths.radToDeg(Math.atan2(y2 - y1, x2 - x1))
            }
        }
    },
    "config": {
        "flags": {
            "warnOfUselessParameters": true,
            "useQTrees": true
        }
    },
    "device": {
        "is": {
            "touchscreen": document.ontouchstart === null
        }
    }
}
BeginningJS.internal.requestAnimationFrame.call(window, BeginningJS.internal.tick)
setInterval(function() {
    var i = 0
    for (i in BeginningJS.internal.games) {
        BeginningJS.internal.games[i].currentFPS = Math.min(BeginningJS.internal.games[i].internal.FPSFrames, 60)
        BeginningJS.internal.games[i].internal.FPSFrames = 0
    }
}, 1000)
