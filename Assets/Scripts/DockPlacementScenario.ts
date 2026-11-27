import { Scenario } from "Leaf.lspkg/Scenarios/scenario/Scenario"
import { expect } from "Leaf.lspkg/Utils/common/Expect"
import { sleep, findSceneObjectByName } from "Leaf.lspkg/Utils/common/Utils"

@component
export class DockPlacementScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const dock = findSceneObjectByName("DockRoot")
    expect(dock.enabled).toBe(true)
    expect(dock.getTransform().getLocalPosition().z).toBeCloseTo(-120, 0)
  }
}
