import { useEffect, useRef } from 'react'

function Snowfall({density = 150}) {

    const canvasRef = useRef(null)
    const animationRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        let width = window.innerWidth;
        let height = window.innerHeight

        const setupCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            
            canvas.width = width * dpr;
            canvas.height = height * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        setupCanvasSize();

        const flakes = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,          
        speedY: Math.random() * 1 + 0.5,   
        speedX: Math.random() * 0.6 - 0.3,
        opacity: Math.random() * 0.5 + 0.5
        
        }))

        const handleResize = () => {
            setupCanvasSize();
        }
        
        window.addEventListener('resize', handleResize)

const draw = () => {
  ctx.clearRect(0, 0, width, height);

  for (const flake of flakes) {
    ctx.beginPath();
      ctx.globalAlpha = flake.opacity;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = 10;  
    ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    flake.y += flake.speedY;
    flake.x += flake.speedX;

    
    if (flake.y > height) {
      flake.y = -flake.r;
      flake.x = Math.random() * width;
    }

    
    if (flake.x > width) flake.x = 0;
    if (flake.x < 0) flake.x = width;
  }

  ctx.globalAlpha = 1;
  animationRef.current = requestAnimationFrame(draw);
};

        draw();
        

        return () => {
            window.removeEventListener('resize', handleResize);

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);

            }
        }
    }, [density])


    return (
        <canvas ref={canvasRef} style={{position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1}}/>
    )
}

export default Snowfall