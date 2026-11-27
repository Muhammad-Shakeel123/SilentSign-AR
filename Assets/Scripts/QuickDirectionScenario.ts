import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep, findSceneObjectByName } from "Leaf.lspkg/Utils/common/Utils"
import { findInteractableByName } from "Leaf.lspkg/Interactors/InteractableUtils"
import { DefaultLeafInteractor } from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"

@component
export class QuickDirectionScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const interactor = new DefaultLeafInteractor()
    const arrow = findSceneObjectByName("DrawnArrow").getComponent("Component.Text") as Text

    await interactor.trigger(findInteractableByName("DirectionLeft"))
    expect(arrow.enabled).toBe(true)
    expect(arrow.text).toBe("←")

    await interactor.trigger(findInteractableByName("DirectionAhead"))
    expect(arrow.text).toBe("↑")

    await interactor.trigger(findInteractableByName("DirectionRight"))
    expect(arrow.text).toBe("→")
  }
}
