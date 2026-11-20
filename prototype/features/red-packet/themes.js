const redPacketThemes = Object.freeze({
  red: {name:'Red', preview:'#fff0ec,#ffe3e6', scene:'#770b1a,#bf1d2b,#790c1d', sheet:'#fff6f0,#ffe4e6', card:'#e83443,#b5122b'},
  raya: {name:'Raya', preview:'#ecfbf2,#ddf5e8', scene:'#084534,#148657,#084534', sheet:'#f3fcf4,#daf5e8', card:'#169762,#086442'},
  deepavali: {name:'Deepavali', preview:'#f6eeff,#ffebd9', scene:'#2e105b,#6d269a,#2e105b', sheet:'#fff8f0,#f0e3ff', card:'#8849c8,#4f1987'},
  birthday: {name:'Birthday', preview:'#fff0f7,#f4efff', scene:'#6f1b50,#a93376,#67174e', sheet:'#fff7fc,#f8e6fa', card:'#c03e83,#90225e'},
  youapp: {name:'YouApp', preview:'#f4efff,#e9e0fb', scene:'#221052,#513095,#251056', sheet:'#fbf8ff,#eae0fa', card:'#754db4,#44238c'},
});

function redPacketTheme(value) {
  return Object.hasOwn(redPacketThemes, value) ? value : 'red';
}

function redPacketArt(theme, part, className = '') {
  return `<img class="${className}" src="../features/red-packet/art/${redPacketTheme(theme)}-${part}.svg" alt="" aria-hidden="true" draggable="false">`;
}

function redPacketThemeStyle(value) {
  const theme = redPacketThemes[redPacketTheme(value)];
  return `--rp-preview:linear-gradient(160deg,${theme.preview});--rp-scene:linear-gradient(160deg,${theme.scene});--rp-sheet:linear-gradient(180deg,${theme.sheet});--rp-card:linear-gradient(135deg,${theme.card})`;
}
