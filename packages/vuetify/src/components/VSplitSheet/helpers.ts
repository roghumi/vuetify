export interface DragRectHelper {
  rect: DOMRect
  localX: number
  localY: number
  percentX: number
  percentY: number
}

export function getAccumulatedArrayValues (values: number[]): number[] {
  let startVal = 0
  return values.map(v => {
    const nv = v + startVal
    startVal += v
    return nv
  })
}

export function getUnifiedDragWidth (horizontal: boolean, drag: DragRectHelper): number {
  return horizontal ? drag.rect.height : drag.rect.width
}

export function getUnifiedDragPercent (horizontal: boolean, drag: DragRectHelper): number {
  return horizontal ? drag.percentY : drag.percentX
}

export function getTouchRectData (e: TouchEvent): DragRectHelper|null {
  const touch = e.touches?.item(0)
  if (touch) {
    const rect = e.currentTarget?.getBoundingClientRect()
    const localX = Math.min(Math.max(0, touch.pageX - rect.left), rect.width)
    const localY = Math.min(Math.max(0, touch.pageY - rect.top), rect.height)
    const percentX = localX / rect.width
    const percentY = localY / rect.height
    return {
      rect,
      localX,
      localY,
      percentX,
      percentY,
    }
  }

  return null
}

export function getMouseRectData (e: MouseEvent): DragRectHelper|null {
  const rect = e.currentTarget?.getBoundingClientRect()
  const localX = Math.min(Math.max(0, e.pageX - rect.left), rect.width)
  const localY = Math.min(Math.max(0, e.pageY - rect.top), rect.height)
  const percentX = localX / rect.width
  const percentY = localY / rect.height
  return {
    rect,
    localX,
    localY,
    percentX,
    percentY,
  }
}

export function getRectData (e: MouseEvent | TouchEvent): DragRectHelper|null {
  if (e instanceof MouseEvent) {
    return getMouseRectData(e)
  } else if (e instanceof TouchEvent) {
    return getTouchRectData(e)
  }

  return null
}
