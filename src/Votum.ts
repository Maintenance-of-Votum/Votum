import * as Discord from "discord.js"
// import * as Commando from "discord.js-commando"
// import * as path from "path"
// import Command from "./commands/Command.text"
import Council from "./Council"
import CouncilCommand from "./commands/votum/CouncilCommand"
import { ICommand } from "./commands/ICommand"
import PingCommand from "./commands/votum/PingCommand"

require("dotenv").config()

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})

class Votum {
  public bot: Discord.Client
  private councilMap: Map<Discord.Snowflake, Council>
  private commands: Map<string, ICommand>

  constructor() {
    this.bot = new Discord.Client({
      intents: ["GuildMembers", "Guilds", "GuildMessages"],
    })

    this.councilMap = new Map()

    this.bot.on("ready", () => {
      console.log("Votum is ready.")

      this.setActivity()
      setInterval(this.setActivity.bind(this), 1000000)
    })

    this.registerCommands()

    this.bot.on(Discord.Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return

      const council = this.getCouncil(interaction.channelId)

      if (council.enabled === false && interaction.commandName !== "council") {
        await interaction.reply({
          content:
            "This is not a council channel. To turn into a council channel please use `/council create` command",
          ephemeral: true,
        })
        return
      }

      await council.initialize()

      this.commands.get(interaction.commandName)?.execute(interaction, council)
    })

    this.bot.login(process.env.TOKEN)
  }

  public static bootstrap(): Votum {
    return ((global as any).Votum = new Votum())
  }

  public getCouncil(id: Discord.Snowflake): Council {
    if (this.councilMap.has(id)) {
      return this.councilMap.get(id)!
    }

    const channel = this.bot.channels.cache.get(id)

    if (channel == null) {
      throw new Error("Channel doesn't exist.")
    }

    const council = new Council(channel as Discord.TextChannel)
    this.councilMap.set(id, council)

    return council
  }

  private setActivity(): void {
    this.bot.user?.setActivity("Paramore")
  }

  private registerCommands(): void {
    this.commands = new Map()
    this.commands.set("council", CouncilCommand)
    this.commands.set("ping", PingCommand)
  }
}

export default Votum.bootstrap()
