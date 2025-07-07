# Product Extraction Tool

A generic price comparison tool that can fetch product prices from multiple e-commerce websites across different countries. The tool supports web scraping from major online retailers and provides a unified API for price comparison.

## Features

- 🌍 **Global Coverage**: Works across ALL countries worldwide (200+ countries and territories)
- 🛒 **Multiple E-commerce Platforms**: Supports Amazon, Walmart, Flipkart, eBay, and 100+ other platforms
- 🏢 **Official Brand Websites**: Includes direct manufacturer and brand websites
- 📊 **Smart Sorting**: Sort results by price, rating, or relevance
- 🔍 **Product Matching**: Ensures product relevance through intelligent parsing
- 🚀 **Scalable Architecture**: Built with Express.js and TypeScript
- 🛡️ **Error Handling**: Robust error handling and rate limiting
- 🎯 **Category Detection**: Automatically detects product categories and searches relevant websites

## Global Coverage

The tool supports **ALL countries** worldwide, including:

### Major Markets
- **North America**: US, Canada, Mexico
- **Europe**: UK, Germany, France, Italy, Spain, Netherlands, Sweden, Norway, Denmark, Finland, Poland, Czech Republic, Hungary, Romania, Bulgaria, Croatia, Slovenia, Slovakia, Estonia, Latvia, Lithuania, Ireland, Portugal, Greece, Austria, Belgium, Switzerland, Luxembourg, Malta, Cyprus, Russia, Ukraine, Belarus, Moldova, Georgia, Armenia, Azerbaijan, Kazakhstan, Uzbekistan, Kyrgyzstan, Tajikistan, Turkmenistan, Afghanistan, Pakistan, Bangladesh, Sri Lanka, Nepal, Bhutan, Maldives, Myanmar, Thailand, Vietnam, Laos, Cambodia, Malaysia, Singapore, Indonesia, Philippines, Taiwan, Hong Kong, Macau, Turkey, Israel, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Jordan, Lebanon, Syria, Iraq, Iran, Egypt, Libya, Tunisia, Algeria, Morocco, Sudan, South Sudan, Ethiopia, Eritrea, Djibouti, Somalia, Kenya, Tanzania, Uganda, Rwanda, Burundi, Mozambique, Zimbabwe, Zambia, Malawi, Namibia, Botswana, Lesotho, Eswatini, South Africa, Madagascar, Mauritius, Seychelles, Comoros, Mayotte, Réunion, Argentina, Chile, Peru, Colombia, Venezuela, Ecuador, Bolivia, Paraguay, Uruguay, Guyana, Suriname, French Guiana, Falkland Islands, South Georgia, Antarctica, New Zealand, Fiji, Papua New Guinea, Solomon Islands, Vanuatu, New Caledonia, French Polynesia, Tonga, Samoa, Kiribati, Tuvalu, Nauru, Palau, Marshall Islands, Micronesia, Cook Islands, Niue, Tokelau, American Samoa, Guam, Northern Mariana Islands, Puerto Rico, U.S. Virgin Islands, Anguilla, Antigua and Barbuda, Dominica, Grenada, Saint Lucia, Saint Vincent and the Grenadines, Saint Kitts and Nevis, Barbados, Trinidad and Tobago, Jamaica, Haiti, Dominican Republic, Cuba, Bahamas, Turks and Caicos Islands, Cayman Islands, Bermuda, Aruba, Curaçao, Sint Maarten, Caribbean Netherlands, Guadeloupe, Martinique, Saint Barthélemy, Saint Martin, Saint Pierre and Miquelon, Wallis and Futuna, Andorra, Monaco, San Marino, Vatican City, Liechtenstein, Iceland, Faroe Islands, Greenland, Svalbard and Jan Mayen, Åland Islands, Gibraltar, Jersey, Guernsey, Isle of Man, British Indian Ocean Territory, Saint Helena, Ascension Island, Tristan da Cunha, Bouvet Island, Heard and McDonald Islands, French Southern Territories, Cocos Islands, Christmas Island, Norfolk Island, Pitcairn Islands, United States Minor Outlying Islands, Palestine, Western Sahara, Kosovo

### E-commerce Platforms
The tool dynamically discovers and searches across:
- **Global Platforms**: Amazon, eBay, Walmart, Best Buy, Target, Flipkart, Snapdeal, Paytm Mall, Myntra, Argos, Currys, John Lewis, Canadian Tire, Otto, MediaMarkt, Saturn, Fnac, Darty, Cdiscount, Catch, Kogan, Harvey Norman, Rakuten, Yahoo, Alibaba, Taobao, JD, Tmall, Pinduoduo, Mercado, OLX, Gumtree, Craigslist
- **Regional Platforms**: Country-specific e-commerce sites for each region
- **Official Brand Websites**: Direct manufacturer websites for major product categories

### Product Categories
Automatically detects and searches relevant websites for:
- **Electronics**: Apple, Samsung, Sony, LG, Panasonic, Philips, Sharp, Toshiba, Hitachi, Canon, Nikon, Fujifilm, GoPro, DJI, Bose, JBL, Beats, Sennheiser, Shure, Audio-Technica, Microsoft, Google, Huawei, Xiaomi, OnePlus, OPPO, Vivo, Realme, Motorola, Nokia, ASUS, Acer, Lenovo, Dell, HP, MSI, Gigabyte, Intel, AMD, NVIDIA, Corsair, Logitech, Razer, SteelSeries
- **Fashion**: Nike, Adidas, Puma, Reebok, Under Armour, Converse, Vans, New Balance, ASICS, Skechers, Timberland, Clarks, Dr. Martens, UGG, Birkenstock, Zara, H&M, Uniqlo, Gap, Old Navy, Banana Republic, J.Crew, Forever 21, Topshop, River Island, Next, Marks & Spencer, Debenhams, House of Fraser, Selfridges, Harrods, Liberty, Farfetch, Net-a-Porter, SSENSE, Matches Fashion, Luisaviaroma, Mytheresa, Shopbop, Revolve, ASOS, Boohoo, PrettyLittleThing
- **Home**: IKEA, Wayfair, Overstock, Home Depot, Lowe's, Menards, Ace Hardware, True Value, Sherwin-Williams, Benjamin Moore, Behr, Valspar, Glidden, PPG, Dulux, Crown Paints, Farrow & Ball, Little Greene, Frenchic, Rust-Oleum, Krylon, Plasti-Dip
- **Automotive**: Toyota, Honda, Ford, Chevrolet, BMW, Mercedes-Benz, Audi, Volkswagen, Volvo, Saab, Subaru, Mazda, Nissan, Mitsubishi, Hyundai, Kia, Lexus, Infiniti, Acura, Buick, Cadillac, Chrysler, Dodge, Jeep, RAM, GMC, Pontiac, Saturn, Oldsmobile, Plymouth
- **Beauty**: Sephora, Ulta, Macy's, Nordstrom, Bloomingdale's, Neiman Marcus, Bergdorf Goodman, Saks Fifth Avenue, Barneys, Net-a-Porter, Farfetch, SSENSE, Matches Fashion, Luisaviaroma, Mytheresa, Shopbop, Revolve, ASOS, Boohoo, PrettyLittleThing, Missguided, Nasty Gal, Fashion Nova
- **Sports**: Nike, Adidas, Puma, Reebok, Under Armour, Converse, Vans, New Balance, ASICS, Skechers, Timberland, Clarks, Dr. Martens, UGG, Birkenstock, Wilson, Spalding, Nike Basketball, Adidas Basketball, Under Armour Basketball, Reebok Basketball, Puma Basketball

## API Endpoints

### 1. Health Check
**GET** `/api/v1/health`

Check if the API is running properly.

**Response:**
```json
{
  "statusCode": 200,
  "message": "Health check successful",
  "data": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "service": "Price Comparison API",
    "version": "1.0.0"
  }
}
```

### 2. Search Products
**POST** `/api/v1/product_detail`

Search for product prices across multiple websites in a specific country.

**Request Body:**
```json
{
  "query": "Apple iPhone 15 Pro",
  "country": "US",
  "maxResults": 20
}
```

**Response:**
```json
[
  {
    "link": "https://amazon.com/dp/B0CM5K8P9L",
    "price": "999",
    "currency": "USD",
    "productName": "Apple iPhone 15 Pro 128GB",
    "website": "amazon.com",
    "country": "US",
    "availability": true,
    "rating": 4.5,
    "reviewCount": 1250,
    "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71...",
    "parameter1": "Rating: 4.5/5",
    "parameter2": "Reviews: 1250",
    "parameter3": "Platform: Amazon",
    "parameter4": "Country: US",
    "parameter5": "Currency: USD"
  }
]
```

## How to Run This Project

### 🚀 Quick Start (5 minutes)

Want to get up and running quickly? Follow these steps:

```bash
# 1. Clone and setup
git clone <repository-url>
cd bharatx_extractor
npm install

# 2. Start the server
npm start

# 3. Test the API
curl -X POST http://localhost:3000/api/v1/product_detail \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 15", "country": "US"}'
```

That's it! Your price comparison API is now running on `http://localhost:3000`.

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **Docker** (optional, for containerized deployment)
- **Git** (for cloning the repository)

### Option 1: Local Development (Recommended for Development)

1. **Clone the repository:**
```bash
git clone <repository-url>
cd bharatx_extractor
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

The server will start on port 3000 (configurable in `src/config/index.ts`).

4. **Verify the server is running:**
```bash
curl http://localhost:3000/api/price-comparison/countries
```

### Option 2: Docker Deployment (Recommended for Production)

#### Quick Start with Docker Compose
```bash
# Build and run the application
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

#### Manual Docker Build
```bash
# Build the image
./build.sh

# Or manually
docker build -t bharatx-price-comparison .

# Run the container
docker run -p 3000:3000 bharatx-price-comparison

# Run with custom environment
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  bharatx-price-comparison
```

#### Development with Docker
```bash
# Build and run development version
docker-compose --profile dev up --build

# This will run the service on port 3001 with hot reload
```

#### Docker Image Management
```bash
# Build with custom tag
./build.sh -t v1.0.0

# Build development version
./build.sh -d

# List built images
docker images | grep bharatx-price-comparison

# Remove old images
docker rmi bharatx-price-comparison:latest
```

### Option 3: Development with Hot Reload

For development with automatic restart on file changes:

```bash
# Install nodemon globally (if not already installed)
npm install -g nodemon

# Run with hot reload
npm run dev

# Or use the built-in script
npm run dev:watch
```

### Troubleshooting

#### Common Issues

1. **Port already in use:**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or use a different port
export PORT=3001 && npm start
```

2. **Dependencies not found:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

3. **Docker build fails:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t bharatx-price-comparison .
```

4. **API returns no results:**
- Check your internet connection
- Some websites may block automated requests
- Try different product names or countries
- Check the logs for specific error messages

#### Available NPM Scripts

The project includes several useful npm scripts:

```bash
# Build the TypeScript project
npm run build

# Start the production server (builds and runs)
npm start

# Start development server with hot reload
npm run dev

# Run tests (when implemented)
npm test
```

#### Environment Variables

You can customize the application behavior with these environment variables:

```bash
# Server configuration
export PORT=3000
export NODE_ENV=development

# Logging
export LOG_LEVEL=info

# Timeouts
export REQUEST_TIMEOUT=20000
export MAX_REDIRECTS=5
```

## Verifying Your Installation

### Health Check

After starting the server, verify everything is working:

```bash
# Check if server is running
curl http://localhost:3000/api/v1/health

# Expected response: Health check status
```

### Test the API

Test the API functionality manually:
curl -X POST http://localhost:3000/v1/product_detail \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Samsung Galaxy S24",
    "country": "US",
    "maxResults": 5
  }'
```

## Usage Examples

### Example 1: Search for iPhone prices in US
```bash
curl -X POST http://localhost:3000/api/v1/product_detail \
  -H "Content-Type: application/json" \
  -d '{
    "query": "iPhone 15 Pro",
    "country": "US",
    "maxResults": 10
  }'
```

### Example 2: Search for Samsung phone in India
```bash
curl -X POST http://localhost:3000/api/v1/product_detail \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Samsung Galaxy S24",
    "country": "IN",
    "maxResults": 5
  }'
```

### Example 3: Health check
```bash
curl http://localhost:3000/api/v1/health
```

## Testing

Test the API functionality using curl commands:

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Search for products
curl -X POST http://localhost:3000/api/v1/product_detail \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 15", "country": "US", "maxResults": 5}'
```

## Architecture

### Core Components

1. **PriceComparator** (`src/core/PriceComparator.ts`)
   - Main service class for price comparison logic
   - Handles web scraping and data parsing
   - Supports multiple websites and countries

2. **PriceComparisonController** (`src/controller/PriceComparison.ts`)
   - HTTP request/response handling
   - Input validation and error handling
   - API response formatting

3. **Routes** (`src/api/routes/PriceComparison.ts`)
   - REST API endpoint definitions
   - Route middleware configuration

### Key Features

- **Web Scraping**: Uses Cheerio for HTML parsing and Axios for HTTP requests
- **Rate Limiting**: Implements delays and user agent rotation to avoid blocking
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Data Validation**: Input validation and sanitization
- **Extensible**: Easy to add new countries and websites

## Configuration

### Adding New Countries

To add support for a new country, update the `countryConfigs` object in `PriceComparator.ts`:

```typescript
'JP': {
  currency: 'JPY',
  language: 'ja',
  websites: ['amazon.co.jp', 'rakuten.co.jp', 'yahoo.co.jp']
}
```

### Adding New Websites

1. Add the website to the appropriate country configuration
2. Implement parsing logic in the `parseWebsiteResults` method
3. Add URL building logic in `buildSearchUrl` method

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing parameters)
- `404`: Not Found (product not found)
- `500`: Internal Server Error

## Rate Limiting & Best Practices

- The tool implements delays between requests to avoid being blocked
- Uses rotating user agents to mimic real browser behavior
- Respects robots.txt and website terms of service
- Implements timeout handling for slow responses

## Limitations

- Web scraping may be affected by website structure changes
- Some websites may block automated requests
- Results depend on website availability and product availability
- Price accuracy depends on real-time website data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details.

## Support

For issues and questions, please create an issue in the repository. 