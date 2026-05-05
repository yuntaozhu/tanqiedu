import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Pen, Eraser, Bot, 
  PartyPopper, Play, Loader2, Maximize2, Minimize2,
  Home, X, RefreshCw, PowerOff, Power, Pause, Trash2, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fabric } from 'fabric';
import { Application, Graphics } from 'pixi.js';

// 1. Two-level Mock Data Structure (Phase 2 with 10 TPR Pages)
const mockData = [
  {
    id: "c1", 
    title: "第一节课：TPR 英语动作启蒙 (核心十步法)",
    pages: [
      { id: "p1", type: "normal_image", content: "https://placehold.co/1280x720/1e293b/3b82f6?text=Lesson+1:+Let's+Move!&font=Montserrat" },
      { id: "p2", type: "normal_video", content: "https://www.w3schools.com/html/mov_bbb.mp4" },
      // 步骤 1~3：观察与模仿机制 (Observe)
      { id: "p3", type: "robot_explain", content: "Look at me! Jump! (看着我，跳跃)", robotEvent: { action: "START", duration: 2500 } },
      { id: "p4", type: "robot_explain", content: "Look at me! Wave! (看着我，挥手)", robotEvent: { action: "SWING", duration: 3000 } },
      { id: "p5", type: "robot_explain", content: "Look at me! Clap! (看着我，拍手)", robotEvent: { action: "CHEER", duration: 2500 } },
      // 步骤 4~5：共同执行机制 (Co-Action)
      { id: "p6", type: "robot_practice", content: "Stand up! Let's Jump together! (站起来一起跳)", robotEvent: { action: "START", duration: 3000 } },
      { id: "p7", type: "robot_practice", content: "Hands up! Let's Wave! (举起手一起挥挥)", robotEvent: { action: "SWING", duration: 3000 } },
      // 步骤 6：游戏互动机制 (Game Interaction - Pixi.js)
      { id: "p8", type: "pixi_game", content: "Catch the Magic Bubbles! (点击消除魔法泡泡)" },
      // 步骤 7：独立考核机制 (Independent Test)
      { id: "p9", type: "robot_test", content: "Now listen carefully... JUMP! (听我说，不要看我，直接跳！)", robotEvent: { action: "DEFAULT", duration: 4000 } },
      // 步骤 8：正向激励机制 (Reward)
      { id: "p10", type: "reward", content: "Excellent! You are a TPR Master!" }
    ]
  },
  {
    id: "c2", 
    title: "第二节课：造梦打印机体验",
    pages: [
      { id: "p11", type: "robot_chat", content: "点击麦克风，告诉小布米你想要什么画？" },
      { id: "p12", type: "robot_print", content: "生成完毕！正在打印中..." }
    ]
  }
];

// --- Pixi.js Interactive Component ---
const PixiInteractiveSlide = () => {
    const pixiContainer = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        let active = true;
        let app = new Application();
        
        const initPixi = async () => {
            if (!pixiContainer.current) return;
            // Initialize Pixi Application
            await app.init({
                backgroundAlpha: 0,
                resizeTo: pixiContainer.current,
                autoDensity: true,
                resolution: window.devicePixelRatio || 1,
            });
            
            if (!active) {
                app.destroy(true);
                return;
            }
            
            pixiContainer.current.appendChild(app.canvas);

            // Generate drifting bubbles (TPR game element)
            const bubbles: Graphics[] = [];
            for (let i = 0; i < 20; i++) {
                const bubble = new Graphics();
                const radius = Math.random() * 30 + 20;
                
                // Draw circle
                bubble.circle(0, 0, radius);
                const randomColor = Math.floor(Math.random()*16777215);
                bubble.fill({ color: randomColor, alpha: 0.8 });
                
                bubble.x = Math.random() * app.screen.width;
                bubble.y = app.screen.height + Math.random() * 500;
                
                // Add interactivity
                bubble.eventMode = 'static';
                bubble.cursor = 'pointer';
                bubble.on('pointerdown', () => {
                    // Pop animation effect via Confetti
                    const rect = pixiContainer.current?.getBoundingClientRect();
                    if (rect) {
                       const xRatio = bubble.x / app.screen.width;
                       const yRatio = bubble.y / app.screen.height;
                       confetti({ 
                           particleCount: 15, spread: 50, origin: { x: xRatio, y: yRatio },
                           colors: ['#'+randomColor.toString(16).padStart(6, '0')] 
                       });
                    }
                    bubble.y = app.screen.height + 200; // Reset to bottom
                });

                // Custom speeds
                (bubble as any).speedY = 1 + Math.random() * 2;
                (bubble as any).speedX = (Math.random() - 0.5) * 1;
                
                app.stage.addChild(bubble);
                bubbles.push(bubble);
            }

            // Animation Loop
            app.ticker.add(() => {
                bubbles.forEach(bubble => {
                    bubble.y -= (bubble as any).speedY;
                    bubble.x += (bubble as any).speedX;
                    
                    if (bubble.y < -100) {
                        bubble.y = app.screen.height + 100;
                        bubble.x = Math.random() * app.screen.width;
                    }
                    if (bubble.x < 0 || bubble.x > app.screen.width) {
                        (bubble as any).speedX *= -1;
                    }
                });
            });
        };

        initPixi();

        return () => {
            active = false;
            if (app) app.destroy({ removeView: true });
        };
    }, []);

    return <div ref={pixiContainer} className="absolute inset-0 w-full h-full z-10 overflow-hidden" />;
};


export default function Courseware() {
  // Navigation State
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  
  // Player State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawMode, setDrawMode] = useState<'none' | 'pen' | 'eraser'>('none');
  const [isRobotConnected, setIsRobotConnected] = useState(false);
  const [robotStatus, setRobotStatus] = useState<'idle' | 'executing' | 'done'>('idle');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const drawModeRef = useRef(drawMode);

  const activeCourse = mockData.find(c => c.id === activeCourseId);
  const currentPage = activeCourse?.pages[currentPageIdx];

  // Update drawModeRef for callbacks
  useEffect(() => {
      drawModeRef.current = drawMode;
      const canvas = fabricCanvasRef.current;
      if (canvas) {
          canvas.isDrawingMode = (drawMode === 'pen');
          
          if (drawMode === 'eraser') {
              canvas.selection = false;
              canvas.forEachObject(obj => obj.selectable = false);
              canvas.defaultCursor = 'crosshair';
          } else {
              canvas.selection = false;
              canvas.forEachObject(obj => obj.selectable = false);
              canvas.defaultCursor = 'default';
          }
      }
  }, [drawMode]);

  // --- Fabric.js Canvas Setup ---
  useEffect(() => {
    if (!activeCourseId) return;

    const initFabric = () => {
        const canvasEl = document.getElementById('fabric-canvas') as HTMLCanvasElement;
        if (!canvasEl) return;

        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
        }

        const canvas = new fabric.Canvas(canvasEl, {
            isDrawingMode: false,
            backgroundColor: 'rgba(0,0,0,0)',
            selection: false
        });
        
        canvas.freeDrawingBrush.color = '#ef4444';
        canvas.freeDrawingBrush.width = 5;
        
        // Handle Resize
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                canvas.setWidth(entry.contentRect.width);
                canvas.setHeight(entry.contentRect.height);
                canvas.renderAll();
            }
        });
        
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
            // Initial set
            canvas.setWidth(containerRef.current.clientWidth);
            canvas.setHeight(containerRef.current.clientHeight);
        }
        
        fabricCanvasRef.current = canvas;

        // Custom Eraser implementation using Fabric Events
        canvas.on('mouse:down', (options) => {
            if (drawModeRef.current === 'eraser' && options.target) {
                canvas.remove(options.target);
            }
        });

        // Track pointer for thick eraser visual feedback (Optional enhancement)
        canvas.on('mouse:move', (options) => {
             if (drawModeRef.current === 'eraser' && options.e.buttons === 1) {
                  // Drag eraser support
                  const pointer = canvas.getPointer(options.e);
                  const objects = canvas.getObjects();
                  // Simple collision check for path bounding boxes
                  const fPoint = new fabric.Point(pointer?.x || 0, pointer?.y || 0);
                  for (let i = objects.length - 1; i >= 0; i--) {
                       if (objects[i].containsPoint(fPoint)) {
                           canvas.remove(objects[i]);
                       }
                  }
             }
        });

        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
            fabricCanvasRef.current = null;
        }
    };
    
    // Give DOM a microsecond to mount the canvas element
    const timeout = setTimeout(initFabric, 50);
    return () => clearTimeout(timeout);
  }, [activeCourseId, currentPageIdx]); // Reset canvas fully on slide change


  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
        fabricCanvasRef.current.clear();
        fabricCanvasRef.current.setBackgroundColor('rgba(0,0,0,0)', fabricCanvasRef.current.renderAll.bind(fabricCanvasRef.current));
    }
  };

  // --- Actions ---
  const handleConnectRobot = () => {
     alert(isRobotConnected ? "已断开与小布米的连接。" : "连接成功！小布米已就绪 (TPR感知服务已启动)。");
     setIsRobotConnected(!isRobotConnected);
  };

  const handlePraise = () => {
     confetti({
        particleCount: 150, spread: 80, origin: { y: 0.8 },
        colors: ['#ef4444', '#3b82f6', '#10b981', '#eab308']
     });
  };

  const toggleVideoPlayback = (play: boolean) => {
     if (videoRef.current) {
        if (play) {
           videoRef.current.play();
           setIsVideoPlaying(true);
        } else {
           videoRef.current.pause();
           setIsVideoPlaying(false);
        }
     }
  };

  const reloadCurrentSlide = () => {
     setRobotStatus('idle');
     clearCanvas();
     if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsVideoPlaying(true);
     }
  };

  const triggerRobotAction = () => {
    if (robotStatus === 'executing' || !currentPage?.robotEvent) return;
    if (!isRobotConnected) {
       alert("请先在底部栏点击「外联小布米」！");
       return;
    }
    
    setRobotStatus('executing');
    
    // Simulate robotic action delay and visual completion
    setTimeout(() => {
      setRobotStatus('done');
      if (currentPage.type !== 'robot_test') { // Don't confetti immediately on test mode
          confetti({
             particleCount: 80, spread: 60, origin: { y: 0.6 },
             colors: ['#3b82f6', '#10b981']
          });
      }
    }, currentPage.robotEvent.duration || 2000);
  };

  // Render Component Level 2
  if (activeCourseId && currentPage) {
    return (
      <div className={`flex flex-col bg-slate-950 text-white font-sans ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-[calc(100vh-200px)]'}`}>
        
        {/* --- Display Area --- */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
          
          {/* Fabric.js Canvas Overlay */}
          <div className={`absolute inset-0 z-40 ${drawMode === 'none' ? 'pointer-events-none' : 'pointer-events-auto'}`}>
              <canvas id="fabric-canvas" className="w-full h-full" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center w-full h-full"
            >
              {currentPage.type === 'normal_image' && (
                <img src={currentPage.content} alt="slide" className="w-full h-full object-cover" draggable={false} />
              )}
              
              {currentPage.type === 'normal_video' && (
                <video 
                  ref={videoRef}
                  src={currentPage.content} 
                  autoPlay
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  className="w-full h-full object-contain bg-black"
                />
              )}

              {/* TPR Specific View rendering */}
              {(currentPage.type.startsWith('robot_')) && (
                <div className={`w-full h-full flex flex-col items-center justify-center relative transition-colors duration-700
                   ${currentPage.type === 'robot_test' ? 'bg-gradient-to-br from-indigo-950 to-slate-950' : 'bg-gradient-to-br from-slate-900 to-indigo-950'}
                `}>
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/bg/1280/720')] opacity-5 mix-blend-overlay"></div>
                  
                  <div className="z-20 text-center flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center mb-8 transition-all duration-500 shadow-2xl relative
                       ${isRobotConnected ? 'bg-blue-500/20 border-blue-400 shadow-blue-500/50 scale-105' : 'bg-slate-800 border-slate-600 scale-100'}
                       ${robotStatus === 'executing' ? 'animate-pulse border-emerald-400 shadow-emerald-500/50' : ''}
                    `}>
                       <Bot size={64} className={`${isRobotConnected ? 'text-blue-400' : 'text-slate-500'} ${robotStatus === 'executing' ? 'text-emerald-400' : ''}`} />
                       {robotStatus === 'executing' && currentPage.type === 'robot_test' && (
                          <div className="absolute -bottom-10 whitespace-nowrap text-emerald-400 font-mono text-sm border border-emerald-500/30 bg-emerald-950/50 px-3 py-1 rounded-full">启用了 3D 相机视觉判定...</div>
                       )}
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl px-8 drop-shadow-lg">
                      {currentPage.content}
                    </h2>
                    
                    {currentPage.robotEvent && (
                       <p className={`text-lg mb-12 font-mono tracking-widest uppercase inline-block px-4 py-1.5 rounded-md
                          ${currentPage.type === 'robot_test' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-blue-900/50 text-blue-300'}
                       `}>
                          [ TASK: {currentPage.robotEvent.action}{currentPage.type === 'robot_test' ? ' + VISION' : ''} ]
                       </p>
                    )}

                    {currentPage.robotEvent && (
                      <button 
                        onClick={triggerRobotAction}
                        disabled={robotStatus === 'executing'}
                        className={`
                          mx-auto flex items-center gap-3 px-10 py-5 rounded-full font-bold text-xl transition-all duration-300 pointer-events-auto relative z-50
                          ${robotStatus === 'idle' ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 shadow-xl shadow-blue-600/40' : ''}
                          ${robotStatus === 'executing' ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : ''}
                          ${robotStatus === 'done' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/40' : ''}
                        `}
                      >
                        {robotStatus === 'idle' && <><Play size={24} /> {currentPage.type === 'robot_test' ? '开启体感判定并下发指令' : '触发机器互动'}</>}
                        {robotStatus === 'executing' && <><Loader2 size={24} className="animate-spin" /> 小布米正在执行与感知...</>}
                        {robotStatus === 'done' && <><RefreshCw size={24} /> 重新触发</>}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentPage.type === 'pixi_game' && (
                 <div className="w-full h-full bg-gradient-to-t from-purple-950 to-slate-900 relative">
                     <PixiInteractiveSlide />
                     <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 opacity-30 mix-blend-overlay">
                         <h1 className="text-[10rem] font-black italic tracking-tighter text-white">TAP! TAP!</h1>
                     </div>
                     <div className="absolute top-12 left-0 w-full text-center z-20 pointer-events-none">
                        <h2 className="text-4xl font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">{currentPage.content}</h2>
                     </div>
                 </div>
              )}

              {currentPage.type === 'reward' && (
                 <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-700 flex flex-col items-center justify-center relative overflow-hidden">
                     <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 15 }} className="bg-white/10 p-12 rounded-full backdrop-blur-md mb-8 border border-white/20 shadow-2xl">
                         <Award size={120} className="text-amber-100 drop-shadow-2xl" />
                     </motion.div>
                     <h2 className="text-6xl font-black text-white drop-shadow-xl">{currentPage.content}</h2>
                     {/* Auto trigger confetti on mount of reward screen */}
                     {(setTimeout(handlePraise, 500), null)}
                 </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- Toolbar Area (按钮区) --- */}
        <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 overflow-x-auto shrink-0 z-50 pointer-events-auto">
           {/* Connection Group */}
           <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3 mr-3 shrink-0">
             <ToolBtn 
               icon={isRobotConnected ? PowerOff : Power} 
               label={isRobotConnected ? "断开设备" : "外联小布米"} 
               active={isRobotConnected}
               activeClass="bg-emerald-500/20 text-emerald-400"
               onClick={handleConnectRobot} 
             />
           </div>

           {/* Navigation Group */}
           <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3 mr-3 shrink-0">
             <ToolBtn icon={Home} label="返回主页" onClick={() => { setActiveCourseId(null); setIsFullscreen(false); }} />
             <div className="flex items-center gap-1 px-2 border-r border-l border-slate-700 mx-1">
                 <span className="text-xs text-slate-500 font-mono w-12 text-center">{currentPageIdx + 1}/{activeCourse.pages.length}</span>
             </div>
             <ToolBtn icon={ChevronLeft} label="上一页" onClick={() => { setCurrentPageIdx(p => Math.max(0, p - 1)); clearCanvas(); setRobotStatus('idle'); }} disabled={currentPageIdx === 0} />
             <ToolBtn icon={ChevronRight} label="下一页" onClick={() => { setCurrentPageIdx(p => Math.min(activeCourse.pages.length - 1, p + 1)); clearCanvas(); setRobotStatus('idle'); }} disabled={currentPageIdx === activeCourse.pages.length - 1} />
           </div>

           {/* Media Group */}
           <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3 mr-3 shrink-0">
             <ToolBtn icon={Play} label="视频播放" onClick={() => toggleVideoPlayback(true)} disabled={currentPage.type !== 'normal_video' || isVideoPlaying} />
             <ToolBtn icon={Pause} label="视频暂停" onClick={() => toggleVideoPlayback(false)} disabled={currentPage.type !== 'normal_video' || !isVideoPlaying} />
             <ToolBtn icon={RefreshCw} label="课件重置" onClick={reloadCurrentSlide} />
           </div>

           {/* Interaction Group */}
           <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3 mr-3 shrink-0">
             <ToolBtn icon={PartyPopper} label="飞舞点赞" onClick={handlePraise} />
             <ToolBtn icon={Pen} label="书写画笔" active={drawMode === 'pen'} onClick={() => setDrawMode(drawMode === 'pen' ? 'none' : 'pen')} />
             <ToolBtn icon={Eraser} label="擦除要素" active={drawMode === 'eraser'} onClick={() => setDrawMode(drawMode === 'eraser' ? 'none' : 'eraser')} />
             <ToolBtn icon={Trash2} label="清空画板" onClick={clearCanvas} />
           </div>

           {/* Window Group */}
           <div className="flex items-center gap-1.5 shrink-0">
             <ToolBtn icon={Minimize2} label="缩放复原" onClick={() => setIsFullscreen(false)} disabled={!isFullscreen} />
             <ToolBtn icon={Maximize2} label="沉浸全屏" onClick={() => setIsFullscreen(true)} disabled={isFullscreen} />
             <ToolBtn icon={X} label="关闭课件" onClick={() => setActiveCourseId(null)} />
           </div>
        </div>
      </div>
    );
  }

  // --- Level 1: Course Directory (第一层目录) ---
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-black text-slate-900 mb-2">探奇 AI 教师云盘</h1>
        <p className="text-slate-500">双层课件结构：选择您要讲授的 TPR 具身智能课时。</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         {mockData.map((course) => (
           <motion.div 
             key={course.id}
             whileHover={{ y: -5 }}
             onClick={() => {
                setActiveCourseId(course.id);
                setCurrentPageIdx(0);
                setIsFullscreen(true); 
             }}
             className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-lg cursor-pointer group"
           >
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-blue-600 relative flex items-center justify-center p-6 text-center">
                 <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/folder/600/400')] mix-blend-overlay opacity-30 group-hover:opacity-50 transition-opacity"></div>
                 <h2 className="text-2xl font-bold text-white relative z-10 drop-shadow-md">{course.title}</h2>
              </div>
              <div className="p-6 flex justify-between items-center bg-slate-50">
                 <div className="text-slate-500 text-sm font-medium">包含核心教学 {course.pages.length} 页</div>
                 <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Play size={18} className="ml-1" />
                 </div>
              </div>
           </motion.div>
         ))}
      </div>
    </div>
  );
}

// Sub-component for Toolbar Button
function ToolBtn({ icon: Icon, label, onClick, disabled = false, active = false, activeClass = "bg-blue-600 text-white shadow-inner border border-blue-500" }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`
        flex flex-col items-center justify-center min-w-[56px] h-14 rounded-lg gap-1 transition-all duration-200 border border-transparent
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 active:scale-95'}
        ${active && !disabled ? activeClass : (!disabled ? 'text-slate-300 hover:border-slate-700' : '')}
      `}
    >
      <Icon size={20} />
      <span className="text-[10px] whitespace-nowrap">{label}</span>
    </button>
  );
}
