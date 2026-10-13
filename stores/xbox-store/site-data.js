// Xbox.com (en-US) site chrome captured 2026-10-13 with WebFetch: header mega-menu groups, footer
// columns and legal bar. Each entry is [label, local path, real URL]. Off-site destinations
// (news.xbox.com, support.xbox.com, microsoft.com, developer.microsoft.com ...) are mirrored as
// local summary pages so shoppers never leave the store mount.
const X = 'https://www.xbox.com/en-us'
const SUP = 'https://support.xbox.com/en-US'

export const MENU = [
  { label: 'Game Pass', groups: [
    { title: 'Game Pass', links: [
      ['Join Game Pass', '/en-US/xbox-game-pass', `${X}/xbox-game-pass`],
      ['Browse Games', '/en-US/xbox-game-pass/games', `${X}/xbox-game-pass/games`],
      ['Deals with Game Pass', '/en-US/xbox-game-pass/deals', `${X}/xbox-game-pass/deals`],
      ['XBOX Cloud Gaming', '/en-US/cloud-gaming', `${X}/cloud-gaming`],
    ] },
  ] },
  { label: 'Games', groups: [
    { title: 'Games', links: [
      ['Games home', '/en-US/games', `${X}/games`],
      ['Shop all console games', '/en-US/games/all-games/console', `${X}/games/all-games/console`],
      ['Shop all PC games', '/en-US/games/all-games/pc', `${X}/games/all-games/pc`],
      ['Cloud games', '/en-US/play', `${X}/play`],
      ['XBOX Play Anywhere', '/en-US/games/xbox-play-anywhere', `${X}/games/xbox-play-anywhere`],
      ['Free-to-Play games', '/en-US/games/free-to-play', `${X}/games/free-to-play`],
      ['Optimized for XBOX Series X|S', '/en-US/games/optimized', `${X}/games/optimized`],
      ['Optimized for handhelds', '/en-US/handhelds/handheld-compatibility', `${X}/handhelds/handheld-compatibility`],
      ['Backward compatible games', '/en-US/games/backward-compatibility', `${X}/games/backward-compatibility`],
      ['Sales & Specials', '/en-US/promotions/sales/sales-and-specials', `${X}/promotions/sales/sales-and-specials`],
      ['Redeem Code', '/en-US/redeem', `${X}/redeem`],
    ] },
  ] },
  { label: 'Devices', groups: [
    { title: 'Devices', links: [['Explore all devices', '/en-US/devices', `${X}/devices`]] },
    { title: 'Consoles', links: [
      ['Meet XBOX Series X|S', '/en-US/consoles', `${X}/consoles`],
      ['XBOX Series X', '/en-US/consoles/xbox-series-x', `${X}/consoles/xbox-series-x`],
      ['XBOX Series S', '/en-US/consoles/xbox-series-s', `${X}/consoles/xbox-series-s`],
      ['Shop all consoles', '/en-US/consoles/all-consoles', `${X}/consoles/all-consoles`],
      ['Compare consoles', '/en-US/consoles/compare', `${X}/consoles/compare`],
      ['Help me choose a console', '/en-US/consoles/help-me-choose', `${X}/consoles/help-me-choose`],
      ['Where to buy', '/en-US/where-to-buy', `${X}/where-to-buy`],
    ] },
    { title: 'Accessories', links: [
      ['Shop all accessories', '/en-US/accessories', `${X}/accessories`],
      ['Controllers', '/en-US/accessories#controllers', `${X}/accessories#controllers`],
      ['Design your controller', '/en-US/xbox-design-lab', 'https://xboxdesignlab.xbox.com/'],
      ['Headsets', '/en-US/accessories#headsets', `${X}/accessories#headsets`],
      ['Hard drives & storage', '/en-US/accessories#storage', `${X}/accessories#storage`],
      ['Mobile gaming accessories', '/en-US/accessories#mobile', `${X}/accessories#mobile`],
    ] },
  ] },
  { label: 'Play', groups: [
    { title: 'Play on your devices', links: [
      ['XBOX on PC', '/en-US/xbox-on-pc', `${X}/xbox-on-pc`],
      ['XBOX on handhelds', '/en-US/xbox-on-handhelds', `${X}/xbox-on-handhelds`],
      ['XBOX on mobile', '/en-US/xbox-on-mobile', `${X}/xbox-on-mobile`],
      ['XBOX on TVs', '/en-US/xbox-on-tvs', `${X}/xbox-on-tvs`],
      ['XBOX on VR headsets', '/en-US/xbox-on-vr-headsets', `${X}/xbox-on-vr-headsets`],
      ['Play', '/en-US/play', `${X}/play`],
    ] },
    { title: 'Shop', links: [
      ['Shop Games', '/en-US/games', `${X}/games`],
      ['Shop Game Pass', '/en-US/xbox-game-pass', `${X}/xbox-game-pass`],
      ['Shop Consoles', '/en-US/consoles/all-consoles', `${X}/consoles/all-consoles`],
      ['Shop Accessories', '/en-US/accessories', `${X}/accessories`],
      ['Shop Deals', '/en-US/promotions/sales/sales-and-specials', `${X}/promotions/sales/sales-and-specials`],
    ] },
  ] },
  { label: 'More', groups: [
    { title: 'Community', links: [
      ['XBOX community', '/en-US/community', `${X}/community`],
      ['XBOX 25th Anniversary', '/en-US/xbox-25th-anniversary', `${X}/xbox-25th-anniversary`],
      ['FanFest', '/en-US/community/fanfest', `${X}/community/fanfest`],
      ['XBOX News', '/en-US/news', 'https://news.xbox.com/en-us/'],
      ['Sustainability', '/en-US/community/sustainability', `${X}/community/sustainability`],
      ['Our philosophy', '/en-US/community/for-everyone', `${X}/community/for-everyone`],
      ['Family hub', '/en-US/family-hub', `${X}/family-hub`],
      ['XBOX Family Settings app', '/en-US/apps/family-settings-app', `${X}/apps/family-settings-app`],
      ['Accessible gaming', '/en-US/community/for-everyone/accessibility', `${X}/community/for-everyone/accessibility`],
      ['Community standards', '/en-US/legal/community-standards', `${X}/legal/community-standards`],
      ['XBOX Gear', '/en-US/gear', 'https://gear.xbox.com'],
      ['XBOX Game Studios', '/en-US/xbox-game-studios', 'https://shop.xboxgamestudios.com'],
    ] },
    { title: 'Support', links: [
      ['Support home', '/en-US/support', `${SUP}/`],
      ['XBOX status', '/en-US/support/xbox-live-status', `${SUP}/xbox-live-status`],
      ['Account & profile', '/en-US/support/help/account-profile/browse', `${SUP}/help/account-profile/browse`],
      ['Subscriptions & billing', '/en-US/support/help/subscriptions-billing/browse', `${SUP}/help/subscriptions-billing/browse`],
      ['Hardware & networking', '/en-US/support/help/hardware-network/browse', `${SUP}/help/hardware-network/browse`],
      ['Family & online safety', '/en-US/support/help/family-online-safety/browse', `${SUP}/help/family-online-safety/browse`],
      ['Games & apps', '/en-US/support/help/games-apps/browse', `${SUP}/help/games-apps/browse`],
      ['Friends & social activity', '/en-US/support/help/friends-social-activity/browse', `${SUP}/help/friends-social-activity/browse`],
      ['Accessible gaming', '/en-US/support/help/accessible-gaming', `${SUP}/help/accessible-gaming`],
      ['XBOX system updates', '/en-US/support/help/hardware-network/settings-updates/whats-new-xbox-one-system-updates', `${SUP}/help/hardware-network/settings-updates/whats-new-xbox-one-system-updates`],
    ] },
    { title: 'Account', links: [
      ['Profile', '/en-US/play/user', `${X}/play/user`],
      ['Rewards', '/en-US/rewards', `${X}/rewards`],
      ['Wish list', '/en-US/wishlist', `${X}/wishlist`],
    ] },
    { title: 'Developers', links: [
      ['Games', '/en-US/developers/games', 'https://developer.microsoft.com/en-us/games'],
      ['Designed for XBOX', '/en-US/designed-for-xbox', `${X}/designed-for-xbox`],
    ] },
  ] },
]

// The real "All Microsoft" flyout: off-site Microsoft products, summarised on one local page.
export const ALL_MICROSOFT = [
  ['Global', ['Microsoft 365', 'Azure', 'Copilot', 'Windows', 'Surface', 'XBOX', 'Deals', 'Small Business', 'Support']],
  ['Software', ['Windows Apps', 'Outlook', 'OneDrive', 'Microsoft Teams', 'OneNote', 'Microsoft Edge', 'Moving from Skype to Teams']],
  ['PCs & Devices', ['Computers', 'Shop XBOX', 'Accessories', 'VR & mixed reality', 'Certified Refurbished', 'Trade-in for cash']],
  ['Entertainment', ['XBOX Game Pass Ultimate', 'PC Game Pass', 'XBOX games', 'PC games']],
  ['Business', ['Microsoft AI', 'Microsoft Security', 'Dynamics 365', 'Microsoft 365 for business', 'Microsoft Power Platform', 'Windows 365', 'Small Business', 'Digital Sovereignty']],
  ['Developer & IT', ['Azure', 'Microsoft Developer', 'Microsoft Learn', 'Support for AI marketplace apps', 'Microsoft Tech Community', 'Microsoft Marketplace', 'Software companies', 'Visual Studio']],
  ['Other', ['Microsoft Rewards', 'Free downloads & security', 'Education', 'Gift cards', 'Licensing', 'Unlocked stories']],
]

export const FOOTER = [
  { title: 'Browse', links: [
    ['XBOX consoles', '/en-US/consoles', `${X}/consoles`],
    ['XBOX games', '/en-US/games', `${X}/games`],
    ['XBOX Game Pass', '/en-US/xbox-game-pass', `${X}/xbox-game-pass`],
    ['XBOX accessories', '/en-US/accessories', `${X}/accessories`],
  ] },
  { title: 'Resources', links: [
    ['XBOX News', '/en-US/news', 'https://news.xbox.com'],
    ['XBOX Support', '/en-US/support', 'https://support.xbox.com'],
    ['Feedback', '/en-US/feedback', 'https://aka.ms/xboxideas'],
    ['Community Standards', '/en-US/legal/community-standards', `${X}/legal/community-standards`],
    ['Photosensitive Seizure Warning', '/en-US/support/help/family-online-safety/online-safety/photosensitive-seizure-warning', 'https://support.xbox.com/help/family-online-safety/online-safety/photosensitive-seizure-warning'],
    ['User Research at XBOX', '/en-US/community/research', `${X}/community/research`],
  ] },
  { title: 'Microsoft Store', links: [
    ['Microsoft account', '/account', 'https://account.microsoft.com'],
    ['Microsoft Store Support', '/en-US/support/microsoft-store', 'https://support.microsoft.com/en-us/account-billing/payment-billing-and-the-microsoft-store-app-help-bdf79f17-1b6c-449c-a7fb-9ba16c7e6db2'],
    ['Returns', '/en-US/returns', 'https://support.microsoft.com/en-US/account-billing/returning-items-you-bought-from-microsoft-store-for-exchange-or-refund-81629012-aa4f-f48b-2394-8596f415072b'],
    ['Orders tracking', '/en-US/store/b/order-tracking', 'https://www.microsoft.com/en-us/store/b/order-tracking'],
    ['Store locations', '/en-US/store/locations/find-a-store', 'https://www.microsoft.com/en-us/store/locations/find-a-store'],
  ] },
  { title: 'Rewards', links: [['Rewards', '/en-US/rewards', `${X}/rewards`]] },
  { title: 'For Developers', links: [
    ['Games', '/en-US/developers/games', 'https://developer.microsoft.com/en-us/games/publish'],
    ['Designed for XBOX', '/en-US/designed-for-xbox', `${X}/designed-for-xbox`],
  ] },
]

export const LEGAL = [
  ['Your Privacy Choices', '/en-US/privacy-choices', 'https://aka.ms/yourcaliforniaprivacychoices'],
  ['Consumer Health Privacy', '/en-US/legal/consumer-health-privacy', 'https://go.microsoft.com/fwlink/?linkid=2259814'],
  ['Sitemap', '/en-US/sitemap', 'https://www.microsoft.com/en-us/sitemap1.aspx'],
  ['Contact Microsoft', '/en-US/contactus', 'https://support.microsoft.com/en-us/contactus'],
  ['Privacy & Cookies', '/en-US/privacy', 'https://go.microsoft.com/fwlink/?LinkId=521839'],
  ['Terms of use', '/en-US/terms', 'https://go.microsoft.com/fwlink/?LinkID=206977'],
  ['Trademarks', '/en-US/trademarks', 'https://www.microsoft.com/trademarks'],
  ['Third Party Notices', '/en-US/legal/legal-notices', `${X}/legal/legal-notices`],
  ['Safety & eco', '/en-US/legal/devices-safety-and-eco', 'https://www.microsoft.com/en-us/legal/compliance/devices-safety-and-eco'],
  ['About our ads', '/en-US/about-our-ads', 'https://choice.microsoft.com'],
]
