const fs = require("fs")
const path = require("path")

const PROJECT_ASSETS_SFX = "C:\\Users\\5540\\Documents\\SilentSign-AR\\Assets\\GeneratedSFX"
const ENGINE = "C:\\Users\\5540\\Documents\\SilentSign-AR\\.agents\\skills\\build-sfx\\tools"
const audio = require(ENGINE)

fs.mkdirSync(PROJECT_ASSETS_SFX, { recursive: true })

const cues = [
  ["SilentSignSelection.wav", () => audio.sfx_presets.uiBlip({ pitch: 3 })],
  ["SilentSignUrgency.wav", () => audio.sfx_presets.uiToggle({ on: true, pitch: 1 })],
  ["SilentSignClear.wav", () => audio.sfx_presets.uiClick({ character: "soft", pitch: -3 })]
]

for (const [fileName, render] of cues) {
  const buffer = render()
  audio.mix_bus.masterChain(buffer, { normalize: "peak" })
  audio.WavBuilder.write(buffer, path.join(PROJECT_ASSETS_SFX, fileName))
  console.log(`Generated ${path.join(PROJECT_ASSETS_SFX, fileName)}`)
}
