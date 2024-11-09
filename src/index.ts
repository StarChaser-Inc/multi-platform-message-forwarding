import { Context } from 'koishi'
import { Config } from './config'
import { Processor } from './processor'

export * from './config'

export function apply(ctx: Context, cfg: Config): void {
  switch (cfg.forwardMode) {
    case '单向转发': {
      for (let i = 0; i < cfg.originalAndTarget.length; i++) {
        const item = cfg.originalAndTarget[i]
        new Processor(cfg, ctx, {
          originalChannelId: item.originalChannelId,
          originalPlatform: item.originalPlatform,
          originalBotId: item.originalBotId,
          targetChannelId: item.targetChannelId,
          targetPlatform: item.targetPlatform,
          targetBotId: item.targetBotId
        })
      }
      break
    }
    case '双向转发': {
      for (let i = 0; i < cfg.originalAndTarget.length; i++) {
        const item = cfg.originalAndTarget[i]
        new Processor(cfg, ctx, {
          originalChannelId: item.originalChannelId,
          originalPlatform: item.originalPlatform,
          originalBotId: item.originalBotId,
          targetChannelId: item.targetChannelId,
          targetPlatform: item.targetPlatform,
          targetBotId: item.targetBotId
        })
        new Processor(cfg, ctx, {
          originalChannelId: item.targetChannelId,
          originalPlatform: item.targetPlatform,
          originalBotId: item.targetBotId,
          targetChannelId: item.originalChannelId,
          targetPlatform: item.originalPlatform,
          targetBotId: item.originalBotId
        })
      }
      break
    }
    case '群聊互联！': {
      const existingItems = []
      function itemExists(item, array) {
        return array.some(existingItem => JSON.stringify(existingItem) === JSON.stringify(item))
      }
      for (let a = 0; a < cfg.originalAndTargetList.length; a++) {
        for (let b = 0; b < cfg.originalAndTargetList[a].originalAndTarget.length; b++) {
          for (let c = b + 1; c < cfg.originalAndTargetList[a].originalAndTarget.length; c++) {
            const itemB = cfg.originalAndTargetList[a].originalAndTarget[b]
            const itemC = cfg.originalAndTargetList[a].originalAndTarget[c]
            const itemArray = {
              originalChannelId: itemB.originalChannelId,
              originalPlatform: itemB.originalPlatform,
              originalBotId: itemB.originalBotId,
              targetChannelId: itemC.originalChannelId,
              targetPlatform: itemC.originalPlatform,
              targetBotId: itemC.originalBotId
            }
            const reverseItemArray = {
              originalChannelId: itemC.originalChannelId,
              originalPlatform: itemC.originalPlatform,
              originalBotId: itemC.originalBotId,
              targetChannelId: itemB.originalChannelId,
              targetPlatform: itemB.originalPlatform,
              targetBotId: itemB.originalBotId
            }
            if (!itemExists(itemArray, existingItems)) {
              new Processor(cfg, ctx, itemArray)
              existingItems.push(itemArray)
            }
            if (!itemExists(reverseItemArray, existingItems)) {
              new Processor(cfg, ctx, reverseItemArray)
              existingItems.push(reverseItemArray)
            }
          }
        }
      }
    }
  }
}
