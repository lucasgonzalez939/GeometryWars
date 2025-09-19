// Shared Sound helper using WebAudio
(function(){
  let ctx = null;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { ctx = null; }
    }
    return ctx;
  }
  function beep(freq, duration, type='sine', volume=0.05) {
    const a = ensure();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = volume;
    o.connect(g); g.connect(a.destination);
    o.start();
    setTimeout(() => { o.stop(); }, duration);
  }

  window.Sound = {
    play: function(name) {
      switch(name) {
        case 'success': beep(880, 120, 'sine', 0.06); break;
        case 'wrong': beep(240, 160, 'sawtooth', 0.06); break;
        case 'miss': beep(160, 220, 'square', 0.08); break;
        default: beep(440, 80, 'sine', 0.04); break;
      }
    }
  };
})();
