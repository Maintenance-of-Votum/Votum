import { LogLevel, SapphireClient } from "@sapphire/framework"
import { GatewayIntentBits } from "discord.js"
require("dotenv").config()

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  logger: {
    level: LogLevel.Debug,
  },
  shards: "auto",
})

const main = async () => {
  try {
    client.logger.info("Logging in")
    await client.login(process.env.TOKEN)
    client.logger.info("logged in")
  } catch (error) {
    client.logger.fatal(error)
    client.destroy()
    process.exit(1)
  }
}

main()
