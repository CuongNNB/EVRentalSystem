import { createContext, useContext, useReducer } from 'react';

const CheckoutContext = createContext();

const initialState = {
  // Car booking info
  carInfo: null,
  pickupDate: null,
  dropoffDate: null,
  pickupLocation: null,
  dropoffLocation: null,
  
  // Customer info
  customer: {
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    idType: 'cccd',
    idNumber: '',
    idIssueDate: '',
    idIssuePlace: '',
    licenseType: 'B2',
    licenseExpiry: '',
    documents: {
      cccdFront: null,
      cccdBack: null,
      licenseFront: null,
      licenseBack: null
    }
  },
  
  // Additional drivers
  additionalDrivers: [],
  
  // Add-ons
  addons: [],
  
  // Payment
  paymentMethod: 'vnpay',
  voucher: '',
  
  // Pricing
  pricing: null,
  
  // Terms
  agreedToTerms: false,
  
  // Loading states
  loading: {
    pricing: false,
    payment: false,
    voucher: false
  },
  
  // Errors
  errors: {}
};

const checkoutReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CAR_INFO':
      return { ...state, carInfo: action.payload };
    
    case 'SET_DATES':
      return { 
        ...state, 
        pickupDate: action.payload.pickupDate,
        dropoffDate: action.payload.dropoffDate 
      };
    
    case 'SET_LOCATIONS':
      return { 
        ...state, 
        pickupLocation: action.payload.pickupLocation,
        dropoffLocation: action.payload.dropoffLocation 
      };
    
    case 'UPDATE_CUSTOMER':
      return { 
        ...state, 
        customer: { ...state.customer, ...action.payload } 
      };
    
    case 'UPDATE_CUSTOMER_DOCUMENT':
      return { 
        ...state, 
        customer: { 
          ...state.customer, 
          documents: { 
            ...state.customer.documents, 
            [action.payload.type]: action.payload.file 
          } 
        } 
      };
    
    case 'ADD_ADDITIONAL_DRIVER':
      return { 
        ...state, 
        additionalDrivers: [...state.additionalDrivers, action.payload] 
      };
    
    case 'REMOVE_ADDITIONAL_DRIVER':
      return { 
        ...state, 
        additionalDrivers: state.additionalDrivers.filter((_, index) => index !== action.payload) 
      };
    
    case 'UPDATE_ADDITIONAL_DRIVER':
      return { 
        ...state, 
        additionalDrivers: state.additionalDrivers.map((driver, index) => 
          index === action.payload.index ? { ...driver, ...action.payload.data } : driver
        ) 
      };
    
    case 'TOGGLE_ADDON':
      const addon = action.payload;
      const existingIndex = state.addons.findIndex(item => item.id === addon.id);
      
      if (existingIndex >= 0) {
        return {
          ...state,
          addons: state.addons.filter((_, index) => index !== existingIndex)
        };
      } else {
        return {
          ...state,
          addons: [...state.addons, { ...addon, quantity: 1 }]
        };
      }
    
    case 'UPDATE_ADDON_QUANTITY':
      return {
        ...state,
        addons: state.addons.map(addon => 
          addon.id === action.payload.id 
            ? { ...addon, quantity: action.payload.quantity }
            : addon
        )
      };
    
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    
    case 'SET_VOUCHER':
      return { ...state, voucher: action.payload };
    
    case 'SET_PRICING':
      return { ...state, pricing: action.payload };
    
    case 'SET_TERMS_AGREEMENT':
      return { ...state, agreedToTerms: action.payload };
    
    case 'SET_LOADING':
      return { 
        ...state, 
        loading: { ...state.loading, ...action.payload } 
      };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        errors: { ...state.errors, [action.payload.field]: action.payload.message } 
      };
    
    case 'CLEAR_ERROR':
      return { 
        ...state, 
        errors: { ...state.errors, [action.payload]: undefined } 
      };
    
    case 'RESET_CHECKOUT':
      return initialState;
    
    default:
      return state;
  }
};

export const CheckoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const actions = {
    setCarInfo: (carInfo) => dispatch({ type: 'SET_CAR_INFO', payload: carInfo }),
    setDates: (pickupDate, dropoffDate) => dispatch({ 
      type: 'SET_DATES', 
      payload: { pickupDate, dropoffDate } 
    }),
    setLocations: (pickupLocation, dropoffLocation) => dispatch({ 
      type: 'SET_LOCATIONS', 
      payload: { pickupLocation, dropoffLocation } 
    }),
    updateCustomer: (data) => dispatch({ type: 'UPDATE_CUSTOMER', payload: data }),
    updateCustomerDocument: (type, file) => dispatch({ 
      type: 'UPDATE_CUSTOMER_DOCUMENT', 
      payload: { type, file } 
    }),
    addAdditionalDriver: (driver) => dispatch({ type: 'ADD_ADDITIONAL_DRIVER', payload: driver }),
    removeAdditionalDriver: (index) => dispatch({ type: 'REMOVE_ADDITIONAL_DRIVER', payload: index }),
    updateAdditionalDriver: (index, data) => dispatch({ 
      type: 'UPDATE_ADDITIONAL_DRIVER', 
      payload: { index, data } 
    }),
    toggleAddon: (addon) => dispatch({ type: 'TOGGLE_ADDON', payload: addon }),
    updateAddonQuantity: (id, quantity) => dispatch({ 
      type: 'UPDATE_ADDON_QUANTITY', 
      payload: { id, quantity } 
    }),
    setPaymentMethod: (method) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: method }),
    setVoucher: (voucher) => dispatch({ type: 'SET_VOUCHER', payload: voucher }),
    setPricing: (pricing) => dispatch({ type: 'SET_PRICING', payload: pricing }),
    setTermsAgreement: (agreed) => dispatch({ type: 'SET_TERMS_AGREEMENT', payload: agreed }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (field, message) => dispatch({ type: 'SET_ERROR', payload: { field, message } }),
    clearError: (field) => dispatch({ type: 'CLEAR_ERROR', payload: field }),
    resetCheckout: () => dispatch({ type: 'RESET_CHECKOUT' })
  };

  return (
    <CheckoutContext.Provider value={{ state, actions }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};
