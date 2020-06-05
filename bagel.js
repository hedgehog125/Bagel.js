/*
TODO:
Pause music on state change? Or stop? Use the new listener <================
Update "step" function to work in different places. Steps should also be in more places
ctx.save and restore. How's it used in the renderer? Is it efficient?
Continue retrying when assets don't load?
Scripts not checked?
Offline handling while loading assets. Don't forget PWAs

PERFORMANCE
Prescale images on canvases?
Disable alpha?
Automatic clone recycling
WebGL renderer
More efficient clone checking

PLUGINS
Sprites
Plugin assets
Are sprites and assets needed for them?
Scripts
Asset conventions
Allow applying existing methods to their sprites?
When is the sprite description used?
Handling of two plugins with the same ids
Values? Also sprite values? Init functions instead?
Are the errors clear when obArg is false?
Plugin id handling, prevent duplicates, what about game.internal.plugins?

General tidy up
Steps in other places. Especially listeners
Finish the TODO descriptions
Apple touch icons
README
Plugin conventions


TESTING
Reserved ids
"All" game scripts
Review closures
Sounds not loading??? Sometimes...?
Does the overwrite argument work?

CREDITS
Click, click release and mouse touch from: https://scratch.mit.edu/projects/42854414/ under CC BY-SA 2.0
*/

Bagel = {
    init: (game) => {
        let internal = Bagel.internal; // A shortcut
        let current = internal.current;
        let subFunctions = Bagel.internal.subFunctions.init;

        Bagel.internal.saveCurrent();
        current.game = game;
        game = subFunctions.check(game);

        subFunctions.misc(game);
        Bagel.internal.loadPlugin(Bagel.internal.plugin, game, {}); // Load the built in plugin

        subFunctions.listeners(game, game.internal.renderer.canvas.addEventListener);
        subFunctions.plugins(game);
        subFunctions.assets(game);
        subFunctions.methods(game);
        subFunctions.initScripts(game);
        subFunctions.initSprites(game);
        subFunctions.preload(game);
        subFunctions.loadingScreen(game);

        Bagel.internal.games[game.id] = game;
        Bagel.internal.loadCurrent();
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
                            args: {},
                            description: "Images give a sprite (only the sprite type though) its appearance. Just set its \"img\" argument to the id of the image you want to use.",
                            init: (asset, ready, game, plugin, index) => {
                                let img = new Image();
                                (img => {
                                    img.onload = () => {
                                        ready({
                                            img: img,
                                            JSON: asset
                                        });
                                    }
                                })(img);
                                img.src = asset.src;
                            },
                            get: "img"
                        },
                        snds: {
                            args: {},
                            description: "Sounds can be played by anything. They're played using game.playSound(<id>)",
                            init: (asset, ready, game, plugin, index) => {
                                let snd = new Audio();
                                snd.preload = "metadata";
                                (snd => {
                                    snd.onloadeddata = () => {
                                        ready({
                                            snd: snd,
                                            JSON: asset
                                        });
                                    };
                                })(snd);
                                hmm = snd; // TODO. Debug. The bug means above doesn't trigger
                                snd.load();
                                snd.src = asset.src;
                            },
                            get: "snd",
                            forcePreload: true // Only the metadata is loaded anyway
                        }
                    },
                    sprites: {
                        sprite: {
                            args: {
                                x: {
                                    required: false,
                                    default: "centred",
                                    types: [
                                        "number",
                                        "string",
                                        "function"
                                    ],
                                    description: "The x position for the sprite. Can also be set to \"centred\" to centre it along the x axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width - 50\""
                                },
                                y: {
                                    required: false,
                                    default: "centred",
                                    types: [
                                        "number",
                                        "string",
                                        "function"
                                    ],
                                    description: "The y position for the sprite. Can also be set to \"centred\" to centre it along the y axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.height - 50\""
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
                                visible: {
                                    required: false,
                                    default: true,
                                    types: [
                                        "boolean"
                                    ],
                                    description: "If the sprite is visible or not."
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
                                    description: "The angle of the sprite. In degrees. 0º = up. 180º = down. -90º = left. 90º = right."
                                }
                            },
                            cloneArgs: {
                                x: {
                                    syntax: {
                                        description: "The x position for the clone. Can also be set to \"centred\" to centre it along the x axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width - 50\""
                                    },
                                    mode: "replace"
                                },
                                y: {
                                    syntax: {
                                        description: "The y position for the clone. Can also be set to \"centred\" to centre it along the y axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.height - 50\""
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
                                visible: {
                                    syntax: {
                                        description: "Determines if the clone is visible or not."
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
                                }
                            },
                            listeners: {
                                fns: {
                                    xy: (sprite, value, property, game, plugin, triggerSprite) => {
                                        if (typeof value == "string") {
                                            if (value == "centred") {
                                                sprite[property] = game[property == "x"? "width" : "height"] / 2;
                                            }
                                        }
                                        if (typeof value == "function") {
                                            sprite[property] = value(sprite, game); // Avoid the setter
                                        }
                                    },
                                    dimensions: (sprite, value, property, game, plugin, triggerSprite) => {
                                        if (typeof value == "string") {
                                            if (value.includes("x")) {
                                                let scale = parseFloat(value.split("x")[0]);

                                                sprite[property] = Bagel.get.asset.img(triggerSprite.img)[property] * scale;
                                            }
                                        }
                                        if (typeof value == "function") {
                                            sprite[property] = value(sprite, game); // Avoid the setter
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
                                        get: (sprite, value, property, game, plugin) => {
                                            let img = Bagel.get.asset.img(value);
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
                                    let img = Bagel.get.asset.img(sprite.img, game, true);
                                    if (typeof img == "boolean") { // It's loading or it doesn't exist
                                        if (img) { // Loading

                                        }
                                        else { // Doesn't exist
                                            console.error("Huh, the sprite " + JSON.stringify(sprite.id) + "'s image doesn't exist, it doesn't appear to be loading either. Check game.game.assets to make sure your asset is called " + JSON.stringify(sprite.img) + ", or change the sprite image to something else. (don't forget, it's case sensitive!)");
                                            Bagel.internal.oops(game);
                                        }
                                    }

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
                                }
                            }
                        },
                        canvas: {
                            args: {
                                x: {
                                    required: false,
                                    default: "centred",
                                    types: [
                                        "number",
                                        "string",
                                        "function"
                                    ],
                                    description: "The x position for the canvas. Can also be set to \"centred\" to centre it along the x axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width - 50\""
                                },
                                y: {
                                    required: false,
                                    default: "centred",
                                    types: [
                                        "number",
                                        "string",
                                        "function"
                                    ],
                                    description: "The y position for the canvas. Can also be set to \"centred\" to centre it along the y axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.height - 50\""
                                },
                                width: {
                                    required: true,
                                    types: [
                                        "number",
                                        "function"
                                    ],
                                    description: "The width for the canvas. Can also be a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width * 0.2\""
                                },
                                height: {
                                    required: true,
                                    types: [
                                        "number",
                                        "function"
                                    ],
                                    description: "The height for the canvas. Can also be a function that returns a position when the game loads. e.g:\n\"(me, game) => game.height * 0.2\""
                                },
                                visible: {
                                    required: false,
                                    default: true,
                                    types: ["boolean"],
                                    description: "If the canvas is visible or not."
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
                                render: {
                                    required: false,
                                    types: ["function"],
                                    description: "Renders each frame for the canvas. The arguments provided are: \"sprite\", \"game\", \"ctx\" and \"canvas\"."
                                }
                            },
                            cloneArgs: {
                                x: {
                                    syntax: {
                                        description: "The x position for the clone. Can also be set to \"centred\" to centre it along the x axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width - 50\""
                                    },
                                    mode: "replace"
                                },
                                y: {
                                    syntax: {
                                        description: "The y position for the clone. Can also be set to \"centred\" to centre it along the x axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.height - 50\""
                                    },
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
                                visible: {
                                    syntax: {
                                        description: "If the clone is visible or not."
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
                                render: {
                                    syntax: {
                                        description: "Renders each frame for the clone. The arguments provided are: \"sprite\", \"game\", \"ctx\" and \"canvas\"."
                                    },
                                    mode: "replace"
                                }
                            },
                            listeners: {
                                fns: {
                                    xy: (sprite, value, property, game, plugin, triggerSprite) => {
                                        if (typeof value == "string") {
                                            if (value == "centred") {
                                                sprite[property] = game[property == "x"? "width" : "height"] / 2;
                                            }
                                        }
                                        if (typeof value == "function") {
                                            sprite[property] = value(sprite, game); // Avoid the setter
                                        }
                                    },
                                    dimensions: (sprite, value, property, game, plugin, triggerSprite) => {
                                        if (typeof value == "function") {
                                            sprite[property] = value(sprite, game); // Avoid the setter
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
                                    }
                                }
                            },
                            description: "A \"2d\" canvas sprite. Anything rendered onto the canvas gets rendered onto the main canvas.",
                            init: (sprite, game) => {
                                let canvas = document.createElement("canvas");
                                let ctx = canvas.getContext("2d");

                                let scaleX = game.internal.renderer.canvas.width / game.width;
                                let scaleY = game.internal.renderer.canvas.height / game.height;
                                canvas.width = sprite.width * window.devicePixelRatio;
                                canvas.height = sprite.height * window.devicePixelRatio;
                                if (sprite.fullRes) {
                                    canvas.width *= scaleX;
                                    canvas.height *= scaleY;
                                }
                                sprite.canvas = canvas;
                                sprite.ctx = ctx;
                            },
                            render: {
                                ctx: (sprite, ctx, canvas, game, plugin, scaleX, scaleY) => {
                                    if (sprite.fullRes) {
                                        sprite.canvas.width = sprite.width * window.devicePixelRatio * scaleX;
                                        sprite.canvas.height = sprite.height * window.devicePixelRatio * scaleY;
                                    }
                                    let current = Bagel.internal.current;
                                    Bagel.internal.saveCurrent();
                                    current.plugin = null;
                                    current.sprite = sprite;
                                    if (sprite.render) sprite.render(sprite, game, sprite.ctx, sprite.canvas);
                                    Bagel.internal.loadCurrent();

                                    ctx.globalAlpha = sprite.alpha;
                                    ctx.scale(scaleX, scaleY);
                                    ctx.drawImage(sprite.canvas, sprite.x - (sprite.width / 2), sprite.y - (sprite.height / 2), sprite.width, sprite.height);
                                    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the scaling
                                    ctx.globalAlpha = 1;
                                }
                            }
                        }
                    }
                },
                assets: {},

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

                                    let file = 0;
                                    input.addEventListener("change", () => {
                                        let reader = new FileReader();
                                        ((reader, file) => {
                                            reader.onload = event => {
                                                code(event.target.result, file);
                                                file++;
                                                if (file < input.files.length) {
                                                    reader.readAsDataURL(input.files[file]);
                                                }
                                            };
                                        })(reader, file);
                                        reader.readAsDataURL(input.files[0]);
                                    }, false);
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
                                                description: "The URL of the service worker. They can be generated using Bagel.pwa.generate.worker. Its arguments are the game, extra files (e.g index.html, js files) and an optional fileName for the worker that will be downloaded by it."
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
                                                description: "The src of the manifest. Generate one using Bagel.pwa.generate.manifest."
                                            },
                                            versions: {
                                                required: false,
                                                types: ["string"],
                                                description: "The src of the version JSON file. Generate versions using Bagel.pwa.generate.version."
                                            },
                                            version: {
                                                required: false,
                                                types: ["string"],
                                                description: "The src of the version file (the one that contains the latest version name). Generate versions using Bagel.pwa.generate.version."
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
                                            }
                                        },
                                        fn: args => {
                                            if (Bagel.internal.pwaInitialised) {
                                                console.error("Erm, you can only run this function once per page. The PWA's already initialised.");
                                            }
                                            if (args.worker) {
                                                if (navigator.serviceWorker) {
                                                    navigator.serviceWorker.register(args.worker);
                                                }
                                            }
                                            else {
                                                console.warn("The Bagel.js service worker's missing. Generate one using Bagel.pwa.generate.worker.");
                                            }


                                            if (! args.icons) {
                                                console.warn("The Bagel.js icons are missing. Generate the icons using Bagel.pwa.generate.icons.");
                                            }
                                            if (args.manifest) {
                                                // <link rel="manifest" href="/manifest.webmanifest">
                                                let link = document.createElement("link");
                                                link.rel = "manifest";
                                                link.href = args.manifest;
                                                document.head.appendChild(link);
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
                                                        fetch(args.version).then(res => res.text().then(version => {
                                                            version = version.split("\n").join("");
                                                            let installed = localStorage.getItem(args.versionStorageName);
                                                            if (installed == null) installed = 0;
                                                            if (installed != version) {
                                                                fetch(args.versions).then(res => res.json().then(versions => {
                                                                    caches.open(args.cacheStorageName).then(cache => {
                                                                        while (installed < versions.versions.length) {
                                                                            let changed = versions.versions[installed].changed;
                                                                            for (let i in changed) {
                                                                                cache.delete(changed[i]);
                                                                            }
                                                                            installed++;
                                                                        }
                                                                        localStorage.setItem(args.versionStorageName, installed);
                                                                        location.reload(); // Reload so all the new assets can be loaded
                                                                    });
                                                                }));
                                                            }
                                                        }));
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
                                                    setTimeout(() => {
                                                        if (localStorage.getItem(args.multiTabStorageName) == tick) { // It hasn't changed
                                                            let interval = setInterval(() => {
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

                                            Bagel.internal.pwaInitialised = true;
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
                                                        description: "The src of the folder containing the icons. Generate them with Bagel.pwa.generate.icons."
                                                    },
                                                    extraFiles: {
                                                        required: false,
                                                        default: [],
                                                        types: ["array"],
                                                        description: "Any extra files that aren't assets but are needed. e.g index.html, main.js, bagel.js etc."
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
                                                        description: "The src of your manifest or what will be the src."
                                                    },
                                                    fileName: {
                                                        required: false,
                                                        default: "worker.js",
                                                        types: ["string"],
                                                        description: "The file name for the worker JavaScript file."
                                                    }
                                                },
                                                fn: args => {
                                                    let toCache = args.extraFiles;
                                                    for (let assetType in game.game.assets) {
                                                        for (let i in game.game.assets[assetType]) {
                                                            toCache.push(game.game.assets[assetType][i].src);
                                                        }
                                                    }
                                                    for (let plugin in game.game.plugins) {
                                                        toCache.push(game.game.plugins[plugin].src);
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
                                                    toCache.push(args.manifest);

                                                    let template = [
                                                        "let toCache = <CACHE>;",
                                                        "self.addEventListener(\"install\",e=>{",
                                                        "self.skipWaiting();",
                                                        "e.waitUntil(",
                                                        "caches.open(<NAME>).then(cache=>cache.addAll(toCache))",
                                                        ")",
                                                        "});",
                                                        "self.addEventListener(\"fetch\",e=>{",
                                                        "e.respondWith(",
                                                        "caches.match(e.request).then(response=>response||fetch(e.request))",
                                                        ")",
                                                        "});"
                                                    ].join("");
                                                    let worker = template.replace("<CACHE>", JSON.stringify(toCache));
                                                    if (args.storageID == null) {
                                                        args.storageID = "Bagel.js " + args.game.id;
                                                    }
                                                    worker = worker.replace("<NAME>", JSON.stringify(args.storageID));
                                                    Bagel.download(worker, args.fileName, false, "application/javascript");

                                                    console.log("Your service worker has been generated. Make sure to place this in the root directory of your project, also make sure that this page is in the root directory. You should also make sure that the array provided for the second argument contains your JavaScript (including the Bagel.js file) files and your HTML file.\nA new worker will need to be generated for each version (unless there's no new files) (versions can be generated using Bagel.pwa.generate.version)");
                                                    console.log("Make sure you enable the worker by setting the \"worker\" argument to " + JSON.stringify(args.fileName) + " and by setting \"cacheStorageName\" to " + JSON.stringify(args.storageID) + " in Bagel.pwa.init. You should also generate a version using Bagel.pwa.generate.version if you haven't already.");
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
                                                        description: "The src of the 512x512 resolution icon."
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
                                                        img.onload = () => {
                                                            if (img.width != img.height) {
                                                                console.warn("Image width doesn't match image height.");
                                                            }
                                                            if (! args.pixelArt) {
                                                                if (img.width != 512 || img.height != 512) {
                                                                    console.warn("Image isn't 512x512.");
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
                                                            console.log("128, 144, 152, 192, 256 and 512 pixel resolutions have been generated. You may need to enable automatic downloads. These should be in a folder in your project directory (or subfolder). You can add them to your PWA by setting the \"icons\" argument in Bagel.pwa.init to the src of the folder containing them. e.g if you put them in assets/imgs/icons then it should be \"assets/imgs/icons/\".");
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

                                                    backgroundColour: {
                                                        required: false,
                                                        types: ["string"],
                                                        description: "The background colour for the PWA. Is an HTML colour. Defaults to the page's background colour."
                                                    },
                                                    themeColour: {
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
                                                    scope: {
                                                        required: false,
                                                        default: location.href,
                                                        types: ["string"],
                                                        description: "The different URLs that the manifest applies to. Defaults to just the page where this generator was run."
                                                    },
                                                    screenshots: {
                                                        required: false,
                                                        types: ["array"],
                                                        description: "Intended to be used by PWA stores. See https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots"
                                                    },
                                                    startURL: {
                                                        required: false,
                                                        default: location.href,
                                                        types: ["string"],
                                                        description: "The URL for the PWA to start at when it's opened."
                                                    }
                                                },
                                                fn: args => {
                                                    let map = {
                                                        icons: "icons",
                                                        name: "name",
                                                        shortName: "short_name",
                                                        backgroundColour: "background_color",
                                                        themeColour: "theme_color",
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
                                                            if (i == "backgroundColour") {
                                                                if (document.body) {
                                                                    newArgs[map[i]] = document.body.bgColor;
                                                                }
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

                                                    Bagel.download(JSON.stringify(args), "manifest.json", false, "application/json");
                                                    console.log("Manifest generated. Put it in the root directory of your project and set the \"manifest\" argument in Bagel.init.pwa to its src.");
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
                                                        description: "The srcs of files that have changed. This should include removed files but not new files. A rename should be treated as a removed file and then a new file. If this is your first version, this should be empty."
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
                                            (plugin => {
                                                promise.then(() => { // Autoplay worked
                                                    plugin.vars.audio.autoPlay = true;
                                                }).catch(() => { // Nope. Prompt the user
                                                    let current = Bagel.internal.current;
                                                    Bagel.internal.saveCurrent();
                                                    current.plugin = plugin;

                                                    plugin.vars.audio.autoPlay = false;
                                                    if (args.loop || snd.duration >= 5) { // It's probably important instead of just a sound effect. Queue it
                                                        if (! Bagel.get.sprite(".Internal.unmute", game, true)) { // Check if the button exists
                                                            // Create one instead
                                                            // TODO: how does it handle state changes?
                                                            let where = "plugin Internal's function \"game.playSound\"";
                                                            game.add.asset.img({
                                                                id: ".Internal.unmuteButtonMuted",
                                                                src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUEAYAAADdGcFOAAAABmJLR0QA/wAAAAAzJ3zzAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5AUECgYpH/xRLwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAFGSURBVEhLpVbbtcMwCCs9d4brjbJzvVGmcD9clQBRIY4+mtgRWBZ+VB5LGCNjnEMkY1DMIdnA6PfPKtbjw4wg9HyusXeMMSrDiYhotI/gzpIPOugMPaauCcowBedCXUcM0NKPcfTVDiCyKjwT+vQBnqDCZqLzhDkQZ0uNimjPtm/7tof8cfHCEesM3q/wbTvje55zMD8GwKh66B1jmEKjk3/nRLY2FFaols4PdBdkDdaBXa7bpeZYFbcFAt7RX9wroAJtqXJPwPeO3oUTGNPaXZZD1zDa+vsLbM0/8dkSPe364l91dO5ebZMS83RrQvF2vJkmmHO99dabCD0Hs2PmqlAF4mx+7xyQXnU1oexrBPKxAx/OffmPEtjmyR1kE/SOvf57603P1W+8D2TA1TNnmLEjWAm9Y3rgf54xpAbyryOFF8SAzG9tVk73YdUDkgAAAABJRU5ErkJggg=="
                                                            }, where); // Load its image
                                                            game.add.asset.img({
                                                                id: ".Internal.unmuteButton",
                                                                src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUEAYAAADdGcFOAAAABmJLR0QA/wAAAAAzJ3zzAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5AUECgoeC/S7LAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAElSURBVEhLrZbREYQgDETNFaEdac3akTaR+2D2lODOBs/3w4gbWEJAbXiEu1LcY6YUkWRAa2je533e9YTbtE3bxBak44XgHJgZWsd1XMfY27Icy7EczDA3Sl5wY1lDCjMzM230Uz/mjWGC0g7duLu7x8i2FILBvLEYp2ALikbL/M346HAvAgSebdTVLdffx2fHv2Qweyp7yZZAMdpmstlibGm9JXpLs7peGoP/ks1YltcNvg01WNeEzkmsobf4GWSfpPqUaXr1gNXwB6/RgU9SpDdDvXqAa45w3kPIBGtrPdfdx/H7L17UoQbPFatro0zQnyEYi+OzzKX/Zp4aiihj5SxcEjWkYIdHG2Y7oYwBOQFAbZSBlLqFbSEzBtIGI+SvQ6IMRb66bmr2BeoT1QAAAABJRU5ErkJggg=="
                                                            }, where); // Load its image

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
                                                                    appearAnimation: true
                                                                },
                                                                x: size,
                                                                y: game.height - size,
                                                                width: 1,
                                                                height: 1,
                                                            }, "plugin Internal, function \"game.playSound\" (via Game.add.sprite)"); // TODO: use the defaults to allow skipping of checking
                                                        }
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
                    sprite: {
                        move: {
                            fn: {
                                appliesTo: ["sprite"],
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
                                    fn: {
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
                                    }
                                },
                                mouseCircles: {
                                    fn: {
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
                                    }
                                },
                                sprite: {
                                    fn: {
                                        appliesTo: [
                                            "sprite",
                                            "canvas"
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
                    }
                },
                scripts: {
                    init: [],
                    main: [],
                    steps: {}
                },
                listeners: {
                    prepState: (state, game) => {
                        let scripts = game.internal.scripts.index.sprites.init[state];
                        if (scripts == null) return;
                        for (let i in scripts) {
                            let sprite = scripts[i].sprite;
                            if (sprite.type == "sprite") {
                                if (sprite.img) {
                                    Bagel.get.asset.img(sprite.img, game, true); // Requesting it will trigger loading
                                }
                            }
                        }
                    }
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
            plugin.args = Bagel.internal.deepClone(args);

            // Combine all the plugins into one plugin
            let merge = subFunctions.merge;
            merge.types.assets(game, plugin);
            merge.types.sprites(game, plugin);

            merge.methods(game, plugin);
            merge.listeners(game, plugin)
            game.internal.plugins[plugin.info.id] = plugin;
            Bagel.internal.loadCurrent();
        },
        loadAsset: (asset, game, type, where, i, forceLoad) => {
            let current = Bagel.internal.current;

            Bagel.internal.saveCurrent();
            current.asset = asset;
            current.assetType = type;
            current.i = i;
            current.where = where;
            current.game = game;

            let assetLoader = game.internal.combinedPlugins.types.assets[type];
            let loadNow = game.config.loading.mode != "dynamic" || forceLoad || assetLoader.forcePreload;
            let plugin = assetLoader.internal.plugin;
            current.plugin = plugin;

            let assets = game.internal.assets;

            if (assets.assets[type] == null) {
                assets.assets[type] = {};
            }

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

            let ready = ((assetJSON, game) => asset => {
                let assets = game.internal.assets;
                let combinedPlugins = game.internal.combinedPlugins;
                let plural = combinedPlugins.types.internal.pluralAssetTypes[combinedPlugins.types.assets[type].get];

                assets.assets[type][assetJSON.id] = asset;
                assets.loaded++;
                assets.loading--;
                if (assets.loading == 0) {
                    if (game.config.loading.skip) {
                        game.loaded = true;
                    }
                }
                if (assets.toLoad[plural]) {
                    if (assets.toLoad[plural][assetJSON.id]) {
                        delete assets.toLoad[plural][assetJSON.id]; // Doesn't need loading anymore
                    }
                }
            })(asset, game); // This is called by the init function once the asset has loaded
            if (loadNow) {
                assetLoader.init(asset, ready, game, assetLoader.internal.plugin, i);
                game.internal.assets.loading++;
            }
            else {
                let toLoad = game.internal.assets.toLoad;
                if (toLoad[type] == null) toLoad[type] = {};
                toLoad[type][asset.id] = {
                    ready: ready,
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
            sprite.type = sprite.type == null? game.internal.combinedPlugins.defaults.sprites.type : sprite.type; // If the sprite type isn't specified, default to default agreed by the plugins
            let handler = game.internal.combinedPlugins.types.sprites[sprite.type];

            let current = Bagel.internal.current;
            let currentPluginID = current.plugin? current.plugin.info.id : null;
            Bagel.internal.saveCurrent();
            current.sprite = sprite;
            current.game = game;
            current.plugin = handler.internal.plugin;

            // TODO: current.game is changed somewhere in here

            if (! noCheck) {
                sprite = subFunctions.check(sprite, game, parent, where, currentPluginID);
            }
            sprite.internal = {
                scripts: {
                    init: [],
                    main: [],
                    all: []
                }
            };

            sprite.cloneIDs = [];
            sprite.cloneCount = 0;
            sprite.isClone = (!! parent);
            sprite.idIndex = idIndex;
            let register = subFunctions.register;
            register.scripts("init", sprite, game, parent);
            register.scripts("main", sprite, game, parent);
            register.scripts("all", sprite, game, parent);
            register.methods(sprite, game);
            register.listeners(sprite, game, parent);

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
                    let game = me.game;
                    let remove = Bagel.internal.subFunctions.delete;

                    remove.layers(me, game);
                    remove.scripts("init", me, game);
                    remove.scripts("main", me, game);
                    remove.scripts("all", me, game);
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
                let start = new Date();
                let game = Bagel.internal.games[i];
                Bagel.internal.current.game = game;

                subFunctions.scaleCanvas(game);

                if (game.state != game.internal.lastPrepState) {
                    Bagel.internal.triggerPluginListener("prepState", game, game.state);
                    if (game.internal.assets.loading != 0) { // Something needs to load
                        if (game.loaded) {
                            game.loaded = false;
                            Bagel.internal.subFunctions.init.loadingScreen(game); // Init it
                        }
                    }
                    game.internal.lastPrepState = game.state;
                }

                if (game.loaded) {
                    if (subFunctions.loaded(game)) { // Loading screen triggered
                        Bagel.internal.subFunctions.init.loadingScreen(game); // Init it
                        subFunctions.loading(game);
                    }
                }
                else {
                    subFunctions.loading(game);
                }

                let now = new Date();
                game.internal.FPSFrames++;
                game.maxPossibleFPS = 1000 / (now - start);
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
                        console.error("Oh no! Your game JSON seems to be the wrong type. It must be the type \"object\", you used " + JSON.stringify(Bagel.internal.getTypeOf(game)) + ".");
                        Bagel.internal.oops();
                    }
                    if (game.id == null) {
                        console.error("Oh no! You forgot to specifiy an id for the game.");
                        Bagel.internal.oops();
                    }

                    game.internal = {
                        renderer: {
                            type: "canvas",
                            width: game.width,
                            height: game.height,
                            lastRender: new Date(),
                            layers: [],
                            canvas: document.createElement("canvas"),
                            ratio: game.width / game.height
                        },
                        ids: [],
                        idIndex: {},
                        FPSFrames: 0,
                        lastFPSUpdate: new Date(),
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
                            toLoad: {}
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
                            },
                            listeners: {}
                        }, // The plugins are combined as they're loaded
                        lastState: (! game.state),
                        lastPrepState: (! game.state),
                        plugins: {}
                    };

                    game = Bagel.check({
                        ob: game,
                        where: "GameJSON",
                        syntax: Bagel.internal.checks.game
                    }, Bagel.internal.checks.disableArgCheck);

                    return game;
                },
                listeners: (game, addEventListener) => {
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
                        addEventListener("mousemove", e => {
                            let canvas = game.internal.renderer.canvas;
                            let rect = canvas.getBoundingClientRect();
                            let mouse = game.input.mouse;

                            mouse.x = ((e.clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                            mouse.y = ((e.clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;
                        }, false);
                        addEventListener("mousedown", e => {
                            Bagel.device.is.touchscreen = false;
                            game.input.mouse.down = true;
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);
                        addEventListener("mouseup", e => {
                            game.input.mouse.down = false;
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);
                        addEventListener("touchstart", e => {
                            Bagel.device.is.touchscreen = true;

                            let canvas = game.internal.renderer.canvas;
                            let rect = canvas.getBoundingClientRect();
                            let mouse = game.input.mouse;

                            if (e.touches == null) {
                                mouse.x = ((e.clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                                mouse.y = ((e.clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;
                                game.input.touches = [
                                    {
                                        x: game.input.mouse.x,
                                        y: game.input.mouse.y
                                    }
                                ];
                            }
                            else {
                                mouse.x = ((e.touches[0].clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                                mouse.y = ((e.touches[0].clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;

                                game.input.touches = [];
                                for (let i in e.touches) {
                                    game.input.touches.push({
                                        x: ((e.touches[i].clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width,
                                        y: ((e.touches[i].clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height
                                    });
                                }
                            }

                            mouse.down = true;
                            if (e.cancelable) {
                                ctx.preventDefault();
                            }
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);
                        addEventListener("touchmove", e => {
                            Bagel.device.is.touchscreen = true;

                            let canvas = game.internal.renderer.canvas;
                            let rect = canvas.getBoundingClientRect();
                            let mouse = game.input.mouse;

                            if (e.touches == null) {
                                mouse.x = ((e.clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                                mouse.y = ((e.clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;
                                game.input.touches = [
                                    {
                                        x: mouse.x,
                                        y: mouse.y
                                    }
                                ];
                            }
                            else {
                                mouse.x = ((e.touches[0].clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width;
                                mouse.y = ((e.touches[0].clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height;

                                game.input.touches = [];
                                for (let i in e.touches) {
                                    game.input.touches.push({
                                        x: ((e.touches[i].clientX - rect.left) / (canvas.width / window.devicePixelRatio)) * game.width,
                                        y: ((e.touches[i].clientY  - rect.top) / (canvas.height / window.devicePixelRatio)) * game.height
                                    });
                                }
                            }

                            mouse.down = true;
                            if (e.cancelable) {
                                e.preventDefault();
                            }
                        }, false);
                        addEventListener("touchend", e => {
                            Bagel.device.is.touchscreen = true;

                            game.input.touches = [];

                            game.input.mouse.down = false;
                            if (e.cancelable) {
                                e.preventDefault();
                            }
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);
                        document.addEventListener("keydown", e => {
                            for (let i in Bagel.internal.games) {
                                let game = Bagel.internal.games[i];
                                game.input.keys.keys[e.keyCode] = true;
                            }
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);
                        document.addEventListener("keyup", e => {
                            for (let i in Bagel.internal.games) {
                                let game = Bagel.internal.games[i];
                                game.input.keys.keys[e.keyCode] = false;
                            }
                            Bagel.internal.inputAction.input(); // Run anything queued for an action
                        }, false);

                        if (document.readyState == "complete") {
                            Bagel.internal.subFunctions.init.documentReady(game);
                        }
                        else {
                            document.addEventListener("readystatechange", () => {
                                if (document.readyState == "complete") { // Wait for the document to load
                                    Bagel.internal.subFunctions.init.documentReady(game);
                                }
                            });
                        }
                    })(game);
                },
                misc: game => {
                    game.loaded = false;
                    game.paused = false;
                    game.currentFPS = 60;
                    game.maxPossibleFPS = 60;

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
                        renderer.canvas.style = "margin:0;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);"; // From https://www.w3schools.com/howto/howto_css_center-vertical.asp
                    }
                    else {
                        renderer.canvas.style = "display: block; touch-action: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);" ; // CSS from Phaser (https://phaser.io)
                    }
                    Bagel.internal.subFunctions.tick.scaleCanvas(game);

                    (game => {
                        game.add = {
                            sprite: (sprite, where="the function Game.add.sprite") => {
                                where += " -> the first argument";
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
                                            if (typeof script.code == "function") {
                                                script.code(sprite, game, Bagel.step);
                                            }
                                        }
                                    }
                                    Bagel.internal.loadCurrent();
                                }
                            },
                            asset: {}
                        };
                        game.delete = () => {
                            if (game.config.display.dom) {
                                game.internal.renderer.canvas.remove();
                            }
                            delete Bagel.internal.games[game.id];
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
                        game.internal.assets.loading++; // Not technically an asset but this stops the game loading until its done
                        ((game, src, args) => {
                            fetch(plugin.src).then(res => res.text().then(plugin => {
                                game.internal.assets.loading--;
                                game.internal.assets.loaded++;
                                plugin = (new Function("return " + plugin))(); // Not entirely sure if this is good practice or not but it allows the functions to be parsed unlike JSON.parse
                                Bagel.internal.loadPlugin(plugin, game, args);
                            }));
                        })(game, plugin.src);
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
                    if (game.internal.assets.loading == 0) {
                        game.loaded = true;
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
                        if (method.internal.isNotCategory) { // TODO: block having this in check
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

                        // TODO: method.fn instead of method! <=======================================
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
                                                where: "game " + game.id + "'s " + JSON.stringify(methodName) + " method"
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
                                                where: "game " + game.id + "'s " + JSON.stringify(methodName) + " method"
                                            }, Bagel.internal.checks.disableArgCheck);
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
                        let sprite = Bagel.internal.createSprite(game.game.sprites[i], game, false, "GameJSON.game.sprites item " + i, false, parseInt(i));
                    }
                },
                preload: game => {
                    if (game.game.scripts.preload != null) {
                        game.game.scripts.preload(game);
                    }
                },
                loadingScreen: game => {
                    if (! (game.config.loading.skip || game.loaded)) {
                        Bagel.internal.saveCurrent();
                        Bagel.internal.current.plugin = game.internal.plugins.Internal;

                        let loadingScreen = Bagel.internal.deepClone(game.config.loading.animation);
                        loadingScreen.id = ".Internal.loadingScreen." + game.id;
                        loadingScreen.width = game.width;
                        loadingScreen.height = game.height;
                        loadingScreen.config = {
                            loading: {
                                skip: true,
                                mode: "preload"
                            },
                            display: {
                                dom: false,
                                backgroundColour: "transparent"
                            }
                        };
                        if (loadingScreen.vars == null) {
                            loadingScreen.vars = {};
                        }
                        loadingScreen.vars.loading = {
                            progress: 0,
                            loaded: 0,
                            loading: game.internal.assets.loading,
                            done: false
                        };

                        loadingScreen = Bagel.init(loadingScreen);
                        game.internal.loadingScreen = loadingScreen;
                        Bagel.internal.loadCurrent();
                    }
                },
                documentReady: game => {
                    if (game.config.display.dom) {
                        if (game.config.display.htmlElementID) {
                            document.getElementById(game.config.display.htmlElementID).appendChild(game.internal.renderer.canvas);
                        }
                        else {
                            if (document.body != null) {
                                document.body.appendChild(game.internal.renderer.canvas);
                            }
                            else {
                                document.appendChild(game.internal.renderer.canvas);
                            }
                        }
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
                        syntax: Bagel.internal.checks.plugin,
                        where: "plugin " + plugin.info.id
                    }, Bagel.internal.checks.disableArgCheck);

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

                                    ((newType, typeJSON, boundGame, plugin) => {
                                        Bagel.get.asset[typeJSON.get] = (id, game, check) => {
                                            let current = Bagel.internal.current;
                                            let plural = boundGame.internal.combinedPlugins.types.internal.pluralAssetTypes[typeJSON.get];

                                            Bagel.internal.saveCurrent();

                                            current.assetType = newType;
                                            current.assetTypeName = typeJSON.get;
                                            current.game = game == null? current.game : game;
                                            current.plugin = plugin;

                                            let assets = current.game.internal.assets;
                                            let loadedAssets = assets.assets[current.assetType];
                                            if (loadedAssets[id] == null) { // Invalid id
                                                let exists = assets.toLoad[plural];
                                                if (exists) exists = exists[id];
                                                if (exists) {
                                                    let info = exists;
                                                    current.i = info.i;
                                                    current.where = info.where;

                                                    info.assetLoader.init(info.asset, info.ready, info.game, info.assetLoader.internal.plugin, info.i);
                                                    info.game.internal.assets.loading++;
                                                    return true; // It's loading
                                                }
                                                else {
                                                    if (check) {
                                                        Bagel.internal.loadCurrent();
                                                        return false;
                                                    }
                                                    console.log(assets.toLoad[plural])
                                                    console.error("Oops. That asset doesn't exist. You tried to get the asset with the id " + JSON.stringify(id) + ".");
                                                    Bagel.internal.oops(current.game);
                                                }
                                            }
                                            let asset = loadedAssets[id][current.assetTypeName];
                                            Bagel.internal.loadCurrent();
                                            return asset;
                                        };
                                        boundGame.add.asset[typeJSON.get] = (asset, where) => {
                                            if (! where) where = "the function Game.add.asset." + typeJSON.get;
                                            let plural = game.internal.combinedPlugins.types.internal.pluralAssetTypes[typeJSON.get];
                                            Bagel.internal.loadAsset(asset, boundGame, plural, where, true);
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
                                        console.warn("Oops. We've got a conflict. Plugin " + JSON.stringify(plugin.info.id) + " tried to overwrite the " + JSON.stringify(newType) + " sprite type without having the correct tag. The overwrite has been blocked.\nIf you want to overwrite the older type definition, add this to the new type JSON: \"overwrite: true\".");
                                    }
                                }
                                else {
                                    merge = true;
                                }
                                if (merge) {
                                    let syntax = {...Bagel.internal.checks.sprite.clones.syntax}; // Add in the default checks
                                    for (i in typeJSON.cloneArgs) { // TODO: What about missing arguments that are in the parent?
                                        syntax[i] = typeJSON.cloneArgs[i].syntax;
                                    }
                                    typeJSON.args = {
                                        ...typeJSON.args,
                                        ...Bagel.internal.checks.sprite.sprite
                                    };
                                    typeJSON.cloneArgs = {
                                        ...typeJSON.cloneArgs,
                                        ...Bagel.internal.checks.sprite.clones.args
                                    };
                                    typeJSON.internal = {
                                        plugin: plugin,
                                        cloneSyntax: syntax
                                    };
                                    combined.types.sprites[newType] = typeJSON;
                                }
                            }
                        }
                    },
                    method: (game, plugin, type, spriteType, position, method, methodName, bagelPosition) => {
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
                                    ((position, methodName, plugin, method) => {
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
                                                    where: "Bagel.js method " + JSON.stringify(methodName)
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
                                                    where: "Bagel.js method " + JSON.stringify(methodName)
                                                }, Bagel.internal.checks.disableArgCheck);
                                                // Passed the argument checks

                                                let current = Bagel.internal.current;
                                                Bagel.internal.saveCurrent();
                                                current.plugin = method.internal.plugin;
                                                let output = method.fn.fn(newArgs, current.plugin);

                                                Bagel.internal.loadCurrent();
                                                return output;
                                            };
                                        }
                                    })(position, methodName, plugin, method);
                                }
                            }
                            else {
                                position[methodName] = method;
                            }
                        }
                    },
                    subMethods: (game, plugin, type, method, methodName, position, combinedPosition, bagelPosition) => {
                        let subFunctions = Bagel.internal.subFunctions.loadPlugin.merge;
                        if (method.category) {
                            if (type == "bagel") {
                                if (! bagelPosition[methodName]) bagelPosition[methodName] = {};
                                bagelPosition = bagelPosition[methodName];
                            }
                            if (type != "sprite") {
                                if (! position[methodName]) position[methodName] = {};
                                position = position[methodName];
                            }
                            combinedPosition.push(methodName);
                            for (let i in method.category) {
                                subFunctions.subMethods(game, plugin, type, method.category[i], i, position, combinedPosition, bagelPosition);
                            }
                        }
                        else {
                            if (type == "sprite") {
                                for (let i in method.fn.appliesTo) {
                                    let oldPosition = position;
                                    let spriteType = method.fn.appliesTo[i];
                                    if (position[spriteType] == null) position[spriteType] = {};
                                    position = position[spriteType];

                                    for (let c in combinedPosition) {
                                        let category = combinedPosition[c];
                                        if (position[category] == null) position[category] = {};
                                        position = position[category];
                                    }
                                    subFunctions.method(game, plugin, type, spriteType, position, method, methodName, bagelPosition);
                                    position = oldPosition;
                                }
                            }
                            else {
                                subFunctions.method(game, plugin, type, null, position, method, methodName, bagelPosition);
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

                                let position;
                                if (type == "sprite") {
                                    position = combined.methods.sprite;
                                }
                                else {
                                    position = combined.methods[type];
                                }
                                Bagel.internal.subFunctions.loadPlugin.merge.subMethods(game, plugin, type, method, methodName, position, [], Bagel);
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
                        // TODO: is this any faster?
                        sprite.type = parent.type; // Their types must be the same
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

                    sprite = Bagel.check({
                        ob: sprite,
                        where: where,
                        syntax: parent? handler.internal.cloneSyntax : handler.args
                    }, Bagel.internal.checks.disableArgCheck);

                    let prefix = sprite.id.split(".")[1];
                    if (sprite.id[0] == ".") { // Reserved
                        if (currentPluginID == null) {
                            console.error("This is awkward... IDs starting with a dot are only for plugins. You tried to use the id "
                                + JSON.stringify(sprite.id)
                                + ". In "
                                + where
                                + ".\nf it's important that it has this name, you could write a plugin instead, just make sure its id is set to "
                                + JSON.stringify(prefix)
                                + " ;)");
                            Bagel.internal.oops(game);
                        }
                        else {
                            if (prefix != currentPluginID) { // Plugins are allowed to use ids starting with a dot and then their id
                                console.error("Erm... the only reserved prefix you can use in this plugin is " + JSON.stringify("." + pluginID) + " and you tried to use the id " + JSON.stringify(sprite.id) + ". In "
                                + where
                                + ".\nYou can fix this by changing the prefix, removing it or changing the plugin id in \"Plugin.info.id\".");
                                Bagel.internal.oops(game);
                            }
                        }
                    }


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
                                sprite.internal.scripts[type].push({
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
                                sprite.internal.scripts[type].push({
                                    id: index[state].length - 1,
                                    state: state
                                });
                            }
                        }
                    },
                    subMethods: (method, methodName, sprite, position, game) => {
                        let isCategory = true;
                        if (method.internal) {
                            if (method.internal.isNotCategory) { // TODO: block having this in check
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
                                                where: "the sprite " + sprite.id + "'s " + JSON.stringify(methodName) + " method"
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
                                                where: "the sprite " + sprite.id + "'s " + JSON.stringify(methodName) + " method"
                                            }, Bagel.internal.checks.disableArgCheck);
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

                                            let error = handlers.get(sprite.internal.properties, sprite.internal.properties[property], property, game, plugin, sprite);

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
                    for (let i in scripts) {
                        let scriptInfo = scripts[i];
                        if (scriptInfo == null) continue;

                        if (sprites) {
                            let sprite = scriptInfo.sprite;
                            Bagel.internal.current.sprite = sprite;
                            if (type == "init") sprite.visible = true; // The sprite's active

                            let code;
                            if (type == "all" || sprite.isClone) {
                                code = sprite.scripts[type][scriptInfo.script];
                            }
                            else {
                                code = sprite.scripts[type][scriptInfo.script].code;
                            }
                            if (typeof code == "function") {
                                code(sprite, game, Bagel.step);
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
                            code(game, Bagel.step);
                        }
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
                    ctx: game => {
                        let renderer = game.internal.renderer;
                        let canvas = renderer.canvas;
                        let ctx = renderer.ctx;

                        let scaleX = canvas.width / game.width;
                        let scaleY = canvas.height / game.height;

                        let layers = renderer.layers;
                        let handlers = game.internal.combinedPlugins.types.sprites;

                        // Clear the canvas
                        let clearStyle = game.config.display.backgroundColour;
                        if (clearStyle == "transparent") {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }
                        else {
                            ctx.fillStyle = clearStyle;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }

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
                        subFunctions.render[game.config.display.renderer](game);
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

                        loading.progress = (assets.loaded / (assets.loading + assets.loaded)) * 100;
                        loading.loaded = assets.loaded;
                        loading.loading = assets.loading;


                        let clearStyle = game.config.display.backgroundColour;
                        if (clearStyle == "transparent") {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }
                        else {
                            ctx.fillStyle = clearStyle;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }
                        ctx.drawImage(loadingScreen.internal.renderer.canvas, 0, 0, canvas.width, canvas.height);
                        if (loadingScreen.vars.loading.done) {
                            game.loaded = true;
                            loadingScreen.delete();
                        }
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
                    let scripts = me.internal.scripts[type];
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
                                if (type == "all") {
                                    script.sprite.internal.scripts[script.script].id -= removed; // The id will have changed for anything after a deleted script
                                }
                                else {
                                    script.sprite.internal.scripts[type][script.script].id -= removed; // The id will have changed for anything after a deleted script
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
                        me.parent.cloneIDs[me.parent.cloneIDs.indexOf(me.id)] = null;
                    }
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
                            return "Oh no! You used an id for your game that is already being used. Try and think of something else.\nYou used " + JSON.stringify(value) + " in \"GameJSON.id\".";
                        }
                        let current = Bagel.internal.current;
                        let prefix = value.split(".")[1];
                        let currentStack = Bagel.internal.currentStack;
                        let lastPluginID = currentStack.length == 0? null : currentStack[currentStack.length - 1].plugin;
                        if (lastPluginID) lastPluginID = lastPluginID.info.id;

                        if (value[0] == ".") { // Reserved
                            if (lastPluginID == null) {
                                console.error("This is awkward... IDs starting with a dot are only for plugins. You tried to use the id "
                                + JSON.stringify(value)
                                + ". In GameJSON.id.\nIf it's important that it has this name, you could write a plugin instead, just make sure its id is set to "
                                + JSON.stringify(prefix)
                                + " ;)");
                                Bagel.internal.oops();
                            }
                            else {
                                if (prefix != lastPluginID) { // Plugins are allowed to use ids starting with a dot and then their id
                                    console.error("Erm... the only reserved prefix you can use in this plugin is " + JSON.stringify("." + lastPluginID) + " and you tried to use the id " + JSON.stringify(value)
                                    + "In GameJSON.id.\nYou can fix this by changing the prefix, removing it or changing the plugin id in \"Plugin.info.id\".");
                                    Bagel.internal.oops();
                                }
                            }
                        }
                    },
                    types: ["string"],
                    description: "An id for the game canvas so it can be referenced later in the program."
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
                                    arrayLike: true,
                                    check: value => {
                                        if (typeof value != "function") {
                                            return "Huh. This should be a function but you used " + Bagel.internal.an(Bagel.internal.getTypeOf(value)) + ".";
                                        }
                                    },
                                    checkEach: true,
                                    types: ["array"],
                                    description: "\"All\" scripts. They run every frame regardless of game state."
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
                            check: ob => {
                                if (! ["fill", "static"].includes(ob.mode)) {
                                    return "Oops! You used an invalid option in GameJSON.config.display.mode. You used " + ob.mode + ", it can only be either \"fill\" or \"static\".";
                                }
                                if (! ["auto", "canvas", "webgl"].includes(ob.renderer)) {
                                    return "Oops. You used an invalid option in GameJSON.config.display.renderer. You used " + ob.renderer + ", it can only be either \"auto\", \"canvas\" or \"webgl\".";
                                }

                                if (document.getElementById(ob.htmlElementID) == null && ob.htmlElementID != null) { // Make sure the element exists
                                    return "Oops, you specified the element to add the game canvas to but it doesn't seem to exist.\nThis is specified in \"GameJSON.config.display.htmlElementID\" and is set to " + JSON.stringify(ob.htmlElementID) + ". You might want to check that the HTML that creates the element is before your JavaScript.";
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
                                },
                                dom: {
                                    required: false,
                                    default: true,
                                    types: ["boolean"],
                                    description: "If the canvas should be part of the DOM or not."
                                },
                                htmlElementID: {
                                    required: false,
                                    types: ["string"],
                                    description: "An element to append the canvas to. If unspecified, it will be added to the document or body."
                                },
                                backgroundColour: {
                                    required: false,
                                    default: "white",
                                    types: ["string"],
                                    description: "The HTML colour for the canvas background. Can also be \"transparent\"."
                                }
                            },
                            description: "Contains a few options for how the game is displayed."
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
                                            return "Oh no! This only accepts \"preload\" and \"function\" but you used " + JSON.stringify(value) + ".";
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
                                                    fullRes: true,
                                                    scripts: {
                                                        init: [
                                                            {
                                                                code: me => {
                                                                    me.vars.img = Bagel.get.asset.img("Bagel");
                                                                },
                                                                stateToRun: "loading"
                                                            }
                                                        ]
                                                    },
                                                    render: (me, game, ctx, canvas) => {
                                                        let img = me.vars.img;
                                                        let midPoint = canvas.width / 2;
                                                        ctx.fillStyle = "white";
                                                        ctx.imageSmoothingEnabled = false;

                                                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                                                        if (game.vars.stage == 0) {
                                                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                                            let maxAngle = ((game.vars.loading.progress / 100) * 360) - 90;
                                                            if (maxAngle > game.vars.angle) {
                                                                game.vars.velocity += 5;
                                                                game.vars.angle += game.vars.velocity;
                                                                game.vars.velocity *= 0.9;
                                                                if (maxAngle < game.vars.angle) {
                                                                    game.vars.velocity = 0;
                                                                    game.vars.angle = maxAngle;
                                                                }
                                                            }
                                                            if (game.vars.loading.loading == 0 && game.vars.velocity == 0) {
                                                                game.vars.stage++;
                                                                return;
                                                            }
                                                            ctx.moveTo(midPoint, midPoint);
                                                            ctx.arc(midPoint, midPoint, midPoint * 2, Bagel.maths.degToRad(-90), Bagel.maths.degToRad(game.vars.angle), true);
                                                            ctx.lineTo(midPoint, midPoint);
                                                            ctx.fill();

                                                            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the scaling
                                                        }
                                                        else {
                                                            if (game.vars.delay == 0) {
                                                                game.vars.velocity += 1;
                                                                me.width -= game.vars.velocity;
                                                                me.height -= game.vars.velocity;
                                                                game.vars.velocity *= 0.9;
                                                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                                                                if (me.width <= 0) {
                                                                    me.width = 1;
                                                                    me.height = 1;
                                                                    ctx.clearRect(0, 0, 1, 1);
                                                                    game.vars.delay++;
                                                                }
                                                            }
                                                            else {
                                                                game.vars.delay++;
                                                                if (game.vars.delay > 10) {
                                                                    game.vars.loading.done = true;
                                                                }
                                                            }
                                                        }
                                                    },
                                                    width: (me, game) => Math.max(game.width, game.height) / 5,
                                                    height: (me, game) => Math.max(game.width, game.height) / 5
                                                },
                                                {
                                                    id: "Text",
                                                    type: "canvas",
                                                    fullRes: true,
                                                    scripts: {
                                                        init: [
                                                            {
                                                                code: me => {
                                                                    me.y += Bagel.get.sprite("Bagel").height / 2;
                                                                    me.y += me.height / 2;
                                                                },
                                                                stateToRun: "loading"
                                                            }
                                                        ]
                                                    },
                                                    render: (me, game, ctx, canvas) => {
                                                        ctx.font = (canvas.height / 2) + "px Helvetica";
                                                        ctx.textBaseline = "middle";

                                                        let text = "Loading";
                                                        ctx.fillText(text, (canvas.width / 2) - (ctx.measureText(text).width / 2), canvas.height / 2);
                                                    },
                                                    width: (me, game) => game.width,
                                                    height: (me, game) => game.height / 10,
                                                }
                                            ]
                                        },
                                        state: "loading",
                                        vars: {
                                            angle: -90,
                                            velocity: 0,
                                            stage: 0,
                                            delay: 0
                                        }
                                    },
                                    types: ["object"],
                                    description: "The loading screen animation. Defaults to a Bagel themed one.\nIt's a game object and works exactly the same as a game except its loading screen is disabled, Game.vars.loading is automatically created and the id, width, height and config given for the game is ignored. Game.vars.loading contains the following:\n  progress -> The percentage of the assets loaded\n  loaded -> The number of assets loaded\n  loading -> The number currently loading\n  done -> Starts as false, set this to true when you're done (loaded should be 0 when you do this)"
                                }
                            },
                            types: ["object"],
                            description: "A few options for how Bagel.js should handle loading assets."
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
                        types: ["string"],
                        description: "The id for the sprite to be targeted by."
                    },
                    type: {
                        required: true,
                        types: ["string"],
                        description: "The type of sprite."
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
                                types: ["array"],
                                description: "Contains init scripts. They run when the game state first changes to the script's state."
                            },
                            main: {
                                required: false,
                                default: [],
                                types: ["array"],
                                description: "Contains main scripts. They run for every frame where the script's state and the game's state match."
                            },
                            all: {
                                required: false,
                                default: [],
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
                    }
                },
                clones: {
                    syntax: {
                        id: {
                            required: false,
                            types: ["string"],
                            description: "The id for the clone to be targeted by. Defaults to the parent's id followed by a hashtag and then the lowest number starting from 0 that hasn't already been used."
                        },
                        type: {
                            required: true,
                            types: ["string"],
                            description: "The type of clone."
                        },
                        clones: {
                            required: false,
                            default: {},
                            types: ["object"],
                            description: "The default data for a clone of this clone.\nAll arguments are optional as the clone will adopt the arguments from the clone function and the parent sprite (in that priority)"
                        },
                        scripts: {
                            required: false,
                            default: {},
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
                            types: ["object"],
                            description: "The clones's scripts."
                        },
                        vars: {
                            required: false,
                            default: {},
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
                                        args: {
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
                                                "        description: \"The X position for the sprite. Can also be set to \"centred\" to centre it along the X axis, or set to a function that returns a position when the game loads. e.g:\n\"(me, game) => game.width - 50\"",
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
                                            types: ["string"],
                                            description: "The name of the function. Usually the singular version of the asset type."
                                        },
                                        forcePreload: {
                                            required: false,
                                            default: false,
                                            types: ["boolean"],
                                            description: "If this asset must be preloaded even when the loading mode is set to \"dynamic\". Be careful about how you use this because it can increase loading times."
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
                                                                // TODO: Not working <==============
                                                                // It can't adopt the property from the parent because it doesn't exist yet.
                                                                // TODO: error when parent doesn't have the property <=======
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
                                                            description: "A function that's run after the property is changed. Can also be the name of a function defined in SpriteJSON.listeners.fns. The arguments given are these: sprite, value, property, game, plugin and triggerSprite."
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
                                                            description: "A function that's run before the value is sent back to the code that requested it. Can also be the name of a function defined in SpriteJSON.listeners.fns. The arguments given are these: sprite, value, property, game, plugin and triggerSprite."
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
                                                        /* TODO
                                                        render: {
                                                            required: false,
                                                            default: null,
                                                            types: ["function"],
                                                            description: "Does any extra processing before the sprite is renndered." // TODO: arguments
                                                        }
                                                        */
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
                            description: "Creates new types. (assets and sprites)"
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
            disableArgCheck: {args: true}
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
            if (Array.isArray(entity)) {
                return "array";
            }
            if (entity == null) {
                return "undefined";
            }
            return typeof entity;
        },
        deepClone: entity => {
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
            let current = internal.current;
            //internal.currentStack.push({...internal.current}); // Add current values to the stack
            internal.currentStack.push({
                asset: current.asset,
                assetType: current.assetType,
                assetTypeName: current.assetTypeName,
                game: current.game,
                i: current.i,
                plugin: current.plugin,
                sprite: current.sprite,
                where: current.where
            });
        },
        loadCurrent: () => {
            let internal = Bagel.internal;
            internal.current = internal.currentStack.pop(); // Load the last state
        },
        currentStack: [],

        inputAction: {
            queued: [],
            queue: (code, data) => {
                Bagel.internal.inputAction.queued.push([code, data]);
            },
            input: () => {
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

    // == Methods ==
    check: (args, disableChecks, where, logObject) => {
        //console.trace(args, args.where)
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
            }, Bagel.internal.checks.disableArgCheck, null, true);
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
            if (output.send()) {
                console.log("Object:");
                console.log(args.ob);
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
                                prevName: i
                            }, Bagel.internal.checks.disableArgCheck);
                        }
                    }
                    else {
                        Bagel.check({
                            ob: args.ob[argID],
                            where: args.where + "." + argID,
                            syntax: args.syntax[argID].subcheck,
                            prev: args,
                            prevName: argID
                        }, Bagel.internal.checks.disableArgCheck);
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
                console.error("Ah, a problem occured while getting a sprite. There's no sprite with the id " + JSON.stringify(id) + ".");
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
        }
    },
    device: {
        is: {
            touchscreen: document.ontouchstart === null
        }
    }
};
Bagel.internal.requestAnimationFrame.call(window, Bagel.internal.tick);
