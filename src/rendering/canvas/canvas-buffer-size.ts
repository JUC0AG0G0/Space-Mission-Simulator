export interface CanvasBufferSize {
  width: number;
  height: number;
}

/**
 * Computes the canvas pixel-buffer size needed to render at native
 * resolution on high-density (Retina) displays. `clientWidth`/`clientHeight`
 * are CSS pixels; the buffer must be scaled up by `devicePixelRatio` so the
 * browser doesn't have to upsample a too-small buffer to fill the CSS box.
 * The rest of the render pipeline keeps reasoning in CSS pixels (paired with
 * a `ctx.setTransform(devicePixelRatio, ...)` before drawing), so this is
 * the only place the ratio needs to be applied.
 */
export function computeCanvasBufferSize(
  clientWidth: number,
  clientHeight: number,
  devicePixelRatio: number,
): CanvasBufferSize {
  return {
    width: Math.round(clientWidth * devicePixelRatio),
    height: Math.round(clientHeight * devicePixelRatio),
  };
}
