# Builds the transparent still fallback for components/tv-art.tsx from the kit's TV video
# (kit files untouched). Same maths as the WebGL shader there:
#   colour above a black point is un-blended from black (alpha = max(r,g,b), premultiplied colour kept),
#   the TV body (kit brb.html plate polygon, pulled in 5 px, 8 px feather) is fully opaque.
#   python3 scripts/tv-still.py <kit tv1-*.mp4> <seconds> <out.webp>
import sys, subprocess, numpy as np
from PIL import Image
src, t, out = sys.argv[1], sys.argv[2], sys.argv[3]
W, H, B, SHRINK, FEATHER = 1152, 1024, 6 / 255, 5.0, 8.0
POLY = [(10, 26.5), (78.6, 23), (90.3, 27.5), (90.6, 81.4), (78, 91.3), (10.5, 84.5)]
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", t, "-i", src, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
c = np.frombuffer(raw, np.uint8).reshape(H, W, 3).astype(np.float32) / 255
pts = [(x * W / 100, y * H / 100) for x, y in POLY]
cx, cy = np.mean([p[0] for p in pts]), np.mean([p[1] for p in pts])
yy, xx = np.mgrid[0:H, 0:W] + 0.5
d = np.full((H, W), 1e9, np.float32)
for i in range(len(pts)):
    (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % len(pts)]
    nx, ny = y0 - y1, x1 - x0
    n = np.hypot(nx, ny); nx, ny = nx / n, ny / n
    k = -(nx * x0 + ny * y0)
    if nx * cx + ny * cy + k < 0: nx, ny, k = -nx, -ny, -k
    d = np.minimum(d, nx * xx + ny * yy + k)
s = np.clip((d - SHRINK) / FEATHER, 0, 1); body = s * s * (3 - 2 * s)
cp = np.clip((c - B) / (1 - B), 0, 1)
L = cp.max(axis=2)
a = L + (1 - L) * body
pm = cp + (c - cp) * body[..., None]
col = np.where(a[..., None] > 1e-4, pm / np.maximum(a, 1e-4)[..., None], 0)
Image.fromarray((np.dstack([np.clip(col, 0, 1), a]) * 255 + 0.5).astype(np.uint8), "RGBA").save(out, quality=94, method=6)
print(out)
