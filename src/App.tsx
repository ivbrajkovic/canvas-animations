import { useCanvas } from "./hooks/useCanvas";
import { useFireworks } from "./hooks/useFireworks";
import { useParticlesTunnel } from "./hooks/useParticlesTunnel";
import { useSkyStars } from "./hooks/useSkyStars";

function App() {
  const { canvasRef, contextRef } = useCanvas();

  // useGravityBall(contextRef);
  // useCircleBounce(40, contextRef);
  // useTailEffect(contextRef);
  // useSimpleCollision(contextRef);
  // useCircleOutline(contextRef);
  // useRectangleCollision(contextRef);
  // useCircularMotion(contextRef);
  // useWaveAnimation(contextRef);
  // useFireworks(contextRef);
  // useParticlesTunnel(contextRef);
  useSkyStars(contextRef);

  return <canvas ref={canvasRef}></canvas>;
}

export default App;
