// import Auth from '../../services/AuthenticationService';
import billingSubscription from './billing.subscription.routes';
import billingSubscriptionSync from './billing.subscription.sync.routes';
import stripeCrudSubscription from './stripe.subscription.crud.routes';
import stripeCrudCustomer from './stripe.customer.crud.routes';
import stripeCrudProduct from './stripe.product.crud.routes';
import stripeCrudPrice from './stripe.price.crud.routes';
import stripeSyncSubscription from './stripe.subscription.sync.routes';
import stripeCrudAccount from './stripe.connected.account.crud.routes';
import stripeCrudPaymentIntent from './stripe.payment.intent.crud.routes';
import stripeCrudPaymentMethod from './stripe.payment.method.crud.routes';
import stripeCrudPersonMethod from './stripe.person.crud.routes';
import stripeCrudSetupMethod from './stripe.setup.intent.crud.routes';
const routers = [
  {
    prefix: '/',
    router: billingSubscription,
  },
  {
    prefix: '/sync/',
    router: billingSubscriptionSync,
  },
  {
    prefix: '/stripe/',
    router: stripeSyncSubscription,
  },
  {
    prefix: '/stripe/',
    router: stripeCrudSubscription,
  },
  {
    prefix: '/stripe/',
    router: stripeCrudCustomer,
  },
  {
    prefix: '/stripe/',
    router: stripeCrudPrice,
  },
  {
    prefix: '/stripe/',
    router: stripeCrudProduct,
  },
  {
    prefix: '/stripe/',
    router: stripeCrudAccount,
  },
  {
    prefix: '/stripe/',
    router: stripeCrudPaymentIntent,
  },
  {
    prefix: '/stripe/',
    router: stripeCrudPaymentMethod,
  },
  {
    prefix: '/stripe/',
    router: stripeCrudPersonMethod,
  },
  {
    prefix: '/stripe/',
    router: stripeCrudSetupMethod,
  },
];
export default {
  prefix: '/api',
  routers,
  // middleware: Auth.privateRoutes,
};
