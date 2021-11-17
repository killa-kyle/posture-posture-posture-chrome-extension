import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
// import * as tf from "@tensorflow/tfjs-core";
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';
import {
  drawKeypoints,
  drawSkeleton,
  drawGoodPostureHeight,
  drawCanvas,
} from './modules/draw_utils';
import './Options.css';

const Options = () => {
  // the baseline eye position with good posture
  let GOOD_POSTURE_POSITION = useRef<any>(null);

  let currentPosturePosition = useRef<any>(null);

  let GOOD_POSTURE_DEVIATION = useRef(25);
  const DETECTION_RATE = 100; // rate at which the pose detection is performed in ms

  // the current moveNet model object
  let detector: any | null = null;

  // set up our camera and canvas refs to use later
  const camRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  // this is the boolean that starts / stops the pose detection
  const [isWatching, setIsWatching] = useState(false);
  const IS_PANEL_OPEN = true;

  // handle the selection of the webcam
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState([]);

  let portRef = useRef<any>(null);

  /**
   * Starts the pose detection by loading the model and kicking off the detection loop
   *
   * @returns void
   * @memberof Options
   */
  const loadMoveNet = async () => {
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    };
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

    // loop the pose detection
    setInterval(() => {
      return detect(detector);
    }, DETECTION_RATE);
  };

  /**
   * Detects the pose of the user's face,
   * then dispatches a message to the content script
   * in 'handlePose' and draws the keypoints and skeleton in 'drawCanvas'
   *
   * @param {model} Array of objects
   * @returns void
   * @memberof Options
   */
  const detect = async (model: { estimatePoses: (arg0: any) => any }) => {
    if (
      typeof camRef.current !== 'undefined' &&
      camRef.current !== null &&
      camRef.current.video.readyState === 4
    ) {
      // get video properties
      const video = camRef.current.video;
      const videoWidth = camRef.current.video.videoWidth;
      const videoHeight = camRef.current.video.videoHeight;

      // set video width
      camRef.current.video.width = videoWidth;
      camRef.current.video.height = videoHeight;

      // detection happens here
      const poses = await model.estimatePoses(video);

      // check for valid pose for our use case and draw the keypoints and skeleton
      if (
        !poses ||
        !poses[0] ||
        !poses[0].keypoints ||
        poses[0].keypoints.length < 3
      )
        return;

      handlePose(poses);
      drawCanvas(
        poses,
        video,
        videoWidth,
        videoHeight,
        canvasRef,
        GOOD_POSTURE_POSITION.current
      );
    }
  };

  /**
   * Determines position of eye and checks against baseline posture
   *
   * @param {(obj[])} Array of objects
   * @returns void
   * @memberof Options
   */
  const handlePose = async (poses: { keypoints: { y: number }[] }[]) => {
    try {
      let rightEyePosition = poses[0].keypoints[2].y;
      currentPosturePosition.current = rightEyePosition;

      if (!rightEyePosition) return;
      if (GOOD_POSTURE_POSITION.current == null) {
        handlePosture({ baseline: currentPosturePosition.current });
        console.log(
          'Good Posture Height is set at ',
          currentPosturePosition.current
        );
      }

      // handle the logic for off-posture position
      if (
        Math.abs(
          currentPosturePosition.current - GOOD_POSTURE_POSITION.current
        ) > GOOD_POSTURE_DEVIATION.current
      ) {
        handlePosture({ posture: 'bad' });
      }

      if (
        Math.abs(
          currentPosturePosition.current - GOOD_POSTURE_POSITION.current
        ) < GOOD_POSTURE_DEVIATION.current
      ) {
        handlePosture({ posture: 'good' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // pass the message to the content script
  function handlePosture(msg: { baseline?: any; posture?: any }) {
    // console.log(msg);
    if (msg.baseline) GOOD_POSTURE_POSITION.current = msg.baseline;
    if (msg.posture) {
      portRef.current.postMessage(msg);
    }
  }

  // event handlers for the two buttons on the options page
  const handleToggleCamera = () => {
    setIsWatching((isCurrentlyWatching) => {
      if (!isCurrentlyWatching) {
        chrome.browserAction.setBadgeText({ text: 'ON' });
        document.title = 'TRACKING POSTURE - Posture!Posture!Posture!';
      } else {
        chrome.browserAction.setBadgeText({ text: 'OFF' });
        document.title = 'Posture!Posture!Posture! - Options';
      }

      return !isCurrentlyWatching;
    });
  };
  const handleResetPosture = () => {
    GOOD_POSTURE_POSITION.current = null;
  };

  //  webcam devices
  interface IDevice {
    deviceId: string;
    label: string;
  }
  // handle media devices loaded
  const handleDevices = useCallback(
    (mediaDevices) => {
      interface IMediaDevice {
        deviceId: string | null;
        groupId: string | null;
        kind: string | null;
        label: string | null;
      }

      const cameras = mediaDevices.filter(
        (device: { kind: string }) => device.kind === 'videoinput'
      );

      if (!cameras.length) return;
      setDevices(cameras);
      setDeviceId(cameras[0].deviceId);
    },
    [setDevices]
  );

  // smoothly switch between the cameras
  async function handleSetDeviceId(e: any) {
    await setDeviceId(e.target.value);
    await setIsWatching(false);
    await setIsWatching((isWatching) => !isWatching);
  }

  // connect and reconnect to ports when watching is toggled
  useEffect(() => {
    // connect to port for messaging to content script
    chrome.runtime.onConnect.addListener(function (port) {
      if (port.name === 'set-options') {
        // send 'isWatching' and the panel status to popup script
        port.postMessage({
          action: 'SET_IS_WATCHING',
          payload: { isWatching },
        });
        port.postMessage({
          action: 'SET_IS_PANEL_OPEN',
          payload: { isPanelOpen: IS_PANEL_OPEN },
        });

        // handle options sent from the popup script
        port.onMessage.addListener(async function (msg) {
          if (msg.action === 'SET_GOOD_POSTURE_DEVIATION') {
            if (!msg.payload.GOOD_POSTURE_DEVIATION) return;
            GOOD_POSTURE_DEVIATION.current = msg.payload.GOOD_POSTURE_DEVIATION;
          }

          if (msg.action === 'RESET_POSTURE') {
            GOOD_POSTURE_POSITION.current = null;
            // console.log('posture baseline reset');
          }
          if (msg.action === 'TOGGLE_WATCHING') {
            if (msg.payload.isWatching === null) return;
            setIsWatching(msg.payload.isWatching);
            chrome.browserAction.setBadgeText({
              text: msg.payload.isWatching ? 'ON' : 'OFF',
            });
          }
        });
        port.onDisconnect.addListener((event) => {
          // console.log("port disconnected", event)
        });
      }
    });
  }, [isWatching]);

  // kick off the model loading and pose detection
  useEffect(() => {
    loadMoveNet();

    // connect to the background script
    portRef.current = chrome.runtime.connect({ name: 'relay-detection' });
  }, []);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <>
      <div className="App">
        <div className="container">
          <div className="camera-container">
            {!isWatching && 'Start Camera'}
            {isWatching && (
              <>
                <Webcam
                  audio={false}
                  ref={camRef}
                  videoConstraints={{ deviceId: deviceId }}
                />
                <canvas ref={canvasRef} />
              </>
            )}
          </div>
          <div className="card options-container">
            <h1>Posture!Posture!Posture!</h1>
            <div className="button-container">
              <div>
                <button
                  className={`${isWatching ? 'btn-stop' : 'btn-start'}`}
                  onClick={handleToggleCamera}
                >
                  {!isWatching ? 'Start' : 'Stop'}
                </button>
                <p>Toggle the posture tracking</p>
              </div>
              {isWatching && (
                <div>
                  <button onClick={handleResetPosture}>Reset Posture</button>
                  <p>Reset the "Good Posture" position</p>
                </div>
              )}
            </div>
            <div className="select-container">
              <select
                onChange={handleSetDeviceId}
                value={deviceId}
                style={{
                  alignSelf: 'center',
                }}
              >
                {devices.map((device: IDevice, key) => (
                  <option value={device.deviceId} key={key}>
                    {device.label || `Device ${key + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Options;
