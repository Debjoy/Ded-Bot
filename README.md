# Simple-Discord-Bot

This is just a Simple Music(for now) Discord Bot that runs on Node JS. 

The bot is open source as it's on Github for everyone to use and modify.

This bot is created for our personal use in our private server to play some music.

## Getting Started

To get the bot up and running download the source code and following the next few steps.

0. Install nodejs `v14.15.5` specific for this bot to work properly.
1. Install the required packages
    ```bash
    npm install
    ```
2. Install `ffmpeg` in your pc for running audio.
3. Copy the file `.env.example` and name it `.env`
4. Fill all values in the `.env` file
   - You need to go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a bot (if you don't have one yet)
   - Goto the "Bot" page and click on _Copy_ found in the Token area, then paste that as the `BOT_TOKEN`.
5. To start the bot you can run `npm run start`, wait a moment till you see _Ded-Bot is online!_

## Configuration

To configure the bot you can use a dot env file for setup of your Bot token.
**Do not commit your secrets to GitHub!  Use the `.env` file!**

## How to use

You can create and add your own commands by creating a new JS file in the "commands" folder.

The file gets automatically loaded when the server starts up.
Be sure to take a look at the other commands that already in this project to see how to create a new one.