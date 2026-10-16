// Recipe cards for the /recipe/ course pages: original short descriptions in the
// Williams Sonoma test-kitchen voice, each pointing at the department that sells
// the pan or tool it is cooked in. Keyed by the course path in site-data.js.
const r = (title, time, serves, blurb, tool, toolPath) => ({ title, time, serves, blurb, tool, toolPath })

export const recipesByCourse = {
  '/recipe/appetizers/': [
    r('Baked Brie with Fig Jam & Toasted Walnuts', '25 min', 'Serves 6–8', 'A wheel of brie warmed until molten, spooned over with fig jam and finished with walnuts and fresh thyme.', 'Ramekins & Mini Cocottes', '/shop/bakeware/ramekin-mini-cocottes/'),
    r('Crispy Smashed Potatoes with Garlic Aioli', '50 min', 'Serves 4–6', 'Boiled baby potatoes, flattened and roasted in olive oil until shatteringly crisp at the edges.', 'Sheet Pans', '/shop/bakeware/sheet-pans-cookie-sheets/'),
    r('Classic Gougères', '45 min', 'Makes about 30', 'Airy French cheese puffs made with Gruyère, the perfect bite to pass with a glass of sparkling wine.', 'Baking & Pastry Tools', '/shop/cooks-tools/baking-pastry-tools/'),
    r('Whipped Ricotta Crostini with Hot Honey', '20 min', 'Serves 8', 'Silky whipped ricotta on grilled bread with a drizzle of chile-infused honey and flaky sea salt.', 'Food Processors', '/shop/electrics/food-processors/'),
  ],
  '/recipe/soups/': [
    r('Roasted Butternut Squash Soup', '1 hr 10 min', 'Serves 6', 'Caramelized squash, apple and sage blended until velvety; finish with a swirl of crème fraîche.', 'Blenders', '/shop/electrics/blenders/'),
    r('French Onion Soup', '2 hr', 'Serves 6', 'Onions cooked low and slow until deeply golden, then topped with a crouton and broiled Gruyère.', 'Dutch Ovens & Braisers', '/shop/cookware/dutch-ovens-braisers/'),
    r('Tuscan White Bean & Kale Soup', '45 min', 'Serves 4–6', 'A hearty, brothy soup with pancetta, cannellini beans, lacinato kale and a Parmesan rind.', 'Stockpots & Multipots', '/shop/cookware/stock-soup-multi-pots/'),
    r('Chicken Tortilla Soup', '1 hr', 'Serves 6', 'Smoky chipotle broth with shredded chicken, topped with avocado, lime and crisp tortilla strips.', 'Saucepans & Sauciers', '/shop/cookware/saucepans-sauciers/'),
  ],
  '/recipe/salads/': [
    r('Harvest Salad with Apples, Pecans & Cider Vinaigrette', '20 min', 'Serves 4', 'Crisp apples, candied pecans and shaved Parmesan tossed with tender greens and a tangy cider dressing.', 'Salad & Serving Bowls', '/shop/tabletop-glassware-bar/salad-serving-bowls/'),
    r('Shaved Brussels Sprout Salad', '15 min', 'Serves 6', 'Thinly sliced sprouts with lemon, Pecorino and toasted almonds: a fresh counterpoint to rich fall menus.', 'Mandolines & Slicers', '/shop/cooks-tools/mandolines-slicers/'),
    r('Roasted Beet & Goat Cheese Salad', '1 hr', 'Serves 4', 'Jewel-toned beets with creamy goat cheese, pistachios and a citrus-shallot vinaigrette.', 'Roasting Pans', '/shop/cookware/roasters/'),
    r('Classic Caesar with Garlic Croutons', '25 min', 'Serves 4', 'Romaine hearts in a lemony anchovy dressing, finished with homemade croutons and plenty of Parmesan.', 'Graters', '/shop/cooks-tools/graters/'),
  ],
  '/recipe/main-courses/pasta-rice-and-grains/': [
    r('Wild Mushroom Risotto', '50 min', 'Serves 4', 'Creamy Arborio rice stirred with a mix of wild mushrooms, white wine, butter and Parmigiano-Reggiano.', 'Sauté & Essential Pans', '/shop/cookware/saute-pans/'),
    r('Fresh Pappardelle with Bolognese', '3 hr', 'Serves 6', 'Silky ribbons of homemade pasta with a slow-simmered sauce of beef, pork, tomato and a splash of milk.', 'Pasta Tools', '/shop/cooks-tools/pasta-tools/'),
    r('Butternut Squash Mac & Cheese', '1 hr', 'Serves 8', 'A comforting baked macaroni with roasted squash, sharp cheddar and a crunchy breadcrumb topping.', 'Casseroles & Baking Dishes', '/shop/bakeware/casseroles/'),
    r('Cacio e Pepe', '20 min', 'Serves 2', 'Three ingredients, one pan: spaghetti, Pecorino Romano and freshly cracked black pepper.', 'Salt & Pepper Mills', '/shop/cooks-tools/salt-pepper-mills/'),
  ],
  '/recipe/main-courses/vegetables/': [
    r('Maple-Roasted Carrots with Tahini', '40 min', 'Serves 4–6', 'Whole carrots roasted with maple and cumin, served over a lemony tahini sauce with fresh herbs.', 'Sheet Pans', '/shop/bakeware/sheet-pans-cookie-sheets/'),
    r('Classic Ratatouille', '1 hr 30 min', 'Serves 6', 'Eggplant, zucchini, peppers and tomatoes layered and baked with garlic, thyme and olive oil.', 'Casseroles & Baking Dishes', '/shop/bakeware/casseroles/'),
    r('Crispy Brussels Sprouts with Balsamic Glaze', '30 min', 'Serves 4', 'Halved sprouts seared cut-side down in a cast-iron skillet until deeply browned, then glazed.', 'Fry Pans & Skillets', '/shop/cookware/fry-pans-skillets/'),
    r('Potato Gratin Dauphinois', '1 hr 30 min', 'Serves 8', 'Thinly sliced potatoes baked in garlic-infused cream until tender with a bubbling golden top.', 'Mandolines & Slicers', '/shop/cooks-tools/mandolines-slicers/'),
  ],
  '/recipe/main-courses/seafood/': [
    r('Pan-Seared Salmon with Lemon-Caper Butter', '25 min', 'Serves 4', 'Crisp-skinned salmon fillets finished with a bright sauce of brown butter, lemon and capers.', 'Fry Pans & Skillets', '/shop/cookware/fry-pans-skillets/'),
    r('Seafood Paella', '1 hr 15 min', 'Serves 6', 'Saffron rice with shrimp, mussels and chorizo, cooked until a crisp socarrat forms on the bottom.', 'International Cookware', '/shop/cookware/international-cookware/'),
    r('Shrimp Scampi with Linguine', '25 min', 'Serves 4', 'Shrimp sautéed with garlic, white wine and red pepper flakes, tossed with linguine and parsley.', 'Sauté & Essential Pans', '/shop/cookware/saute-pans/'),
    r('Halibut en Papillote', '30 min', 'Serves 4', 'Delicate fish steamed in parchment with fennel, cherry tomatoes, olives and herbs.', 'Sheet Pans', '/shop/bakeware/sheet-pans-cookie-sheets/'),
  ],
  '/recipe/main-courses/poultry-and-game/': [
    r('Dry-Brined Roast Turkey with Herb Butter', '4 hr', 'Serves 10–12', 'Our go-to Thanksgiving bird: dry-brined overnight for crisp skin and juicy, well-seasoned meat.', 'Roasting Pans', '/shop/cookware/roasters/'),
    r('Coq au Vin', '2 hr 30 min', 'Serves 6', 'Chicken braised in red wine with lardons, pearl onions and mushrooms until fork-tender.', 'Dutch Ovens & Braisers', '/shop/cookware/dutch-ovens-braisers/'),
    r('Lemon-Herb Roast Chicken', '1 hr 30 min', 'Serves 4', 'A simple, perfect roast chicken stuffed with lemon, garlic and thyme over roasted root vegetables.', 'Roasting Pans', '/shop/cookware/roasters/'),
    r('Chicken Tikka Masala', '1 hr', 'Serves 4–6', 'Yogurt-marinated chicken simmered in a spiced, creamy tomato sauce. Serve with basmati rice.', 'Pressure, Rice & Slow Cookers', '/shop/electrics/pressure-rice-slow-cookers/'),
  ],
  '/recipe/main-courses/pork/': [
    r('Cider-Braised Pork Shoulder', '3 hr 30 min', 'Serves 8', 'Pork shoulder braised with apple cider, onions and mustard until it falls apart at a touch.', 'Dutch Ovens & Braisers', '/shop/cookware/dutch-ovens-braisers/'),
    r('Pork Tenderloin with Apples & Shallots', '40 min', 'Serves 4', 'Seared tenderloin roasted with apples and shallots, finished with a quick pan sauce.', 'Fry Pans & Skillets', '/shop/cookware/fry-pans-skillets/'),
    r('Slow-Cooker Carnitas', '8 hr', 'Serves 8', 'Citrus- and cumin-scented pork, slow-cooked then crisped under the broiler for tacos.', 'Pressure, Rice & Slow Cookers', '/shop/electrics/pressure-rice-slow-cookers/'),
    r('Herb-Crusted Rack of Pork', '2 hr', 'Serves 6', 'A showstopping bone-in roast with a crust of rosemary, sage, garlic and Dijon.', 'Meat & Poultry Tools', '/shop/cooks-tools/tools-meat-poultry/'),
  ],
  '/recipe/main-courses/beef-and-veal/': [
    r('Red Wine-Braised Short Ribs', '3 hr 30 min', 'Serves 6', 'Bone-in short ribs braised in red wine and stock with aromatics, served over creamy polenta.', 'Dutch Ovens & Braisers', '/shop/cookware/dutch-ovens-braisers/'),
    r('Cast-Iron Ribeye with Garlic-Thyme Butter', '30 min', 'Serves 2', 'A steakhouse-style sear on the stovetop, basted with butter, garlic and fresh thyme.', 'Fry Pans & Skillets', '/shop/cookware/fry-pans-skillets/'),
    r('Classic Beef Bourguignon', '3 hr', 'Serves 6–8', 'Julia Child’s French classic: beef stewed in Burgundy with mushrooms, onions and bacon.', 'Dutch Ovens & Braisers', '/shop/cookware/dutch-ovens-braisers/'),
    r('Herb-Roasted Beef Tenderloin', '1 hr 15 min', 'Serves 8', 'An elegant centerpiece roast with a mustard-herb crust, sliced and served with horseradish cream.', 'Slicing & Carving Knives', '/shop/cutlery/slicing-carving-knives/'),
  ],
  '/recipe/desserts/': [
    r('Classic Pumpkin Pie', '1 hr 30 min', 'Serves 8', 'A silky spiced custard in a flaky all-butter crust. Top with softly whipped cream.', 'Pie & Tart Pans', '/shop/bakeware/pie-pans-tart-pans/'),
    r('Apple Cider Doughnut Bundt Cake', '1 hr 20 min', 'Serves 12', 'All the flavor of an orchard doughnut, baked in a Bundt and rolled in cinnamon sugar.', 'Cake Pans', '/shop/bakeware/cake-pans/'),
    r('Salted Caramel Apple Galette', '1 hr 15 min', 'Serves 6–8', 'A rustic free-form tart of thinly sliced apples, drizzled with salted caramel.', 'Baking Mats & Boards', '/shop/bakeware/baking-mats-boards/'),
    r('Brown Butter Chocolate Chip Cookies', '45 min', 'Makes 24', 'Nutty brown butter and dark chocolate chunks make these our most-requested cookie.', 'Stand Mixers', '/shop/electrics/mixers-attachments/'),
  ],
}

export const allRecipes = Object.entries(recipesByCourse).flatMap(([path, list]) => list.map(x => ({ ...x, coursePath: path })))
