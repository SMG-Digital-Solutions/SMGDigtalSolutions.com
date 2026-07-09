#!/usr/bin/env python3
import sys
from PIL import Image

def usage():
    print("Usage: remove_bg.py input.png output.png [tolerance]")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        usage(); sys.exit(1)
    inp = sys.argv[1]
    out = sys.argv[2]
    tol = float(sys.argv[3]) if len(sys.argv) > 3 else 0.15

    img = Image.open(inp).convert('RGBA')
    w,h = img.size
    px = img.load()

    # sample corners and take average color
    samples = [px[0,0], px[w-1,0], px[0,h-1], px[w-1,h-1]]
    # consider only RGB
    avg = tuple(sum(c[i] for c in samples)//len(samples) for i in range(3))

    def close_enough(c1, c2, tol):
        return sum((c1[i]-c2[i])**2 for i in range(3)) <= (255*3*tol*tol)

    for y in range(h):
        for x in range(w):
            r,g,b,a = px[x,y]
            if close_enough((r,g,b),(avg[0],avg[1],avg[2]), tol):
                px[x,y] = (r,g,b,0)

    img.save(out)
    print(f"Saved transparent image: {out}")
