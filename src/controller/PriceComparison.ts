import logger from '../loaders/Logger';
import { Request, Response } from 'express';
logger.silly("controller loading");
import { PriceComparator, SearchConfig } from '../core/PriceComparator';
logger.silly("controller loading");
import { ApiError } from '../core/APIerror';
logger.silly("controller loading");
import { SuccessResponse, BadRequestResponse, InternalErrorResponse, NotFoundResponse } from '../core/APIresponse';
logger.silly("controller loaded");

export class PriceComparisonController {
  private priceComparator: PriceComparator;

  constructor() {
    this.priceComparator = PriceComparator.getInstance();
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      new SuccessResponse('Health check successful', {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Price Comparison API',
        version: '1.0.0'
      }).send(res);
    } catch (error) {
      new InternalErrorResponse('Health check failed').send(res);
    }
  }

  async searchProduct(req: Request, res: Response): Promise<void> {
    try {
      logger.info("searchProduct"+ JSON.stringify(req.body));
      const { query, country = 'US', maxResults = 20 } = req.body;

      if (!query) {
        new BadRequestResponse('Product name is required').send(res);
        return;
      }

      const config: SearchConfig = {
        country: country.toUpperCase(),
        sortBy: 'price', // Always sort by price in ascending order
        maxResults
      };

      const results = await this.priceComparator.searchProduct(query, config);
      
      // Limit results if specified and return directly
      const limitedResults = maxResults ? results.slice(0, maxResults) : results;

      // Return just the results array directly
      res.json(limitedResults);
    } catch (error) {
      if (error instanceof ApiError) {
        new BadRequestResponse(error.message).send(res);
      } else {
        new InternalErrorResponse('Internal server error during product search').send(res);
      }
    }
  }

  async getProductDetails(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        new BadRequestResponse('Product URL is required').send(res);
        return;
      }

      const productDetails = await this.priceComparator.getProductDetails(url);
      
      if (!productDetails) {
        new NotFoundResponse('Product details not found').send(res);
        return;
      }

      new SuccessResponse('Product details retrieved successfully', productDetails).send(res);
    } catch (error) {
      new InternalErrorResponse('Internal server error while fetching product details').send(res);
    }
  }

  async getSupportedCountries(req: Request, res: Response): Promise<void> {
    try {
      const countries = [
        { code: 'US', name: 'United States', currency: 'USD' },
        { code: 'IN', name: 'India', currency: 'INR' },
        { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
        { code: 'CA', name: 'Canada', currency: 'CAD' },
        { code: 'DE', name: 'Germany', currency: 'EUR' },
        { code: 'FR', name: 'France', currency: 'EUR' },
        { code: 'AU', name: 'Australia', currency: 'AUD' },
        { code: 'JP', name: 'Japan', currency: 'JPY' },
        { code: 'KR', name: 'South Korea', currency: 'KRW' },
        { code: 'CN', name: 'China', currency: 'CNY' },
        { code: 'BR', name: 'Brazil', currency: 'BRL' },
        { code: 'MX', name: 'Mexico', currency: 'MXN' },
        { code: 'ES', name: 'Spain', currency: 'EUR' },
        { code: 'IT', name: 'Italy', currency: 'EUR' },
        { code: 'NL', name: 'Netherlands', currency: 'EUR' },
        { code: 'SE', name: 'Sweden', currency: 'SEK' },
        { code: 'NO', name: 'Norway', currency: 'NOK' },
        { code: 'DK', name: 'Denmark', currency: 'DKK' },
        { code: 'FI', name: 'Finland', currency: 'EUR' },
        { code: 'PL', name: 'Poland', currency: 'PLN' },
        { code: 'CZ', name: 'Czech Republic', currency: 'CZK' },
        { code: 'HU', name: 'Hungary', currency: 'HUF' },
        { code: 'RO', name: 'Romania', currency: 'RON' },
        { code: 'BG', name: 'Bulgaria', currency: 'BGN' },
        { code: 'HR', name: 'Croatia', currency: 'EUR' },
        { code: 'SI', name: 'Slovenia', currency: 'EUR' },
        { code: 'SK', name: 'Slovakia', currency: 'EUR' },
        { code: 'EE', name: 'Estonia', currency: 'EUR' },
        { code: 'LV', name: 'Latvia', currency: 'EUR' },
        { code: 'LT', name: 'Lithuania', currency: 'EUR' },
        { code: 'IE', name: 'Ireland', currency: 'EUR' },
        { code: 'PT', name: 'Portugal', currency: 'EUR' },
        { code: 'GR', name: 'Greece', currency: 'EUR' },
        { code: 'AT', name: 'Austria', currency: 'EUR' },
        { code: 'BE', name: 'Belgium', currency: 'EUR' },
        { code: 'CH', name: 'Switzerland', currency: 'CHF' },
        { code: 'LU', name: 'Luxembourg', currency: 'EUR' },
        { code: 'MT', name: 'Malta', currency: 'EUR' },
        { code: 'CY', name: 'Cyprus', currency: 'EUR' },
        { code: 'RU', name: 'Russia', currency: 'RUB' },
        { code: 'UA', name: 'Ukraine', currency: 'UAH' },
        { code: 'BY', name: 'Belarus', currency: 'BYN' },
        { code: 'MD', name: 'Moldova', currency: 'MDL' },
        { code: 'GE', name: 'Georgia', currency: 'GEL' },
        { code: 'AM', name: 'Armenia', currency: 'AMD' },
        { code: 'AZ', name: 'Azerbaijan', currency: 'AZN' },
        { code: 'KZ', name: 'Kazakhstan', currency: 'KZT' },
        { code: 'UZ', name: 'Uzbekistan', currency: 'UZS' },
        { code: 'KG', name: 'Kyrgyzstan', currency: 'KGS' },
        { code: 'TJ', name: 'Tajikistan', currency: 'TJS' },
        { code: 'TM', name: 'Turkmenistan', currency: 'TMT' },
        { code: 'AF', name: 'Afghanistan', currency: 'AFN' },
        { code: 'PK', name: 'Pakistan', currency: 'PKR' },
        { code: 'BD', name: 'Bangladesh', currency: 'BDT' },
        { code: 'LK', name: 'Sri Lanka', currency: 'LKR' },
        { code: 'NP', name: 'Nepal', currency: 'NPR' },
        { code: 'BT', name: 'Bhutan', currency: 'BTN' },
        { code: 'MV', name: 'Maldives', currency: 'MVR' },
        { code: 'MM', name: 'Myanmar', currency: 'MMK' },
        { code: 'TH', name: 'Thailand', currency: 'THB' },
        { code: 'VN', name: 'Vietnam', currency: 'VND' },
        { code: 'LA', name: 'Laos', currency: 'LAK' },
        { code: 'KH', name: 'Cambodia', currency: 'KHR' },
        { code: 'MY', name: 'Malaysia', currency: 'MYR' },
        { code: 'SG', name: 'Singapore', currency: 'SGD' },
        { code: 'ID', name: 'Indonesia', currency: 'IDR' },
        { code: 'PH', name: 'Philippines', currency: 'PHP' },
        { code: 'TW', name: 'Taiwan', currency: 'TWD' },
        { code: 'HK', name: 'Hong Kong', currency: 'HKD' },
        { code: 'MO', name: 'Macau', currency: 'MOP' },
        { code: 'TR', name: 'Turkey', currency: 'TRY' },
        { code: 'IL', name: 'Israel', currency: 'ILS' },
        { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
        { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
        { code: 'QA', name: 'Qatar', currency: 'QAR' },
        { code: 'KW', name: 'Kuwait', currency: 'KWD' },
        { code: 'BH', name: 'Bahrain', currency: 'BHD' },
        { code: 'OM', name: 'Oman', currency: 'OMR' },
        { code: 'JO', name: 'Jordan', currency: 'JOD' },
        { code: 'LB', name: 'Lebanon', currency: 'LBP' },
        { code: 'SY', name: 'Syria', currency: 'SYP' },
        { code: 'IQ', name: 'Iraq', currency: 'IQD' },
        { code: 'IR', name: 'Iran', currency: 'IRR' },
        { code: 'EG', name: 'Egypt', currency: 'EGP' },
        { code: 'LY', name: 'Libya', currency: 'LYD' },
        { code: 'TN', name: 'Tunisia', currency: 'TND' },
        { code: 'DZ', name: 'Algeria', currency: 'DZD' },
        { code: 'MA', name: 'Morocco', currency: 'MAD' },
        { code: 'SD', name: 'Sudan', currency: 'SDG' },
        { code: 'SS', name: 'South Sudan', currency: 'SSP' },
        { code: 'ET', name: 'Ethiopia', currency: 'ETB' },
        { code: 'ER', name: 'Eritrea', currency: 'ERN' },
        { code: 'DJ', name: 'Djibouti', currency: 'DJF' },
        { code: 'SO', name: 'Somalia', currency: 'SOS' },
        { code: 'KE', name: 'Kenya', currency: 'KES' },
        { code: 'TZ', name: 'Tanzania', currency: 'TZS' },
        { code: 'UG', name: 'Uganda', currency: 'UGX' },
        { code: 'RW', name: 'Rwanda', currency: 'RWF' },
        { code: 'BI', name: 'Burundi', currency: 'BIF' },
        { code: 'MZ', name: 'Mozambique', currency: 'MZN' },
        { code: 'ZW', name: 'Zimbabwe', currency: 'ZWL' },
        { code: 'ZM', name: 'Zambia', currency: 'ZMW' },
        { code: 'MW', name: 'Malawi', currency: 'MWK' },
        { code: 'NA', name: 'Namibia', currency: 'NAD' },
        { code: 'BW', name: 'Botswana', currency: 'BWP' },
        { code: 'LS', name: 'Lesotho', currency: 'LSL' },
        { code: 'SZ', name: 'Eswatini', currency: 'SZL' },
        { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
        { code: 'MG', name: 'Madagascar', currency: 'MGA' },
        { code: 'MU', name: 'Mauritius', currency: 'MUR' },
        { code: 'SC', name: 'Seychelles', currency: 'SCR' },
        { code: 'KM', name: 'Comoros', currency: 'KMF' },
        { code: 'YT', name: 'Mayotte', currency: 'EUR' },
        { code: 'RE', name: 'Réunion', currency: 'EUR' },
        { code: 'AR', name: 'Argentina', currency: 'ARS' },
        { code: 'CL', name: 'Chile', currency: 'CLP' },
        { code: 'PE', name: 'Peru', currency: 'PEN' },
        { code: 'CO', name: 'Colombia', currency: 'COP' },
        { code: 'VE', name: 'Venezuela', currency: 'VES' },
        { code: 'EC', name: 'Ecuador', currency: 'USD' },
        { code: 'BO', name: 'Bolivia', currency: 'BOB' },
        { code: 'PY', name: 'Paraguay', currency: 'PYG' },
        { code: 'UY', name: 'Uruguay', currency: 'UYU' },
        { code: 'GY', name: 'Guyana', currency: 'GYD' },
        { code: 'SR', name: 'Suriname', currency: 'SRD' },
        { code: 'GF', name: 'French Guiana', currency: 'EUR' },
        { code: 'FK', name: 'Falkland Islands', currency: 'FKP' },
        { code: 'GS', name: 'South Georgia', currency: 'GBP' },
        { code: 'AQ', name: 'Antarctica', currency: 'USD' },
        { code: 'NZ', name: 'New Zealand', currency: 'NZD' },
        { code: 'FJ', name: 'Fiji', currency: 'FJD' },
        { code: 'PG', name: 'Papua New Guinea', currency: 'PGK' },
        { code: 'SB', name: 'Solomon Islands', currency: 'SBD' },
        { code: 'VU', name: 'Vanuatu', currency: 'VUV' },
        { code: 'NC', name: 'New Caledonia', currency: 'XPF' },
        { code: 'PF', name: 'French Polynesia', currency: 'XPF' },
        { code: 'TO', name: 'Tonga', currency: 'TOP' },
        { code: 'WS', name: 'Samoa', currency: 'WST' },
        { code: 'KI', name: 'Kiribati', currency: 'AUD' },
        { code: 'TV', name: 'Tuvalu', currency: 'AUD' },
        { code: 'NR', name: 'Nauru', currency: 'AUD' },
        { code: 'PW', name: 'Palau', currency: 'USD' },
        { code: 'MH', name: 'Marshall Islands', currency: 'USD' },
        { code: 'FM', name: 'Micronesia', currency: 'USD' },
        { code: 'CK', name: 'Cook Islands', currency: 'NZD' },
        { code: 'NU', name: 'Niue', currency: 'NZD' },
        { code: 'TK', name: 'Tokelau', currency: 'NZD' },
        { code: 'AS', name: 'American Samoa', currency: 'USD' },
        { code: 'GU', name: 'Guam', currency: 'USD' },
        { code: 'MP', name: 'Northern Mariana Islands', currency: 'USD' },
        { code: 'PR', name: 'Puerto Rico', currency: 'USD' },
        { code: 'VI', name: 'U.S. Virgin Islands', currency: 'USD' },
        { code: 'AI', name: 'Anguilla', currency: 'XCD' },
        { code: 'AG', name: 'Antigua and Barbuda', currency: 'XCD' },
        { code: 'DM', name: 'Dominica', currency: 'XCD' },
        { code: 'GD', name: 'Grenada', currency: 'XCD' },
        { code: 'LC', name: 'Saint Lucia', currency: 'XCD' },
        { code: 'VC', name: 'Saint Vincent and the Grenadines', currency: 'XCD' },
        { code: 'KN', name: 'Saint Kitts and Nevis', currency: 'XCD' },
        { code: 'BB', name: 'Barbados', currency: 'BBD' },
        { code: 'TT', name: 'Trinidad and Tobago', currency: 'TTD' },
        { code: 'JM', name: 'Jamaica', currency: 'JMD' },
        { code: 'HT', name: 'Haiti', currency: 'HTG' },
        { code: 'DO', name: 'Dominican Republic', currency: 'DOP' },
        { code: 'CU', name: 'Cuba', currency: 'CUP' },
        { code: 'BS', name: 'Bahamas', currency: 'BSD' },
        { code: 'TC', name: 'Turks and Caicos Islands', currency: 'USD' },
        { code: 'KY', name: 'Cayman Islands', currency: 'KYD' },
        { code: 'BM', name: 'Bermuda', currency: 'BMD' },
        { code: 'AW', name: 'Aruba', currency: 'AWG' },
        { code: 'CW', name: 'Curaçao', currency: 'ANG' },
        { code: 'SX', name: 'Sint Maarten', currency: 'ANG' },
        { code: 'BQ', name: 'Caribbean Netherlands', currency: 'USD' },
        { code: 'GP', name: 'Guadeloupe', currency: 'EUR' },
        { code: 'MQ', name: 'Martinique', currency: 'EUR' },
        { code: 'BL', name: 'Saint Barthélemy', currency: 'EUR' },
        { code: 'MF', name: 'Saint Martin', currency: 'EUR' },
        { code: 'PM', name: 'Saint Pierre and Miquelon', currency: 'EUR' },
        { code: 'WF', name: 'Wallis and Futuna', currency: 'XPF' },
        { code: 'AD', name: 'Andorra', currency: 'EUR' },
        { code: 'MC', name: 'Monaco', currency: 'EUR' },
        { code: 'SM', name: 'San Marino', currency: 'EUR' },
        { code: 'VA', name: 'Vatican City', currency: 'EUR' },
        { code: 'LI', name: 'Liechtenstein', currency: 'CHF' },
        { code: 'IS', name: 'Iceland', currency: 'ISK' },
        { code: 'FO', name: 'Faroe Islands', currency: 'DKK' },
        { code: 'GL', name: 'Greenland', currency: 'DKK' },
        { code: 'SJ', name: 'Svalbard and Jan Mayen', currency: 'NOK' },
        { code: 'AX', name: 'Åland Islands', currency: 'EUR' },
        { code: 'GI', name: 'Gibraltar', currency: 'GIP' },
        { code: 'JE', name: 'Jersey', currency: 'GBP' },
        { code: 'GG', name: 'Guernsey', currency: 'GBP' },
        { code: 'IM', name: 'Isle of Man', currency: 'GBP' },
        { code: 'IO', name: 'British Indian Ocean Territory', currency: 'USD' },
        { code: 'SH', name: 'Saint Helena', currency: 'SHP' },
        { code: 'AC', name: 'Ascension Island', currency: 'SHP' },
        { code: 'TA', name: 'Tristan da Cunha', currency: 'GBP' },
        { code: 'BV', name: 'Bouvet Island', currency: 'NOK' },
        { code: 'HM', name: 'Heard and McDonald Islands', currency: 'AUD' },
        { code: 'TF', name: 'French Southern Territories', currency: 'EUR' },
        { code: 'CC', name: 'Cocos Islands', currency: 'AUD' },
        { code: 'CX', name: 'Christmas Island', currency: 'AUD' },
        { code: 'NF', name: 'Norfolk Island', currency: 'AUD' },
        { code: 'PN', name: 'Pitcairn Islands', currency: 'NZD' },
        { code: 'UM', name: 'United States Minor Outlying Islands', currency: 'USD' },
        { code: 'PS', name: 'Palestine', currency: 'ILS' },
        { code: 'EH', name: 'Western Sahara', currency: 'MAD' },
        { code: 'XK', name: 'Kosovo', currency: 'EUR' }
      ];

      new SuccessResponse('Supported countries retrieved successfully', countries).send(res);
    } catch (error) {
      new InternalErrorResponse('Internal server error while fetching supported countries').send(res);
    }
  }
} 