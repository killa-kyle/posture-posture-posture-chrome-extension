// https://github.com/tensorflow/tfjs-models/blob/9b5d3b663638752b692080145cfb123fa324ff11/pose-detection/demos/live_video/src/camera.js
import * as poseDetection from "@tensorflow-models/pose-detection";


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
export const drawCanvas = (
  poses: { keypoints: any }[],
  video: any,
  videoWidth: any,
  videoHeight: any,
  canvas: any,
  goodPostureBaseLine: any
) => {
  if (canvas.current == null) return;
  const ctx = canvas.current.getContext('2d');

  canvas.current.width = videoWidth;
  canvas.current.height = videoHeight;

  if (poses[0].keypoints != null) {
    drawKeypoints(poses[0].keypoints, ctx, goodPostureBaseLine);
    drawGoodPostureHeight(poses[0].keypoints, ctx, goodPostureBaseLine);
    // drawSkeleton(poses[0].keypoints, poses[0].id, ctx);
  }
};

/**
 * Draw the keypoints on the video.
 * @param keypoints A list of keypoints.
 */
export function drawKeypoints(keypoints: any, ctx: any, currentGoodPostureHeight: any) {
  const currentPostureHeight = keypoints[2].y;
  const delta = currentPostureHeight - currentGoodPostureHeight

  const keypointInd = poseDetection.util.getKeypointIndexBySide(
    poseDetection.SupportedModels.MoveNet
  );
  ctx.fillStyle = "Red";
  ctx.strokeStyle = "White";
  ctx.lineWidth = 1;

  ctx.fillStyle = "rgba(0, 255, 0, 0.9)"; // green if delta is positive
  if (delta > 25 || delta < -25) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.9)"; // TODO: make this a configurable parameter to match the GOOD_POSTURE_DEVIATION val
  }


  for (const i of keypointInd.middle) {
    drawKeypoint(keypoints[i], ctx);
  }

  // ctx.fillStyle = "Green";
  for (const i of keypointInd.left) {
    drawKeypoint(keypoints[i], ctx);
  }

  // ctx.fillStyle = "Orange";
  for (const i of keypointInd.right) {
    drawKeypoint(keypoints[i], ctx);
  }
}

function drawKeypoint(keypoint: any, ctx: any) {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1;
  const scoreThreshold = 0.3;

  if (score >= scoreThreshold) {
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);

    ctx.fill(circle);
    // ctx.stroke(circle);
  }
}

/**
 * Draw the skeleton of a body on the video.
 * @param keypoints A list of keypoints.
 */
export function drawSkeleton(keypoints: any, poseId: any, ctx: any) {
  // Each poseId is mapped to a color in the color palette.
  const color = "White";
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;

  poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet).forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;
    const scoreThreshold = 0.3 || 0;

    if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.stroke();
    }
  });
}

/**
 * Draw the bounding box of good posture on the video.
 * @param keypoints A list of keypoints.
 * @param ctx current context of the canvas.
 * @param currentGoodPostureHeight current context of the canvas.
 */
export function drawGoodPostureHeight(keypoints: any, ctx: any, currentGoodPostureHeight: number) {
  const currentPostureHeight = keypoints[2].y;
  const delta = currentPostureHeight - currentGoodPostureHeight

  // show current good posture baseline
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, currentGoodPostureHeight);
  ctx.lineTo(600, currentGoodPostureHeight);
  ctx.stroke();

  // show current posture height
  // ctx.strokeStyle = "White";
  // ctx.lineWidth = 2;

  ctx.beginPath(); // Start a new path
  ctx.moveTo(0, currentPostureHeight); // Move the pen to (30, 50)
  ctx.lineTo(800, currentPostureHeight); // Draw a line to (150, 100)
  ctx.stroke(); // Render the path

  // draw difference between current posture height and good posture height
  ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; // green if delta is positive
  if (delta > 25 || delta < -25) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // TODO: make this a configurable parameter to match the GOOD_POSTURE_DEVIATION val
  }

  // ctx.fillRect(0, currentGoodPostureHeight, 800, delta);
}