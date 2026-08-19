import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Pen, Eraser, Bot, 
  PartyPopper, Play, Volume2, LoaderCircle, Maximize2, Minimize2,
  Home, X, RefreshCw, PowerOff, Power, Pause, Trash2, Award, ChevronsUpDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Application, Graphics } from 'pixi.js';
import flvjs from 'flv.js';
import { 
  ColorIntroScene, LessonSelectorGrid, SubLessonSelector, 
  ForestSearchGame, TreasureBoxGame, AnimalConnectGame, 
  ShapeColoringGame, DoubleColorGame, SpaceStationDragGame, 
  ColorSudokuGame, ColorPrepGame
} from '../components/ColorKingdomGames';
import {
  ShapeIntroScene, ShapeLessonSelectorGrid, ShapeSubLessonSelector,
  ShapeForestSearchGame, ShapeMagicChestGame, ShapeAnimalConnectGame,
  ShapeColoringGame as ShapeColoringCanvas, ShapeBuildingBlocksGame, ShapeSudokuGame
} from '../components/ShapeKingdomGames';
import {
  BUMI_ACTIONS, BUMI_CLASSROOM_SAFE, bumiCmd, bumiState, bumiBaseUrl, createBumiCuer,
} from '../lib/bumi';

// 1. Two-level Mock Data Structure (Phase 2 with 10 TPR Pages)
const mockData = [
  {
    id: "c1", 
    title: "第一节课：What Do I See? (TPR 绘本精读)",
    pages: [
      // 1. Cover
      { id: "p1", type: "book_page", content: "https://placehold.co/800x800/2dd4bf/ffffff?text=What+Do+I+See%3F&font=Montserrat", text: "What Do I See?" },
      // 2. TPR Introduce "See"
      { id: "p2", type: "robot_explain", content: "Make binoculars like this! 'I see...'", robotEvent: { action: "SWITCH", duration: 2500 } },
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
  },
  {
    id: "c3",
    title: "第三课：陪伴机器人",
    pages: [
      { 
        id: "p3_1", type: "slide_split", mediaType: "image", 
        title: "01 联系", 
        content: "https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course1/%E5%AF%BC%E5%85%A5%E5%9B%BE.png", 
        text: "小朋友们，你们知道生活中有哪些机器人？\n\n它们可以帮助我们做些什么呢？\n\n你们想要一个机器人好朋友吗？\n\n今天让我们搭建一个机器人，让它陪着小朋友们一起度过愉快的时间，它叫做陪伴机器人，下面让我们一起搭建一个陪伴机器人吧！" 
      },
      { 
        id: "p3_2", type: "slide_split", mediaType: "image", 
        title: "02 找零件", 
        content: "https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course1/%E9%9B%B6%E4%BB%B6%E6%B8%85%E5%8D%95.png", 
        text: "请小朋友根据清单要求，独立寻找对应零件，找齐之后小手放好坐端正。" 
      },
      { 
        id: "p3_3", type: "slide_split", mediaType: "video", 
        title: "03 跟随搭建：头部", 
        content: "https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course1/1.mp4", 
        text: "陪伴机器人分为身体和头部两部分。首先让我们先来搭建头部，小朋友们看看用到了什么结构？" 
      },
      { 
        id: "p3_4", type: "slide_split", mediaType: "video", 
        title: "03 跟随搭建：身体", 
        content: "https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course1/2.mp4", 
        text: "太棒了，头部完成了，接下来跟随我一起搭建陪伴机器人的身体部分吧！" 
      },
      {
        id: "p3_5", type: "slide_split", mediaType: "image",
        title: "04 延续",
        content: "https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course1/%E5%AF%BC%E5%85%A5%E5%9B%BE.png",
        text: "陪伴机器人搭建完成了，接下来请小朋友们利用零件箱中剩余的零件改装一下你的作品吧，让陪伴机器人变得更漂亮。"
      },
      {
        id: "p3_6", type: "slide_split", mediaType: "image",
        title: "05 收零件",
        content: "https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course1/%E9%9B%B6%E4%BB%B6%E6%B8%85%E5%8D%95.png",
        text: "今天的任务都完成啦，请小朋友送零件宝宝回家，请小朋友们轻轻地将作品拆掉，放回宝箱。"
      },
      {
        id: "p3_7", type: "slide_split", mediaType: "image",
        title: "06 反思",
        content: "https://5dsvuv46abrfygzd.public.blob.vercel-storage.com/course1/%E5%AF%BC%E5%85%A5%E5%9B%BE.png",
        text: "1. 你搭建的作品是什么呢？\n\n2. 陪伴机器人是怎样行走的呢？\n\n3. 陪伴机器人是分为哪些部分？(头部、身体)"
      }
    ]
  },
  {
    id: "c4",
    title: "第四课：辨色识趣 (颜色空间站)",
    pages: [
      { id: "p4_1", type: "color_intro" },
      { id: "p4_2", type: "level_grid" },
      { id: "p4_3", type: "track_selector" },
      { id: "p4_4", type: "forest_search" },
      { id: "p4_prep", type: "color_prep" },
      { id: "p4_5", type: "treasure_chest" },
      { id: "p4_6", type: "animal_connect" },
      { id: "p4_7", type: "shape_coloring" },
      { id: "p4_8", type: "double_color" },
      { id: "p4_9", type: "space_station_drag" },
      { id: "p4_10", type: "color_sudoku" },
      { id: "p4_11", type: "reward", content: "颜色王国终极挑战达标！" }
    ]
  },
  {
    id: "c5",
    title: "第五课：辨形知思 (几何形状宇宙)",
    pages: [
      { id: "p5_1", type: "shape_intro" },
      { id: "p5_2", type: "shape_level_grid" },
      { id: "p5_3", type: "shape_track_selector" },
      { id: "p5_4", type: "shape_forest_search" },
      { id: "p5_5", type: "shape_magic_chest" },
      { id: "p5_6", type: "shape_animal_connect" },
      { id: "p5_7", type: "shape_coloring_canvas" },
      { id: "p5_8", type: "shape_building_blocks" },
      { id: "p5_9", type: "shape_sudoku" },
      { id: "p5_10", type: "reward", content: "形状王国终极挑战达标！" }
    ]
  },
  {
    id: "c6",
    title: "小布米配合上课（动作枚举）",
    pages: [
      { id: "b0", type: "robot_explain", content: "上课前先点底部「外联小布米」，再点准备。", robotEvent: { action: "SWITCH", duration: 3000 } },
      { id: "b1", type: "robot_practice", content: "挥手打招呼 👋", robotEvent: { action: "SWING", duration: 3500 } },
      { id: "b2", type: "robot_practice", content: "握手交朋友 🤝", robotEvent: { action: "SHAKE", duration: 3500 } },
      { id: "b3", type: "robot_practice", content: "欢呼庆祝 🎉", robotEvent: { action: "CHEER", duration: 3500 } },
      { id: "b16", type: "robot_practice", content: "擦眼泪 😢", robotEvent: { action: "TEAR", duration: 3500 } },
      { id: "b17", type: "robot_explain", content: "安全停止", robotEvent: { action: "DEFAULT", duration: 1500 } },
      { id: "b5", type: "robot_explain", content: "使能（已在使能/准备时不会重复发送）", robotEvent: { action: "START", duration: 2000 } },
      { id: "b12", type: "robot_explain", content: "起身 ⚠️ 需平坦地面、有人在旁", robotEvent: { action: "FALLTOSTAND", duration: 8000 } },
      { id: "b0w", type: "robot_explain", content: "慢走 ⚠️ 周围留空", robotEvent: { action: "WALK", duration: 3000 } },
      { id: "b13", type: "robot_explain", content: "躺下 ⚠️", robotEvent: { action: "STANDTOFALL", duration: 6000 } },
      { id: "b11", type: "robot_explain", content: "舞蹈1 ⚠️ 需足够空间", robotEvent: { action: "DANCE", duration: 8000 } },
      { id: "b14", type: "robot_explain", content: "舞蹈2 ⚠️", robotEvent: { action: "DANCE1", duration: 8000 } },
      { id: "b15", type: "robot_explain", content: "舞蹈3 ⚠️", robotEvent: { action: "DANCE2", duration: 8000 } },
      { id: "b7", type: "robot_explain", content: "开始示教", robotEvent: { action: "STARTTEACH", duration: 2000 } },
      { id: "b8", type: "robot_explain", content: "保存示教", robotEvent: { action: "SAVETEACH", duration: 2000 } },
      { id: "b10", type: "robot_explain", content: "播放示教", robotEvent: { action: "PLAYTEACH", duration: 4000 } },
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


const playAudio = (text: string, lang: string = 'zh-CN') => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1;
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
  const [robotHint, setRobotHint] = useState('未连接 · 请先开 bumi_server.py');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [dockMore, setDockMore] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const connectedRef = useRef(false);
  const c4SwitchSent = useRef(false);
  const rewardCued = useRef(false);
  const sendQuietRef = useRef<(action: string) => Promise<unknown>>(async () => {});
  const cuerRef = useRef<ReturnType<typeof createBumiCuer> | null>(null);

  const activeCourse = mockData.find(c => c.id === activeCourseId) as any;
  const currentPage = activeCourse?.pages[currentPageIdx] as any;

  // Initialize Canvas
  useEffect(() => {
    if (activeCourseId && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#3b82f6'; // Default pen color
        }

        const handleResize = () => {
            const container = containerRef.current;
            if (canvas && container) {
                const temp = ctx?.getImageData(0, 0, canvas.width, canvas.height);
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
                if (temp && ctx) {
                    ctx.putImageData(temp, 0, 0);
                    // Re-set styles as they are lost on resize
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = drawMode === 'eraser' ? '#000000' : '#3b82f6';
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }
  }, [activeCourseId]);

  // Update canvas state based on drawMode
  useEffect(() => {
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            if (drawMode === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = 20;
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#3b82f6';
            }
        }
    }
  }, [drawMode]);

  const startDrawing = (e: React.PointerEvent) => {
    if (drawMode === 'none') return;
    isDrawingRef.current = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
        lastPosRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || drawMode === 'none' || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    if (ctx && rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastPosRef.current = { x, y };
    }
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }
  };

  // --- Actions ---
  const handleConnectRobot = async () => {
    if (isRobotConnected) {
      setIsRobotConnected(false);
      setRobotHint('已断开');
      return;
    }
    try {
      const s = await bumiState();
      if (!s.ok) throw new Error('bumi_server 未就绪');
      setIsRobotConnected(true);
      setRobotHint(
        s.connected
          ? `已连接 ${bumiBaseUrl()} · Mode ${s.mode} (${s.mode_name || '?'}) · ${s.battery}%`
          : `服务在 ${bumiBaseUrl()}，机器人离线`
      );
    } catch (e: any) {
      setIsRobotConnected(false);
      alert(`连不上小布米。\n请在上课电脑运行: python scripts\\bumi_server.py\n默认地址 ${bumiBaseUrl()}\n${e?.message || e}`);
    }
  };

  const sendBumi = async (action: string | number) => {
    const meta = BUMI_ACTIONS.find(
      (a) => a.id === String(action).toLowerCase() || a.code === Number(action) || a.id.toUpperCase() === String(action)
    );
    if (meta?.danger && !confirm(`危险动作「${meta.name}」：地面平整、周围留空、有人在旁？`)) return null;
    const data = await bumiCmd(action);
    setRobotHint(
      `已发 ${meta?.name || action} · mode=${data.mode ?? '?'} ${data.ok ? '' : (data.error || '')}`
    );
    return data;
  };

  connectedRef.current = isRobotConnected;
  sendQuietRef.current = async (action: string) => {
    const data = await bumiCmd(action);
    const meta = BUMI_ACTIONS.find(
      (a) => a.id === action || a.id.toUpperCase() === action
    );
    setRobotHint(`课件 ${meta?.name || action} · mode=${data.mode ?? '?'}`);
    return data;
  };
  if (!cuerRef.current) {
    cuerRef.current = createBumiCuer(
      () => connectedRef.current,
      (action) => sendQuietRef.current(action)
    );
  }
  const { cue, cueColor, cueFail, cueWin } = cuerRef.current;

  useEffect(() => {
    if (activeCourseId === 'c4' && isRobotConnected && !c4SwitchSent.current) {
      c4SwitchSent.current = true;
      cue('switch', 0);
    }
    if (activeCourseId !== 'c4') c4SwitchSent.current = false;
  }, [activeCourseId, isRobotConnected, cue]);

  useEffect(() => {
    if (activeCourseId === 'c4' && currentPage?.type === 'reward' && isRobotConnected) {
      if (!rewardCued.current) {
        rewardCued.current = true;
        cue('cheer', 0);
      }
    } else if (currentPage?.type !== 'reward') {
      rewardCued.current = false;
    }
  }, [activeCourseId, currentPageIdx, isRobotConnected, currentPage?.type, cue]);

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

  const triggerRobotAction = async () => {
    if (robotStatus === 'executing' || !currentPage?.robotEvent) return;
    if (!isRobotConnected) {
       alert("请先在底部栏点击「外联小布米」！");
       return;
    }

    setRobotStatus('executing');
    try {
      await sendBumi(currentPage.robotEvent.action);
    } catch (e: any) {
      setRobotStatus('idle');
      alert(`指令发送失败: ${e?.message || e}\n确认 bumi_server.py 已开，且本页允许访问 127.0.0.1:9550`);
      return;
    }

    setTimeout(() => {
      setRobotStatus('done');
      if (currentPage.type !== 'robot_test') {
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
          
          {/* Drawing Canvas Overlay */}
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className={`absolute inset-0 z-40 touch-none ${drawMode === 'none' ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
          />

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

              {currentPage.type === 'color_intro' && (
                 <ColorIntroScene onComplete={() => { cue('swing'); setCurrentPageIdx(1); }} />
              )}

              {currentPage.type === 'level_grid' && (
                 <LessonSelectorGrid onSelectLesson={(num) => {
                    if (num === '02') {
                       setActiveCourseId('c5');
                       setCurrentPageIdx(0);
                    } else {
                       setCurrentPageIdx(2);
                    }
                 }} />
              )}

              {currentPage.type === 'track_selector' && (
                 <SubLessonSelector 
                    onBack={() => setCurrentPageIdx(1)} 
                    onSelectTrack={(track) => {
                       if (track === 'camp') {
                          cue('swing');
                          setCurrentPageIdx(3);
                       } else {
                          cue('cheer');
                          setCurrentPageIdx(8);
                       }
                    }} 
                 />
              )}

              {currentPage.type === 'forest_search' && (
                 <ForestSearchGame onPlay={() => cue('switch')} onEnded={() => cueWin()} />
              )}

              {currentPage.type === 'color_prep' && (
                 <ColorPrepGame onItemReady={() => cue('swing')} onAllReady={() => cueWin()} />
              )}

              {currentPage.type === 'treasure_chest' && (
                 <TreasureBoxGame onSort={cueColor} onFail={cueFail} onComplete={cueWin} />
              )}

              {currentPage.type === 'animal_connect' && (
                 <AnimalConnectGame onSort={cueColor} onFail={cueFail} onComplete={cueWin} />
              )}

              {currentPage.type === 'shape_coloring' && (
                 <ShapeColoringGame onSort={cueColor} onFail={cueFail} onComplete={cueWin} />
              )}

              {currentPage.type === 'double_color' && (
                 <DoubleColorGame onMatch={() => cue('shake')} onFail={cueFail} onComplete={cueWin} />
              )}

              {currentPage.type === 'space_station_drag' && (
                 <SpaceStationDragGame onCellOk={(c) => cueColor(c, 4000)} onComplete={cueWin} />
              )}

              {currentPage.type === 'color_sudoku' && (
                 <ColorSudokuGame onFail={cueFail} onComplete={cueWin} />
              )}

              {/* LESSON 02 SHAPE WORLD INTERACTIVE PAGES */}
              {currentPage.type === 'shape_intro' && (
                 <ShapeIntroScene onComplete={() => setCurrentPageIdx(1)} />
              )}

              {currentPage.type === 'shape_level_grid' && (
                 <ShapeLessonSelectorGrid onSelectLesson={(num) => {
                    if (num === '01') {
                       setActiveCourseId('c4');
                       setCurrentPageIdx(0);
                    } else {
                       setCurrentPageIdx(2);
                    }
                 }} />
              )}

              {currentPage.type === 'shape_track_selector' && (
                 <ShapeSubLessonSelector 
                    onBack={() => setCurrentPageIdx(1)} 
                    onSelectTrack={(track) => {
                       if (track === 'camp') {
                          setCurrentPageIdx(3);
                       } else {
                          setCurrentPageIdx(7);
                       }
                    }} 
                 />
              )}

              {currentPage.type === 'shape_forest_search' && (
                 <ShapeForestSearchGame />
              )}

              {currentPage.type === 'shape_magic_chest' && (
                 <ShapeMagicChestGame />
              )}

              {currentPage.type === 'shape_animal_connect' && (
                 <ShapeAnimalConnectGame />
              )}

              {currentPage.type === 'shape_coloring_canvas' && (
                 <ShapeColoringCanvas />
              )}

              {currentPage.type === 'shape_building_blocks' && (
                 <ShapeBuildingBlocksGame />
              )}

              {currentPage.type === 'shape_sudoku' && (
                 <ShapeSudokuGame />
              )}

              {currentPage.type === 'slide_split' && (
                 <div className="w-full h-full bg-slate-50 flex flex-col md:flex-row relative">
                     {/* Media Area */}
                     <motion.div 
                         initial={{ x: -20, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         transition={{ duration: 0.6, ease: "easeOut" }}
                         className="w-full md:w-[60%] h-[50%] md:h-full bg-slate-900 flex items-center justify-center p-4 md:p-8 shrink-0 relative pointer-events-none"
                     >
                         {currentPage.mediaType === 'video' ? (
                             <div className="w-full h-full pointer-events-auto shadow-2xl rounded-2xl overflow-hidden bg-black">
                               <FlvVideoPlayer 
                                   src={currentPage.content} 
                                   videoRef={videoRef}
                                   onPlay={() => setIsVideoPlaying(true)}
                                   onPause={() => setIsVideoPlaying(false)}
                               />
                             </div>
                         ) : (
                             <img src={currentPage.content} alt="slide media" className="w-full h-full object-contain pointer-events-auto scale-95 hover:scale-100 transition-transform duration-500" draggable={false} />
                         )}
                     </motion.div>
                     {/* Text Area */}
                     <motion.div 
                         initial={{ x: 20, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                         className="flex-1 p-8 md:p-16 flex flex-col justify-center relative z-50 pointer-events-auto bg-white border-l border-slate-200 shadow-2xl"
                     >
                         <motion.h1 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-4xl md:text-5xl font-black text-blue-600 mb-8 tracking-tight"
                         >
                            {currentPage.title}
                         </motion.h1>
                         <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="text-2xl text-slate-700 leading-relaxed whitespace-pre-wrap font-medium"
                         >
                            {currentPage.text}
                         </motion.div>
                         <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="mt-12 flex"
                         >
                           <button 
                               onClick={() => playAudio(currentPage.text || "", 'zh-CN')}
                               className="flex items-center gap-3 bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-full transition active:scale-95 border border-blue-200"
                           >
                               <Play size={20} className="fill-current" />
                               <span className="font-bold text-lg">语音朗读</span>
                           </button>
                         </motion.div>
                     </motion.div>
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

        {/* Bumi action dock — classroom safe by default; danger/teach behind 「更多」 */}
        {isRobotConnected && (
          <div className="bg-slate-950 border-t border-slate-800 px-3 py-2 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-emerald-400 tracking-wider">
                {dockMore
                  ? 'BUMI · 全部动作（橙=危险，需确认）'
                  : 'BUMI · 课堂安全：准备 挥手 握手 欢呼 擦泪 停止'}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[40%]">{robotHint}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {(dockMore ? BUMI_ACTIONS : BUMI_ACTIONS.filter((a) => BUMI_CLASSROOM_SAFE.includes(a.id))).map((a) => (
                <button
                  key={a.code}
                  title={`${a.code}=${a.name}`}
                  onClick={() => sendBumi(a.id).catch((e) => alert(e?.message || e))}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold border transition
                    ${a.danger ? 'border-orange-800/80 bg-orange-950/40 text-orange-200 hover:bg-orange-900/50' : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                >
                  {a.code} {a.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDockMore((v) => !v)}
                className="px-2 py-1 rounded-md text-[11px] font-bold border border-slate-600 bg-slate-900 text-slate-300 hover:bg-slate-800 flex items-center gap-1"
              >
                <ChevronsUpDown size={12} />
                {dockMore ? '收起' : '更多'}
              </button>
            </div>
          </div>
        )}

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
             <ToolBtn icon={Play} label="视频播放" onClick={() => toggleVideoPlayback(true)} disabled={(currentPage.type !== 'normal_video' && !(currentPage.type === 'slide_split' && currentPage.mediaType === 'video')) || isVideoPlaying} />
             <ToolBtn icon={Pause} label="视频暂停" onClick={() => toggleVideoPlayback(false)} disabled={(currentPage.type !== 'normal_video' && !(currentPage.type === 'slide_split' && currentPage.mediaType === 'video')) || !isVideoPlaying} />
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
