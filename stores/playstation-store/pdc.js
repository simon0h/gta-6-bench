// PlayStation.com, PlayStation Direct, PS Blog and PSN status pages that the store's global header,
// footer and site map link to. On the real site these live on other hosts (www.playstation.com,
// direct.playstation.com, blog.playstation.com, status.playstation.com); here they are short local
// summaries so shoppers never leave the sandbox. Headings quoted from the live pages fetched on
// 2026-10-13 are marked in research/parity/playstation-store.json; the body copy is a summary.
// No hardware, accessory or merchandise inventory is listed: PlayStation Direct category pages show
// their structure with an empty state.
import { esc } from '../../lib/html.js'
import { CONCEPT_ID } from './data.js'
import { directListing, shelfTile } from './shelf-pages.js'
import { heroIllustration } from './shelf-art.js'
import { ASSORTMENT } from './data.js'
import { fixtureCatalog } from '../../lib/catalog-policy.js'

const GTA = `/en-us/concept/${CONCEPT_ID}/`
const STORE = '/en-us/pages/latest'

// [path, eyebrow, h1, intro, sections[[h2, text, links?]], options]
const PAGES = [
  // ---- products ----
  ['/en-us/ps5', 'PS5', 'PlayStation®5', 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers and 3D Audio, and an all-new generation of incredible PlayStation games.', [
    ['Play like never before®', 'The PS5 console unleashes new gaming possibilities that you never anticipated.', [['Stunning games', '/en-us/ps5/games'], ['Lightning speed', '/en-us/ps5/ps5-features'], ['Breathtaking immersion', '/en-us/ps5/ps5-features']]],
    ['Stunning games on PS5', 'Marvel at incredible graphics and experience new PS5 features. Pre-order upcoming games on PlayStation Store.', [['Explore PS5 games', '/en-us/ps5/games'], ['Pre-order Grand Theft Auto VI', GTA]]],
    ['On-demand games with PlayStation Plus', 'Discover hundreds of PS5 and PS4 games in the Game Catalog with PlayStation Plus Extra and Premium.', [['Explore PlayStation Plus', '/en-us/ps-plus']]],
    ['Immersive play with the DualSense® wireless controller', 'Feel your in-game actions through adaptive triggers and haptic feedback.', [['DualSense wireless controller', '/en-us/accessories/dualsense-wireless-controller']]],
    ['PS5 accessories', 'Controllers, gaming audio, PlayStation Portal remote player and more to perfect your setup.', [['Controllers', '/en-us/accessories#controllers'], ['Gaming audio', '/en-us/accessories#headsets'], ['PlayStation Portal™ remote player', '/en-us/accessories/playstation-portal-remote-player'], ['Stay connected with PlayStation™ App', '/en-us/playstation-app']]],
    ['Which PS5 console is right for you?', 'Compare the PS5 console, PS5 Digital Edition and PS5 Pro, available from PlayStation Direct and participating retailers.', [['PlayStation®5 Pro', '/en-us/ps5/ps5-pro'], ['Buy consoles', '/direct.playstation.com/en-us/hardware/ps5']]],
  ], { art: 'console', gamesAfter: 1, games: ['Featured PS5 games', p => p.platforms.includes('PS5') && p.contentType === 'base-game' && p.publisher === 'Sony Interactive Entertainment'] }],
  ['/en-us/ps5/ps5-pro', 'PS5 Pro', 'PlayStation®5 Pro', 'Play the way it was meant to be played: the most powerful PlayStation console with an upgraded GPU, advanced ray tracing and AI-driven upscaling.', [
    ['Stunning visuals at higher frame rates', 'PS5 Pro Enhanced games can run at higher resolution and smoother frame rates.', [['PS5 games', '/en-us/ps5/games']]],
    ['Where to buy', 'PS5 Pro is available from PlayStation Direct and participating retailers.', [['Buy consoles', '/direct.playstation.com/en-us/hardware/ps5']]],
  ], { art: 'console-pro', games: ['PS5 Pro Enhanced games', p => p.contentType === 'base-game' && p.features?.includes('PS5 Pro Enhanced')] }],
  ['/en-us/ps5/games', 'PS5 Games', 'Unmissable PS5 games from PlayStation Studios', 'The best new and upcoming PS5 games, from PlayStation Studios blockbusters to indie gems.', [
    ['PS5 Games', 'Discover the latest releases from PlayStation Studios and partners.', [['PlayStation Studios', '/en-us/corporate/playstation-studios'], ['Browse PlayStation Store', '/en-us/pages/browse']]],
    ['Pre-order and wishlist upcoming PS5 games', 'Grand Theft Auto VI is available to pre-order on PlayStation Store.', [['Grand Theft Auto VI', GTA]]],
    ['More upcoming PS5 games', 'See what is coming soon to PlayStation Store.', [['Latest on PlayStation Store', STORE]]],
    ['PlayStation VR2 games', 'Step inside new worlds with PS VR2.', [['PS VR2 games', '/en-us/ps-vr2/games']]],
    ['Great PS4 games come alive on PS5', 'Most PS4 games are playable on PS5.', [['PS4 games', '/en-us/ps4/ps4-games']]],
    ['How innovative PS5 features enhance play', 'Adaptive triggers, haptic feedback, 3D Audio and an ultra-high speed SSD.', [['PS5 features', '/en-us/ps5/ps5-features']]],
  ], { games: ['Latest PS5 games', p => p.platforms.includes('PS5') && p.contentType === 'base-game' && p.type === 'FULL GAME'] }],
  ['/en-us/ps5/ps5-features', 'PS5', 'PS5 features', 'Ultra-high speed SSD, haptic feedback, adaptive triggers, 3D Audio, Activities and Game Help.', [
    ['Adaptive triggers', 'Feel varying levels of force and tension as you interact with in-game gear and environments.'],
    ['Haptic feedback', 'Feel physically responsive feedback to your in-game actions.'],
    ['3D Audio', 'Hear the world around you with compatible headphones or TV speakers.'],
    ['Ultra-high speed SSD', 'Maximize your play sessions with near-instant load times for installed PS5 games.'],
  ]],
  ['/en-us/ps5/ps5-entertainment', 'PS5', 'PS5 entertainment', 'Stream TV shows, movies, sport and music on PS5 with apps from leading providers.', [
    ['Apps on PS5', 'Download streaming apps from the TV & Video section on your console.'],
  ]],
  ['/en-us/ps5/accessories', 'PS5', 'PS5 accessories', 'Controllers, headsets, remote play and console add-ons designed for PS5.', [
    ['Explore accessories', 'See the full range of official and officially licensed accessories.', [['All accessories', '/en-us/accessories']]],
  ]],
  ['/en-us/ps4', 'PS4', 'PlayStation®4', 'Incredible games, endless entertainment. PS4 games are available on PlayStation Store.', [
    ['PS4 games', 'Browse PS4 games and play many of them on PS5 too.', [['PS4 games', '/en-us/ps4/ps4-games'], ['PS4 Pro', '/en-us/ps4/ps4-pro']]],
  ]],
  ['/en-us/ps4/ps4-pro', 'PS4', 'PS4 Pro', 'PS4 Pro delivered 4K-capable gaming and higher frame rates for supported PS4 games.', [
    ['Play PS4 games on PS5', 'Most PS4 games are playable on PS5 with backward compatibility.', [['PS5', '/en-us/ps5']]],
  ]],
  ['/en-us/ps4/ps4-games', 'Games', 'PS4 games', 'Discover the best PS4 games, from PlayStation Studios exclusives to indies.', [
    ['Shop PS4 games', 'Find more PS4 titles on PlayStation Store.', [['Browse PlayStation Store', '/en-us/pages/browse']]],
  ], { games: ['Popular PS4 games', p => p.platforms.includes('PS4') && p.contentType === 'base-game'] }],
  ['/en-us/ps-vr2', 'PS VR2', 'PlayStation VR2', 'Escape into worlds that feel, look and sound truly real with PS VR2 for PS5.', [
    ['PS VR2 games', 'Explore games built for virtual reality.', [['PS VR2 games', '/en-us/ps-vr2/games']]],
    ['Health and safety', 'Read the health warnings before using VR.', [['Health Warnings', '/en-us/legal/health-warning']]],
  ], { art: 'vr2' }],
  ['/en-us/ps-vr2/games', 'Games', 'PS VR2 games', 'Discover games that take full advantage of PS VR2 eye tracking, headset feedback and Sense controllers.', [
    ['Shop VR games', 'Find more VR titles on PlayStation Store.', [['Browse PlayStation Store', '/en-us/pages/browse']]],
  ], { games: ['Play in PS VR2', p => p.vr && p.vr !== 'No VR' && p.contentType === 'base-game'] }],
  ['/en-us/games/pc-games', 'Games', 'PlayStation games on PC', 'Play acclaimed PlayStation Studios games on PC, available from leading PC storefronts.', [
    ['PlayStation accessories for PC', 'DualSense and PULSE accessories support PC play.', [['All accessories', '/en-us/accessories']]],
  ]],
  ['/en-us/accessories', 'Accessories', 'PlayStation® accessories', 'The latest PlayStation accessories: controllers, audio, remote play and console add-ons.', [
    ['Wireless controllers', 'DualSense wireless controller, DualSense Edge wireless controller, Access controller and officially licensed controllers.', [['DualSense wireless controller', '/en-us/accessories/dualsense-wireless-controller']], 'controllers'],
    ['Gaming audio', 'PULSE Elite wireless headset, PULSE Explore wireless earbuds and officially licensed audio headsets.', [], 'headsets'],
    ['PS5 console add-ons', 'Vertical stand, disc drive for PS5 Digital Edition consoles and PS5 console covers.'],
    ['PS Remote Play gaming', 'Play your PS5 over Wi-Fi with PlayStation Portal Remote Player.', [['PlayStation Portal Remote Player', '/en-us/accessories/playstation-portal-remote-player']]],
    ['Extra storage', 'Add internal M.2 SSD storage or compatible external USB drives.'],
    ['Cameras & remotes', 'HD camera and media remote.'],
    ['Where to buy', 'Buy official accessories from PlayStation Direct and participating retailers.', [['Buy accessories', '/direct.playstation.com/en-us/accessories/ps5']]],
  ], { art: 'controller' }],
  ['/en-us/accessories/playstation-portal-remote-player', 'Accessories', 'PlayStation Portal™ Remote Player', 'Play your PS5 console over Wi-Fi with console-quality controls on an 8" LCD screen.', [
    ['Remote Play your PS5', 'Requires a PS5 console and a broadband internet connection with at least 5 Mbps.'],
    ['Where to buy', 'Sold by PlayStation Direct and participating retailers.', [['Buy accessories', '/direct.playstation.com/en-us/accessories/ps5']]],
  ], { art: 'portal' }],
  ['/en-us/accessories/dualsense-wireless-controller', 'Accessories', 'DualSense® wireless controller', 'Discover a deeper gaming experience with haptic feedback, adaptive triggers and a built-in microphone.', [
    ['Where to buy', 'Sold by PlayStation Direct and participating retailers.', [['Buy accessories', '/direct.playstation.com/en-us/accessories/ps5']]],
  ], { art: 'controller' }],
  ['/en-us/ps-plus', 'PlayStation Plus', 'Get more of what you love with PlayStation Plus', 'Monthly games, online multiplayer, exclusive discounts and more. Choose the plan that’s right for you.', [
    ['Benefits that enhance every way you play', 'Monthly Games, Online Multiplayer, Exclusive Discounts, Exclusive Content, Cloud Storage and Share Play.'],
    ['Discover the Game Catalog', 'Extra and Premium members can download and play hundreds of PS5 and PS4 games.', [['All Games', '/en-us/ps-plus/games']]],
    ['Compare membership plans', 'Pay monthly, every 3 months or every 12 months. Prices and benefits by plan:', [['Subscriptions on PlayStation Store', '/en-us/pages/subscriptions'], ['Manage membership', '/en-us/membership']]],
    ['Frequently asked questions', 'Memberships renew automatically until cancelled. Cancelling stops the next renewal; benefits continue until the end of the current period.', [['Subscription support', '/en-us/support/subscriptions']]],
  ], { tiers: true, art: 'plus', games: ['Game Catalog highlights', p => !!p.plusTag && p.contentType === 'base-game'] }],
  ['/en-us/ps-plus/games', 'PlayStation Plus', 'PlayStation Plus games', 'Monthly Games for every member and the Game Catalog for Extra and Premium members.', [
    ['Monthly Games', 'Essential, Extra and Premium members can add new games to their library each month.'],
    ['Game Catalog', 'Download and play a catalog of PS5 and PS4 games while your Extra or Premium membership is active.', [['Browse the store', '/en-us/pages/browse']]],
  ]],
  ['/en-us/ps-plus/whats-new', 'PlayStation Plus', "What's new on PlayStation Plus", 'The latest Monthly Games, Game Catalog additions and member benefits.', [
    ['This month', 'Check the PlayStation Blog for this month’s lineup.', [['PS Blog', '/blog.playstation.com']]],
  ]],
  ['/en-us/playstation-network', 'PSN', 'PlayStation™Network', 'Your account for PlayStation Store, online play and friends.', [
    ['2-Step verification', 'Add an extra layer of protection to your account.', [['Account & Security', '/en-us/support/account']]],
    ['PSN Status', 'Check whether services are up and running.', [['PSN Status', '/status.playstation.com']]],
  ]],
  ['/en-us/about-playstation-store', 'PS Store', 'PlayStation™Store', 'Buy and download games, add-ons and subscriptions on PS5, PS4, web and the PlayStation App.', [
    ['Shop now', 'Explore the latest releases, collections and deals.', [['Latest', STORE], ['Deals', '/en-us/pages/deals'], ['Browse', '/en-us/pages/browse']]],
    ['Ways to pay', 'Wallet funds, credit and debit cards, PayPal and PlayStation Store gift cards.', [['PlayStation Store gift cards', '/en-us/playstation-gift-cards']]],
  ]],
  ['/en-us/playstation-gift-cards', 'Gift cards', 'PlayStation™Store gift cards', 'Pre-paid PlayStation Store gift cards add funds to a PlayStation Network wallet for digital games, add-ons and subscriptions.', [
    ['A great idea for gamers', 'Give the gift of play with a PlayStation Store gift card.'],
    ['Buy a PlayStation Store gift card', 'Get an emailed code from online retailers or find physical cards at participating retailers.'],
    ['Everything you want to play', 'Buy digital games, add-ons and subscriptions on PlayStation Store, which is always open.', [['Latest on PlayStation Store', STORE]]],
    ['Pre-order. Pre-load. Play.', 'Pre-order a game and pre-load it on your console so it is ready at release.', [['Pre-order Grand Theft Auto VI', GTA]]],
    ['Redeem against anything digital on PlayStation Store', 'Use funds on thousands of digital games, add-ons and subscriptions.'],
    ['Find exclusive deals on top games', 'Regular deals and discounts are available on popular games.', [['Deals', '/en-us/pages/deals']]],
    ['PlayStation gift cards FAQ', 'Gift card funds cannot buy physical products or merchandise. Wallet funds are non-refundable. Codes are redeemed in Settings > Users and Accounts > Account > Payment and Subscriptions > Redeem Codes.', [['Redeem a PS Store voucher', '/en-us/support/store']]],
  ], { art: 'giftcard' }],
  ['/en-us/playstation-credit-card', 'PS Credit Card', 'PlayStation® Visa® Credit Card', 'Earn points on PlayStation purchases. Applications are reviewed and approved by the card issuer.', []],
  ['/en-us/playstation-app', 'PlayStation App', 'PlayStation App', 'Chat with friends, buy games on PlayStation Store and download them to your console from your phone.', []],
  ['/en-us/beta-program-at-playstation', 'Beta', 'Beta Program at PlayStation', 'Register to be considered for beta tests of upcoming games and system software.', []],
  ['/en-us/editorial/this-month-on-playstation', 'News', 'This Month on PlayStation', 'New releases, PlayStation Plus games and events this month.', [
    ['New this month', 'Grand Theft Auto VI pre-orders are open on PlayStation Store.', [['Grand Theft Auto VI', GTA], ['Latest on PlayStation Store', STORE]]],
    ['PlayStation Plus', 'See this month’s Monthly Games and Game Catalog additions.', [["What's New", '/en-us/ps-plus/whats-new']]],
  ]],
  ['/en-us/editorial/playstation-ultimate-gaming-glossary', 'Resources', 'The ultimate gaming glossary', 'Definitions of common gaming and PlayStation terms, from add-on to wallet.', []],
  ['/en-us/official-licensing-program', 'Resources', 'Official Licensing Program', 'Accessories made by partners and officially licensed for PlayStation consoles.', []],
  ['/en-us/playstation-productions', 'About', 'PlayStation Productions', 'Bringing PlayStation worlds to film and television.', []],
  ['/playstation-history/1994-ps-one', 'About', 'History of PlayStation', 'From the original PlayStation in 1994 to PS5: three decades of PlayStation.', []],
  // ---- corporate ----
  ['/en-us/corporate/about-us', 'About', 'About Sony Interactive Entertainment', 'Sony Interactive Entertainment, a wholly owned subsidiary of Sony Group Corporation headquartered in San Mateo, California, makes PlayStation hardware, network services and games.', [
    ['Who we are...', 'Since the original PlayStation launched in 1994, SIE has built consoles, PlayStation Network and games from PlayStation Studios.'],
    ['Our values', 'Accessibility, the environment, online safety and diversity, equity & inclusion.', [['Accessibility', '/en-us/accessibility'], ['PlayStation and the environment', '/en-us/corporate/playstation-and-the-environment'], ['Online safety', '/en-us/privacy-security-safety']]],
    ['PlayStation game franchises', 'Horizon, God of War, The Last of Us, Gran Turismo, Uncharted and more.', [['PlayStation Studios', '/en-us/corporate/playstation-studios']]],
    ['Careers at Sony Interactive Entertainment', 'Join the teams behind PlayStation.', [['Careers', '/en-us/corporate/playstation-careers']]],
    ['Help and support', 'Get help with your account, purchases and hardware.', [['Support', '/en-us/support']]],
    ['PlayStation regional offices', 'Europe, Middle East, Africa & Australasia (London); Americas (San Mateo); Japan & Asia (Tokyo).'],
  ]],
  ['/en-us/corporate/playstation-studios', 'About', 'PlayStation Studios', 'The family of studios making PlayStation’s first-party games.', [
    ['New releases and upcoming games', 'Explore the latest PlayStation Studios games on PlayStation Store.', [['Browse PlayStation Store', '/en-us/pages/browse']]],
    ['Our studios', 'Team Asobi, Bend Studio, Firesprite, Guerrilla Games, Haven Studios, Housemarque, Insomniac Games, Media Molecule, Naughty Dog, Nixxes, Polyphony Digital, San Diego Studio, Santa Monica Studio, Sucker Punch Productions, teamLFG and Valkyrie Entertainment.'],
    ['More games from PlayStation Studios', 'Find PlayStation Studios games for PS5, PS4 and PC.', [['PS5 games', '/en-us/ps5/games'], ['PC', '/en-us/games/pc-games']]],
  ]],
  ['/en-us/corporate/playstation-careers', 'About', 'Careers at PlayStation', 'Explore roles across Sony Interactive Entertainment and PlayStation Studios. Applications are made on the official careers site.', []],
  ['/en-us/corporate/playstation-and-the-environment', 'About', 'PlayStation and the environment', 'SIE’s approach to reducing the environmental impact of its products and operations.', []],
  ['/sie.com/en', 'Corporate', 'Sony Interactive Entertainment', 'Corporate information about Sony Interactive Entertainment: leadership, news and corporate responsibility.', [
    ['Corporate responsibility', 'Diversity, equity & inclusion, the environment and community.', [['Diversity, equity & inclusion', '/sie.com/en/csr/diversity']]],
  ]],
  ['/sie.com/en/csr/diversity', 'Corporate', 'Diversity, equity & inclusion', 'How Sony Interactive Entertainment approaches diversity, equity and inclusion across its teams and games.', []],
  ['/en-us/accessibility', 'Values', 'Accessibility', 'Accessibility features on PS5 and PS4, accessible games and the Access controller.', []],
  ['/en-us/privacy-security-safety', 'Values', 'Online safety, account security and privacy', 'Tools to keep your account secure, manage privacy and set up family controls.', [
    ['Account security', 'Turn on 2-step verification and use a passkey to sign in.', [['Account & Security', '/en-us/support/account']]],
    ['Family controls', 'Set play time and spending limits for child accounts.', [['Safety', '/en-us/support/safety']]],
  ]],
  // ---- legal ----
  ['/en-us/legal', 'Legal', 'Legal', 'Terms, policies and license agreements for PlayStation products and services.', [
    ['Legal Update Notice', 'Notices of changes to PlayStation terms and policies.'],
    ['Website and Applications', 'Privacy Policy, Copyright and Trademark notice, Website Terms of Use and Health Warning.', [['Privacy Policy', '/en-us/legal/privacy-policy'], ['Copyright and Trademark notice', '/legal/copyright-and-trademark-notice'], ['Website Terms of Use', '/en-us/legal/website-terms-of-use'], ['Health Warning', '/en-us/legal/health-warning']]],
    ['Account for PlayStation', 'The PlayStation Terms of Service, PlayStation®Store Cancellation Policy and contact information.', [['PlayStation Terms of Service', '/en-us/legal/psn-terms-of-service'], ['PlayStation®Store Cancellation Policy', '/en-us/legal/playstation-store-cancellation-policy'], ['Do Not Share My Personal Information', '/en-us/legal/third-party-ads']]],
    ['PlayStation®5', 'PlayStation®5 System Software License Agreement and guarantee.'],
  ]],
  ['/en-us/legal/privacy-policy', 'Legal', 'Privacy Policy', 'How Sony Interactive Entertainment collects, uses and shares personal information, and the choices you have.', [
    ['Your choices', 'Manage privacy settings on your console or in account management.', [['Do Not Share My Personal Information', '/en-us/legal/third-party-ads']]],
  ]],
  ['/en-us/legal/third-party-ads', 'Legal', 'Do Not Share My Personal Information', 'US residents can opt out of the sharing of personal information for targeted advertising. Submit a request from the privacy settings for your account, or contact PlayStation Support.', []],
  ['/en-us/legal/website-terms-of-use', 'Legal', 'Website Terms of Use', 'The terms that apply to PlayStation websites. By using these websites you agree to these terms.', []],
  ['/en-us/legal/psn-terms-of-service', 'Legal', 'PlayStation Terms of Service', 'The terms that govern your account for PlayStation and purchases from PlayStation Store. Digital content is licensed, not sold, subject to the PlayStation End User License Agreement.', [
    ['Cancellations and refunds', 'See the PlayStation Store cancellation policy.', [['PS Store Cancellation Policy', '/en-us/legal/playstation-store-cancellation-policy']]],
  ]],
  ['/en-us/legal/playstation-store-cancellation-policy', 'Legal', 'PlayStation Store cancellation policy', 'Your refund rights depend on the type of product purchased. Local laws may give you additional rights that this policy does not limit.', [
    ['Games, game add-ons, in-game consumables and season passes', 'Games and add-ons can be refunded within 14 days of purchase if you have not started downloading or streaming them. Delivered or accessed content generally cannot be refunded unless it is faulty.'],
    ['Pre-Orders for Digital Products', 'If you paid more than 14 days before release, you can cancel any time before release provided the main content has not started downloading (pre-load counts). If you paid within 14 days of release, you can cancel up to 14 days after payment if you have not started downloading. Extra content that was immediately accessible stops working if you cancel.', [['Cancel a PS Store pre-order', '/en-us/support/store/ps-store-refund-request']]],
    ['Promotional Bundles for Digital Products', 'Bundles can be refunded within 14 days of purchase only if no part of the bundle has been downloaded or streamed.'],
    ['Subscription Services', 'Subscriptions can be refunded within 14 days of the initial transaction; the refund may be reduced to reflect the time used. You can stop future payments by changing your subscription settings.'],
    ['Wallet top ups', 'Funds added to a PlayStation Store wallet cannot be cancelled and are non-refundable.'],
    ['Change of Online ID', 'Switching back to a previous Online ID is free; a purchased Online ID change cannot be cancelled unless faulty.'],
    ['Physical items', 'Physical products can be returned within 30 days of delivery in original condition; pre-orders can be cancelled before shipping.'],
    ['Purchases made outside of PlayStation™Store', 'This policy does not cover gift cards or vouchers bought from other retailers.'],
    ['How to request a Refund', 'Contact PlayStation Support or use the refund support page with your Online ID, Sign-In ID and the purchase name. Some purchases can be refunded from Transaction History.', [['Request a refund', '/en-us/support/store/ps-store-refund-request'], ['Transaction History', '/en-us/transactions']]],
  ]],
  ['/en-us/legal/health-warning', 'Legal', 'Health Warnings', 'Read the health and safety information before playing, including guidance for photosensitive seizures and virtual reality.', []],
  ['/legal/copyright-and-trademark-notice', 'Legal', 'Copyright and Trademark notice', '© 2026 Sony Interactive Entertainment LLC. “PlayStation”, the “PS” family mark, “PS5” and “DualSense” are registered trademarks or trademarks of Sony Interactive Entertainment Inc. All content, games titles, trade names and/or trade dress, trademarks, artwork and associated imagery are trademarks and/or copyright material of their respective owners.', []],
  // ---- support (PlayStation.com) ----
  ['/en-us/support/account/age-ratings-playstation', 'Support', 'Age ratings on PlayStation', 'In the United States, games are rated by the ESRB. Ratings appear on each product page alongside content descriptors and interactive elements such as in-game purchases.', [
    ['ESRB rating categories', 'E (Everyone), E10+ (Everyone 10+), T (Teen), M (Mature 17+), AO (Adults Only 18+) and RP (Rating Pending).'],
    ['Parental controls', 'Use family management to restrict content by age rating.', [['Safety', '/en-us/support/safety']]],
  ]],
  ['/en-us/support/account/password-reset', 'Support', 'Reset your password for your account for PlayStation', 'Select Trouble Signing In? on the sign-in screen and follow the emailed link to choose a new password.', [
    ['Sign in', 'Return to sign-in once your password has been reset.', [['Sign In', '/my.account.sony.com/central/signin/?redirect_uri=%2Fplaystation-store%2F']]],
  ]],
  ['/en-us/support/store/ps-store-refund-request', 'Support', 'How to request a refund for a purchase on PlayStation Store', 'Check whether your purchase is eligible, then request the refund from Transaction History.', [
    ['How to request a refund on a PlayStation Store purchase', '1. Open Transaction History and select the purchase. 2. Select Request Refund and follow the prompts. 3. If you still have problems, contact PlayStation Support.', [['Transaction History', '/en-us/transactions'], ['Contact support', '/en-us/support/contact']]],
    ['How to check the refund eligibility of your PlayStation Store purchase', 'Eligibility depends on the PlayStation Store purchase type.'],
    ['Games and DLCs', 'The content must not have been downloaded or streamed, and you must request the refund within 14 days of purchase.'],
    ['In-game consumables', 'Request within 14 days; the game must not have been launched after purchase.'],
    ['Subscriptions', 'Request within 14 days of signing up; applies to your first payment, not a recurring fee. Usage may reduce the refund.'],
    ['Pre-orders', 'Eligibility depends on when you paid relative to release and whether the main content has been downloaded or preloaded.', [['PS Store Cancellation Policy', '/en-us/legal/playstation-store-cancellation-policy']]],
    ['When can I receive my refund?', 'Refunds are usually processed within a few business days after approval.'],
    ['Where can I receive my refund?', 'Refunds go to the original payment method where possible, otherwise to your wallet.'],
    ['Can I request a refund for wallet funds?', 'No. Wallet top ups are non-refundable.'],
  ]],
  ['/en-us/support/hardware/manuals', 'Support', 'PlayStation manuals', 'User guides for PS5, PS4, PS VR2 and accessories.', []],
  ['/en-us/repairs', 'Support', 'PlayStation Repairs', 'Check warranty coverage and request a hardware repair for your console or accessory.', [
    ['Hardware help', 'Troubleshoot first with hardware support articles.', [['Hardware & Repairs', '/en-us/support/hardware']]],
  ]],
  // ---- other hosts ----
  ['/blog.playstation.com', 'PlayStation.Blog', 'PlayStation.Blog', 'Official news, announcements and previews from PlayStation.', [
    ['Latest news', 'Grand Theft Auto VI pre-orders are live on PlayStation Store.', [['Grand Theft Auto VI', GTA]]],
    ['PlayStation Plus', 'Monthly Games and Game Catalog announcements.', [["What's New", '/en-us/ps-plus/whats-new']]],
  ]],
  ['/partners.playstation.net', 'Developers', 'PlayStation Partners', 'Resources for developers and publishers creating games for PlayStation. Registration is handled on the partner portal.', []],
  ['/research.playstation.com', 'Connect', 'PlayStation playtesting program', 'Sign up to help test upcoming games and products.', []],
]

// The real support hub's six category tiles and their pages (single-segment topics that the
// store's own help articles do not already use).
export const SUPPORT_CATEGORIES = [
  ['account', 'Account & Security', 'Sign in, password, 2-step verification and account settings.'],
  ['store', 'Purchases', 'Payments, refunds, vouchers and PlayStation Store purchases.'],
  ['subscriptions', 'Subscriptions & Services', 'PlayStation Plus and other subscriptions.'],
  ['games', 'Games', 'Downloads, add-ons and game issues.'],
  ['hardware', 'Hardware & Repairs', 'Consoles, controllers, manuals and repairs.'],
  ['safety', 'Safety', 'Family management, parental controls and online safety.'],
]
const SUPPORT_TOPICS = {
  store: ['PS Store & Refunds', 'Help with buying, paying and refunds on PlayStation Store.', [
    ['Payment methods', [['Accepted payment methods', '/en-us/support/payments'], ['Add credit or debit card', '/en-us/payment-management'], ['How to add funds', '/en-us/playstation-gift-cards'], ['Manage PlayStation Store payment options', '/en-us/payment-management']]],
    ['Refunds and cancellations', [['PlayStation Store Cancellation Policy', '/en-us/legal/playstation-store-cancellation-policy'], ['How to check transaction history', '/en-us/transactions'], ['Cancel a PS Store pre-order', '/en-us/support/store/ps-store-refund-request'], ['How to cancel a PlayStation Store subscription', '/en-us/support/subscriptions']]],
    ['Buying on PlayStation Store', [['How to buy from PlayStation Store', '/en-us/about-playstation-store'], ['Redeem a PS Store voucher', '/en-us/playstation-gift-cards'], ['How to set a monthly spending limit', '/en-us/support/safety']]],
  ]],
  games: ['Games', 'Help with downloading, installing and playing games and add-ons.', [
    ['Downloads and licenses', [['Download purchased games', '/en-us/support/downloads'], ['Find a missing game or license', '/en-us/support/licenses'], ['Add-ons and in-game currency', '/en-us/support/addons']]],
  ]],
  hardware: ['Hardware & Repairs', 'Help with PS5, PS4, PS VR2, controllers and accessories.', [
    ['Hardware help', [['Manuals', '/en-us/support/hardware/manuals'], ['PlayStation Repairs', '/en-us/repairs'], ['PS5 features', '/en-us/ps5/ps5-features']]],
  ]],
  connectivity: ['Connectivity', 'Help with network connections, PSN status and Remote Play.', [
    ['Connection help', [['PSN Status', '/status.playstation.com'], ['PlayStation Portal Remote Player', '/en-us/accessories/playstation-portal-remote-player']]],
  ]],
  safety: ['Safety', 'Family management, parental controls, spending limits and reporting.', [
    ['Family and safety', [['Age ratings', '/en-us/support/account/age-ratings-playstation'], ['Online safety, account security and privacy', '/en-us/privacy-security-safety']]],
  ]],
}

const crumbs = (base, trail) => `<nav class="ps-crumbs" aria-label="Breadcrumb"><a href="${base}/en-us/support">Support</a>${trail.map(([l, p]) => p ? ` <span aria-hidden="true">›</span> <a href="${base}${p}">${esc(l)}</a>` : ` <span aria-hidden="true">›</span> <span>${esc(l)}</span>`).join('')}</nav>`
const linkRow = (base, links) => links?.length ? `<div class="ps-pdc-links">${links.map(([l, p]) => `<a class="ps-pdc-link" href="${base}${p}">${esc(l)}<span aria-hidden="true">›</span></a>`).join('')}</div>` : ''
const TIERS = [['Essential', '$10.99', ['Monthly Games', 'Online Multiplayer', 'Exclusive Discounts', 'Exclusive Content', 'Cloud Storage', 'Share Play']],
  ['Extra', '$16.99', ['Everything in Essential', 'Game Catalog', 'Ubisoft+ Classics']],
  ['Premium', '$19.99', ['Everything in Extra', 'Classics Catalog', 'Game Trials', 'PS5 Cloud Streaming', 'Sony Pictures Catalog']]]
export const tierCards = (base) => `<div class="ps-tier-grid">${TIERS.map(([name, price, perks]) => `<article class="ps-tier ps-tier-${name.toLowerCase()}"><h3>${name}</h3><p class="ps-tier-price">${price}<small>/month</small></p><ul>${perks.map(p => `<li>${esc(p)}</li>`).join('')}</ul><a class="ps-pill ps-pill-blue" href="${base}/en-us/membership">Manage membership</a></article>`).join('')}</div>`

const PLAN_PRICES = { Essential: ['$10.99', '$27.99', '$79.99'], Extra: ['$16.99', '$43.99', '$134.99'], Premium: ['$19.99', '$54.99', '$159.99'] }
const PLAN_ROWS = [['Monthly Games', 1], ['Online Multiplayer', 1], ['Exclusive Discounts', 1], ['Cloud Storage', 1], ['Game Catalog', 2], ['Ubisoft+ Classics', 2], ['Classics Catalog', 3], ['Game Trials', 3], ['PS5 Cloud Streaming', 3], ['Sony Pictures Catalog', 3]]
const compareTable = () => `<table class="ps-plan-table"><thead><tr><th scope="col"><span class="visually-hidden">Plan</span></th>${Object.keys(PLAN_PRICES).map(t => `<th scope="col">${t}</th>`).join('')}</tr></thead><tbody>${['1 month', '3 months', '12 months'].map((d, i) => `<tr><th scope="row">${d}</th>${Object.values(PLAN_PRICES).map(v => `<td>${v[i]}</td>`).join('')}</tr>`).join('')}${PLAN_ROWS.map(([f, min]) => `<tr><th scope="row">${f}</th>${[1, 2, 3].map(t => `<td>${t >= min ? '<span class="ps-plan-yes" aria-label="Included">✓</span>' : '<span class="ps-plan-no" aria-label="Not included">–</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table>`

function pdcBody(base, [path, eyebrow, h1, intro, sections, opts = {}]) {
  const art = opts.art ? `<div class="ps-pdc-hero-figure">${heroIllustration(opts.art)}</div>` : ''
  const hero = `<section class="ps-pdc-hero${art ? ' ps-pdc-hero-art' : ''}"><div><div><p class="ps-pdc-eyebrow">${esc(eyebrow)}</p><h1>${esc(h1)}</h1><p>${esc(intro)}</p></div>${art}</div></section>`
  const tiers = opts.tiers ? `<section class="ps-pdc-section"><h2 class="visually-hidden">Membership plans</h2>${tierCards(base)}</section>` : ''
  // Game rows, like the tiles on playstation.com's console and PS Plus pages (reference assortment only).
  const picks = opts.games ? ASSORTMENT.filter(p => p.department !== 'hardware' && opts.games[1](p)).sort((a, b) => (a.bestRank || 999) - (b.bestRank || 999)).filter((p, i, all) => all.findIndex(q => q.family === p.family) === i).slice(0, 6) : []
  const games = picks.length >= 4 ? `<section class="ps-pdc-section ps-pdc-games"><h2>${esc(opts.games[0])}</h2><div class="ps-grid ps-grid-6">${picks.map(p => shelfTile(base, p)).join('')}</div></section>` : ''
  const body = sections.map(([h, text, links, id], i) => `<section class="ps-pdc-section"${id ? ` id="${id}"` : ''}><h2>${esc(h)}</h2><p>${esc(text)}</p>${opts.tiers && h === 'Compare membership plans' ? compareTable() : ''}${linkRow(base, links)}</section>${i === (opts.gamesAfter ?? 0) ? games : ''}`).join('')
  const empty = !sections.length ? `<section class="ps-pdc-section"><p>Find games, add-ons and subscriptions on PlayStation Store, or get help from PlayStation Support.</p>${linkRow(base, [['PlayStation Store', STORE], ['Support', '/en-us/support']])}</section>` : ''
  return `${hero}<div class="ps-pdc-body">${tiers}${body}${empty}</div>`
}

// PlayStation Direct: hardware and merchandise are sold there, not on PlayStation Store.
// In reference mode the console and accessory pages list the hardware assortment (shelf.js);
// games & merchandise (and fixture mode) keep the empty state.
const DIRECT_SCOPE = {
  '/direct.playstation.com/en-us': () => true,
  '/direct.playstation.com/en-us/hardware/ps5': p => p.directDepartment === 'consoles',
  '/direct.playstation.com/en-us/ps5': p => p.directDepartment === 'consoles',
  '/direct.playstation.com/en-us/accessories/ps5': p => p.directDepartment !== 'consoles',
}
const DIRECT = [
  ['/direct.playstation.com/en-us', 'PlayStation Direct', 'Official consoles, accessories, games and merchandise sold by Sony Interactive Entertainment.'],
  ['/direct.playstation.com/en-us/hardware/ps5', 'PS5 consoles', 'PS5 Pro, PS5 and PS5 Digital Edition consoles and bundles.'],
  ['/direct.playstation.com/en-us/accessories/ps5', 'PS5 accessories', 'Controllers, audio, PlayStation Portal and console add-ons.'],
  ['/direct.playstation.com/en-us/games/catalog', 'Games & merchandise', 'Physical games, collector’s editions and official PlayStation merchandise.'],
  ['/direct.playstation.com/en-us/ps5', 'Buy a PS5', 'Choose a PS5 console model and bundle.'],
]
function directBody(base, [path, h1, intro], query = {}) {
  const nav = DIRECT.slice(1, 4).map(([p, l]) => `<a href="${base}${p}"${p === path ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')
  return `<div class="ps-direct-bar"><b>PlayStation Direct</b><nav aria-label="PlayStation Direct">${nav}</nav></div>
<section class="ps-pdc-hero ps-direct-hero"><div><p class="ps-pdc-eyebrow">PlayStation Direct</p><h1>${esc(h1)}</h1><p>${esc(intro)}</p></div></section>
${(DIRECT_SCOPE[path] && directListing(base, path, query, DIRECT_SCOPE[path])) || `<div class="ps-pdc-body ps-direct-layout"><aside class="ps-direct-filters" aria-label="Filters"><h2>Filter</h2><p><b>Category</b><br>Consoles · Controllers · Audio · Games</p><p><b>Availability</b><br>In stock · Coming soon</p><p><b>Sort by</b><br>Featured</p></aside>
<section class="ps-direct-results"><p class="ps-direct-count">0 results</p><div class="ps-empty-state"><h2>No products to show</h2><p>${fixtureCatalog ? 'PlayStation Direct items are not sold on PlayStation Store. PlayStation Store sells digital games, add-ons and subscriptions only.' : 'Physical games and merchandise are not stocked right now. Shop consoles and accessories, or buy digital games on PlayStation Store.'}</p>${linkRow(base, [...(fixtureCatalog ? [] : [['Buy consoles', '/direct.playstation.com/en-us/hardware/ps5'], ['Buy accessories', '/direct.playstation.com/en-us/accessories/ps5']]), ['Shop digital games on PlayStation Store', STORE], ['Grand Theft Auto VI pre-order', GTA]])}</div></section></div>`}`
}

function statusBody(base) {
  const services = ['Account management', 'Gaming and social', 'PlayStation Video', 'PlayStation Store', 'PlayStation Direct']
  return `<section class="ps-pdc-hero"><div><p class="ps-pdc-eyebrow">PlayStation Network</p><h1>PSN Service Status</h1><p>United States · Status of PlayStation Network services</p></div></section>
<div class="ps-pdc-body"><section class="ps-pdc-section"><p class="ps-status-ok"><span aria-hidden="true">●</span> All services are up and running.</p><ul class="ps-status-list">${services.map(s => `<li><span>${esc(s)}</span><b>Up and running</b></li>`).join('')}</ul>${linkRow(base, [['Support', '/en-us/support'], ['Connectivity', '/en-us/support/connectivity']])}</section></div>`
}

// Site map, laid out like www.playstation.com/en-us/site-map/ with the store's own sections first.
const SITE_MAP = [
  ['PlayStation Store', STORE, [['Latest', STORE], ['Collections', '/en-us/pages/collections'], ['Deals', '/en-us/pages/deals'], ['Subscriptions', '/en-us/pages/subscriptions'], ['Browse', '/en-us/pages/browse'], ['Grand Theft Auto VI', GTA]]],
  ['Homepage', STORE, [['About PlayStation', '/en-us/corporate/about-us'], ['PlayStation Studios', '/en-us/corporate/playstation-studios'], ['Legal', '/en-us/legal'], ['PlayStation and the environment', '/en-us/corporate/playstation-and-the-environment'], ['Accessibility', '/en-us/accessibility'], ['Online safety, account security and privacy', '/en-us/privacy-security-safety']]],
  ['PlayStation 4', '/en-us/ps4', [['PS4 Pro', '/en-us/ps4/ps4-pro'], ['PS4 games', '/en-us/ps4/ps4-games'], ['PlayStation App', '/en-us/playstation-app']]],
  ['PlayStation 5', '/en-us/ps5', [['PS5 games', '/en-us/ps5/games'], ['PS5 accessories', '/en-us/ps5/accessories'], ['PS5 features', '/en-us/ps5/ps5-features'], ['PS5 entertainment', '/en-us/ps5/ps5-entertainment'], ['PS5 Pro', '/en-us/ps5/ps5-pro']]],
  ['PS5 accessories', '/en-us/accessories', [['DualSense wireless controller', '/en-us/accessories/dualsense-wireless-controller'], ['PlayStation Portal Remote Player', '/en-us/accessories/playstation-portal-remote-player']]],
  ['PlayStation VR2', '/en-us/ps-vr2', [['PS VR2 games', '/en-us/ps-vr2/games']]],
  ['Support', '/en-us/support', [['PSN Status', '/status.playstation.com'], ['Manuals', '/en-us/support/hardware/manuals'], ['Account & Security', '/en-us/support/account'], ['PS Store & Refunds', '/en-us/support/store'], ['Subscriptions', '/en-us/support/subscriptions'], ['Games', '/en-us/support/games'], ['Hardware & Repairs', '/en-us/support/hardware'], ['Connectivity', '/en-us/support/connectivity'], ['Safety', '/en-us/support/safety']]],
  ['PlayStation Plus', '/en-us/ps-plus', [['All Games', '/en-us/ps-plus/games'], ["What's New", '/en-us/ps-plus/whats-new']]],
  ['PlayStation Network', '/en-us/playstation-network', [['PSN Status', '/status.playstation.com']]],
  ['PS Store', '/en-us/about-playstation-store', [['PlayStation Store gift cards', '/en-us/playstation-gift-cards']]],
  ['Stay up to date', '/blog.playstation.com', [['This month on PlayStation', '/en-us/editorial/this-month-on-playstation'], ['PlayStation Blog', '/blog.playstation.com']]],
  ['Your account', '/en-us/account', [['Account overview', '/en-us/account'], ['Game Library', '/en-us/library'], ['Wishlist', '/en-us/wishlist'], ['Transaction History', '/en-us/transactions'], ['Subscriptions', '/en-us/membership'], ['Payment Management', '/en-us/payment-management']]],
  ['PlayStation Direct', '/direct.playstation.com/en-us', [['Buy consoles', '/direct.playstation.com/en-us/hardware/ps5'], ['Buy accessories', '/direct.playstation.com/en-us/accessories/ps5'], ['Buy merchandise', '/direct.playstation.com/en-us/games/catalog']]],
]
const siteMapBody = (base) => `<section class="ps-pdc-hero ps-pdc-hero-plain"><div><nav class="ps-crumbs" aria-label="Breadcrumb"><a href="${base}/">Home</a> <span aria-hidden="true">›</span> <span>Site map</span></nav><h1>Site map</h1></div></section>
<div class="ps-pdc-body"><div class="ps-sitemap-grid">${SITE_MAP.map(([h, p, links]) => `<section><h2><a href="${base}${p}">${esc(h)}</a></h2><ul>${links.map(([l, lp]) => `<li><a href="${base}${lp}">${esc(l)}</a></li>`).join('')}</ul></section>`).join('')}</div></div>`

// Every page path the clone serves without a session, for /sitemap.xml.
export function sitemapPaths() {
  return [...new Set([STORE, '/en-us/pages/collections', '/en-us/pages/deals', '/en-us/pages/subscriptions', '/en-us/pages/browse', GTA, '/en-us/support', '/en-us/site-map',
    ...SUPPORT_CATEGORIES.map(([s]) => `/en-us/support/${s}`), ...Object.keys(SUPPORT_TOPICS).map(s => `/en-us/support/${s}`),
    ...PAGES.map(p => p[0]), ...DIRECT.map(d => d[0]), '/status.playstation.com'])]
}

const pathVariants = (p) => [p, `${p}/`]

export function installPdc(router, { render }) {
  for (const page of PAGES) router.get(pathVariants(page[0]), (req, res) => render(req, res, { title: `${page[2].replace(/[®™]/g, '')} | PlayStation`, body: pdcBody(res.locals.base, page), chrome: 'pdc' }))
  for (const d of DIRECT) router.get(pathVariants(d[0]), (req, res) => render(req, res, { title: `${d[1]} | PlayStation Direct`, body: directBody(res.locals.base, d, req.query), chrome: 'pdc' }))
  router.get(pathVariants('/status.playstation.com'), (req, res) => render(req, res, { title: 'PSN Service Status', body: statusBody(res.locals.base), chrome: 'pdc' }))
  router.get(pathVariants('/en-us/site-map'), (req, res) => render(req, res, { title: 'Site map | PlayStation', body: siteMapBody(res.locals.base), chrome: 'pdc' }))
  router.get('/sitemap.xml', (req, res) => {
    const base = res.locals.base
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths().map(p => `  <url><loc>${esc(base + p)}</loc></url>`).join('\n')}\n</urlset>\n`)
  })
  router.get(Object.keys(SUPPORT_TOPICS).flatMap(t => pathVariants(`/en-us/support/${t}`)), (req, res) => {
    const topic = req.path.replace(/\/$/, '').split('/').pop()
    const [h1, intro, groups] = SUPPORT_TOPICS[topic]
    const base = res.locals.base
    render(req, res, { title: `${h1} | PlayStation Support`, chrome: 'pdc', body: `<section class="ps-pdc-hero ps-support-band"><div>${crumbs(base, [[h1]])}<h1>${esc(h1)}</h1><p>${esc(intro)}</p></div></section><div class="ps-pdc-body"><section class="ps-pdc-section"><h3>What do you need help with?</h3>${groups.map(([g, links]) => `<h2>${esc(g)}</h2>${linkRow(base, links)}`).join('')}</section><section class="ps-pdc-section"><h2>More troubleshooting help</h2>${linkRow(base, [['Contact support', '/en-us/support/contact'], ['PSN Status', '/status.playstation.com']])}</section></div>` })
  })
}

// Old /en-us/information/{topic} links keep working by pointing at the PlayStation.com paths.
export const INFORMATION_REDIRECTS = {
  privacy: '/en-us/legal/privacy-policy', 'privacy-choices': '/en-us/legal/third-party-ads', 'website-terms': '/en-us/legal/website-terms-of-use',
  legal: '/en-us/legal', about: '/en-us/corporate/about-us', 'service-terms': '/en-us/legal/psn-terms-of-service', health: '/en-us/legal/health-warning',
  ratings: '/en-us/support/account/age-ratings-playstation', sitemap: '/en-us/site-map',
}
