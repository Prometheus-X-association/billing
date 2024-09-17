// import Auth from '../../services/AuthenticationService';
import billingSubscription from './billing.subscription.routes';
import billingSubscriptionSync from './billing.subscription.sync.routes';
import stripeCrudSubscription from './stripe.subscription.crud.routes';
import stripeSyncSubscription from './stripe.subscription.sync.routes';

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
];
export default {
  prefix: '/api',
  routers,
  // middleware: Auth.privateRoutes,
};
