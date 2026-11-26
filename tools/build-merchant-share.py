"""Build the static merchant web pages. Requires Pillow and Node.js."""

import base64
import html
import io
import json
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import urlencode

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "share" / "merchant"
PUBLIC = "https://youapp-dev.github.io/mock-design/share/merchant/"
SHARE_DESCRIPTION = "Discover local places and experiences with YouApp Engage. Travel like a local."
SIZE = (1200, 630)
# Social preview raster of the design-system horizontal gradient lockup.
FALLBACK_IMAGE = "youapp-logo.jpg"
SOURCES = [
    ROOT / "prototype/features/merchants/merchants.js",
    ROOT / "prototype/app30/runtime.js",
]


def write(name, contents):
    (OUT / name).write_text(contents, encoding="utf-8", newline="\n")


def merchant_fields(source):
    for match in re.finditer(r"^\s*\{id:'((?:px|m)-[^']+)', name:'([^']+)'([^\n]+)", source, re.M):
        ident, name, rest = match.groups()
        fields = dict(re.findall(r"\b(cat|type|addr|img|opens|close|phone|openLabel):'([^']*)'", rest))
        rating = re.search(r"\brating:(\d+(?:\.\d+)?)", rest)
        if rating:
            fields["rating"] = float(rating.group(1))
        cashback = re.search(r"\bcb:(\d+)", rest)
        yield ident, name, fields, int(cashback.group(1)) if cashback else 0, "open:false" in rest, "hidden:true" in rest


def save_photo(key, images):
    with Image.open(io.BytesIO(base64.b64decode(images[key]))) as image:
        ImageOps.fit(image.convert("RGB"), SIZE, Image.Resampling.LANCZOS).save(
            OUT / f"{key}.jpg", quality=84, optimize=True
        )


def save_detail_photo(key, images):
    with Image.open(io.BytesIO(base64.b64decode(images[key]))) as image:
        image = image.convert("RGB")
        image.thumbnail((1200, 900), Image.Resampling.LANCZOS)
        image.save(OUT / f"{key}.jpg", quality=85, optimize=True)


def page(key, item):
    esc = html.escape
    title = esc(item["title"])
    description = esc(item["description"])
    share_description = esc(SHARE_DESCRIPTION)
    filename = f"{key}.html"
    url = PUBLIC + filename
    image = PUBLIC + item["image"]
    alt = esc(item["alt"])
    destination = f"../../?app=app30&amp;jump=merchantPlace%3A{item['id']}" if item["id"] else "../../"
    place = item.get("place")
    if place:
        address = esc(place.get("address", ""))
        category = esc(place["category"])
        rating = f'<span class="place-rating" aria-label="{place["rating"]} out of 5 stars">★ {place["rating"]:.1f}</span>' if place.get("rating") else ""
        hours = f'<div><dt>Hours</dt><dd>{esc(place["hours"])}</dd></div>' if place.get("hours") else ""
        phone = place.get("phone")
        contact = f'<div><dt>Phone</dt><dd><a href="tel:{re.sub(r"[^+0-9]", "", phone)}">{esc(phone)}</a></dd></div>' if phone else ""
        location = f'<div><dt>Address</dt><dd>{address}</dd></div>' if address else ""
        offer = f'''
      <aside class="place-offer">
        <img src="illustrations/cashback.svg" width="240" height="160" alt="" loading="lazy">
        <div><strong>{place["cashback"]}% cashback</strong><p>Pay with YouApp at this merchant.</p></div>
      </aside>''' if place.get("cashback") else ""
        directions = esc("https://www.google.com/maps/search/?" + urlencode({"api": 1, "query": " ".join((item["title"], place.get("address", "")))}))
        actions = f'<a class="secondary" href="{directions}" target="_blank" rel="noopener noreferrer">Get directions</a>'
        fallback = ' is-fallback' if item["image"] == FALLBACK_IMAGE else ''
        content = f"""
    <section class="place-hero{fallback}" aria-labelledby="place-name">
      <div class="place-wrap place-hero-layout">
        <div class="place-identity">
          <p>{category}</p>
          <h1 id="place-name">{title}</h1>
          <div class="place-hero-actions">{rating}<a class="primary" data-open-merchant href="{destination}">Open in YouApp <span aria-hidden="true">→</span></a></div>
        </div>
        <div class="place-cover-frame">
          <img class="place-cover" src="{item['image']}" width="1200" height="630" alt="{alt}" fetchpriority="high">
        </div>
      </div>
    </section>
    <nav class="place-wrap place-jumps" aria-label="Merchant sections" hidden></nav>
    <div class="place-wrap place-grid">
      <section class="place-details" aria-labelledby="visit-title">
        <h2 id="visit-title">Plan your visit</h2>
        <dl>{location}{hours}{contact}</dl>
        <div class="place-actions">{actions}</div>
      </section>{offer}
    </div>
    <div class="place-wrap place-community" hidden></div>"""
    else:
        content = f"""
    <section class="place-wrap place-empty">
      <img src="{item['image']}" width="1200" height="630" alt="{alt}">
      <h1>{title}</h1>
      <p>{description}</p>
      <a class="primary" href="./#places">Browse places</a>
    </section>"""
    return f"""<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{share_description}">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="YouApp">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{share_description}">
  <meta property="og:image" content="{image}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="{SIZE[0]}">
  <meta property="og:image:height" content="{SIZE[1]}">
  <meta property="og:image:alt" content="{alt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{share_description}">
  <meta name="twitter:image" content="{image}">
  <meta name="twitter:image:alt" content="{alt}">
  <link rel="stylesheet" href="../../design-system/tokens.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap">
  <link rel="stylesheet" href="share.css">
</head>
<body class="place-page">
  <header class="place-header">
    <div class="place-wrap place-header-inner">
      <a href="https://youapp.ai/en-us" aria-label="YouApp homepage"><img src="../../design-system/assets/Logos/youapp-horizontal-gradient-mark-ink.svg" alt="YouApp" width="132" height="36"></a>
      <a class="place-nav" href="./#places">Browse places</a>
    </div>
  </header>
  <main>{content}
  </main>
  <footer class="place-footer">
    <div class="place-wrap place-footer-inner">
      <a href="https://youapp.ai/en-us"><img src="../../design-system/assets/Logos/youapp-horizontal-white.svg" alt="YouApp" width="132" height="36"></a>
      <span>Travel like a local. Pay like a local.</span>
    </div>
  </footer>
  <script src="catalog.js" defer></script>
  <script src="merchant-details.js" defer></script>
  <script src="landing.js" defer></script>
  <script src="community.js" defer></script>
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
    snapshots = json.loads(subprocess.check_output(
        [os.environ.get("MERCHANT_BUILD_NODE", "node"), ROOT / "tools/export-merchant-web.cjs"],
        encoding="utf-8",
    ))
    catalog = {}
    saved_images = set()
    unavailable = dict(id=None, title="Merchant unavailable",
                       description="This merchant can no longer be opened. Explore other places on YouApp.",
                       image=FALLBACK_IMAGE, alt="YouApp logo")
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
            hours = fields.get("openLabel") or (
                ("Closed · Opens at " + fields["opens"] if fields.get("opens") else "Closed") if closed
                else ("Open · Closes at " + fields["close"] if fields.get("close") else "")
            )
            place = dict(category=fields.get("type") or fields.get("cat") or "Place", address=fields.get("addr", ""),
                         rating=fields.get("rating"), phone=fields.get("phone"), hours=hours, cashback=cashback)
            catalog[ident] = dict(id=ident, title=name, description=description or "View this merchant on YouApp.",
                                  image=f"{key}.jpg" if has_photo else FALLBACK_IMAGE,
                                  alt=f"Photo for {name}" if has_photo else "YouApp logo", place=place)
    catalog["px-thread-no-photo"] = {**catalog["px-thread"], "image": FALLBACK_IMAGE, "alt": "YouApp logo"}
    catalog["unavailable"] = unavailable
    catalog["invalid"] = dict(id=None, title="Merchant link unavailable",
                              description="Check that you have the full link, or ask the sender to share it again.",
                              image=FALLBACK_IMAGE, alt="YouApp logo")
    for key, item in catalog.items():
        write(f"{key}.html", page(key, item))
    detail_images = set()
    for snapshot in snapshots.values():
        detail_images.update(key for key, _ in snapshot["photos"])
        detail_images.update(person["photo"] for visitors in snapshot["visitors"].values() for person in visitors)
        detail_images.update(photo for review in snapshot["reviews"] for photo in review["photos"])
    for key in sorted(detail_images - saved_images):
        save_detail_photo(key, images)
    write("merchant-details.js", "// Generated by tools/build-merchant-share.py.\n"
          f"window.YouAppMerchantDetails = {json.dumps(snapshots, ensure_ascii=False, separators=(',', ':'))};\n")
    payload = json.dumps({"publicBase": PUBLIC, "shareDescription": SHARE_DESCRIPTION, "items": catalog},
                         ensure_ascii=False, indent=2)
    write("catalog.js", f"// Generated by tools/build-merchant-share.py.\nwindow.YouAppMerchantPreviews = {payload};\n")


if __name__ == "__main__":
    main()
