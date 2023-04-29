import { MutableRefObject, useEffect, useReducer, useRef } from "react";
import { Circle } from "./classes/Circle";
import { CircleBounce } from "./classes/CircleBounce";
import { Effect } from "./classes/Effect";
import { Mouse } from "./classes/Mouse";
import { TailEffect } from "./classes/TailEffect";
import { useTailEffect } from "./hooks/useBallTrail";
import { useCanvas } from "./hooks/useCanvas";
import { useCircleBounce } from "./hooks/useCircleBounce";
import { useGravityBall } from "./hooks/useGravityBall";
import { useSimpleCollision } from "./useSimpleCollision";
import { useCircleOutline } from "./hooks/useCircleOutline";
import { useRectangleCollision } from "./hooks/useRectangleCollision";
import { useCircularMotion } from "./hooks/useCircularMotion";

function App() {
  const { canvasRef, contextRef } = useCanvas();

  // useGravityBall(contextRef);
  // useCircleBounce(40, contextRef);
  // useTailEffect(contextRef);
  // useSimpleCollision(contextRef);
  // useCircleOutline(contextRef);
  // useRectangleCollision(contextRef);
  useCircularMotion(contextRef);

  return <canvas ref={canvasRef}></canvas>;
}

export default App;
