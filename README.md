# Discord Command Monitor Bot

A Discord bot that monitors a specific channel for non-command messages and automatically times out users who send regular text instead of slash commands.

## Features

- Monitors a designated channel for command-only messages
- Automatically times out users for 1 hour if they send non-command messages
- Supports role-based bypass for certain users
- Easy setup with slash commands
- Deletes non-command messages automatically

## Setup

1. **Deploy to Render.com:**
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Use the provided `render.yaml` configuration
   - Add your Discord bot token as an environment variable named `DISCORD_TOKEN`

2. **Discord Bot Setup:**
   - Create a bot at https://discord.com/developers/applications
   - Copy the bot token to your `.env` file or Render environment variables
   - Invite the bot to your server with the following permissions:
     - Send Messages
     - Manage Messages
     - Timeout Members
     - Use Slash Commands
     - Read Message History

3. **Configure the Bot:**
   - In any text channel, use the `/setup` command:
   - `/setup [channel] [role]`
   - The channel will be monitored for commands only
   - Users with the specified role can bypass the restriction

## Commands

- `/setup [channel] [role]` - Configure the bot to monitor a specific channel and set a bypass role

## How It Works

1. The bot monitors the specified channel for all messages
2. If a user (without the bypass role) sends a message that doesn't start with `/`, it:
   - Deletes the message
   - Times out the user for 1 hour
   - Sends a notification about the timeout

## Environment Variables

- `DISCORD_TOKEN` - Your Discord bot token (required)

## Requirements

- Node.js 16.0.0 or higher
- Discord.js 14.14.1 or higher
