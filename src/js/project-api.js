export const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json?';
const API_KEY = 'fFtxoD9paMi2sCcrxenoZ7HX0RFMBLl4';

export const options = {
  params: {
    apikey: API_KEY,
    countryCode: '',
    // classificationName: '',
    keyword: '',
    page: 0,
    size: 20,
  },
};