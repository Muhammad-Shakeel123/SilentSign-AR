# SilentSign AR

status: approved

## One-liner

A spatial communication dock lets a wearer choose a prewritten phrase, select an urgency color, show a quick direction arrow, and draw a temporary route ribbon while standing in a noisy or quiet environment.

## Experience

The wearer stands in a train station or quiet library while keeping the real-world view clear. A semi-transparent dark-glass control dock floats about 1.2 meters in front of the wearer, around chest-to-eye level, with a few large touch targets.

The first moment focuses on asking for directions or help:

1. The wearer pinches "Where is the exit?".
2. A large, crisp, glowing 3D speech bubble appears in front of the wearer and faces outward, with a CALM SIGNAL, QUESTION SIGNAL, or URGENT ALERT badge.
3. The wearer selects Amber/Question on the urgency controls; the badge and bubble border become warm gold.
4. The wearer may pinch LEFT, AHEAD, or RIGHT to show a large glowing arrow next to the speech bubble.
5. The wearer may switch to Air-Draw, pinch and drag through 3D space to draw a thick glowing ribbon, and release to freeze it.
6. The bubble, direction cue, and drawing remain visible until replaced or dismissed.

The dock, bubble, aura, and drawing remain spatial and visible inside the Lens Studio preview. Nearby people are not identified or tracked, and no real-world sign or route recognition is used.

## User

People who are deaf or mute, or who need quiet communication in loud environments. The wearer and the nearby person interact without the wearer needing to speak.

## Product or overlay

The Lens is a spatial product with a floating communication dock and generated speech bubble. It overlays the real world but does not change or recognize it.

## Spatial placement

- Dock: approximately 1.2 meters in front of the wearer, arm-reachable, around chest-to-eye level.
- Speech bubble: in front of the dock and outward-facing toward a nearby person.
- Urgency badge and aura: shown on the speech bubble, with Calm, Question, and Urgent text/color states.
- Quick direction arrow: shown beside the speech bubble when LEFT, AHEAD, or RIGHT is selected.
- Air-Draw ribbon: temporarily anchored along the 3D pinch-and-drag path.
- All content: slightly below eye level where practical and inside the narrow preview view.
- Dock size and touch targets: large enough to pinch reliably in the preview (default).

## Interactions

- Pinch or poke a phrase button.
- Pinch the urgency dial or use Calm, Question, and Urgent targets.
- Pinch LEFT, AHEAD, or RIGHT to show a glowing directional arrow beside the bubble.
- Select Air-Draw; its dock control changes to AIR-DRAW ACTIVE while drawing is enabled.
- Pinch and hold with thumb and index finger, continuously move the hand through 3D space to draw a thick glowing ribbon, release to freeze it, and pinch Clear to remove it.
- Pinch Dismiss or Clear to remove the speech bubble (default).

Hand tracking and mouse-driven preview pinch are the supported interaction paths. The experience does not depend on custom motion, two-hand gestures, hand speed, or hand pose recognition.

## Display timing

- Show the dock on Lens start.
- Show a speech bubble only after a phrase is selected or a phrase is replaced.
- Keep Calm, Question, and Urgent controls on the dock.
- Update the speech-bubble badge and color whenever urgency changes; gently pulse the bubble while Urgent is active.
- Keep a selected direction arrow visible beside the speech bubble until another direction is selected or Clear is used.
- Hide or dismiss content when the user clears it.
- The Air-Draw arrow remains frozen until Clear or a new drawing replaces it (default).

## Feedback

- Phrases: "I need help", "Thank you", "Where is the exit?", and "Please speak slowly" (default).
- Calm aura: green/cyan.
- Question aura: amber/gold.
- Urgent/Emergency aura: red.
- Phrase and direction selection: a soft chime and glass-pill hover/pinch highlight.
- Urgency changes: a distinct tone; the Urgent bubble adds a smooth breathing scale/glow pulse.
- Clear: a gentle confirmation sound.
- Audio cues: short, locally generated WAV assets; no network or external audio dependency.
- Spoken voice playback: use prewritten phrase audio or built-in speech playback as a preview-safe fallback (default). If live voice synthesis is not reliable in preview, keep the chime and visible text as the demonstrated fallback.

## Preview stand-ins

- The Lens does not recognize that a person is nearby. The speech bubble simply appears in front of the wearer.
- The Lens does not recognize real-world exits or routes. The arrow is a hand-drawn demonstration or placeholder.
- Real speech is not transcribed or generated from custom voice input. The phrase buttons use fixed phrases.

## Done

1. Start the Lens in the preview and confirm the dock appears about 1.2 meters ahead at chest-to-eye level.
2. Pinch "Where is the exit?" and confirm a crisp 3D speech bubble opens in front of the wearer.
3. Select Amber/Question and confirm the bubble changes to a warm gold border and glow.
4. Pinch LEFT, AHEAD, and RIGHT in turn and confirm the large arrow updates beside the bubble.
5. Select Urgent and confirm the badge, red color, breathing pulse, and distinct tone.
6. Open Air-Draw, pinch and move the hand continuously, and confirm the thick cyan/gold ribbon remains frozen after release.
7. Pinch Clear and confirm the bubble, direction arrow, and drawing are removed with a gentle sound.

## Risks

- A dock too close to the face or too large can block the real-world view.
- Small touch targets can make pinch interaction unreliable.
- A live voice actor or speech service may be less reliable than fixed phrase playback in preview.
- Air-drawn arrows do not necessarily point to real routes.
- A crowded station or library is not used for automatic people detection or consent-sensitive tracking.

## Build notes

Keep it to one clear spatial moment: the wearer chooses a phrase, conveys it visibly and audibly, and optionally draws a route. Build the basic dock and phrase card flow first. Add the urgency state second. Add Air-Draw after the core controls are stable.

Use spatial 3D text, rounded glass-pill controls, a pooled 3D ribbon, hand pinch/poke interactions, and fixed phrase/audio choices. Procedural audio is generated locally and bundled with the Lens. Avoid live camera recognition, two-person synchronization, custom gesture recognition, and session-persistent memory.

The preview must demonstrate every interaction by walking around and clicking or pinching with the mouse.

## After the build

- Open the Lens in Lens Studio preview.
- Start in a world-view mode and walk until the dock is roughly at arm's length.
- Pinch "Where is the exit?" and verify that the text bubble appears clearly.
- Select each aura and verify Calm, Question, and Urgent visual changes.
- Select LEFT, AHEAD, and RIGHT and verify each glowing arrow.
- Enter Air-Draw, pinch and move to draw a continuous ribbon, release to freeze it, and use Clear.
- Confirm the real-world view remains unobstructed.
- Test that the whole flow works with mouse-driven pinch/poke and with standard hand tracking in preview.
