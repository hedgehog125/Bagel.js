{
    info: {
        id: "HelloWorld",
        description: "An easy to use plugin that makes it easy to console.log \"Hello world!\". (wow, much useful)",
    },
    plugin: {
        types: {},
        assets: {},
        methods: {
            bagel: {
                helloWorld: {
                    fn: {
                        normal: true,
                        fn: () => console.log("Hello world!")
                    }
                }
            }
        },
        scripts: {},
        listeners: {}
    }
}
