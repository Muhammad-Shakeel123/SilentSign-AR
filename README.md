# SilentSign AR — Spatial Communication & Accessibility Dock for Snap Spectacles

**SilentSign AR** transforms Snap Spectacles into a hands-free spatial communication board for deaf and mute individuals, as well as anyone communicating in loud environments (train stations, factories, concerts) or silent spaces (libraries, hospitals).

## What It Does
- **World-Anchored Communication Dock:** Floats comfortably at ~1.2m arm's reach without obstructing the wearer's real-world view.
- **One-Pinch Phrase Bubbles:** Instant, outward-facing 3D glowing speech cards (*"Where is the exit?"*, *"I need help"*, *"Thank you"*, *"Please speak slowly"*) paired with spatial audio chimes.
- **3-Level Urgency Aura:** Dynamic visual and audio signaling across **Calm** (Green/Cyan), **Question** (Amber/Gold), and **Urgent** (Red pulsing alert badge).
- **Quick Directional Arrows & Air-Draw Canvas:** Instant spatial arrows (`← LEFT`, `↑ AHEAD`, `→ RIGHT`) plus a pinch-to-draw 3D laser ribbon that anchors in mid-air to point out routes or sketch symbols.

## Built With
- **Planning:** Devpost Learn Skill Pack (`plan-lens` -> `devpost/design-brief.md`)
- **Development:** Snap Spectacles SDK (`UIKit`, `InteractionKit`), Lens Studio 5.25, CLAD Plugin, and Lens Studio MCP
- **Testing:** LEAF 4.0.0 Preview Scenarios (`Assets/Scripts/*Scenario.ts`)

## How to Run in Lens Studio Preview
1. Open `SilentSign-AR.esproj` in **Lens Studio 5.22+**.
2. In the **Preview** panel, select a world environment (e.g., *Evening Outdoor*).
3. Pinch or click any phrase button on the floating dock to display the 3D speech bubble.
4. Switch between **CALM**, **AMBER**, and **URGENT** to observe dynamic border/badge/pulse states.
5. Use **← LEFT / ↑ AHEAD / → RIGHT** or toggle **AIR-DRAW** and click-drag in space to draw a glowing 3D path, then press **CLEAR / DISMISS** to reset.
