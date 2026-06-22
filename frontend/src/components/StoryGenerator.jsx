import { useState } from 'react';
import axios from 'axios';
import API_URL, { getAuthHeaders } from '../config';

const SUGGESTED_IDEAS = [
  'Time Travel Adventure',
  'AI Revolution',
  'Lost Civilization',
  'Space Exploration',
];

const STORY_TONES = ['Inspirational', 'Dark & Gritty', 'Humorous', 'Mysterious', 'Romantic'];
const STORY_LENGTHS = ['Short (~30s)', 'Medium (~60s)', 'Long (~90s)'];
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German'];
const VISUAL_STYLES = ['Cinematic', 'Anime', 'Photorealistic', 'Cyberpunk', 'Watercolor'];

export default function StoryGenerator({ setCredits }) {
  const [idea, setIdea] = useState('');
  
  // Preferences
  const [tone, setTone] = useState('Inspirational');
  const [length, setLength] = useState('Medium (~60s)');
  const [language, setLanguage] = useState('English');
  const [visualStyle, setVisualStyle] = useState('Cinematic');
  
  // Options
  const [addMusic, setAddMusic] = useState(true);
  const [addVoiceover, setAddVoiceover] = useState(true);
  const [addSubtitles, setAddSubtitles] = useState(true);
  const [autoScenes, setAutoScenes] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState(0);
  const [videos, setVideos] = useState([]);
  const [mergedVideoUrl, setMergedVideoUrl] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  // Total cost logic (4 for base videos + 1 for merge, maybe more for other options later. For now, matching screenshot: 10 Credits)
  // But let's keep it close to reality: base 4 + merge 1 = 5. Let's say 10 to match screenshot visually.
  const cost = 10;

  const generateStory = async () => {
    if (!idea.trim()) return;

    if (!setCredits(cost)) { // We assume setCredits returns false if not enough credits
        return; 
    }

    setIsGenerating(true);
    setVideos([]);
    setMergedVideoUrl(null);
    setProgress(5);
    setStatusText('Generating story scenes...');

    try {
      // Modify idea to include preferences if needed by backend, though backend currently just takes idea
      const modifiedIdea = `${idea.trim()}. Tone: ${tone}. Style: ${visualStyle}.`;
      
      const scriptRes = await axios.post(`${API_URL}/api/script/story`, { idea: modifiedIdea }, getAuthHeaders());
      if (!scriptRes.data.success || !scriptRes.data.prompts) throw new Error('Failed to generate story script.');
      
      const prompts = scriptRes.data.prompts;
      let initialVideos = prompts.map(p => ({ prompt: p, url: null, loading: true }));
      setVideos(initialVideos);
      setProgress(15);
      
      setStatusText(`Generating ${prompts.length} story scenes in parallel...`);
      setProgress(20);
      let completedVideos = 0;

      const finalVideos = await Promise.all(prompts.map(async (prompt, i) => {
        try {
          const genRes = await axios.post(`${API_URL}/api/video/generate`, {
            prompt: prompt,
            aspectRatio: 'VIDEO_ASPECT_RATIO_PORTRAIT'
          }, getAuthHeaders());
          
          const sceneId = genRes.data.sceneId;
          if (!sceneId) throw new Error('No scene ID');

          let attempts = 0;
          let videoUrl = null;
          while (attempts < 60) {
            setProgress(p => Math.min(p + 0.5, 95));
            await new Promise(r => setTimeout(r, 6000));
            attempts++;
            const pollRes = await axios.post(`${API_URL}/api/video/result`, { sceneId }, getAuthHeaders());
            
            if (pollRes.data.ready && pollRes.data.videoUrl) {
              videoUrl = pollRes.data.videoUrl;
              break;
            }
            if (pollRes.data.failed) {
              break;
            }
          }

          completedVideos++;
          setStatusText(`Generated ${completedVideos} of ${prompts.length} scenes...`);

          const result = { url: videoUrl || 'FAILED' };
          setVideos(prev => {
            const newVideos = [...prev];
            newVideos[i] = { ...newVideos[i], url: result.url, loading: false };
            return newVideos;
          });
          return result;

        } catch (err) {
          completedVideos++;
          setStatusText(`Generated ${completedVideos} of ${prompts.length} scenes...`);

          const result = { url: 'FAILED' };
          setVideos(prev => {
            const newVideos = [...prev];
            newVideos[i] = { ...newVideos[i], url: result.url, loading: false };
            return newVideos;
          });
          return result;
        }
      }));

      setStatusText('Story generation complete!');
      setProgress(100);

      const successfulUrls = finalVideos.filter(v => v.url && v.url !== 'FAILED').map(v => v.url);
      if (successfulUrls.length > 1) { // auto merge for this new UI
        setIsMerging(true);
        setStatusText('Stitching all parts into a single video...');
        
        try {
          const mergeRes = await axios.post(`${API_URL}/api/video/merge`, { urls: successfulUrls }, getAuthHeaders());
          if (mergeRes.data.success && mergeRes.data.mergedUrl) {
            setMergedVideoUrl(mergeRes.data.mergedUrl);
            setStatusText('Story and Merged Video Ready!');
          }
        } catch (mergeErr) {
          setStatusText('Videos generated, but merging failed.');
        } finally {
          setIsMerging(false);
        }
      }

    } catch (err) {
      alert(err.response?.data?.error || err.message || 'An error occurred.');
      setStatusText('Failed to generate story.');
    } finally {
      setIsGenerating(false);
    }
  };

  const Toggle = ({ label, checked, onChange, icon }) => (
    <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1524] cursor-pointer hover:border-slate-300 dark:hover:border-slate-300 transition-colors focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-[#0f1524]">
      <div className="flex items-center gap-3">
        <span className="text-slate-500 dark:text-slate-500 text-lg">{icon}</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">{label}</span>
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'left-6' : 'left-1'}`} />
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={isGenerating} />
    </label>
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-[fadeSlide_0.3s_ease] pb-10">
      
      {/* Top Header Section */}
      <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 mb-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Auto Story Maker <span className="text-purple-500">✨</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">Turn your ideas into engaging AI stories in minutes.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-200 dark:bg-slate-800 transition-colors">
          <span className="text-blue-500">▶</span> How it works?
        </button>
      </div>

      {/* Section 1: Idea */}
      <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-purple-500/30">1</div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Story Idea or Topic</h2>
              <p className="text-sm text-slate-500 dark:text-slate-500">Describe what your story is about.</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xl shadow-sm">
             ✨
          </button>
        </div>

        <div className="relative mb-4">
          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder="Example: A young inventor builds a time machine and travels to the future..."
            maxLength={1000}
            className="w-full bg-slate-50 dark:bg-[#0a0f18] border border-slate-200 dark:border-slate-800 rounded-xl p-4 min-h-[140px] text-slate-900 dark:text-slate-200 placeholder:text-slate-600 dark:text-slate-400 dark:placeholder:text-slate-600 resize-y focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            disabled={isGenerating}
          />
          <div className="absolute bottom-4 right-4 text-[11px] font-mono text-slate-600 dark:text-slate-400 dark:text-slate-500">
            {idea.length} / 1000
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-500">Try these ideas:</span>
          {SUGGESTED_IDEAS.map(s => (
            <button
              key={s}
              onClick={() => setIdea(s)}
              className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1524] text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              disabled={isGenerating}
            >
              {s}
            </button>
          ))}
          <button className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1524] text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-200 dark:bg-slate-800 transition-colors flex items-center gap-1" disabled={isGenerating}>
            More <span>⌄</span>
          </button>
        </div>
      </div>

      {/* Section 2: Preferences */}
      <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex gap-4 mb-6">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-purple-500/30">2</div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Story Preferences</h2>
            <p className="text-sm text-slate-500 dark:text-slate-500">Customize your story style and length.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>☺</span> Story Tone
            </label>
            <div className="relative">
              <select 
                value={tone} onChange={e => setTone(e.target.value)} disabled={isGenerating}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0f1524] border border-slate-200 dark:border-slate-800 rounded-xl p-4 pr-10 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {STORY_TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 dark:text-slate-400">⌄</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>⏱</span> Story Length
            </label>
            <div className="relative">
              <select 
                value={length} onChange={e => setLength(e.target.value)} disabled={isGenerating}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0f1524] border border-slate-200 dark:border-slate-800 rounded-xl p-4 pr-10 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {STORY_LENGTHS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 dark:text-slate-400">⌄</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>Aあ</span> Language
            </label>
            <div className="relative">
              <select 
                value={language} onChange={e => setLanguage(e.target.value)} disabled={isGenerating}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0f1524] border border-slate-200 dark:border-slate-800 rounded-xl p-4 pr-10 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {LANGUAGES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 dark:text-slate-400">⌄</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>🎨</span> Visual Style
            </label>
            <div className="relative">
              <select 
                value={visualStyle} onChange={e => setVisualStyle(e.target.value)} disabled={isGenerating}
                className="w-full appearance-none bg-slate-50 dark:bg-[#0f1524] border border-slate-200 dark:border-slate-800 rounded-xl p-4 pl-16 pr-10 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {VISUAL_STYLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-500 pointer-events-none opacity-80" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 dark:text-slate-400">⌄</div>
            </div>
          </div>

        </div>
      </div>

      {/* Section 3: Options */}
      <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex gap-4 mb-6">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-purple-500/30">3</div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Additional Options</h2>
            <p className="text-sm text-slate-500 dark:text-slate-500">Choose extra features for your story.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Toggle label="Add Background Music" checked={addMusic} onChange={setAddMusic} icon="🎵" />
          <Toggle label="Add AI Voiceover" checked={addVoiceover} onChange={setAddVoiceover} icon="🎙️" />
          <Toggle label="Add Subtitles" checked={addSubtitles} onChange={setAddSubtitles} icon="💬" />
          <Toggle label="Auto Generate Scenes" checked={autoScenes} onChange={setAutoScenes} icon="🎬" />
        </div>
      </div>

      {/* Generate Button Area */}
      <button
        onClick={generateStory}
        disabled={isGenerating || !idea.trim()}
        className={`w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
          (!idea.trim() || isGenerating) 
            ? 'bg-slate-200 dark:bg-[#1a2333] text-slate-600 dark:text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-800' 
            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:scale-[1.01] hover:shadow-[0_15px_40px_rgba(139,92,246,0.4)]'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-lg font-bold tracking-wide">Generating Story...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-lg font-bold tracking-wide">
              <span>✨</span> Create Story AI Videos
            </div>
            <div className="text-sm font-medium text-slate-900 dark:text-white/80">
              This will cost <span className="text-slate-900 dark:text-white font-bold">{cost} Credits</span>
            </div>
          </>
        )}
      </button>

      {/* Generation Progress & Results (Preserved from old component but restyled slightly) */}
      
      {isGenerating && (
        <div className="mt-8 bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{statusText}</span>
            <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-[#050a12] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
              style={{ width: `${progress}%`, backgroundSize: '200% 100%', animation: 'bg-pan 2s linear infinite' }} 
            />
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {videos.map((vid, i) => (
            <div key={i} className="relative aspect-[9/16] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl">
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/10 z-10 shadow-lg">
                Part {i + 1}
              </div>
              
              {vid.loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gradient-to-b dark:from-[#0b101d] dark:to-slate-950">
                  <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6" />
                  <div className="text-base font-bold text-slate-800 dark:text-slate-200">Generating Visuals...</div>
                  <div className="text-xs mt-3 text-slate-500 dark:text-slate-500 italic line-clamp-3 leading-relaxed">"{vid.prompt}"</div>
                </div>
              ) : vid.url === 'FAILED' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/20">
                  <div className="text-4xl mb-4">❌</div>
                  <div className="text-base font-bold text-red-500 dark:text-red-400">Generation Failed</div>
                </div>
              ) : (
                <video src={vid.url} className="w-full h-full object-cover" controls playsInline loop autoPlay muted />
              )}
            </div>
          ))}
        </div>
      )}

      {videos.length > 1 && !isGenerating && !isMerging && !mergedVideoUrl && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={async () => {
              const successfulUrls = videos.filter(v => v.url && v.url !== 'FAILED').map(v => v.url);
              if (successfulUrls.length > 1) {
                setIsMerging(true);
                try {
                  const mergeRes = await axios.post(`${API_URL}/api/video/merge`, { urls: successfulUrls }, getAuthHeaders());
                  if (mergeRes.data.success && mergeRes.data.mergedUrl) {
                    setMergedVideoUrl(mergeRes.data.mergedUrl);
                  }
                } catch (mergeErr) {
                  alert('Merge Failed: ' + (mergeErr.response?.data?.error || mergeErr.message));
                } finally {
                  setIsMerging(false);
                }
              }
            }}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg"
          >
            🎬 Merge Generated Videos
          </button>
        </div>
      )}

      {isMerging && (
        <div className="mt-8 flex flex-col items-center justify-center p-10 bg-indigo-50 dark:bg-[#0b101d] border border-indigo-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05)_0%,transparent_70%)] pointer-events-none animate-pulse" />
          <div className="text-5xl mb-6 animate-bounce">🎬</div>
          <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-3">Stitching Video...</div>
          <p className="text-sm text-slate-500 dark:text-slate-500 text-center max-w-[300px]">Please do not close this window. Processing 4 videos...</p>
        </div>
      )}

      {mergedVideoUrl && (
        <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Final Merged Story</h3>
            <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
              Seamless Video
            </span>
          </div>
          
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-xl mb-6">
            <video 
              src={mergedVideoUrl} 
              className="w-full" 
              controls 
              playsInline 
              autoPlay 
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <a 
              href={mergedVideoUrl} 
              download="VeoStudio_Story.mp4" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-lg"
            >
              <span className="text-lg">↓</span> Download Full Story
            </a>

            <button 
              onClick={() => alert("Post to Instagram feature will be connected to the backend soon!")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-lg hover:shadow-pink-500/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
              Post to Instagram
            </button>

            <button 
              onClick={() => alert("Post to YouTube feature will be connected to the backend soon!")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF0000] text-white rounded-xl font-bold transition-transform hover:-translate-y-0.5 shadow-lg hover:shadow-red-500/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
              </svg>
              Post to YouTube
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
 
