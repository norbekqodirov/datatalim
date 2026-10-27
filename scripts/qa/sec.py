import sys, os
sys.path.insert(0, os.path.expanduser(r"~/.claude/skills/design-forge/scripts"))
from _browser import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:3002').rstrip('/')
# usage: sec.py url out w h theme sel1,sel2,...   (selector:offsetPx)
url,out,w,h,theme,sels=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),sys.argv[5],sys.argv[6].split(',')
with sync_playwright() as pw:
    br=pw.chromium.launch(); pg=br.new_page(viewport={"width":w,"height":h})
    try:
        pg.goto(url)
        pg.evaluate(f"() => {{ try {{ localStorage.setItem('data-talim-theme','{theme}'); localStorage.setItem('themeManual','true'); }} catch(e){{}} }}")
        pg.goto(url); pg.wait_for_timeout(6000)
        print('sw',pg.evaluate("()=>document.documentElement.scrollWidth"))
        for i,s in enumerate(sels):
            sel,off=(s.split(':')+['0'])[:2]
            y=pg.evaluate(f"()=>{{const e=document.querySelector({sel!r}); if(!e) return -1; return e.getBoundingClientRect().top+scrollY}}")
            if y<0: print('missing',sel); continue
            # scroll gradually so whileInView fires
            pg.evaluate(f"()=>window.scrollTo(0,{max(0,int(y)+int(off)-300)})"); pg.wait_for_timeout(400)
            pg.evaluate(f"()=>window.scrollTo(0,{max(0,int(y)+int(off))})"); pg.wait_for_timeout(1500)
            pg.screenshot(path=f"{out}-{i}.png")
    finally:
        br.close()
