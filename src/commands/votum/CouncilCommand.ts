import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import Council from "../../Council"
import { ICommand } from "../ICommand"

const CouncilCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName("council")
    .setDescription(
      "Designates the channel this command is run in as a council channel."
    )
    // Permissions
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    // Subcommands
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("creates a council is this channel")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The name of this council")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Unset this channel as a council channel")
    ),
  async execute(interaction: ChatInputCommandInteraction, council: Council) {
    // await interaction.deferReply()
    if (interaction.options.getSubcommand() === "remove") {
      if (council.enabled) {
        council.enabled = false
        return await interaction.reply(
          `Removed council "${council.name}". (Note: Settings are still saved if you ever enable a council in this channel again.)`
        )
      } else {
        return await interaction.reply(
          "There is no council enabled in this channel."
        )
      }
    }
    const nameInput = interaction.options.getString("name", true)
    if (council.enabled) {
      if (council.name !== nameInput) {
        council.name = nameInput
        return await interaction.reply(
          `Changed this council's name to "${nameInput}"`
        )
      } else {
        return await interaction.reply(`This council already exists.`)
      }
    } else {
      council.enabled = true
      council.name = nameInput
      return await interaction.reply(`Created council "${nameInput}"`)
    }
  },
}

export default CouncilCommand
