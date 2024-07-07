/**
 *                             _ooOoo_
 *                            o8888888o
 *                            88" . "88
 *                            (| -_- |)
 *                            O\  =  /O
 *                         ____/`---'\____
 *                       .'  \\|     |//  `.
 *                      /  \\|||  :  |||//  \
 *                     /  _||||| -:- |||||-  \
 *                     |   | \\\  -  /// |   |
 *                     | \_|  ''\---/''  |   |
 *                     \  .-\__  `-`  ___/-. /
 *                   ___`. .'  /--.--\  `. . __
 *                ."" '<  `.___\_<|>_/___.'  >'"".
 *               | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *               \  \ `-.   \_ __\ /__ _/   .-` /  /
 *          ======`-.____`-.___\_____/___.-`____.-'======
 *                             `=---='
 *          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                     佛祖保佑        永无BUG
 *            佛曰:
 *                   写字楼里写字间，写字间里程序员；
 *                   程序人员写程序，又拿程序换酒钱。
 *                   酒醒只在网上坐，酒醉还来网下眠；
 *                   酒醉酒醒日复日，网上网下年复年。
 *                   但愿老死电脑间，不愿鞠躬老板前；
 *                   奔驰宝马贵者趣，公交自行程序员。
 *                   别人笑我忒疯癫，我笑自己命太贱；
 *                   不见满街漂亮妹，哪个归得程序员？
*/







import { Context, Schema, h } from 'koishi'
import {} from 'koishi-plugin-binding-id-converter'

import {} from '@koishijs/cache'



export const name = 'multi-platform-message-forwarding'

export const reusable = true

export const inject = {
  optional: [
    'cache',
    'idconverter'
  ],
}

declare module '@koishijs/cache' {
  interface Tables {
    mpmf_message: string
    mpmf_unity: string[]
  }
}



function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

function KOOKCardMessage(){

  function plainText(text: string){
    const message = {
      "type": "section",
      "text": {
        "type": "plain-text",
        "content": `${text}`
      }
    }
    return message
  }

  function kmarkdown(text: string){
    const message = {
      "type": "section",
      "text": {
        "type": "kmarkdown",
        "content": `${text}`
      }
    }
    return message
  }

  function image(url: string){
    const message = {
      "type": "container",
      "elements": [
        {
          "type": "image",
          "src": url
        }
      ]
    }
    return message
  }

  return {
    plainText,
    kmarkdown,
    image
  }
}

function parseTextWithImages(input: string): string[] {
  const regex = /<img.*?\/?>/g
  const matches = input.match(regex)
  const resultArray: string[] = []

  input.split(regex).forEach((item, index) => {
    resultArray.push(item)
    if (matches && index < matches.length) {
      resultArray.push(matches[index])
    }
  })

  return resultArray
}

function isImgTag(element: string): boolean {
  const regex = /<img.*?\/?>/g
  return regex.test(element)
}

function extractImgSrc(imgTag: string): string | null {
  const regex = /<img.*?src=["'](.*?)["']/
  const match = imgTag.match(regex)
  return match ? match[1] : null
}

export const usage = `
### 
`




interface Original_Target {
  Original_Guild: string
  Original_Platform: string
  Original_BotID: string
  Target_Guild: string
  Target_Platform: string
  Target_BotID: string
  note?:string
}







export interface Config {
  Use_Unity_Message_ID: boolean
  Unity_Message_ID_Time : number

  UserName_Package_Format?: string
  ChannelName_Package_Format?: string

  UserName_Setting: boolean
  ChannelName_Setting: boolean
  Nickname_Setting: boolean
  Message_Wrapping_Setting: boolean
  At_Setting: boolean // TODO
  At_Target_Platform_ID: boolean // TODO
  Markdown: boolean // TODO
  customMarkdown: string // TODO
  UseMarkdownPlatform: string[]
  filterVocabulary: string[]

  Forward_Mode: string
  Original_Target: Original_Target[]
  OT_EY: {
    Original_Target: Original_Target[]
  }[]

  KOOK_Use_CardMessage: boolean
  KOOK_CardMessage_USE_MINE: boolean
  KOOK_CardMessage_MY_MESSAGE?: string
  KOOK_CardMessage_compatibilityMode: boolean
}





export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    Use_Unity_Message_ID: Schema.boolean().description('是否使用统一消息ID').default(true),
  }).description('基础设置'),
  Schema.union([
    Schema.object({
      Use_Unity_Message_ID: Schema.const(true),
      Unity_Message_ID_Time: Schema.number().description('统一消息ID的有效期（毫秒）').default(1296000000),
    }),
    Schema.object({}),
  ]),
  Schema.object({
    ChannelName_Setting: Schema.boolean().description('是否在转发消息前加上群聊/频道的名称').default(false),
  }),
  Schema.union([
    Schema.object({
      ChannelName_Setting: Schema.const(true),
      ChannelName_Package_Format: Schema.tuple([String, String]).description('请输入名称左右两旁的封装符号'),
    }),
    Schema.object({}),
  ]),

  Schema.object({
    UserName_Setting: Schema.boolean().description('是否在转发消息前加上用户的名称').default(true),
  }),
  Schema.union([
    Schema.object({
      UserName_Setting: Schema.const(true),
      UserName_Package_Format: Schema.tuple([String, String]).description('请输入名称左右两旁的封装符号').default(['[',']']),
      Nickname_Setting: Schema.boolean().description('是否使用群昵称作为消息开头（如果存在时）').default(true),
    }),
    Schema.object({}),
  ]),

  Schema.object({
    Message_Wrapping_Setting: Schema.boolean().description('是否自动换行消息原文与消息开头').default(false),
    filterVocabulary: Schema.array(String).description('过滤词列表').role('table'),
    Markdown: Schema.boolean().description('是否在支持Markdown的平台上使用Markdown修饰（优先度低于KOOK卡片消息）').default(false),
    At_Setting: Schema.boolean().description('是否自动将@用户ID转化为名称').default(false).hidden()
  }),

  Schema.union([
    Schema.object({
      Markdown: Schema.const(true),
      UseMarkdownPlatform: Schema.array(String).description('使用Markdown的平台列表').default([]).role('table')
    })
  ]),

  Schema.union([
    Schema.object({
      At_Setting: Schema.const(false),
      At_Target_Platform_ID: Schema.boolean().description('是否自动将@用户ID通过idconverter转化为目标平台的ID（需idconverter服务）').default(false)
    }),
    Schema.object({})
  ]),

  Schema.object({
    Forward_Mode: Schema.union(['单向转发','双向转发','群聊互联！']).required().description('转发模式').role('radio'),
  }).description('转发设置'),

  Schema.union([
    Schema.object({
      Forward_Mode: Schema.const('单向转发').required(),
      Original_Target: Schema.array(Schema.object({
        Original_Guild: Schema.string().required().description('消息源群聊/频道ID'),
        Original_Platform: Schema.string().required().description('消息源平台'),
        Original_BotID: Schema.string().required().description('消息源机器人ID'),
        Target_Guild: Schema.string().required().description('转发目标群聊/频道ID'),
        Target_Platform: Schema.string().required().description('转发目标平台'),
        Target_BotID: Schema.string().required().description('转发目标机器人ID'),
        note: Schema.string().description('备注')
      })).role('table').description('消息源与转发目标（单向转发）')
    }),

    Schema.object({
      Forward_Mode: Schema.const('双向转发').required(),
      Original_Target: Schema.array(Schema.object({
        Original_Guild: Schema.string().required().description('群聊/频道ID（1）'),
        Original_Platform: Schema.string().required().description('平台（1）'),
        Original_BotID: Schema.string().required().description('机器人ID（1）'),
        Target_Guild: Schema.string().required().description('群聊/频道ID（2）'),
        Target_Platform: Schema.string().required().description('平台（2）'),
        Target_BotID: Schema.string().required().description('机器人ID（2）'),
        note: Schema.string().description('备注')
      })).role('table').description('消息源与转发目标（双向转发）')
    }),

    Schema.object({
      Forward_Mode: Schema.const('群聊互联！').required(),
      OT_EY: Schema.array(Schema.object({
        Original_Target: Schema.array(Schema.object({
          Original_Guild: Schema.string().required().description('群聊/频道ID'),
          Original_Platform: Schema.string().required().description('平台'),
          Original_BotID: Schema.string().required().description('机器人ID'),
          Target_Guild: Schema.string().hidden().default('nothing'),
          Target_Platform: Schema.string().hidden().default('nothing'),
          Target_BotID: Schema.string().hidden().default('nothing'),
          note: Schema.string().description('备注')
        })).role('table').description('消息源与转发目标（群聊互联！）')
      })).description('群聊互联列表')
    })
  ]),

  Schema.object({
    KOOK_Use_CardMessage: Schema.boolean().description('KOOK是否使用卡片消息').default(false).experimental()
  }).description('平台设置'),

  Schema.union([
    Schema.object({
      KOOK_Use_CardMessage: Schema.const(true).required(),
      KOOK_CardMessage_USE_MINE: Schema.boolean().description('是否自定义卡片消息内容').default(false).hidden()
    }),
    Schema.object({}),
  ]).description('卡片消息设置'),

  Schema.union([
    Schema.object({
      KOOK_CardMessage_USE_MINE: Schema.const(true).required(),
      KOOK_CardMessage_MY_MESSAGE: Schema.string().role('textarea').description('作者写的卡片消息内容太辣鸡了！lz要自己写！（注：自己写的卡片消息内容如果导致koishi崩溃等问题，一律由使用者本人承担）').hidden()
    }),
    Schema.object({}),
  ]),

  Schema.object({
    KOOK_CardMessage_compatibilityMode: Schema.boolean().description('是否使用兼容模式').default(true).hidden()
  })
]) as Schema<Config>



export function apply(ctx: Context,cfg:Config) {

  if (cfg.Use_Unity_Message_ID === true && ctx.cache){
    const cachechannel: string[] = []
    if (cfg.Forward_Mode === '群聊互联！'){
      cfg.OT_EY.forEach((channels) => {
        channels.Original_Target.forEach((channel) => {
          cachechannel.push(channel.Original_Guild)
        })
      })
    } else if (cfg.Forward_Mode === '双向转发'){
      cfg.Original_Target.forEach((channel) => {
        cachechannel.push(channel.Original_Guild)
        cachechannel.push(channel.Target_Guild)
      })
    } else if (cfg.Forward_Mode === '单向转发'){
      cfg.Original_Target.forEach((channel) => {
        cachechannel.push(channel.Original_Guild)
      })
    }
    ctx.on('message', async (session) => {
      if (cachechannel.includes(session.channelId)){
        if (!(await ctx.cache.get('mpmf_message', `${session.messageId}:${session.channelId}:${session.platform}:${session.selfId}`))){
          const unity_id_create = async() => {
            const unity_id = generateRandomString(20)
            if (await ctx.cache.get('mpmf_unity', unity_id)){
              unity_id_create()
            } else {
              return unity_id
            }
          }
          const unity_id = await unity_id_create()
          await ctx.cache.set('mpmf_message', `${session.messageId}:${session.channelId}:${session.platform}:${session.selfId}`, unity_id, cfg.Unity_Message_ID_Time)
          await ctx.cache.set('mpmf_unity', unity_id, [], cfg.Unity_Message_ID_Time)
        }
      }
    })
    ctx.on('message-deleted', async (session) => {
      if (cachechannel.includes(session.channelId)){
        const unity_id = await ctx.cache.get('mpmf_message', `${session.messageId}:${session.channelId}:${session.platform}:${session.selfId}`)
        if (unity_id){
          const message_list = (await ctx.cache.get('mpmf_unity', unity_id))
          message_list.forEach(async(message) => {
            await ctx.bots[`${message.split(':')[2]}:${message.split(':')[3]}`].deleteMessage(message.split(':')[1], message.split(':')[0])
            await ctx.cache.delete('mpmf_message', message)
            await ctx.cache.delete('mpmf_message', `${session.messageId}:${session.channelId}:${session.platform}:${session.selfId}`)
            await ctx.cache.delete('mpmf_unity', unity_id)
          })
        }
      }
    })
  }



  const pass = []

  ctx.command('TemporaryExclusion <time>', '临时排除转发功能（time单位：毫秒）', { authority: 3 })
  .action(({session} , time) => {
    pass.push(session.channelId)
    const time_num = parseInt(time)
    ctx.setTimeout(() => {
      pass.splice(pass.indexOf(session.channelId),1)
      session.send(`已恢复转发功能`)
    }, time_num)
    session.send(`已临时排除此频道转发功能${time_num}毫秒`)
  })

  ctx.command('CancelTE', '取消临时排除转发功能', { authority: 3 })
  .action(({session}) => {
    if (pass.includes(session.channelId)){
      pass.splice(pass.indexOf(session.channelId),1)
      session.send('已恢复转发功能')
    } else if (!pass.includes(session.channelId)){
      session.send('此频道未排除转发')
    }
  })


  ctx.on('message',async (session) => {

    async function Message_Forwarding(Original_Guild : string, Original_Platform : string, Original_BotID: string, Target_Guild : string, Target_Platform : string, Target_BotID: string) {
      if (cfg.filterVocabulary.some(word => session.content.includes(word))){
        return
      }
      const receive_message_id = session.messageId
      let send_message_id

      if (pass.includes(session.channelId)){
        return
      }
      try {
        if (session.channelId === Original_Guild && session.platform === Original_Platform && session.userId !== Original_BotID && session.userId !== Target_BotID){
          let userName
          if (cfg.UserName_Setting === true){
            if (cfg.Nickname_Setting === false){
              userName = session.event.member.nick
              if (!userName){
                if (typeof session.bot.getGuildMember === 'function'){
                  userName = (await session.bot.getGuildMember(session.guildId, session.userId)).nick
                }
              }
            } else if (cfg.Nickname_Setting === true){
              userName = session.username
            }
          }
          let ChannelName
          if (cfg.ChannelName_Setting === true){
            ChannelName = session.event.channel.name
            if (!ChannelName) {
                if (typeof session.bot.getChannel === 'function') {
                    ChannelName = (await session.bot.getChannel(session.channelId)).name
                } else {
                  ctx.logger.warn(`${session.platform}平台适配器不支持获取频道名称`)
                }
            }
          }

          let message

          let content: string = ''
          if (session.platform === 'kook') {
            try {
              const parsed = JSON.parse(session.event._data.content)
              if (!(typeof parsed === 'object')) {
                content = parsed
              } else {
                const contentElement = []
                parsed[0].modules.forEach(module => {
                  console.log(module)
                  switch (module.type) {
                    case 'section': {
                      contentElement.push(module.text.content)
                      break
                    }
                    case 'container': {
                      contentElement.push(<img src={module.elements[0].src} alt=''/>)
                      break
                    }
                  }
                })
                content = contentElement.join('')
              }
            } catch (e) {
              content = session.content
            }
          } else {
            content = session.content
          }
          /**
           * @param {string} content
           * 在我对kook适配器测试后发现，kook适配器无法正常处理图文混合消息（https://forum.koishi.xyz/t/topic/8363）
           * 因此使用content变量，并在此对session.platform进行检测
           */

          const modules: object[] = []
          if (cfg.KOOK_Use_CardMessage === true && Target_Platform === 'kook'){

            if (cfg.KOOK_CardMessage_USE_MINE){
              //message = cfg.KOOK_CardMessage_MY_MESSAGE
            } else {
              const MessageStart_ARR = []
              if (ChannelName) {
                MessageStart_ARR.push(`${cfg.ChannelName_Package_Format[0]}${ChannelName}${cfg.ChannelName_Package_Format[1]}`)
              }
              if (userName) {
                MessageStart_ARR.push(`${cfg.UserName_Package_Format[0]}${userName}${cfg.UserName_Package_Format[1]}`)
              }
              const MessageStart = MessageStart_ARR.join(' ')

              if (cfg.Message_Wrapping_Setting === false){
                modules.push({
                  "type": "section",
                  "text": {
                    "type": "kmarkdown",
                    "content": `(font)${MessageStart}(font)[pink]：`
                  }
                })

              } else {
                modules.push({
                  "type": "section",
                  "text": {
                    "type": "kmarkdown",
                    "content": `(font)${MessageStart}(font)[pink]`
                  }
                },
                {
                  "type": "divider"
                })
              }
            }

            const Element = parseTextWithImages(session.content)
            const elementDetermine = KOOKCardMessage()
            for (let i = 0; i < Element.length; i++){
              if (isImgTag(Element[i])){
                if (cfg.KOOK_CardMessage_compatibilityMode === true){
                  const messageInfo = []
                  if (ChannelName) {
                    messageInfo.push(`${cfg.ChannelName_Package_Format[0]}${ChannelName}${cfg.ChannelName_Package_Format[1]}`)
                  }
                  if (userName) {
                    messageInfo.push(`${cfg.UserName_Package_Format[0]}${userName}${cfg.UserName_Package_Format[1]}`)
                  }

                  if (cfg.UserName_Setting === false && cfg.ChannelName_Setting === false){
                    messageInfo.push(`${content}`)
                  } else if (cfg.Message_Wrapping_Setting === false){
                    messageInfo.push(`: ${content}`)
                  } else if (cfg.Message_Wrapping_Setting === true){
                    messageInfo.push(`: &#10;${content}`)
                  }
                  message = messageInfo.join('')
                  send_message_id = (await ctx.bots[`${Target_Platform}:${Target_BotID}`].sendMessage(Target_Guild,message)).toString()
                  if (ctx.cache){
                    if (await ctx.cache.get('mpmf_message', `${receive_message_id}:${session.channelId}:${session.platform}:${session.selfId}`)){
                      const unity_id = await ctx.cache.get('mpmf_message', `${receive_message_id}:${session.channelId}:${session.platform}:${session.selfId}`)
                      const message_list = (await ctx.cache.get('mpmf_unity', unity_id))
                      message_list.push(`${send_message_id}:${Target_Guild}:${Target_Platform}:${Target_BotID}`)
                      await ctx.cache.set('mpmf_unity', unity_id, message_list, cfg.Unity_Message_ID_Time)
                    }
                  }
                  return
                } else {
                  modules.push(elementDetermine.image((extractImgSrc(Element[i])).replace(/&amp;/g, '&')))
                }
              } else {
                modules.push(elementDetermine.plainText(Element[i]))
              }
            }
            message = [
              {
                "type": "card",
                "theme": "secondary",
                "size": "lg",
                "modules": modules
              }
            ]
            ctx.bots[`kook:${Target_BotID}`].internal.createMessage({
              type: 10,
              target_id: Target_Guild,
              content: JSON.stringify(message)
            })


          } else {
            const messageInfo = []
            if (cfg.Markdown && cfg.UseMarkdownPlatform.includes(Target_Platform)){
              if (ChannelName && userName){
                messageInfo.push(cfg.ChannelName_Package_Format[0] + ChannelName + cfg.ChannelName_Package_Format[1] + cfg.UserName_Package_Format[0] + userName + cfg.UserName_Package_Format[1])
              } else if (ChannelName && !userName){
                messageInfo.push(cfg.ChannelName_Package_Format[0] + ChannelName + cfg.ChannelName_Package_Format[1])
              } else if (!ChannelName && userName){
                messageInfo.push(cfg.UserName_Package_Format[0] + userName + cfg.UserName_Package_Format[1])
              }
              if (ChannelName || userName){
                messageInfo.push('&#10;---&#10;')
              }
              messageInfo.push('> ' + content.replace(/\n/g, '\n> '))
            } else {
              if (ChannelName) {
                messageInfo.push(`${cfg.ChannelName_Package_Format[0]}${ChannelName}${cfg.ChannelName_Package_Format[1]}`)
              }
              if (userName) {
                messageInfo.push(`${cfg.UserName_Package_Format[0]}${userName}${cfg.UserName_Package_Format[1]}`)
              }
              if (cfg.UserName_Setting === false && cfg.ChannelName_Setting === false){
                messageInfo.push(`${content}`)
              } else if (cfg.Message_Wrapping_Setting === false){
                messageInfo.push(`: ${content}`)
              } else if (cfg.Message_Wrapping_Setting === true){
                messageInfo.push(`: &#10;${content}`)
              }
            }

            let quote_message_id: string = ''
            if (session.event.message.quote && ctx.cache && cfg.Use_Unity_Message_ID){
              const unity_id_quote = await ctx.cache.get('mpmf_message', `${session.event.message.quote.messageId}:${session.channelId}:${session.platform}:${session.selfId}`)
              const target_message_id = await ctx.cache.get('mpmf_unity', unity_id_quote)
              for (let i = 0; i < target_message_id.length; i++){
                if (target_message_id[i].split(':')[1] === Target_Guild && target_message_id[i].split(':')[2] === Target_Platform && target_message_id[i].split(':')[3] === Target_BotID){
                  quote_message_id = target_message_id[i].split(':')[0]
                  break
                }
              }
            }
            let AtMessage
            message = messageInfo.join('')
            if (/<at id="([^"]*)"\/>/.exec(message)){
              if (cfg.At_Setting){
                const atList = []
                AtMessage = message.replace(/<at id="([^"]*)"\/>/,(match, p1) => {
                  atList.push({match:match,p1:p1,userName:null})
                })
                for (let i = 0; i < atList.length; i++){
                  let userName
                  const user = await session.bot.getGuildMember(session.guildId, atList[i].p1)
                  if (user.nick){
                    userName = user.nick
                  } else {
                    userName = user.user.name
                  }
                  atList[i].userName = userName
                }
                AtMessage = message.replace(/<at id="([^"]*)"\/>/g,(match, p1) => {
                  const newName = atList.find(item => item.p1 === p1).userName
                  return <at name={newName}/>
                })
              } else if (cfg.At_Target_Platform_ID){
                const atList = []
                AtMessage = message.replace(/<at id="([^"]*)"\/>/,(match, p1) => {
                  atList.push({match:match,p1:p1,userId:null})
                })
                for (let i = 0; i < atList.length; i++){
                  const userAid = await ctx.database.get('binding',{platform:session.platform,pid:atList[i].p1})
                  if (userAid.length > 0){
                    const userPid = await ctx.database.get('binding',{platform:Target_Platform,aid:userAid[0].aid})
                    atList[i].userId = userPid[0].pid
                  } else {
                    atList[i].userId = atList[i].p1
                  }
                }
                AtMessage = message.replace(/<at id="([^"]*)"\/>/g,(match, p1) => {
                  const newId = atList.find(item => item.p1 === p1).userId
                  return <at id={newId}/>
                })
              } else {
                AtMessage = message
              }
            } else {
              AtMessage = message
            }
            if (session.event.message.quote && ctx.cache && cfg.Use_Unity_Message_ID){
              send_message_id = (await ctx.bots[`${Target_Platform}:${Target_BotID}`].sendMessage(Target_Guild,h('quote', {id: quote_message_id}) + <>{AtMessage}</>)).toString()
            } else {
              send_message_id = (await ctx.bots[`${Target_Platform}:${Target_BotID}`].sendMessage(Target_Guild,AtMessage)).toString()
            }
            if (ctx.cache){
              if (await ctx.cache.get('mpmf_message', `${receive_message_id}:${session.channelId}:${session.platform}:${session.selfId}`)){
                const unity_id = await ctx.cache.get('mpmf_message', `${receive_message_id}:${session.channelId}:${session.platform}:${session.selfId}`)
                const message_list = (await ctx.cache.get('mpmf_unity', unity_id))
                message_list.push(`${send_message_id}:${Target_Guild}:${Target_Platform}:${Target_BotID}`)
                await ctx.cache.set('mpmf_unity', unity_id, message_list, cfg.Unity_Message_ID_Time)
              }
            }
          }
        }
      } catch (error) {
        ctx.logger.error(`消息转发函数错误：${error}`)
      }

    }

    switch (cfg.Forward_Mode) {
      case '单向转发':
        try {
          for (let i = 0; i < cfg.Original_Target.length; i++){
            const item = cfg.Original_Target[i]
            Message_Forwarding(
              item.Original_Guild,
              item.Original_Platform,
              item.Original_BotID,
              item.Target_Guild,
              item.Target_Platform,
              item.Target_BotID
            )
          }
        } catch (error) {
          ctx.logger.error(`单向转发模式错误：${error}`)
        }
        break
      case '双向转发':
        try {
          for (let i = 0; i < cfg.Original_Target.length; i++){
            const item = cfg.Original_Target[i]
            Message_Forwarding(
              item.Original_Guild,
              item.Original_Platform,
              item.Original_BotID,
              item.Target_Guild,
              item.Target_Platform,
              item.Target_BotID
            )
            Message_Forwarding(
              item.Target_Guild,
              item.Target_Platform,
              item.Target_BotID,
              item.Original_Guild,
              item.Original_Platform,
              item.Original_BotID
            )
          }
        } catch (error) {
          ctx.logger.error(`双向转发模式错误：${error}`)
        }
        break
      case '群聊互联！':
        try {
          const existingItems = []
          function itemExists(item, array) {
            return array.some(
              existingItem =>
                JSON.stringify(existingItem) === JSON.stringify(item)
            )
          }
          for (let f = 0; f < cfg.OT_EY.length; f++) {
            for (let i = 0; i < cfg.OT_EY[f].Original_Target.length; i++) {
              for (let o = i + 1; o < cfg.OT_EY[f].Original_Target.length; o++) {
                const item_i = cfg.OT_EY[f].Original_Target[i]
                const item_o = cfg.OT_EY[f].Original_Target[o]
                const item_array = {
                  Original_Guild: item_i.Original_Guild,
                  Original_Platform: item_i.Original_Platform,
                  Original_BotID: item_i.Original_BotID,
                  Target_Guild: item_o.Original_Guild,
                  Target_Platform: item_o.Original_Platform,
                  Target_BotID: item_o.Original_BotID
                }
                const reverse_item_array = {
                  Original_Guild: item_o.Original_Guild,
                  Original_Platform: item_o.Original_Platform,
                  Original_BotID: item_o.Original_BotID,
                  Target_Guild: item_i.Original_Guild,
                  Target_Platform: item_i.Original_Platform,
                  Target_BotID: item_i.Original_BotID
                }
                if (!itemExists(item_array, existingItems)) {
                  existingItems.push(item_array)
                  Message_Forwarding(
                    item_i.Original_Guild,
                    item_i.Original_Platform,
                    item_i.Original_BotID,
                    item_o.Original_Guild,
                    item_o.Original_Platform,
                    item_o.Original_BotID
                  )
                }
                if (!itemExists(reverse_item_array, existingItems)) {
                  existingItems.push(reverse_item_array)
                  Message_Forwarding(
                    item_o.Original_Guild,
                    item_o.Original_Platform,
                    item_o.Original_BotID,
                    item_i.Original_Guild,
                    item_i.Original_Platform,
                    item_i.Original_BotID
                  )
                }
              }
            }
          }
        } catch (error) {
          ctx.logger.error(`群聊互联模式错误：${error}`)
        }
        break
    }

  })

}

