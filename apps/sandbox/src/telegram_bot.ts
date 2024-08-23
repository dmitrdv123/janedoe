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
    name: 'Exodus',
    link: 'exodus://dappbrowser/<dapp_url>'
  },
  {
    name: 'Enjin Wallet',
    link: 'enjin://<dapp_url>'
  },
  {
    name: 'Bitget Wallet',
    link: 'bitkeep://bkconnect?action=dapp&url=<dapp_url>'
  },
  {
    name: "OKX Wallet", // done
    link: "okx://wallet/dapp/url?dappUrl=<dapp_url>"
  },
  {
    name: "Binance Wallet",
    link: "binance://dapp?url=<dapp_url>"
  },
  {
    name: "Uniswap Wallet",
    link: "uniswap://?url=<dapp_url>"
  },
  {
    name: "SafePal Wallet",
    link: "safepal://open?url=<dapp_url>"
  },
  {
    name: "Rainbow Wallet",
    link: "rainbow://browser/<dapp_url>"
  },
  {
    name: "Bybit Wallet",
    link: "bybit://open?url=<dapp_url>"
  },
  {
    name: "TokenPocket Wallet",
    link: "tpoutside://open?url=<dapp_url>"
  },
  {
    name: "Ledger Live",
    link: "ledgerlive://open?url=<dapp_url>"
  },
  {
    name: "Timeless X Wallet",
    link: "timeless://open?url=<dapp_url>"
  },
  {
    name: "Safe Wallet",
    link: "safe://open?url=<dapp_url>"
  },
  {
    name: "Zerion Wallet",
    link: "zerion://open?url=<dapp_url>"
  },
  {
    name: "Robinhood Wallet",
    link: "robinhood://open?url=<dapp_url>"
  },
  {
    name: "1inch Wallet",
    link: "oneinch://open?url=<dapp_url>"
  },
  {
    name: "Crypto.com Wallet",
    link: "crypto://open?url=<dapp_url>"
  },
  {
    name: "Argent Wallet",
    link: "argent://open?url=<dapp_url>"
  },
  {
    name: "imToken Wallet",
    link: "imtoken://open?url=<dapp_url>"
  },
  {
    name: "ZenGo Wallet",
    link: "zengo://open?url=<dapp_url>"
  },
  {
    name: "Blockchain.com Wallet",
    link: "blockchain://open?url=<dapp_url>"
  },
  {
    name: "Magic Eden",
    link: "magiceden://open?url=<dapp_url>"
  },
  {
    name: "Kraken Wallet",
    link: "kraken://open?url=<dapp_url>"
  }
]

// Function to display items with pagination and optional search
function showItems(bot: TelegramBot, chatId: number, page: number = 0, queryText: string = ""): void {
  const itemsPerPage: number = 9 // Number of items per page
  const itemsPerRow: number = 3  // Number of items per row
  const filteredItems: WalletData[] = queryText ?
    allItems.filter(item => item.name.toLowerCase().includes(queryText.toLowerCase())) :
    allItems

  const startIndex: number = page * itemsPerPage
  const endIndex: number = startIndex + itemsPerPage
  const pageItems: WalletData[] = filteredItems.slice(startIndex, endIndex)

  const itemButtons: TelegramBot.InlineKeyboardButton[][] = []

  // Add search button at the top
  itemButtons.push([{ text: 'Search', callback_data: 'search' }])

  // Create buttons for each item on the current page
  for (let i = 0; i < pageItems.length; i += itemsPerRow) {
    itemButtons.push(pageItems.slice(i, i + itemsPerRow).map(item => ({
      text: item.name,
      url: `https://static.janedoe.fi?url=${encodeURIComponent(item.link.replace('<dapp_url>', encodeURIComponent(payment_link)))}`
    })))
  }

  // Add pagination buttons
  const paginationButtons: TelegramBot.InlineKeyboardButton[] = []
  if (startIndex > 0) {
    paginationButtons.push({ text: 'Previous', callback_data: `page_${page - 1}_${queryText}` })
  }
  if (endIndex < filteredItems.length) {
    paginationButtons.push({ text: 'Next', callback_data: `page_${page + 1}_${queryText}` })
  }
  if (paginationButtons.length > 0) {
    itemButtons.push(paginationButtons)
  }

  const options: TelegramBot.SendMessageOptions = {
    reply_markup: {
      inline_keyboard: itemButtons
    }
  }

  bot.sendMessage(chatId, queryText ? `Search results for "${queryText}":` : 'Or choose a wallet from below list:', options)
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
      bot.sendMessage(msg.chat.id, `Please, open following payment link and do the payment: https://${payment_link}`, {
        disable_web_page_preview: true
      })
    } else if (platform === 'mobile') {
      bot.sendMessage(msg.chat.id, `Please, copy following payment link and open it in separate browser or in your wallet if it support dApp:\n\n\`\`\`https://${payment_link}\`\`\``, {
        parse_mode: "Markdown",
        disable_web_page_preview: true
      })
      showItems(bot, msg.chat.id, 0)
    }
  } else if (data.startsWith('page_')) {
    // Handle pagination
    const [_, page, queryText] = data.split('_')
    showItems(bot, msg.chat.id, parseInt(page), queryText || '')
  } else if (data === 'search') {
    // Prompt user to enter search query
    bot.sendMessage(msg.chat.id, 'Please enter your search query:')
    bot.once('message', (searchMsg: TelegramBot.Message) => {
      const searchText: string = searchMsg.text!
      showItems(bot, msg.chat.id, 0, searchText)
    })
  }
})
