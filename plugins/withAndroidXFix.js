const { withGradleProperties, withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * Plugin personalizado para aplicar configuraciones de AndroidX automáticamente
 * Esto asegura que las configuraciones persistan después de expo prebuild
 */
const withAndroidXFix = (config) => {
    // 1. Agregar android.enableJetifier=true a gradle.properties
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

    // 2. Agregar exclusiones de dependencias al build.gradle raíz
    config = withProjectBuildGradle(config, (config) => {
        // Verificar si ya existen las exclusiones
        if (config.modResults.contents.includes('exclude group: \'com.android.support\'')) {
            return config;
        }

        const exclusions = `  
  configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-core-ui'
    exclude group: 'com.android.support', module: 'support-fragment'
    exclude group: 'com.android.support', module: 'versionedparcelable'
  }`;

        // Buscar el cierre del bloque repositories dentro de allprojects
        const lines = config.modResults.contents.split('\n');
        let newLines = [];
        let inAllProjects = false;
        let inRepositories = false;
        let braceCount = 0;
        let addedExclusions = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            newLines.push(line);

            if (line.includes('allprojects {')) {
                inAllProjects = true;
            }

            if (inAllProjects && line.includes('repositories {')) {
                inRepositories = true;
                braceCount = 1;
            } else if (inRepositories) {
                // Contar llaves para saber cuándo termina el bloque repositories
                braceCount += (line.match(/{/g) || []).length;
                braceCount -= (line.match(/}/g) || []).length;

                if (braceCount === 0 && !addedExclusions) {
                    // Terminó el bloque repositories, agregar exclusiones
                    newLines.push(exclusions);
                    addedExclusions = true;
                    inRepositories = false;
                }
            }
        }

        config.modResults.contents = newLines.join('\n');
        return config;
    });

    return config;
};

module.exports = withAndroidXFix;
