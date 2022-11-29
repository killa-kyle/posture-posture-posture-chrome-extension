<img src="src/assets/img/icon-128.png" width="64"/>

# Posture!Posture!Posture! Chrome / Firefox Extension

This extension helps you keep track of your posture as you surf the web by first taking a baseline of you sitting with good posture, and then applying a 'blur' effect when you start to deviate from your recorded "good posture" position. As soon as you sit back up, the blur goes away and you're back to browsing!

https://user-images.githubusercontent.com/6319238/141663339-4b05139f-adbf-4626-9de2-0160073671bb.mp4

<a href="https://www.producthunt.com/posts/posture-posture-posture?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-posture&#0045;posture&#0045;posture" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=368940&theme=light" alt="Posture&#0033;Posture&#0033;Posture&#0033; - Chrome&#0032;Extension&#0032;to&#0032;help&#0032;track&#0032;your&#0032;posture&#0032;as&#0032;you&#0032;browse | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

# How It Works

<img src="src/assets/img/chrome-extension-screenshot-1280x800-step-1.png" width="600"/>
<img src="src/assets/img/chrome-extension-screenshot-1280x800-step-2.png" width="600"/>
<img src="src/assets/img/chrome-extension-screenshot-1280x800-step-3.png" width="600"/>


# Privacy 
For the extension to work as you browse it needs the "view all pages" permission. I didn't put any analytics libraries or tracking so none of your data is being monitored or ever leaves the extension. The only insight I have is the standard Chrome Webstore stats that appear in the Developer Dashboard, which just tells me how many people have installed / uninstalled the extension, and # of active users.


## Install from the Chrome Web Store

[Posture!Posture!Posture! on the Chrome Web Store](https://chrome.google.com/webstore/detail/posturepostureposture/ekleaenhplpaiincbdkbebmeccfgmbll)


## Install from the Firefox Addon Marketplace

[Posture!Posture!Posture! on the Firefox Addon Marketplace](https://addons.mozilla.org/en-US/firefox/addon/posture-posture-posture/)


## Installing and Running In Developer Mode

### Procedures:

1. Check if your [Node.js](https://nodejs.org/) version is >= **14**.
2. Clone this repository.
3. Run `npm install` to install the dependencies.
4. Run `npm start`
5. Load the extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
6. Launch the Extension.
   1. Open the `Options Popup` by clicking the button in the browser action menu
   2. Start the camera
      ## You'll need to allow camera access on first use
   3. Wait for the Model Tracking to kick in
      ## you'll need to make the Options window visible / active at least once for the tracking to work correctly
   4. surf the web with good posture!
      - you can reset the "Good Posture" position with the browser action menu

## Technologies Included

- [Tensorflow.js - MoveNet](https://www.tensorflow.org/hub/tutorials/movenet)
- [React 17](https://reactjs.org)
- [Webpack 5](https://webpack.js.org/)
- [Webpack Dev Server 4](https://webpack.js.org/configuration/dev-server/)
- [React Hot Loader](https://github.com/gaearon/react-hot-loader)
- [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)

## TODO

- [_] User adjustable posture deviation range
- [x] Indicate status of "Watching" or "Not Watching" in Browser Action Icon
