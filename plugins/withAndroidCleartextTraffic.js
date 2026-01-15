const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Plugin to enable cleartext (HTTP) traffic in Android builds
 * This allows loading images from HTTP URLs in production builds
 */
const withAndroidCleartextTraffic = (config) => {
    // Add network security config file
    config = withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;
        const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

        // Add usesCleartextTraffic and networkSecurityConfig attributes
        mainApplication.$['android:usesCleartextTraffic'] = 'true';
        mainApplication.$['android:networkSecurityConfig'] = '@xml/network_security_config';

        return config;
    });

    // Create network_security_config.xml file
    config = require('@expo/config-plugins').withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const xmlDir = path.join(
                projectRoot,
                'android',
                'app',
                'src',
                'main',
                'res',
                'xml'
            );
            const xmlFile = path.join(xmlDir, 'network_security_config.xml');

            // Create xml directory if it doesn't exist
            if (!fs.existsSync(xmlDir)) {
                fs.mkdirSync(xmlDir, { recursive: true });
            }

            // Write network security config
            const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext (HTTP) traffic for all domains -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
`;

            fs.writeFileSync(xmlFile, networkSecurityConfig);

            return config;
        },
    ]);

    return config;
};

module.exports = withAndroidCleartextTraffic;
