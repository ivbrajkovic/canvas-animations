import { useGravityBall } from 'hooks/useGravityBall';
import { useCanvas } from './hooks/useCanvas';
import { useFireworks } from './hooks/useFireworks';
import { useParticlesTunnel } from './hooks/useParticlesTunnel';
import { useSkyStars } from './hooks/useSkyStars';
import { useCircleBounce } from 'hooks/useCircleBounce';
import { useTailEffect } from 'hooks/useBallTrail';
import { useSimpleCollision } from 'useSimpleCollision';
import { useCircleOutline } from 'hooks/useCircleOutline';
import { useRectangleCollision } from 'hooks/useRectangleCollision';
import { useCircularMotion } from 'hooks/useCircularMotion';
import { useWaveAnimation } from 'hooks/useWaveAnimation';
import { useParticles } from 'hooks/use-particles';
import { useParticlesWebGL } from 'hooks/use-particles-webgl';
import { useParticlesWebGLForce } from 'hooks/use-particles-webgl';

function App() {
  // const { canvasRef, contextRef } = useCanvas();

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
  // useSkyStars(contextRef);
  // const { canvasRef } = useParticles();
  // const { canvasRef } = useParticlesWebGL();
  const { canvasRef } = useParticlesWebGLForce();

  return <canvas ref={canvasRef}></canvas>;
}

export default App;
