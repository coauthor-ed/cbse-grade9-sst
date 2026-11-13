// Price and demand: the arcade decks for this chapter, in one file so several
// games can share them. A deck is plain data - the engine does menu, scoring,
// hearts, why cards, boss round and end card.
//
// House rules for this file:
//   - One `export const <NAME>` per game. A later game ADDS a new export beside
//     this one; it never edits or reorders an existing export or any item in it.
//   - Every `why` is the one line the why card shows after a mix-up, so it gives
//     the evidence, not the answer restated.
//   - `myth: true` marks an item students commonly get wrong: it is worth double
//     in the boss round.
//   - No `art`, no `tone` on an item: nothing in the picture may name the answer.
//   - Nothing a later lesson teaches (a seller's decision, a supply shift, an
//     equilibrium price) may appear in a deck.

// Goods pairs: substitutes or complements? - for ArcadeSortScene. The pairs are
// the textbook's own list (Question 10) plus four from the chapter's text.
export const GOODS_PAIRS_SORT = {
  groups: [
    { id: 'sub', label: 'Substitutes', tone: 3, why: 'substitutes can replace each other: when one costs more, people buy the other' },
    { id: 'comp', label: 'Complements', tone: 5, why: 'complements are used together: when people buy fewer of one, they buy fewer of the other' },
  ],
  items: [
    { name: 'Movie ticket and popcorn', is: 'comp', why: 'people buy cinema popcorn because they go to the film' },
    { name: 'Eraser and pencil', is: 'comp', myth: true, why: 'both are stationery, but you use them together: one does not replace the other' },
    { name: 'Notebook and pen', is: 'comp', why: 'you write in the notebook with the pen, so they are used together' },
    { name: 'Mobile and earphones', is: 'comp', why: 'earphones are used with a mobile, so they are bought together' },
    { name: 'Printer and cartridges', is: 'comp', why: 'a printer needs cartridges to work' },
    { name: 'Car and petrol', is: 'comp', why: 'a car needs petrol to run, so they are used together' },
    { name: 'Laptop and computer', is: 'sub', myth: true, why: 'both do the same job, so a buyer picks one or the other' },
    { name: 'Air conditioner and cooler', is: 'sub', myth: true, why: 'both cool a room: if one costs more, people buy the other' },
    { name: 'Apple and banana', is: 'sub', why: 'either fruit can be the snack, so one can replace the other' },
    { name: 'Tea and coffee', is: 'sub', why: 'if coffee costs more, some coffee drinkers switch to tea' },
    { name: 'Mangoes and bananas', is: 'sub', why: 'if mangoes cost too much, a buyer may take bananas instead' },
    { name: 'Smartphone and a basic phone', is: 'sub', why: 'both make calls, so a buyer picks one of the two' },
  ],
};

// Market statements: true or false? - for ArcadeJudgeScene, added by L06's
// MarketStatementsJudgeScene. Twelve statements from the government lesson, six
// true and six false, so no single answer wins (reworded 2026-11-11, q58-w4: no
// opinion is keyed). The four myth: true items are the boss-round pool. The
// GOODS_PAIRS_SORT export above is untouched.
export const MARKET_STATEMENTS_JUDGE = {
  statements: [
    { text: 'A price ceiling is the highest price a seller may charge.', truth: true, why: 'a ceiling is a highest price; a floor is a lowest price' },
    { text: 'A ceiling set below the market price leads to a shortage.', truth: true, why: 'at the lower price buyers want more and sellers offer less' },
    { text: 'A ceiling set below the market price leads to a surplus.', truth: false, myth: true, why: 'buyers want more than sellers offer, so it is a shortage' },
    { text: 'A minimum wage is an example of a price ceiling.', truth: false, why: 'it is a lowest wage, so it is a price floor' },
    { text: 'A price floor changes things only if it is above the market price.', truth: true, why: 'below the market price, a lowest price has no effect' },
    { text: 'A monopoly has many sellers competing with each other.', truth: false, why: 'a monopoly has only one seller and no close substitute' },
    { text: 'A monopoly can charge a higher price and supply less.', truth: true, why: 'no other seller can offer buyers a better deal' },
    { text: 'SEBI watches the share market.', truth: true, why: 'RBI: banking, TRAI: telephone and internet, SEBI: shares' },
    { text: 'Hoarding means selling all your stock quickly.', truth: false, why: 'hoarding is keeping far more than you need, often hidden' },
    { text: 'Private companies build most parks and streetlights for profit.', truth: false, myth: true, why: 'they earn no direct profit, so the government provides them' },
    { text: 'If everyone waits for others to pay, a park may never be built.', truth: true, why: 'not enough money is collected' },
    { text: 'More government rules always make a market work better.', truth: false, myth: true, why: 'too many rules and permissions can harm a market' },
  ],
};