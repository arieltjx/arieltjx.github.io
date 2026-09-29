(() => {
  'use strict';
  const canvas = document.querySelector('.ripple');
  const photo = document.querySelector('.backdrop-photo');
  if (!canvas || !photo || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) return;

  // Photo and controls are taken from each page's original Cargo backdrop.
  // The independent displacement renderer preserves the photograph's colors.
  const settings = document.body.classList.contains('works')
    ? { x: 12, y: 34, scale: 5.99, speed: 5.6, direction: 212, mouse: 34 }
    : { x: 41, y: 26, scale: 6.12, speed: 9.1, direction: 229, mouse: 90 };
  const vertex = 'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
  const fragment = `precision highp float;
uniform sampler2D photograph;
uniform vec2 resolution, imageSize, distortion, direction, pointer;
uniform float time, scale, pointerStrength;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.02+vec2(3.1,5.7);a*=.5;}return v;}
void main(){
  vec2 st=gl_FragCoord.xy/resolution;
  float screenAspect=resolution.x/resolution.y;
  vec2 p=(st-.5)*vec2(screenAspect,1.)*(scale*.35);
  vec2 travel=direction*time;
  vec2 q=vec2(fbm(p+travel),fbm(p+vec2(5.2,1.3)+travel*.8));
  vec2 r=vec2(fbm(p+2.5*q+vec2(1.7,9.2)+travel*.55),fbm(p+2.5*q+vec2(8.3,2.8)+travel*.5));
  vec2 displacement=(r-.5)*2.*distortion;
  vec2 away=(st-pointer)*vec2(screenAspect,1.);
  float distanceToPointer=length(away);
  float ripple=sin(distanceToPointer*28.-time*7.)*exp(-distanceToPointer*5.)*pointerStrength;
  displacement+=normalize(away+vec2(.0001))*ripple*.025;
  float imageAspect=imageSize.x/imageSize.y;
  vec2 crop=vec2(min(1.,screenAspect/imageAspect),min(1.,imageAspect/screenAspect));
  vec2 uv=(st+displacement-.5)*crop+.5;
  // Reflect the image at its edges instead of smearing edge pixels.
  uv=1.-abs(mod(uv,2.)-1.);
  gl_FragColor=texture2D(photograph,uv);
}`;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  }
  const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program,'position');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniform = name => gl.getUniformLocation(program,name);
  const size = uniform('resolution'), clock = uniform('time'), pointer = uniform('pointer'), strength = uniform('pointerStrength');
  const angle = settings.direction*Math.PI/180;
  gl.uniform2f(uniform('distortion'),settings.x/100,settings.y/100);
  gl.uniform2f(uniform('direction'),Math.cos(angle),Math.sin(angle));
  gl.uniform1f(uniform('scale'),settings.scale);
  gl.uniform2f(pointer,.5,.5); gl.uniform1f(strength,0);
  let ready = false, last = 0, pointerEnergy = 0, running = false;
  function resize() {
    canvas.width=Math.min(innerWidth*devicePixelRatio,1600);
    canvas.height=Math.round(canvas.width*innerHeight/innerWidth);
    gl.viewport(0,0,canvas.width,canvas.height); gl.uniform2f(size,canvas.width,canvas.height);
  }
  function render(milliseconds) {
    if (!ready || document.hidden) { running=false; return; }
    if (milliseconds-last>32) {
      gl.uniform1f(clock,milliseconds/1000*settings.speed*.018);
      gl.uniform1f(strength,pointerEnergy); pointerEnergy*=.97;
      gl.drawArrays(gl.TRIANGLES,0,6); last=milliseconds;
    }
    requestAnimationFrame(render);
  }
  function start() { if (!running && ready && !document.hidden) { running=true; requestAnimationFrame(render); } }
  function load() {
    const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    try { gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,photo); }
    catch { return; }
    gl.uniform2f(uniform('imageSize'),photo.naturalWidth,photo.naturalHeight);
    gl.uniform1i(uniform('photograph'),0);
    resize(); ready=true; canvas.classList.add('ready'); start();
  }
  document.addEventListener('pointermove',event=>{
    gl.uniform2f(pointer,event.clientX/innerWidth,1-event.clientY/innerHeight);
    pointerEnergy=settings.mouse/100;
  },{passive:true});
  document.addEventListener('visibilitychange',start);
  addEventListener('resize',resize);
  canvas.addEventListener('webglcontextlost',()=>{ready=false;canvas.classList.remove('ready');});
  if(photo.complete&&photo.naturalWidth) load(); else photo.addEventListener('load',load,{once:true});
})();
