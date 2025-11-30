# X-kom Product Scraper

This script scrapes product information from X-kom's tablets category, including:
- Product name
- Price
- Memory

## Setup

1. Install Node.js if you haven't already (https://nodejs.org/)

2. Install dependencies:
```bash
npm install
```

## Running the Scraper

Run the script:
```bash
npm start
```

The script will:
1. Launch a browser
2. Navigate to the X-kom tablets page
3. Extract product information
4. Save results to `xkom_products.csv`
5. Display results in the console

## Output

The script creates a CSV file with the following columns:
- Name: Product name
- Price (PLN): Product price in Polish Zloty
- Memory (GB)