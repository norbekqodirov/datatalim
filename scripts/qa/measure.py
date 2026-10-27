"""Bosh sahifadagi har bir bo'limni o'lchaydi: tartib, balandlik, ichki padding, kontent zichligi, sarlavha o'lchami."""
import sys, os, json
sys.path.insert(0, os.path.expanduser(r"~/.claude/skills/design-forge/scripts"))
from _browser import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:3002').rstrip('/')
w, h = int(sys.argv[1]), int(sys.argv[2])
JS = r"""
() => {
  const root = document.querySelector('main') || document.body;
  const secs = Array.from(document.querySelectorAll('section, footer')).filter(s => !s.parentElement.closest('section'));
  return secs.map((s, i) => {
    const r = s.getBoundingClientRect(); const cs = getComputedStyle(s);
    const h2 = s.querySelector('h1, h2'); const k = s.querySelector('.t-kicker');
    // content box: union of visible leaf-ish elements
    let top = Infinity, bot = -Infinity;
    s.querySelectorAll('h1,h2,h3,p,a,button,img,video,canvas,iframe,li,input,form').forEach(e => {
      const b = e.getBoundingClientRect(); if (b.height < 2 || b.width < 2) return;
      const st = getComputedStyle(e); if (st.visibility === 'hidden' || +st.opacity === 0) return;
      top = Math.min(top, b.top); bot = Math.max(bot, b.bottom);
    });
    return {
      i, tag: s.tagName.toLowerCase(), id: s.id || '', label: (s.getAttribute('aria-label') || (h2 && h2.textContent) || '').trim().slice(0, 48),
      kicker: k ? k.textContent.trim().slice(0, 28) : '',
      y: Math.round(r.top + scrollY), h: Math.round(r.height),
      padT: cs.paddingTop, padB: cs.paddingBottom,
      h2size: h2 ? getComputedStyle(h2).fontSize : '', h2cls: h2 ? h2.className.slice(0, 40) : '',
      sticky: !!s.querySelector('.sticky'),
    };
  });
}
"""
with sync_playwright() as pw:
    br = pw.chromium.launch(); pg = br.new_page(viewport={"width": w, "height": h})
    try:
        pg.goto(BASE + '/'); pg.wait_for_timeout(5000)
        # scroll through so lazy/in-view content mounts
        total = pg.evaluate("() => document.documentElement.scrollHeight")
        y = 0
        while y < total:
            pg.evaluate(f"() => window.scrollTo(0, {y})"); pg.wait_for_timeout(250); y += h
            total = pg.evaluate("() => document.documentElement.scrollHeight")
        pg.evaluate("() => window.scrollTo(0, 0)"); pg.wait_for_timeout(500)
        data = pg.evaluate(JS)
        print('page height', total)
        for d in data:
            print(f"{d['i']:>2} {d['tag']:<7} y={d['y']:>6} h={d['h']:>5} pad={d['padT']:>7}/{d['padB']:<7} sticky={str(d['sticky'])[0]} h2={d['h2size']:<7} kick='{d['kicker']}' | {d['label']}")
    finally:
        br.close()
