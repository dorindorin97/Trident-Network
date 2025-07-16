import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Latest Block": "Latest Block",
      "Block History": "Block History",
      "Block": "Block",
      "Number": "Number",
      "Hash": "Hash",
      "Validator": "Validator",
      "Timestamp": "Timestamp",
      "Validators": "Validators",
      "Validator List": "Validator List",
      "Account Lookup": "Account Lookup",
      "Previous": "Previous",
      "Next": "Next",
      "Service unavailable": "Service unavailable",
      "Address": "Address",
      "Lookup": "Lookup",
      "Balance": "Balance",
      "Transactions": "Transactions",
      "TxID": "TxID",
      "From": "From",
      "To": "To",
      "Amount": "Amount",
      "Wallet Login": "Wallet Login",
      "Private Key": "Private Key",
      "Login": "Login",
      "Wallet": "Wallet",
      "Logout": "Logout",
      "Admin Panel": "Admin Panel",
      "Environment": "Environment",
      "Status": "Status",
      "Wallet Page": "Wallet",
      "Loading": "Loading...",
      "Dark Mode": "Dark Mode",
      "Light Mode": "Light Mode",
      "Search": "Search",
      "Search Placeholder": "Search by block # / tx hash / address",
      "Transaction Details": "Transaction Details",
      "Account": "Account",
      "Page": "Page",
      "of": "of"
    }
  },
  pt: {
    translation: {
      "Latest Block": "\u00dAltimo Bloco",
      "Block History": "Hist\u00f3rico de Blocos",
      "Block": "Bloco",
      "Number": "N\u00famero",
      "Hash": "Hash",
      "Validator": "Validador",
      "Timestamp": "Data/Hora",
      "Validators": "Validadores",
      "Validator List": "Lista de Validadores",
      "Account Lookup": "Consulta de Conta",
      "Previous": "Anterior",
      "Next": "Pr\u00f3ximo",
      "Service unavailable": "Servi\u00e7o indispon\u00edvel",
      "Address": "Endere\u00e7o",
      "Lookup": "Consultar",
      "Balance": "Saldo",
      "Transactions": "Transa\u00e7\u00f5es",
      "TxID": "ID",
      "From": "De",
      "To": "Para",
      "Amount": "Quantia",
      "Wallet Login": "Login da Carteira",
      "Private Key": "Chave Privada",
      "Login": "Entrar",
      "Wallet": "Carteira",
      "Logout": "Sair",
      "Admin Panel": "Painel de Administra\u00e7\u00e3o",
      "Environment": "Ambiente",
      "Status": "Status",
      "Wallet Page": "Carteira",
      "Loading": "Carregando...",
      "Dark Mode": "Modo Escuro",
      "Light Mode": "Modo Claro",
      "Search": "Buscar",
      "Search Placeholder": "Buscar por bloco / tx / endereço",
      "Transaction Details": "Detalhes da Transação",
      "Account": "Conta",
      "Page": "Página",
      "of": "de"
    }
  }
};

const defaultLanguage = localStorage.getItem('language') || process.env.REACT_APP_DEFAULT_LANGUAGE || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
