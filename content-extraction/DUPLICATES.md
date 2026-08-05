# Duplicate / Non-Unique Source Files

This file tracks source HTML files that were identified as duplicates, near-duplicates, or non-content fragments of other pages, so they were NOT extracted a second time.

## Root-level `blogXXXX.html` files (paginated blog listing fragments)

All of the following root-level files are **not individual blog posts**. They are paginated/AJAX fragment copies of the blog **listing** page (`blog.html`), each containing multiple `<h1 class="blog-title">` entries (one per teaser card) rather than a single article. Confirmed via:
- `og:url` meta tag on every file = `blog.html`
- `<title>` = "Courtesy Plumbing and Heating Blog — Courtesy Plumbing & Heating" (the listing page title, not an article title)
- Each contains 60+ occurrences of blog-list item markup (`BlogList-item` / `blog-item`), i.e. a grid of post teasers, not one article body

Files (duplicates of `blog.html`, extracted once as `content-extraction/pages/blog-listing.md` if needed — otherwise skip):
- blog04eb.html
- blog06aa.html
- blog29c9.html
- blog3304.html
- blog56c4.html
- blog5a12.html
- blog6b7d.html
- blog7fdd.html
- blog9220.html
- blog98ee.html
- bloga19d.html
- bloga742.html
- bloga7a6.html
- blogb7fe.html
- blogc6af.html
- blogd627.html
- bloge315.html
- bloga409 (no .html extension — same pattern, `<title>Blog - Courtesy Plumbing & Heating</title>`, contains embedded teaser for "How to Prepare Your AC for Warmer Weather..." among many others; still a listing fragment, not a standalone article)

These filenames correspond to Squarespace's internal cache-busted pagination endpoints for the blog list widget (e.g. `/blog?offset=N` type fragments saved with hashed names during export). No unique article content was lost — all real articles exist as properly-slugged files in the `blog/` subdirectory, which were extracted individually.

## `s/plugin-lightbox.html`

This file's `<title>` and `canonical`/`og:url` (`https://www.courtesyplumbingandheating.com`) match the site **homepage** (`index.html`) exactly. It appears to be a duplicate/fragment snapshot captured via a Squarespace lightbox-plugin asset URL rather than a distinct page. Not extracted separately — homepage content extracted once from `index.html` into `content-extraction/pages/home.md`.

## `blog/category/*.html` and `blog/tag/*.html` (Squarespace auto-generated archive/filter pages)

All 23 files in `blog/category/` and all 37 files in `blog/tag/` are Squarespace's auto-generated category/tag archive pages (e.g. `blog/category/Boiler.html`, `blog/tag/Plumbing-2.html`). Confirmed via:
- `<title>` pattern: `"<Category Name> — Courtesy Plumbing and Heating Blog — Courtesy Plumbing & Heating"` — i.e. a filtered view of the blog listing, not a unique article
- Each contains only teaser/excerpt cards (`blog-title` markup, 1-6 occurrences depending on how many posts have that tag/category) linking back to the same full articles already extracted individually from `blog/*.html`

No unique long-form content exists on these pages beyond what's already captured in the individually-extracted blog post markdown files. Not extracted individually. Category/tag names present (useful for possible future taxonomy/tagging reference, not extracted as content):

**Categories:** Boiler, Castle Rock, Colorado, Denver Weather, Denver, Frozen Pipes, Furnace, HVAC Maintenace, HVAC System, HVAC, Homeowner's Guide, Homeowner Guide, Hydro Jetting, New Year, Plumbing, Repair, Reverse Osmosis, Sewer, Water Heater, Water Heaters, Winter, heat pump, hvac-2, informative

**Tags:** Air Conditioning, Boiler, Castle Rock, Colorado, Denver HVAC, Denver, Drains, FAQ, Frozen Pipes, Furnace-2, HVAC Maintenance, HVAC, Heating, Homeowner's Guide, Hydro Jetting, HydroJetting, Piping, Plumbing-2, Sewer, Water Leak, Winter, castle rock-2, colorado-2, denver-2, furnace, heat pumps, home, hvac-2, informative, new year, plumbing, reverse osmosis, sewer liners, sewer-2, tips, trenchless repair, water heater, water heaters

## Blog post duplicate content (within `blog/` subdirectory)

See notes below, added as extraction agents report near-duplicate article bodies among the properly-slugged posts.

<!-- Additional duplicate notes appended below as batches complete -->
