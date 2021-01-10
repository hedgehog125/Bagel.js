{
    info: {
        id: "HelloWorld",
        description: "An easy to use plugin that makes it easy to console.log \"Hello world!\". (wow, much useful)",
    },
    plugin: {
        types: {},
        methods: {
            bagel: {
                helloWorld: {
                    fn: {
                        normal: true,
                        fn: () => alert("Hello world!")
                    }
                }
            }
        },
        scripts: {},
        listeners: {}
    }
}
