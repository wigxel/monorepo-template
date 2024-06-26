import { Layer } from "effect";
import { AuthCustomerLive } from "~/layers/auth-user";
import { CustomerSessionLive } from "~/layers/session";

export const CustomerLive = AuthCustomerLive.pipe(
  Layer.provideMerge(CustomerSessionLive),
);
