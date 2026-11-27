import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep, findSceneObjectByName } from "Leaf.lspkg/Utils/common/Utils"
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import { ElementContent } from "UIKit.lspkg/Scripts/Components/Content/ElementContent"

@component
export class ClearContentScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const interactor = new DefaultLeafInteractor()
    await interactor.trigger(findInteractableByName("PhraseExit"))
    await interactor.trigger(findInteractableByName("AirDraw"))
    await interactor.drag(findInteractableByName("DrawnArrow"), new vec3(7, 4, 0), 500)
    await interactor.trigger(findInteractableByName("Clear"))
    await sleep(300)
    expect(findSceneObjectByName("SpeechBubble").enabled).toBe(false)
    expect((findSceneObjectByName("DrawnArrow").getComponent("Component.Text") as Text).enabled).toBe(false)
    expect(findSceneObjectByName("AirDrawRibbonSegment0").enabled).toBe(false)
    expect((findSceneObjectByName("AirDraw").getComponent(ElementContent.getTypeName()) as ElementContent).text).toBe("AIR-DRAW")
  }
}
