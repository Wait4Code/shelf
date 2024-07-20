module.exports = function override(config) {
    // New config, e.g. config.plugins.push...

    const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
    if(shouldUseSourceMap) {
        delete config.module.rules[0].loader;

        config.module.rules[0].use = [
            {
                loader: 'source-map-loader',
                options: {
                    filterSourceMappingUrl: (_url, resourcePath) => !(/html5-qrcode/i.test(resourcePath)),
                },
            },
        ];
    }



    return config;
}
