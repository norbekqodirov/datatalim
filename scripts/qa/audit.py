"""Full-page audit: scrolls the whole page (so in-view animations fire), overlays the 12-col wrap grid,
then saves viewport-sized frames stitched into sheets."""
import sys, os
sys.path.insert(0, os.path.expanduser(r"~/.claude/skills/design-forge/scripts"))
from _browser import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:3002').rstrip('/')
from PIL import Image
w, h, theme, out, route = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4], (sys.argv[5] if len(sys.argv) > 5 else '')
GRID = r"""
() => {
  const g = document.createElement('div'); g.id='__grid';
  g.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:99999;display:flex;justify-content:center';
  const inner = document.createElement('div');
  inner.style.cssText='width:100%;max-width:1280px;padding:0 var(--gutter,40px);display:grid;grid-template-columns:repeat(12,1fr);column-gap:32px;height:100%';
  for (let i=0;i<12;i++){const c=document.createElement('div');c.style.cssText='background:rgba(255,0,90,.06);border-left:1px solid rgba(255,0,90,.35);border-right:1px solid rgba(255,0,90,.35)';inner.appendChild(c);}
  g.appendChild(inner); (document.querySelector('.v2')||document.body).appendChild(g);
}
"""
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page(viewport={"width": w, "height": h})
    try:
        pg.goto(BASE + '/' + route)
        pg.evaluate(f"() => {{ try {{ localStorage.setItem('data-talim-theme','{theme}'); localStorage.setItem('themeManual','true'); }} catch(e){{}} }}")
        pg.goto(BASE + '/' + route); pg.wait_for_timeout(5000)
        pg.evaluate(GRID)
        total = pg.evaluate("() => document.documentElement.scrollHeight")
        y, i, shots = 0, 0, []
        while y < total and i < 40:
            pg.evaluate(f"() => window.scrollTo(0, {y})"); pg.wait_for_timeout(900)
            f = f"{out}-{i:02d}.png"; pg.screenshot(path=f); shots.append(f)
            y += h; i += 1
            total = pg.evaluate("() => document.documentElement.scrollHeight")
        print('frames', len(shots), 'height', total)
        per = 8
        for s in range(0, len(shots), per):
            chunk = shots[s:s + per]
            sh = Image.new('RGB', (w // 2 * 2, (h // 2) * ((len(chunk) + 1) // 2)), 'white')
            for k, f in enumerate(chunk):
                sh.paste(Image.open(f).resize((w // 2, h // 2)), ((k % 2) * (w // 2), (k // 2) * (h // 2)))
            sh.save(f"{out}-sheet{s // per}.png")
    finally:
        br.close()
