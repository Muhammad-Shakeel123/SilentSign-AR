import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep, findSceneObjectByName } from "Leaf.lspkg/Utils/common/Utils"
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { createIKInteractor } from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"

@component
export class DockIKReachScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const ik = createIKInteractor()
    await ik.trigger(findInteractableByName("PhraseExit"))
    await sleep(300)
    expect(findSceneObjectByName("SpeechBubble").enabled).toBe(true)
    expect((findSceneObjectByName("BubbleText").getComponent("Component.Text") as Text).text).toBe("Where is the exit?")
  }
}
