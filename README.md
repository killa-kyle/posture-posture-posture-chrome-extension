<img src="src/assets/img/icon-128.png" width="64"/>

# Posture Chrome Extension

This is a Chrome Extension to help you keep track of your posture while surfing the web



https://user-images.githubusercontent.com/6319238/141663339-4b05139f-adbf-4626-9de2-0160073671bb.mp4




<img src="src/assets/img/chrome-extension-screenshot-1280x800-step-1.png" width="100%"/>
<img src="src/assets/img/chrome-extension-screenshot-1280x800-step-2.png" width="100%"/>
<img src="src/assets/img/chrome-extension-screenshot-1280x800-step-3.png" width="100%"/>

## technologies included

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/)
- [React 17](https://reactjs.org)
- [Webpack 5](https://webpack.js.org/)
- [Webpack Dev Server 4](https://webpack.js.org/configuration/dev-server/)
- [React Hot Loader](https://github.com/gaearon/react-hot-loader)
- [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)

## Installing and Running

### Procedures:

1. Check if your [Node.js](https://nodejs.org/) version is >= **14**.
2. Clone this repository.
3. Change the package's `name`, `description`, and `repository` fields in `package.json`.
4. Change the name of your extension on `src/manifest.json`.
5. Run `npm install` to install the dependencies.
6. Run `npm start`
7. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
8. Happy hacking.
