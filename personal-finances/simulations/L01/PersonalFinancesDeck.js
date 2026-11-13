// Personal finances decks for the arcade games (grade 9-10, "Personal
// Finances"). One file for the chapter; each game adds its own export beside
// the ones already here and never edits an existing item. A deck is plain
// data: every `why` is the line the why card shows after a mix-up, so it is
// written as evidence, never as a restatement of the answer. `myth: true`
// marks what students commonly get wrong: it is worth double in the boss round.

// Need or want? - for ArcadeSortScene, sky skin. Cost is never the rule: the
// evidence is the job the expense does in the month.
export const NEEDS_WANTS = {
  groups: [
    { id: 'need', label: 'Need', tone: 1, why: 'the month does not work without it, and no cheaper choice does the same job' },
    { id: 'want', label: 'Want', tone: 3, why: 'the job is done without it; it adds comfort or pleasure, which is why it can wait a month' },
  ],
  items: [
    { name: 'School fees', is: 'need', why: 'attending school depends on the fee being paid; there is no version of the month in which it can wait' },
    { name: 'Bus to school', is: 'need', why: 'without the fare there is no paid way to reach class, so the trip to school is the job it does' },
    { name: 'Notebooks', is: 'need', why: 'the work in class is written into them; a borrowed sheet is not the same job done' },
    { name: 'Fever medicine', is: 'need', why: 'an untreated illness does not wait for next month money' },
    { name: 'Water tank', is: 'need', why: 'the supply comes for an hour a day; without a tank the household has no water for the rest of it' },
    { name: 'Farm seeds', is: 'need', why: 'the next crop depends on them, so they are an input the family income is built on, not a treat' },
    { name: 'Livestock feed', is: 'need', why: 'an animal that is not fed today has no value tomorrow; the feed is part of the work that earns' },
    { name: 'New phone', is: 'want', why: 'the old handset still makes the calls and sends the messages, so the new one adds speed and style, not a job done' },
    { name: 'Meal out', is: 'want', why: 'a meal at home already feeds you; the outing buys company and taste, both of which can wait' },
    { name: 'Festival extras', is: 'want', myth: true, why: 'the festival still happens without extra clothes and a bigger gift, so these can wait' },
    { name: 'Impulse buy', is: 'want', why: 'it was not on any list before the counter, so nothing in the month depended on it' },
    { name: 'Sports shoes', is: 'want', myth: true, why: 'playing needs shoes, and the old pair still works, so a new pair can wait' },
  ],
};

// Term -> what it actually means - for ArcadeMatchScene, bubbles skin. The
// three `myth: true` pairs are the words the chapter treats as easy to confuse;
// their why line names the mix-up a learner is likely to make.
export const TERM_TO_MEANING = {
  pairs: [
    { prompt: 'Inflation', answer: 'prices of everyday things rising over time', group: 'money', myth: true, why: 'falling prices would raise what the rupee buys, and inflation is the opposite' },
    { prompt: 'Purchasing power', answer: 'how much one rupee can actually buy', group: 'money', why: 'it falls when prices rise even though the rupee in the gullak is unchanged' },
    { prompt: 'Liquidity', answer: 'how quickly something can be turned into cash without losing value', group: 'money', myth: true, why: 'interest is what the money earns, and liquidity is only how fast it can become cash' },
    { prompt: 'Investing', answer: 'putting savings into an asset to earn a return', group: 'money', why: 'the point is that the money works while it waits' },
    { prompt: 'Compounding', answer: 'interest earning interest, year after year', group: 'money', why: 'the second year interest is paid on the first year interest too' },
    { prompt: 'Principal', answer: 'the amount first put in, before any earnings', group: 'money', why: 'everything the money later earns is counted from this figure' },
    { prompt: 'Fixed deposit', answer: 'a lump sum kept with a bank for a fixed period at a fixed rate', group: 'option', why: 'the rate is agreed when the money goes in and does not move with the market' },
    { prompt: 'Maturity period', answer: 'the time from the day money is put in to the day it is paid back', group: 'option', why: 'the money comes back on that date, and taking it out earlier usually earns a lower rate' },
    { prompt: 'Bond', answer: 'a loan you give to a government or a company', group: 'option', why: 'the borrower pays interest and returns the amount on a date' },
    { prompt: 'Share', answer: 'a small part of the ownership of a company', group: 'option', why: 'its price rises and falls with market conditions and how the company performs' },
    { prompt: 'Mutual fund', answer: 'money from many investors, pooled and spread across shares and bonds', group: 'option', why: 'a manager buys with the pool and each saver owns a slice' },
    { prompt: 'Dividend', answer: 'part of the profit of a company, paid to its shareholders', group: 'return', myth: true, why: 'a price rise is a gain on selling, and a dividend is a payment out of profit whether or not the share is sold' },
    { prompt: 'Diversification', answer: 'spreading money across many places so one fall cannot sink it', group: 'return', why: 'one collapse then touches only its own slice of the basket' },
  ],
};

// Which cover answers this loss? - for ArcadeSortScene, belt skin. The label
// names the loss, never the policy: an item must not print its own group.
export const INSURANCE_LOSSES = {
  groups: [
    { id: 'health', label: 'Health', tone: 1, why: 'a medical cost: treatment, tests or a hospital stay' },
    { id: 'life', label: 'Life', tone: 3, why: 'a payment to the family when the earner dies' },
    { id: 'general', label: 'General', tone: 5, why: 'cover for property, vehicles, crops or animals the family owns' },
  ],
  items: [
    { name: 'Medicines', is: 'health', why: 'the money goes on medicine for an illness' },
    { name: 'Blood tests', is: 'health', why: 'the money goes on medical tests' },
    { name: 'Hospital stay', is: 'health', myth: true, why: 'a road crash put them there, but the bill is for medical care, so the health policy pays it' },
    { name: 'Earner dies', is: 'life', why: 'the payment goes to the people who depended on that income' },
    { name: 'School fees', is: 'life', myth: true, why: 'the fee is for school but it is paid because the earner died, so life cover answers it' },
    { name: 'Car repair', is: 'general', why: 'the money repairs a vehicle the family owns after a crash' },
    { name: 'Shop fire', is: 'general', why: 'the money repairs a building the family owns' },
    { name: 'Theft at home', is: 'general', why: 'the money replaces property taken from the house' },
    { name: 'Earthquake', is: 'general', why: 'the money repairs a home after a disaster' },
    { name: 'Crop pests', is: 'general', why: 'the money covers a harvest lost in the field' },
    { name: 'Buffalo dies', is: 'general', myth: true, why: 'a death is involved but the animal is farm property, so cattle cover under general insurance pays it' },
  ],
};

// True or false - for ArcadeJudgeScene, cards skin. Five true to seven false,
// so always answering one way never wins; the `myth: true` claims are the
// chapter's own recurring wrong beliefs.
export const MONEY_MYTHS = {
  statements: [
    { text: 'Cash in a gullak keeps value.', truth: false, myth: true, why: 'no coin leaks out, but prices keep rising, so a year later the same notes buy less' },
    { text: '8% beats 6% inflation.', truth: true, why: 'the gap between the two rates is what the money gains in buying power' },
    { text: 'Starting 10 years late costs a quarter.', truth: false, myth: true, why: 'Dhruv paid in for 30 of 40 years but ended with 47%, less than half, because the early years earn the longest' },
    { text: 'Shares win every year.', truth: false, why: 'a single bad year can end below a fixed deposit; the long-run lead is built over decades' },
    { text: 'Mutual funds cannot lose money.', truth: false, why: 'spreading limits the damage from one company, not a fall across the whole market' },
    { text: 'An unused premium is waste.', truth: false, myth: true, why: 'the pool pays a few because everyone paid; the protection itself is what the premium bought' },
    { text: 'EMI costs more than paying once.', truth: true, why: 'the extra is interest, which is what borrowing the money adds' },
    { text: 'A fixed deposit rate never moves.', truth: true, why: 'the rate is fixed on the day the deposit is made and holds until maturity' },
    { text: 'The 15% slab charges all income.', truth: false, myth: true, why: 'only the part of the income inside that slab is charged at 15%, and the slabs below it keep their own rates' },
    { text: 'GST is an indirect tax.', truth: true, why: 'it is added to the price of a good or service, so it is charged on what is bought rather than on what is earned' },
    { text: 'Income tax is a direct tax.', truth: true, why: 'it is charged directly on the income of the person who pays it' },
    { text: 'Deduction comes after the slabs.', truth: false, myth: true, why: 'it comes off the salary first, and the slabs are applied to the taxable income that is left' },
  ],
};
