var colors = [
//'#3b4cc0',
// '#4155c8',
// '#475ed0',
// '#4d67d7',
// '#5470de',
// '#5a78e4',
// '#6181e9',
// '#6889ee',
// '#6f91f2',
// '#7699f6',
// '#7da0f9',
'#84a7fc',
'#8baefd',
'#92b4fe',
'#9abaff',
'#a1c0ff',
'#a8c5fe',
'#afcafc',
'#b6cefa',
'#bcd2f7',
'#c3d5f4',
'#c9d8ef',
'#cfdaeb',
// '#d5dbe6',
// '#dadce0',
// '#dfdbd9',
// '#e5d9d2',
'#e9d5ca',
'#edd1c2',
'#f1cdba',
'#f3c8b2',
'#f5c2aa',
'#f6bca2',
'#f7b699',
'#f7af91',
'#f7a789',
'#f5a081',
'#f49879',
'#f18f71',
'#ee8669',
// '#eb7d62',
// '#e7735a',
// '#e26953',
// '#dd5f4c',
// '#d75445',
// '#d1493e',
// '#ca3d38',
// '#c32f32',
// '#bc1c2c',
// '#b40426'
];

var buttons = document.getElementsByClassName("btn");
for (let i = 0; i < buttons.length; i++) {
    var random_color = colors[Math.floor(Math.random() * colors.length)];
    var random_color_hover = colors[Math.floor(Math.random() * colors.length)];
    buttons[i].style.backgroundColor = random_color;}

var jlg_btn = document.getElementsByClassName("jlg_btn");
for (let i = 0; i < buttons.length; i++) {
    var random_color = colors[Math.floor(Math.random() * colors.length)];
    var random_color_hover = colors[Math.floor(Math.random() * colors.length)];
    jlg_btn[i].style.backgroundColor = random_color;
}