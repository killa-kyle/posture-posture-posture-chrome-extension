import React, { useState, useEffect, useRef } from "react";

const BAD_POSTURE = "bad";
const GOOD_POSTURE = "good";
// const PORT_NAME = `watch-posture-${Math.floor(Math.random() * 1000000)}`;

const Content = () => {
  const [currentPosture, setCurrentPosture] = useState<String | null>(null);
  // let port = useRef<any | null>(null);

  useEffect(() => {
    // try {
    //   port.current = chrome.runtime.connect({ name: PORT_NAME }) || {};

    //   port.current.onMessage.addListener(function (msg: { posture: string; }) {
    //     if (msg.posture === BAD_POSTURE) handleBadPosture();
    //     if (msg.posture === GOOD_POSTURE) handleGoodPosture();
    //     return true;
    //   });
    //   port.current.onDisconnect.addListener(function () {
    //     document.body.classList.add("good-posture");
    //     document.body.classList.remove("bad-posture");
    //     console.log("Disconnected from the extension backend");
    //   });
    // } catch (error) {
    //   console.error({ message: `port couldn't connect `, error });
    // }

    chrome.runtime.onMessage.addListener(function (msg: { posture: string; }) {
      if (msg.posture === BAD_POSTURE) handleBadPosture();
      if (msg.posture === GOOD_POSTURE) handleGoodPosture();
      return true;
    })
  }, []);

  function handleBadPosture() {
    document.body.classList.remove("good-posture");
    document.body.classList.add("bad-posture");
    setCurrentPosture(BAD_POSTURE);
  }

  function handleGoodPosture() {
    document.body.classList.add("good-posture");
    document.body.classList.remove("bad-posture");
    setCurrentPosture(GOOD_POSTURE);
  }

  return <>{currentPosture &&
    <div className="posture-status-bar">
      {currentPosture === GOOD_POSTURE ? "" : "Sit Up Straight!"}
    </div>
  }</>;
};

export default Content;

