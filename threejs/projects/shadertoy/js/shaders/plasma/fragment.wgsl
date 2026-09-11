// https://www.shadertoy.com/view/XsVSDz
fn plasma(fragCoord: vec2f, iTime: f32, iMouse: vec2f, iResolution: vec2f, iChannel0: texture_2d<f32>, iChannel0Sampler: sampler) -> vec4f {
  let vp = vec2f(320.0, 200.0);
  let t = iTime * 10.0 + iMouse.x;
  let uv = fragCoord / iResolution;
  let p0 = (uv - 0.5) * vp;
  let hvp = vp * 0.5;
  let p1d = vec2f(cos( t / 98.0),  sin( t / 178.0)) * hvp - p0;
  let p2d = vec2f(sin(-t / 124.0), cos(-t / 104.0)) * hvp - p0;
  let p3d = vec2f(cos(-t / 165.0), cos( t / 45.0))  * hvp - p0;
  let sum = 0.5 + 0.5 * (
    cos(length(p1d) / 30.0) +
    cos(length(p2d) / 20.0) +
    sin(length(p3d) / 25.0) * sin(p3d.x / 20.0) * sin(p3d.y / 15.0));
  return textureSample(iChannel0, iChannel0Sampler, vec2f(fract(sum), 0.0));
}
