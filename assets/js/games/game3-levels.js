// Simple levels for Game3 (Block Builder)
window.Game3Levels = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'Simple pieces to learn snapping and rotation.',
    palette: [ {w:3,h:1}, {w:2,h:1}, {w:2,h:2}, {w:1,h:1} ]
  },
  {
    id: 'skew',
    title: 'Skew Puzzle',
    description: 'Tighter fit, try rotating one piece to complete the layout.',
    palette: [ {w:3,h:1}, {w:1,h:3,rotated:true}, {w:2,h:2}, {w:1,h:1}, {w:2,h:1} ]
  },
  {
    id: 'mini-challenge',
    title: 'Mini Challenge',
    description: 'A compact set for a quick test.',
    palette: [ {w:2,h:2}, {w:1,h:2}, {w:1,h:1}, {w:1,h:1} ]
  }
];
