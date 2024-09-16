import TelegramBot from 'node-telegram-bot-api'

interface WalletData {
  name: string
  link: string
}

// Replace with your actual bot token
const token: string = '7328382539:AAHWn374eXcdHSsVA5o-aYyWuzgqhClLkkU'

// Create a bot that uses 'polling' to fetch new updates
const bot: TelegramBot = new TelegramBot(token, { polling: true })

const payment_link: string = 'payment.janedoe.fi/2ow91ptb33y/123/usd/100'

// Dummy items for demonstration
const allItems: WalletData[] = [
  {
    name: 'MetaMask', // done
    link: 'https://metamask.app.link/dapp/<dapp_url>'
  },
  {
    name: 'Trust Wallet', // done
    link: 'https://link.trustwallet.com/open_url?url=<dapp_url>'
  },
  {
    name: 'CoinBase Wallet', // done
    link: 'https://go.cb-w.com/dapp?cb_url=<dapp_url>'
  },
  {
    name: "OKX Wallet", // done
    link: "okx://wallet/dapp/url?dappUrl=<dapp_url>"
  }
]

// Function to display text for mobile
function showMobile(bot: TelegramBot, chatId: number): void {
  const itemsPerRow: number = 4  // Number of items per row

  const itemButtons: TelegramBot.InlineKeyboardButton[][] = []

  // Create buttons for each item on the current page
  for (let i = 0; i < allItems.length; i += itemsPerRow) {
    itemButtons.push(allItems.slice(i, i + itemsPerRow).map(item => ({
      text: item.name,
      url: `https://static.janedoe.fi?url=${encodeURIComponent(item.link.replace('<dapp_url>', encodeURIComponent(payment_link)))}`
    })))
  }

  bot.sendMessage(chatId, `Please, copy following payment link and open it in separate browser or in your wallet if it support dApp:\n\`\`\`https://${payment_link}\`\`\`\n\nOr choose a wallet from below list:`, {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: itemButtons
    }
  })
}

function showDesktop(bot: TelegramBot, chatId: number): void {
  bot.sendMessage(chatId, `Please, open following payment link and do the payment: https://${payment_link}`, {
    parse_mode: "Markdown",
    disable_web_page_preview: true
  })
}

// Start command handler
bot.onText(/\/start/, (msg: TelegramBot.Message) => {
  const chatId: number = msg.chat.id
  const options: TelegramBot.SendMessageOptions = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Mobile', callback_data: 'platform_mobile' }],
        [{ text: 'Desktop', callback_data: 'platform_desktop' }]
      ]
    }
  }
  bot.sendMessage(chatId, 'Choose your platform:', options)
})

// Handle callback queries
bot.on('callback_query', (callbackQuery: TelegramBot.CallbackQuery) => {
  const msg: TelegramBot.Message = callbackQuery.message!
  const data: string = callbackQuery.data!

  if (data.startsWith('platform_')) {
    const platform = data.split('_')[1]
    if (platform === 'desktop') {
      showDesktop(bot, msg.chat.id)
    } else if (platform === 'mobile') {
      showMobile(bot, msg.chat.id)
    }
  }
})
