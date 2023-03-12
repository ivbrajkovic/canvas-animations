import { MutableRefObject, useEffect, useReducer, useRef } from "react";
import { Circle } from "./classes/Circle";
import { CircleBounce } from "./classes/CircleBounce";
import { Effect } from "./classes/Effect";
import { Mouse } from "./classes/Mouse";
import { TailEffect } from "./classes/TailEffect";
import { useCanvas } from "./hooks/useCanvas";
import { useCircleBounce } from "./hooks/useCircleBounce";
import { useGravityBall } from "./hooks/useGravityBall";

function App() {
  const { canvasRef, contextRef } = useCanvas();

  // useGravityBall(contextRef);
  useCircleBounce(contextRef);

  return <canvas ref={canvasRef}></canvas>;
}

export default App;
