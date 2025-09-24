const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Store configuration for each guild
const guildConfigs = new Map();

// Command to check if a message is a slash command
function isSlashCommand(content) {
    // Check if message starts with / and contains only valid command characters
    return content.startsWith('/') && /^\/[a-zA-Z0-9_-]+(\s+.*)?$/.test(content);
}

// Timeout a user for 1 hour
async function timeoutUser(member, channel) {
    try {
        const timeoutDuration = 60 * 60 * 1000; // 1 hour in milliseconds
        await member.timeout(timeoutDuration, 'Sent non-command message in command-only channel');
        
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⚠️ User Timed Out')
            .setDescription(`<@${member.id}> has been timed out for 1 hour for sending a non-command message in a command-only channel.`)
            .setTimestamp();
        
        await channel.send({ embeds: [embed] });
        
        console.log(`Timed out user ${member.user.tag} (${member.id}) for 1 hour`);
    } catch (error) {
        console.error('Error timing out user:', error);
    }
}

// Setup slash command
const setupCommand = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the command monitor for a specific channel')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel to monitor for commands only')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption(option =>
        option.setName('role')
            .setDescription('The role that can bypass the command-only rule')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

client.once('ready', () => {
    console.log(`Bot is online! Logged in as ${client.user.tag}`);
    console.log(`Bot ID: ${client.user.id}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'setup') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: '❌ You need Administrator permissions to use this command.', 
                ephemeral: true 
            });
        }

        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');

        // Store configuration
        guildConfigs.set(interaction.guildId, {
            channelId: channel.id,
            bypassRoleId: role.id,
            guildId: interaction.guildId
        });

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Setup Complete')
            .setDescription(`Command monitor has been set up!\n\n**Monitored Channel:** ${channel}\n**Bypass Role:** ${role}\n\nUsers who send non-command messages in ${channel} will be timed out for 1 hour.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        console.log(`Setup completed for guild ${interaction.guildId}: Channel ${channel.id}, Role ${role.id}`);
    }
});

client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Get guild configuration
    const config = guildConfigs.get(message.guildId);
    if (!config) return;

    // Check if message is in the monitored channel
    if (message.channelId !== config.channelId) return;

    // Check if user has bypass role
    if (message.member.roles.cache.has(config.bypassRoleId)) return;

    // Check if message is a slash command
    if (isSlashCommand(message.content)) {
        return; // Allow slash commands
    }

    // Delete the non-command message
    try {
        await message.delete();
    } catch (error) {
        console.error('Error deleting message:', error);
    }

    // Timeout the user
    await timeoutUser(message.member, message.channel);
});

// Error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
