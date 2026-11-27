import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep, findSceneObjectByName } from "Leaf.lspkg/Utils/common/Utils"
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import { RoundedRectangle } from "UIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangle"
import { ElementContent } from "UIKit.lspkg/Scripts/Components/Content/ElementContent"

@component
export class AmberUrgencyScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const interactor = new DefaultLeafInteractor()
    await interactor.trigger(findInteractableByName("PhraseExit"))
    await interactor.trigger(findInteractableByName("Question"))
    await sleep(300)
    const bubble = findSceneObjectByName("SpeechBubble")
    const glow = bubble.getComponent(RoundedRectangle.getTypeName()) as RoundedRectangle
    const badge = findSceneObjectByName("SignalBadge").getComponent(ElementContent.getTypeName()) as ElementContent
    expect(bubble.enabled).toBe(true)
    expect(glow.borderColor.x).toBe(1)
    expect(glow.borderColor.y).toBeCloseTo(0.56, 2)
    expect(badge.text).toBe("QUESTION SIGNAL")
    expect(badge.textColorOverride.y).toBeCloseTo(0.64, 2)
  }
}
