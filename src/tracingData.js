export const kanaGroups = [
  { id: 'a', label: 'あ行', chars: ['あ', 'い', 'う', 'え', 'お'] },
  { id: 'ka', label: 'か行', chars: ['か', 'き', 'く', 'け', 'こ'] },
  { id: 'sa', label: 'さ行', chars: ['さ', 'し', 'す', 'せ', 'そ'] },
  { id: 'ta', label: 'た行', chars: ['た', 'ち', 'つ', 'て', 'と'] },
  { id: 'na', label: 'な行', chars: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { id: 'ha', label: 'は行', chars: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
  { id: 'ma', label: 'ま行', chars: ['ま', 'み', 'む', 'め', 'も'] },
  { id: 'ya', label: 'や行', chars: ['や', 'ゆ', 'よ'] },
  { id: 'ra', label: 'ら行', chars: ['ら', 'り', 'る', 'れ', 'ろ'] },
  { id: 'wa', label: 'わ行', chars: ['わ', 'を', 'ん'] }
];

export const katakanaGroups = [
  { id: 'a', label: 'ア行', chars: ['ア', 'イ', 'ウ', 'エ', 'オ'] },
  { id: 'ka', label: 'カ行', chars: ['カ', 'キ', 'ク', 'ケ', 'コ'] },
  { id: 'sa', label: 'サ行', chars: ['サ', 'シ', 'ス', 'セ', 'ソ'] },
  { id: 'ta', label: 'タ行', chars: ['タ', 'チ', 'ツ', 'テ', 'ト'] },
  { id: 'na', label: 'ナ行', chars: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'] },
  { id: 'ha', label: 'ハ行', chars: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'] },
  { id: 'ma', label: 'マ行', chars: ['マ', 'ミ', 'ム', 'メ', 'モ'] },
  { id: 'ya', label: 'ヤ行', chars: ['ヤ', 'ユ', 'ヨ'] },
  { id: 'ra', label: 'ラ行', chars: ['ラ', 'リ', 'ル', 'レ', 'ロ'] },
  { id: 'wa', label: 'ワ行', chars: ['ワ', 'ヲ', 'ン'] }
];

export const baseLines = [
  { id: 'h-line', label: 'よこせん', draw: (ctx, w, h) => { ctx.moveTo(w*0.1, h*0.5); ctx.lineTo(w*0.9, h*0.5); } },
  { id: 'v-line', label: 'たてせん', draw: (ctx, w, h) => { ctx.moveTo(w*0.5, h*0.1); ctx.lineTo(w*0.5, h*0.9); } },
  { id: 'slash', label: 'ななめ', draw: (ctx, w, h) => { ctx.moveTo(w*0.2, h*0.8); ctx.lineTo(w*0.8, h*0.2); } },
];

export const baseCurves = [
  { id: 'wave', label: 'なみせん', draw: (ctx, w, h) => {
      ctx.moveTo(w*0.1, h*0.5);
      ctx.bezierCurveTo(w*0.3, h*0.1, w*0.5, h*0.9, w*0.7, h*0.5);
      ctx.bezierCurveTo(w*0.8, h*0.3, w*0.9, h*0.5, w*0.9, h*0.5);
  }},
  { id: 'circle', label: 'まる', draw: (ctx, w, h) => { ctx.arc(w*0.5, h*0.5, Math.min(w,h)*0.3, 0, Math.PI*2); } },
];
