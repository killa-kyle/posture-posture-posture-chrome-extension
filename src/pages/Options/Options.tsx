import React, { useEffect, useState, useRef, useCallback } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import Webcam from "react-webcam";
import { drawGoodPostureHeight } from "./modules/draw_utils";
import "./Options.css";

const Options = () => {
  // the baseline eye position with good posture
  let GOOD_POSTURE_POSITION = useRef<any>(null);

  let currentPosturePosition = useRef<any>(null);
  const GOOD_POSTURE_DEVIATION = 20;

  // the current moveNet model object
  let detector: any | null = null;
  // this object holds the port when connected
  let contentPort: chrome.runtime.Port | null = null;

  // set up our camera and canvas refs to use later
  const camRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);


  // this is the boolean that starts / stops the pose detection
  const [isWatching, setIsWatching] = useState(false);

  // handle the selection of the webcam
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);


  /**
   * Starts the pose detection by loading the model and kicking off the detection loop
   *
   * @returns void
   * @memberof Options
   */
  const loadMoveNet = async () => {
    console.log("Loading MoveNet");
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    };
    detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

    // loop the pose detection
    setInterval(() => {
      return detect(detector);
    }, 100);
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
  const detect = async (model: { estimatePoses: (arg0: any) => any; }) => {
    if (
      typeof camRef.current !== "undefined" &&
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
      if (!poses || !poses[0] || !poses[0].keypoints || poses[0].keypoints.length < 3) return;

      handlePose(poses);
      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);
    }
  };


  /**
   * Determines position of eye and checks against baseline posture
   * 
   * @param {(obj[])} Array of objects
   * @returns void
   * @memberof Options
   */
  const handlePose = async (poses: { keypoints: { y: number; }[]; }[]) => {

    try {

      let rightEyePosition = poses[0].keypoints[2].y;
      currentPosturePosition.current = rightEyePosition
      // console.log({ rightEyePosition });
      if (!rightEyePosition) return;
      if (GOOD_POSTURE_POSITION.current == null) {
        handlePosture({ baseline: currentPosturePosition.current });
        console.log("Good Posture Height is set at ", currentPosturePosition.current);
      }

      // console.log(`
      // baseline: ${Math.floor(GOOD_POSTURE_POSITION)}\n
      // currentPos: ${Math.floor(currentPosturePosition.current)}`);

      // handle the logic for off-posture position
      if (
        Math.abs(
          currentPosturePosition.current -
          GOOD_POSTURE_POSITION.current) > GOOD_POSTURE_DEVIATION) {
        handlePosture({ posture: "bad" });
      }

      if (
        Math.abs(
          currentPosturePosition.current -
          GOOD_POSTURE_POSITION.current) < GOOD_POSTURE_DEVIATION) {
        handlePosture({ posture: "good" });
      }
    } catch (error) {
      console.error(error);
    }
  };



  /**
   * Draws the keypoints and skeleton on the canvas
   *
   * @param {(obj[])} Array of objects
   * @param {(obj)} video object
   * @param {(int)} video width
   * @param {(int)} video height
   * @param {(obj)} canvas object
   * @returns void
   * @memberof Options
   */
  const drawCanvas = (poses: { keypoints: any; }[], video: any, videoWidth: any, videoHeight: any, canvas: any) => {
    if (canvas.current == null) return;
    const ctx = canvas.current.getContext("2d");


    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    if (poses[0].keypoints != null) {
      // drawKeypoints(poses[0].keypoints, ctx);
      // drawSkeleton(poses[0].keypoints, poses[0].id, ctx);
      drawGoodPostureHeight(poses[0].keypoints, ctx, GOOD_POSTURE_POSITION.current);
    }
  };

  // pass the message to the content script
  function handlePosture(msg: { baseline?: any; posture?: any; }) {
    // console.log(msg);
    if (msg.baseline) GOOD_POSTURE_POSITION.current = msg.baseline;
    if (msg.posture) contentPort && contentPort.postMessage(msg);
  }

  // event handlers for the two buttons on the options page
  const handleToggleCamera = () => setIsWatching(isCurrentlyWatching => !isCurrentlyWatching);
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
    mediaDevices => {
      interface IMediaDevice {
        deviceId: string | null;
        groupId: string | null;
        kind: string | null;
        label: string | null;
      }

      const cameras = mediaDevices.filter((device: { kind: string; }) => device.kind === 'videoinput');

      setDevices(cameras)
      setDeviceId(cameras[0].deviceId);

    },
    [setDevices]
  );

  function handleSetDeviceId(e: any) {
    setIsWatching(isWatching => !isWatching);
    setDeviceId(e.target.value);
    setIsWatching(isWatching => !isWatching);

  }

  // connect and reconnect to ports when watching is toggled
  useEffect(() => {
    // connect to the common port
    chrome.runtime.onConnect.addListener(function (port) {
      if (port.name === "watch-posture") {
        contentPort = port;


        port.onDisconnect.addListener(event => {
          // console.log("port disconnected", event)
          contentPort = null;
        });
      }
      if (port.name === "set-options") {
        // send 'isWatching' to popup script
        port.postMessage({ action: "SET_IS_WATCHING", payload: { isWatching } });
        port.onMessage.addListener(async function (msg) {
          if (msg.action === "RESET_POSTURE") {
            GOOD_POSTURE_POSITION.current = null;
            console.log("posture baseline reset");
          }
          if (msg.action === "TOGGLE_WATCHING") {

            setIsWatching(msg.payload.isWatching);

          }
        });
        port.onDisconnect.addListener(event => {
          // console.log("port disconnected", event)
        });
      }
    });
  }, [isWatching]);

  // kick off the model loading and pose detection
  useEffect(() => {
    loadMoveNet();
  }, []);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);



  return (
    <>
      <div className="App">
        <div className="container">

          <div className="camera-container">
            {!isWatching && "Start Camera"}
            {isWatching &&
              <>
                <Webcam audio={false} ref={camRef} videoConstraints={{ deviceId: deviceId }} />
                <canvas ref={canvasRef} />
              </>
            }
          </div>
          <div className="card options-container">
            <h1>Keep this tab open in a second window to capture your posture correctly!</h1>
            <div className="button-container">
              <div>
                <button onClick={handleToggleCamera}>
                  {!isWatching ? "Start" : "Stop"}
                </button>
                <p>Toggle the posture tracking</p>
              </div>
              {isWatching &&
                <div>
                  <button onClick={handleResetPosture}>Reset Posture</button>
                  <p>Reset the "Good Posture" position</p>
                </div>
              }
            </div>
            <div className="select-container">
              <select
                onChange={handleSetDeviceId}
                value={deviceId}
                style={{
                  alignSelf: 'center'
                }}>
                {devices.map((device: IDevice, key) => (
                  <option value={device.deviceId} key={key} >
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
