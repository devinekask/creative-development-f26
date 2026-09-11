// generates the color palette the plasma shader samples from
fn plasmaBuffer(fragCoord: vec2f, iTime: f32, iMouse: vec2f, iResolution: vec2f) -> vec4f {
  let pi = 3.1415926435;
  let i = fragCoord.x / iResolution.x;
  let t = (iTime + iMouse.y) / vec3f(63.0, 78.0, 45.0);
  let cs = cos(i * pi * 2.0 + vec3f(0.0, 1.0, -0.5) * pi + t);
  return vec4f(0.5 + 0.5 * cs, 1.0);
}
