
/**
 * 判断该行像素颜色是否一致
 * @param {CanvasRenderingContext2D} ctx - canvas context object
 * @param {number} offsetX - 左侧边距
 * @param {number} offsetY - 偏移Y
 * @param {number} width - 内容宽度
 * @param {number} step - 遍历像素的步长,设置较大步长可以更快遍历但有可能判断不准确
 * @return {boolean} 该行的像素颜色是否一致
 */
function _isLineSameColor({ ctx, offsetX, offsetY, width, step }: {
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  width: number,
  step: number,
}): boolean {
  const colorData = ctx.getImageData(offsetX, offsetY, width, 1).data
  for (let i = 4; i < colorData.length; i += step * 4) {
    // imageData 数据 4 个一组分别表示 rgba
    for (let offset = 0; offset < 4; offset += 1) {
      // 分别与第一个像素进行比较
      if (colorData[i + offset] !== colorData[offset]) {
        return false
      }
    }
  }
  return true
}

/**
 * 找到下一个可以分割的高度，如果无法找到则按最大高度分割
 * @param {CanvasRenderingContext2D} ctx - canvas context object
 * @param {number} startHeight - 开始高度
 * @param {number} pageHeight - 一页高度
 * @param {number} paddingLeft - 左侧边距
 * @param {number} contentWidth - 内容宽度(去除无需判断颜色的边距)
 * @param {number} step - 遍历像素的步长, 可加快遍历速度但设置过大会影响效果
 * @param {number} thresholdPixcels - 可分页空白行像素阈值
 * @return {number} 下一个可以分割的高度
 */
function _findNextSplitLine({
  ctx,
  startHeight,
  pageHeight,
  paddingLeft,
  contentWidth,
  step,
  splitLinePixels
}: {
  ctx: CanvasRenderingContext2D,
  startHeight: number,
  pageHeight: any,
  paddingLeft: any,
  contentWidth: number,
  step: number,
  splitLinePixels: number
}): number {
  let nextLineHeight = startHeight + pageHeight - 1 // 预留一像素
  let pixcel = 0
  while (nextLineHeight > startHeight) {
    if (
      _isLineSameColor({
        ctx,
        offsetX: paddingLeft,
        offsetY: nextLineHeight,
        width: contentWidth,
        step,
      })
    ) {
      pixcel += 1
      if (pixcel === splitLinePixels) {
        return nextLineHeight + splitLinePixels
      }
    } else {
      pixcel = 0
    }
    nextLineHeight -= 1
  }
  return startHeight + pageHeight
}


export interface SplitByPageProps {
  canvas: HTMLCanvasElement,
  paddingLeft: number,
  paddingRight: number,
  pageHeight: number,
  step: number,
  splitLinePixels: number,
}

/**
 * 遍历一张 canvas 图片，找到若干颜色一致的可用于分页的行
 * @param {number} paddingLeft - 页面左边距像素数
 * @param {number} paddingRight - 页面右边距像素数
 * @param {number} pageHeight - 单页高度像素数
 * @param {HTMLCanvasElement} canvas - canvas 图片对象
 * @param {number} step - 遍历时的步长，指定大于1的 step 在遍历像素时会跳过若干像素，加快遍历速度
 * @param {number} splitLinePixelWidth - 可分隔线最小像素数的一半
 * @return {Array} - 可以分页的高度数组
 */
export function splitByPage({
  canvas,
  paddingLeft,
  paddingRight,
  pageHeight,
  step = 2,
  splitLinePixels = 6
}: SplitByPageProps): Array<number> {
  const ctx = canvas.getContext('2d')
  const splitHeights = []
  const { width, height } = canvas
  const contentWidth = width - paddingLeft - paddingRight
  const lastStartHeight = height - pageHeight
  let startHeight = 0

  while (startHeight < lastStartHeight) {
    const nextHeight = _findNextSplitLine({
      ctx,
      startHeight,
      pageHeight: startHeight,
      paddingLeft,
      contentWidth,
      step,
      splitLinePixels
    })
    splitHeights.push(nextHeight)
    startHeight = nextHeight
  }

  // 最后一页
  splitHeights.push(height)

  return splitHeights
}
