module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@app": "./src",
            "@assets": "./assets",
          },
        },
      ],
      "react-native-reanimated/plugin", // THIS LINE MUST BE HERE AND MUST BE LAST
    ],
  };
};