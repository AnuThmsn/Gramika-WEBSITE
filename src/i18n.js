import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "Your Cart": "Your Cart",
      "Delivery in 20 minutes": "Delivery in 20 minutes",
      "Shipment of {{count}} items": "Shipment of {{count}} items",
      "Items total": "Items total",
      "Delivery charge": "Delivery charge",
      "Handling charg": "Handling charge",
      "Grand total": "Grand total",
      "Cancellation Policy": "Cancellation Policy",
      "Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.": "Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.",
      "Proceed to Checkout →": "Proceed to Checkout →",
      "Login to Proceed →": "Login to Proceed →"
    }
  },
  ml: {
    translation: {
      "Your Cart": "നിങ്ങളുടെ കാർട്ട്",
      "Delivery in 20 minutes": "20 മിനിറ്റിൽ ഡെലിവറി",
      "Shipment of {{count}} items": "{{count}} ഇനങ്ങളുടെ ഷിപ്പിംഗ്",
      "Items total": "ഇനങ്ങളുടെ മൊത്തം",
      "Delivery charge": "ഡെലിവറി ചാർജ്",
      "Handling charg": "ഹാൻഡ്ലിംഗ് ചാർജ്ജ്",
      "Grand total": "മൊത്തം",
      "Cancellation Policy": "റദ്ദുചെയ്യൽ നയം",
      "Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.": "ഡെലിവറിയ്ക്കായി പാക്ക് ചെയ്ത ശേഷം ഓർഡറുകൾ റദ്ദാക്കാനാവില്ല. അപരിചിതമായ വൈകല്യങ്ങളുണ്ടെങ്കിൽ, ബാധകമായെങ്കിൽ റീഫണ്ട് നൽകും.",
      "Proceed to Checkout →": "ചെക്കൗട്ട് ചെയ്യുക →",
      "Login to Proceed →": "പ്രവേശിച്ച് തുടരുക →"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
