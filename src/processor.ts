import { Config } from './config'
import { Context, Session } from 'koishi'

export class Processor {
  constructor(
    private _cfg: Config,
    private _ctx: Context,
    private _processInfo: {
      originalChannelId: string
      originalPlatform: string
      originalBotId: string
      targetChannelId: string
      targetPlatform: string
      targetBotId: string
    }
  ) {
    this._ctx.on('message', async session => {
      if (!this.filter(session)) {
        return
      }
      const headers = await this.produceHeaders(session)
      const content = (() => {
        if (this._cfg.enableMessageWrapping) {
          return headers + '\n' + session.content
        } else {
          return headers + session.content
        }
      })()
      await this.targetBot.sendMessage(this._processInfo.targetChannelId, content)
    })
  }

  public get originalBot(): Context['bots'][string] {
    return this._ctx.bots[
      `${this._processInfo.originalPlatform}:${this._processInfo.originalBotId}`
    ]
  }
  public get targetBot(): Context['bots'][string] {
    return this._ctx.bots[`${this._processInfo.targetPlatform}:${this._processInfo.targetBotId}`]
  }

  /**
   * 根据配置判断是否需要处理该消息
   * @param session 请求消息
   * @returns 是否需要处理该消息
   */
  public filter(session: Session): boolean {
    if (session.channelId !== this._processInfo.originalChannelId) {
      return false
    } // 忽略非指定频道的消息
    if (session.platform !== this._processInfo.originalPlatform) {
      return false
    } // 忽略非指定平台的消息
    if (session.userId === this._processInfo.originalBotId) {
      return false
    } // 忽略机器人自身的消息
    if (session.userId === this._processInfo.targetBotId) {
      return false
    } // 忽略目标机器人的消息
    if (session.content === undefined || session.content === null) {
      return false
    } // 忽略空消息
    if (
      this._cfg.filterVocabularyWhiteOrBlackList &&
      this._cfg.filterVocabularyList.some(word => session.content.includes(word))
    ) {
      return true
    } // 白名单过滤判断
    if (
      !this._cfg.filterVocabularyWhiteOrBlackList &&
      !this._cfg.filterVocabularyList.some(word => session.content.includes(word))
    ) {
      return false
    } // 黑名单过滤判断
    return true
  }

  /**
   * 根据配置组装头消息
   * @param session 请求消息
   * @returns 组装后的头消息
   */
  public async produceHeaders(session: Session): Promise<string> {
    const headers: string[] = []
    if (this._cfg.enableChannelName) {
      // 频道名称
      headers.push(
        this._cfg.channelNamePackageFormat[0],
        session.event.channel.name,
        this._cfg.channelNamePackageFormat[1]
      )
    }
    if (this._cfg.enableUserName) {
      // 用户名称
      if (this._cfg.enableNickName) {
        headers.push(
          this._cfg.userNamePackageFormat[0],
          session.username,
          this._cfg.userNamePackageFormat[1]
        )
      } else {
        const userName = (await session.bot.getGuildMember(session.guildId, session.userId)).name
        headers.push(
          this._cfg.userNamePackageFormat[0],
          userName,
          this._cfg.userNamePackageFormat[1]
        )
      }
    }
    if (this._cfg.enableChannelName || this._cfg.enableUserName) {
      headers.push(': ')
    }
    return headers.join('')
  }
}
