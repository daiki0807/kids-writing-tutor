import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, PenTool, CheckCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { kanaGroups, katakanaGroups, baseLines, baseCurves } from './tracingData';

const TracingApp = () => {
    const guideCanvasRef = useRef(null);
    const drawingCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Category state
    const [activeCategory, setActiveCategory] = useState('hiragana');
    // For character sections (lines, curves are single groups; kana has many groups)
    const [activeGroupIndex, setActiveGroupIndex] = useState(0);
    const [activeItemIndex, setActiveItemIndex] = useState(0);

    // Accordion state (which group is open in the sidebar)
    const [openAccordion, setOpenAccordion] = useState(0);

    const [feedback, setFeedback] = useState(null); // 'success' | 'try_again' | null

    // Helper to get current active item
    const getCurrentItem = () => {
        switch (activeCategory) {
            case 'lines': return baseLines[activeItemIndex] || baseLines[0];
            case 'curves': return baseCurves[activeItemIndex] || baseCurves[0];
            case 'hiragana': return { id: kanaGroups[activeGroupIndex].id + activeItemIndex, label: kanaGroups[activeGroupIndex].chars[activeItemIndex], text: kanaGroups[activeGroupIndex].chars[activeItemIndex] };
            case 'katakana': return { id: katakanaGroups[activeGroupIndex].id + activeItemIndex, label: katakanaGroups[activeGroupIndex].chars[activeItemIndex], text: katakanaGroups[activeGroupIndex].chars[activeItemIndex] };
            default: return baseLines[0];
        }
    };

    const currentModel = getCurrentItem();

    const categories = [
        { id: 'hiragana', label: 'ひらがな' },
        { id: 'katakana', label: 'カタカナ' },
        { id: 'lines', label: '直線' },
        { id: 'curves', label: '曲線' }
    ];

    // Canvas setup and drawing
    useEffect(() => {
        const guideCanvas = guideCanvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;
        const parent = guideCanvas.parentElement;

        const setupCanvas = () => {
            guideCanvas.width = parent.clientWidth;
            guideCanvas.height = parent.clientHeight;
            drawingCanvas.width = parent.clientWidth;
            drawingCanvas.height = parent.clientHeight;

            drawGuide(guideCanvas.getContext('2d'), guideCanvas.width, guideCanvas.height);
            clearDrawing();
        };

        setupCanvas();
        window.addEventListener('resize', setupCanvas);
        return () => window.removeEventListener('resize', setupCanvas);
    }, [activeCategory, activeGroupIndex, activeItemIndex]); // Redraw when active item changes

    const drawGuide = (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);

        // --- マス目の描画（十字の点線と外枠） ---
        ctx.save();
        const boxSize = Math.min(w, h) * 0.8; // 文字の枠のサイズ
        const offsetX = (w - boxSize) / 2;
        const offsetY = (h - boxSize) / 2;

        // 外側の枠線（実線）
        ctx.strokeStyle = '#d1d5db'; // gray-300
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, boxSize, boxSize);

        // 十字の補助線（点線）
        ctx.beginPath();
        // 縦線
        ctx.moveTo(w / 2, offsetY);
        ctx.lineTo(w / 2, offsetY + boxSize);
        // 横線
        ctx.moveTo(offsetX, h / 2);
        ctx.lineTo(offsetX + boxSize, h / 2);

        ctx.strokeStyle = '#e5e7eb'; // gray-200
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();
        // --- マス目の描画おわり ---

        if (currentModel.text) {
            ctx.font = `bold ${Math.min(w, h) * 0.6}px sans-serif`;
            ctx.fillStyle = '#e5e7eb';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(currentModel.text, w * 0.5, h * 0.5);
        } else if (currentModel.draw) {
            ctx.lineWidth = 15;
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.setLineDash([30, 20]);
            ctx.beginPath();
            currentModel.draw(ctx, w, h);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    };

    const clearDrawing = () => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFeedback(null);
    };

    const getCoordinates = (event) => {
        const canvas = drawingCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        if (event.touches && event.touches.length > 0) {
            return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
        }
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(true);
        setFeedback(null);
        const { x, y } = getCoordinates(e);
        const ctx = drawingCanvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 16;
        ctx.strokeStyle = '#3b82f6';
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        const ctx = drawingCanvasRef.current.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            const ctx = drawingCanvasRef.current.getContext('2d');
            ctx.closePath();
            setIsDrawing(false);
        }
    };

    const evaluateDrawing = () => {
        const guideCanvas = guideCanvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;
        const w = guideCanvas.width;
        const h = guideCanvas.height;

        const guideCtx = guideCanvas.getContext('2d');
        const drawingCtx = drawingCanvas.getContext('2d');

        const guideData = guideCtx.getImageData(0, 0, w, h).data;
        const drawingData = drawingCtx.getImageData(0, 0, w, h).data;

        let targetPixels = 0;
        let paintedPixels = 0;

        for (let i = 3; i < guideData.length; i += 4) {
            if (guideData[i] > 0) {
                targetPixels++;
                if (drawingData[i] > 0) {
                    paintedPixels++;
                }
            }
        }

        const coverage = targetPixels === 0 ? 0 : paintedPixels / targetPixels;

        // カバー率45%以上で合格に変更
        if (coverage >= 0.45) {
            setFeedback('success');
            setTimeout(() => setFeedback(null), 3000);
        } else {
            setFeedback('try_again');
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    // Helper renderer for the sidebar menus
    const renderSidebarMenu = () => {
        if (activeCategory === 'lines' || activeCategory === 'curves') {
            const items = activeCategory === 'lines' ? baseLines : baseCurves;
            return (
                <div className="flex flex-col gap-2">
                    {items.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveItemIndex(index)}
                            className={`p-3 rounded-xl font-bold text-center border-2 transition-all ${activeItemIndex === index
                                ? 'bg-amber-400 text-amber-900 border-amber-500 shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            );
        }

        // Hiragana / Katakana Accordion rendering
        const groups = activeCategory === 'hiragana' ? kanaGroups : katakanaGroups;

        return (
            <div className="flex flex-col gap-2">
                {groups.map((group, groupIndex) => {
                    const isOpen = openAccordion === groupIndex;
                    const isActiveGroup = activeGroupIndex === groupIndex;

                    return (
                        <div key={group.id} className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <button
                                onClick={() => setOpenAccordion(isOpen ? -1 : groupIndex)}
                                className={`p-3 flex justify-between items-center font-bold transition-colors ${isActiveGroup ? 'bg-amber-100 text-amber-900' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <span>{group.label}</span>
                                {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>

                            {isOpen && (
                                <div className="p-3 grid grid-cols-3 gap-2 bg-white">
                                    {group.chars.map((char, charIndex) => (
                                        <button
                                            key={char}
                                            onClick={() => {
                                                setActiveGroupIndex(groupIndex);
                                                setActiveItemIndex(charIndex);
                                            }}
                                            className={`h-12 rounded-lg font-bold text-lg border-2 flex items-center justify-center transition-all ${isActiveGroup && activeItemIndex === charIndex
                                                ? 'bg-amber-400 text-amber-900 border-amber-500 shadow-inner'
                                                : 'bg-white text-gray-600 border-gray-100 hover:border-amber-300 hover:bg-amber-50'
                                                }`}
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-sky-50 font-sans">
            <header className="bg-white shadow-sm p-4 flex items-center justify-between z-10 shrink-0">
                <h1 className="text-xl md:text-2xl font-bold text-sky-800 flex items-center gap-2">
                    <PenTool className="w-6 h-6 md:w-8 md:h-8 text-sky-500" />
                    なぞりかき れんしゅう
                </h1>
                <button
                    onClick={clearDrawing}
                    className="flex items-center gap-1 md:gap-2 px-3 py-2 md:px-4 md:py-2 bg-rose-100 text-rose-600 rounded-full font-bold hover:bg-rose-200 transition-colors text-sm md:text-base"
                >
                    <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">やりなおす</span>
                </button>
            </header>

            <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 md:p-4 gap-4">
                <aside className="w-full md:w-72 flex flex-col gap-3 shrink-0">
                    {/* Main Category Tabs */}
                    <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setActiveGroupIndex(0);
                                    setActiveItemIndex(0);
                                    setOpenAccordion(0); // Open first accordion by default
                                }}
                                className={`flex-1 py-2 text-sm md:text-base font-bold rounded-lg transition-all ${activeCategory === cat.id
                                    ? 'bg-sky-500 text-white shadow-md'
                                    : 'text-gray-500 hover:text-sky-600 hover:bg-sky-50'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Scrolling sub-menu Area */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20 md:pb-0">
                        {renderSidebarMenu()}
                    </div>
                </aside>

                {/* Drawing Area */}
                <div className="flex-1 relative bg-white rounded-3xl shadow-inner border-4 border-sky-100 min-h-[50vh]">

                    <canvas
                        ref={guideCanvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
                    />

                    <canvas
                        ref={drawingCanvasRef}
                        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        onTouchCancel={stopDrawing}
                    />

                    {feedback === 'success' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-300">
                            <div className="bg-white/95 p-6 md:p-8 rounded-full shadow-2xl flex flex-col items-center transform scale-110 border-4 border-green-400">
                                <CheckCircle className="w-16 h-16 md:w-24 md:h-24 text-green-500 mb-2 md:mb-4" />
                                <span className="text-2xl md:text-3xl font-black text-green-600">よくできました！</span>
                            </div>
                        </div>
                    )}

                    {feedback === 'try_again' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-300">
                            <div className="bg-white/95 p-6 md:p-8 rounded-full shadow-2xl flex flex-col items-center border-4 border-amber-400">
                                <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-amber-500 mb-2 md:mb-4" />
                                <span className="text-xl md:text-2xl font-bold text-amber-600">もうすこし なぞってみよう！</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={evaluateDrawing}
                        className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-green-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-lg md:text-xl shadow-lg border-b-4 border-green-700 hover:bg-green-400 hover:translate-y-1 hover:border-b-0 transition-all active:bg-green-600 z-20"
                    >
                        できた！
                    </button>
                </div>
            </main>
        </div>
    );
};

export default TracingApp;
