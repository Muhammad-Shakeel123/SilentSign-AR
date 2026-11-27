import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep, findSceneObjectByName } from "Leaf.lspkg/Utils/common/Utils"
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import { ElementContent } from "UIKit.lspkg/Scripts/Components/Content/ElementContent"

@component
export class AirDrawScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const interactor = new DefaultLeafInteractor()
    const arrow = findSceneObjectByName("DrawnArrow")
    const airDraw = findSceneObjectByName("AirDraw").getComponent(ElementContent.getTypeName()) as ElementContent
    await interactor.trigger(findInteractableByName("AirDraw"))
    const arrowText = arrow.getComponent("Component.Text") as Text
    expect(airDraw.text).toBe("AIR-DRAW ACTIVE")
    expect(arrowText.enabled).toBe(true)
    const start = arrow.getTransform().getLocalPosition()
    await interactor.drag(findInteractableByName("DrawnArrow"), new vec3(7, 4, 0), 800)
    await sleep(300)
    const end = arrow.getTransform().getLocalPosition()
    expect(end.x - start.x).toBeGreaterThan(1)
    expect(arrowText.enabled).toBe(true)
    expect(findSceneObjectByName("AirDrawRibbonSegment0").enabled).toBe(true)
  }
}
