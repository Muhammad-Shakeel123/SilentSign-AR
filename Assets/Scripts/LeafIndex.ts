import { scenariosIndex } from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import { ScenarioMetadata } from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import { DockPlacementScenario } from "./DockPlacementScenario"
import { PhraseBubbleScenario } from "./PhraseBubbleScenario"
import { AmberUrgencyScenario } from "./AmberUrgencyScenario"
import { AirDrawScenario } from "./AirDrawScenario"
import { ClearContentScenario } from "./ClearContentScenario"
import { DockIKReachScenario } from "./DockIKReachScenario"
import { QuickDirectionScenario } from "./QuickDirectionScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    { id: "silent-sign-dock-placement", typename: DockPlacementScenario.getTypeName() },
    { id: "silent-sign-phrase-bubble", typename: PhraseBubbleScenario.getTypeName() },
    { id: "silent-sign-amber-urgency", typename: AmberUrgencyScenario.getTypeName() },
    { id: "silent-sign-air-draw", typename: AirDrawScenario.getTypeName() },
    { id: "silent-sign-clear-content", typename: ClearContentScenario.getTypeName() },
    { id: "silent-sign-dock-ik-reach", typename: DockIKReachScenario.getTypeName() },
    { id: "silent-sign-quick-directions", typename: QuickDirectionScenario.getTypeName() },
  ]
}
