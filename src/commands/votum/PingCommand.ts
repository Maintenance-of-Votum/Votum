import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { ICommand } from "../ICommand"

const PingCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply(`Pong!`)
  },
}

export default PingCommand
