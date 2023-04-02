import { ChatInputCommand } from "@sapphire/framework"
import { Subcommand } from "@sapphire/plugin-subcommands"
import Votum from "../Votum"

// Extend `Subcommand` instead of `Command`
export class CouncilCommand extends Subcommand {
  public constructor(context: Subcommand.Context, options: Subcommand.Options) {
    super(context, {
      ...options,
      name: "council",
      requiredUserPermissions: ["Administrator"],

      subcommands: [
        {
          name: "create",
          chatInputRun: "chatInputCreate",
        },
        {
          name: "remove",
          chatInputRun: "chatInputRemove",
        },
      ],
    })
  }

  registerApplicationCommands(registry: ChatInputCommand.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName("council")
        .setDescription(
          "Designates the channel this command is run in as a council channel."
        )
        // Permissions
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
        )
    )
  }

  public async chatInputCreate(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const nameInput = interaction.options.getString("name", true)
    const council = Votum.getCouncil(interaction.channelId)
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
  }

  public async chatInputRemove(
    interaction: Subcommand.ChatInputCommandInteraction
  ) {
    const council = Votum.getCouncil(interaction.channelId)
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
}
