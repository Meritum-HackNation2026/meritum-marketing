"""Renders index.html to slides/slide-NN.png, meritum-own.pdf and meritum-own.pptx (headless Chrome).

  uv run --with playwright --with python-pptx python deck/meritum-own/build.py

The PPTX holds one full-slide PNG per slide with the speaker notes from each <aside>;
edit index.html and rebuild instead of editing the PPTX.
"""
from pathlib import Path

from playwright.sync_api import sync_playwright
from pptx import Presentation
from pptx.util import Emu

HERE = Path(__file__).resolve().parent
W, H = 1920, 1080
MAX_SLIDES = 12  # contest rule: PDF of at most 12 slides


def render() -> list[str]:
    out = HERE / "slides"
    out.mkdir(exist_ok=True)
    for old in out.glob("*.png"):
        old.unlink()
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        page.goto((HERE / "index.html").as_uri(), wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        slides = page.locator("section.slide")
        n = slides.count()
        assert 0 < n <= MAX_SLIDES, f"{n} slides, the limit is {MAX_SLIDES}"
        notes = []
        for i in range(n):
            s = slides.nth(i)
            s.screenshot(path=out / f"slide-{i + 1:02d}.png")
            notes.append(s.locator("aside").inner_text().strip())
        page.pdf(path=str(HERE / "meritum-own.pdf"), width=f"{W}px", height=f"{H}px", print_background=True)
        browser.close()
    return notes


def pptx(notes: list[str]) -> None:
    prs = Presentation()
    prs.slide_width, prs.slide_height = Emu(12192000), Emu(6858000)  # 16:9, 13.333 x 7.5 in
    blank = prs.slide_layouts[6]
    for i, note in enumerate(notes, 1):
        slide = prs.slides.add_slide(blank)
        slide.shapes.add_picture(str(HERE / "slides" / f"slide-{i:02d}.png"), 0, 0, prs.slide_width, prs.slide_height)
        slide.notes_slide.notes_text_frame.text = note
    prs.save(HERE / "meritum-own.pptx")


if __name__ == "__main__":
    pptx(render())
