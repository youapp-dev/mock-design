"""Build the static merchant previews for GitHub Pages. Requires Pillow."""

import base64
import html
import io
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "share" / "merchant"
PUBLIC = "https://youapp-dev.github.io/mock-design/share/merchant/"
SIZE = (1200, 630)
SOURCES = [
    ROOT / "prototype/features/merchants/merchants.js",
    ROOT / "prototype/app30/runtime.js",
]


def write(name, contents):
    (OUT / name).write_text(contents, encoding="utf-8", newline="\n")


def merchant_fields(source):
    for match in re.finditer(r"^\s*\{id:'((?:px|m)-[^']+)', name:'([^']+)'([^\n]+)", source, re.M):
        ident, name, rest = match.groups()
        fields = dict(re.findall(r"\b(cat|type|addr|img|opens):'([^']*)'", rest))
        cashback = re.search(r"\bcb:(\d+)", rest)
        yield ident, name, fields, int(cashback.group(1)) if cashback else 0, "open:false" in rest, "hidden:true" in rest


def save_photo(key, images):
    with Image.open(io.BytesIO(base64.b64decode(images[key]))) as image:
        ImageOps.fit(image.convert("RGB"), SIZE, Image.Resampling.LANCZOS).save(
            OUT / f"{key}.jpg", quality=84, optimize=True
        )


def save_brand_image():
    image = Image.new("RGB", SIZE, "#251052")
    draw = ImageDraw.Draw(image)
    title = ImageFont.load_default(size=124)
    draw.text((600, 315), "YouApp", font=title, fill="white", anchor="mm")
    image.save(OUT / "youapp.jpg", quality=85, optimize=True)


def page(key, item):
    esc = html.escape
    title = esc(item["title"])
    description = esc(item["description"])
    filename = f"{key}.html"
    url = PUBLIC + filename
    image = PUBLIC + item["image"]
    alt = esc(item["alt"])
    destination = f"../../?app=app30&amp;jump=merchantPlace%3A{item['id']}" if item["id"] else "../../"
    label = "View merchant" if item["id"] else "Open YouApp"
    # Active merchants use the merchant web app (web/, built by tools/build-merchant-web.cjs).
    web = bool(item["id"])
    return f"""<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="YouApp">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="{image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="{SIZE[0]}">
  <meta property="og:image:height" content="{SIZE[1]}">
  <meta property="og:image:alt" content="{alt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{image}">
  <meta name="twitter:image:alt" content="{alt}">
  <link rel="stylesheet" href="{'web/merchant-web.css' if web else 'share.css'}">
</head>
<body{' class="mw-body"' if web else ''}>
  {'<div id="mw" data-merchant="' + key + '"><noscript>' if web else ''}<main class="preview">
    <img src="{item['image']}" width="{SIZE[0]}" height="{SIZE[1]}" alt="{alt}">
    <div class="details">
      <h1>{title}</h1>
      <p>{description}</p>
      <a class="primary" data-open-merchant href="{destination}">{label}</a>
    </div>
  </main>{'</noscript></div>' if web else ''}
  {'<script src="web/merchant-data.js" defer></script>' + chr(10) + '  <script src="web/merchant-web.js" defer></script>' + chr(10) + '  ' if web else ''}<script src="landing.js" defer></script>
</body>
</html>
"""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    all_sources = [source.read_text(encoding="utf-8") for source in SOURCES]
    images = {
        key: data
        for source in all_sources
        for key, data in re.findall(r"""["']?(\w+)["']?\s*:\s*["']data:image/\w+;base64,([^"']+)""", source)
    }
    save_brand_image()
    catalog = {}
    saved_images = set()
    unavailable = dict(id=None, title="Merchant unavailable",
                       description="This merchant can no longer be opened. Explore other places on YouApp.",
                       image="youapp.jpg", alt="YouApp")
    for source in all_sources:
        for ident, name, fields, cashback, closed, hidden in merchant_fields(source):
            if hidden:
                catalog[ident] = unavailable
                continue
            key = fields.get("img")
            has_photo = key in images
            if has_photo and key not in saved_images:
                save_photo(key, images)
                saved_images.add(key)
            description = " · ".join(filter(None, (fields.get("type") or fields.get("cat"), fields.get("addr"))))
            if closed:
                description += f" · Closed, opens at {fields['opens']}" if fields.get("opens") else " · Closed"
            if cashback:
                description += f" · {cashback}% cashback"
            catalog[ident] = dict(id=ident, title=name, description=description or "View this merchant on YouApp.",
                                  image=f"{key}.jpg" if has_photo else "youapp.jpg",
                                  alt=f"Photo for {name}" if has_photo else "YouApp")
    catalog["px-thread-no-photo"] = {**catalog["px-thread"], "image": "youapp.jpg", "alt": "YouApp"}
    catalog["unavailable"] = unavailable
    catalog["invalid"] = dict(id=None, title="Merchant link unavailable",
                              description="Check that you have the full link, or ask the sender to share it again.",
                              image="youapp.jpg", alt="YouApp")
    for key, item in catalog.items():
        write(f"{key}.html", page(key, item))
    payload = json.dumps({"publicBase": PUBLIC, "items": catalog}, ensure_ascii=False, indent=2)
    write("catalog.js", f"// Generated by tools/build-merchant-share.py.\nwindow.YouAppMerchantPreviews = {payload};\n")


if __name__ == "__main__":
    main()
