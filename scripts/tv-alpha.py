# Web-only derivative builder (the kit files stay untouched):
#   python3 scripts/tv-alpha.py <kit tv1-*.mp4> <out-alpha.mp4> <poster.png> [poster frame]
# Web-only derivative: turns the kit's TV video (on black, meant for screen blend) into a
# stacked colour+alpha H.264 (top = colour, bottom = alpha) for the site's WebGL player.
import sys, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFilter
src, out, poster = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = 1152, 1024
# the kit's own TV-body plate polygon (brb.html .plate clip-path), grown a hair to cover the AA edge
poly = [(10,26.5),(78.6,23),(90.3,27.5),(90.6,81.4),(78,91.3),(10.5,84.5)]
cx, cy = 50, 57
S = 4
m = Image.new('L', (W*S, H*S), 0)
ImageDraw.Draw(m).polygon([((cx+(x-cx)*1.004)*W*S/100, (cy+(y-cy)*1.006)*H*S/100) for x,y in poly], fill=255)
body = np.asarray(m.resize((W, H), Image.LANCZOS)).astype(np.float32)/255
def smooth(a, b, x):
    t = np.clip((x-a)/(b-a), 0, 1); return t*t*(3-2*t)
dec = subprocess.Popen(['ffmpeg','-v','error','-i',src,'-f','rawvideo','-pix_fmt','rgb24','-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H*2}','-r','30000/1001','-i','-',
  '-c:v','libx264','-preset','slow','-crf','14','-pix_fmt','yuv420p','-movflags','+faststart','-an',out], stdin=subprocess.PIPE)
n = 0; first = None
while True:
    buf = dec.stdout.read(W*H*3)
    if len(buf) < W*H*3: break
    c = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)/255
    L = c.max(axis=2)
    ext = smooth(0.30, 0.62, L)            # antennas + the bright body rim; drops the baked halo and black
    a = np.maximum(body, ext)
    cn = c / np.maximum(L, 1e-3)[..., None] * np.minimum(1, L/0.62)[..., None]   # un-premultiplied colour for the soft edge
    col = body[..., None]*c + (1-body[..., None])*np.where(a[..., None] > 0, cn, 0)
    col = np.clip(col, 0, 1)
    frame = np.concatenate([col, np.repeat(a[..., None], 3, axis=2)], axis=0)
    enc.stdin.write((frame*255+0.5).astype(np.uint8).tobytes())
    if n == int(sys.argv[4]) if len(sys.argv) > 4 else n == 0:
        Image.fromarray((np.dstack([col, a])*255+0.5).astype(np.uint8), 'RGBA').save(poster, optimize=True)
    n += 1
enc.stdin.close(); enc.wait(); print(out, n, 'frames')
