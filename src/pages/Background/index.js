// import chromeService from '../../../utils/chrome';

let AppInitState = 0; // it means app is off on startup

/**
 * Main extension functionality
 *
 * @class Main
 */
class Main {
  constructor() {
    this.init();
  }

  init = () => {

    console.log('init background');
    // chrome.windows.create({ url: "options.html", type: "popup", height: 330, width:970 });
    // chrome.windows.create({ url: "option.html", height: 320, width:1200 });

  }


  /**
   * toggle app
   *
   * @method
   * @memberof Main
   */
  toggleApp = () => {
    AppInitState = AppInitState ? 0 : 1;
    return AppInitState;
  };

  /**
   * stop app
   *
   * @method
   * @memberof Main
   */
  stopApp = () => {
    AppInitState = 0;
  };
}

new Main();
