const { withGradleProperties, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Plugin personalizado para aplicar configuraciones de AndroidX automáticamente
 * Esto asegura que las configuraciones persistan después de expo prebuild
 */
const withAndroidXFix = (config) => {
    // 1. Agregar android.enableJetifier=true a gradle.properties
    config = withGradleProperties(config, (config) => {
        config.modResults.push({
            type: 'property',
            key: 'android.enableJetifier',
            value: 'true',
        });
        return config;
    });

    // 2. Agregar exclusiones de dependencias al build.gradle raíz
    config = withProjectBuildGradle(config, (config) => {
        const exclusions = `
  configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-core-ui'
    exclude group: 'com.android.support', module: 'support-fragment'
    exclude group: 'com.android.support', module: 'versionedparcelable'
  }`;

        // Buscar el bloque allprojects y agregar las exclusiones
        if (config.modResults.contents.includes('allprojects {')) {
            // Verificar si ya existen las exclusiones
            if (!config.modResults.contents.includes('exclude group: \'com.android.support\'')) {
                config.modResults.contents = config.modResults.contents.replace(
                    /allprojects\s*\{([^}]*)\}/s,
                    (match, content) => {
                        return `allprojects {${content}${exclusions}\n}`;
                    }
                );
            }
        }

        return config;
    });

    return config;
};

module.exports = withAndroidXFix;
