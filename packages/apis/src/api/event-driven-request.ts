import type { FetchOptions } from "ofetch";
import { Subject, Subscription } from "rxjs";

const _id = Symbol.for("__id");

interface FetchEvent extends FetchOptions<"json"> {
  url: string;
}

const RequestSubject = new Subject<{ [_id]: symbol } & FetchEvent>();
const ResponseSubject = new Subject<
  | { [_id]: symbol; type: "success"; value: unknown }
  | { [_id]: symbol; type: "error"; reason: unknown }
>();

const requestHandler = {
  instances: new Set<Subscription>(),
  reset() {
    for (const instance of this.instances) {
      instance.unsubscribe();
    }
    this.instances.clear();
  },
};

/** makes a fetch request that's emitted via as an Observable **/
export function makeFetch(fetchConfig: FetchEvent) {
  return new Promise((resolve, reject) => {
    const fetch_id = Symbol("fetch_id");

    // subscriber
    const sub = ResponseSubject.subscribe({
      next: (event) => {
        if (event[_id] !== fetch_id) return;
        if (event.type === "success") resolve(event.value);
        if (event.type === "error") reject(event.reason);
        sub.unsubscribe();
      },
    });

    // publisher
    RequestSubject.next({ [_id]: fetch_id, ...fetchConfig });
  });
}

export function defineRequestHandler(
  requestHandlerFn: (fetchOption: FetchEvent) => Promise<unknown>,
) {
  if (requestHandler.instances.size === 2) {
    console.warn(
      "[defineRequestHandler] More than instance found. Only an instance is required per runtime",
    );
  }

  // should only have one active instance
  if (requestHandler.instances.size > 0) {
    requestHandler.reset();
  }

  const instance = RequestSubject.subscribe({
    next(fetchConfig) {
      requestHandlerFn(fetchConfig)
        .then((resp) => {
          ResponseSubject.next({
            [_id]: fetchConfig[_id],
            type: "success",
            value: resp,
          });
        })
        .catch((err) => {
          ResponseSubject.next({
            [_id]: fetchConfig[_id],
            type: "error",
            reason: err,
          });
        });
    },
  });

  // a new instance
  requestHandler.instances.add(instance);
}
