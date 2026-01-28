const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Plugin personalizado para aplicar configuraciones de AndroidX automáticamente
 * Esto asegura que las configuraciones persistan después de expo prebuild
 * 
 * Solo agrega Jetifier - esto es suficiente para convertir automáticamente
 * todas las dependencias antiguas a AndroidX sin causar problemas de resolución
 */
const withAndroidXFix = (config) => {
    // Agregar android.enableJetifier=true a gradle.properties
    config = withGradleProperties(config, (config) => {
        // Verificar si ya existe la propiedad
        const hasJetifier = config.modResults.some(
            item => item.type === 'property' && item.key === 'android.enableJetifier'
        );

        if (!hasJetifier) {
            config.modResults.push({
                type: 'property',
                key: 'android.enableJetifier',
                value: 'true',
            });
        }
        return config;
    });

    return config;
};

module.exports = withAndroidXFix;
