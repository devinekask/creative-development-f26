// https://www.shadertoy.com/view/Wt33Wf
// the main function comes first (wgslFn reads its signature), helper functions follow below
fn cyberFuji(fragCoord: vec2f, iTime: f32, iResolution: vec2f) -> vec4f {
  var uv = (2.0 * fragCoord - iResolution) / iResolution.y;
  let battery = 1.0;

  // Grid
  let fog = smoothstep(0.1, -0.02, abs(uv.y + 0.2));
  var col = vec3f(0.0, 0.1, 0.2);
  if (uv.y < -0.2) {
    uv.y = 3.0 / (abs(uv.y + 0.2) + 0.05);
    uv.x = uv.x * uv.y * 1.0;
    let gridVal = grid(uv, battery, iTime);
    col = mix(col, vec3f(1.0, 0.5, 1.0), gridVal);
  } else {
    let fujiD = min(uv.y * 4.5 - 0.5, 1.0);
    uv.y = uv.y - (battery * 1.1 - 0.51);

    var sunUV = uv;

    // Sun
    sunUV = sunUV + vec2f(0.75, 0.2);
    col = vec3f(1.0, 0.2, 1.0);
    let sunVal = sun(sunUV, battery, iTime);

    col = mix(col, vec3f(1.0, 0.4, 0.1), sunUV.y * 2.0 + 0.2);
    col = mix(vec3f(0.0, 0.0, 0.0), col, sunVal);

    // fuji
    let fujiVal = sdTrapezoid(uv + vec2f(-0.75 + sunUV.y * 0.0, 0.5), 1.75 + pow(uv.y * uv.y, 2.1), 0.2, 0.5);
    let waveVal = uv.y + sin(uv.x * 20.0 + iTime * 2.0) * 0.05 + 0.2;
    let wave_width = smoothstep(0.0, 0.01, waveVal);

    // fuji color
    col = mix(col, mix(vec3f(0.0, 0.0, 0.25), vec3f(1.0, 0.0, 0.5), fujiD), step(fujiVal, 0.0));
    // fuji top snow
    col = mix(col, vec3f(1.0, 0.5, 1.0), wave_width * step(fujiVal, 0.0));
    // fuji outline
    col = mix(col, vec3f(1.0, 0.5, 1.0), 1.0 - smoothstep(0.0, 0.01, abs(fujiVal)));

    // horizon color
    col += mix(col, mix(vec3f(1.0, 0.12, 0.8), vec3f(0.0, 0.0, 0.2), clamp(uv.y * 3.5 + 3.0, 0.0, 1.0)), step(0.0, fujiVal));

    // cloud
    var cloudUV = uv;
    cloudUV.x = glslMod(cloudUV.x + iTime * 0.1, 4.0) - 2.0;
    let cloudTime = iTime * 0.5;
    var cloudY = -0.5;
    let cloudVal1 = sdCloud(cloudUV,
                            vec2f(0.1 + sin(cloudTime + 140.5) * 0.1, cloudY),
                            vec2f(1.05 + cos(cloudTime * 0.9 - 36.56) * 0.1, cloudY),
                            vec2f(0.2 + cos(cloudTime * 0.867 + 387.165) * 0.1, 0.25 + cloudY),
                            vec2f(0.5 + cos(cloudTime * 0.9675 - 15.162) * 0.09, 0.25 + cloudY), 0.075);
    cloudY = -0.6;
    let cloudVal2 = sdCloud(cloudUV,
                            vec2f(-0.9 + cos(cloudTime * 1.02 + 541.75) * 0.1, cloudY),
                            vec2f(-0.5 + sin(cloudTime * 0.9 - 316.56) * 0.1, cloudY),
                            vec2f(-1.5 + cos(cloudTime * 0.867 + 37.165) * 0.1, 0.25 + cloudY),
                            vec2f(-0.6 + sin(cloudTime * 0.9675 + 665.162) * 0.09, 0.25 + cloudY), 0.075);

    let cloudVal = min(cloudVal1, cloudVal2);

    col = mix(col, vec3f(0.0, 0.0, 0.2), 1.0 - smoothstep(0.075 - 0.0001, 0.075, cloudVal));
    col += vec3f(1.0, 1.0, 1.0) * (1.0 - smoothstep(0.0, 0.01, abs(cloudVal - 0.075)));
  }

  col += fog * fog * fog;
  col = mix(vec3f(col.r, col.r, col.r) * 0.5, col, battery * 0.7);

  return vec4f(col, 1.0);
}

// GLSL mod(): WGSL's % operator keeps the sign of the dividend, GLSL's mod() doesn't
fn glslMod(x: f32, y: f32) -> f32 {
  return x - y * floor(x / y);
}

fn sun(uv: vec2f, battery: f32, iTime: f32) -> f32 {
  let val = smoothstep(0.3, 0.29, length(uv));
  let bloom = smoothstep(0.7, 0.0, length(uv));
  var cut = 3.0 * sin((uv.y + iTime * 0.2 * (battery + 0.02)) * 100.0)
            + clamp(uv.y * 14.0 + 1.0, -6.0, 6.0);
  cut = clamp(cut, 0.0, 1.0);
  return clamp(val * cut, 0.0, 1.0) + bloom * 0.6;
}

fn grid(uvIn: vec2f, battery: f32, iTime: f32) -> f32 {
  // function parameters are immutable in WGSL, so copy before modifying
  var uv = uvIn;
  let size = vec2f(uv.y, uv.y * uv.y * 0.2) * 0.01;
  uv += vec2f(0.0, iTime * 4.0 * (battery + 0.05));
  uv = abs(fract(uv) - 0.5);
  var lines = smoothstep(size, vec2f(0.0), uv);
  lines += smoothstep(size * 5.0, vec2f(0.0), uv) * 0.4 * battery;
  return clamp(lines.x + lines.y, 0.0, 3.0);
}

fn dot2(v: vec2f) -> f32 {
  return dot(v, v);
}

fn sdTrapezoid(pIn: vec2f, r1: f32, r2: f32, he: f32) -> f32 {
  var p = pIn;
  let k1 = vec2f(r2, he);
  let k2 = vec2f(r2 - r1, 2.0 * he);
  p.x = abs(p.x);
  // select(falseValue, trueValue, condition) replaces the GLSL ternary operator
  let ca = vec2f(p.x - min(p.x, select(r2, r1, p.y < 0.0)), abs(p.y) - he);
  let cb = p - k1 + k2 * clamp(dot(k1 - p, k2) / dot2(k2), 0.0, 1.0);
  let s = select(1.0, -1.0, cb.x < 0.0 && ca.y < 0.0);
  return s * sqrt(min(dot2(ca), dot2(cb)));
}

fn sdLine(p: vec2f, a: vec2f, b: vec2f) -> f32 {
  let pa = p - a;
  let ba = b - a;
  let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

fn sdBox(p: vec2f, b: vec2f) -> f32 {
  let d = abs(p) - b;
  return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0);
}

fn opSmoothUnion(d1: f32, d2: f32, k: f32) -> f32 {
  let h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

fn sdCloud(p: vec2f, a1: vec2f, b1: vec2f, a2: vec2f, b2: vec2f, w: f32) -> f32 {
  let lineVal1 = sdLine(p, a1, b1);
  let lineVal2 = sdLine(p, a2, b2);
  let ww = vec2f(w * 1.5, 0.0);
  let left = max(a1 + ww, a2 + ww);
  let right = min(b1 - ww, b2 - ww);
  let boxCenter = (left + right) * 0.5;
  let boxH = abs(a2.y - a1.y) * 0.5;
  let boxVal = sdBox(p - boxCenter, vec2f(0.04, boxH)) + w;

  let uniVal1 = opSmoothUnion(lineVal1, boxVal, 0.05);
  let uniVal2 = opSmoothUnion(lineVal2, boxVal, 0.05);

  return min(uniVal1, uniVal2);
}
