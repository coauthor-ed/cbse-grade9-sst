// Startups arcade decks (grade 9-12 entrepreneurship).
// Plain data shared by the chapter's arcade games. Every `why` is evidence
// shown on the why card after a mix-up. `myth: true` marks common misconceptions.

// L04: Bakery tasks sorted into 4 functional departments - for ArcadeSortScene (belt).
export const FUNCTIONAL_AREAS = {
  groups: [
    { id: 'operations', label: 'Operations', tone: 1, why: 'daily production, equipment, ingredients and quality belong to operations' },
    { id: 'finance', label: 'Finance', tone: 3, why: 'budgets, paying costs, cash flow and records belong to finance' },
    { id: 'hr', label: 'Human Resources', tone: 2, why: 'hiring, training and settling quarrels at work belong to HR' },
    { id: 'marketing', label: 'Marketing', tone: 6, why: 'discounts, offers and social media posts belong to marketing' },
  ],
  items: [
    { name: 'Arrange flour', is: 'operations', why: 'arranging the ingredients for baking is operations' },
    { name: 'Check quality', is: 'operations', myth: true, why: 'checking the quality of what is baked is operations' },
    { name: 'Plan batches', is: 'operations', why: 'planning each day of baking is operations' },
    { name: 'Monthly budget', is: 'finance', why: 'making a budget for the month is finance' },
    { name: 'Pay shop rent', is: 'finance', myth: true, why: 'planning to pay the rent is finance' },
    { name: 'Record sales', is: 'finance', why: 'recording the money that comes in is finance and accounting' },
    { name: 'Hire a baker', is: 'hr', why: 'hiring bakers and helpers is human resources' },
    { name: 'Staff training', is: 'hr', myth: true, why: 'training staff in hygiene is human resources' },
    { name: 'End a quarrel', is: 'hr', why: 'settling quarrels at work is human resources' },
    { name: 'Diwali offer', is: 'marketing', myth: true, why: 'discounts and special offers are marketing' },
    { name: 'Recyclable box', is: 'marketing', why: 'promoting recyclable packaging is marketing' },
    { name: 'Social post', is: 'marketing', why: 'sharing photos and videos on social media is marketing' },
  ],
};

// L05: Business money and accounts statements - for ArcadeJudgeScene (cards).
export const MONEY_MYTHS = {
  statements: [
    { text: 'Revenue is money from sales', truth: true, why: 'revenue is the total money earned from selling goods and services' },
    { text: 'Big sales mean a big profit', truth: false, myth: true, why: 'the expenses can take away most of the money from sales' },
    { text: 'Rent stays the same', truth: true, why: 'rent is a fixed cost: it does not change with how much is baked' },
    { text: 'Flour cost rises with baking', truth: true, why: 'ingredients are a variable cost: they rise as more is baked' },
    { text: 'Profit after tax can be larger', truth: false, myth: true, why: 'tax is taken away, so profit after tax is smaller' },
    { text: 'Loan interest is an expense', truth: true, why: 'the account lists interest on a loan among the expenses' },
    { text: 'A loss means no customers', truth: false, myth: true, why: 'a business can have many sales but even bigger expenses' },
    { text: 'Profit is revenue minus expenses', truth: true, why: 'profit = total revenue minus total expenses' },
    { text: 'Packaging boxes are a fixed cost', truth: false, myth: true, why: 'packaging is a variable cost: it rises with every cake sold' },
    { text: 'An oven is a fixed cost', truth: true, why: 'equipment such as ovens costs the same however much is baked' },
    { text: 'Tax comes out of profit', truth: true, why: 'tax is taken from profit before tax to give profit after tax' },
    { text: 'Fixed cost is called overhead', truth: true, why: 'fixed costs are also called overhead costs' },
  ],
};

// L06: Entrepreneurship terminology matching - for ArcadeMatchScene (bubbles).
export const STARTUP_TERMS = {
  pairs: [
    { prompt: 'Entrepreneurship', group: 'enterprise', answer: 'Idea into a business', why: 'entrepreneurship is the process of turning an idea into a business' },
    { prompt: 'Startup', group: 'enterprise', answer: 'Young, new company', why: 'a young, early-stage company that offers a new product or service' },
    { prompt: 'Unicorn', group: 'enterprise', answer: 'Over 1 billion dollars', why: 'a startup valued at over 1 billion dollars' },
    { prompt: 'Cooperative', group: 'enterprise', answer: 'Member-owned business', why: 'a business its members own equally, sharing the profits, like Lijjat' },
    { prompt: 'Business Plan', group: 'enterprise', answer: 'A roadmap', why: 'a roadmap that helps set goals, organise resources and make decisions' },
    { prompt: 'Revenue', group: 'accounting', answer: 'Money from sales', myth: true, why: 'the total money a business earns from selling goods and services' },
    { prompt: 'Profit', group: 'accounting', answer: 'Revenue minus expenses', myth: true, why: 'the money left from revenue after paying all the expenses' },
    { prompt: 'Fixed Cost', group: 'accounting', answer: 'Stays the same', myth: true, why: 'a cost such as rent that stays the same however much is made' },
    { prompt: 'Variable Cost', group: 'accounting', answer: 'Grows with production', myth: true, why: 'a cost such as flour that goes up and down with production' },
    { prompt: 'Mortgage', group: 'operations', answer: 'Property as security', why: 'a loan to buy a house or land, with property as security' },
    { prompt: 'Inventory', group: 'operations', answer: 'Goods a business holds', why: 'goods and materials a business holds for making or selling' },
    { prompt: 'Functional Area', group: 'operations', answer: 'Main area of work', why: 'one of four areas: operations, finance, human resources, marketing' },
    { prompt: 'Atmanirbhar Bharat', group: 'national', answer: 'Self-reliance policy', why: 'a national policy framework from 2020 to make India self-reliant' },
    { prompt: 'Viksit Bharat 2047', group: 'national', answer: 'Developed nation 2047', why: 'the vision of a fully developed India by 2047, 100 years of independence' },
  ],
};
