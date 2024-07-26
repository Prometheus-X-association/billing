// import Auth from '../../services/AuthenticationService';
import billingSubscription from './billing.subscription.routes';
import billingSubscriptionSync from './billing.subscription.sync.routes';

const routers = [
  {
    prefix: '/',
    router: billingSubscription,
  },
  {
    prefix: '/sync/',
    router: billingSubscriptionSync,
  },
];
export default {
  prefix: '/api',
  routers,
  // middleware: Auth.privateRoutes,
};
