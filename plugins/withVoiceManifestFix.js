const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withVoiceManifestFix(config) {
    return withAndroidManifest(config, (config) => {
        const androidManifest = config.modResults;
        const application = androidManifest.manifest.application[0];

        // Add tools namespace if it doesn't exist
        if (!androidManifest.manifest.$['xmlns:tools']) {
            androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        // Add appComponentFactory and tools:replace
        application.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';

        const toolsReplace = application.$['tools:replace'] || '';
        if (!toolsReplace.includes('android:appComponentFactory')) {
            application.$['tools:replace'] = toolsReplace
                ? `${toolsReplace},android:appComponentFactory`
                : 'android:appComponentFactory';
        }

        return config;
    });
};
