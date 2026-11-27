import { Button } from "UIKit.lspkg/Scripts/Components/Button/Button"
import { addContentToElement } from "UIKit.lspkg/Scripts/Components/Content/ElementContentFactory"
import { ElementContent } from "UIKit.lspkg/Scripts/Components/Content/ElementContent"
import { RoundedRectangle } from "UIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangle"
import { FlexLayout } from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import { FlexItem } from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import { FlexDirection, FlexAlign, FlexJustify } from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import { CanvasController } from "UIKit.lspkg/Scripts/Utility/CanvasController"
import { createChildSceneObjectWithParentLayer } from "UIKit.lspkg/Scripts/Utility/SceneUtilities"
import { Interactable } from "InteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import { InteractableManipulation } from "InteractionKit.lspkg/Components/Interaction/InteractableManipulation/InteractableManipulation"
import { InteractionManager } from "InteractionKit.lspkg/Core/InteractionManager/InteractionManager"
import { InteractorInputType, TargetingMode } from "InteractionKit.lspkg/Core/Interactor/Interactor"
import type { Interactor } from "InteractionKit.lspkg/Core/Interactor/Interactor"
import { HandInputData } from "InteractionKit.lspkg/Providers/HandInputData/HandInputData"
import WorldCameraFinderProvider from "InteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"

type UrgencyState = "Calm" | "Question" | "Urgent"
type Direction = "Left" | "Ahead" | "Right"

const RIBBON_WIDTH = 0.45
const RIBBON_MIN_STEP = 0.35
const RIBBON_OVERLAP = 0.15
const MAX_RIBBON_SEGMENTS = 90

@component
export class SilentSignMain extends BaseScriptComponent {
  private phrase = ""
  private urgency: UrgencyState = "Calm"
  private selectedDirection: Direction | null = null
  private drawModeActive = false
  private arrowBeingDragged = false
  private activeRibbonCount = 0
  private pulseTime = 0
  private pulseApplied = false

  private rootObject: SceneObject | null = null
  private bubble: SceneObject | null = null
  private bubbleText: Text | null = null
  private bubbleTransform: Transform | null = null
  private bubbleBaseScale: vec3 | null = null
  private bubbleShape: RoundedRectangle | null = null
  private signalBadgeContent: ElementContent | null = null
  private airDrawContent: ElementContent | null = null
  private arrow: SceneObject | null = null
  private arrowText: Text | null = null
  private arrowTransform: Transform | null = null
  private arrowCollider: ColliderComponent | null = null
  private arrowInteractable: Interactable | null = null
  private arrowManipulation: InteractableManipulation | null = null
  private lastDrawPoint: vec3 | null = null
  private currentDrawingInteractor: Interactor | null = null
  private ribbonSegments: Array<{ object: SceneObject; visual: RoundedRectangle }> = []
  private selectionAudio: AudioComponent | null = null
  private urgencyAudio: AudioComponent | null = null
  private clearAudio: AudioComponent | null = null

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => this.buildExperience())
    this.createEvent("UpdateEvent").bind(() => this.updateExperience(getDeltaTime()))
  }

  private buildExperience(): void {
    const root = this.sceneObject
    this.rootObject = root

    const canvas = new CanvasController(root)
    canvas.ensure(new vec2(36, 37))
    const back = root.createComponent(RoundedRectangle.getTypeName()) as RoundedRectangle
    back.size = new vec2(36, 37)
    back.cornerRadius = 3
    back.backgroundColor = new vec4(0.025, 0.05, 0.08, 0.82)
    back.border = true
    back.borderSize = 0.16
    back.borderColor = new vec4(0.28, 0.78, 0.9, 0.92)
    back.initialize()

    const column = root.createComponent(FlexLayout.getTypeName()) as FlexLayout
    column.direction = FlexDirection.Column
    column.width = 34
    column.height = 35
    column.justifyContent = FlexJustify.Center
    column.alignItems = FlexAlign.Stretch
    column.rowGap = 0.3

    this.addLabel(root, "SilentSign", "SILENT SIGN  ·  COMMUNICATION DOCK", 33, 2.2, 31)
    this.addPhrase(root, "PhraseExit", "Where is the exit?", () => this.selectPhrase("Where is the exit?"))
    this.addPhrase(root, "PhraseHelp", "I need help", () => this.selectPhrase("I need help"))
    this.addPhrase(root, "PhraseThanks", "Thank you", () => this.selectPhrase("Thank you"))
    this.addPhrase(root, "PhraseSlow", "Please speak slowly", () => this.selectPhrase("Please speak slowly"))

    this.addLabel(root, "UrgencyLabel", "URGENCY  ·  SIGNAL LEVEL", 33, 1.5, 28)
    const urgencyRow = this.addRow(root, "UrgencyTargets", 3.4, 33)
    this.addChoice(urgencyRow, "Calm", "CALM", () => this.setUrgency("Calm"), "Secondary", 10.1, 3.4)
    this.addChoice(urgencyRow, "Question", "AMBER", () => this.setUrgency("Question"), "Secondary", 10.1, 3.4)
    this.addChoice(urgencyRow, "Urgent", "URGENT", () => this.setUrgency("Urgent"), "Secondary", 10.1, 3.4)

    this.addLabel(root, "DirectionLabel", "QUICK DIRECTIONS", 33, 1.5, 28)
    const directionRow = this.addRow(root, "QuickDirections", 3.4, 33)
    this.addChoice(directionRow, "DirectionLeft", "← LEFT", () => this.selectDirection("Left"), "Secondary", 10.4, 3.4)
    this.addChoice(directionRow, "DirectionAhead", "↑ AHEAD", () => this.selectDirection("Ahead"), "Secondary", 10.4, 3.4)
    this.addChoice(directionRow, "DirectionRight", "→ RIGHT", () => this.selectDirection("Right"), "Secondary", 10.4, 3.4)

    const actionRow = this.addRow(root, "DockActions", 3.4, 33)
    this.airDrawContent = this.addChoice(actionRow, "AirDraw", "AIR-DRAW", () => this.toggleDraw(), "Secondary", 16.1, 3.4)
    this.addChoice(actionRow, "Clear", "CLEAR / DISMISS", () => this.clearContent(), "Secondary", 16.1, 3.4)
    urgencyRow.getComponent(FlexLayout.getTypeName())!.refreshChildren()
    directionRow.getComponent(FlexLayout.getTypeName())!.refreshChildren()
    actionRow.getComponent(FlexLayout.getTypeName())!.refreshChildren()
    column.refreshChildren()

    this.bubble = this.findChild(root, "SpeechBubble")
    this.arrow = this.findChild(root, "DrawnArrow")
    if (!this.bubble || !this.arrow) {
      throw new Error("SilentSign requires SpeechBubble and DrawnArrow scene objects.")
    }

    const textObj = this.findChild(this.bubble, "BubbleText")
    const arrowTextObj = this.arrow.getComponent("Component.Text")
    if (!textObj || !arrowTextObj) {
      throw new Error("SilentSign requires Text components on BubbleText and DrawnArrow.")
    }
    this.bubbleText = textObj.getComponent("Component.Text")
    this.arrowText = arrowTextObj
    this.bubbleTransform = this.bubble.getTransform()
    this.bubbleBaseScale = this.bubbleTransform.getLocalScale()
    this.arrowTransform = this.arrow.getTransform()

    this.configureBubble(textObj)
    this.configureArrow(root)
    this.selectionAudio = this.createAudio(
      "SilentSignSelectionAudio",
      requireAsset("../GeneratedSFX/SilentSignSelection.wav") as AudioTrackAsset
    )
    this.urgencyAudio = this.createAudio(
      "SilentSignUrgencyAudio",
      requireAsset("../GeneratedSFX/SilentSignUrgency.wav") as AudioTrackAsset
    )
    this.clearAudio = this.createAudio(
      "SilentSignClearAudio",
      requireAsset("../GeneratedSFX/SilentSignClear.wav") as AudioTrackAsset
    )
    this.paintUrgency()
    this.logState()
  }

  private configureBubble(textObj: SceneObject): void {
    const bubble = this.bubble!
    const card = bubble.createComponent(RoundedRectangle.getTypeName()) as RoundedRectangle
    card.size = new vec2(36, 15)
    card.cornerRadius = 2.8
    card.backgroundColor = new vec4(0.025, 0.13, 0.095, 0.92)
    card.border = true
    card.borderSize = 0.3
    card.borderColor = new vec4(0.2, 1, 0.62, 1)
    card.initialize()
    this.bubbleShape = card

    const contentRoot = createChildSceneObjectWithParentLayer("BubbleContent", bubble)
    contentRoot.getTransform().setLocalPosition(new vec3(0, 0, 0.15))
    const layout = contentRoot.createComponent(FlexLayout.getTypeName()) as FlexLayout
    layout.direction = FlexDirection.Column
    layout.width = 33
    layout.height = 13.2
    layout.justifyContent = FlexJustify.Center
    layout.alignItems = FlexAlign.Stretch
    layout.rowGap = 0.3

    const badgeObject = createChildSceneObjectWithParentLayer("SignalBadge", contentRoot)
    const badgeItem = badgeObject.createComponent(FlexItem.getTypeName()) as FlexItem
    badgeItem.overrideWidth = 30
    badgeItem.overrideHeight = 3.2
    badgeItem.flexShrink = 0
    const badgeButton = badgeObject.createComponent(Button.getTypeName()) as Button
    badgeButton.size = new vec3(30, 3.2, 1)
    badgeButton.setVariant({ theme: "System3", shape: "Capsule", style: "Secondary" })
    badgeButton.initialize()
    this.signalBadgeContent = addContentToElement(badgeObject, {
      text: "CALM SIGNAL",
      textSize: 30,
      autoResize: false,
      sizeOverride: new vec2(30, 3.2)
    })
    this.signalBadgeContent.useTextColorOverride = true
    this.signalBadgeContent.textColorOverride = new vec4(0.35, 1, 0.73, 1)

    textObj.setParent(contentRoot)
    textObj.getTransform().setLocalPosition(new vec3(0, 0, 0.1))
    const phraseItem = textObj.createComponent(FlexItem.getTypeName()) as FlexItem
    phraseItem.overrideWidth = 33
    phraseItem.overrideHeight = 8.7
    phraseItem.flexShrink = 0
    this.bubbleText!.size = 58
    this.bubbleText!.weight = 600
    this.bubbleText!.textFill.color = new vec4(1, 1, 1, 1)
    this.bubbleText!.renderOrder = 120

    layout.refreshChildren()
    bubble.enabled = false
  }

  private configureArrow(root: SceneObject): void {
    const arrow = this.arrow!
    const arrowText = this.arrowText!
    arrow.setParent(root)
    arrow.getTransform().setLocalPosition(new vec3(-12, 31, 12))
    arrow.enabled = true
    arrowText.text = ""
    arrowText.size = 220
    arrowText.weight = 900
    arrowText.textFill.color = new vec4(0.25, 0.96, 1, 1)
    arrowText.outlineSettings.enabled = true
    arrowText.outlineSettings.size = 0.55
    arrowText.outlineSettings.fill.color = new vec4(0.78, 1, 1, 1)
    arrowText.renderOrder = 140
    arrowText.enabled = false

    const collider = arrow.createComponent("Physics.ColliderComponent") as ColliderComponent
    this.arrowCollider = collider
    const hitbox = Shape.createBoxShape()
    hitbox.size = new vec3(20, 18, 3)
    collider.shape = hitbox
    collider.enabled = false
    const interactable = arrow.createComponent(Interactable.getTypeName()) as Interactable
    interactable.targetingMode = TargetingMode.All
    interactable.enabled = false
    this.arrowInteractable = interactable
    const manipulation = arrow.createComponent(InteractableManipulation.getTypeName()) as InteractableManipulation
    manipulation.enabled = false
    manipulation.onManipulationStart.add(() => this.beginArrowStroke())
    manipulation.onManipulationEnd.add(() => this.endArrowStroke())
    this.arrowManipulation = manipulation
  }

  private createAudio(name: string, track: AudioTrackAsset): AudioComponent {
    const root = this.rootObject!
    const audioObject = createChildSceneObjectWithParentLayer(name, root)
    const audio = audioObject.createComponent("Component.AudioComponent") as AudioComponent
    audio.audioTrack = track
    audio.playbackMode = Audio.PlaybackMode.LowLatency
    audio.volume = 0.55
    audio.spatialAudio.enabled = false
    return audio
  }

  private addLabel(parent: SceneObject, name: string, label: string, width: number, height: number, textSize: number): void {
    const obj = createChildSceneObjectWithParentLayer(name, parent)
    const item = obj.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = height
    item.flexShrink = 0
    const button = obj.createComponent(Button.getTypeName()) as Button
    button.size = new vec3(width, height, 1)
    button.setVariant({ theme: "System3", shape: "Capsule", style: "Ghost" })
    button.initialize()
    addContentToElement(obj, { text: label, textSize, autoResize: false, sizeOverride: new vec2(width, height) })
    obj.getTransform().setLocalPosition(new vec3(0, 0, 0.1))
  }

  private addPhrase(parent: SceneObject, name: string, label: string, action: () => void): void {
    this.addChoice(parent, name, label, action, "Secondary")
  }

  private addRow(parent: SceneObject, name: string, height: number, width: number): SceneObject {
    const obj = createChildSceneObjectWithParentLayer(name, parent)
    const item = obj.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideHeight = height
    item.flexShrink = 0
    const row = obj.createComponent(FlexLayout.getTypeName()) as FlexLayout
    row.direction = FlexDirection.Row
    row.width = width
    row.height = height
    row.justifyContent = FlexJustify.SpaceBetween
    row.alignItems = FlexAlign.Stretch
    row.columnGap = 0.45
    return obj
  }

  private addChoice(
    parent: SceneObject,
    name: string,
    label: string,
    action: () => void,
    style: string,
    width = 33,
    height = 3.1
  ): ElementContent {
    const obj = createChildSceneObjectWithParentLayer(name, parent)
    const item = obj.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideWidth = width
    item.overrideHeight = height
    item.flexShrink = 0
    const button = obj.createComponent(Button.getTypeName()) as Button
    button.size = new vec3(width, height, 1)
    button.setVariant({ theme: "System3", shape: "Capsule", style })
    button.initialize()
    const content = addContentToElement(obj, {
      text: label,
      textSize: 52,
      autoResize: false,
      sizeOverride: new vec2(width, height)
    })
    obj.getTransform().setLocalPosition(new vec3(0, 0, 0.1))
    button.onTriggerUp.add(action)
    return content
  }

  private selectPhrase(value: string): void {
    this.phrase = value
    if (this.bubble && this.bubbleText) {
      this.bubbleText.text = value
      this.bubble.enabled = true
      this.paintUrgency()
    }
    this.playCue(this.selectionAudio)
    this.logState()
  }

  private setUrgency(value: UrgencyState): void {
    this.urgency = value
    this.paintUrgency()
    this.playCue(this.urgencyAudio)
    this.logState()
  }

  private paintUrgency(): void {
    if (!this.bubbleShape || !this.signalBadgeContent) return
    let color: vec4
    if (this.urgency === "Question") {
      color = new vec4(1, 0.64, 0.18, 1)
      this.signalBadgeContent.text = "QUESTION SIGNAL"
      this.bubbleShape.backgroundColor = new vec4(0.16, 0.09, 0.025, 0.94)
    } else if (this.urgency === "Urgent") {
      color = new vec4(1, 0.26, 0.3, 1)
      this.signalBadgeContent.text = "URGENT ALERT"
      this.bubbleShape.backgroundColor = new vec4(0.17, 0.025, 0.035, 0.94)
    } else {
      color = new vec4(0.35, 1, 0.73, 1)
      this.signalBadgeContent.text = "CALM SIGNAL"
      this.bubbleShape.backgroundColor = new vec4(0.025, 0.13, 0.095, 0.94)
    }
    this.bubbleShape.borderColor = color
    this.signalBadgeContent.textColorOverride = color
    if (this.arrowText && !this.drawModeActive && this.selectedDirection) {
      this.setArrowColor(color)
    }
  }

  private selectDirection(direction: Direction): void {
    this.drawModeActive = false
    this.currentDrawingInteractor = null
    this.lastDrawPoint = null
    this.arrowBeingDragged = false
    this.setArrowInteractionEnabled(false)
    this.airDrawContent!.text = "AIR-DRAW"
    this.selectedDirection = direction
    const glyphs: Record<Direction, string> = { Left: "←", Ahead: "↑", Right: "→" }
    if (this.arrow && this.arrowText && this.arrowTransform) {
      this.arrowText.text = glyphs[direction]
      this.arrowText.size = 220
      this.arrowText.enabled = true
      this.arrow.enabled = true
      this.arrowTransform.setLocalPosition(new vec3(22, 23, 12))
      this.setArrowColor(this.signalColor())
    }
    this.playCue(this.selectionAudio)
    this.logState()
  }

  private toggleDraw(): void {
    this.drawModeActive = !this.drawModeActive
    this.currentDrawingInteractor = null
    this.lastDrawPoint = null
    this.arrowBeingDragged = false
    this.selectedDirection = null
    this.airDrawContent!.text = this.drawModeActive ? "AIR-DRAW ACTIVE" : "AIR-DRAW"
    this.setArrowInteractionEnabled(this.drawModeActive)
    if (this.arrow && this.arrowText && this.arrowTransform) {
      this.arrow.enabled = true
      this.arrowText.enabled = this.drawModeActive
      if (this.drawModeActive) {
        this.arrowText.text = "•"
        this.arrowText.size = 90
        this.setArrowColor(new vec4(0.25, 0.96, 1, 1))
        this.arrowTransform.setLocalPosition(new vec3(-12, 31, 12))
      }
    }
    this.playCue(this.selectionAudio)
    this.logState()
  }

  private setArrowInteractionEnabled(enabled: boolean): void {
    if (this.arrowCollider) this.arrowCollider.enabled = enabled
    if (this.arrowInteractable) this.arrowInteractable.enabled = enabled
    if (this.arrowManipulation) this.arrowManipulation.enabled = enabled
  }

  private beginArrowStroke(): void {
    if (!this.drawModeActive || !this.arrowTransform) return
    this.arrowBeingDragged = true
    this.currentDrawingInteractor = null
    this.clearRibbon()
    this.lastDrawPoint = this.copyPoint(this.arrowTransform.getWorldPosition())
  }

  private endArrowStroke(): void {
    this.arrowBeingDragged = false
    this.lastDrawPoint = null
  }

  private updateExperience(deltaTime: number): void {
    this.updateUrgentPulse(deltaTime)
    if (this.drawModeActive) this.updateAirDraw()
  }

  private updateUrgentPulse(deltaTime: number): void {
    if (this.urgency === "Urgent" && this.bubble?.enabled && this.bubbleTransform && this.bubbleBaseScale) {
      this.pulseApplied = true
      this.pulseTime += deltaTime
      const breathe = (Math.sin(this.pulseTime * 3.2) + 1) * 0.5
      this.bubbleTransform.setLocalScale(this.bubbleBaseScale.uniformScale(1 + breathe * 0.05))
      if (this.bubbleShape) this.bubbleShape.opacity = 0.78 + breathe * 0.22
    } else if (this.pulseApplied) {
      this.pulseApplied = false
      this.bubbleTransform?.setLocalScale(this.bubbleBaseScale!)
      if (this.bubbleShape) this.bubbleShape.opacity = 1
    }
  }

  private updateAirDraw(): void {
    if (this.arrowBeingDragged && this.arrowTransform) {
      this.sampleDrawPoint(this.arrowTransform.getWorldPosition())
      return
    }

    let activeInteractor: Interactor | null = null
    let drawPoint: vec3 | null = null
    const interactors = InteractionManager.getInstance().getInteractorsByType(InteractorInputType.All)
    for (const interactor of interactors) {
      if (interactor.currentInteractable !== null) continue
      const handInputType = InteractorInputType.LeftHand | InteractorInputType.RightHand
      const isHandInteractor = (interactor.inputType & handInputType) !== 0
      if (!isHandInteractor && (!interactor.enabled || !interactor.isTriggering)) continue
      const candidatePoint = isHandInteractor
        ? this.getDrawingPoint(interactor)
        : this.getProjectedMousePoint(interactor)
      if (!candidatePoint) continue
      activeInteractor = interactor
      drawPoint = candidatePoint
      break
    }
    if (!activeInteractor || !drawPoint) {
      this.currentDrawingInteractor = null
      this.lastDrawPoint = null
      return
    }
    if (activeInteractor !== this.currentDrawingInteractor) {
      this.clearRibbon()
      this.currentDrawingInteractor = activeInteractor
      this.lastDrawPoint = this.copyPoint(drawPoint)
    }
    this.sampleDrawPoint(drawPoint)
    if (this.arrowTransform) this.arrowTransform.setWorldPosition(drawPoint)
  }

  private getProjectedMousePoint(interactor: Interactor): vec3 | null {
    const start = interactor.startPoint
    if (!start) return null
    const dir = interactor.direction
    if (dir && dir.length > 0.001) {
      return start.add(dir.normalize().uniformScale(115))
    }
    const cam = WorldCameraFinderProvider.getInstance().getTransform()
    return cam.getWorldPosition().add(cam.back.uniformScale(115))
  }

    private getDrawingPoint(interactor: Interactor): vec3 | null {
    const handInputData = HandInputData.getInstance()
    if ((interactor.inputType & InteractorInputType.LeftHand) !== 0) {
      const hand = handInputData.getHand("left")
      if (hand.isTracked() && hand.isPinching()) {
        return hand.indexTip.position.add(hand.thumbTip.position).uniformScale(0.5)
      }
    }
    if ((interactor.inputType & InteractorInputType.RightHand) !== 0) {
      const hand = handInputData.getHand("right")
      if (hand.isTracked() && hand.isPinching()) {
        return hand.indexTip.position.add(hand.thumbTip.position).uniformScale(0.5)
      }
    }
    return null
  }

  private sampleDrawPoint(point: vec3): void {
    if (!this.lastDrawPoint) {
      this.lastDrawPoint = this.copyPoint(point)
      return
    }
    if (this.lastDrawPoint.distance(point) < RIBBON_MIN_STEP) return
    this.addRibbonSegment(this.lastDrawPoint, point)
    this.lastDrawPoint = this.copyPoint(point)
  }

  private addRibbonSegment(start: vec3, end: vec3): void {
    if (this.activeRibbonCount >= MAX_RIBBON_SEGMENTS || !this.rootObject) return
    const delta = end.sub(start)
    const length = delta.length
    if (length <= 0) return

    let segment = this.ribbonSegments[this.activeRibbonCount]
    if (!segment) {
      const object = createChildSceneObjectWithParentLayer(`AirDrawRibbonSegment${this.activeRibbonCount}`, this.rootObject)
      const visual = object.createComponent(RoundedRectangle.getTypeName()) as RoundedRectangle
      visual.size = new vec2(RIBBON_WIDTH, length + RIBBON_OVERLAP)
      visual.cornerRadius = RIBBON_WIDTH * 0.5
      visual.border = true
      visual.borderSize = 0.45
      visual.initialize()
      segment = { object, visual }
      this.ribbonSegments.push(segment)
    }

    const tangent = delta.normalize()
    const midpoint = start.add(end).uniformScale(0.5)
    const cameraPosition = WorldCameraFinderProvider.getInstance().getWorldPosition()
    const towardCamera = cameraPosition.sub(midpoint).normalize()
    let up = tangent
    if (Math.abs(towardCamera.dot(up)) > 0.999) {
      up = Math.abs(towardCamera.dot(vec3.right())) < 0.999 ? vec3.right() : vec3.forward()
    }

    const color = this.urgency === "Question" ? new vec4(1, 0.68, 0.2, 0.98) : new vec4(0.22, 0.92, 1, 0.98)
    segment.visual.size = new vec2(RIBBON_WIDTH, length + RIBBON_OVERLAP)
    segment.visual.backgroundColor = color
    segment.visual.borderColor = new vec4(0.82, 1, 1, 0.9)
    segment.visual.opacity = 0.98
    segment.object.getTransform().setWorldPosition(midpoint)
    segment.object.getTransform().setWorldRotation(quat.lookAt(towardCamera, up))
    segment.object.enabled = true
    this.activeRibbonCount++
  }

  private clearRibbon(): void {
    for (const segment of this.ribbonSegments) segment.object.enabled = false
    this.activeRibbonCount = 0
  }

  private selectDirectionGlyph(): string {
    if (this.selectedDirection === "Left") return "←"
    if (this.selectedDirection === "Ahead") return "↑"
    if (this.selectedDirection === "Right") return "→"
    return ""
  }

  private signalColor(): vec4 {
    if (this.urgency === "Question") return new vec4(1, 0.64, 0.18, 1)
    if (this.urgency === "Urgent") return new vec4(1, 0.26, 0.3, 1)
    return new vec4(0.35, 1, 0.73, 1)
  }

  private setArrowColor(color: vec4): void {
    if (!this.arrowText) return
    this.arrowText.textFill.color = color
    this.arrowText.outlineSettings.fill.color = new vec4(
      Math.min(1, color.x + 0.3),
      Math.min(1, color.y + 0.3),
      Math.min(1, color.z + 0.3),
      1
    )
  }

  private playCue(audio: AudioComponent | null): void {
    if (!audio) return
    if (audio.isPlaying()) audio.stop(false)
    audio.play(1)
  }

  private clearContent(): void {
    this.phrase = ""
    this.selectedDirection = null
    this.drawModeActive = false
    this.arrowBeingDragged = false
    this.currentDrawingInteractor = null
    this.lastDrawPoint = null
    this.airDrawContent!.text = "AIR-DRAW"
    if (this.bubble) this.bubble.enabled = false
    if (this.arrowText) this.arrowText.enabled = false
    this.setArrowInteractionEnabled(false)
    this.clearRibbon()
    if (this.pulseApplied && this.bubbleTransform && this.bubbleBaseScale) {
      this.bubbleTransform.setLocalScale(this.bubbleBaseScale)
      if (this.bubbleShape) this.bubbleShape.opacity = 1
      this.pulseApplied = false
    }
    this.playCue(this.clearAudio)
    this.logState()
  }

  private copyPoint(point: vec3): vec3 {
    return new vec3(point.x, point.y, point.z)
  }

  private logState(): void {
    console.log(
      `[SilentSign] phrase=${this.phrase}; urgency=${this.urgency}; direction=${this.selectDirectionGlyph()}; airDraw=${this.drawModeActive}; ribbon=${this.activeRibbonCount}`
    )
  }

  private findChild(parent: SceneObject, name: string): SceneObject | null {
    for (let i = 0; i < parent.getChildrenCount(); i++) {
      const child = parent.getChild(i)
      if (child.name === name) return child
      const found = this.findChild(child, name)
      if (found) return found
    }
    return null
  }
}
