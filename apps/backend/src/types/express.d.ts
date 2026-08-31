// Augments Express's Request with the fields our middleware attaches.
// No imports/exports here on purpose — that keeps this an ambient global
// script so the augmentation merges into the real Express namespace.

declare namespace Express {
  interface Request {
    userId: string;
  }
}
