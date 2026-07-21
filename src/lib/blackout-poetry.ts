/**
 * Blackout Poetry Engine — word suggestion + image export utilities
 */
import { toPng } from 'html-to-image';

/* ── Part-of-Speech dictionary for suggestions ── */

const NOUNS = new Set([
  'time', 'way', 'year', 'work', 'life', 'day', 'world', 'man', 'part', 'child',
  'eye', 'woman', 'place', 'hand', 'water', 'night', 'sun', 'light', 'love', 'heart',
  'fire', 'wind', 'tree', 'flower', 'sea', 'star', 'moon', 'sky', 'dream', 'song',
  'bird', 'river', 'mountain', 'rain', 'snow', 'leaf', 'voice', 'face', 'soul', 'hope',
  'mind', 'room', 'door', 'road', 'city', 'earth', 'home', 'friend', 'smile', 'tear',
  'shadow', 'silence', 'moment', 'memory', 'thought', 'feeling', 'power', 'story', 'word', 'name',
  'morning', 'evening', 'summer', 'winter', 'spring', 'fall', 'ocean', 'field', 'garden', 'stone',
  'bridge', 'path', 'forest', 'meadow', 'dawn', 'dusk', 'thunder', 'cloud', 'breeze', 'wave',
  'rose', 'lily', 'willow', 'oak', 'brook', 'stream', 'valley', 'horizon', 'echo', 'flame',
  'darkness', 'light', 'secret', 'journey', 'spirit', 'passion', 'grace', 'beauty', 'truth', 'peace',
  'joy', 'sorrow', 'wonder', 'magic', 'music', 'dance', 'kiss', 'touch', 'breath', 'whisper',
  'crown', 'sword', 'mirror', 'candle', 'lantern', 'feather', 'crystal', 'pearl', 'diamond', 'gold',
  'silver', 'copper', 'bell', 'drum', 'harp', 'flute', 'lute', 'scroll', 'letter', 'book',
  'crown', 'throne', 'castle', 'tower', 'cave', 'island', 'shore', 'beach', 'cliff', 'desert',
  'prairie', 'tundra', 'jungle', 'swamp', 'lake', 'pond', 'well', 'fountain', 'glacier', 'volcano',
  'cottage', 'palace', 'hut', 'tent', 'ship', 'boat', 'chest', 'box', 'key', 'lock',
  'armor', 'shield', 'arrow', 'bow', 'spear', 'ring', 'chain', 'rope', 'net', 'wheel',
  'hourglass', 'clock', 'compass', 'map', 'globe', 'telescope', 'microscope', 'chalice', 'grail', 'orb',
]);

const VERBS = new Set([
  'be', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does',
  'say', 'said', 'go', 'went', 'come', 'came', 'know', 'knew', 'think', 'thought',
  'take', 'took', 'see', 'saw', 'feel', 'felt', 'make', 'made', 'find', 'found',
  'give', 'gave', 'tell', 'told', 'become', 'became', 'leave', 'left', 'put', 'bring',
  'brought', 'begin', 'began', 'keep', 'kept', 'hold', 'held', 'write', 'wrote', 'stand',
  'stood', 'hear', 'heard', 'let', 'mean', 'meant', 'set', 'meet', 'met', 'pay', 'paid',
  'sit', 'sat', 'speak', 'spoke', 'lie', 'lay', 'lead', 'led', 'read', 'grow', 'grew',
  'lose', 'lost', 'fall', 'fell', 'send', 'sent', 'build', 'built', 'understand', 'understood',
  'draw', 'drew', 'break', 'broke', 'spend', 'spent', 'cut', 'rise', 'rose', 'drive', 'drove',
  'buy', 'bought', 'wear', 'wore', 'choose', 'chose', 'seek', 'sought', 'fly', 'flew',
  'dance', 'sing', 'sang', 'dream', 'wonder', 'wander', 'linger', 'gaze', 'stare', 'glance',
  'shine', 'shone', 'glow', 'fade', 'melt', 'flow', 'drift', 'float', 'sail', 'soar',
  'weep', 'laugh', 'smile', 'frown', 'sigh', 'breathe', 'whisper', 'shout', 'call', 'cry',
  'kiss', 'touch', 'reach', 'climb', 'leap', 'jump', 'run', 'walk', 'creep', 'crawl',
  'sleep', 'slumber', 'awake', 'arise', 'awaken', 'remember', 'forget', 'forgive', 'love', 'hate',
  'desire', 'long', 'yearn', 'crave', 'wish', 'hope', 'fear', 'dread', 'dare', 'brave',
  'gleam', 'sparkle', 'flash', 'blaze', 'burn', 'flicker', 'shiver', 'tremble', 'quake', 'shake',
  'create', 'form', 'shape', 'mold', 'forge', 'craft', 'weave', 'spin', 'knit', 'sew',
]);

const ADJECTIVES = new Set([
  'old', 'good', 'new', 'young', 'great', 'little', 'own', 'last', 'long', 'small',
  'few', 'different', 'large', 'next', 'early', 'important', 'public', 'bad', 'same', 'able',
  'bright', 'dark', 'deep', 'cold', 'warm', 'hot', 'sweet', 'bitter', 'silent', 'loud',
  'soft', 'hard', 'smooth', 'rough', 'wild', 'tame', 'free', 'bound', 'open', 'closed',
  'empty', 'full', 'vast', 'narrow', 'wide', 'high', 'low', 'near', 'far', 'distant',
  'gentle', 'fierce', 'brave', 'timid', 'proud', 'humble', 'wise', 'foolish', 'kind', 'cruel',
  'fair', 'foul', 'pure', 'tainted', 'sacred', 'profane', 'holy', 'divine', 'mortal', 'eternal',
  'ancient', 'modern', 'timeless', 'endless', 'infinite', 'boundless', 'limitless', 'fleeting', 'fragile', 'strong',
  'weak', 'frail', 'mighty', 'grand', 'majestic', 'noble', 'royal', 'humble', 'meek', 'bold',
  'daring', 'fearless', 'careful', 'reckless', 'patient', 'eager', 'keen', 'sharp', 'dull', 'blunt',
  'keen', 'quick', 'slow', 'swift', 'sluggish', 'lively', 'dead', 'alive', 'awake', 'aware',
  'blind', 'deaf', 'mute', 'hidden', 'secret', 'mystic', 'magic', 'enchanted', 'cursed', 'blessed',
  'lonely', 'alone', 'together', 'apart', 'close', 'distant', 'dear', 'beloved', 'precious', 'rare',
  'common', 'strange', 'weird', 'odd', 'queer', 'curious', 'wondrous', 'marvelous', 'splendid', 'glorious',
  'radiant', 'brilliant', 'dim', 'faint', 'pale', 'vivid', 'colorful', 'dull', 'drab', 'gray',
  'golden', 'silvery', 'crystal', 'icy', 'fiery', 'stormy', 'calm', 'tranquil', 'turbulent', 'still',
]);

const ADVERBS = new Set([
  'slowly', 'quickly', 'softly', 'gently', 'quietly', 'loudly', 'brightly', 'dimly', 'warmly', 'coldly',
  'always', 'never', 'often', 'seldom', 'rarely', 'sometimes', 'usually', 'already', 'soon', 'now',
  'here', 'there', 'everywhere', 'somewhere', 'nowhere', 'above', 'below', 'beneath', 'beyond', 'within',
  'without', 'inside', 'outside', 'upward', 'downward', 'forward', 'backward', 'ahead', 'behind', 'afar',
  'together', 'apart', 'alone', 'only', 'just', 'even', 'ever', 'still', 'yet', 'already',
  'truly', 'surely', 'certainly', 'perhaps', 'maybe', 'probably', 'possibly', 'hardly', 'barely', 'scarcely',
  'nearly', 'almost', 'quite', 'very', 'too', 'so', 'rather', 'fairly', 'pretty', 'really',
  'deeply', 'greatly', 'highly', 'strongly', 'firmly', 'slowly', 'rapidly', 'swiftly', 'suddenly', 'gradually',
  'easily', 'freely', 'clearly', 'plainly', 'vividly', 'faintly', 'dimly', 'brightly', 'brilliantly', 'radiantly',
  'sweetly', 'bitterly', 'sadly', 'happily', 'joyfully', 'merrily', 'gaily', 'gravely', 'seriously', 'lightly',
  'heavily', 'tenderly', 'fiercely', 'wildly', 'madly', 'passionately', 'eagerly', 'anxiously', 'calmly', 'peacefully',
  'restlessly', 'wearily', 'wearily', 'silently', 'secretly', 'openly', 'boldly', 'shyly', 'proudly', 'humbly',
  'wisely', 'foolishly', 'rightly', 'wrongly', 'justly', 'unjustly', 'perfectly', 'imperfectly', 'completely', 'partly',
  'wholly', 'fully', 'half', 'doubly', 'singly', 'specially', 'especially', 'particularly', 'generally', 'universally',
  'eternally', 'forever', 'endlessly', 'ceaselessly', 'constantly', 'continually', 'continuously', 'repeatedly', 'again', 'once',
  'twice', 'thrice', 'first', 'last', 'finally', 'initially', 'originally', 'ultimately', 'eventually', 'instantly',
]);

/** Check if a word is "content-bearing" (noun, verb, adjective, or adverb) */
function isContentWord(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return false;
  return NOUNS.has(clean) || VERBS.has(clean) || ADJECTIVES.has(clean) || ADVERBS.has(clean);
}

/** Split text into word-level tokens, keeping punctuation attached */
export function splitIntoWords(text: string): string[] {
  return text.split(/(\s+|[.,;!?"']+)/).filter((t) => t.length > 0);
}

/** Build a unique word index map — each non-whitespace, non-pure-punctuation token gets an index */
export function buildWordIndexMap(tokens: string[]): number[] {
  let wordIdx = 0;
  return tokens.map((token) => {
    if (/^\s+$/.test(token)) return -1;
    if (/^[.,;!?"']+$/.test(token)) return -1;
    const idx = wordIdx;
    wordIdx++;
    return idx;
  });
}

/** Suggest words to keep based on part-of-speech analysis */
export function suggestWords(text: string): number[] {
  const tokens = splitIntoWords(text);
  const wordMap = buildWordIndexMap(tokens);
  const maxWordIndex = Math.max(...wordMap.filter((i) => i >= 0), -1) + 1;

  if (maxWordIndex === 0) return [];

  // Collect all content word indices
  const contentIndices: number[] = [];
  const seen = new Set<number>();

  tokens.forEach((token, i) => {
    const wIdx = wordMap[i];
    if (wIdx < 0 || seen.has(wIdx)) return;
    if (isContentWord(token)) {
      contentIndices.push(wIdx);
      seen.add(wIdx);
    }
  });

  if (contentIndices.length === 0) return [];

  // Select ~15-20% of content words, at least a few
  const targetCount = Math.max(3, Math.floor(contentIndices.length * 0.18));

  // Shuffle deterministically (Fisher-Yates with a simple seed)
  const shuffled = [...contentIndices];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (i * 7 + 13) % (i + 1); // simple deterministic shuffle
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, targetCount).sort((a, b) => a - b);
}

/** Get the CSS class for a given blackout style */
export function getBlackoutClass(style: string): string {
  switch (style) {
    case 'solid':
      return 'blackout-solid';
    case 'scribble':
      return 'blackout-scribble';
    case 'highlight':
      return 'blackout-highlight';
    case 'pattern':
      return 'blackout-pattern';
    case 'fade':
      return 'blackout-fade';
    default:
      return 'blackout-solid';
  }
}

/** Default poem text (public domain — excerpt from The Road Not Taken by Robert Frost) */
export const DEFAULT_SOURCE_TEXT = `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;

Then took the other, as just as fair,
And having perhaps the better claim,
Because it was grassy and wanted wear;
Though as for that the passing there
Had worn them really about the same,

And both that morning equally lay
In leaves no step had trodden black.
Oh, I kept the first for another day!
Yet knowing how way leads on to way,
I doubted if I should ever come back.

I shall be telling this with a sigh
Somewhere ages and ages hence:
Two roads diverged in a wood, and I—
I took the one less traveled by,
And that has made all the difference.`;

/** Export the final poem as a high-resolution PNG */
export async function exportPoemAsImage(
  elementRef: HTMLElement,
  title: string
): Promise<string> {
  const exportContainer = document.createElement('div');
  exportContainer.style.position = 'fixed';
  exportContainer.style.top = '-9999px';
  exportContainer.style.left = '-9999px';
  exportContainer.style.width = '1200px';
  exportContainer.style.padding = '60px';
  exportContainer.style.backgroundColor = '#ffffff';
  exportContainer.style.fontFamily = 'Georgia, serif';
  exportContainer.style.color = '#1a1a1a';

  // Clone the content
  const contentClone = elementRef.cloneNode(true) as HTMLElement;

  // Add title if provided
  if (title) {
    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.style.fontSize = '28px';
    titleEl.style.fontWeight = 'bold';
    titleEl.style.textAlign = 'center';
    titleEl.style.marginBottom = '40px';
    titleEl.style.fontFamily = 'Georgia, serif';
    titleEl.style.color = '#1a1a1a';
    exportContainer.appendChild(titleEl);
  }

  const bodyEl = document.createElement('div');
  bodyEl.style.fontSize = '18px';
  bodyEl.style.lineHeight = '2';
  bodyEl.style.whiteSpace = 'pre-wrap';

  // Copy over the styled spans
  bodyEl.innerHTML = contentClone.innerHTML;
  exportContainer.appendChild(bodyEl);

  document.body.appendChild(exportContainer);

  try {
    const dataUrl = await toPng(exportContainer, {
      quality: 1.0,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
    });
    return dataUrl;
  } finally {
    document.body.removeChild(exportContainer);
  }
}
