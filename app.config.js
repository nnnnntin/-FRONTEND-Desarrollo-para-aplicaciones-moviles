import 'dotenv/config';

export default {
  expo: {
    name: "OfficeReserve",
    slug: "FRONTEND-Desarrollo-para-Aplicaciones-Moviles",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "frontenddesarrolloparaaplicacionesmoviles",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mnacimento.aplicacion",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Esta app necesita acceder a tu ubicación.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.mnacimento.aplicacion",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/logo.png"
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "La aplicación accede a tus fotos para permitirte seleccionar una imagen de perfil.",
          cameraPermission: "La aplicación accede a tu cámara para permitirte tomar una foto de perfil."
        }
      ],
      "expo-secure-store",
      "expo-localization"
    ],
    extra: {
      eas: {
        projectId: "2dc38e4c-e6f8-4038-b7d0-f4e5ffded4bc"
      }
    },
    owner: "vacosta"
  }
};