const { REST, Routes } = require('discord.js');
require("dotenv").config()


let commands = [];

commands.push(require(`./dist/commands/votum/CouncilCommand`).default.data.toJSON());
commands.push(require(`./dist/commands/votum/PingCommand`).default.data.toJSON());


// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

console.log(commands);

// // and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        // const data = await rest.put(
        //     Routes.applicationCommands(process.env.OWNER),
        //     { body: commands },
        // );

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.OWNER, "1089650149392924806"),
            { body: commands },
        );



        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();