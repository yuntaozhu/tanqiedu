import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Pen, Eraser, Bot, 
  PartyPopper, Play, Volume2, LoaderCircle, Maximize2, Minimize2,
  Home, X, RefreshCw, PowerOff, Power, Pause, Trash2, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as fabric from 'fabric';
import { Application, Graphics } from 'pixi.js';
import flvjs from 'flv.js';

// 1. Two-level Mock Data Structure (Phase 2 with 10 TPR Pages)
const mockData = [
  {
    id: "c1", 
    title: "第一节课：What Do I See? (TPR 绘本精读)",
    pages: [
      // 1. Cover
      { id: "p1", type: "book_page", content: "https://placehold.co/800x800/2dd4bf/ffffff?text=What+Do+I+See%3F&font=Montserrat", text: "What Do I See?" },
      // 2. TPR Introduce "See"
      { id: "p2", type: "robot_explain", content: "Make binoculars like this! 'I see...'", robotEvent: { action: "START", duration: 2500 } },
      // 3. Book: One
      { id: "p3", type: "book_page", content: "https://placehold.co/800x1200/fcd34d/ffffff?text=Sandcastle", text: "I see one." },
      // 4. Book: Two + TPR Practice
      { id: "p4", type: "robot_practice", content: "Show me TWO fingers! 'I see two.'", robotEvent: { action: "CHEER", duration: 3000 } },
      // 5. Book: Three
      { id: "p5", type: "book_page", content: "https://placehold.co/800x1200/fca5a5/ffffff?text=Umbrellas", text: "I see three." },
      // 6. Book: Four + TPR Seagull
      { id: "p6", type: "robot_practice", content: "Fly like a seagull! 'I see four.'", robotEvent: { action: "SWING", duration: 3500 } },
      // 7. Book: Five
      { id: "p7", type: "book_page", content: "https://placehold.co/800x1200/60a5fa/ffffff?text=Clouds", text: "I see five." },
      // 8. Interactive Game (Pixi) - Clouds
      { id: "p8", type: "pixi_game", content: "Tap to catch the clouds!" },
      // 9. Independent Test ("Me")
      { id: "p9", type: "robot_test", content: "Point to yourself: 'I see me!'", robotEvent: { action: "DEFAULT", duration: 4000 } },
      // 10. Reward
      { id: "p10", type: "reward", content: "Great Reader!" }
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
        let app: Application | null = new Application();
        
        const initPixi = async () => {
            if (!pixiContainer.current || !app) return;
            // Initialize Pixi Application
            await app.init({
                backgroundAlpha: 0,
                autoDensity: true,
                resolution: window.devicePixelRatio || 1,
            });
            
            if (!active) {
                try {
                   app.destroy(true);
                } catch(e) {}
                return;
            }
            
            pixiContainer.current.appendChild(app.canvas);
            
            const handleResize = () => {
                if (active && app && pixiContainer.current) {
                    app.renderer.resize(pixiContainer.current.clientWidth, pixiContainer.current.clientHeight);
                }
            };
            window.addEventListener('resize', handleResize);
            handleResize();

            const currentApp = app;
            // Generate drifting clouds (TPR game element)
            const bubbles: Graphics[] = [];
            for (let i = 0; i < 15; i++) {
                const bubble = new Graphics();
                const radius = Math.random() * 20 + 30; // base radius
                
                // Draw fluffy cloud shape
                bubble.circle(0, 0, radius);
                bubble.circle(radius * 0.7, -radius * 0.3, radius * 0.7);
                bubble.circle(-radius * 0.7, -radius * 0.3, radius * 0.7);
                bubble.circle(radius * 0.3, -radius * 0.6, radius * 0.6);
                const randomColor = Math.random() > 0.5 ? 0xffffff : 0xf1f5f9; // white variants
                bubble.fill({ color: randomColor, alpha: 0.95 });
                
                bubble.x = Math.random() * currentApp.screen.width;
                bubble.y = currentApp.screen.height + Math.random() * 500;
                
                // Add interactivity
                bubble.eventMode = 'static';
                bubble.cursor = 'pointer';
                bubble.on('pointerdown', () => {
                    // Pop animation effect via Confetti
                    const rect = pixiContainer.current?.getBoundingClientRect();
                    if (rect) {
                       const xRatio = bubble.x / currentApp.screen.width;
                       const yRatio = bubble.y / currentApp.screen.height;
                       confetti({ 
                           particleCount: 20, spread: 60, origin: { x: xRatio, y: yRatio },
                           colors: ['#ffffff', '#bae6fd'] 
                       });
                    }
                    bubble.y = currentApp.screen.height + 200; // Reset to bottom
                });

                // Custom speeds
                (bubble as any).speedY = 1 + Math.random() * 2.5;
                (bubble as any).speedX = (Math.random() - 0.5) * 1.5;
                
                currentApp.stage.addChild(bubble);
                bubbles.push(bubble);
            }

            // Animation Loop
            if (!app) return;
            currentApp.ticker.add(() => {
                bubbles.forEach(bubble => {
                    bubble.y -= (bubble as any).speedY;
                    bubble.x += (bubble as any).speedX;
                    
                    if (bubble.y < -100) {
                        bubble.y = currentApp.screen.height + 100;
                        bubble.x = Math.random() * currentApp.screen.width;
                    }
                    if (bubble.x < 0 || bubble.x > currentApp.screen.width) {
                        (bubble as any).speedX *= -1;
                    }
                });
            });
        };

        initPixi();

        return () => {
            active = false;
            if (app) {
                try {
                    app.destroy({ removeView: true });
                } catch(e) {}
                app = null;
            }
        };
    }, []);

    return <div ref={pixiContainer} className="absolute inset-0 w-full h-full z-10 overflow-hidden" />;
};


// --- FLV JS Video Player ---
const FlvVideoPlayer = ({ src, videoRef, onPlay, onPause }: any) => {
    useEffect(() => {
        let flvPlayer: flvjs.Player | null = null;
        if (flvjs.isSupported() && src && src.endsWith('.flv') && videoRef.current) {
            flvPlayer = flvjs.createPlayer({
                type: 'flv',
                url: src
            });
            flvPlayer.attachMediaElement(videoRef.current);
            flvPlayer.load();
            // Optional: flvPlayer.play();
        }

        return () => {
            if (flvPlayer) {
                try {
                    flvPlayer.pause();
                    flvPlayer.unload();
                    flvPlayer.detachMediaElement();
                    flvPlayer.destroy();
                } catch (e) {}
            }
        };
    }, [src, videoRef]);

    return (
        <video 
            ref={videoRef}
            src={(!src || src.endsWith('.flv')) ? undefined : src} 
            autoPlay
            onPlay={onPlay}
            onPause={onPause}
            className="w-full h-full object-contain bg-black"
        />
    );
};


const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
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
            const currentCanvas = fabricCanvasRef.current;
            if (!currentCanvas) return;
            for (let entry of entries) {
                try {
                    currentCanvas.setWidth(entry.contentRect.width);
                    currentCanvas.setHeight(entry.contentRect.height);
                    currentCanvas.renderAll();
                } catch (err) {
                    console.error("Fabric resize error", err);
                }
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
              
              {currentPage.type === 'book_page' && (
                 <div className="w-full h-full bg-white flex flex-col items-center p-8 text-black relative">
                     {/* Safe area for canvas drawing over the image */}
                     <div className="flex-1 w-full max-w-4xl flex items-center justify-center min-h-0 mb-8 pt-6 pointer-events-none">
                         <img src={currentPage.content} alt="book page" className="max-h-full w-auto object-contain shadow-md rounded-md pointer-events-auto select-none" draggable={false} />
                     </div>
                     <div className="flex flex-col items-center gap-6 mb-8 shrink-0 relative z-50 pointer-events-auto">
                         <h2 className="text-5xl md:text-7xl font-semibold tracking-wide text-gray-800">{currentPage.text}</h2>
                         <button 
                             onClick={() => playAudio(currentPage.text || "")}
                             className="flex items-center gap-3 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full transition active:translate-y-1 shadow-[0_4px_0_theme(colors.gray.800)] active:shadow-none"
                         >
                             <Play size={24} className="fill-current text-green-400" />
                             <div className="w-48 h-4 bg-gray-500 rounded-full overflow-hidden flex items-center shadow-inner relative">
                                <div className="absolute left-0 top-0 bottom-0 bg-green-400 w-1/2"></div>
                                <Volume2 size={14} className="absolute right-2 text-gray-300 opacity-50" />
                             </div>
                         </button>
                     </div>
                 </div>
              )}
              
              {currentPage.type === 'normal_video' && (
                <FlvVideoPlayer 
                  src={currentPage.content} 
                  videoRef={videoRef}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
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
                        {robotStatus === 'executing' && <><LoaderCircle size={24} className="animate-spin" /> 小布米正在执行与感知...</>}
                        {robotStatus === 'done' && <><RefreshCw size={24} /> 重新触发</>}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {currentPage.type === 'pixi_game' && (
                 <div className="w-full h-full bg-gradient-to-t from-sky-400 to-blue-200 relative">
                     <PixiInteractiveSlide />
                     <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 opacity-20 mix-blend-overlay">
                         <h1 className="text-[10rem] font-black italic tracking-tighter text-white">CATCH!</h1>
                     </div>
                     <div className="absolute top-12 left-0 w-full text-center z-20 pointer-events-none">
                        <h2 className="text-4xl font-bold text-slate-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]">{currentPage.content}</h2>
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
