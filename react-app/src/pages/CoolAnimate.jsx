// @ts-check
// @ts-ignore
import React, { useState, useEffect, useRef, useMemo } from 'react';
// @ts-ignore
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
// @ts-ignore
import { ArrowRight, Zap, Globe, Layers, MousePointer2, Github, Twitter, Linkedin, Wind } from 'lucide-react';

/**
 * 雾气背景组件 (Fog/Smoke System)
 * 模拟真实的物理雾气升腾与鼠标交互
 */
const FogBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    // @ts-ignore
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // 预渲染雾气纹理以提高性能
    const puffSize = 64;
    const puffCanvas = document.createElement('canvas');
    puffCanvas.width = puffSize;
    puffCanvas.height = puffSize;
    const puffCtx = puffCanvas.getContext('2d');
    
    // 创建柔和的烟雾纹理
    // @ts-ignore
    const gradient = puffCtx.createRadialGradient(puffSize/2, puffSize/2, 0, puffSize/2, puffSize/2, puffSize/2);
    gradient.addColorStop(0, 'rgba(200, 230, 255, 0.15)'); // 中心稍亮
    gradient.addColorStop(0.4, 'rgba(150, 200, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    // @ts-ignore
    puffCtx.fillStyle = gradient;
    // @ts-ignore
    puffCtx.fillRect(0, 0, puffSize, puffSize);

    const resize = () => {
      // @ts-ignore
      canvas.width = window.innerWidth;
      // @ts-ignore
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, type = 'ambient') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        // 基础属性
        this.size = Math.random() * 100 + 50; // 初始大小
        this.growth = Math.random() * 0.5 + 0.1; // 扩散速度
        this.life = 0;
        this.maxLife = Math.random() * 200 + 150;
        
        // 物理属性
        if (type === 'mouse') {
          // 鼠标产生的雾气，初始速度较快，向四周扩散
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed - 1; // 略微向上
          this.maxLife = 100;
          this.size = 20; // 初始较小
          this.alphaMult = 1.5; // 更亮一点
        } else {
          // 环境雾气，缓慢上升
          this.vx = (Math.random() - 0.5) * 0.5;
          this.vy = -(Math.random() * 0.5 + 0.2); // 始终向上
          this.alphaMult = 0.8;
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size += this.growth;
        this.life++;
        
        // 模拟空气阻力
        this.vx *= 0.99;
        
        // 额外的上升浮力
        this.vy -= 0.005; 
      }

      draw(ctx) {
        // 计算透明度曲线：淡入 -> 保持 -> 淡出
        let alpha = 0;
        if (this.life < 30) {
          alpha = (this.life / 30) * this.alphaMult;
        } else if (this.life > this.maxLife - 60) {
          alpha = ((this.maxLife - this.life) / 60) * this.alphaMult;
        } else {
          alpha = this.alphaMult;
        }
        
        // 限制最大透明度
        alpha = Math.min(alpha, 0.3);

        if (alpha > 0) {
          ctx.globalAlpha = alpha;
          ctx.drawImage(
            puffCanvas, 
            this.x - this.size / 2, 
            this.y - this.size / 2, 
            this.size, 
            this.size
          );
        }
      }
    }

    const init = () => {
      particles = [];
      // 预先生成一些雾气
      for(let i=0; i<50; i++) {
        particles.push(new Particle(
          // @ts-ignore
          Math.random() * canvas.width, 
          // @ts-ignore
          Math.random() * canvas.height
        ));
      }
    };

    const loop = () => {
      // @ts-ignore
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen'; // 混合模式，让雾气叠加变亮

      // 1. 自动从底部生成雾气
      if (Math.random() < 0.2) { // 生成频率
        particles.push(new Particle(
          // @ts-ignore
          Math.random() * canvas.width,
          // @ts-ignore
          canvas.height + 50 // 从屏幕底部下方生成
        ));
      }

      // 2. 鼠标移动产生雾气
      if (mouseRef.current.active) {
         // 增加生成密度
         for(let i=0; i<2; i++) {
            particles.push(new Particle(
              mouseRef.current.x + (Math.random() - 0.5) * 20,
              mouseRef.current.y + (Math.random() - 0.5) * 20,
              'mouse'
            ));
         }
         // 重置活动状态，防止停止移动时继续生成
         mouseRef.current.active = false;
      }

      // 更新和绘制所有粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    const handleResize = () => {
      resize();
      init();
    };

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true
      };
    };

    const handleClick = (e) => {
      // 点击爆发效果
      for(let i=0; i<20; i++) {
        particles.push(new Particle(e.clientX, e.clientY, 'mouse'));
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    handleResize();
    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }} // 整体透明度控制
    />
  );
};

/**
 * 自定义光标组件
 * 增加光晕效果，配合雾气
 */
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.interactive')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* 外部光晕，模拟光源 */}
      <div 
         className="fixed top-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none z-0 transition-transform duration-200"
         style={{ 
          transform: `translate(${mousePosition.x - 150}px, ${mousePosition.y - 150}px)`,
        }}
      />
      {/* 磁吸圆环 */}
      <div 
        className="fixed top-0 left-0 w-8 h-8 border border-cyan-400/50 rounded-full pointer-events-none z-50 transition-all duration-100 ease-out mix-blend-screen"
        style={{ 
          transform: `translate(${mousePosition.x - 16}px, ${mousePosition.y - 16}px) scale(${isHovering ? 2.5 : 1})`,
          backgroundColor: isHovering ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
          borderColor: isHovering ? 'rgba(6, 182, 212, 0.8)' : 'rgba(6, 182, 212, 0.3)'
        }}
      />
      {/* 核心点 */}
      <div 
        className="fixed top-0 left-0 w-1 h-1 bg-cyan-200 rounded-full pointer-events-none z-50 transition-transform duration-75 ease-out shadow-[0_0_10px_rgba(34,211,238,1)]"
        style={{ 
          transform: `translate(${mousePosition.x - 2}px, ${mousePosition.y - 2}px)`
        }}
      />
    </>
  );
};

/**
 * 聚光灯卡片组件
 */
const SpotlightCard = ({ children, className = "" }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`relative border border-white/10 bg-black/40 overflow-hidden group interactive backdrop-blur-md ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              rgba(34, 211, 238, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">
        {children}
      </div>
    </div>
  );
};

/**
 * 磁吸按钮
 */
const MagneticButton = ({ children, className }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    // @ts-ignore
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`interactive relative overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
};

const Navbar = () => (
  <nav className="fixed w-full z-40 top-0 left-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
    <div className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 animate-pulse" />
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center relative z-10 rotate-3 hover:rotate-12 transition-transform duration-300">
          <Wind size={18} className="text-black fill-current" />
        </div>
      </div>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">AETHER</span>
      <span className="text-cyan-500 text-xs align-top mt-1">v3.0</span>
    </div>
    <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
      {['引擎', '案例', '文档', '社区'].map((item) => (
        <a key={item} href="#" className="relative hover:text-cyan-300 transition-colors interactive group py-2">
          {item}
          <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-400 transition-all duration-300 group-hover:w-full" />
        </a>
      ))}
    </div>
    <MagneticButton className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 hover:border-cyan-500/50 transition-all backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      立即体验
    </MagneticButton>
  </nav>
);

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20 overflow-hidden">
      {/* 装饰性背景光 */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-900/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-1/4 w-[800px] h-[500px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 max-w-5xl"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/30 text-cyan-300 text-sm mb-8 font-medium backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,1)]" />
          全动态流体引擎 Next-Gen
        </motion.div>
        
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mb-8 leading-[0.9]">
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
            ETHER
          </span>
          <span className="block text-4xl md:text-6xl font-light tracking-widest text-slate-400 mt-2">
            DIGITAL REALITY
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed mix-blend-plus-lighter">
          在这里，代码如呼吸般自然。沉浸于每一个像素的流动，感受前所未有的数字生命力。
          <br/>
          <span className="text-cyan-500/60 text-sm mt-4 block">上下滑动鼠标，感受雾气升腾</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <MagneticButton className="px-10 py-5 bg-cyan-500 text-black rounded-xl font-bold text-lg hover:bg-cyan-400 transition-all flex items-center gap-2 group shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)]">
            开始探索
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </MagneticButton>
          <MagneticButton className="px-10 py-5 bg-black/40 border border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/5 transition-all backdrop-blur-md flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            查看演示
          </MagneticButton>
        </div>
      </motion.div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      title: "流体交互",
      desc: "模拟真实气体动力学，每一次鼠标滑动都掀起一阵数字风暴。",
      icon: <Wind className="w-8 h-8 text-cyan-300" />
    },
    {
      title: "光影追踪",
      desc: "基于 WebGL 的实时光照渲染，为平面的网页带来深邃的空间感。",
      icon: <Layers className="w-8 h-8 text-purple-300" />
    },
    {
      title: "极致性能",
      desc: "Canvas 2D 与 GPU 加速完美结合，即使在移动端也能保持 60fps。",
      icon: <Zap className="w-8 h-8 text-yellow-300" />
    }
  ];

  return (
    <section className="relative py-32 px-4 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <SpotlightCard key={i} className="rounded-xl p-10 bg-black/40 border-white/5 h-[320px] flex flex-col justify-between group">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed font-light">{f.desc}</p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 border-t border-white/5 relative z-10 bg-black/80 backdrop-blur-xl">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <Wind size={18} className="text-white fill-current" />
        <span className="text-white font-bold tracking-widest">AETHER</span>
      </div>
      <p className="text-slate-600 text-xs font-mono">DESIGNED FOR THE FUTURE. © 2025</p>
    </div>
  </footer>
);

const App = () => {
  return (
    <div className="min-h-screen bg-[#020204] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans cursor-none overflow-x-hidden">
      <CustomCursor />
      <FogBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Features />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;