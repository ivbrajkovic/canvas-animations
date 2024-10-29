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
import { useParticlesWebGL } from 'webgl/particles/use-particles-webgl';
import { useParticlesWebGLForce } from 'webgl/particles/use-particles-webgl';
import { useCube } from 'webgl/cube/use-cube';
import { useParticleNew } from 'webgl/particle-new/use-particle-new';
import { useHelloWorld } from 'webgl/tutorial/hello-world/use-hello-world';
import { useParticleSystem } from 'webgl/tutorial/particle-system/use-particle-system';

function App() {
  // useHelloWorld();
  useParticleSystem();

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
  // const { canvasRef } = useParticlesWebGLForce();
  // const { canvasRef } = useCube();
  // const { canvasRef } = useParticleNew();

  // return <canvas ref={canvasRef}></canvas>;
  return <canvas id="canvas"></canvas>;
}

export default App;
