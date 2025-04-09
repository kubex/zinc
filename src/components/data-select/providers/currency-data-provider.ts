import type {DataProviderOption, LocalDataProvider} from "./provider";

const currencyCodeToName: { [key: string]: string } = {
  'ALL': 'Albania Lek',
  'AFN': 'Afghanistan Afghani',
  'ARS': 'Argentina Peso',
  'AWG': 'Aruba Guilder',
  'AUD': 'Australia Dollar',
  'AZN': 'Azerbaijan New Manat',
  'BSD': 'Bahamas Dollar',
  'BBD': 'Barbados Dollar',
  'BDT': 'Bangladeshi taka',
  'BYR': 'Belarus Ruble',
  'BZD': 'Belize Dollar',
  'BMD': 'Bermuda Dollar',
  'BOB': 'Bolivia Boliviano',
  'BAM': 'Bosnia and Herzegovina Convertible Marka',
  'BWP': 'Botswana Pula',
  'BGN': 'Bulgaria Lev',
  'BRL': 'Brazil Real',
  'BND': 'Brunei Darussalam Dollar',
  'KHR': 'Cambodia Riel',
  'CAD': 'Canada Dollar',
  'KYD': 'Cayman Islands Dollar',
  'CLP': 'Chile Peso',
  'CNY': 'China Yuan Renminbi',
  'COP': 'Colombia Peso',
  'CRC': 'Costa Rica Colon',
  'HRK': 'Croatia Kuna',
  'CUP': 'Cuba Peso',
  'CZK': 'Czech Republic Koruna',
  'DKK': 'Denmark Krone',
  'DOP': 'Dominican Republic Peso',
  'XCD': 'East Caribbean Dollar',
  'EGP': 'Egypt Pound',
  'SVC': 'El Salvador Colon',
  'EEK': 'Estonia Kroon',
  'EUR': 'Euro Member Countries',
  'FKP': 'Falkland Islands (Malvinas) Pound',
  'FJD': 'Fiji Dollar',
  'GHC': 'Ghana Cedis',
  'GIP': 'Gibraltar Pound',
  'GTQ': 'Guatemala Quetzal',
  'GGP': 'Guernsey Pound',
  'GYD': 'Guyana Dollar',
  'HNL': 'Honduras Lempira',
  'HKD': 'Hong Kong Dollar',
  'HUF': 'Hungary Forint',
  'ISK': 'Iceland Krona',
  'INR': 'India Rupee',
  'IDR': 'Indonesia Rupiah',
  'IRR': 'Iran Rial',
  'IMP': 'Isle of Man Pound',
  'ILS': 'Israel Shekel',
  'JMD': 'Jamaica Dollar',
  'JPY': 'Japan Yen',
  'JEP': 'Jersey Pound',
  'KZT': 'Kazakhstan Tenge',
  'KPW': 'Korea (North) Won',
  'KRW': 'Korea (South) Won',
  'KGS': 'Kyrgyzstan Som',
  'LAK': 'Laos Kip',
  'LVL': 'Latvia Lat',
  'LBP': 'Lebanon Pound',
  'LRD': 'Liberia Dollar',
  'LTL': 'Lithuania Litas',
  'MKD': 'Macedonia Denar',
  'MYR': 'Malaysia Ringgit',
  'MUR': 'Mauritius Rupee',
  'MXN': 'Mexico Peso',
  'MNT': 'Mongolia Tughrik',
  'MZN': 'Mozambique Metical',
  'NAD': 'Namibia Dollar',
  'NPR': 'Nepal Rupee',
  'ANG': 'Netherlands Antilles Guilder',
  'NZD': 'New Zealand Dollar',
  'NIO': 'Nicaragua Cordoba',
  'NGN': 'Nigeria Naira',
  'NOK': 'Norway Krone',
  'OMR': 'Oman Rial',
  'PKR': 'Pakistan Rupee',
  'PAB': 'Panama Balboa',
  'PYG': 'Paraguay Guarani',
  'PEN': 'Peru Nuevo Sol',
  'PHP': 'Philippines Peso',
  'PLN': 'Poland Zloty',
  'QAR': 'Qatar Riyal',
  'RON': 'Romania New Leu',
  'RUB': 'Russia Ruble',
  'SHP': 'Saint Helena Pound',
  'SAR': 'Saudi Arabia Riyal',
  'RSD': 'Serbia Dinar',
  'SCR': 'Seychelles Rupee',
  'SGD': 'Singapore Dollar',
  'SBD': 'Solomon Islands Dollar',
  'SOS': 'Somalia Shilling',
  'ZAR': 'South Africa Rand',
  'LKR': 'Sri Lanka Rupee',
  'SEK': 'Sweden Krona',
  'CHF': 'Switzerland Franc',
  'SRD': 'Suriname Dollar',
  'SYP': 'Syria Pound',
  'TWD': 'Taiwan New Dollar',
  'THB': 'Thailand Baht',
  'TTD': 'Trinidad and Tobago Dollar',
  'TRY': 'Turkey Lira',
  'TRL': 'Turkey Lira',
  'TVD': 'Tuvalu Dollar',
  'UAH': 'Ukraine Hryvna',
  'GBP': 'Great British Pound',
  'USD': 'United States Dollar',
  'UYU': 'Uruguay Peso',
  'UZS': 'Uzbekistan Som',
  'VEF': 'Venezuela Bolivar',
  'VND': 'Viet Nam Dong',
  'YER': 'Yemen Rial',
  'ZWD': 'Zimbabwe Dollar'
}

const currencyCodeToSymbol: { [key: string]: string } = {
  'AED': 'د.إ',
  'AFN': '؋',
  'ALL': 'L',
  'AMD': '֏',
  'ANG': 'ƒ',
  'AOA': 'Kz',
  'ARS': '$',
  'AUD': '$',
  'AWG': 'ƒ',
  'AZN': '₼',
  'BAM': 'KM',
  'BBD': '$',
  'BDT': '৳',
  'BGN': 'лв',
  'BHD': '.د.ب',
  'BIF': 'FBu',
  'BMD': '$',
  'BND': '$',
  'BOB': '$b',
  'BOV': 'BOV',
  'BRL': 'R$',
  'BSD': '$',
  'BTC': '₿',
  'BTN': 'Nu.',
  'BWP': 'P',
  'BYN': 'Br',
  'BYR': 'Br',
  'BZD': 'BZ$',
  'CAD': '$',
  'CDF': 'FC',
  'CHE': 'CHE',
  'CHF': 'CHF',
  'CHW': 'CHW',
  'CLF': 'CLF',
  'CLP': '$',
  'CNH': '¥',
  'CNY': '¥',
  'COP': '$',
  'COU': 'COU',
  'CRC': '₡',
  'CUC': '$',
  'CUP': '₱',
  'CVE': '$',
  'CZK': 'Kč',
  'DJF': 'Fdj',
  'DKK': 'kr',
  'DOP': 'RD$',
  'DZD': 'دج',
  'EEK': 'kr',
  'EGP': '£',
  'ERN': 'Nfk',
  'ETB': 'Br',
  'ETH': 'Ξ',
  'EUR': '€',
  'FJD': '$',
  'FKP': '£',
  'GBP': '£',
  'GEL': '₾',
  'GGP': '£',
  'GHC': '₵',
  'GHS': 'GH₵',
  'GIP': '£',
  'GMD': 'D',
  'GNF': 'FG',
  'GTQ': 'Q',
  'GYD': '$',
  'HKD': '$',
  'HNL': 'L',
  'HRK': 'kn',
  'HTG': 'G',
  'HUF': 'Ft',
  'IDR': 'Rp',
  'ILS': '₪',
  'IMP': '£',
  'INR': '₹',
  'IQD': 'ع.د',
  'IRR': '﷼',
  'ISK': 'kr',
  'JEP': '£',
  'JMD': 'J$',
  'JOD': 'JD',
  'JPY': '¥',
  'KES': 'KSh',
  'KGS': 'лв',
  'KHR': '៛',
  'KMF': 'CF',
  'KPW': '₩',
  'KRW': '₩',
  'KWD': 'KD',
  'KYD': '$',
  'KZT': '₸',
  'LAK': '₭',
  'LBP': '£',
  'LKR': '₨',
  'LRD': '$',
  'LSL': 'M',
  'LTC': 'Ł',
  'LTL': 'Lt',
  'LVL': 'Ls',
  'LYD': 'LD',
  'MAD': 'MAD',
  'MDL': 'lei',
  'MGA': 'Ar',
  'MKD': 'ден',
  'MMK': 'K',
  'MNT': '₮',
  'MOP': 'MOP$',
  'MRO': 'UM',
  'MRU': 'UM',
  'MUR': '₨',
  'MVR': 'Rf',
  'MWK': 'MK',
  'MXN': '$',
  'MXV': 'MXV',
  'MYR': 'RM',
  'MZN': 'MT',
  'NAD': '$',
  'NGN': '₦',
  'NIO': 'C$',
  'NOK': 'kr',
  'NPR': '₨',
  'NZD': '$',
  'OMR': '﷼',
  'PAB': 'B/.',
  'PEN': 'S/.',
  'PGK': 'K',
  'PHP': '₱',
  'PKR': '₨',
  'PLN': 'zł',
  'PYG': 'Gs',
  'QAR': '﷼',
  'RMB': '￥',
  'RON': 'lei',
  'RSD': 'Дин.',
  'RUB': '₽',
  'RWF': 'R₣',
  'SAR': '﷼',
  'SBD': '$',
  'SCR': '₨',
  'SDG': 'ج.س.',
  'SEK': 'kr',
  'SGD': 'S$',
  'SHP': '£',
  'SLL': 'Le',
  'SOS': 'S',
  'SRD': '$',
  'SSP': '£',
  'STD': 'Db',
  'STN': 'Db',
  'SVC': '$',
  'SYP': '£',
  'SZL': 'E',
  'THB': '฿',
  'TJS': 'SM',
  'TMT': 'T',
  'TND': 'د.ت',
  'TOP': 'T$',
  'TRL': '₤',
  'TRY': '₺',
  'TTD': 'TT$',
  'TVD': '$',
  'TWD': 'NT$',
  'TZS': 'TSh',
  'UAH': '₴',
  'UGX': 'USh',
  'USD': '$',
  'UYI': 'UYI',
  'UYU': '$U',
  'UYW': 'UYW',
  'UZS': 'лв',
  'VEF': 'Bs',
  'VES': 'Bs.S',
  'VND': '₫',
  'VUV': 'VT',
  'WST': 'WS$',
  'XAF': 'FCFA',
  'XBT': 'Ƀ',
  'XCD': '$',
  'XOF': 'CFA',
  'XPF': '₣',
  'XSU': 'Sucre',
  'XUA': 'XUA',
  'YER': '﷼',
  'ZAR': 'R',
  'ZMW': 'ZK',
  'ZWD': 'Z$',
  'ZWL': '$'
}

const commonCurrencyCodes = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD'
];

const sortedCurrencyCodes = [...Object.keys(currencyCodeToName)].sort((a, b) => a.localeCompare(b));
const allCurrencyCodes = [...commonCurrencyCodes, ...sortedCurrencyCodes];
const uniqueCurrencyCodes = Array.from(new Set(allCurrencyCodes));

export const currencyDataProvider: LocalDataProvider<DataProviderOption> = {
  getName: 'currency',
  getData: uniqueCurrencyCodes.map((code => {
    return {
      key: code,
      value: code.concat(' - ').concat(currencyCodeToName[code]),
      prefix: currencyCodeToSymbol[code] ? currencyCodeToSymbol[code] : ''
    }
  }))
};

