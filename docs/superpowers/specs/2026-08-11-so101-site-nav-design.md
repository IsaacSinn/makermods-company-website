# SO-101 Site Navigation Design

## Goal

Expose the merged SO-101 product page from every primary site navbar.

## Design

- Add `SO-101` as the first product link in every `.nav-links` block.
- Root-level pages link to `so101.html`.
- `makermods-app/index.html` links to `../so101.html`, matching its existing relative links.
- `openbooth/index.html` links to `/so101`, matching its existing root-relative extensionless links.
- Keep `aria-current="page"` only on `so101.html`.
- Preserve all existing nav links and actions.
- Verify intermediate desktop widths do not introduce horizontal overflow; adjust the shared hide breakpoint only if testing demonstrates it is needed.

## Scope

The nav appears in eleven HTML files: the homepage, product pages, buy pages, OpenBooth, and MakerMods App. The SO-101 product and buy pages already contain the link and should remain unchanged except for verification.

## Verification

- A dedicated script asserts one correctly resolved SO-101 link in every primary navbar.
- The repository asset verifier confirms all local references exist.
- Browser checks cover desktop and intermediate-width overflow.

## Constraints

- Work only in `feature/homepage-gif-banner`.
- Do not commit or push.
