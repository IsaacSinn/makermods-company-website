# SO101 MakerMods Lab Positioning Design

## Objective

Update the SO101 product and buy pages so Hugging Face is credited as the source of the open-source SO101 arm and its public documentation, while MakerMods Lab is presented as the software used for operating the MakerMods product.

## Scope

The change is limited to `so101.html`, `so101-buy.html`, and their focused verification coverage. The existing MakerMods App page, sitewide `MakerMods App` navigation labels, and non-SO101 product pages remain unchanged.

## Product-page section order

Keep sections 01 through 03 unchanged. Reorder the next two sections so the sequence becomes:

1. `04` — Read the Source
2. `05` — Hardware
3. `06` — FAQ

Move the complete Read the Source section ahead of the complete Hardware section. Transfer the alternating background treatment with the section positions so section 04 uses the plain background and section 05 uses the grid background.

## Terminology and messaging

Remove every visible `LeRobot` reference from the SO101 product and buy pages. Replace software-workflow claims with `MakerMods Lab`, including references to:

- connecting and configuring the arms;
- calibration;
- leader/follower teleoperation;
- dataset recording;
- training and evaluation workflows.

Update page titles, descriptions, social metadata, structured product data, hero labels, tags, specifications, FAQ answers, comparison copy, purchase notes, and footer labels where they currently position LeRobot as the software.

Retain visible Hugging Face credit where it describes SO101 provenance, open-source documentation, or public datasets. Existing Hugging Face SO101 documentation URLs may continue to contain `/lerobot/` in the URL because that is the official external path; the visible label and surrounding copy must describe Hugging Face documentation rather than presenting LeRobot as the MakerMods software.

Remove the visible LeRobot footer link. Do not rename the existing MakerMods App navigation item or modify the MakerMods App page during this change.

## Links

- Keep the Hugging Face SO101 setup documentation link.
- Keep the hardware-source repository link.
- Keep Hugging Face dataset/catalog references where they describe hosting or provenance.
- Do not introduce a new MakerMods Lab destination until a dedicated page or route exists.

## Verification

Add or update focused verification to assert:

- Read the Source appears before Hardware in `so101.html`;
- their visible section numbers are `04` and `05` respectively;
- `MakerMods Lab` appears in the product and buy-page workflow messaging;
- no visible `LeRobot` text remains in either SO101 page;
- official external Hugging Face SO101 documentation and hardware-source links remain;
- the existing MakerMods App navigation label remains unchanged;
- all existing repository verification scripts still pass.

## Delivery

Commit and push the implementation only to `feature/so101-pages-and-openbooth-banner`. Do not create or reopen a pull request.
