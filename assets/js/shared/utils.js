// utils.js - small math and hit helpers
const Utils = {
  clamp: function(v, a, b) { return Math.max(a, Math.min(b, v)); },
  pointInRect: function(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  },
  rectsOverlap: function(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }
};
