import { Schema } from 'koishi'

export const name = 'multi-platform-message-forwarding'

export const reusable = true

export const inject = {}

interface originalAndTarget {
  originalChannelId: string
  originalPlatform: string
  originalBotId: string
  targetChannelId: string
  targetPlatform: string
  targetBotId: string
}

export interface Config {
  userNamePackageFormat?: [string, string] // 用户名包装符号
  channelNamePackageFormat?: [string, string] // 群聊/频道名称包装符号

  enableUserName: boolean // 是否在转发消息前加上用户的名称
  enableChannelName: boolean // 是否在转发消息前加上群聊/频道的名称
  enableNickName: boolean // 是否使用群昵称作为消息开头（如果存在时）
  enableMessageWrapping: boolean // 是否自动换行消息原文与消息开头

  filterVocabularyWhiteOrBlackList: boolean // 是否过滤词列表为白名单
  filterVocabularyList: string[] // 过滤词列表

  forwardMode: '单向转发' | '双向转发' | '群聊互联！' // 转发模式
  originalAndTarget: originalAndTarget[] // 单向/双向转发模式的消息源与转发目标列表
  originalAndTargetList: {
    originalAndTarget: originalAndTarget[]
  }[] // 群聊互联模式的消息源与转发目标列表
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    enableUserName: Schema.boolean().description('是否在转发消息前加上用户的名称').default(true),
    enableChannelName: Schema.boolean()
      .description('是否在转发消息前加上群聊/频道的名称')
      .default(false),
    enableMessageWrapping: Schema.boolean()
      .description('是否自动换行消息原文与消息开头')
      .default(false),
    filterVocabularyWhiteOrBlackList: Schema.boolean()
      .description('过滤词列表是否为白名单')
      .default(false),
    filterVocabularyList: Schema.array(String).description('过滤词列表').default([]).role('table')
  }).description('基础设置'),
  Schema.union([
    Schema.object({
      enableUserName: Schema.const(true),
      userNamePackageFormat: Schema.tuple([String, String])
        .description('请输入名称左右两旁的封装符号')
        .default(['[', ']']),
      enableNickName: Schema.boolean()
        .description('是否使用群昵称作为消息开头（如果存在时）')
        .default(true)
    }),
    Schema.object({})
  ]),
  Schema.union([
    Schema.object({
      enableChannelName: Schema.const(true).required(),
      channelNamePackageFormat: Schema.tuple([String, String])
        .description('请输入名称左右两旁的封装符号')
        .default(['[', ']'])
    }),
    Schema.object({})
  ]),

  Schema.object({
    forwardMode: Schema.union(['单向转发', '双向转发', '群聊互联！'])
      .required()
      .description('转发模式')
      .role('radio')
  }).description('转发设置'),
  Schema.union([
    Schema.object({
      forwardMode: Schema.const('单向转发').required(),
      originalAndTarget: Schema.array(
        Schema.object({
          originalChannelId: Schema.string().description('消息源群聊/频道ID').required(),
          originalPlatform: Schema.string().description('消息源平台').required(),
          originalBotId: Schema.string().description('消息源机器人ID').required(),
          targetChannelId: Schema.string().description('转发目标群聊/频道ID').required(),
          targetPlatform: Schema.string().description('转发目标平台').required(),
          targetBotId: Schema.string().description('转发目标机器人ID').required(),
          note: Schema.string().description('备注').default('')
        })
      )
        .description('消息源与转发目标（单向转发）')
        .role('table')
    }),

    Schema.object({
      forwardMode: Schema.const('双向转发').required(),
      originalAndTarget: Schema.array(
        Schema.object({
          originalChannelId: Schema.string().description('群聊/频道ID（1）').required(),
          originalPlatform: Schema.string().description('平台（1）').required(),
          originalBotId: Schema.string().description('机器人ID（1）').required(),
          targetChannelId: Schema.string().description('群聊/频道ID（2）').required(),
          targetPlatform: Schema.string().description('平台（2）').required(),
          targetBotId: Schema.string().description('机器人ID（2').required(),
          note: Schema.string().description('备注').default('')
        })
      )
        .role('table')
        .description('消息源与转发目标（双向转发）')
    }),

    Schema.object({
      forwardMode: Schema.const('群聊互联！').required(),
      originalAndTargetList: Schema.array(
        Schema.object({
          originalAndTarget: Schema.array(
            Schema.object({
              originalChannelId: Schema.string().description('群聊/频道ID').required(),
              originalPlatform: Schema.string().description('平台').required(),
              originalBotId: Schema.string().description('机器人ID').required(),
              note: Schema.string().description('备注').default('')
            })
          )
            .description('消息源与转发目标（群聊互联！）')
            .role('table')
        })
      ).description('群聊互联列表')
    })
  ])
]) as Schema<Config>
