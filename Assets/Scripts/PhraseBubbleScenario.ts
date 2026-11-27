import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep, findSceneObjectByName } from "Leaf.lspkg/Utils/common/Utils"
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import { ElementContent } from "UIKit.lspkg/Scripts/Components/Content/ElementContent"

@component
export class PhraseBubbleScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const interactor = new DefaultLeafInteractor()
    await interactor.trigger(findInteractableByName("PhraseExit"))
    await sleep(300)
    const bubble = findSceneObjectByName("SpeechBubble")
    const phrase = findSceneObjectByName("BubbleText").getComponent("Component.Text") as Text
    const badge = findSceneObjectByName("SignalBadge").getComponent(ElementContent.getTypeName()) as ElementContent
    expect(bubble.enabled).toBe(true)
    expect(phrase.text).toBe("Where is the exit?")
    expect(badge.text).toBe("CALM SIGNAL")
  }
}
