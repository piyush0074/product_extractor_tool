import logger from '../loaders/Logger';
logger.silly("PriceComparator loading");
import axios from 'axios';
logger.silly("PriceComparator loading");
import * as cheerio from 'cheerio';
logger.silly("PriceComparator loading");
import { ApiError } from './APIerror';
logger.silly("PriceComparator loading");
import { countryConfigs } from '../config/countries';
logger.silly("PriceComparator loading");
import { globalPlatforms, countrySpecificPlatforms, domainMapping, officialBrands } from '../config/websites';
logger.silly("PriceComparator loading");
import { detectProductCategory } from '../config/productCategories';
logger.silly("PriceComparator loaded");

export interface PriceResult {
  link: string;
  price: string;
  currency: string;
  productName: string;
  website: string;
  country: string;
  availability: boolean;
  rating?: number;
  reviewCount?: number;
  shipping?: string;
  originalPrice?: string;
  discount?: string;
  imageUrl?: string;
  // Additional unified fields
  parameter1?: string;
  parameter2?: string;
  parameter3?: string;
  parameter4?: string;
  parameter5?: string;
}

export interface SearchConfig {
  country: string;
  language?: string;
  currency?: string;
  maxResults?: number;
  sortBy?: 'price' | 'rating' | 'relevance';
}

export class PriceComparator {
  private static instance: PriceComparator;
  private userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];



  static getInstance(): PriceComparator {
    if (!PriceComparator.instance) {
      PriceComparator.instance = new PriceComparator();
    }
    return PriceComparator.instance;
  }

  private constructor() { }

  async searchProduct(productName: string, config: SearchConfig): Promise<PriceResult[]> {
    try {
      const countryConfig = countryConfigs[config.country.toUpperCase()];
      if (!countryConfig) {
        throw new Error(`Country ${config.country} is not supported`);
      }

      const results: PriceResult[] = [];

      // Step 1: Try search engines first (DuckDuckGo, Google, Bing)
      const searchResults = await this.searchAlternativeEngines(productName, config.country);
      logger.info(`Found ${searchResults.length} search results for ${productName}`);

      if (searchResults.length > 0) {
        // Step 2: Extract product details from search results
        const productUrls = this.extractProductUrls(searchResults);
        logger.info(`Extracted ${productUrls.length} product URLs from search results`);

        // Step 3: Scrape product details from each URL (convert to country-specific domains)
        const promises = productUrls.map(url => {
          const countrySpecificUrl = this.convertUrlToCountryDomain(url, config.country);
          return this.getProductDetails(countrySpecificUrl, config.country);
        });
        const productResults = await Promise.allSettled(promises);

        productResults.forEach((result: PromiseSettledResult<PriceResult | null>, index: number) => {
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          } else {
            const error = (result as PromiseRejectedResult).reason;
            logger.error(`Failed to get product details from ${productUrls[index]}: ${error}`);
            
            // If it's a network error, try with a different approach
            if (error && (error.toString().includes('503') || error.toString().includes('timeout') || error.toString().includes('ECONNREFUSED'))) {
              logger.info(`Attempting alternative approach for ${productUrls[index]}`);
              // Try to extract basic info from the URL itself
              const country = config.country || 'US';
              const basicResult = this.extractBasicInfoFromUrl(productUrls[index]!, country);
              if (basicResult) {
                results.push(basicResult);
              }
            }
          }
        });
      }

      // Step 4: Always try e-commerce platforms
      logger.info(`Search engines found ${results.length} results, now trying e-commerce platforms...`);
      
      const ecommerceWebsites = this.getEcommerceWebsitesForCountry(config.country);
      const ecommercePromises = ecommerceWebsites.map(website =>
        this.searchOnWebsite(productName, website, config, countryConfig)
      );

      const ecommerceResults = await Promise.allSettled(ecommercePromises);

      ecommerceResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(...result.value);
        } else {
          logger.error(`Failed to search on e-commerce ${ecommerceWebsites[index]}: ${(result as PromiseRejectedResult).reason}`);
        }
      });
      
      logger.info(`After e-commerce searches, total results: ${results.length}`);

      // Step 5: Always try brand websites
      logger.info(`Now trying brand websites...`);
      
      const brandWebsites = this.getBrandWebsitesForProduct(productName);
      const brandPromises = brandWebsites.map(website =>
        this.searchOnWebsite(productName, website, config, countryConfig)
      );

      const brandResults = await Promise.allSettled(brandPromises);

      brandResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(...result.value);
        } else {
          logger.error(`Failed to search on brand website ${brandWebsites[index]}: ${(result as PromiseRejectedResult).reason}`);
        }
      });
      
      logger.info(`After brand website searches, total results: ${results.length}`);

      return this.sortResults(results, config.sortBy || 'price');
    } catch (error: any) {
      throw new Error(`Error searching for product: ${error?.message}`);
    }
  }

  private getEcommerceWebsitesForCountry(country: string): string[] {
    const websites: string[] = [];
    const countryLower = country.toLowerCase();

    // Add country-specific e-commerce platforms
    const countrySpecificPlatforms = this.getCountrySpecificPlatforms(country);
    websites.push(...countrySpecificPlatforms);

    // Add global platforms with country-specific domains
    globalPlatforms.forEach((platform: string) => {
      const countryDomain = this.getCountryDomain(platform, country);
      if (countryDomain) {
        websites.push(countryDomain);
      }
    });

    // Remove duplicates and limit to reasonable number
    return [...new Set(websites)].slice(0, 15);
  }

  private getBrandWebsitesForProduct(productName: string): string[] {
    const websites: string[] = [];

    // Add official brand websites based on product category
    const productCategory = detectProductCategory(productName);
    if (productCategory && officialBrands[productCategory as keyof typeof officialBrands]) {
      websites.push(...officialBrands[productCategory as keyof typeof officialBrands]);
    }

    // Remove duplicates and limit to reasonable number
    return [...new Set(websites)].slice(0, 10);
  }

  private getWebsitesForCountry(country: string, productName: string): string[] {
    const websites: string[] = [];
    const countryLower = country.toLowerCase();

    // Add country-specific e-commerce platforms
    const countrySpecificPlatforms = this.getCountrySpecificPlatforms(country);
    websites.push(...countrySpecificPlatforms);

    // Add global platforms with country-specific domains
    globalPlatforms.forEach((platform: string) => {
      const countryDomain = this.getCountryDomain(platform, country);
      if (countryDomain) {
        websites.push(countryDomain);
      }
    });

    // Add official brand websites based on product category
    const productCategory = detectProductCategory(productName);
    if (productCategory && officialBrands[productCategory as keyof typeof officialBrands]) {
      websites.push(...officialBrands[productCategory as keyof typeof officialBrands]);
    }

    // Remove duplicates and limit to reasonable number
    return [...new Set(websites)].slice(0, 20);
  }

  private getCountrySpecificPlatforms(country: string): string[] {
    return countrySpecificPlatforms[country.toUpperCase()] || [];
  }

  private getCountryDomain(platform: string, country: string): string | null {
    return domainMapping[platform]?.[country] || null;
  }

  private isBrandWebsite(website: string): boolean {
    // Check if it's a brand website (not a major e-commerce platform)
    const ecommercePlatforms = [
      'amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.ca', 'amazon.de', 'amazon.fr', 'amazon.com.au',
      'walmart.com', 'walmart.ca',
      'flipkart.com',
      'ebay.com', 'ebay.co.uk', 'ebay.ca', 'ebay.de', 'ebay.fr', 'ebay.com.au',
      'bestbuy.com', 'bestbuy.ca',
      'target.com', 'target.com.au'
    ];
    
    return !ecommercePlatforms.some(platform => website.includes(platform));
  }

  private async searchBrandWebsite($: cheerio.CheerioAPI, website: string, productName: string, countryConfig: any): Promise<PriceResult[]> {
    const results: PriceResult[] = [];
    const productKeywords = productName.toLowerCase().split(' ').filter(word => word.length > 2);
    const foundUrls: string[] = [];
    
    logger.info(`Searching for product "${productName}" on brand website ${website}`);
    
    // Look for links that contain product-related text
    $('a[href*="/product"], a[href*="/item"], a[href*="/shop"], a[href*="/buy"], a[href*="/store"], a[href*="/catalog"]').each((index: number, element: any) => {
      if (index >= 15) return; // Limit results
      
      const $el = $(element);
      const linkText = $el.text().toLowerCase();
      const href = $el.attr('href');
      
      // Check if the link text contains product keywords
      const hasProductKeywords = productKeywords.some(keyword => 
        linkText.includes(keyword)
      );
      
      if (hasProductKeywords && href) {
        const fullUrl = href.startsWith('http') ? href : `https://${website}${href}`;
        foundUrls.push(fullUrl);
      }
    });
    
    // Also look for product mentions in the page content
    $('h1, h2, h3, h4, .title, .product-title, .name, .product-name, .item-title').each((index: number, element: any) => {
      if (index >= 10) return;
      
      const $el = $(element);
      const titleText = $el.text().toLowerCase();
      const parentLink = $el.closest('a');
      
      // Check if the title contains product keywords
      const hasProductKeywords = productKeywords.some(keyword => 
        titleText.includes(keyword)
      );
      
      if (hasProductKeywords && parentLink.length > 0) {
        const href = parentLink.attr('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : `https://${website}${href}`;
          foundUrls.push(fullUrl);
        }
      }
    });
    
    // Look for product mentions in text content and find nearby links
    $('p, div, span').each((index: number, element: any) => {
      if (index >= 50) return; // Limit to avoid too much processing
      
      const $el = $(element);
      const textContent = $el.text().toLowerCase();
      
      // Check if the text contains product keywords
      const hasProductKeywords = productKeywords.some(keyword => 
        textContent.includes(keyword)
      );
      
      if (hasProductKeywords) {
        // Look for links within this element or nearby
        const nearbyLink = $el.find('a').first();
        if (nearbyLink.length > 0) {
          const href = nearbyLink.attr('href');
          if (href) {
            const fullUrl = href.startsWith('http') ? href : `https://${website}${href}`;
            foundUrls.push(fullUrl);
          }
        }
      }
    });
    
    // Remove duplicates
    const uniqueUrls = [...new Set(foundUrls)];
    logger.info(`Found ${uniqueUrls.length} unique product URLs on ${website}`);
    
    // Get product details from each URL (convert to country-specific domains)
    const promises = uniqueUrls.map(url => {
      const countrySpecificUrl = this.convertUrlToCountryDomain(url, countryConfig.country);
      return this.getProductDetails(countrySpecificUrl, countryConfig.country);
    });
    const productResults = await Promise.allSettled(promises);
    
    productResults.forEach((result: PromiseSettledResult<PriceResult | null>) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    });
    
    logger.info(`Successfully extracted ${results.length} products from ${website}`);
    return results;
  }

  private detectProductCategory(productName: string): string | null {
    const lowerName = productName.toLowerCase();

    // Electronics
    if (lowerName.includes('phone') || lowerName.includes('iphone') || lowerName.includes('samsung') ||
      lowerName.includes('android') || lowerName.includes('smartphone') || lowerName.includes('mobile') ||
      lowerName.includes('laptop') || lowerName.includes('computer') || lowerName.includes('pc') ||
      lowerName.includes('tablet') || lowerName.includes('ipad') || lowerName.includes('macbook') ||
      lowerName.includes('camera') || lowerName.includes('tv') || lowerName.includes('television') ||
      lowerName.includes('headphone') || lowerName.includes('speaker') || lowerName.includes('earbud') ||
      lowerName.includes('gaming') || lowerName.includes('console') || lowerName.includes('playstation') ||
      lowerName.includes('xbox') || lowerName.includes('nintendo') || lowerName.includes('switch')) {
      return 'electronics';
    }

    // Fashion
    if (lowerName.includes('shirt') || lowerName.includes('dress') || lowerName.includes('pant') ||
      lowerName.includes('jean') || lowerName.includes('shoe') || lowerName.includes('sneaker') ||
      lowerName.includes('boot') || lowerName.includes('jacket') || lowerName.includes('coat') ||
      lowerName.includes('suit') || lowerName.includes('tie') || lowerName.includes('watch') ||
      lowerName.includes('jewelry') || lowerName.includes('bag') || lowerName.includes('purse') ||
      lowerName.includes('wallet') || lowerName.includes('belt') || lowerName.includes('hat') ||
      lowerName.includes('cap') || lowerName.includes('scarf') || lowerName.includes('glove') ||
      lowerName.includes('sock') || lowerName.includes('underwear') || lowerName.includes('lingerie')) {
      return 'fashion';
    }

    // Home
    if (lowerName.includes('furniture') || lowerName.includes('chair') || lowerName.includes('table') ||
      lowerName.includes('bed') || lowerName.includes('sofa') || lowerName.includes('couch') ||
      lowerName.includes('lamp') || lowerName.includes('light') || lowerName.includes('mirror') ||
      lowerName.includes('curtain') || lowerName.includes('carpet') || lowerName.includes('rug') ||
      lowerName.includes('pillow') || lowerName.includes('blanket') || lowerName.includes('sheet') ||
      lowerName.includes('towel') || lowerName.includes('kitchen') || lowerName.includes('appliance') ||
      lowerName.includes('refrigerator') || lowerName.includes('stove') || lowerName.includes('oven') ||
      lowerName.includes('microwave') || lowerName.includes('dishwasher') || lowerName.includes('washer') ||
      lowerName.includes('dryer') || lowerName.includes('vacuum') || lowerName.includes('cleaner')) {
      return 'home';
    }

    // Automotive
    if (lowerName.includes('car') || lowerName.includes('truck') || lowerName.includes('suv') ||
      lowerName.includes('motorcycle') || lowerName.includes('bike') || lowerName.includes('bicycle') ||
      lowerName.includes('tire') || lowerName.includes('wheel') || lowerName.includes('engine') ||
      lowerName.includes('battery') || lowerName.includes('oil') || lowerName.includes('filter') ||
      lowerName.includes('brake') || lowerName.includes('clutch') || lowerName.includes('transmission') ||
      lowerName.includes('exhaust') || lowerName.includes('muffler') || lowerName.includes('radiator') ||
      lowerName.includes('alternator') || lowerName.includes('starter') || lowerName.includes('ignition')) {
      return 'automotive';
    }

    // Beauty
    if (lowerName.includes('makeup') || lowerName.includes('cosmetic') || lowerName.includes('perfume') ||
      lowerName.includes('cologne') || lowerName.includes('skincare') || lowerName.includes('cream') ||
      lowerName.includes('lotion') || lowerName.includes('soap') || lowerName.includes('shampoo') ||
      lowerName.includes('conditioner') || lowerName.includes('hair') || lowerName.includes('nail') ||
      lowerName.includes('polish') || lowerName.includes('brush') || lowerName.includes('mirror') ||
      lowerName.includes('razor') || lowerName.includes('shave') || lowerName.includes('deodorant') ||
      lowerName.includes('toothpaste') || lowerName.includes('toothbrush') || lowerName.includes('floss')) {
      return 'beauty';
    }

    // Sports
    if (lowerName.includes('sport') || lowerName.includes('fitness') || lowerName.includes('exercise') ||
      lowerName.includes('gym') || lowerName.includes('workout') || lowerName.includes('running') ||
      lowerName.includes('jogging') || lowerName.includes('walking') || lowerName.includes('hiking') ||
      lowerName.includes('camping') || lowerName.includes('fishing') || lowerName.includes('hunting') ||
      lowerName.includes('golf') || lowerName.includes('tennis') || lowerName.includes('basketball') ||
      lowerName.includes('football') || lowerName.includes('soccer') || lowerName.includes('baseball') ||
      lowerName.includes('volleyball') || lowerName.includes('swimming') || lowerName.includes('cycling') ||
      lowerName.includes('yoga') || lowerName.includes('pilates') || lowerName.includes('dance')) {
      return 'sports';
    }

    return null;
  }

  private async searchAlternativeEngines(productName: string, country: string): Promise<string[]> {
    const urls: string[] = [];
    
    try {
      // Try DuckDuckGo first (most accessible)
      logger.info(`Starting search with DuckDuckGo for: ${productName}`);
      const duckDuckGoUrls = await this.searchDuckDuckGo(productName, country);
      urls.push(...duckDuckGoUrls);
      logger.info(`DuckDuckGo found ${duckDuckGoUrls.length} URLs`);
      
      // Try Bing second (more accessible than Google)
      logger.info(`Starting search with Bing for: ${productName}`);
      const bingUrls = await this.searchBing(productName, country);
      urls.push(...bingUrls);
      logger.info(`Bing found ${bingUrls.length} URLs`);
      
      // Try Google last (most likely to be blocked)
      logger.info(`Starting search with Google for: ${productName}`);
      const googleUrls = await this.searchGoogle(productName, country);
      urls.push(...googleUrls);
      logger.info(`Google found ${googleUrls.length} URLs`);
      
      // If Google was blocked, try to get more results from other engines
      if (googleUrls.length === 0) {
        logger.info(`Google was blocked, trying to get more results from other search engines...`);
        
        // Try DuckDuckGo again with different query
        const additionalDuckDuckGoUrls = await this.searchDuckDuckGo(`${productName} price comparison`, country);
        urls.push(...additionalDuckDuckGoUrls);
        logger.info(`Additional DuckDuckGo search found ${additionalDuckDuckGoUrls.length} URLs`);
        
        // Try Bing again with different query
        const additionalBingUrls = await this.searchBing(`${productName} best price`, country);
        urls.push(...additionalBingUrls);
        logger.info(`Additional Bing search found ${additionalBingUrls.length} URLs`);
      }
      
      const uniqueUrls = [...new Set(urls)]; // Remove duplicates
      logger.info(`Search engines found ${uniqueUrls.length} total unique URLs for country: ${country}`);
      
      // Debug: Log some sample URLs to understand what we're getting
      if (uniqueUrls.length > 0) {
        logger.info(`Sample URLs found: ${uniqueUrls.slice(0, 3).join(', ')}`);
      } else {
        logger.warn(`No URLs found for country: ${country} - this might indicate a country-specific issue`);
      }
      
      return uniqueUrls;
    } catch (error: any) {
      logger.error(`Search engines failed: ${error?.message}`);
      return [];
    }
  }

  private async searchDuckDuckGo(productName: string, country?: string): Promise<string[]> {
    try {
      const searchQuery = encodeURIComponent(`${productName} buy online price`);
      // Use country-specific locale for better results
      const locale = this.getDuckDuckGoLocale(country);
      const searchUrl = `https://duckduckgo.com/html/?q=${searchQuery}&kl=${locale}`;
      
      logger.info(`Searching DuckDuckGo for: ${productName} with locale: ${locale}`);
      
      const response = await this.makeRequest(searchUrl);
      if (!response) return [];

      const $ = cheerio.load(response);
      const urls: string[] = [];

      // Extract URLs from DuckDuckGo search results - focus on organic results, skip ads
      $('.result__a, .result__url, .result__title a, .result__snippet a').each((index: number, element: any) => {
        const href = $(element).attr('href');
        if (href) {
          // Skip ad/sponsored links
          if (this.isAdLink(href)) {
            logger.debug(`Skipping ad link: ${href}`);
            return;
          }
          
          // DuckDuckGo uses redirect URLs, we need to extract the actual URL
          const actualUrl = this.extractActualUrl(href);
          if (actualUrl && this.isProductUrl(actualUrl) && !this.isSearchResultPage(actualUrl)) {
            logger.debug(`Found product URL: ${actualUrl}`);
            urls.push(actualUrl);
          } else {
            logger.debug(`Filtered out URL: ${actualUrl} (isProductUrl: ${this.isProductUrl(actualUrl || '')}, isSearchResult: ${this.isSearchResultPage(actualUrl || '')})`);
          }
        }
      });

      logger.info(`DuckDuckGo found ${urls.length} product URLs`);
      return urls.slice(0, 8); // Get more results from DuckDuckGo since it's more reliable
    } catch (error: any) {
      logger.error(`DuckDuckGo search failed: ${error?.message}`);
      return [];
    }
  }

  private async searchBing(productName: string, country?: string): Promise<string[]> {
    try {
      const searchQuery = encodeURIComponent(`${productName} buy online price`);
      const bingLocale = this.getBingLocale(country);
      const searchUrl = `https://www.bing.com/search?q=${searchQuery}&setlang=${bingLocale}&cc=${country?.toUpperCase() || 'US'}`;
      
      logger.info(`Searching Bing for: ${productName} with locale: ${bingLocale} and country: ${country}`);
      
      const response = await this.makeRequest(searchUrl);
      if (!response) return [];

      const $ = cheerio.load(response);
      const urls: string[] = [];

      // Extract URLs from Bing search results - look for actual product links
      $('h2 a, .b_algo a, .b_title a, .b_caption a').each((index: number, element: any) => {
        const href = $(element).attr('href');
        if (href) {
          // Bing uses redirect URLs, we need to extract the actual URL
          const actualUrl = this.extractActualUrl(href);
          if (actualUrl && this.isProductUrl(actualUrl)) {
            urls.push(actualUrl);
          }
        }
      });

      logger.info(`Bing found ${urls.length} product URLs`);
      return urls.slice(0, 8); // Get more results from Bing since it's more reliable
    } catch (error: any) {
      logger.error(`Bing search failed: ${error?.message}`);
      return [];
    }
  }

  private extractActualUrl(redirectUrl: string): string | null {
    try {
      // Handle different types of redirect URLs
      if (redirectUrl.includes('duckduckgo.com/l/?uddg=')) {
        // DuckDuckGo redirect
        const urlParams = new URLSearchParams(redirectUrl.split('?')[1]);
        return urlParams.get('uddg') || null;
      } else if (redirectUrl.includes('duckduckgo.com/y.js')) {
        // DuckDuckGo ad redirect - extract from u3 parameter
        const urlParams = new URLSearchParams(redirectUrl.split('?')[1]);
        const u3Param = urlParams.get('u3');
        if (u3Param) {
          try {
            const decodedU3 = decodeURIComponent(u3Param);
            const bingParams = new URLSearchParams(decodedU3.split('?')[1]);
            const actualUrl = bingParams.get('u');
            if (actualUrl) {
              return decodeURIComponent(actualUrl);
            }
          } catch {
            // If parsing fails, return null
            return null;
          }
        }
        return null;
      } else if (redirectUrl.includes('bing.com/ck/')) {
        // Bing redirect
        const urlParams = new URLSearchParams(redirectUrl.split('?')[1]);
        return urlParams.get('u') || null;
      } else if (redirectUrl.includes('google.com/url?')) {
        // Google redirect (if we use it)
        const urlParams = new URLSearchParams(redirectUrl.split('?')[1]);
        return urlParams.get('q') || urlParams.get('url') || null;
      } else {
        // Direct URL
        return redirectUrl;
      }
    } catch {
      return null;
    }
  }

  private async searchGoogle(productName: string, country: string): Promise<string[]> {
    try {
      const googleDomain = this.getGoogleDomain(country);
      const searchQuery = encodeURIComponent(`${productName} buy online price`);
      const searchUrl = `https://${googleDomain}/search?q=${searchQuery}&num=10&hl=en&gl=${country.toLowerCase()}&source=hp&ei=&iflsig=&ved=&uact=5&oq=${encodeURIComponent(productName)}&gs_lcp=&sclient=gws-wiz`;
      
      logger.info(`Searching Google (${googleDomain}) for: ${productName}`);
      
      const response = await this.makeRequest(searchUrl);
      if (!response) {
        logger.warn(`No response from Google search for: ${productName}`);
        return [];
      }

      // Check if Google blocked the request
      if (response.includes('trouble accessing Google Search') || 
          response.includes('unusual traffic') || 
          response.includes('robot') ||
          response.includes('captcha') ||
          response.includes('Our systems have detected unusual traffic') ||
          response.includes('To continue, please type the characters below') ||
          response.includes('Please complete the security check') ||
          response.includes('Sorry, we can\'t verify that you\'re not a robot') ||
          response.includes('Please try your request again') ||
          response.includes('We\'re sorry...') ||
          response.includes('Access denied')) {
        logger.warn(`Google blocked the search request for: ${productName} - this is normal, continuing with other search engines`);
        return [];
      }

      const $ = cheerio.load(response);
      const urls: string[] = [];

      // Extract URLs from Google search results - look for organic results
      $('h3 a, .g a, [data-ved] a, .yuRUbf a, .rc a, .LC20lb a').each((index: number, element: any) => {
        const href = $(element).attr('href');
        if (href) {
          // Clean the URL (remove Google redirects)
          const cleanUrl = this.extractActualUrl(href);
          if (cleanUrl && this.isProductUrl(cleanUrl)) {
            urls.push(cleanUrl);
          }
        }
      });

      logger.info(`Google found ${urls.length} product URLs`);
      return [...new Set(urls)].slice(0, 5); // Remove duplicates and limit
    } catch (error: any) {
      logger.error(`Google search failed: ${error?.message}`);
      return [];
    }
  }

  private cleanGoogleUrl(url: string): string | null {
    try {
      // Remove Google redirects and tracking parameters
      if (url.includes('google.com/url?')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const actualUrl = urlParams.get('q') || urlParams.get('url');
        return actualUrl || null;
      }
      return url;
    } catch {
      return null;
    }
  }

  private getGoogleDomain(country: string): string {
    const googleDomains: { [key: string]: string } = {
      'US': 'google.com',
      'IN': 'google.co.in',
      'UK': 'google.co.uk',
      'CA': 'google.ca',
      'DE': 'google.de',
      'FR': 'google.fr',
      'AU': 'google.com.au',
      'JP': 'google.co.jp',
      'KR': 'google.co.kr',
      'CN': 'google.cn',
      'BR': 'google.com.br',
      'MX': 'google.com.mx'
    };
    return googleDomains[country.toUpperCase()] || 'google.com';
  }

  private getDuckDuckGoLocale(country?: string): string {
    const locales: { [key: string]: string } = {
      'US': 'us-en',
      'IN': 'in-en',
      'UK': 'uk-en',
      'CA': 'ca-en',
      'DE': 'de-de',
      'FR': 'fr-fr',
      'AU': 'au-en',
      'JP': 'jp-jp',
      'KR': 'kr-kr',
      'BR': 'br-pt',
      'MX': 'mx-es'
    };
    return locales[country?.toUpperCase() || ''] || 'us-en';
  }

  private getBingLocale(country?: string): string {
    const locales: { [key: string]: string } = {
      'US': 'en-US',
      'IN': 'en-IN',
      'UK': 'en-GB',
      'CA': 'en-CA',
      'DE': 'de-DE',
      'FR': 'fr-FR',
      'AU': 'en-AU',
      'JP': 'ja-JP',
      'KR': 'ko-KR',
      'BR': 'pt-BR',
      'MX': 'es-MX'
    };
    return locales[country?.toUpperCase() || ''] || 'en-US';
  }

  private isProductUrl(url: string): boolean {
    const productKeywords = ['product', 'item', 'buy', 'shop', 'store', 'amazon', 'walmart', 'ebay', 'flipkart', 'bestbuy', 'target'];
    const excludedKeywords = ['search', 'category', 'list', 'results', 'compare', 'review'];
    
    const lowerUrl = url.toLowerCase();
    
    // Must contain at least one product keyword
    const hasProductKeyword = productKeywords.some(keyword => lowerUrl.includes(keyword));
    
    // Must not contain excluded keywords
    const hasExcludedKeyword = excludedKeywords.some(keyword => lowerUrl.includes(keyword));
    
    // Must be from a known e-commerce domain or have product-like path
    const isEcommerceDomain = lowerUrl.includes('amazon') || 
                             lowerUrl.includes('walmart') || 
                             lowerUrl.includes('ebay') || 
                             lowerUrl.includes('flipkart') ||
                             lowerUrl.includes('bestbuy') ||
                             lowerUrl.includes('target') ||
                             lowerUrl.includes('apple.com/shop') ||
                             lowerUrl.includes('samsung.com') ||
                             lowerUrl.includes('product') ||
                             lowerUrl.includes('/p/') ||
                             lowerUrl.includes('/item/');
    
    return hasProductKeyword && !hasExcludedKeyword && isEcommerceDomain;
  }

  private convertUrlToCountryDomain(url: string, country: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Convert global domains to country-specific domains
      if (hostname.includes('amazon.com') && country.toUpperCase() !== 'US') {
        const countryDomain = this.getCountryDomain('amazon', country);
        if (countryDomain) {
          urlObj.hostname = countryDomain;
          return urlObj.toString();
        }
      }
      
      if (hostname.includes('walmart.com') && country.toUpperCase() !== 'US') {
        const countryDomain = this.getCountryDomain('walmart', country);
        if (countryDomain) {
          urlObj.hostname = countryDomain;
          return urlObj.toString();
        }
      }
      
      if (hostname.includes('ebay.com') && country.toUpperCase() !== 'US') {
        const countryDomain = this.getCountryDomain('ebay', country);
        if (countryDomain) {
          urlObj.hostname = countryDomain;
          return urlObj.toString();
        }
      }
      
      if (hostname.includes('bestbuy.com') && country.toUpperCase() !== 'US') {
        const countryDomain = this.getCountryDomain('bestbuy', country);
        if (countryDomain) {
          urlObj.hostname = countryDomain;
          return urlObj.toString();
        }
      }
      
      return url;
    } catch {
      return url;
    }
  }

  private isSearchResultPage(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    
    // Check for search result page indicators
    const searchIndicators = [
      '/s?', '/search?', '/sch/', '/results', '/list', '/category',
      'keyword=', 'searchTerm=', 'q=', 'query=', 'search=',
      'results for', 'over', 'results', 'sort by', 'filter'
    ];
    
    return searchIndicators.some(indicator => lowerUrl.includes(indicator));
  }

  private isAdLink(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    
    // Check for ad/sponsored link indicators
    const adIndicators = [
      'ad_domain=', 'ad_provider=', 'ad_type=', 'click_metadata=',
      'aclick', 'bing.com/aclick', 'duckduckgo.com/y.js',
      'sponsored', 'ad', 'ads', 'advertisement',
      'utm_source=', 'utm_medium=', 'utm_campaign=',
      'gclid=', 'fbclid=', 'msclkid='
    ];
    
    return adIndicators.some(indicator => lowerUrl.includes(indicator));
  }

  private extractProductUrls(googleResults: string[]): string[] {
    return googleResults.filter(url => {
      // Filter out non-product URLs
      const excludedDomains = ['google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com'];
      const domain = new URL(url).hostname;
      return !excludedDomains.some(excluded => domain.includes(excluded));
    });
  }

  private async searchOnWebsite(
    productName: string,
    website: string,
    config: SearchConfig,
    countryConfig: any
  ): Promise<PriceResult[]> {
    try {
      const searchUrl = this.buildSearchUrl(website, productName, config);
      
      if (!searchUrl) {
        logger.info(`Skipping ${website} - no search URL available`);
        return [];
      }

      const response = await this.makeRequest(searchUrl);

      if (!response) return [];

      const $ = cheerio.load(response);
      
      // Check if this is a brand website (homepage)
      if (this.isBrandWebsite(website)) {
        return await this.searchBrandWebsite($, website, productName, countryConfig);
      } else {
        return this.parseWebsiteResults($, website, countryConfig);
      }
    } catch (error: any) {
      logger.error(`Error searching on ${website}: ${error?.message}`);
      return [];
    }
  }

  private buildSearchUrl(website: string, productName: string, config: SearchConfig): string | null {
    const encodedProduct = encodeURIComponent(productName);

    // Only support major e-commerce platforms with known search patterns
    switch (website) {
      case 'amazon.com':
      case 'amazon.in':
      case 'amazon.co.uk':
      case 'amazon.ca':
      case 'amazon.de':
      case 'amazon.fr':
      case 'amazon.com.au':
        return `https://${website}/s?k=${encodedProduct}`;

      case 'walmart.com':
      case 'walmart.ca':
        return `https://${website}/search?q=${encodedProduct}`;

      case 'flipkart.com':
        return `https://${website}/search?q=${encodedProduct}`;

      case 'ebay.com':
      case 'ebay.co.uk':
      case 'ebay.ca':
      case 'ebay.de':
      case 'ebay.fr':
      case 'ebay.com.au':
        return `https://${website}/sch/i.html?_nkw=${encodedProduct}`;

      case 'bestbuy.com':
      case 'bestbuy.ca':
        return `https://${website}/site/searchpage.jsp?st=${encodedProduct}`;

      case 'target.com':
      case 'target.com.au':
        return `https://${website}/search?searchTerm=${encodedProduct}`;

      default:
        // For brand websites, return homepage URL to search for product links
        return `https://${website}`;
    }
  }

  private async makeRequest(url: string): Promise<string | null> {
    try {
      const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      
      // Add more realistic headers for all requests
      const headers: any = {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',
      };

      // Add specific headers for Google requests to look more legitimate
      if (url.includes('google.com')) {
        headers['Referer'] = 'https://www.google.com/';
        headers['Sec-Fetch-Site'] = 'same-origin';
        headers['Sec-Fetch-Mode'] = 'navigate';
        headers['Sec-Fetch-Dest'] = 'document';
        headers['Sec-Fetch-User'] = '?1';
        headers['X-Client-Data'] = 'CIa2yQEIo7bJAQipncoBCKijygEIkqHLAQiFoM0BCJyrzQEI8KvNAQj1q80BCIqtzQEIj67NAQiZr80BCKmvzQEI2q/NAQjcr80BCJ2wzQEIq7HNAQ==';
        
        // Add a longer, more random delay to avoid rate limiting
        const delay = Math.random() * 3000 + 2000; // 2-5 seconds
        logger.debug(`Adding ${Math.round(delay)}ms delay for Google request`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await axios.get(url, {
        headers,
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // Accept all status codes below 500
      });
      
      return response.data;
    } catch (error: any) {
      logger.error(`Request failed for ${url}: ` + error?.message);
      return null;
    }
  }

  private parseWebsiteResults($: cheerio.CheerioAPI, website: string, countryConfig: any): PriceResult[] {
    const results: PriceResult[] = [];

    try {
      switch (website) {
        case 'amazon.com':
        case 'amazon.in':
        case 'amazon.co.uk':
        case 'amazon.ca':
        case 'amazon.de':
        case 'amazon.fr':
        case 'amazon.com.au':
          this.parseAmazonResults($, website, countryConfig, results);
          break;

        case 'walmart.com':
        case 'walmart.ca':
          this.parseWalmartResults($, website, countryConfig, results);
          break;

        case 'flipkart.com':
          this.parseFlipkartResults($, website, countryConfig, results);
          break;

        case 'ebay.com':
        case 'ebay.co.uk':
        case 'ebay.ca':
        case 'ebay.de':
        case 'ebay.fr':
        case 'ebay.com.au':
          this.parseEbayResults($, website, countryConfig, results);
          break;

        default:
          this.parseGenericResults($, website, countryConfig, results);
      }
    } catch (error: any) {
      logger.error(`Error parsing results from ${website}: ${error?.message}`);
    }

    return results;
  }

  private parseAmazonResults($: cheerio.CheerioAPI, website: string, countryConfig: any, results: PriceResult[]): void {
    $('[data-component-type="s-search-result"]').each((index: number, element: any) => {
      if (index >= 10) return; // Limit results

      const $el = $(element);
      const title = $el.find('h2 a span').first().text().trim();
      const link = 'https://' + website + $el.find('h2 a').attr('href');
      const priceText = $el.find('.a-price-whole').text().trim();
      const rating = parseFloat($el.find('.a-icon-alt').text().match(/(\d+\.?\d*)/)?.[1] || '0');
      const reviewCount = parseInt($el.find('.a-size-base').text().replace(/[^\d]/g, '') || '0');
      const imageUrl = $el.find('img.s-image').attr('src');
      const originalPrice = $el.find('.a-text-strike').text().trim();
      const discount = $el.find('.a-badge-text').text().trim();

      if (title && priceText) {
        results.push({
          link,
          price: priceText,
          currency: countryConfig.currency,
          productName: title,
          website,
          country: countryConfig.country || 'US',
          availability: true,
          rating,
          reviewCount,
          imageUrl,
          originalPrice,
          discount,
          parameter1: `Rating: ${rating}/5`,
          parameter2: `Reviews: ${reviewCount}`,
          parameter3: `Platform: Amazon`,
          parameter4: `Country: ${countryConfig.country || 'US'}`,
          parameter5: `Currency: ${countryConfig.currency}`
        });
      }
    });
  }

  private parseWalmartResults($: cheerio.CheerioAPI, website: string, countryConfig: any, results: PriceResult[]): void {
    $('[data-item-id]').each((index: number, element: any) => {
      if (index >= 10) return;

      const $el = $(element);
      const title = $el.find('[data-testid="product-title"]').text().trim();
      const link = 'https://' + website + $el.find('a').attr('href');
      const priceText = $el.find('[data-testid="price-wrap"] .price-main').text().trim();
      const imageUrl = $el.find('img').attr('src');
      const originalPrice = $el.find('.price-old').text().trim();
      const discount = $el.find('.price-save').text().trim();

      if (title && priceText) {
        results.push({
          link,
          price: priceText,
          currency: countryConfig.currency,
          productName: title,
          website,
          country: countryConfig.country || 'US',
          availability: true,
          imageUrl,
          originalPrice,
          discount,
          parameter1: `Platform: Walmart`,
          parameter2: `Country: ${countryConfig.country || 'US'}`,
          parameter3: `Currency: ${countryConfig.currency}`,
          parameter4: `Availability: In Stock`,
          parameter5: `Website: ${website}`
        });
      }
    });
  }

  private parseFlipkartResults($: cheerio.CheerioAPI, website: string, countryConfig: any, results: PriceResult[]): void {
    $('[data-tkid]').each((index: number, element: any) => {
      if (index >= 10) return;

      const $el = $(element);
      const title = $el.find('._4rR01T').text().trim();
      const link = 'https://' + website + $el.find('a').attr('href');
      const priceText = $el.find('._30jeq3').text().trim();
      const rating = parseFloat($el.find('._3LWZlK').text() || '0');
      const imageUrl = $el.find('img').attr('src');
      const originalPrice = $el.find('._3I9_wc').text().trim();
      const discount = $el.find('._3Ay6Sb').text().trim();

      if (title && priceText) {
        results.push({
          link,
          price: priceText,
          currency: countryConfig.currency,
          productName: title,
          website,
          country: countryConfig.country || 'IN',
          availability: true,
          rating,
          imageUrl,
          originalPrice,
          discount,
          parameter1: `Rating: ${rating}/5`,
          parameter2: `Platform: Flipkart`,
          parameter3: `Country: ${countryConfig.country || 'IN'}`,
          parameter4: `Currency: ${countryConfig.currency}`,
          parameter5: `Website: ${website}`
        });
      }
    });
  }

  private parseEbayResults($: cheerio.CheerioAPI, website: string, countryConfig: any, results: PriceResult[]): void {
    $('.s-item').each((index: number, element: any) => {
      if (index >= 10) return;

      const $el = $(element);
      const title = $el.find('.s-item__title').text().trim();
      const link = $el.find('.s-item__link').attr('href');
      const priceText = $el.find('.s-item__price').text().trim();
      const rating = parseFloat($el.find('.x-star-rating__text').text().match(/(\d+\.?\d*)/)?.[1] || '0');
      const imageUrl = $el.find('.s-item__image-img').attr('src');
      const shipping = $el.find('.s-item__shipping').text().trim();

      // Skip generic/non-product results
      if (title && priceText && link && 
          !title.toLowerCase().includes('shop on ebay') && 
          !title.toLowerCase().includes('see all') &&
          priceText !== '$20.00' && 
          priceText !== '$0.00') {
        
        // Clean the link (remove tracking parameters)
        const cleanLink = this.cleanEbayUrl(link);
        
        results.push({
          link: cleanLink,
          price: priceText,
          currency: countryConfig.currency,
          productName: title,
          website,
          country: countryConfig.country || 'US',
          availability: true,
          rating,
          imageUrl,
          shipping,
          parameter1: `Rating: ${rating}/5`,
          parameter2: `Platform: eBay`,
          parameter3: `Country: ${countryConfig.country || 'US'}`,
          parameter4: `Currency: ${countryConfig.currency}`,
          parameter5: `Shipping: ${shipping || 'Free'}`
        });
      }
    });
  }

  private cleanEbayUrl(url: string): string {
    try {
      // Remove tracking parameters from eBay URLs
      const urlObj = new URL(url);
      const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      return cleanUrl;
    } catch {
      return url;
    }
  }

  private parseGenericResults($: cheerio.CheerioAPI, website: string, countryConfig: any, results: PriceResult[]): void {
    // Generic parsing for unknown websites
    $('a[href*="/product"], a[href*="/item"], .product, .item').each((index: number, element: any) => {
      if (index >= 5) return;

      const $el = $(element);
      const title = $el.find('h1, h2, h3, .title, .name').first().text().trim();
      const link = $el.attr('href') || $el.find('a').attr('href');
      const priceText = $el.find('.price, .cost, [class*="price"]').first().text().trim();
      const imageUrl = $el.find('img').attr('src');
      const rating = parseFloat($el.find('.rating, .stars').text().match(/(\d+\.?\d*)/)?.[1] || '0');

      if (title && priceText && link) {
        const fullLink = link.startsWith('http') ? link : `https://${website}${link}`;
        results.push({
          link: fullLink,
          price: priceText,
          currency: countryConfig.currency,
          productName: title,
          website,
          country: countryConfig.country || 'US',
          availability: true,
          imageUrl,
          rating,
          parameter1: `Rating: ${rating}/5`,
          parameter2: `Platform: ${website}`,
          parameter3: `Country: ${countryConfig.country || 'US'}`,
          parameter4: `Currency: ${countryConfig.currency}`,
          parameter5: `Website: ${website}`
        });
      }
    });
  }

  private sortResults(results: PriceResult[], sortBy: string): PriceResult[] {
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = parseFloat(a.price.replace(/[^\d.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^\d.]/g, ''));
          return priceA - priceB;

        case 'rating':
          return (b.rating || 0) - (a.rating || 0);

        case 'relevance':
        default:
          return 0; // Keep original order
      }
    });
  }

  async getProductDetails(url: string, requestedCountry?: string): Promise<PriceResult | null> {
    try {
      const response = await this.makeRequest(url);
      if (!response) return null;

      const $ = cheerio.load(response);
      const website = new URL(url).hostname;

      // Extract product details based on website
      const title = $('h1, .product-title, .title, [data-testid="product-title"]').first().text().trim();
      const priceText = $('.price, .cost, [class*="price"], [data-testid="price"], .current-price').first().text().trim();
      const rating = parseFloat($('.rating, .stars, [data-testid="rating"]').text().match(/(\d+\.?\d*)/)?.[1] || '0');
      const imageUrl = $('.product-image img, .main-image img, [data-testid="product-image"] img').attr('src');

      // Skip if no meaningful title or price
      if (!title || !priceText || 
          title.toLowerCase().includes('shop') || 
          priceText.toLowerCase().includes('save up to') ||
          priceText.toLowerCase().includes('trade-in')) {
        return null;
      }

      // Use requested country if provided, otherwise detect from URL
      const country = requestedCountry || this.detectCountryFromUrl(url);
      const currency = this.getCurrencyForCountry(country);

      return {
        link: url,
        price: priceText,
        currency,
        productName: title,
        website,
        country,
        availability: true,
        rating,
        imageUrl,
        parameter1: `Rating: ${rating}/5`,
        parameter2: `Platform: ${website}`,
        parameter3: `Country: ${country}`,
        parameter4: `Currency: ${currency}`,
        parameter5: `Website: ${website}`
      };
    } catch (error: any) {
      logger.error(`Error getting product details: ${error?.message}`);
      return null;
    }
  }

  private detectCurrencyFromUrl(url: string): string {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.in/') || urlLower.includes('.co.in')) return 'INR';
    if (urlLower.includes('.uk/') || urlLower.includes('.co.uk')) return 'GBP';
    if (urlLower.includes('.ca/')) return 'CAD';
    if (urlLower.includes('.de/')) return 'EUR';
    if (urlLower.includes('.fr/')) return 'EUR';
    if (urlLower.includes('.au/') || urlLower.includes('.com.au')) return 'AUD';
    return 'USD'; // Default
  }

  private detectCountryFromUrl(url: string): string {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.in/') || urlLower.includes('.co.in')) return 'IN';
    if (urlLower.includes('.uk/') || urlLower.includes('.co.uk')) return 'UK';
    if (urlLower.includes('.ca/')) return 'CA';
    if (urlLower.includes('.de/')) return 'DE';
    if (urlLower.includes('.fr/')) return 'FR';
    if (urlLower.includes('.au/') || urlLower.includes('.com.au')) return 'AU';
    return 'US'; // Default
  }

  private getCurrencyForCountry(country: string): string {
    const countryConfig = countryConfigs[country.toUpperCase()];
    return countryConfig?.currency || 'USD';
  }

  private extractBasicInfoFromUrl(url: string, country: string): PriceResult | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname.toLowerCase();
      
      // Extract product name from URL path
      let productName = '';
      if (pathname.includes('samsung') && pathname.includes('galaxy-s24')) {
        productName = 'Samsung Galaxy S24';
      } else if (pathname.includes('samsung') && pathname.includes('s24')) {
        productName = 'Samsung S24';
      } else if (pathname.includes('iphone')) {
        productName = 'iPhone';
      } else {
        // Try to extract from path segments
        const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
        const relevantSegments = pathSegments.filter(segment => 
          segment.includes('samsung') || segment.includes('galaxy') || segment.includes('s24') ||
          segment.includes('iphone') || segment.includes('apple')
        );
        if (relevantSegments.length > 0) {
          productName = relevantSegments.join(' ').replace(/-/g, ' ').replace(/_/g, ' ');
        }
      }
      
      if (!productName) {
        return null;
      }
      
      // Determine website and country
      const website = hostname;
      const currency = this.getCurrencyForCountry(country);
      
      return {
        link: url,
        price: 'Price not available',
        currency,
        productName,
        website,
        country,
        availability: true,
        parameter1: `Platform: ${website}`,
        parameter2: `Country: ${country}`,
        parameter3: `Currency: ${currency}`,
        parameter4: `Source: URL Analysis`,
        parameter5: `Note: Price not available due to site access issues`
      };
    } catch {
      return null;
    }
  }
} 